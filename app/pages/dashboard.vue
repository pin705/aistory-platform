<template>
  <UContainer>
    <div class="flex justify-between items-center my-8">
      <h1 class="text-3xl font-bold">
        Tác phẩm của tôi
      </h1>
      <UButton
        icon="i-heroicons-plus-circle"
        color="neutral"
        @click="isAddStoryModalOpen = true"
      >
        Sáng tác truyện mới
      </UButton>
    </div>

    <div
      v-if="stories && stories.length > 0"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
    >
      <AuthorStoryCard
        v-for="story in stories"
        :key="story._id"
        :story="story"
        :status-colors="statusColors"
        :status-labels="statusLabels"
        :get-action-items="getActionItems"
      />
    </div>
    <div
      v-else
      class="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
    >
      <p class="text-gray-500">
        Bạn chưa có tác phẩm nào.
      </p>
      <UButton
        class="mt-4"
        color="neutral"
        @click="isAddStoryModalOpen = true"
      >
        Bắt đầu sáng tác ngay
      </UButton>
    </div>

    <UModal
      v-model:open="isAddStoryModalOpen"
    >
      <template #header>
        <h2 class="text-xl font-bold">
          Khởi tạo Tác phẩm mới
        </h2>
      </template>
      <template #body>
        <UForm
          ref="createFormRef"
          :state="addStoryState"
          :schema="storySchema"
          @submit="handleAddStory"
        >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="md:col-span-1">
              <ImageUploader v-model="addStoryState.coverImage" />
            </div>

            <div class="md:col-span-2">
              <UTabs :items="addTabs" color="neutral">
                <template #prompt="{ item }">
                  <div class="space-y-4 pt-4">
                    <UFormField
                      label="Ý tưởng Cốt lõi (Prompt)"
                      name="prompt"
                      description="Nhập ý tưởng chính của bạn, sau đó nhấn nút 'AI Phác thảo' để tự động điền các thông tin còn lại."
                    >
                      <UTextarea
                        v-model="addStoryState.prompt"
                        :rows="12"
                        :placeholder="promptPlaceholder"
                        class="w-full"
                      />
                    </UFormField>
                    <div class="flex justify-end">
                      <UButton
                        variant="soft"
                        icon="i-heroicons-sparkles"
                        :loading="isGenerating"
                        color="neutral"
                        @click="handleGenerateDetails"
                      >
                        AI Phác thảo
                      </UButton>
                    </div>
                  </div>
                </template>

                <template #basic="{ item }">
                  <div class="space-y-4 pt-4">
                    <UFormField
                      label="Tên Tác phẩm"
                      name="title"
                    >
                      <UInput
                        v-model="addStoryState.title"
                        placeholder="AI sẽ gợi ý tên ở đây..."
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField
                      label="Mô tả ngắn"
                      name="description"
                    >
                      <UTextarea
                        v-model="addStoryState.description"
                        :rows="8"
                        placeholder="AI sẽ gợi ý mô tả ở đây..."
                      />
                    </UFormField>
                  </div>
                </template>

                <template #classification="{ item }">
                  <div class="space-y-4 pt-4">
                    <UFormField
                      label="Thể loại"
                      name="genres"
                    >
                      <USelectMenu
                        v-model="addStoryState.genres"
                        :items="genresFromAPI"
                        multiple
                        placeholder="Chọn thể loại"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField
                      label="Tags (phân cách bởi dấu phẩy)"
                      name="tags"
                    >
                      <UInput
                        v-model="addStoryState.tags"
                        placeholder="AI sẽ gợi ý tags ở đây..."
                        class="w-full"
                      />
                    </UFormField>
                  </div>
                </template>
              </UTabs>
            </div>
          </div>
        </UForm>
      </template>
      <template #footer>
        <UButton
          color="error"
          variant="ghost"
          @click="isAddStoryModalOpen = false"
        >
          Hủy
        </UButton>
        <UButton
          color="neutral"
          type="submit"
          :loading="isLoading"
          @click="createFormRef?.submit()"
        >
          Khởi tạo Tác phẩm
        </UButton>
      </template>
    </UModal>

    <UModal
      v-model:open="isEditStoryModalOpen"
    >
      <template #header>
        <h2 class="text-xl font-bold">
          Chỉnh sửa Tác phẩm
        </h2>
      </template>
      <template #body>
        <div
          v-if="isFetchingDetails"
          class="text-center p-4"
        >
          Đang tải dữ liệu...
        </div>
        <UForm
          v-else
          ref="editFormRef"
          :state="editStoryState"
          :schema="storySchema"
          @submit="handleUpdateStory"
        >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="md:col-span-1">
              <ImageUploader v-model="editStoryState.coverImage" />
            </div>

            <div class="md:col-span-2">
              <UTabs
                :items="editTabs"
                color="neutral"
              >
                <template #basic="{ item }">
                  <div class="space-y-4 pt-4">
                    <UFormField
                      label="Tên Tác phẩm"
                      name="title"
                    >
                      <UInput
                        v-model="editStoryState.title"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField
                      label="Mô tả ngắn"
                      name="description"
                    >
                      <UTextarea
                        v-model="editStoryState.description"
                        :rows="5"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField
                      label="Trạng thái"
                      name="status"
                    >
                      <USelectMenu
                        v-model="editStoryState.status"
                        :items="statusOptionsForSelect"
                        value-key="id"
                        class="w-full"
                        option-attribute="label"
                      />
                    </UFormField>
                  </div>
                </template>

                <template #classification="{ item }">
                  <div class="space-y-4 pt-4">
                    <UFormField
                      label="Thể loại"
                      name="genres"
                    >
                      <USelectMenu
                        v-model="editStoryState.genres"
                        :items="genresFromAPI"
                        multiple
                        class="w-full"
                        placeholder="Chọn thể loại"
                      />
                    </UFormField>
                    <UFormField
                      label="Tags (phân cách bởi dấu phẩy)"
                      name="tags"
                    >
                      <UInput
                        v-model="editStoryState.tags"
                        class="w-full"
                      />
                    </UFormField>
                  </div>
                </template>

                <template #advanced="{ item }">
                  <div class="space-y-4 pt-4">
                    <UFormField
                      label="Ý tưởng Cốt lõi (Prompt)"
                      name="prompt"
                      description="Prompt gốc sẽ được dùng để giữ vững 'linh hồn' của truyện khi AI viết các chương sau."
                    >
                      <UTextarea
                        v-model="editStoryState.prompt"
                        :rows="12"
                        class="w-full"
                      />
                    </UFormField>
                  </div>
                </template>
              </UTabs>
            </div>
          </div>
        </UForm>
      </template>
      <template #footer>
        <UButton
          color="error"
          variant="ghost"
          @click="isEditStoryModalOpen = false"
        >
          Hủy
        </UButton>
        <UButton
          color="neutral"
          type="submit"
          :loading="isLoading"
          @click="editFormRef?.submit()"
        >
          Cập nhật Tác phẩm
        </UButton>
      </template>
    </UModal>
  </UContainer>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

useHead({ title: 'Tác phẩm của tôi' })
const toast = useToast()
const isLoading = ref(false)
const isGenerating = ref(false)
const editFormRef = ref(null)
const createFormRef = ref(null)

// ----- STATE QUẢN LÝ CÁC MODAL -----
const isAddStoryModalOpen = ref(false)
const isEditStoryModalOpen = ref(false)
const isFetchingDetails = ref(false)
const selectedStoryId = ref<string | null>(null)

const editTabs = [
  { slot: 'basic', label: 'Cơ bản' },
  { slot: 'classification', label: 'Phân loại' },
  { slot: 'advanced', label: 'Nâng cao' }
]

const addTabs = [
  { slot: 'prompt', label: 'Ý tưởng' },
  { slot: 'basic', label: 'Thông tin' },
  { slot: 'classification', label: 'Phân loại' },
]

// ----- LẤY DỮ LIỆU CHUNG -----
type StoryRow = {
  _id: string; title: string; coverImage: string; status: string; chapterCount: number; views: number; updatedAt: string
}
const { data: stories, refresh: refreshStories } = await useFetch<StoryRow[]>('/api/author/stories')
const { data: genresFromAPI } = await useFetch<string[]>('/api/genres', { default: () => [] })

// ----- CÁC HẰNG SỐ VỀ TRẠNG THÁI (STATUS) -----
const statusColors: Record<string, any> = { 'draft': 'orange', 'published': 'green', 'on-hold': 'gray', 'finished': 'blue' }
const statusLabels: Record<string, string> = { 'draft': 'Bản nháp', 'published': 'Đã xuất bản', 'on-hold': 'Tạm ngưng', 'finished': 'Hoàn thành' }
const statusOptionsForSelect = [
  { id: 'draft', label: 'Bản nháp' }, { id: 'published', label: 'Đã xuất bản' }, { id: 'on-hold', label: 'Tạm ngưng' }, { id: 'finished', label: 'Hoàn thành' }
]

// ----- LOGIC CHO DROPDOWN HÀNH ĐỘNG CỦA CARD -----
function getActionItems(story: StoryRow) {
  return [
    [{ label: 'Quản lý chương', icon: 'i-heroicons-book-open', click: () => navigateTo(`/author/stories/${story._id}`) }],
    [{ label: 'Chỉnh sửa thông tin', icon: 'i-heroicons-pencil-square-20-solid', click: () => openEditModal(story) }],
    [{ label: 'Xoá truyện', icon: 'i-heroicons-trash-20-solid', labelClass: 'text-red-500 dark:text-red-400', click: () => handleDeleteStory(story) }]
  ]
}

async function handleDeleteStory(story: StoryRow) {
  if (!confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tác phẩm "${story.title}"?`)) return
  try {
    await $fetch(`/api/stories/${story._id}`, { method: 'DELETE' })
    toast.add({ title: 'Xóa tác phẩm thành công!', color: 'green' })
    await refreshStories()
  } catch (e: any) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage || 'Không thể xóa.', color: 'error' })
  }
}

// ----- LOGIC FORM CHUNG (VALIDATION) -----
const storySchema = z.object({
  prompt: z.string().min(50, 'Ý tưởng cốt lõi cần chi tiết hơn'),
  title: z.string().min(5, 'Tên tác phẩm quá ngắn'),
  description: z.string().min(20, 'Mô tả quá ngắn'),
  genres: z.array(z.string()).optional(),
  tags: z.string().optional(),
  coverImage: z.string().optional(),
  status: z.string().optional()
})
type StorySchema = z.output<typeof storySchema>

// ----- LOGIC FORM THÊM MỚI -----
const addStoryState = reactive({ prompt: '', title: '', description: '', genres: [], tags: '', coverImage: '', status: 'draft' })
const promptPlaceholder = `Ví dụ: Nhân vật chính tên Khải, một người bình thường sống sót sau thảm họa tận thế...`

async function handleGenerateDetails() {
  if (addStoryState.prompt.length < 50) {
    return toast.add({ title: 'Lỗi', description: 'Vui lòng nhập ý tưởng chi tiết hơn.', color: 'warning' })
  }
  isGenerating.value = true
  try {
    const result = await $fetch('/api/stories/generate-details', { method: 'POST', body: { prompt: addStoryState.prompt } })
    addStoryState.title = result.title
    addStoryState.description = result.description
    addStoryState.tags = result.tags.join(', ')
    addStoryState.genres = result.genres
    toast.add({ title: 'AI đã phác thảo thành công!', icon: 'i-heroicons-sparkles' })
  } catch (e) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'error' })
  } finally {
    isGenerating.value = false
  }
}

async function handleAddStory(event: FormSubmitEvent<StorySchema>) {
  isLoading.value = true
  try {
    const tagsArray = event.data.tags ? event.data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
    const newStory = await $fetch('/api/stories', { method: 'POST', body: { ...event.data, tags: tagsArray } })
    toast.add({ title: 'Khởi tạo tác phẩm thành công!', color: 'success' })
    isAddStoryModalOpen.value = false
    Object.assign(addStoryState, { prompt: '', title: '', description: '', genres: [], tags: '', coverImage: '' })
    await refreshStories()
    await navigateTo(`/author/stories/${newStory._id}`)
  } catch (e) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'error' })
  } finally {
    isLoading.value = false
  }
}

// ----- LOGIC FORM CHỈNH SỬA -----
const editStoryState = reactive({
  coverImage: '', title: '', description: '', prompt: '', genres: [] as string[], tags: '', status: 'draft'
})

async function openEditModal(story: StoryRow) {
  isFetchingDetails.value = true
  isEditStoryModalOpen.value = true
  selectedStoryId.value = story._id
  try {
    const fullStoryData = await $fetch(`/api/stories/${story._id}`)
    if (fullStoryData) {
      editStoryState.coverImage = fullStoryData.coverImage
      editStoryState.title = fullStoryData.title
      editStoryState.description = fullStoryData.description
      editStoryState.prompt = fullStoryData.prompt
      editStoryState.genres = fullStoryData.genres || []
      editStoryState.tags = (fullStoryData.tags || []).join(', ')
      editStoryState.status = fullStoryData.status
    }
  } catch (e) {
    toast.add({ title: 'Lỗi!', description: 'Không thể lấy chi tiết truyện.', color: 'error' })
    isEditStoryModalOpen.value = false
  } finally {
    isFetchingDetails.value = false
  }
}

async function handleUpdateStory(event: FormSubmitEvent<StorySchema>) {
  console.log('Updating story with data:', event.data)
  if (!selectedStoryId.value) return
  isLoading.value = true
  try {
    const tagsArray = event.data.tags ? event.data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
    await $fetch(`/api/stories/${selectedStoryId.value}`, {
      method: 'PUT',
      body: { ...event.data, tags: tagsArray }
    })
    toast.add({ title: 'Cập nhật tác phẩm thành công!', color: 'success' })
    isEditStoryModalOpen.value = false
    await refreshStories()
  } catch (e) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'error' })
  } finally {
    isLoading.value = false
  }
}

definePageMeta({
  middleware: () => {
    const { loggedIn } = useUserSession()
    if (!loggedIn.value) return navigateTo('/login')
  }
})
</script>
