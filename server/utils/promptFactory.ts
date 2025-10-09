// Hàm tạo prompt cho việc gợi ý thông tin truyện
async function createStoryDetailsPrompt(job: any): Promise<string> {
  const allGenres = await Genre.find().select('name')
  const genreListString = allGenres.map(g => g.name).join(', ')

  return `
    QUAN TRỌNG: HÃY VIẾT CÂU TRẢ LỜI HOÀN TOÀN BẰNG TIẾNG VIỆT.
    Dựa trên bối cảnh truyện do người dùng cung cấp dưới đây, hãy tạo ra các thông tin sau:
    - title: một tên truyện thật hấp dẫn, ngắn gọn bằng tiếng Việt.
    - description: một đoạn mô tả lôi cuốn bằng tiếng Việt, khoảng 2-3 câu.
    - tags: một mảng chứa 3-5 tag (từ khóa) liên quan nhất, viết bằng tiếng Việt không dấu, chữ thường.
    - genres: một mảng chứa 2-3 thể loại phù hợp nhất từ danh sách sau: ${genreListString}.

    Bối cảnh của người dùng: "${job.prompt}"

    Chỉ trả về một đối tượng JSON hợp lệ, không chứa bất kỳ văn bản nào khác ngoài JSON (không có markdown \`\`\`json).
  `
}

async function createSceneGenerationPrompt(job: any): Promise<string> {
  const { storyId, currentContent } = job.context
  const userPrompt = job.prompt

  const [ragContext, lorebookContext, story] = await Promise.all([
    retrieveSimilarContext(storyId, userPrompt),
    retrieveLorebookContext(storyId, userPrompt),
    Story.findById(storyId).select('prompt')
  ])
  const originalStoryPrompt = story?.prompt

  return `
    QUAN TRỌNG: HÃY VIẾT CÂU TRẢ LỜI HOÀN TOÀN BẰNG TIẾNG VIỆT VÀ CÓ ĐỊNH DẠNG HTML.
    Bạn là một trợ lý viết truyện chuyên nghiệp...
    **1. Ý tưởng/Prompt gốc của toàn bộ truyện:** ${originalStoryPrompt}
    **2. Thông tin Lorebook:** ${lorebookContext}
    **3. Ngữ cảnh từ các chương trước:** ${ragContext}
    **4. Vài dòng cuối của nội dung đang viết:** ...${(currentContent || '').slice(-2000)}
    **Yêu cầu của tác giả:** "${userPrompt}"
    Nhiệm vụ: ... Chỉ trả về phần truyện được viết tiếp dưới dạng HTML...
  `
}

export async function getMetaPrompt(job: any): Promise<string> {
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
