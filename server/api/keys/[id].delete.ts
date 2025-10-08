export default defineEventHandler(async (event) => {
     await requireUserSession(event)
  const session = await getUserSession(event)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const keyId = event.context.params?.id
  await ApiKey.findOneAndDelete({ _id: keyId, userId: session.user.id })

  return { success: true }
})
