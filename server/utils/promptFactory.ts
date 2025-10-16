import { convert } from 'html-to-text'

// Giả định hàm này sẽ được gọi với đầy đủ dữ liệu cần thiết
async function createChapterOutlinePrompt(context): Promise<string> {
  const {
    story, // object chứa summary và settings
    lorebookContext, // một chuỗi tóm tắt các nhân vật, thế lực liên quan
    prevChapterSummary,
    prevChapterEndingText, // vài trăm từ cuối của chương trước
    chapterIdea
  } = context

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
      - Tóm tắt chương trước: ${prevChapterSummary || 'Đây là chương đầu tiên.'}
      - Đoạn kết của chương trước (để đảm bảo sự liền mạch):
      "...${prevChapterEndingText || 'Không có.'}"
      </BỐI_CẢNH_CHƯƠNG_TRƯỚC>

      <YÊU_CẦU_CỦA_TÁC_GIẢ_CHO_CHƯƠNG_NÀY>
      "${chapterIdea}"
      </YÊU_CẦU_CỦA_TÁC_GIẢ_CHO_CHƯƠNG_NÀY>

      <NHIỆM_VỤ>
      Dựa vào TOÀN BỘ thông tin được cung cấp, hãy tạo ra một dàn ý chi tiết cho chương truyện dưới dạng một đối tượng JSON DUY NHẤT, hợp lệ.
      Đối tượng JSON phải chứa các khóa sau:
      - "opening": (String) Một câu mô tả súc tích, hấp dẫn cho cảnh mở đầu.
      - "development": (Mảng String) Một mảng chứa 2-4 chuỗi, mỗi chuỗi mô tả một bước phát triển tình tiết chính trong chương. Các bước phải logic và dẫn dắt đến cao trào.
      - "climax": (String) Một câu mô tả điểm cao trào, nơi xung đột hoặc căng thẳng lên đến đỉnh điểm.
      - "ending": (String) Một câu mô tả cảnh kết thúc, giải quyết một phần cao trào nhưng phải tạo ra sự tò mò hoặc gợi mở cho chương tiếp theo.
      </NHIỆM_VỤ>

      <VÍ_DỤ_JSON_MẪU>
      {
        "opening": "Nhân vật chính tỉnh dậy trong một khu rừng lạ lẫm, trên tay là một vật phẩm không rõ nguồn gốc.",
        "development": [
          "Họ cố gắng xác định phương hướng và phát hiện ra những dấu vết kỳ lạ, không giống của bất kỳ sinh vật nào từng biết.",
          "Đi theo dấu vết, họ tìm thấy một ngôi làng bị bỏ hoang nhưng có dấu hiệu của một cuộc di tản vội vã.",
          "Một nhân vật phụ bất ngờ xuất hiện, tiết lộ rằng ngôi làng đang bị một thế lực bí ẩn săn lùng."
        ],
        "climax": "Thế lực bí ẩn tấn công, buộc nhân vật chính và người bạn mới phải hợp sức chiến đấu để sinh tồn.",
        "ending": "Họ đẩy lùi được đợt tấn công đầu tiên, nhưng phát hiện ra vật phẩm trên tay nhân vật chính chính là thứ mà kẻ địch đang tìm kiếm."
      }
      </VÍ_DỤ_JSON_MẪU>

      <QUY_TẮC_XUẤT_BẢN>
      - Chỉ trả về duy nhất một khối mã JSON hợp lệ.
      - KHÔNG được thêm bất kỳ văn bản giới thiệu, giải thích nào trước hoặc sau khối JSON.
      - KHÔNG được bao bọc JSON trong markdown (ví dụ: \`\`\`json ... \`\`\`).
      </QUY_TẮC_XUẤT_BẢN>
    `
  return metaPrompt
}

async function createStoryDetailsPrompt(job): Promise<string> {
  const { genres, settings } = job.context

  // (CẢI TIẾN 1) Tách bạch các phần thông tin bằng các thẻ giống XML để LLM dễ phân biệt
  const metaPrompt = `
      QUAN TRỌNG: HÃY VIẾT CÂU TRẢ LỜI HOÀN TOÀN BẰNG TIẾNG VIỆT.

      <BỐI CẢNH>
      Bạn là một AI chuyên gia trong việc phân tích yêu cầu và khởi tạo cấu trúc dữ liệu cho tiểu thuyết. Vai trò của bạn là nhận một ý tưởng và các thông số, sau đó trả về một cấu trúc JSON DUY NHẤT chứa bộ khung cho câu chuyện.
      </BỐI CẢNH>

      <YÊU CẦU_NGƯỜI_DÙNG>
      - Ý tưởng chính: "${job.prompt}"
      - Thể loại gợi ý: ${genres.join(', ')}
      </YÊU CẦU_NGƯỜI_DÙNG>

      <THÔNG_SỐ_KỸ_THUẬT>
      - Cấu trúc viết: ${settings.writingStructure}
      - Quy mô dự kiến: ${settings.chapterCount} chương
      - Số từ trên mỗi chương (ước tính): ${settings.wordsPerChapter}
      - Độ sâu bộ nhớ (tham khảo): ${settings.memoryDepth}/10
      - Phong cách viết: ${settings.writingStyle}
      - Giọng điệu: ${settings.tone}
      - Độ phức tạp ngôn ngữ: ${settings.languageComplexity}
      - Độ tuổi mục tiêu: ${settings.targetAgeGroup}
      - Yếu tố cảm xúc chính: ${settings.emotionalElements.join(', ') || 'Không có'}
      - Yếu tố hài hước: ${settings.humorElements.join(', ') || 'Không có'}
      </THÔNG_SỐ_KỸ_THUẬT>

      <NHIỆM_VỤ>
      Dựa vào toàn bộ thông tin trên, hãy tạo ra một cấu trúc JSON duy nhất, hợp lệ.
      Hãy tuân thủ nghiêm ngặt định dạng và các yêu cầu về kiểu dữ liệu sau:

      1. "story": một object chứa "title" (string), "description" (string), "tags" (mảng string), "genres" (mảng string).
      2. "characters": một mảng chứa 3-5 nhân vật quan trọng (chính, phản diện, phụ). Mỗi nhân vật là một object có "name" (string), "role" (string), "description" (string), "backstory" (string), và "abilities" (mảng string).
      3. "factions": một mảng chứa 2-3 thế lực/môn phái chính. Mỗi thế lực là một object có "name" (string), "ideology" (string), và "description" (string).
      4. "realms": một mảng chứa 5-7 cảnh giới tu luyện đầu tiên. Mỗi cảnh giới là một object có "name" (string), "level" (BẮT BUỘC LÀ NUMBER), và "description" (string).
      5. "locations": một mảng chứa 2-3 địa danh quan trọng. Mỗi địa danh là một object có "name" (string), "description" (string), và "keyFeatures" (string, các đặc điểm nối với nhau bằng dấu phẩy).
      </NHIỆM_VỤ>

      <VÍ_DỤ_ĐỊNH_DẠNG_JSON>
      {
        "story": {
          "title": "Ví dụ Tên Truyện",
          "description": "Đây là mô tả ví dụ.",
          "tags": ["hành động", "phiêu lưu"],
          "genres": ["Huyền Huyễn"]
        },
        "characters": [
          {
            "name": "Nhân vật A",
            "role": "Chính",
            "description": "Mô tả ngắn gọn.",
            "backstory": "Nguồn gốc của nhân vật.",
            "abilities": ["Năng lực 1", "Năng lực 2"]
          }
        ],
        "factions": [],
        "realms": [
          {
            "name": "Luyện Khí Kỳ",
            "level": 1,
            "description": "Cảnh giới đầu tiên."
          }
        ],
        "locations": []
      }
      </VÍ_DỤ_ĐỊNH_DẠNG_JSON>

      <QUY_TẮC_XUẤT_BẢN_CUỐI_CÙNG>
      - Chỉ trả về duy nhất một khối mã JSON.
      - KHÔNG BAO GIỜ được thêm bất kỳ văn bản giới thiệu, giải thích nào trước hoặc sau khối JSON.
      - KHÔNG BAO GIỜ được bao bọc JSON trong markdown (ví dụ: \`\`\`json ... \`\`\`).
      - Đảm bảo JSON là hợp lệ 100% và có thể được phân tích cú pháp (parse) trực tiếp.
      </QUY_TẮC_XUẤT_BẢN_CUỐI_CÙNG>
    `

  return metaPrompt
}

async function createSceneGenerationPrompt(job): Promise<string> {
  const { storyId, currentContent, settings } = job.context
  const userPrompt = job.prompt

  const [ragContext, lorebookContext, story] = await Promise.all([
    retrieveSimilarContext(storyId, userPrompt),
    retrieveLorebookContext(storyId, userPrompt),
    Story.findById(storyId).select('summary')
  ])
  const storySummary = story?.summary || 'Không có tóm tắt.'

  const plainTextCurrentContent = convert(currentContent || '', {
    wordwrap: false,
    selectors: [{ selector: 'p', options: { itemPrefix: ' ' } }]
  }).trim()

  return `
    QUAN TRỌNG: HÃY VIẾT CÂU TRẢ LỜI HOÀN TOÀN BẰNG TIẾNG VIỆT.
    Bạn là một tiểu thuyết gia chuyên nghiệp với bút pháp mạch lạc, văn phong trong sáng, chuyên viết cho các nền tảng đọc truyện online.

    **NHIỆM VỤ:**
    Dựa vào các quy tắc và bối cảnh được cung cấp, hãy viết phần tiếp theo cho câu chuyện một cách tự nhiên và hấp dẫn nhất.

    ---
    ### **QUY TẮC VÀ PHONG CÁCH SÁNG TÁC (BẮT BUỘC TUÂN THỦ)**

    ✍️ **Phong cách viết:** ${settings.writingStyle}
    🎭 **Giọng điệu (Tone):** ${settings.tone}
    🎯 **Độ dài mục tiêu:** Viết đoạn tiếp theo có độ dài phù hợp, hướng tới mục tiêu khoảng **${settings.wordsPerChapter} từ/chương**.
    // ... (các quy tắc khác giữ nguyên) ...
    🔗 **Cấu trúc & Liên kết:** Tuân thủ cấu trúc **${settings.writingStructure}**. Lưu ý về độ sâu tham chiếu (${settings.memoryDepth}/10), cần đảm bảo các chi tiết và sự kiện có sự liên kết chặt chẽ, tránh mâu thuẫn.

    📖 **(MỚI) Định dạng:** Trình bày như một tác phẩm văn học thực thụ. Tự động ngắt dòng và xuống dòng để tạo các đoạn văn (paragraphs) rõ ràng, mạch lạc. Mỗi đoạn văn nên tập trung vào một ý hoặc một cảnh nhỏ.

     ---
    ### **BỐI CẢNH ĐỂ BẠN SÁNG TÁC**

    **1. Kim chỉ nam (Tóm tắt cốt truyện chính):**
    ${storySummary}

    **2. Thông tin Lorebook (Các thực thể liên quan):**
    ${lorebookContext}

    **3. Ngữ cảnh từ các chương trước (RAG):**
    ${ragContext}

    **4. Vài dòng cuối của nội dung đang viết:**
    ...${plainTextCurrentContent.slice(-1500)}

    **5. Yêu cầu của tác giả cho cảnh này:**
    "${userPrompt}"
    ---

    ### **(MỚI) VÍ DỤ VỀ ĐỊNH DẠNG MONG MUỐN**

    Gió đêm thổi qua khu rừng, mang theo hơi lạnh ẩm ướt. Tiếng xào xạc của lá cây khô dưới chân là âm thanh duy nhất phá vỡ sự tĩnh lặng đến rợn người.

    Bất chợt, một tiếng động lạ vang lên từ phía trước. Không phải tiếng thú rừng, cũng không phải tiếng gió. Nó giống như tiếng kim loại va vào đá, ngắn và sắc.

    ---
    📝 YÊU CẦU CUỐI CÙNG (CỰC KỲ QUAN TRỌNG)

    "Bắt đầu viết ngay lập tức...": Mệnh lệnh này yêu cầu AI bỏ qua mọi bước đệm và đi thẳng vào việc sáng tác.

    "Chỉ trả về NỘI DUNG của câu chuyện.": Yêu cầu này xác định rõ phạm vi của kết quả trả về.

    "TUYỆT ĐỐI KHÔNG viết lời dẫn, lời bình, hay bất kỳ câu nào không thuộc về câu chuyện...": Đây là ràng buộc cấm đoán trực tiếp, sử dụng từ khóa mạnh "TUYỆT ĐỐI KHÔNG" để ngăn AI thêm vào các câu bình luận như bạn đã thấy.

    Trả về đúng định dạng HTML cho nội dung, không thêm thẻ markdown hay bất kỳ định dạng nào khác. Như một tác phẩm văn học thực thụ, hãy ngắt dòng và xuống dòng để tạo các đoạn văn (paragraphs) rõ ràng, mạch lạc.

    Hãy tuân thủ nghiêm ngặt các quy tắc và bối cảnh đã cho để tạo ra một đoạn văn hấp dẫn, mạch lạc, và phù hợp với phong cách của câu chuyện.
    `
}

export async function getMetaPrompt(job): Promise<string> {
  switch (job.jobType) {
    case 'generate_story_details':
      return await createStoryDetailsPrompt(job)
    case 'generate_scene':
      // (CẬP NHẬT) Kích hoạt lại
      return await createSceneGenerationPrompt(job)
    case 'generate_outline':
    return await createChapterOutlinePrompt(job)
    default:
      throw new Error(`Unknown job type: ${job.jobType}`)
  }
}
