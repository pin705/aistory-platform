export default defineEventHandler(async (event) => {
  // Chạy cả hai query cùng lúc bằng Promise.all để tăng hiệu suất
  const [hotStories, newStories] = await Promise.all([
    // Lấy 12 truyện hot nhất
    Story.find({ status: 'published' })
      .sort({ views: -1 })
      .limit(12)
      .select('title coverImage description'),

    // Lấy 12 truyện mới cập nhật nhất
    Story.find({ status: 'published' })
      .sort({ updatedAt: -1 })
      .limit(12)
      .select('title coverImage description')
  ])

  // Trả về một object chứa cả hai danh sách
  return {
    hotStories,
    newStories
  }
})
