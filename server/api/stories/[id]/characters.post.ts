export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const storyId = event.context.params?.id as string
  const { name, description, role, backstory, abilities } = await readBody(event)

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Tên nhân vật là bắt buộc.' })
  }

  // Kiểm tra quyền sở hữu truyện
  const story = await Story.findOne({ _id: storyId, author: session.user.id })
  if (!story) {
    throw createError({ statusCode: 403, statusMessage: 'Bạn không có quyền thêm nhân vật vào truyện này.' })
  }

  const newCharacter = await Character.create({ storyId, name, description, role, backstory, abilities })
  return newCharacter
})
