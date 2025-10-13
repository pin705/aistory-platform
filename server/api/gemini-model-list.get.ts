export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  // Lấy danh sách mô hình từ Gemini API
  const response = await $fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_SERVER_API_KEY}`)

  // Trả về danh sách mô hình
  return response.models || []
})
