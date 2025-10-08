import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  const storyId = event.context.params?.id as string
  const storyObjectId = new mongoose.Types.ObjectId(storyId);

  // Tăng lượt xem
  await Story.updateOne({ _id: storyObjectId }, { $inc: { views: 1 } });

  // Lấy dữ liệu truyện và tính toán rating bằng Aggregation
  const storyAggregation = await Story.aggregate([
    { $match: { _id: storyObjectId, status: 'published' } },
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'storyId',
        as: 'reviews'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'authorInfo'
      }
    },
    {
      $addFields: {
        reviewCount: { $size: '$reviews' },
        averageRating: { $avg: '$reviews.rating' },
        author: { $arrayElemAt: ['$authorInfo', 0] }
      }
    },
    {
      $project: {
        prompt: 0, // Loại bỏ prompt
        reviews: 0, // Loại bỏ mảng reviews lớn
        authorInfo: 0,
        'author.password': 0, // Loại bỏ các trường nhạy cảm của author
        'author.email': 0
      }
    }
  ]);

  const story = storyAggregation[0];

  if (!story) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy truyện' })
  }

  const chapters = await Chapter.find({ storyId: story._id, status: 'published' })
    .sort({ chapterNumber: 1 })
    .select('chapterNumber title updatedAt'); // Thêm updatedAt

  return { story, chapters }
})
