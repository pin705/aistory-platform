import sanitizeHtml from 'sanitize-html'

export default defineEventHandler(async (event) => {
  const storyId = event.context.params?.storyId as string
  const chapterNumber = parseInt(event.context.params?.chapterNumber as string, 10)

  if (!storyId || isNaN(chapterNumber)) {
    throw createError({ statusCode: 400, statusMessage: 'Yêu cầu không hợp lệ' })
  }

  // (CẬP NHẬT) Sửa lại query để lấy thêm thông tin tác giả
  const story = await Story.findOne({ _id: storyId, status: 'published' })
    .select('title author coverImage createdAt updatedAt tags genres') // Lấy các trường cần cho SEO
    .populate('author', 'username avatar') // Lấy username và avatar của tác giả

  if (!story) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy truyện' })
  }

  // Chạy 3 query song song để tối ưu tốc độ
  const [currentChapter, prevChapter, nextChapter] = await Promise.all([
    Chapter.findOne({ storyId, chapterNumber, status: 'published' }),
    Chapter.findOne({ storyId, chapterNumber: chapterNumber - 1, status: 'published' }).select('chapterNumber title'),
    Chapter.findOne({ storyId, chapterNumber: chapterNumber + 1, status: 'published' }).select('chapterNumber title')
  ]);

  if (!currentChapter) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy chương' })
  }

  // Làm sạch HTML để chống XSS attack
  currentChapter.content = sanitizeHtml(currentChapter.content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
  });

  return {
    story,
    currentChapter,
    prevChapter,
    nextChapter,
  }
})
