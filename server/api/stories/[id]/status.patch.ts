
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const storyId = event.context.params?.id as string
  const { status } = await readBody(event)

  if (!['draft', 'published', 'on-hold', 'finished'].includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Trạng thái không hợp lệ.' })
  }

  // Tìm và cập nhật, đồng thời kiểm tra quyền sở hữu
  const updatedStory = await Story.findOneAndUpdate(
    { _id: storyId, author: session.user.id },
    { $set: { status: status, updatedAt: new Date() } },
    { new: true }
  )

  if (!updatedStory) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy truyện hoặc bạn không có quyền.' })
  }

  return { message: 'Cập nhật trạng thái thành công!' }
})
