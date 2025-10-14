import { generateContent } from '../services/ai'

export async function runAiGenerationFullPostJob(jobId: string) {
  const job = await AiJob.findById(jobId)
  if (!job) { console.error(`Job not found: ${jobId}`); return }

  try {
    job.status = 'processing'
    await job.save()

    const metaPrompt = await getMetaPrompt(job)
    const rawText = await generateContent({
      userId: job.userId.toString(),
      prompt: metaPrompt
    })

    const jsonMatch = rawText?.match(/{[\s\S]*}/)
    if (!jsonMatch) throw new Error('AI trả về dữ liệu không đúng định dạng.')

    const generatedData = JSON.parse(jsonMatch[0])

    // LƯU VÀO DATABASE
    const newStory = await Story.create({
      ...generatedData.story,
      prompt: job.prompt,
      author: job.userId,
      status: 'draft',
      summary: generatedData.story.description || job.prompt.substring(0, 200) + '...'
    })
    const storyId = newStory._id
    await Promise.all([
      Character.insertMany(generatedData.characters.map((c: any) => ({ ...c, storyId }))),
      Faction.insertMany(generatedData.factions.map((f: any) => ({ ...f, storyId }))),
      CultivationRealm.insertMany(generatedData.realms.map((r: any) => ({ ...r, storyId })))
    ])

    job.status = 'completed'
    // Chỉ lưu ID của truyện mới tạo vào kết quả
    job.result = { newStoryId: newStory._id, newStoryTitle: newStory.title }
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
