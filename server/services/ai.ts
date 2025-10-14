import CryptoJS from 'crypto-js'
import { GoogleGenAI } from '@google/genai'
import { Groq } from 'groq-sdk'

// Định nghĩa kiểu dữ liệu cho options
interface GenerateContentOptions {
  userId: string
  prompt: string
  modelName?: string // Tên model cụ thể, ví dụ 'gemini-1.5-pro-latest'
  jobType: string // Loại công việc, ví dụ 'generate_story_details'
}

/**
 * Hàm trung tâm để giao tiếp với các dịch vụ AI.
 * Nó tự động lấy và giải mã API key, sau đó gọi đến provider tương ứng.
 */
export async function generateContent(options: GenerateContentOptions): Promise<string> {
  const { userId, prompt, modelName, jobType } = options

  // 1. Lấy và giải mã API key
  const apiKeyRecord = await ApiKey.findOne({ userId, isActive: true })
  if (!apiKeyRecord) {
    throw new Error(`Không tìm thấy API Key cho nhà cung cấp ${apiKeyRecord?.provider}.`)
  }
  const decryptedKey = CryptoJS.AES.decrypt(apiKeyRecord.encryptedKey, process.env.CRYPTO_SECRET!).toString(CryptoJS.enc.Utf8)
  if (!decryptedKey) {
    throw new Error('Lỗi giải mã API key.')
  }

  const provider = apiKeyRecord.provider.toString() // 'gemini' hoặc 'groq'
  // 2. Gọi đến provider tương ứng
  switch (apiKeyRecord?.provider.toString()) {
    case 'gemini':
      try {
        const genAI = new GoogleGenAI({ apiKey: decryptedKey })

        const result = await genAI.models.generateContent({
          model: modelName || apiKeyRecord.apiModel?.toString() || 'gemini-2.5-flash',
          contents: prompt
        })

        const usageMetadata = result.usageMetadata
        if (usageMetadata) {
          logTokenUsage({
            userId,
            jobType, // Hoặc một tên cụ thể hơn nếu có
            provider,
            modelName,
            promptTokenCount: usageMetadata.promptTokenCount,
            candidatesTokenCount: usageMetadata.candidatesTokenCount,
            totalTokenCount: usageMetadata.totalTokenCount
          })
        }

        return result.text || ''
      } catch (error) {
        // Ném lỗi cụ thể hơn để dễ debug
        throw new Error(`Lỗi từ Gemini API: ${error.message}`)
      }
    case 'groq':
      try {
        const groq = new Groq({
          apiKey: decryptedKey
        })

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          model: modelName || apiKeyRecord.apiModel?.toString() || 'llama-3.1-8b-instant',
          temperature: 1,
          max_completion_tokens: 1024,
          top_p: 1,
          stream: false,
          stop: null
        })

        console.log('chatCompletion', chatCompletion)
        const usageMetadata = chatCompletion.usage
        if (usageMetadata) {
          logTokenUsage({
            userId,
            jobType, // Hoặc một tên cụ thể hơn nếu có
            provider,
            modelName,
            promptTokenCount: usageMetadata.prompt_tokens,
            candidatesTokenCount: usageMetadata.completion_tokens,
            totalTokenCount: usageMetadata.total_tokens
          })
        }

        return chatCompletion.choices[0].message.content || ''
      } catch (error) {
        throw new Error(`Lỗi từ Groq API: ${error.message}`)
      }
    default:
      throw new Error(`Nhà cung cấp không được hỗ trợ: ${provider}`)
  }
}

export async function embedContent(options: { prompt: string }): Promise<number[]> {
  const { prompt } = options
  const modelName = 'text-embedding-004'

  // Sử dụng API key của server để tạo embedding
  const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_SERVER_API_KEY! })

  const result = await genAI.models.embedContent({
    model: modelName,
    contents: prompt
  })

  const embedding = result.embeddings?.[0]
  if (!embedding || !embedding.values) {
    throw new Error('Không thể tạo vector embedding.')
  }

  return embedding.values
}
