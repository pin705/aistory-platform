export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const authorIdToFollow = event.context.params?.id as string
  const currentUserId = session.user.id

  if (authorIdToFollow === currentUserId) {
    throw createError({ statusCode: 400, statusMessage: 'Bạn không thể tự theo dõi chính mình.' })
  }

  const author = await User.findById(authorIdToFollow)
  if (!author) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy tác giả.' })
  }

  const isFollowing = author.followers.includes(currentUserId)

  if (isFollowing) {
    // Nếu đã theo dõi -> Bỏ theo dõi
    await User.updateOne({ _id: authorIdToFollow }, { $pull: { followers: currentUserId } })
  } else {
    // Nếu chưa theo dõi -> Theo dõi
    await User.updateOne({ _id: authorIdToFollow }, { $addToSet: { followers: currentUserId } })
  }

  return { isFollowing: !isFollowing }
})
