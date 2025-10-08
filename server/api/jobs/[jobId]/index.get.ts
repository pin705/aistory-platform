export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const jobId = event.context.params?.jobId as string

  const job = await AiJob.findById(jobId)

  // Kiểm tra quyền sở hữu
  if (!job || job.userId.toString() !== session.user.id) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy công việc.' })
  }

  return {
    status: job.status,
    result: job.result,
    error: job.error,
  }
})
