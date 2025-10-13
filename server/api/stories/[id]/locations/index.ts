export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const storyId = event.context.params?.id as string

  // Kiểm tra quyền sở hữu truyện
  const story = await Story.findOne({ _id: storyId, author: session.user.id })
  if (!story) {
    throw createError({ statusCode: 403, statusMessage: 'Bạn không có quyền truy cập.' })
  }

  switch (event.method) {
    // LẤY danh sách địa danh
    case 'GET':
      return await Location.find({ storyId }).sort({ name: 1 })

    // TẠO địa danh mới
    case 'POST':
      const body = await readBody(event)
      if (!body.name) {
        throw createError({ statusCode: 400, statusMessage: 'Tên địa danh là bắt buộc.' })
      }
      return await Location.create({ ...body, storyId })

    default:
      throw createError({ statusCode: 405, statusMessage: 'Phương thức không được phép' })
  }
})
