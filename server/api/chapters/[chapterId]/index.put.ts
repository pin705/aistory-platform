export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const chapterId = event.context.params?.chapterId as string
  const { title, content, status } = await readBody(event)

  const chapter = await Chapter.findById(chapterId)
  if (!chapter) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy chương' })
  }

  // Kiểm tra quyền sở hữu
  const story = await Story.findOne({ _id: chapter.storyId, author: session.user.id })
  if (!story) {
    throw createError({ statusCode: 403, statusMessage: 'Bạn không có quyền sửa chương này.' })
  }

  // Cập nhật dữ liệu
  chapter.title = title || chapter.title
  chapter.content = content || chapter.content
  chapter.updatedAt = new Date()
  chapter.status = status || chapter.status

  await chapter.save()

  return { message: 'Cập nhật chương thành công!' }
})
