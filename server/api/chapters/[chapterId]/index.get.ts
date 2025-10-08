export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const chapterId = event.context.params?.chapterId as string

  const chapter = await Chapter.findById(chapterId)
  if (!chapter) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy chương' })
  }

  // Kiểm tra quyền sở hữu thông qua truyện cha
  const story = await Story.findOne({ _id: chapter.storyId, author: session.user.id })
  if (!story) {
    throw createError({ statusCode: 403, statusMessage: 'Bạn không có quyền truy cập chương này.' })
  }

  return chapter
})
