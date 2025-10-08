import CryptoJS from 'crypto-js'
// (MỚI) Import thư viện mới
import { GoogleGenAI } from '@google/genai'
const ai = new GoogleGenAI({});

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const { prompt } = await readBody(event)

  if (!prompt || prompt.length < 50) {
    throw createError({ statusCode: 400, statusMessage: 'Bối cảnh truyện phải đủ chi tiết.' })
  }

  // Lấy và giải mã API key (giữ nguyên)
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

  // --- (NÂNG CẤP) GỌI GEMINI API BẰNG THƯ VIỆN MỚI ---
  try {
    // 1. Khởi tạo client với API key
    const genAI = new GoogleGenAI({ apiKey: decryptedKey });

    const metaPrompt = `
      Dựa trên bối cảnh truyện do người dùng cung cấp dưới đây, hãy tạo ra các thông tin sau:
      - title: một tên truyện thật hấp dẫn, ngắn gọn bằng tiếng Việt.
      - description: một đoạn mô tả lôi cuốn bằng tiếng Việt, khoảng 2-3 câu.
      - tags: một mảng chứa 3-5 tag (từ khóa) liên quan nhất, viết bằng tiếng Việt không dấu, chữ thường.
      - genres: một mảng chứa 2-3 thể loại phù hợp nhất từ danh sách sau: Tiên Hiệp, Huyền Huyễn, Đô Thị, Hệ Thống, Khoa Huyễn, Võng Du, Lịch Sử, Trọng Sinh.

      Bối cảnh của người dùng: "${prompt}"

      QUAN TRỌNG: Chỉ trả về một đối tượng JSON hợp lệ, không chứa bất kỳ văn bản nào khác ngoài JSON (không có markdown \`\`\`json).
    `;

    // 4. Gọi hàm `generateContent` với cấu trúc mới
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: metaPrompt,
    });

    const rawText = result.text ?? ''
    const jsonMatch = rawText.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      console.error("Không tìm thấy JSON hợp lệ trong phản hồi của AI:", rawText);
      throw new Error("AI đã trả về dữ liệu không đúng định dạng.");
    }

    const jsonString = jsonMatch[0];

    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Lỗi parse JSON từ AI:", rawText);
      throw new Error("AI đã trả về dữ liệu không hợp lệ.");
    }

  } catch (error: any) {
    console.error('Lỗi Gemini API:', error);
    if (error.message.includes('API key not valid')) {
      throw createError({ statusCode: 400, statusMessage: 'API Key của Gemini không hợp lệ. Vui lòng kiểm tra lại.' });
    }
    // Lỗi 404 Not Found giờ đây rõ ràng hơn là do model không tồn tại hoặc sai tên
    if (error.message.includes('404')) {
      throw createError({ statusCode: 404, statusMessage: 'Model Gemini không được tìm thấy. Vui lòng kiểm tra lại tên model.' });
    }
    throw createError({ statusCode: 500, statusMessage: 'AI không thể tạo gợi ý lúc này. Vui lòng thử lại sau.' });
  }
})
