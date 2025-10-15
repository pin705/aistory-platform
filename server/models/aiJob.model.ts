import { defineMongooseModel } from '#nuxt/mongoose'

export const AiJob = defineMongooseModel('AiJob', {
  userId: { type: 'ObjectId', ref: 'User', required: true, index: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  jobType: { type: String, required: true, enum: ['generate_story_details', 'generate_scene'] },
  prompt: { type: String, required: true },
  context: { type: Object },
  result: { type: Object },
  error: { type: String },
  completedAt: { type: Date }
}, { timestamps: true })
