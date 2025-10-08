import { defineMongooseModel } from '#nuxt/mongoose'

export const Chapter = defineMongooseModel('Chapter', {
  storyId: { type: 'ObjectId', ref: 'Story', required: true, index: true },
  chapterNumber: { type: Number, required: true },
  title: { type: String, required: true, default: 'Chương mới' },
  content: { type: String, default: '' }, // Nội dung HTML từ TipTap
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
}, {
  timestamps: true
})
