export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const { username, bio, avatar } = await readBody(event)

  // 1. Lấy thông tin người dùng hiện tại từ DB để so sánh
  const currentUser = await User.findById(session.user.id)
  if (!currentUser) {
    throw createError({ statusCode: 404, message: 'Không tìm thấy người dùng.' })
  }

  const updateData: Record<string, any> = {}

  // 2. Chỉ xử lý username nếu nó được cung cấp và thực sự thay đổi
  if (username && username !== currentUser.username) {
    // Tạo slug cơ bản
    let userSlug = slugify(username, { lower: true, strict: true })

    // 3. Kiểm tra xem slug mới đã tồn tại ở người dùng khác chưa
    const existingUser = await User.findOne({ slug: userSlug })

    // Nếu slug đã tồn tại và đó không phải là chính người dùng này
    if (existingUser) {
      // Tạo một hậu tố ngẫu nhiên để đảm bảo slug là duy nhất
      const uniqueSuffix = Math.random().toString(36).substring(2, 8) // vd: a9wz7k
      userSlug = `${userSlug}-${uniqueSuffix}`
    }

    // Thêm username và slug mới vào dữ liệu cần cập nhật
    updateData.username = username
    updateData.slug = userSlug
  }

  // 4. Xử lý các trường thông tin còn lại
  if (bio !== undefined && bio !== currentUser.bio) {
    updateData.bio = bio
  }
  if (avatar && avatar !== currentUser.avatar) {
    updateData.avatar = avatar
  }

  // 5. Chỉ cập nhật nếu có dữ liệu thay đổi
  if (Object.keys(updateData).length > 0) {
    await User.findByIdAndUpdate(session.user.id, { $set: updateData })
  } else {
    // Nếu không có gì thay đổi, có thể trả về thông báo tương ứng
    return { message: 'Không có thông tin nào được thay đổi.' }
  }


  return { message: 'Cập nhật hồ sơ thành công.' }
})
