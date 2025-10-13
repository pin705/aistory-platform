import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

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
  })

  // Hàm reset form về trạng thái ban đầu
  const resetForm = () => {
    Object.assign(formState, { _id: undefined, coverImage: '', prompt: '', title: '', description: '', genres: [], tags: '', status: 'draft' })
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

  // Hàm gọi AI phác thảo
  async function handleGenerateDetails() {
    if (formState.prompt.length < 50) {
      return toast.add({ title: 'Lỗi', description: 'Vui lòng nhập ý tưởng chi tiết hơn.', color: 'warning' })
    }
    isGenerating.value = true
    try {
      const result = await $fetch('/api/stories/generate-details', { method: 'POST', body: { prompt: formState.prompt } })
      formState.title = result.title
      formState.description = result.description
      formState.tags = result.tags.join(', ')
      formState.genres = result.genres
      toast.add({ title: 'AI đã phác thảo thành công!', icon: 'i-heroicons-sparkles' })
    } catch (e) {
      toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'error' })
    } finally {
      isGenerating.value = false
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
    handleGenerateDetails,
  }
}
