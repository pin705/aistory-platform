export default defineEventHandler(async (event) => {
  const storyId = event.context.params?.id as string

  // Tăng lượt xem cho truyện
  const story = await Story.findOneAndUpdate(
    { _id: storyId, status: 'published' },
    { $inc: { views: 1 } },
    { new: true }
  )
  .populate('author', 'username') // Lấy kèm tên tác giả
  .select('-prompt')

  if (!story) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy truyện' })
  }

  // Lấy danh sách chương của truyện đó
  const chapters = await Chapter.find({ storyId, status: 'published' })
    .sort({ chapterNumber: 1 })
    .select('chapterNumber title')

  return {
    story,
    chapters
  }
})
