import { defineMongooseModel } from '#nuxt/mongoose'

export const Story = defineMongooseModel('Story', {
  title: { type: String, required: true, index: true },
  author: { type: 'ObjectId', ref: 'User', required: true, index: true },
  description: { type: String, required: true },
  coverImage: { type: String, default: '' },
  status: {
    type: String,
    enum: ['draft', 'published', 'on-hold', 'finished'],
    default: 'draft'
  },
  genres: [{ type: String }], // Lưu tên thể loại trực tiếp
  prompt: { type: String, required: true }, // Lưu prompt AI
  tags: [{ type: String, index: true }],
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
}, { timestamps: true })
