import { generateContent } from '~~/server/services/ai'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const { storyId, chapterContent } = await readBody(event)

  if (!chapterContent) {
    return { analysis: null, suggestions: [] }
  }

  // Lấy danh sách nhân vật để AI biết ai đang có trong truyện
  const characters = await Character.find({ storyId }).select('name role')
  const characterList = characters.map(c => `${c.name} (${c.role})`).join(', ')

  try {
    const metaPrompt = `
      QUAN TRỌNG: HÃY TRẢ LỜI BẰNG TIẾNG VIỆT.
      Bạn là một biên tập viên tiểu thuyết chuyên nghiệp. Hãy đọc và phân tích đoạn văn bản dưới đây.

      **Danh sách nhân vật trong truyện:**
      [${characterList}]

      **Nội dung chương:**
      "${chapterContent}"

      **Nhiệm vụ:**
      Hãy trả về một đối tượng JSON (không có markdown) với hai khóa: "analysis" và "suggestions".
      1. "analysis": một object chứa các phân tích sau:
         - "pacing": Nhịp độ của chương ('nhanh', 'trung bình', hoặc 'chậm').
         - "sentiment": Cảm xúc chủ đạo ('vui vẻ', 'buồn bã', 'căng thẳng', 'hành động', 'lãng mạn').
         - "charactersPresent": Một mảng tên các nhân vật xuất hiện trong chương này.
         - "wordRepetition": Một mảng chứa các từ hoặc cụm từ bị lặp lại nhiều lần một cách không cần thiết.
      2. "suggestions": một mảng chứa 2-3 gợi ý cụ thể để cải thiện chương truyện, mỗi gợi ý là một object có "type" ('character', 'plot', 'pacing', 'style') và "text" (nội dung gợi ý).
    `

    const rawText = await generateContent({
      userId: session.user.id,
      prompt: metaPrompt,
      jobType: 'analyze_chapter'
    })

    const jsonMatch = rawText.match(/{[\s\S]*}/)
    if (!jsonMatch) { throw new Error('AI không thể phân tích.') }

    return JSON.parse(jsonMatch[0])
  } catch (error: any) {
    console.error('Lỗi API Phân tích:', error)
    throw createError({ statusCode: 500, statusMessage: 'AI không thể phân tích lúc này.' })
  }
})
