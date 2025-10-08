export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const characterId = event.context.params?.characterId as string
  const updateData = await readBody(event)

  const character = await Character.findById(characterId)
  if (!character) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy nhân vật.' })
  }

  // Kiểm tra quyền sở hữu thông qua truyện
  const story = await Story.findOne({ _id: character.storyId, author: session.user.id })
  if (!story) {
    throw createError({ statusCode: 403, statusMessage: 'Bạn không có quyền sửa nhân vật này.' })
  }

  // Cập nhật nhân vật
  Object.assign(character, updateData)
  await character.save()

  return character
})
