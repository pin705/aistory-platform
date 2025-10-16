export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const { storyId, currentContent, userPrompt } = await readBody(event)

  if (!storyId || !userPrompt) {
    throw createError({ statusCode: 400, statusMessage: 'Thiếu thông tin truyện hoặc yêu cầu.' })
  }

  const story = await Story.findById(storyId).select('settings')
  // 1. Tạo Job mới trong DB
  const job = await AiJob.create({
    userId: session.user.id,
    jobType: 'generate_scene',
    prompt: userPrompt,
    context: {
      storyId,
      currentContent,
      settings: story?.settings || {}
    },
    status: 'pending'
  })

  // 2. Kích hoạt tác vụ nền (fire-and-forget) để không làm client phải chờ
  runSceneGenerationJob(job._id)

  // 3. Trả về Job ID ngay lập tức cho client
  return { jobId: job._id }
})
