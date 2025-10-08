export default defineEventHandler(async (event) => {
   await requireUserSession(event)
  const session = await getUserSession(event)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  // Lấy ID của key từ URL, ví dụ: /api/keys/12345
  const keyId = event.context.params?.id

  // Lấy API key mới từ body của request
  const { apiKey: newApiKey } = await readBody(event)

  if (!newApiKey) {
    throw createError({ statusCode: 400, statusMessage: 'Thiếu API key mới' })
  }

  // TODO: Mã hóa newApiKey trước khi lưu
  // const encryptedKey = CryptoJS.AES.encrypt(newApiKey, process.env.CRYPTO_SECRET).toString();

  // Tìm và cập nhật key trong database
  // Điều kiện tìm kiếm `{ _id: keyId, userId: session.user.id }` cực kỳ quan trọng
  // để đảm bảo người dùng chỉ có thể sửa key của chính họ.
  const updatedKey = await ApiKey.findOneAndUpdate(
    { _id: keyId, userId: session.user.id },
    { $set: { encryptedKey: newApiKey } }, // << TẠM THỜI: thay bằng encryptedKey
    { new: true } // Trả về document đã được cập nhật
  )

  if (!updatedKey) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy Key hoặc không có quyền sửa' })
  }

  return { success: true, message: 'Cập nhật key thành công' }
})
