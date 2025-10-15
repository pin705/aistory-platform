import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)

  const stories = await Story.aggregate([
    // Bước 1: Chỉ lấy các truyện của người dùng đang đăng nhập
    {
      $match: {
        author: new mongoose.Types.ObjectId(session.user.id)
      }
    },
    // Bước 2: "Tham gia" với collection 'chapters' để đếm
    {
      $lookup: {
        from: 'chapters', // Tên collection của model Chapter
        localField: '_id',
        foreignField: 'storyId',
        as: 'chapters'
      }
    },
    // Bước 3: Thêm trường mới `chapterCount` bằng cách đếm số phần tử trong mảng 'chapters'
    {
      $addFields: {
        chapterCount: { $size: '$chapters' }
      }
    },
    // Bước 4: Sắp xếp theo ngày cập nhật mới nhất
    {
      $sort: {
        updatedAt: -1
      }
    },
    // Bước 5: Chọn các trường cuối cùng để trả về, loại bỏ mảng 'chapters' không cần thiết
    {
      $project: {
        title: 1,
        status: 1,
        views: 1,
        updatedAt: 1,
        coverImage: 1,
        chapterCount: 1,
        modelUsed: 1
      }
    }
  ])

  return stories
})
