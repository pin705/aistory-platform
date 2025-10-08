import { defineMongooseModel } from '#nuxt/mongoose'

export const Genre = defineMongooseModel('Genre', {
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true }, // Dùng cho URL, vd: /genres/tu-tien
  description: { type: String },
})
