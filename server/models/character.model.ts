import { defineMongooseModel } from '#nuxt/mongoose'

export const Character = defineMongooseModel('Character', {
  storyId: { type: 'ObjectId', ref: 'Story', required: true, index: true },
  name: { type: String, required: true },
  avatar: { type: String, default: '' }, // Link ảnh đại diện
  role: { type: String, enum: ['Nhân vật chính', 'Nhân vật phụ', 'Phản diện', 'Quần chúng'], default: 'Nhân vật phụ' },
  description: { type: String, default: '' }, // Mô tả ngoại hình, tính cách...
  backstory: { type: String, default: '' }, // Tiểu sử, quá khứ
  abilities: { type: [String], default: [] }
  // Thêm các trường khác nếu cần
})
