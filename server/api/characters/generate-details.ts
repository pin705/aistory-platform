import { generateContent } from '~~/server/services/ai'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const { storyId, role, prompt } = await readBody(event)

  if (!role || !prompt) {
    throw createError({ statusCode: 400, statusMessage: 'Vui lòng cung cấp Vai trò và Ý tưởng nhân vật.' })
  }

  // Lấy bối cảnh chung của truyện để AI hiểu rõ hơn
  const story = await Story.findById(storyId).select('description prompt')
  const storyContext = `Bối cảnh truyện: ${story?.prompt || story?.description || 'chưa có'}`

  try {
    const metaPrompt = `
      QUAN TRỌNG: HÃY VIẾT CÂU TRẢ LỜI HOÀN TOÀN BẰNG TIẾNG VIỆT.
      Bạn là một chuyên gia sáng tạo nhân vật cho tiểu thuyết. Dựa vào bối cảnh truyện và ý tưởng nhân vật do người dùng cung cấp, hãy phát triển thành một hồ sơ nhân vật chi tiết.

      **Bối cảnh chung của truyện:**
      ${storyContext}

      **Yêu cầu của người dùng:**
      - Vai trò nhân vật: "${role}"
      - Ý tưởng/Bối cảnh nhân vật: "${prompt}"

      Nhiệm vụ: Hãy tạo ra một hồ sơ nhân vật với các thông tin sau và trả về dưới dạng một đối tượng JSON hợp lệ (không có markdown \`\`\`json):
      - name: Một cái tên phù hợp, độc đáo.
      - description: Mô tả chi tiết về ngoại hình, khí chất và tính cách (2-3 câu).
      - backstory: Một đoạn tiểu sử ngắn gọn về quá khứ, nguồn gốc của nhân vật (3-4 câu).
      - abilities: Liệt kê 2-3 năng lực, kỹ năng hoặc công pháp đặc trưng.
    `
    const { rawText } = await generateContent({
      userId: session.user.id,
      prompt: metaPrompt,
      jobType: 'generate_character_details'
    })

    const jsonMatch = rawText?.match(/{[\s\S]*}/)
    if (!jsonMatch) { throw new Error('AI trả về dữ liệu không đúng định dạng.') }

    return JSON.parse(jsonMatch[0])
  } catch (error: any) {
    console.error('Lỗi Gemini API khi tạo nhân vật:', error)
    throw createError({ statusCode: 500, statusMessage: 'AI không thể tạo gợi ý lúc này.' })
  }
})
