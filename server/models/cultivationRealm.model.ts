import { defineMongooseModel } from '#nuxt/mongoose'

export const CultivationRealm = defineMongooseModel('CultivationRealm', {
  storyId: { type: 'ObjectId', ref: 'Story', required: true, index: true },
  name: { type: String, required: true }, // Tên cảnh giới: Luyện Khí, Kim Đan...
  level: { type: Number, required: true }, // Số thứ tự để sắp xếp
  description: { type: String, default: '' }, // Mô tả đặc điểm của cảnh giới
  breakthroughConditions: { type: String, default: '' }, // Điều kiện đột phá
})
