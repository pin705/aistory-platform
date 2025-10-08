export default defineEventHandler(async (event) => {
  const storyId = event.context.params?.id as string
  const reviews = await Review.find({ storyId })
    .sort({ createdAt: -1 })
    .populate('userId', 'username avatar'); // Lấy kèm thông tin người bình luận
  return reviews
})
