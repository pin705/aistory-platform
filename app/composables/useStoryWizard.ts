interface StoryData {
  _id?: string
  genres: string[]
  prompt: string
  title: string
  description: string
  tags: string
  settings: {
    writingStructure: 'structured' | 'open'
    chapterCount: number
    memoryDepth: number
    wordsPerChapter: number
    writingStyle: string
    tone: string
    languageComplexity: 'simple' | 'moderate' | 'complex'
    targetAgeGroup: '12+' | '16+' | '18+'
    emotionalElements: string[]
    humorElements: string[]
  }
  characters: any[]
  factions: any[]
  realms: any[]
}

export const useStoryWizard = () => {
  const toast = useToast()
  const router = useRouter()

  const isLoading = ref(false)
  const isGenerating = ref(false)
  const currentStep = ref(1)
  const highestStep = ref(1)

  const { data: genresFromAPI, refresh: refreshGenres } = useFetch<string[]>('/api/genres', { default: () => [] })

  const storyData = reactive<StoryData>({
    _id: undefined,
    genres: [],
    prompt: '',
    title: '',
    description: '',
    tags: '',
    settings: {
      writingStructure: 'structured',
      chapterCount: 50,
      memoryDepth: 5,
      wordsPerChapter: 300,
      writingStyle: 'Tả thực, Tập trung vào nội tâm',
      tone: 'Trung tính',
      languageComplexity: 'moderate',
      targetAgeGroup: '16+',
      emotionalElements: [],
      humorElements: []
    },
    characters: [],
    factions: [],
    realms: []
  })

  function resetWizard() {
    currentStep.value = 1
    highestStep.value = 1
    Object.assign(storyData, {
      genres: [], prompt: '', title: '', description: '', tags: '',
      settings: { writingStructure: 'structured', chapterCount: 50, memoryDepth: 5, writingStyle: 'Tả thực, Tập trung vào nội tâm',
        tone: 'Trung tính',
        languageComplexity: 'moderate',
        targetAgeGroup: '16+',
        emotionalElements: [],
        humorElements: [] },
      characters: [], factions: [], realms: []
    })
  }

  const canProceed = computed(() => {
    if (currentStep.value === 1) return storyData.genres.length > 0
    if (currentStep.value === 2) return storyData.prompt.length > 50
    if (currentStep.value === 3) return true
    if (currentStep.value === 4) return !isGenerating.value
    return true
  })

  watch(currentStep, (newStep) => {
    if (newStep > highestStep.value) {
      highestStep.value = newStep
    }
  })

  async function nextStep() {
    if (!canProceed.value) return
    if (currentStep.value === 3) { // Chuyển từ Cài đặt Kỹ thuật -> AI Phác thảo
      currentStep.value++
      isGenerating.value = true
      try {
        const { jobId } = await $fetch('/api/stories/generate-full', {
          method: 'POST',
          body: {
            prompt: storyData.prompt,
            genres: storyData.genres,
            settings: storyData.settings
          }
        })
        pollForJobResult(jobId)
      } catch (e: any) {
        toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'red' })
        currentStep.value--
        isGenerating.value = false
      }
    } else if (currentStep.value < 5) {
      currentStep.value++
    }
  }

  function pollForJobResult(jobId: string, timeout = 180000) {
    const interval = setInterval(async () => {
      try {
        const response = await $fetch(`/api/jobs/${jobId}`)
        if (response.status === 'completed') {
          clearInterval(interval)
          const result = response.result?.generatedData
          const story = result?.story || {}
          storyData._id = story._id
          storyData.title = story.title
          storyData.description = story.description
          storyData.tags = story.tags.join(', ')
          storyData.genres = story.genres
          storyData.characters = result.characters
          storyData.factions = result.factions
          storyData.realms = result.realms
          isGenerating.value = false
          toast.add({ title: 'AI đã phác thảo xong!', icon: 'i-heroicons-check-circle' })
        } else if (response.status === 'failed') {
          clearInterval(interval)
          toast.add({ title: 'Lỗi từ AI!', description: response.error, color: 'error' })
          isGenerating.value = false
          currentStep.value--
        }
      } catch (error) {
        console.log('error', error)
        clearInterval(interval)
        toast.add({ title: 'Lỗi!', description: 'Không thể kiểm tra trạng thái công việc.', color: 'error' })
        isGenerating.value = false
        currentStep.value--
      }
    }, 5000)
  }

  function prevStep() { if (currentStep.value > 1) currentStep.value-- }

  function toggleGenre(genre: string) {
    const index = storyData.genres.indexOf(genre)
    if (index > -1) {
      storyData.genres.splice(index, 1)
    } else {
      storyData.genres.push(genre)
    }
  }

  // (MỚI) Hàm thêm thể loại mới
  async function addCustomGenre(newGenre: string) {
    if (!newGenre || genresFromAPI.value.includes(newGenre)) {
      return // Bỏ qua nếu rỗng hoặc đã tồn tại
    }
    // Thêm vào danh sách tạm thời ở client
    genresFromAPI.value.push(newGenre)
    // Tự động chọn thể loại vừa thêm
    storyData.genres.push(newGenre)

    // TODO: Bạn có thể tạo một API `POST /api/genres` để lưu thể loại mới này
    // vào database cho những lần tạo truyện sau.
  }

  return {
    isLoading, isGenerating, currentStep, highestStep, genresFromAPI,
    storyData, canProceed,
    resetWizard, nextStep, prevStep, addCustomGenre, toggleGenre
  }
}
