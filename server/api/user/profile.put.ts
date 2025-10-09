export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const { username, bio, avatar } = await readBody(event)

  const updateData: any = {}
  if (username) updateData.username = username
  if (bio) updateData.bio = bio
  if (avatar) updateData.avatar = avatar

  await User.findByIdAndUpdate(session.user.id, { $set: updateData })

  return { message: 'Cập nhật hồ sơ thành công' }
})
