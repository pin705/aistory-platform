export default defineEventHandler(async (event) => {
    await requireUserSession(event)
  const session = await getUserSession(event)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const keys = await ApiKey.find({ userId: session.user.id })// Tạm thời trả về key để test
  // Trong thực tế, chỉ trả về một phần của key
  // const keys = (await ApiKey.find({ userId: session.user.id })).map(k => ({...k.toObject(), encryptedKey: k.encryptedKey.substring(0,4) + "..."}))

  return keys
})
