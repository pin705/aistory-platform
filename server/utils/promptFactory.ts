// Hàm tạo prompt cho việc gợi ý thông tin truyện
async function createStoryDetailsPrompt(job): Promise<string> {
  const metaPrompt = `
      QUAN TRỌNG: HÃY VIẾT CÂU TRẢ LỜI HOÀN TOÀN BẰNG TIẾNG VIỆT.
      Bạn là một tác giả và chuyên gia xây dựng thế giới truyện (world-building expert). Dựa trên ý tưởng cốt lõi của người dùng, hãy phác thảo toàn bộ nền móng cho một câu chuyện mới.

      **Ý tưởng cốt lõi của người dùng:**
      "${job.prompt}"

      **Nhiệm vụ:**
      Hãy tạo ra một cấu trúc JSON duy nhất, hợp lệ (không có markdown) chứa tất cả các thông tin sau:

      1. "story": một object chứa "title" (tên truyện), "description" (mô tả), "tags" (mảng 3-5 tag), và "genres" (mảng 2-3 thể loại).

      2. "characters": một mảng chứa 3-5 nhân vật quan trọng (chính, phản diện, phụ), mỗi nhân vật là một object có "name", "role", "description", "backstory", và "abilities" (mảng các chuỗi).

      3. "factions": một mảng chứa 2-3 thế lực/môn phái chính, mỗi thế lực là một object có "name", "ideology", và "description".

      4. "realms": một mảng chứa 5-7 cảnh giới tu luyện đầu tiên, mỗi cảnh giới là một object có "name", "level" (BẮT BUỘC LÀ MỘT CON SỐ - NUMBER), và "description".

      5. "locations": một mảng chứa 2-3 địa danh quan trọng, mỗi địa danh là một object có "name", "description", và "keyFeatures" (các đặc điểm nổi bật).
    `

  return metaPrompt
}

async function createSceneGenerationPrompt(job: any): Promise<string> {
  const { storyId, currentContent } = job.context
  const userPrompt = job.prompt

  // (CẬP NHẬT) Giờ đây chúng ta lấy `summary` thay vì `prompt`
  const [ragContext, lorebookContext, story] = await Promise.all([
    retrieveSimilarContext(storyId, userPrompt),
    retrieveLorebookContext(storyId, userPrompt),
    Story.findById(storyId).select('summary') // <-- Chỉ lấy summary
  ])
  const storySummary = story?.summary || 'Không có tóm tắt.'

  return `
    QUAN TRỌNG: HÃY VIẾT CÂU TRẢ LỜI HOÀN TOÀN BẰNG TIẾNG VIỆT VÀ CÓ ĐỊNH DẠNG HTML.
    Bạn là một trợ lý viết truyện chuyên nghiệp...

    **1. Tóm tắt cốt truyện chính (Kim chỉ nam):** ${storySummary}

    **2. Thông tin Lorebook:** ${lorebookContext}

    **3. Ngữ cảnh từ các chương trước:** ${ragContext}

    **4. Vài dòng cuối của nội dung đang viết:** ...${(currentContent || '').slice(-1500)}

    **Yêu cầu của tác giả:** "${userPrompt}"

    Nhiệm vụ: ... Chỉ trả về phần truyện được viết tiếp dưới dạng HTML...
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
