export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const storyId = event.context.params?.id
  const body = await readBody(event)

  // Validation
  if (!storyId) {
    throw createError({ statusCode: 400, statusMessage: 'Thiếu ID của truyện' })
  }
  if (!body.title || body.title.length < 5) {
    throw createError({ statusCode: 400, statusMessage: 'Tiêu đề phải có ít nhất 5 ký tự.' })
  }
  if (!body.description || body.description.length < 20) {
    throw createError({ statusCode: 400, statusMessage: 'Mô tả phải có ít nhất 20 ký tự.' })
  }

  // Tìm và cập nhật truyện
  // QUAN TRỌNG: Điều kiện `author: session.user.id` là cực kỳ cần thiết
  // để ngăn người dùng A sửa truyện của người dùng B.
  const updatedStory = await Story.findOneAndUpdate(
    { _id: storyId, author: session.user.id },
    {
      $set: {
        title: body.title,
        description: body.description,
        genres: body.genres,
        tags: body.tags,
        prompt: body.prompt,
        coverImage: body.coverImage || '',
        status: body.status || 'draft',
        settings: body?.settings || {}
      }
    },
    { new: true } // Trả về document sau khi đã cập nhật
  )

  if (!updatedStory) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy truyện hoặc bạn không có quyền sửa.' })
  }

  return { message: 'Cập nhật truyện thành công!' }
})
