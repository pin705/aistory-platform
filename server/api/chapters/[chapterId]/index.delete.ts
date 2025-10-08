export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const chapterId = event.context.params?.chapterId as string

  const chapter = await Chapter.findById(chapterId)
  if (!chapter) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy chương' })
  }

  // Kiểm tra quyền sở hữu
  const story = await Story.findOne({ _id: chapter.storyId, author: session.user.id })
  if (!story) {
    throw createError({ statusCode: 403, statusMessage: 'Bạn không có quyền xóa chương này.' })
  }

  // Thực hiện xóa
  await Chapter.findByIdAndDelete(chapterId)

  // Cân nhắc: Sau khi xóa, bạn có thể muốn cập nhật lại `chapterNumber`
  // của các chương sau đó, nhưng đây là một logic phức tạp.
  // Tạm thời chỉ xóa.

  return { message: 'Xóa chương thành công!' }
})
