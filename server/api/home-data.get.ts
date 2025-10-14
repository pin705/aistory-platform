export default defineEventHandler(async () => {
  // --- Lấy dữ liệu cho Carousel ---
  // Lấy 5 truyện có nhiều lượt xem nhất
  const featuredStories = await Story.find({ status: 'published' })
    .sort({ views: -1 })
    .limit(5)
    .populate('author', 'username')
    .select('title description coverImage author genres')

  // --- Lấy dữ liệu cho Bảng Xếp Hạng Truyện ---
  // Lấy 10 truyện có rating cao nhất
  const storyPowerRankings = await Story.find({ status: 'published', reviewCount: { $gt: 0 } })
    .sort({ averageRating: -1, views: -1 })
    .limit(10)
    .select('title genres author views')
    .populate('author', 'username')

  // --- Lấy dữ liệu cho Bảng Xếp Hạng Tác Giả ---
  // Đây là logic giả lập, bạn cần xây dựng hệ thống điểm/độ nổi tiếng cho tác giả sau này

  // --- Lấy dữ liệu cho các Tab ở cột chính ---
  // Biên tập viên đề cử (giả lập: lấy truyện mới nhất)
  const editorPicks = await Story.find({ status: 'published' })
    .sort({ createdAt: -1 })
    .limit(12)
    .populate('author', 'username')

  // Mới hoàn thành (giả lập)
  const newlyCompleted = await Story.find({ status: 'finished' })
    .sort({ updatedAt: -1 })
    .limit(6)
    .populate('author', 'username')

     const featuredAuthorsData = await User.aggregate([
    // Có thể thêm logic sắp xếp tác giả theo độ nổi tiếng ở đây (ví dụ: số follower)
    { $limit: 5 },
    {
      $lookup: {
        from: 'stories', // Tên collection của Story model
        localField: '_id',
        foreignField: 'author',
        as: 'stories'
      }
    },
    {
      $project: {
        username: 1,
        avatar: 1,
        slug: 1, // Lấy thêm slug để tạo link
        storyCount: { $size: '$stories' } // Đếm số lượng truyện
      }
    }
  ])

  return {
    featuredStories,
    storyPowerRankings,
    featuredAuthors: featuredAuthorsData, // Trả về dữ liệu mới
    editorPicks,
    newlyCompleted,
  }
})
