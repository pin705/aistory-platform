// file: server/models/user.model.ts
import { defineMongooseModel } from '#nuxt/mongoose'

export const User = defineMongooseModel('User', {
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Luôn nhớ hash mật khẩu này!
}, {
  timestamps: true
})
