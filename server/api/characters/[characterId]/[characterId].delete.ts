export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const characterId = event.context.params?.characterId as string

  const character = await Character.findById(characterId)
  if (!character) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy nhân vật.' })
  }

  // Kiểm tra quyền sở hữu
  const story = await Story.findOne({ _id: character.storyId, author: session.user.id })
  if (!story) {
    throw createError({ statusCode: 403, statusMessage: 'Bạn không có quyền xóa nhân vật này.' })
  }

  await Character.findByIdAndDelete(characterId)

  return { success: true }
})
