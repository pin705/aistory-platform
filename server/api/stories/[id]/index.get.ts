export default defineEventHandler(async (event) => {
  // Yêu cầu đăng nhập
  const session = await requireUserSession(event)

  // Lấy storyId từ URL, ví dụ: /api/stories/abc-123
  const storyId = event.context.params?.id

  if (!storyId) {
    throw createError({ statusCode: 400, statusMessage: 'Thiếu ID của truyện' })
  }

  // Tìm truyện trong DB
  // QUAN TRỌNG: Thêm điều kiện `author: session.user.id` để đảm bảo
  // người dùng chỉ có thể lấy dữ liệu truyện của chính họ.
  const story = await Story.findOne({ _id: storyId, author: session.user.id })

  if (!story) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy truyện hoặc bạn không có quyền truy cập.' })
  }

  return story
})
