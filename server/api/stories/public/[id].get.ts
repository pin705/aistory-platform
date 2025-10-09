import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  const storyId = event.context.params?.id as string
  const storyObjectId = new mongoose.Types.ObjectId(storyId);

  // (MỚI) Lấy session của người dùng hiện tại (nếu có) để kiểm tra isFollowing
  const session = await getUserSession(event)

  // Tăng lượt xem
  await Story.updateOne({ _id: storyObjectId }, { $inc: { views: 1 } });

  // Lấy dữ liệu truyện và tính toán rating bằng Aggregation
  const storyAggregation = await Story.aggregate([
    { $match: { _id: storyObjectId, status: { $in: ['published', 'finished'] } } },
    {
      $lookup: {
        from: 'reviews', localField: '_id', foreignField: 'storyId', as: 'reviews'
      }
    },
    {
      $lookup: {
        from: 'users', localField: 'author', foreignField: '_id', as: 'authorInfo'
      }
    },
    {
      $addFields: {
        reviewCount: { $size: '$reviews' },
        averageRating: { $avg: '$reviews.rating' },
        author: { $arrayElemAt: ['$authorInfo', 0] },
      }
    },
    {
      // (MỚI) Thêm một bước để tính followerCount
      $addFields: {
        'author.followerCount': { $size: { $ifNull: ['$author.followers', []] } }
      }
    },
    {
      $project: {
        prompt: 0,
        reviews: 0,
        authorInfo: 0,
        'author.password': 0,
        'author.email': 0,
        'author.followers': 0, // (MỚI) Không cần gửi mảng followers về client
      }
    }
  ]);

  const story = storyAggregation[0];

  if (!story) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy truyện' })
  }

  // (MỚI) Tính toán isFollowing sau khi có dữ liệu author
  const authorWithFollowers = await User.findById(story.author._id).select('followers');
  const isFollowing = session?.user ? authorWithFollowers?.followers.includes(session.user.id) : false;

  const chapters = await Chapter.find({ storyId: story._id, status: 'published' })
    .sort({ chapterNumber: 1 })
    .select('chapterNumber title updatedAt');

  // (MỚI) Trả về thêm cả isFollowing
  return { story, chapters, isFollowing }
})
