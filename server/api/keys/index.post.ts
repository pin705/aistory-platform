import CryptoJS from 'crypto-js'

export default defineEventHandler(async (event) => {
   await requireUserSession(event)
  const session = await getUserSession(event)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const { provider, apiKey, apiModel } = await readBody(event)
  if (!provider || !apiKey) throw createError({ statusCode: 400, statusMessage: 'Thiếu thông tin' })

  // (QUAN TRỌNG) Mã hóa API key trước khi lưu
  const encryptedKey = CryptoJS.AES.encrypt(apiKey, process.env.CRYPTO_SECRET!).toString();

  // Kiểm tra xem người dùng đã có key cho provider này chưa
  const existingKey = await ApiKey.findOne({ userId: session.user.id, provider })
  if (existingKey) {
    // Nếu có rồi thì cập nhật
    existingKey.encryptedKey = encryptedKey
    await existingKey.save()
  } else {
    // Nếu chưa có thì tạo mới
    await ApiKey.create({
      userId: session.user.id,
      provider,
      encryptedKey: encryptedKey,
      apiModel: apiModel || ''
    })
  }

  return { success: true }
})
