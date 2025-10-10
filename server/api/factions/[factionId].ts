// Hàm trợ giúp kiểm tra quyền
async function authorize(factionId: string, userId: string) {
  const faction = await Faction.findById(factionId);
  if (!faction) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy' });
  const story = await Story.findOne({ _id: faction.storyId, author: userId });
  if (!story) throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
  return faction;
}

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const factionId = event.context.params?.factionId as string

  switch (event.method) {
    // CẬP NHẬT thế lực
    case 'PUT':
      const body = await readBody(event)
      return await Faction.findByIdAndUpdate(factionId, body, { new: true })

    // XOÁ thế lực
    case 'DELETE':
      await authorize(factionId, session.user.id) // Cần kiểm tra quyền trước khi xóa
      await Faction.findByIdAndDelete(factionId)
      return { success: true }

    default:
      throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
  }
})
