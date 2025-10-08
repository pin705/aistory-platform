import { defineMongooseModel } from '#nuxt/mongoose'

export const ApiKey = defineMongooseModel('ApiKey', {
  userId: { type: 'ObjectId', ref: 'User', required: true, index: true },
  provider: {
    type: String,
    enum: ['gemini', 'openai', 'groq', 'deepstack'], // Các nhà cung cấp được hỗ trợ
    required: true
  },
  encryptedKey: { type: String, required: true }, // API key đã được mã hóa
  isActive: { type: Boolean, default: true }, // Cho phép người dùng bật/tắt key
  createdAt: { type: Date, default: Date.now },
})
