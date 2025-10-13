export default defineEventHandler(async (event) => {
  // Xác thực người dùng, nếu chưa đăng nhập sẽ tự động báo lỗi
  const session = await requireUserSession(event)

  // Lấy dữ liệu từ body
  const { title, description, genres, tags, prompt, coverImage } = await readBody(event)

  // Validation cơ bản
  if (!title || title.length < 5) {
    throw createError({ statusCode: 400, statusMessage: 'Tiêu đề phải có ít nhất 5 ký tự.' })
  }
  if (!description || description.length < 20) {
    throw createError({ statusCode: 400, statusMessage: 'Mô tả phải có ít nhất 20 ký tự.' })
  }

  const newStory = await Story.create({
    title,
    description,
    genres: genres || [],
    tags: tags || [],
    author: session.user.id, // Gán tác giả là người dùng đang đăng nhập
    status: 'draft', // Mặc định là bản nháp
    prompt,
    coverImage: coverImage || '' // Mặc định chưa có ảnh bìa
  })

  // Trả về truyện vừa tạo để frontend có thể lấy ID và chuyển hướng
  return newStory
})
