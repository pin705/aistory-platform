import { convert } from 'html-to-text'

async function createStoryDetailsPrompt(job): Promise<string> {
  const { genres, settings } = job.context

  const metaPrompt = `
      QUAN TRỌNG: HÃY VIẾT CÂU TRẢ LỜI HOÀN TOÀN BẰNG TIẾNG VIỆT.
      Bạn là một tác giả và chuyên gia xây dựng thế giới truyện (world-building expert). Dựa trên ý tưởng cốt lõi và các cài đặt của người dùng, hãy phác thảo toàn bộ nền móng cho một câu chuyện mới.

      **Thông số kỹ thuật do người dùng cung cấp:**
      - Thể loại: ${genres.join(', ')}
      - Cấu trúc viết: ${settings.writingStructure}
      - Quy mô dự kiến: ${settings.chapterCount} chương
      - Số từ trên mỗi chương (ước tính): ${settings.wordsPerChapter}
      - Độ sâu bộ nhớ (tham khảo): ${settings.memoryDepth}/10

      **Ý tưởng cốt lõi của người dùng:**
      "${job.prompt}"

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
  const { storyId, currentContent } = job.context
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
      Dựa vào TOÀN BỘ thông tin bối cảnh được cung cấp, hãy viết phần tiếp theo cho câu chuyện.

      **BỐI CẢNH ĐỂ BẠN SÁNG TÁC:**

      **1. Tóm tắt cốt truyện chính (Kim chỉ nam):**
      ${storySummary}
      **2. Thông tin Lorebook về các thực thể liên quan:**
      ${lorebookContext}
      **3. Ngữ cảnh từ các chương trước (RAG):**
      ${ragContext}
      **4. Vài dòng cuối của nội dung đang viết (dạng văn bản thuần túy):**
      ...${plainTextCurrentContent.slice(-1500)}
      **5. Yêu cầu của tác giả cho cảnh này:**
      "${userPrompt}"
      ---
      Hãy bắt đầu viết. Chỉ trả về phần truyện được viết tiếp, tuân thủ nghiêm ngặt các quy tắc định dạng đã nêu.
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
