import { embedContent } from '../services/ai'
import mongoose from 'mongoose'

export async function retrieveSimilarContext(storyId: string, userPrompt: string): Promise<string> {
  const queryVector = await embedContent({ prompt: userPrompt })
  if (!queryVector || !Array.isArray(queryVector)) {
    throw new Error('Không thể tạo vector cho prompt người dùng.')
  }

  const storyObjectId = new mongoose.Types.ObjectId(storyId);

  // 4. Tìm kiếm trong MongoDB Atlas bằng $vectorSearch với vector đã được trích xuất
  const similarChunks = await Chunk.aggregate([
    {
      $vectorSearch: {
        index: 'vector_index', // Tên index bạn tạo trên Atlas
        path: 'contentEmbedding',
        queryVector: queryVector, // <-- Sử dụng biến đã được làm sạch
        numCandidates: 100,
        limit: 3,
        filter: {
          storyId: { $eq: storyObjectId }
        }
      }
    }
  ])

  if (!similarChunks || similarChunks.length === 0) {
    return 'Không có ngữ cảnh nào được tìm thấy từ các chương trước.'
  }

  // 5. Nối các kết quả lại thành một đoạn ngữ cảnh
  const context = similarChunks.map(chunk => chunk.chunkText).join('\n---\n')
  console.log('Retrieved similar context:', context)
  return context
}

export async function retrieveLorebookContext(storyId: string, userPrompt: string): Promise<string> {
  // 1. Lấy tất cả các mục trong Lorebook của truyện này song song để tối ưu
  const [characters, factions, locations, realms] = await Promise.all([
    Character.find({ storyId }).select('name description role abilities backstory'),
    Faction.find({ storyId }).select('name ideology description'),
    Location.find({ storyId }).select('name description keyFeatures'),
    CultivationRealm.find({ storyId }).select('name level description')
  ])

  // 2. Tìm các thực thể được nhắc đến trong prompt của người dùng
  const lowerCaseUserPrompt = userPrompt.toLowerCase()
  const mentionedCharacters = characters.filter(c => c.name && lowerCaseUserPrompt.includes(c.name.toLowerCase()))
  const mentionedFactions = factions.filter(f => f.name && lowerCaseUserPrompt.includes(f.name.toLowerCase()))
  const mentionedLocations = locations.filter(l => l.name && lowerCaseUserPrompt.includes(l.name.toLowerCase()))
  const mentionedRealms = realms.filter(r => r.name && lowerCaseUserPrompt.includes(r.name.toLowerCase()))

  // 3. Format thông tin tìm được thành một chuỗi ngữ cảnh rõ ràng cho AI
  const contextParts: string[] = []

  if (mentionedCharacters.length > 0) {
    const charContext = mentionedCharacters.map((char) => {
      const shortDesc = char.description ? char.description.substring(0, 150) + '...' : 'Không có mô tả.'
      const shortBackstory = char.backstory ? char.backstory.substring(0, 150) + '...' : 'Không có tiểu sử.'
      return `- Nhân vật: ${char.name} (Vai trò: ${char.role}).\n  - Mô tả: ${shortDesc}\n  - Tiểu sử: ${shortBackstory}\n  - Kỹ năng: ${char.abilities.join('; ')}.`
    }).join('\n')
    contextParts.push(`### Nhân vật được nhắc đến:\n${charContext}`)
  }

  if (mentionedFactions.length > 0) {
    const factionContext = mentionedFactions.map((faction) => {
      const shortDesc = faction.description ? faction.description.substring(0, 150) + '...' : 'Không có mô tả.'
      return `- Thế lực: ${faction.name} (Tôn chỉ: ${faction.ideology}).\n  - Mô tả: ${shortDesc}`
    }).join('\n')
    contextParts.push(`### Thế lực được nhắc đến:\n${factionContext}`)
  }

  if (mentionedLocations.length > 0) {
    const locationContext = mentionedLocations.map((location) => {
      const shortDesc = location.description ? location.description.substring(0, 150) + '...' : 'Không có mô tả.'
      return `- Địa điểm: ${location.name}.\n  - Mô tả: ${shortDesc}\n  - Đặc điểm chính: ${location.keyFeatures}.`
    }).join('\n')
    contextParts.push(`### Địa điểm được nhắc đến:\n${locationContext}`)
  }

  if (mentionedRealms.length > 0) {
    const realmContext = mentionedRealms.map((realm) => {
      const shortDesc = realm.description ? realm.description.substring(0, 150) + '...' : 'Không có mô tả.'
      return `- Cảnh giới: ${realm.name} (Cấp độ: ${realm.level}).\n  - Mô tả: ${shortDesc}`
    }).join('\n')
    contextParts.push(`### Cảnh giới được nhắc đến:\n${realmContext}`)
  }

  if (contextParts.length === 0) {
    return 'Không có thông tin Lorebook cụ thể nào được nhắc đến trong yêu cầu.'
  }

  return contextParts.join('\n\n')
}
