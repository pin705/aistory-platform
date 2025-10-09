
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)

  const user = await User.findById(session.user.id).select('username email avatar bio')
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy người dùng' })
  }
  return user
})
