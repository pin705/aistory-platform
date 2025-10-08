import sanitizeHtml from 'sanitize-html'

export default defineEventHandler(async (event) => {
  const storyId = event.context.params?.storyId as string
  const chapterNumber = parseInt(event.context.params?.chapterNumber as string, 10)

  if (!storyId || isNaN(chapterNumber)) {
    throw createError({ statusCode: 400, statusMessage: 'Yêu cầu không hợp lệ' })
  }

  const story = await Story.findOne({ _id: storyId, status: 'published' }).select('title prompt')
  if (!story) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy truyện' })
  }

  // Chạy 3 query song song để tối ưu tốc độ
  const [currentChapter, prevChapter, nextChapter] = await Promise.all([
    // Lấy chương hiện tại
    Chapter.findOne({ storyId, chapterNumber, status: 'published' }),
    // Lấy chương trước đó (nếu có)
    Chapter.findOne({ storyId, chapterNumber: chapterNumber - 1, status: 'published' }).select('chapterNumber title'),
    // Lấy chương kế tiếp (nếu có)
    Chapter.findOne({ storyId, chapterNumber: chapterNumber + 1, status: 'published' }).select('chapterNumber title')
  ]);

  if (!currentChapter) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy chương' })
  }

  // Làm sạch HTML để chống XSS attack trước khi gửi về client
  currentChapter.content = sanitizeHtml(currentChapter.content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']), // Cho phép thẻ img nếu bạn muốn
  });

  return {
    story,
    currentChapter,
    prevChapter,
    nextChapter,
  }
})
