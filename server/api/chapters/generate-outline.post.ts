import { generateContent } from "~~/server/services/ai"

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const { storyId, chapterIdea, prevChapterSummary } = await readBody(event)

  if (!chapterIdea) {
    throw createError({ statusCode: 400, statusMessage: 'Vui lòng cung cấp ý tưởng cho chương.' })
  }

  const story = await Story.findById(storyId).select('summary')

  try {
    const metaPrompt = `
      QUAN TRỌNG: HÃY VIẾT CÂU TRẢ LỜI HOÀN TOÀN BẰNG TIẾNG VIỆT.
      Bạn là một biên kịch và tiểu thuyết gia dày dạn kinh nghiệm. Nhiệm vụ của bạn là tạo ra một dàn ý chi tiết cho một chương truyện dựa trên yêu cầu của tác giả và các thông tin bối cảnh.

      **Tóm tắt cốt truyện chính:**
      ${story?.summary || 'Chưa có'}

      **Tóm tắt chương trước:**
      ${prevChapterSummary || 'Đây là chương đầu tiên.'}

      **Ý tưởng của tác giả cho chương này:**
      "${chapterIdea}"

      **Nhiệm vụ:**
      Hãy trả về một đối tượng JSON (không có markdown) chứa một dàn ý chi tiết cho chương truyện, bao gồm các khóa sau:
      - "opening": Một câu mô tả cảnh mở đầu.
      - "development": Một mảng chứa 2-4 chuỗi, mỗi chuỗi mô tả một bước phát triển chính trong chương.
      - "climax": Một câu mô tả điểm cao trào của chương.
      - "ending": Một câu mô tả cảnh kết thúc, có thể tạo sự tò mò cho chương sau.
    `

    const rawText = await generateContent({
      userId: session.user.id,
      prompt: metaPrompt,
      jobType: 'generate_outline'
    })

    console.log('Raw outline response:', rawText)
    const jsonMatch = rawText.match(/{[\s\S]*}/)
    if (!jsonMatch) { throw new Error('AI không thể tạo dàn ý.') }

    return JSON.parse(jsonMatch[0])
  } catch (error: any) {
    console.error('Lỗi API tạo dàn ý:', error)
    throw createError({ statusCode: 500, statusMessage: 'AI không thể tạo dàn ý lúc này.' })
  }
})
