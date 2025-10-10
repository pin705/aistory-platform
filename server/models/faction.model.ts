import { defineMongooseModel } from '#nuxt/mongoose'

export const Faction = defineMongooseModel('Faction', {
  storyId: { type: 'ObjectId', ref: 'Story', required: true, index: true },
  name: { type: String, required: true }, // Tên thế lực
  ideology: { type: String, default: '' }, // Tôn chỉ, mục đích
  description: { type: String, default: '' },
  relationships: { type: String, default: '' }, // Quan hệ với các thế lực khác
})
