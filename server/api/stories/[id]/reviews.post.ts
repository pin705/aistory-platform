export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const storyId = event.context.params?.id as string
  const { rating, comment } = await readBody(event)

  if (!rating || rating < 1 || rating > 5 || !comment) {
    throw createError({ statusCode: 400, statusMessage: 'Vui lòng cung cấp đủ rating và bình luận.' })
  }

  // Cho phép người dùng sửa lại đánh giá của mình
  const existingReview = await Review.findOne({ storyId, userId: session.user.id });
  if (existingReview) {
    existingReview.rating = rating;
    existingReview.comment = comment;
    existingReview.updatedAt = new Date();
    await existingReview.save();
    return existingReview;
  }

  // Hoặc tạo đánh giá mới
  const newReview = await Review.create({
    storyId,
    userId: session.user.id,
    rating,
    comment,
  })
  return newReview
})
