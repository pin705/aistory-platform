import { convert } from 'html-to-text'

async function createStoryDetailsPrompt(job): Promise<string> {
  const { genres, settings } = job.context

  const metaPrompt = `
      QUAN TRỌNG: HÃY VIẾT CÂU TRẢ LỜI HOÀN TOÀN BẰNG TIẾNG VIỆT.
      Tôi muốn bạn đóng vai trò là một tiểu thuyết gia. Bạn sẽ viết nên những câu chuyện sáng tạo và hấp dẫn, có thể thu hút độc giả trong thời gian dài.
      Bạn có thể chọn bất kỳ thể loại nào, chẳng hạn như ${genres.join(', ')} - nhưng mục tiêu là viết nên một tác phẩm có cốt truyện xuất sắc, nhân vật lôi cuốn và những cao trào bất ngờ.
      Yêu cầu đầu tiên của tôi là: "${job.prompt}"

      **Thông số kỹ thuật do người dùng cung cấp:**
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

      **Nhiệm vụ:**
      Hãy tạo ra một cấu trúc JSON duy nhất, hợp lệ (không có markdown) chứa tất cả các thông tin sau:

      1. "story": một object chứa "title", "description", "tags" (mảng), "genres" (mảng).
      2. "characters": một mảng chứa 3-5 nhân vật quan trọng (chính, phản diện, phụ), mỗi nhân vật là object có "name", "role", "description", "backstory", và "abilities" (mảng các chuỗi).
      3. "factions": một mảng chứa 2-3 thế lực/môn phái chính, mỗi thế lực là một object có "name", "ideology", và "description".
      4. "realms": một mảng chứa 5-7 cảnh giới tu luyện đầu tiên, mỗi cảnh giới là một object có "name", "level" (BẮT BUỘC LÀ MỘT CON SỐ - NUMBER), và "description".
      5. "locations": một mảng chứa 2-3 địa danh quan trọng, mỗi địa danh là một object có "name", "description", và "keyFeatures (Phải là string nối nhau dấu ,)".
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

  // Chuyển đổi currentContent HTML thành văn bản thuần túy
  const plainTextCurrentContent = convert(currentContent || '', {
    wordwrap: false,
    selectors: [{ selector: 'p', options: { itemPrefix: ' ' } }]
  }).trim()

  // (CẬP NHẬT TOÀN DIỆN) Prompt mới với quy tắc khắt khe
  return `
    QUAN TRỌNG: HÃY VIẾT CÂU TRẢ LỜI HOÀN TOÀN BẰNG TIẾNG VIỆT.
    Bạn là một tiểu thuyết gia chuyên nghiệp với bút pháp mạch lạc, văn phong trong sáng, chuyên viết cho các nền tảng đọc truyện online.

    **NHIỆM VỤ:**
    Dựa vào các quy tắc sáng tác và toàn bộ bối cảnh được cung cấp, hãy viết phần tiếp theo cho câu chuyện một cách hấp dẫn và nhất quán.

    ---
    ### **QUY TẮC VÀ PHONG CÁCH SÁNG TÁC (BẮT BUỘC TUÂN THỦ)**

    ✍️ **Phong cách viết:** ${settings.writingStyle}
    🎭 **Giọng điệu (Tone):** ${settings.tone}
    🎯 **Độ dài mục tiêu:** Viết đoạn tiếp theo có độ dài phù hợp, hướng tới mục tiêu khoảng **${settings.wordsPerChapter} từ/chương**.
    🧠 **Độ phức tạp ngôn ngữ:** ${settings.languageComplexity}.
    👥 **Đối tượng độc giả:** Hướng đến độc giả ở độ tuổi **${settings.targetAgeGroup}**, sử dụng ngôn từ và tình tiết phù hợp.
    💖 **Yếu tố cảm xúc:** Nhấn mạnh các yếu tố: **${settings.emotionalElements.join(', ') || 'Không có'}**.
    😂 **Yếu tố hài hước:** Thêm các chi tiết hài hước (nếu có): **${settings.humorElements.join(', ') || 'Không có'}**.
    🔗 **Cấu trúc & Liên kết:** Tuân thủ cấu trúc **${settings.writingStructure}**. Lưu ý về độ sâu tham chiếu (${settings.memoryDepth}/10), cần đảm bảo các chi tiết và sự kiện có sự liên kết chặt chẽ, tránh mâu thuẫn.

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

    Hãy bắt đầu viết. Chỉ trả về phần truyện được viết tiếp, tuân thủ nghiêm ngặt các quy tắc và định dạng đã nêu.
    `
}

export async function getMetaPrompt(job): Promise<string> {
  switch (job.jobType) {
    case 'generate_story_details':
      return await createStoryDetailsPrompt(job)
    case 'generate_scene':
      // (CẬP NHẬT) Kích hoạt lại
      return await createSceneGenerationPrompt(job)
    default:
      throw new Error(`Unknown job type: ${job.jobType}`)
  }
}
