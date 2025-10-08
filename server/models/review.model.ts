import { defineMongooseModel } from '#nuxt/mongoose'

export const Review = defineMongooseModel('Review', {
  storyId: { type: 'ObjectId', ref: 'Story', required: true, index: true },
  userId: { type: 'ObjectId', ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true, trim: true },
}, { timestamps: true })
