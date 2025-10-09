import { z } from 'zod'

// Validate form
const bodySchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6)
})

export default defineEventHandler(async (event) => {
  // const body = await readBody(event);
  const body = await readValidatedBody(event, bodySchema.parse)
  const { email, password } = body
  const userSlug = slugify(body.username)

  // 3. Check nếu email đã tồn tại
  const existingUser = await User.findOne({ email, slug: userSlug })
  if (existingUser) {
    throw createError({ statusCode: 400, message: '📧 Email hoặc tên đăng nhập đã tồn tại.' })
  }

  // 5. Hash và lưu thông tin
  const hashedPassword = await hashPassword(password)
  const user = new User({
    username: body.username,
    email: email.trim(),
    password: hashedPassword,
    slug: userSlug
  })

  await user.save()

  // 7. Set session
  await setUserSession(event, {
    user: {
      email
    },
    loggedInAt: Date.now()
  })

  return true
})
