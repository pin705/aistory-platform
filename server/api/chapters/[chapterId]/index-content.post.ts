import { GoogleGenAI } from '@google/genai'
import { convert } from 'html-to-text'

// Hàm tiện ích để chia nhỏ văn bản
function splitTextIntoChunks(text: string, chunkSize = 500, overlap = 50): string[] {
  const chunks = []
  let i = 0
  while (i < text.length) {
    chunks.push(text.substring(i, i + chunkSize))
    i += chunkSize - overlap
  }
  return chunks
}

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const chapterId = event.context.params?.chapterId as string

  const chapter = await Chapter.findById(chapterId)
  if (!chapter) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy chương' })
  }

  const plainText = convert(chapter.content.toString())

  // 1. Chia nhỏ nội dung chương
  const textChunks = splitTextIntoChunks(plainText)

  if (textChunks.length === 0) {
    return { message: 'Không có nội dung để index.' }
  }

  // 2. Tạo embedding cho tất cả các chunk
  const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_SERVER_API_KEY! })

  const embeddingResult = await genAI.models.embedContent({
    model: 'text-embedding-004',
    contents: textChunks.map(chunk => (chunk))
  })

  const embeddings = embeddingResult.embeddings

  // 3. Chuẩn bị dữ liệu để lưu vào DB
  const chunkObjects = textChunks.map((chunkText, index) => ({
    storyId: chapter.storyId,
    chapterId: chapter._id,
    chunkText,
    contentEmbedding: embeddings?.[index]?.values
  }))

  // 4. Xóa các chunk cũ và thêm chunk mới (Upsert)
  await Chunk.deleteMany({ chapterId: chapter._id })
  await Chunk.insertMany(chunkObjects)

  return { message: `Đã index thành công ${chunkObjects.length} chunks.` }
})
