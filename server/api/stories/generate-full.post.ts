export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const { prompt, settings, genres } = await readBody(event)

  // 1. Tạo một job mới trong DB
  const newJob = await AiJob.create({
    userId: session.user.id,
    jobType: 'generate_story_details',
    status: 'pending',
    prompt,
    context: {
      settings,
      genres
    }
  })

  // 2. Kích hoạt job ở chế độ "fire-and-forget" (không cần await)
  runAiGenerationFullPostJob(newJob._id.toString())

  // 3. Trả về jobId cho client ngay lập tức
  return { jobId: newJob._id }
})
