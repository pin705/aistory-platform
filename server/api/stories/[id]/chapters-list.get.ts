export default defineEventHandler(async (event) => {
  const storyId = event.context.params?.id as string
  await requireUserSession(event)

  const chapters = await Chapter.find({ storyId })
    .sort({ chapterNumber: 1 })
    .select('_id title chapterNumber status')

  return chapters
})
