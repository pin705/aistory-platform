export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const storyId = event.context.params?.id as string

  // Kiểm tra xem user có sở hữu truyện này không
  const story = await Story.findOne({ _id: storyId, author: session.user.id })
  if (!story) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy truyện' })
  }

  // Lấy các chương, chỉ lấy các trường cần thiết cho danh sách
  const chapters = await Chapter.find({ storyId })
    .sort({ chapterNumber: 1 })
    .select('chapterNumber title status updatedAt')

  return chapters
})
