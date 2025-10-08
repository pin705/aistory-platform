import { defineMongooseModel } from '#nuxt/mongoose'

export const Chunk = defineMongooseModel('Chunk', {
  storyId: { type: 'ObjectId', ref: 'Story', required: true, index: true },
  chapterId: { type: 'ObjectId', ref: 'Chapter', required: true },
  chunkText: { type: String, required: true },
  contentEmbedding: { type: [Number], required: true },
})
