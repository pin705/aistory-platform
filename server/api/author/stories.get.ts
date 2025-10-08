export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const session = await getUserSession(event)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  // Nếu không có session (chưa đăng nhập), trả về lỗi
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const authorStories = await Story.find({ author: session.user.id })
  return authorStories
})
