import { getMetaPrompt } from './promptFactory' // Chúng ta vẫn dùng promptFactory để quản lý prompt tập trung
import { generateContent } from '../services/ai'

export async function runAiGenerationFullPostJob(jobId: string) {
  const job = await AiJob.findById(jobId)
  if (!job) { console.error(`Job not found: ${jobId}`); return }

  try {
    job.status = 'processing'
    await job.save()

    const metaPrompt = await getMetaPrompt(job)
    const { rawText, model } = await generateContent({
      userId: job.userId.toString(),
      prompt: metaPrompt,
      jobType: 'generate_story_details'
    })

    console.log('AI Raw Response:', rawText) // Ghi log phản hồi thô để kiểm tra
    const jsonMatch = rawText?.match(/{[\s\S]*}/)
    if (!jsonMatch) throw new Error('AI trả về dữ liệu không đúng định dạng.')

    const generatedData = JSON.parse(jsonMatch[0])

    // LƯU VÀO DATABASE
    const newStory = await Story.create({
      ...generatedData.story,
      prompt: job.prompt,
      author: job.userId,
      status: 'draft',
      summary: generatedData.story.description || job.prompt.substring(0, 200) + '...',
      modelUsed: model,
      settings: job?.context?.settings || {}
    })
    const storyId = newStory._id
    await Promise.all([
      Character.insertMany(generatedData.characters.map((c: any) => ({ ...c, storyId }))),
      Faction.insertMany(generatedData.factions.map((f: any) => ({ ...f, storyId }))),
      CultivationRealm.insertMany(generatedData.realms.map((r: any) => ({ ...r, storyId }))),
      Location.insertMany(generatedData.locations.map((l: any) => ({ ...l, storyId })))
    ])

    job.status = 'completed'
    // Chỉ lưu ID của truyện mới tạo vào kết quả
    job.result = { generatedData: generatedData }
    job.completedAt = new Date()
    await job.save()
  } catch (error: any) {
    console.error(`AI Job (generate_story_details) failed for jobId ${jobId}:`, error)
    job.status = 'failed'
    job.error = error.message
    job.completedAt = new Date()
    await job.save()
  }
}

/**
 * Xử lý job tạo nội dung cho chương truyện
 */
export async function runSceneGenerationJob(jobId: string) {
  const job = await AiJob.findById(jobId)
  if (!job) { console.error(`Job not found: ${jobId}`); return }

  try {
    job.status = 'processing'
    await job.save()

    const metaPrompt = await getMetaPrompt(job)

    const { rawText } = await generateContent({
      userId: job.userId,
      prompt: metaPrompt,
      jobType: 'generate_scene'
    })

    // (FIX) Dọn dẹp Markdown bao quanh HTML
    // Tìm vị trí của thẻ HTML đầu tiên '<' và cuối cùng '>'
    const firstTagIndex = rawText.indexOf('<')
    const lastTagIndex = rawText.lastIndexOf('>')

    let cleanHtml = rawText // Mặc định là chuỗi gốc
    // Nếu tìm thấy cả hai, trích xuất phần nội dung HTML
    if (firstTagIndex !== -1 && lastTagIndex !== -1) {
      cleanHtml = rawText.substring(firstTagIndex, lastTagIndex + 1).trim()
    }

    job.status = 'completed'
    job.result = { generatedText: cleanHtml }
    job.completedAt = new Date()
    await job.save()
  } catch (error: any) {
    console.error(`AI Job (generate_scene) failed for jobId ${jobId}:`, error)
    job.status = 'failed'
    job.error = error.message
    job.completedAt = new Date()
    await job.save()
  }
}
