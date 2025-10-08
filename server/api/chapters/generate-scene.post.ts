import { GoogleGenAI } from '@google/genai'
import CryptoJS from 'crypto-js'


async function retrieveSimilarContext(storyId: string, userPrompt: string): Promise<string> {
  const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_SERVER_API_KEY! });
  const promptEmbeddingResult = await genAI.models.embedContent({
    model: "text-embedding-004",
    contents: [userPrompt]
  });

  // 3. (QUAN TRỌNG) Trích xuất mảng vector thuần túy
  const queryVector = promptEmbeddingResult.embeddings?.[0]?.values;

  // Kiểm tra để chắc chắn đã lấy được vector
  if (!queryVector || !Array.isArray(queryVector)) {
    throw new Error("Không thể tạo vector cho prompt người dùng.");
  }

  console.log("Vector trích xuất:", queryVector);
  // 4. Tìm kiếm trong MongoDB Atlas bằng $vectorSearch với vector đã được trích xuất
  const similarChunks = await Chunk.aggregate([
    {
      $vectorSearch: {
        index: "default", // Tên index bạn tạo trên Atlas
        path: "contentEmbedding",
        queryVector: queryVector, // <-- Sử dụng biến đã được làm sạch
        numCandidates: 100,
        limit: 3,
        filter: {
          storyId: { $eq: storyId }
        }
      }
    }
  ]);

  if (!similarChunks || similarChunks.length === 0) {
    return "Không có ngữ cảnh nào được tìm thấy từ các chương trước.";
  }

  // 5. Nối các kết quả lại thành một đoạn ngữ cảnh
  const context = similarChunks.map(chunk => chunk.chunkText).join('\n---\n');
  return context;
}

async function retrieveLorebookContext(storyId: string, userPrompt: string): Promise<string> {
  // 1. Lấy tất cả các nhân vật của truyện
  const characters = await Character.find({ storyId }).select('name description role')

  if (characters.length === 0) {
    return "Không có thông tin nhân vật nào trong Lorebook."
  }

  // 2. Tìm xem nhân vật nào được nhắc đến trong prompt
  const mentionedCharacters = characters.filter(char =>
    userPrompt.toLowerCase().includes(char?.name?.toLowerCase())
  )

  if (mentionedCharacters.length === 0) {
    return "Không có nhân vật cụ thể nào được nhắc đến trong yêu cầu."
  }

  // 3. Format thông tin của các nhân vật được nhắc đến
  const context = mentionedCharacters.map(char =>
    `- Nhân vật: ${char.name} (Vai trò: ${char.role}). Mô tả: ${char.description}`
  ).join('\n')

  return context
}

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const { storyId, currentContent, userPrompt } = await readBody(event)

  if (!storyId || !userPrompt) {
    throw createError({ statusCode: 400, statusMessage: 'Thiếu thông tin truyện hoặc yêu cầu.' })
  }

  // Lấy và giải mã API key của người dùng
  const apiKeyRecord = await ApiKey.findOne({ userId: session.user.id, provider: 'gemini' });
  if (!apiKeyRecord) {
    throw createError({ statusCode: 400, statusMessage: 'Vui lòng thêm API Key của Gemini trong Cài đặt.' });
  }
  let decryptedKey: string;
  try {
    const bytes = CryptoJS.AES.decrypt(apiKeyRecord.encryptedKey, process.env.CRYPTO_SECRET!);
    decryptedKey = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedKey) throw new Error("Decryption failed");
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: 'Không thể giải mã API key.' });
  }

  try {
    const story = await Story.findById(storyId).select('prompt')
    if (!story) {
      throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy truyện.' })
    }
    const originalStoryPrompt = story.prompt

    const ragContext = await retrieveSimilarContext(storyId, userPrompt);
    const lorebookContext = await retrieveLorebookContext(storyId, userPrompt);
    const genAI = new GoogleGenAI({ apiKey: decryptedKey });
    // Sử dụng model mạnh mẽ nhất cho việc sáng tác truyện

    const finalPrompt = `
      QUAN TRỌNG: HÃY VIẾT CÂU TRẢ LỜI HOÀN TOÀN BẰNG TIẾNG VIỆT.

      Bạn là một trợ lý viết truyện chuyên nghiệp. Nhiệm vụ của bạn là viết tiếp một câu chuyện dựa trên tất cả các thông tin được cung cấp.

      **1. Ý tưởng/Prompt gốc của toàn bộ truyện (Kim chỉ nam):**
      ${originalStoryPrompt}

      **2. Thông tin về thế giới và nhân vật (Lorebook):**
      ${lorebookContext}

      **3. Ngữ cảnh từ các chương trước (do hệ thống tìm kiếm cung cấp):**
      ${ragContext}

      **4. Vài dòng cuối của nội dung đang viết (để đảm bảo sự liền mạch):**
      ...${(currentContent || '').slice(-1000)}

      **Yêu cầu của tác giả cho cảnh tiếp theo:** "${userPrompt}"

      Nhiệm vụ: Dựa vào TẤT CẢ các thông tin trên, hãy viết phần tiếp theo cho câu chuyện một cách tự nhiên và sáng tạo. Chỉ trả về phần truyện được viết tiếp, không thêm lời chào, tóm tắt, hay bất kỳ lời giải thích nào khác.
    `
    // BƯỚC 4: GỌI API VÀ TRẢ VỀ KẾT QUẢ
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: finalPrompt,
    });

    return { generatedText: result.text }

  } catch (error: any) {
    console.error('Lỗi Gemini API:', error);
    if (error.message.includes('API key not valid')) {
      throw createError({ statusCode: 400, statusMessage: 'API Key của Gemini không hợp lệ.' });
    }
    throw createError({ statusCode: 500, statusMessage: 'AI không thể tạo gợi ý lúc này.' });
  }
})
