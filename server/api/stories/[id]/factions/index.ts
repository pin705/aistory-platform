export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const storyId = event.context.params?.id as string

  // Kiểm tra quyền sở hữu truyện
  const story = await Story.findOne({ _id: storyId, author: session.user.id })
  if (!story) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  switch (event.method) {
    // LẤY danh sách thế lực
    case 'GET':
      return await Faction.find({ storyId }).sort({ name: 1 })

    // TẠO thế lực mới
    case 'POST':
      const body = await readBody(event)
      if (!body.name) {
        throw createError({ statusCode: 400, statusMessage: 'Tên thế lực là bắt buộc.' })
      }
      return await Faction.create({ ...body, storyId })

    default:
      throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
  }
})
