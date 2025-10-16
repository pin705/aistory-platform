import { z } from 'zod'

// Định nghĩa kiểu dữ liệu cho state của form
interface StoryFormState {
  _id?: string
  coverImage: string
  prompt: string
  title: string
  description: string
  genres: string[]
  tags: string
  status: string
  settings: Record<string, unknown>
}

export const useStoryForm = () => {
  const toast = useToast()

  // State quản lý trạng thái của form
  const isLoading = ref(false)
  const isGenerating = ref(false)
  const isFetchingDetails = ref(false)

  // State chung cho dữ liệu form
  const formState = reactive<StoryFormState>({
    _id: undefined,
    coverImage: '',
    prompt: '',
    title: '',
    description: '',
    genres: [],
    tags: '',
    status: 'draft',
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
    }
  })

  // Schema validation
  const storySchema = z.object({
    prompt: z.string().min(50, 'Ý tưởng cốt lõi cần chi tiết hơn'),
    title: z.string().min(5, 'Tên tác phẩm quá ngắn'),
    description: z.string().min(20, 'Mô tả quá ngắn'),
    genres: z.array(z.string()).optional(),
    tags: z.string().optional(),
    coverImage: z.string().optional(),
    status: z.string().optional(),
    settings: z.any().optional()
  })

  // Hàm reset form về trạng thái ban đầu
  const resetForm = () => {
    Object.assign(formState, { _id: undefined, coverImage: '', prompt: '', title: '', description: '', genres: [], tags: '', status: 'draft', settings: {
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
    } })
  }

  // Hàm lấy dữ liệu chi tiết cho chế độ sửa
  const fetchStoryDetails = async (storyId: string) => {
    isFetchingDetails.value = true
    try {
      const fullStoryData = await $fetch(`/api/stories/${storyId}`)
      if (fullStoryData) {
        formState._id = fullStoryData._id
        formState.coverImage = fullStoryData.coverImage
        formState.title = fullStoryData.title
        formState.description = fullStoryData.description
        formState.prompt = fullStoryData.prompt
        formState.genres = fullStoryData.genres || []
        formState.tags = (fullStoryData.tags || []).join(', ')
        formState.status = fullStoryData.status
        formState.settings = fullStoryData.settings || {}
        return true // Báo hiệu thành công
      }
    } catch (e) {
      toast.add({ title: 'Lỗi!', description: 'Không thể lấy chi tiết truyện.', color: 'error' })
      return false // Báo hiệu thất bại
    } finally {
      isFetchingDetails.value = false
    }
    return false
  }

  async function handleGenerateDetails() {
    if (formState.prompt.length < 50) {
      toast.add({ title: 'Lỗi', description: 'Vui lòng nhập ý tưởng chi tiết hơn.', color: 'warning' })
      return null
    }
    isGenerating.value = true
    toast.add({ title: 'Đã gửi yêu cầu cho AI', description: 'Tác vụ đang được xử lý nền...', icon: 'i-heroicons-clock', timeout: 5000 })
    try {
    // Gọi API mới, chỉ nhận về jobId
      const { jobId } = await $fetch('/api/stories/generate-full', {
        method: 'POST',
        body: { prompt: formState.prompt }
      })
      return jobId // Trả về jobId
    } catch (e: any) {
      toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'error' })
      isGenerating.value = false // Dừng loading nếu có lỗi ngay lúc gửi
      return null
    }
  }

  // Trả về tất cả các state và hàm cần thiết
  return {
    formState,
    storySchema,
    isLoading,
    isGenerating,
    isFetchingDetails,
    resetForm,
    fetchStoryDetails,
    handleGenerateDetails
  }
}
