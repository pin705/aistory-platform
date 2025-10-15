export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const storyId = event.context.params?.id as string

  // 1. Tìm truyện và xác thực quyền sở hữu
  const storyToDelete = await Story.findOne({ _id: storyId, author: session.user.id })

  if (!storyToDelete) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Không tìm thấy truyện hoặc bạn không có quyền xóa.'
    })
  }

  // 2. (QUAN TRỌNG) Xóa hàng loạt tất cả dữ liệu liên quan (Cascading Delete)
  await Chapter.deleteMany({ storyId: storyId })
  await Character.deleteMany({ storyId: storyId })
  await Chunk.deleteMany({ storyId: storyId })
  await Faction.deleteMany({ storyId: storyId })
  await Location.deleteMany({ storyId: storyId })
  await CultivationRealm.deleteMany({ storyId: storyId })
  await Location.deleteMany({ storyId: storyId })
  // 3. Xóa truyện gốc
  await Story.findByIdAndDelete(storyId)

  return { message: 'Đã xóa truyện và tất cả dữ liệu liên quan thành công.' }
})
