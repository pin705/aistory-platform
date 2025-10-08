import CryptoJS from 'crypto-js'
import { GoogleGenAI } from '@google/genai'
import { getMetaPrompt } from './promptFactory' // Chúng ta vẫn dùng promptFactory để quản lý prompt tập trung

/**
 * Xử lý job tạo chi tiết truyện (title, description...)
 */
export async function runAiGenerationJob(jobId: string) {
  const job = await AiJob.findById(jobId);
  if (!job) { console.error(`Job not found: ${jobId}`); return; }

  try {
    job.status = 'processing';
    await job.save();

    const apiKeyRecord = await ApiKey.findOne({ userId: job.userId, provider: 'gemini' });
    if (!apiKeyRecord) throw new Error('Không tìm thấy API Key của Gemini.');
    const decryptedKey = CryptoJS.AES.decrypt(apiKeyRecord.encryptedKey, process.env.CRYPTO_SECRET!).toString(CryptoJS.enc.Utf8);
    if (!decryptedKey) throw new Error("Lỗi giải mã key.");

    // Lấy metaPrompt từ nhà máy prompt
    const metaPrompt = await getMetaPrompt(job);

    // --- (CẬP NHẬT) GỌI GEMINI API THEO CÚ PHÁP MỚI ---
    // 1. Khởi tạo client
    const genAI = new GoogleGenAI({ apiKey: decryptedKey });

    // 2. Gọi API trực tiếp
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: metaPrompt,
    });

    // 3. Lấy kết quả text trực tiếp
    const rawText = result.text;
    // --- KẾT THÚC CẬP NHẬT ---

    const jsonMatch = rawText?.match(/{[\s\S]*}/);
    if (!jsonMatch) throw new Error("AI trả về dữ liệu không đúng định dạng.");

    job.status = 'completed';
    job.result = JSON.parse(jsonMatch[0]);
    job.completedAt = new Date();
    await job.save();

  } catch (error: any) {
    console.error(`AI Job (generate_story_details) failed for jobId ${jobId}:`, error);
    job.status = 'failed';
    job.error = error.message;
    job.completedAt = new Date();
    await job.save();
  }
}


/**
 * Xử lý job tạo nội dung cho chương truyện
 */
export async function runSceneGenerationJob(jobId: string) {
  const job = await AiJob.findById(jobId);
  if (!job) { console.error(`Job not found: ${jobId}`); return; }

  try {
    job.status = 'processing';
    await job.save();

    const apiKeyRecord = await ApiKey.findOne({ userId: job.userId, provider: 'gemini' });
    if (!apiKeyRecord) throw new Error('Không tìm thấy API Key của Gemini.');
    const decryptedKey = CryptoJS.AES.decrypt(apiKeyRecord.encryptedKey, process.env.CRYPTO_SECRET!).toString(CryptoJS.enc.Utf8);
    if (!decryptedKey) throw new Error("Lỗi giải mã key.");

    const metaPrompt = await getMetaPrompt(job);

    // --- (CẬP NHẬT) GỌI GEMINI API THEO CÚ PHÁP MỚI ---
    // 1. Khởi tạo client
    const genAI = new GoogleGenAI({ apiKey: decryptedKey });


    // 2. Gọi API trực tiếp
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: metaPrompt,
    });

    // 3. Lấy kết quả text trực tiếp
    const rawText = result.text || '';

    // (FIX) Dọn dẹp Markdown bao quanh HTML
    // Tìm vị trí của thẻ HTML đầu tiên '<' và cuối cùng '>'
    const firstTagIndex = rawText.indexOf('<');
    const lastTagIndex = rawText.lastIndexOf('>');

    let cleanHtml = rawText; // Mặc định là chuỗi gốc
    // Nếu tìm thấy cả hai, trích xuất phần nội dung HTML
    if (firstTagIndex !== -1 && lastTagIndex !== -1) {
      cleanHtml = rawText.substring(firstTagIndex, lastTagIndex + 1).trim();
    }

    job.status = 'completed';
    job.result = { generatedText: cleanHtml };
    job.completedAt = new Date();
    await job.save();

  } catch (error: any) {
    console.error(`AI Job (generate_scene) failed for jobId ${jobId}:`, error);
    job.status = 'failed';
    job.error = error.message;
    job.completedAt = new Date();
    await job.save();
  }
}
