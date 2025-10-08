export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const storyId = event.context.params?.id as string
  const query = getQuery(event)

  // Xây dựng điều kiện query động
  const findQuery: any = { storyId }
  if (query.q) {
    const searchQuery = { $regex: query.q, $options: 'i' } // 'i' for case-insensitive
    findQuery.$or = [
      { name: searchQuery },
      { description: searchQuery },
      { role: searchQuery },
    ]
  }

  // Xây dựng tùy chọn sắp xếp động
  const sortOptions: any = {}
  if (query.sort) {
    sortOptions[query.sort as string] = query.direction === 'desc' ? -1 : 1
  } else {
    sortOptions.name = 1 // Mặc định sắp xếp theo tên A-Z
  }

  const characters = await Character.find(findQuery).sort(sortOptions)
  return characters
})
