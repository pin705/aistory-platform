import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const page = parseInt(query.page as string, 10) || 1
  const limit = parseInt(query.limit as string, 10) || 12 // Hiển thị 12 truyện mỗi lần tải
  const skip = (page - 1) * limit

  // --- Xây dựng query động ---
  const findQuery: any = {
    status: { $in: ['published', 'finished'] }
  }

  // Lọc theo tên truyện
  if (query.q) {
    findQuery.title = { $regex: query.q, $options: 'i' }
  }

  // Lọc theo thể loại
  if (query.genre) {
    findQuery.genres = query.genre
  }

  // --- Xây dựng sắp xếp động ---
  const sortQuery: any = {}
  if (query.sort) {
    // Ví dụ: sort=views&direction=desc
    sortQuery[query.sort as string] = query.direction === 'desc' ? -1 : 1
  } else {
    sortQuery.updatedAt = -1 // Mặc định sắp xếp theo mới cập nhật
  }

  // Chạy query
  const stories = await Story.find(findQuery)
    .sort(sortQuery)
    .skip(skip)
    .limit(limit)
    .populate('author', 'username')
    .select('-prompt -summary') // Loại bỏ các trường không cần thiết

  return stories
})
