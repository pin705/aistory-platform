export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const { username, bio, avatar } = await readBody(event)

  const userSlug = slugify(username)

  // 3. Check nếu tên đăng nhập đã tồn tại
  const existingUser = await User.findOne({ slug: userSlug })
  if (existingUser) {
    throw createError({ statusCode: 400, message: 'Tên đăng nhập đã tồn tại.' })
  }

  const updateData = {}
  if (username) {
    updateData.username = username
    updateData.slug = userSlug
  }
  if (bio) updateData.bio = bio
  if (avatar) updateData.avatar = avatar

  await User.findByIdAndUpdate(session.user.id, { $set: updateData })

  return { message: 'Cập nhật hồ sơ thành công' }
})
