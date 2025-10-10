import { defineMongooseModel } from '#nuxt/mongoose'

export const Location = defineMongooseModel('Location', {
  storyId: { type: 'ObjectId', ref: 'Story', required: true, index: true },
  name: { type: String, required: true }, // Tên địa danh
  description: { type: String, default: '' }, // Mô tả cảnh quan, khí hậu
  keyFeatures: { type: String, default: '' }, // Đặc điểm nổi bật
})
