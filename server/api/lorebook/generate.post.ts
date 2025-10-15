import CryptoJS from 'crypto-js'
import { GoogleGenAI } from '@google/genai'
import { generateContent } from '~~/server/services/ai'

// Các mẫu prompt cho từng loại
const PROMPT_TEMPLATES: Record<string, string> = {
  realm: `
    - name: một tên cảnh giới độc đáo và mạnh mẽ.
    - level: một con số thể hiện thứ hạng.
    - description: một chuỗi văn bản duy nhất mô tả các đặc điểm của người tu luyện ở cảnh giới này.
    - breakthroughConditions: một chuỗi văn bản duy nhất mô tả cần những gì để lên cấp.`,
  faction: `
    - name: một cái tên ấn tượng bằng Tiếng Việt.
    - ideology: một chuỗi văn bản (string) duy nhất, tóm tắt các tôn chỉ/mục đích chính, mỗi tôn chỉ cách nhau bằng dấu chấm phẩy.
    - description: một chuỗi văn bản (string) duy nhất, tổng hợp các thông tin về quy mô, địa bàn, phong cách hoạt động thành một đoạn văn hoàn chỉnh.`,
  location: `
    - name: một cái tên kỳ ảo cho địa danh.
    - description: một chuỗi văn bản duy nhất mô tả cảnh quan, khí hậu, lịch sử.
    - keyFeatures: một chuỗi văn bản duy nhất mô tả các đặc điểm nổi bật như tài nguyên, nguy hiểm, bí mật.`,
  character: `
  - name: Một cái tên phù hợp, độc đáo.
  - description: Mô tả chi tiết về ngoại hình, khí chất và tính cách (2-3 câu).
  - backstory: Một đoạn tiểu sử ngắn gọn về quá khứ, nguồn gốc của nhân vật (3-4 câu).
  - abilities: Liệt kê 2-3 năng lực, kỹ năng hoặc công pháp đặc trưng.
  `
}

async function getExistingLoreContext(storyId: string) {
  const [characters, factions, locations, realms] = await Promise.all([
    Character.find({ storyId }).select('name role'),
    Faction.find({ storyId }).select('name ideology'),
    Location.find({ storyId }).select('name'),
    CultivationRealm.find({ storyId }).select('name level').sort({ level: 1 })
  ])

  const characterContext = characters.length > 0
    ? `Các nhân vật đã có: ${characters.map(c => `${c.name} (${c.role})`).join(', ')}.`
    : 'Chưa có nhân vật nào.'

  const factionContext = factions.length > 0
    ? `Các thế lực đã có: ${factions.map(f => `${f.name} (${f.ideology})`).join(', ')}.`
    : 'Chưa có thế lực nào.'

  const locationContext = locations.length > 0
    ? `Các địa danh đã có: ${locations.map(l => l.name).join(', ')}.`
    : 'Chưa có địa danh nào.'

  const realmContext = realms.length > 0
    ? `Hệ thống cảnh giới đã có (theo thứ tự): ${realms.map(r => `Cấp ${r.level}: ${r.name}`).join('; ')}.`
    : 'Chưa có hệ thống cảnh giới.'

  return `${characterContext}\n${factionContext}\n${locationContext}\n${realmContext}`
}

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const { storyId, loreType, prompt } = await readBody(event)

  if (!loreType || !PROMPT_TEMPLATES[loreType] || !prompt) {
    throw createError({ statusCode: 400, statusMessage: 'Yêu cầu không hợp lệ.' })
  }

  const story = await Story.findById(storyId).select('prompt description')
  const storyContext = `Bối cảnh truyện: ${story?.prompt || story?.description || 'chưa có'}`

  try {
    const genAI = new GoogleGenAI({ apiKey: decryptedKey })
    const existingLoreContext = await getExistingLoreContext(storyId)

    const metaPrompt = `
      QUAN TRỌNG: HÃY VIẾT CÂU TRẢ LỜI HOÀN TOÀN BẰNG TIẾNG VIỆT.
      Bạn là một chuyên gia xây dựng thế giới (world-building expert) với trí nhớ siêu phàm.
      Nhiệm vụ của bạn là tạo ra một mục Lorebook MỚI, đảm bảo nó MẠCH LẠC, ĐỘC ĐÁO và KHÔNG TRÙNG LẶP với những thông tin đã có.

      **BỐI CẢNH 1: Ý TƯỞNG CHUNG CỦA TRUYỆN**
      ${storyContext}

      **BỐI CẢNH 2: CÁC MỤC LOREBOOK ĐÃ TỒN TẠI**
      ${existingLoreContext}

      **YÊU CẦU CỦA NGƯỜI DÙNG:**
      - Loại thông tin cần tạo: "${loreType}"
      - Ý tưởng sơ bộ: "${prompt}"

      **NHIỆM VỤ:**
      Dựa vào TẤT CẢ các bối cảnh trên, hãy phát triển ý tưởng của người dùng thành một đối tượng JSON hợp lệ (không có markdown).
      Các khóa của JSON bắt buộc phải là chữ tiếng Anh không dấu như đã chỉ định:
      ${PROMPT_TEMPLATES[loreType]}
    `

    const { rawText } = await generateContent({
      userId: session.user.id,
      prompt: metaPrompt,
      jobType: 'generate_post_details'
    })

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
