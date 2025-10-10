import CryptoJS from 'crypto-js'
import { GoogleGenAI } from '@google/genai'

// Các mẫu prompt cho từng loại
const PROMPT_TEMPLATES: Record<string, string> = {
  realm: `
    - Tên cảnh giới: một cái tên độc đáo và mạnh mẽ.
    - Cấp độ: một con số thể hiện thứ hạng.
    - Mô tả: các đặc điểm của người tu luyện ở cảnh giới này.
    - Điều kiện đột phá: cần những gì để lên cấp.`,
  faction: `
    - Tên thế lực: một cái tên ấn tượng.
    - Tôn chỉ: mục đích, lý tưởng hoạt động.
    - Mô tả: quy mô, địa bàn, phong cách của thế lực.`,
  location: `
    - Tên địa danh: một cái tên kỳ ảo.
    - Mô tả: cảnh quan, khí hậu, các điểm đặc trưng.
    - Đặc điểm nổi bật: tài nguyên, nguy hiểm, hoặc bí mật ẩn giấu.`
}

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const { storyId, loreType, prompt } = await readBody(event)

  if (!loreType || !PROMPT_TEMPLATES[loreType] || !prompt) {
    throw createError({ statusCode: 400, statusMessage: 'Yêu cầu không hợp lệ.' })
  }

  // Lấy API key của người dùng
  const apiKeyRecord = await ApiKey.findOne({ userId: session.user.id, provider: 'gemini' })
  if (!apiKeyRecord) throw createError({ statusCode: 400, message: 'Vui lòng thêm API Key Gemini.' })
  const decryptedKey = CryptoJS.AES.decrypt(apiKeyRecord.encryptedKey, process.env.CRYPTO_SECRET!).toString(CryptoJS.enc.Utf8)
  if (!decryptedKey) throw createError({ statusCode: 500, message: 'Lỗi giải mã key.' })

  const story = await Story.findById(storyId).select('prompt description')
  const storyContext = `Bối cảnh truyện: ${story?.prompt || story?.description || 'chưa có'}`

  try {
    const genAI = new GoogleGenAI({ apiKey: decryptedKey })

    const metaPrompt = `
      QUAN TRỌNG: HÃY VIẾT CÂU TRẢ LỜI HOÀN TOÀN BẰNG TIẾNG VIỆT.
      Bạn là một chuyên gia xây dựng thế giới (world-building expert). Dựa vào bối cảnh truyện và ý tưởng của người dùng, hãy tạo ra một mục Lorebook chi tiết.

      **Bối cảnh chung của truyện:**
      ${storyContext}

      **Yêu cầu của người dùng:**
      - Loại thông tin cần tạo: "${loreType}"
      - Ý tưởng: "${prompt}"

      Nhiệm vụ: Hãy tạo ra các thông tin sau và trả về dưới dạng một đối tượng JSON hợp lệ (không có markdown):
      ${PROMPT_TEMPLATES[loreType]}
    `

    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: metaPrompt
    })

    const rawText = result.text ?? ''
    const jsonMatch = rawText.match(/{[\s\S]*}/)
    if (!jsonMatch) {
      throw createError({ statusCode: 500, statusMessage: 'AI đã trả về dữ liệu không đúng định dạng.' })
     }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Lỗi Gemini API khi tạo lore:', error)
    throw createError({ statusCode: 500, statusMessage: 'AI không thể tạo gợi ý lúc này.' })
  }
})
