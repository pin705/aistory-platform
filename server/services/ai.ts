import CryptoJS from 'crypto-js'
import { GoogleGenAI } from '@google/genai'
import { Groq } from 'groq-sdk'

// Định nghĩa kiểu dữ liệu cho options
interface GenerateContentOptions {
  userId: string
  prompt: string
  modelName?: string // Tên model cụ thể, ví dụ 'gemini-1.5-pro-latest'
}

/**
 * Hàm trung tâm để giao tiếp với các dịch vụ AI.
 * Nó tự động lấy và giải mã API key, sau đó gọi đến provider tương ứng.
 */
export async function generateContent(options: GenerateContentOptions): Promise<string> {
  const { userId, prompt, modelName } = options

  // 1. Lấy và giải mã API key
  const apiKeyRecord = await ApiKey.findOne({ userId, isActive: true })
  if (!apiKeyRecord) {
    throw new Error(`Không tìm thấy API Key cho nhà cung cấp ${apiKeyRecord?.provider}.`)
  }
  const decryptedKey = CryptoJS.AES.decrypt(apiKeyRecord.encryptedKey, process.env.CRYPTO_SECRET!).toString(CryptoJS.enc.Utf8)
  if (!decryptedKey) {
    throw new Error('Lỗi giải mã API key.')
  }

  // 2. Gọi đến provider tương ứng
  switch (apiKeyRecord?.provider.toString()) {
    case 'gemini':
      try {
        const genAI = new GoogleGenAI({ apiKey: decryptedKey })

        const result = await genAI.models.generateContent({
          model: modelName || apiKeyRecord.apiModel?.toString() || 'gemini-2.5-flash',
          contents: prompt
        })
        return result.text || ''
      } catch (error) {
        // Ném lỗi cụ thể hơn để dễ debug
        throw new Error(`Lỗi từ Gemini API: ${error.message}`)
      }
    case 'groq':
      try {
        const groq = new Groq()
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: 'user',
              content: ''
            }
          ],
          model: modelName || apiKeyRecord.apiModel?.toString() || 'llama-3.1-8b-instant',
          temperature: 1,
          max_completion_tokens: 1024,
          top_p: 1,
          stream: false,
          stop: null
        })

        return chatCompletion.choices[0].message.content || ''
      } catch (error) {
        throw new Error(`Lỗi từ Groq API: ${error.message}`)
      }
    default:
      throw new Error(`Nhà cung cấp không được hỗ trợ: ${provider}`)
  }
}
