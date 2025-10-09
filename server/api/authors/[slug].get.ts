export default defineEventHandler(async (event) => {
  const slug = event.context.params?.slug as string
  const session = await getUserSession(event) // Lấy session (nếu có) để kiểm tra đã follow chưa

  // 1. Lấy thông tin tác giả
  const author = await User.findOne({ slug }).select('username avatar bio createdAt followers')
  if (!author) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy tác giả' })
  }

  // 2. Lấy tất cả truyện đã xuất bản của tác giả
  const stories = await Story.find({ author: author._id, status: { $in: ['published', 'finished'] } })
    .sort({ updatedAt: -1 })

  // 3. Lấy 5 hoạt động mới nhất (chương mới + review mới)
  const storyIds = stories.map(s => s._id)
  const latestChapters = await Chapter.find({ storyId: { $in: storyIds }, status: 'published' })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate({ path: 'storyId', select: 'title' })

  const latestReviews = await Review.find({ storyId: { $in: storyIds } })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate({ path: 'storyId', select: 'title' })
    .populate({ path: 'userId', select: 'username' })

  // 4. Tính toán các chỉ số
  const followerCount = author.followers?.length || 0
  const totalViews = stories.reduce((sum, story) => sum + (story.views || 0), 0)
  const isFollowing = session?.user ? author.followers.includes(session.user.id) : false

  return {
    author,
    stats: {
      followerCount,
      totalViews,
      storyCount: stories.length
    },
    isFollowing,
    stories,
    latestChapters,
    latestReviews
  }
})
