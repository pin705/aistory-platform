export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const storyId = event.context.params?.id as string

  // Kiểm tra quyền sở hữu truyện
  const story = await Story.findOne({ _id: storyId, author: session.user.id })
  if (!story) {
    throw createError({ statusCode: 403, statusMessage: 'Bạn không có quyền truy cập.' })
  }

  switch (event.method) {
    // LẤY danh sách cảnh giới
    case 'GET':
      return await CultivationRealm.find({ storyId }).sort({ level: 1 }) // Sắp xếp theo cấp độ

    // TẠO cảnh giới mới
    case 'POST':
      const body = await readBody(event)
      if (!body.name || !body.level) {
        throw createError({ statusCode: 400, statusMessage: 'Tên và Cấp độ là bắt buộc.' })
      }
      return await CultivationRealm.create({ ...body, storyId })

    default:
      throw createError({ statusCode: 405, statusMessage: 'Phương thức không được phép' })
  }
})
