import { defineMongooseModel } from '#nuxt/mongoose'

export const Story = defineMongooseModel('Story', {
  title: { type: String, required: true, index: true },
  author: { type: 'ObjectId', ref: 'User', required: true, index: true },
  description: { type: String, required: true },
  coverImage: { type: String, default: '' },
  summary: { type: String, default: '' },
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
  modelUsed: { type: String },
  settings: {
    writingStructure: { type: String, default: 'structured' },
    chapterCount: { type: Number, default: 50 },
    memoryDepth: { type: Number, default: 5 },
    wordsPerChapter: { type: Number, default: 300 },
    writingStyle: { type: String, default: 'Câu chuyện hấp dẫn, lôi cuốn' },
    tone: { type: String, default: 'Hài hước, nhẹ nhàng' },
    languageComplexity: { type: String, default: 'Trung bình' },
    targetAgeGroup: { type: String, default: 'Thanh thiếu niên và người lớn' },
    emotionalElements: [{ type: String }],
    humorElements: [{ type: String }]
  }
}, { timestamps: true })
