// Hàm trợ giúp kiểm tra quyền
async function authorize(realmId: string, userId: string) {
  const realm = await CultivationRealm.findById(realmId);
  if (!realm) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy cảnh giới.' });
  const story = await Story.findOne({ _id: realm.storyId, author: userId });
  if (!story) throw createError({ statusCode: 403, statusMessage: 'Bạn không có quyền thực hiện thao tác này.' });
  return realm;
}

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const realmId = event.context.params?.realmId as string

  switch (event.method) {
    // CẬP NHẬT cảnh giới
    case 'PUT':
      const body = await readBody(event)
      await authorize(realmId, session.user.id) // Luôn kiểm tra quyền trước khi cập nhật
      return await CultivationRealm.findByIdAndUpdate(realmId, body, { new: true })

    // XOÁ cảnh giới
    case 'DELETE':
      await authorize(realmId, session.user.id)
      await CultivationRealm.findByIdAndDelete(realmId)
      return { success: true }

    default:
      throw createError({ statusCode: 405, statusMessage: 'Phương thức không được phép' })
  }
})
