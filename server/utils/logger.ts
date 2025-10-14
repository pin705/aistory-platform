interface TokenUsageDetails {
  userId: string
  jobType: string
  provider: 'gemini' | 'openai' | 'groq'
  modelName: string
  promptTokenCount?: number
  candidatesTokenCount?: number
  totalTokenCount: number
}

/**
 * Ghi lại thông tin sử dụng token dưới dạng JSON vào console.
 * Trong production, console log này có thể được chuyển hướng vào file.
 */
export function logTokenUsage(details: TokenUsageDetails) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'INFO',
    message: 'AI Token Usage',
    details
  }

  // Dùng console.log để in ra, các công cụ như PM2 có thể thu thập log này
  console.log(JSON.stringify(logEntry))
}
