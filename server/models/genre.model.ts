import { defineMongooseModel } from '#nuxt/mongoose'

export const Genre = defineMongooseModel('Genre', {
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true }, // Dùng cho URL, vd: /genres/tu-tien
  icon: { type: String, default: 'i-lucide-feather' }, // Icon mặc định
  description: { type: String, default: '' }
})
