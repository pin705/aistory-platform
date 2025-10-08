export default defineEventHandler(async () => {
  try {
    const genres = await Genre.find().sort({ name: 1 })
    return genres.map(g => g.name) // Chỉ trả về mảng các tên
  } catch (error) {
    console.error(error)
    throw createError({ statusCode: 500, statusMessage: 'Không thể lấy danh sách thể loại' })
  }
})
