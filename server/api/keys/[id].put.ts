export default defineEventHandler(async (event) => {
  // 1. (TỐI ƯU) Chỉ cần gọi `requireUserSession` một lần để xác thực và lấy session.
  const session = await requireUserSession(event)

  const keyId = event.context.params?.id as string
  const { apiKey, apiModel, isActive } = await readBody(event)

  // 2. (SỬA LỖI) Xây dựng một đối tượng update linh hoạt.
  //    Chỉ cập nhật những trường được gửi lên.
  const updateData: any = {}

  // Chỉ cập nhật và mã hóa key nếu người dùng cung cấp một key mới.
  if (apiKey && typeof apiKey === 'string' && apiKey.length > 0) {
    updateData.encryptedKey = CryptoJS.AES.encrypt(apiKey, process.env.CRYPTO_SECRET!).toString()
  }

  if (apiModel) {
    updateData.apiModel = apiModel
  }

  // Xử lý cập nhật trạng thái `isActive` (có thể là true hoặc false).
  if (typeof isActive === 'boolean') {
    updateData.isActive = isActive
  }

  // Nếu không có dữ liệu nào cần cập nhật, báo lỗi.
  if (Object.keys(updateData).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Không có thông tin nào để cập nhật.'
    })
  }

  // 3. Tìm và cập nhật key trong database.
  //    Điều kiện tìm kiếm `userId` đảm bảo người dùng chỉ sửa được key của chính họ.
  const updatedKey = await ApiKey.findOneAndUpdate(
    { _id: keyId, userId: session.user.id },
    { $set: updateData },
    { new: true } // Trả về document đã được cập nhật
  )

  if (!updatedKey) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy Key hoặc không có quyền sửa' })
  }

  return { success: true, message: 'Cập nhật key thành công' }
})
