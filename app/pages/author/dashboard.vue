<template>
  <UContainer>
    <div class="flex justify-between items-center my-8">
      <h1 class="text-3xl font-bold">Bảng điều khiển</h1>
      <UButton icon="i-heroicons-plus-circle" size="lg" @click="isAddStoryModalOpen = true">Viết truyện mới</UButton>
    </div>

    <UCard>
      <UTable :data="stories" :columns="columns" />
    </UCard>

    <UModal v-model:open="isAddStoryModalOpen">
      <template #header><h2 class="text-xl font-bold">Tạo truyện mới</h2></template>
      <template #body>
        <UForm :state="addStoryState" :schema="storySchema" @submit="handleAddStory">
          <UFormField label="Bối cảnh / Ý tưởng chính của truyện" name="prompt" class="mb-4">
            <UTextarea v-model="addStoryState.prompt" class="w-full" :rows="8" :placeholder="promptPlaceholder" />
          </UFormField>
          <div class="flex justify-end mb-6">
            <UButton variant="soft" icon="i-heroicons-sparkles" :loading="isGenerating" @click="handleGenerateDetails">Gợi ý bằng Gemini</UButton>
          </div>
          <UFormField label="Tiêu đề truyện" name="title" class="mb-4">
            <UInput v-model="addStoryState.title" class="w-full" placeholder="AI sẽ gợi ý tên ở đây..." />
          </UFormField>
          <UFormField label="Mô tả ngắn" name="description" class="mb-4">
            <UTextarea v-model="addStoryState.description" class="w-full" :rows="5" placeholder="AI sẽ gợi ý mô tả ở đây..." />
          </UFormField>
          <UFormField label="Thể loại" name="genres" class="mb-4">
            <USelectMenu v-model="addStoryState.genres" class="w-full" :items="genresFromAPI" multiple placeholder="Chọn thể loại" />
          </UFormField>
          <UFormField label="Tags (phân cách bởi dấu phẩy)" name="tags" class="mb-4">
             <UInput v-model="addStoryState.tags" class="w-full" placeholder="AI sẽ gợi ý tags ở đây..." />
          </UFormField>
          <div class="flex justify-end gap-3 mt-8">
            <UButton color="gray" variant="ghost" @click="isAddStoryModalOpen = false">Hủy</UButton>
            <UButton type="submit" :loading="isLoading">Tạo truyện</UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <UModal v-model:open="isEditStoryModalOpen">
      <template #header><h2 class="text-xl font-bold">Chỉnh sửa thông tin truyện</h2></template>
      <template #body>
        <div v-if="isFetchingDetails" class="text-center p-4">Đang tải dữ liệu...</div>
        <UForm v-else :state="editStoryState" :schema="storySchema" @submit="handleUpdateStory">
            <UFormField label="Tiêu đề truyện" name="title" class="mb-4">
              <UInput v-model="editStoryState.title" class="w-full" />
            </UFormField>
            <UFormField label="Mô tả ngắn" name="description" class="mb-4">
              <UTextarea v-model="editStoryState.description" :rows="5" class="w-full" />
            </UFormField>
            <UFormField label="Bối cảnh / Prompt gốc" name="prompt" class="mb-4">
              <UTextarea v-model="editStoryState.prompt" :rows="8" class="w-full" />
            </UFormField>
            <UFormField label="Thể loại" name="genres" class="mb-4">
              <USelectMenu class="w-full" v-model="editStoryState.genres" :items="genresFromAPI" multiple />
            </UFormField>
            <UFormField label="Tags (phân cách bởi dấu phẩy)" name="tags" class="mb-4">
              <UInput v-model="editStoryState.tags" class="w-full" />
            </UFormField>
            <div class="flex justify-end gap-3 mt-8">
              <UButton color="gray" variant="ghost" @click="isEditStoryModalOpen = false">Hủy</UButton>
              <UButton type="submit" :loading="isLoading">Lưu thay đổi</UButton>
            </div>
        </UForm>
      </template>
    </UModal>

  </UContainer>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const toast = useToast()
const isLoading = ref(false)
const isGenerating = ref(false)

// ----- STATE QUẢN LÝ CÁC MODAL -----
const isAddStoryModalOpen = ref(false)
const isEditStoryModalOpen = ref(false)
const isFetchingDetails = ref(false) // State loading cho việc lấy chi tiết truyện
const selectedStoryId = ref<string | null>(null) // Lưu ID của truyện đang được sửa

// ----- LẤY DỮ LIỆU CHUNG -----
type StoryRow = { _id: string; title: string; status: 'draft' | 'published' | 'on-hold'; views: number; updatedAt: string; }
const { data: stories, refresh: refreshStories } = await useFetch<StoryRow[]>('/api/author/stories')
const { data: genresFromAPI } = await useFetch<string[]>('/api/genres', { default: () => [] })
// const { data: chapters, refresh: refreshChapters } = await useFetch(`/api/stories/${storyId}/chapters`)

useHead({ title: 'Bảng điều khiển' })

// ----- LOGIC BẢNG HIỂN THỊ TRUYỆN -----
const columns: TableColumn<StoryRow>[] = [
  { accessorKey: 'title', header: 'Tiêu đề' }, { accessorKey: 'status', header: 'Trạng thái' }, { accessorKey: 'views', header: 'Lượt xem' }, { accessorKey: 'updatedAt', header: 'Cập nhật', cell: ({ row }) => new Date(row.getValue('updatedAt')).toLocaleDateString('vi-VN') }, { id: 'actions', header: () => h('div', { class: 'text-right' }, 'Hành động'), cell: ({ row }) => h('div', { class: 'text-right' }, h(UDropdownMenu, { items: getActionItems(row), content: { align: 'end' } }, () => h(UButton, { icon: 'i-heroicons-ellipsis-horizontal-20-solid', color: 'gray', variant: 'ghost' }))) }
]

const promptPlaceholder = `Ví dụ: Nhân vật chính tên Khải, một người bình thường sống sót sau thảm họa tận thế. Thế giới giờ đây là những thành phố đổ nát, bị bao phủ bởi cây cối hoang dại và đầy rẫy những con quái vật đột biến nguy hiểm. Con người phải sống trong những khu định cư được bảo vệ nghiêm ngặt.

Trong một lần ra ngoài tìm kiếm nhu yếu phẩm, Khải vô tình rơi vào một di tích của thế giới cũ và tìm thấy một khối lập phương kim loại kỳ lạ. Khi chạm vào, khối lập phương hợp nhất với hắn và một giao diện hệ thống hiện ra trong đầu.

Hệ thống này không cho điểm kinh nghiệm hay cấp độ, mà cho phép Khải "khai phá di sản" từ các vật phẩm của nền văn minh cũ. Ví dụ: đọc một cuốn sách dạy nấu ăn có thể mở khóa kỹ năng "Đầu Bếp Sinh Tồn", sửa một chiếc radio cũ có thể mở khóa kỹ năng "Kỹ Sư Tín Hiệu". Mục tiêu của Khải là sống sót, tìm hiểu nguyên nhân của thảm họa và xây dựng lại một nơi an toàn cho mọi người.`

function getActionItems (row: Row<StoryRow>) {
  return [
    { label: 'Quản lý chương', icon: 'i-heroicons-book-open', onSelect: () => navigateTo(`/author/stories/${row.original._id}`) },
    // (THAY ĐỔI) Gọi hàm mở Modal thay vì chuyển trang
    { label: 'Chỉnh sửa thông tin', icon: 'i-heroicons-pencil-square-20-solid', onSelect: () => openEditModal(row.original) }
  ]
}

// ----- LOGIC FORM CHUNG (VALIDATION) -----
const storySchema = z.object({
  prompt: z.string().min(50, 'Bối cảnh cần chi tiết hơn'), title: z.string().min(5, 'Tiêu đề quá ngắn'), description: z.string().min(20, 'Mô tả quá ngắn'), genres: z.array(z.string()).optional(), tags: z.string().optional(),
})
type StorySchema = z.output<typeof storySchema>

// ----- LOGIC FORM THÊM TRUYỆN MỚI -----
const addStoryState = reactive({ prompt: '', title: '', description: '', genres: [], tags: '' })

async function handleGenerateDetails() { /* ... Giữ nguyên như cũ ... */
  if (addStoryState.prompt.length < 50) { return toast.add({ title: 'Lỗi', description: 'Vui lòng nhập bối cảnh chi tiết hơn.', color: 'orange' }) }
  isGenerating.value = true
  try {
    const result = await $fetch('/api/stories/generate-details', { method: 'POST', body: { prompt: addStoryState.prompt } })
    addStoryState.title = result.title; addStoryState.description = result.description; addStoryState.tags = result.tags.join(', '); addStoryState.genres = result.genres
    toast.add({ title: 'Gemini đã tạo gợi ý thành công!', icon: 'i-heroicons-sparkles' })
  } catch (e: any) { toast.add({ title: 'Lỗi!', description: e.data?.statusMessage || 'Không thể tạo gợi ý', color: 'red' })
  } finally { isGenerating.value = false }
}
async function handleAddStory(event: FormSubmitEvent<StorySchema>) { /* ... Giữ nguyên như cũ ... */
  isLoading.value = true
  try {
    const tagsArray = event.data.tags ? event.data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
    const newStory = await $fetch('/api/stories', { method: 'POST', body: { ...event.data, tags: tagsArray }})
    toast.add({ title: 'Tạo truyện thành công!', color: 'green' })
    isAddStoryModalOpen.value = false
    Object.assign(addStoryState, { prompt: '', title: '', description: '', genres: [], tags: '' })
    await refreshStories()
    await navigateTo(`/author/stories/${newStory._id}`)
  } catch (e: any) { toast.add({ title: 'Lỗi!', description: e.data?.statusMessage || 'Đã xảy ra lỗi', color: 'red' })
  } finally { isLoading.value = false }
}


// ----- (MỚI) LOGIC FORM CHỈNH SỬA TRUYỆN -----
const editStoryState = reactive({ title: '', description: '', prompt: '', genres: [] as string[], tags: '' })

async function openEditModal(story: StoryRow) {
  isFetchingDetails.value = true
  isEditStoryModalOpen.value = true
  selectedStoryId.value = story._id

  try {
    // Gọi API để lấy dữ liệu đầy đủ của truyện được chọn
    const fullStoryData = await $fetch(`/api/stories/${story._id}`)

    // Điền dữ liệu vào form
    if (fullStoryData) {
      editStoryState.title = fullStoryData.title
      editStoryState.description = fullStoryData.description
      editStoryState.prompt = fullStoryData.prompt
      editStoryState.genres = fullStoryData.genres || []
      editStoryState.tags = (fullStoryData.tags || []).join(', ')
    }
  } catch (e: any) {
    toast.add({ title: 'Lỗi!', description: 'Không thể lấy chi tiết truyện.', color: 'red' })
    isEditStoryModalOpen.value = false // Đóng modal nếu lỗi
  } finally {
    isFetchingDetails.value = false
  }
}

async function handleUpdateStory(event: FormSubmitEvent<StorySchema>) {
  if (!selectedStoryId.value) return
  isLoading.value = true
  try {
    const tagsArray = event.data.tags ? event.data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []

    await $fetch(`/api/stories/${selectedStoryId.value}`, {
      method: 'PUT',
      body: { ...event.data, tags: tagsArray }
    })

    toast.add({ title: 'Cập nhật truyện thành công!', color: 'green' })
    isEditStoryModalOpen.value = false
    await refreshStories() // Làm mới bảng
  } catch (e: any) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage || 'Không thể cập nhật', color: 'red' })
  } finally {
    isLoading.value = false
  }
}

</script>
