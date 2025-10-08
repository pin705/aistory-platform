const PREDEFINED_GENRES = [
  { name: 'Tiên Hiệp', slug: 'tien-hiep' },
  { name: 'Huyền Huyễn', slug: 'huyen-huyen' },
  { name: 'Đô Thị', slug: 'do-thi' },
  { name: 'Hệ Thống', slug: 'he-thong' },
  { name: 'Khoa Huyễn', slug: 'khoa-huyen' },
  { name: 'Võng Du', slug: 'vong-du' },
  { name: 'Lịch Sử', slug: 'lich-su' },
  { name: 'Trọng Sinh', slug: 'trong-sinh' },
]

export default defineNitroPlugin(async () => {
  try {
    const count = await Genre.countDocuments()
    if (count === 0) {
      console.log('🌱 Seeding genres...')
      await Genre.insertMany(PREDEFINED_GENRES)
      console.log('✅ Genres seeded successfully.')
    }
  } catch (error) {
    console.error('Error seeding genres:', error)
  }
})
