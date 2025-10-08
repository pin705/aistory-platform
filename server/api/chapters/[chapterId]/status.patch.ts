export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const chapterId = event.context.params?.chapterId as string
  const { status } = await readBody(event)

  // Validation
  if (!['draft', 'published'].includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Trạng thái không hợp lệ.' })
  }

  const chapter = await Chapter.findById(chapterId)
  if (!chapter) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy chương.' })
  }

  // Kiểm tra quyền sở hữu thông qua truyện cha
  const story = await Story.findOne({ _id: chapter.storyId, author: session.user.id })
  if (!story) {
    throw createError({ statusCode: 403, statusMessage: 'Bạn không có quyền sửa chương này.' })
  }

  // Cập nhật trạng thái và thời gian
  chapter.status = status
  await chapter.save()

  return { message: 'Cập nhật trạng thái chương thành công!' }
})
