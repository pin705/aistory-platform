
import { GoogleGenAI } from '@google/genai'

export async function retrieveSimilarContext(storyId: string, userPrompt: string): Promise<string> {
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

export async function retrieveLorebookContext(storyId: string, userPrompt: string): Promise<string> {
  // 1. Lấy tất cả các nhân vật của truyện
  const characters = await Character.find({ storyId }).select('name description role abilities backstory')

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
    `- Nhân vật: ${char.name} (Vai trò: ${char.role}). Mô tả: ${char.description}. Tiểu sử: ${char.backstory}. Kỹ năng, công pháp, vũ khí: ${char.abilities}...`
  ).join('\n')

  return context
}
