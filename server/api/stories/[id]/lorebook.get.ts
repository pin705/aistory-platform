export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const storyId = event.context.params?.id as string

  // Chạy song song các query để tối ưu tốc độ
  const [characters, factions, realms, locations] = await Promise.all([
    Character.find({ storyId }).select('name role'),
    Faction.find({ storyId }).select('name ideology'),
    CultivationRealm.find({ storyId }).select('name level').sort({ level: 1 }),
    Location.find({ storyId }).select('name')
  ])

  return {
    characters,
    factions,
    realms,
    locations
  }
})
