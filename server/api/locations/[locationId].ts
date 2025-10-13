// Hàm trợ giúp kiểm tra quyền
async function authorize(locationId: string, userId: string) {
  const location = await Location.findById(locationId);
  if (!location) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy địa danh.' });
  const story = await Story.findOne({ _id: location.storyId, author: userId });
  if (!story) throw createError({ statusCode: 403, statusMessage: 'Bạn không có quyền thực hiện thao tác này.' });
  return location;
}

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const locationId = event.context.params?.locationId as string

  switch (event.method) {
    // CẬP NHẬT địa danh
    case 'PUT':
      const body = await readBody(event)
      await authorize(locationId, session.user.id)
      return await Location.findByIdAndUpdate(locationId, body, { new: true })

    // XOÁ địa danh
    case 'DELETE':
      await authorize(locationId, session.user.id)
      await Location.findByIdAndDelete(locationId)
      return { success: true }

    default:
      throw createError({ statusCode: 405, statusMessage: 'Phương thức không được phép' })
  }
})
