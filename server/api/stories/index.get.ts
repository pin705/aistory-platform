// file: server/api/stories/index.get.ts

export default defineEventHandler(async (event) => {
  const realStories = await Story.find({ status: 'published' }).populate('author', 'username')
  return realStories
})
