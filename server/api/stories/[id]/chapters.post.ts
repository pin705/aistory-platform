export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const storyId = event.context.params?.id as string
  const body = await readBody(event)

  // 1. Kiểm tra quyền sở hữu truyện
  const story = await Story.findOne({ _id: storyId, author: session.user.id })
  if (!story) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy truyện hoặc bạn không có quyền.' })
  }

  // 2. Tự động xác định số thứ tự chương mới
  const lastChapter = await Chapter.findOne({ storyId }).sort({ chapterNumber: -1 })
  const newChapterNumber = lastChapter ? lastChapter.chapterNumber + 1 : 1

  // 3. Tạo chương mới
  const newChapter = await Chapter.create({
    storyId,
    chapterNumber: newChapterNumber,
    title: body.title || `Chương ${newChapterNumber}`, // Lấy title từ body hoặc tạo mặc định
    content: body.content || '',
  })

  // 4. Trả về chương vừa tạo (quan trọng để frontend chuyển hướng)
  return newChapter
})
