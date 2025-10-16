import { generateContent } from "~~/server/services/ai"

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const { storyId, chapterIdea, prevChapterSummary = 'Đây là chương đầu tiên.' } = await readBody(event)

  if (!chapterIdea) {
    throw createError({ statusCode: 400, statusMessage: 'Vui lòng cung cấp ý tưởng cho chương.' })
  }

  try {
    // --- (CẢI TIẾN 1) Truy vấn dữ liệu toàn diện hơn ---
    const story = await Story.findById(storyId).select('summary settings')
    if (!story) {
      throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy truyện.' })
    }

    // --- (CẢI TIẾN 2) Tạo ngữ cảnh Lorebook từ các model liên quan ---
    const characters = await Character.find({ storyId }).limit(5).select('name role description')
    const factions = await Faction.find({ storyId }).limit(3).select('name description')

    let lorebookContext = ''
    if (characters.length > 0) {
      lorebookContext += 'Nhân vật: ' + characters.map(c => `${c.name} (${c.role}) - ${c.description}`).join('; ') + '. '
    }
    if (factions.length > 0) {
      lorebookContext += 'Thế lực: ' + factions.map(f => `${f.name} - ${f.description}`).join('; ') + '.'
    }

    // --- (CẢI TIẾN 3) Lấy đoạn kết của chương gần nhất ---
    const lastChapter = await Chapter.findOne({ storyId }).sort({ chapterNumber: -1 }).select('content')
    const prevChapterEndingText = lastChapter ? lastChapter.content.slice(-500) : 'Không có.' // Lấy 500 ký tự cuối

    // --- (CẢI TIẾN 4) Tích hợp prompt mới với đầy đủ ngữ cảnh ---
    const metaPrompt = `
      QUAN TRỌNG: HÃY VIẾT CÂU TRẢ LỜI HOÀN TOÀN BẰNG TIẾNG VIỆT.

      <VAI_TRÒ>
      Bạn là một AI chuyên gia xây dựng dàn ý chương truyện, có khả năng phân tích bối cảnh sâu sắc và sáng tạo ra những tình tiết hấp dẫn, logic, và kết nối chặt chẽ với mạch truyện tổng thể.
      </VAI_TRÒ>

      <THÔNG_TIN_TRUYỆN>
      - Tóm tắt cốt truyện chính: ${story?.summary || 'Chưa có'}
      - Phong cách & Giọng điệu chung: ${story?.settings?.writingStyle || 'Chưa xác định'}, giọng điệu ${story?.settings?.tone || 'trung tính'}.
      - Bối cảnh & Nhân vật liên quan (Lorebook): ${lorebookContext || 'Không có thông tin bổ sung.'}
      </THÔNG_TIN_TRUYỆN>

      <BỐI_CẢNH_CHƯƠNG_TRƯỚC>
      - Tóm tắt chương trước: ${prevChapterSummary}
      - Đoạn kết của chương trước (để đảm bảo sự liền mạch):
      "...${prevChapterEndingText}"
      </BỐI_CẢNH_CHƯƠNG_TRƯỚC>

      <YÊU_CẦU_CỦA_TÁC_GIẢ_CHO_CHƯƠNG_NÀY>
      "${chapterIdea}"
      </YÊU_CẦU_CỦA_TÁC_GIẢ_CHO_CHƯƠNG_NÀY>

      <NHIỆM_VỤ>
      Dựa vào TOÀN BỘ thông tin được cung cấp, hãy tạo ra một dàn ý chi tiết cho chương truyện dưới dạng một đối tượng JSON DUY NHẤT, hợp lệ.
      Đối tượng JSON phải chứa các khóa sau:
      - "opening": (String) Một câu mô tả súc tích, hấp dẫn cho cảnh mở đầu.
      - "development": (Mảng String) Một mảng chứa 2-4 chuỗi, mỗi chuỗi mô tả một bước phát triển tình tiết chính trong chương.
      - "climax": (String) Một câu mô tả điểm cao trào, nơi xung đột hoặc căng thẳng lên đến đỉnh điểm.
      - "ending": (String) Một câu mô tả cảnh kết thúc, giải quyết một phần cao trào nhưng phải tạo ra sự tò mò hoặc gợi mở cho chương tiếp theo.
      </NHIỆM_VỤ>

      <VÍ_DỤ_JSON_MẪU>
      {
        "opening": "Nhân vật chính tỉnh dậy trong một khu rừng lạ lẫm, trên tay là một vật phẩm không rõ nguồn gốc.",
        "development": [
          "Họ cố gắng xác định phương hướng và phát hiện ra những dấu vết kỳ lạ.",
          "Đi theo dấu vết, họ tìm thấy một ngôi làng bị bỏ hoang.",
          "Một nhân vật phụ bất ngờ xuất hiện, tiết lộ bí mật về ngôi làng."
        ],
        "climax": "Thế lực bí ẩn tấn công, buộc nhân vật chính và người bạn mới phải hợp sức chiến đấu.",
        "ending": "Họ đẩy lùi được đợt tấn công, nhưng phát hiện ra vật phẩm trên tay nhân vật chính chính là thứ mà kẻ địch đang tìm kiếm."
      }
      </VÍ_DỤ_JSON_MẪU>

      <QUY_TẮC_XUẤT_BẢN>
      - Chỉ trả về duy nhất một khối mã JSON hợp lệ.
      - KHÔNG được thêm bất kỳ văn bản giới thiệu, giải thích nào trước hoặc sau khối JSON.
      - KHÔNG được bao bọc JSON trong markdown (ví dụ: \`\`\`json ... \`\`\`).
      </QUY_TẮC_XUẤT_BẢN>
    `

    const { rawText } = await generateContent({
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
    // Trả về lỗi có cấu trúc hơn để client có thể hiển thị
    const statusMessage = error.message || 'AI không thể tạo dàn ý lúc này.'
    throw createError({ statusCode: error.statusCode || 500, statusMessage })
  }
})
