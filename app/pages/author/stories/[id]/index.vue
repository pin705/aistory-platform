<template>
  <UContainer class="py-8">
    <div class="flex justify-between items-center mb-6">
      <div>
        <NuxtLink to="/author/dashboard" class="text-sm text-gray-500 hover:underline">‹ Quay lại Dashboard</NuxtLink>
        <h1 class="text-3xl font-bold">{{ story?.title }}</h1>
      </div>
      <UButton icon="i-heroicons-plus-circle" size="lg" @click="createNewChapter" :loading="isCreating">Viết chương mới</UButton>
    </div>

    <UTabs :items="tabs" class="w-full">
      <template #chapters="{ item }">
        <UCard class="mt-4">
          <template #header>
            <h3 class="text-lg font-semibold">{{ item.label }}</h3>
          </template>
          <UTable :data="chapters" :columns="chapterColumns" />
        </UCard>
      </template>

      <template #lorebook="{ item }">
        <UCard class="mt-4">
          <template #header>
             <h3 class="text-lg font-semibold">Hệ thống nhân vật trong: {{ story?.title }}</h3>
          </template>
          <StoryCharacterManager :story-id="storyId" />
        </UCard>
      </template>
    </UTabs>

  </UContainer>
</template>

<script setup lang="ts">
// Import các thành phần cần thiết
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'

// Resolve các component UI sẽ dùng trong hàm `h()`
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const route = useRoute()
const toast = useToast()
const storyId = route.params.id as string
const isCreating = ref(false)

// (MỚI) Định nghĩa các Tab cho giao diện
const tabs = [
  { slot: 'chapters', label: 'Danh sách chương' },
  { slot: 'lorebook', label: 'Lorebook' },
]

type ChapterRow = {
  _id: string
  chapterNumber: number
  title: string
  status: 'draft' | 'published'
  updatedAt: string
}

// Lấy thông tin cơ bản của truyện để hiển thị title
const { data: story } = await useFetch(`/api/stories/${storyId}`)
// Lấy danh sách chương
const { data: chapters, refresh: refreshChapters } = await useFetch<ChapterRow[]>(`/api/stories/${storyId}/chapters`, {
  default: () => []
})

// Đổi tên biến `columns` thành `chapterColumns` để rõ ràng hơn
const chapterColumns: TableColumn<ChapterRow>[] = [
  { accessorKey: 'chapterNumber', header: 'Chương số' },
  { accessorKey: 'title', header: 'Tiêu đề' },
  { accessorKey: 'status', header: 'Trạng thái' },
  { accessorKey: 'updatedAt', header: 'Cập nhật', cell: ({ row }) => new Date(row.getValue('updatedAt')).toLocaleString('vi-VN') },
  {
    id: 'actions',
    header: () => h('div', { class: 'text-right' }, 'Hành động'),
    cell: ({ row }) => h('div', { class: 'text-right' }, h(UDropdownMenu, { items: getActionItems(row), content: { align: 'end' } }, () => h(UButton, { icon: 'i-heroicons-ellipsis-horizontal-20-solid', color: 'gray', variant: 'ghost' })))
  }
]

// Hàm tạo các item cho dropdown menu
function getActionItems (row: Row<ChapterRow>) {
  return [
    {
      label: 'Chỉnh sửa',
      icon: 'i-heroicons-pencil-square-20-solid',
      onSelect: () => navigateTo(`/author/stories/${storyId}/chapters/${row.original._id}`)
    },
    { type: 'separator' as const },
    {
      label: 'Xoá',
      labelClass: 'text-red-500 dark:text-red-400',
      icon: 'i-heroicons-trash-20-solid',
      onSelect: () => deleteChapter(row.original._id)
    }
  ]
}

// Hàm tạo chương mới và chuyển hướng
async function createNewChapter() {
  isCreating.value = true
  try {
    const newChapter = await $fetch(`/api/stories/${storyId}/chapters`, {
      method: 'POST',
      body: {}
    })
    toast.add({ title: 'Đã tạo chương mới!', icon: 'i-heroicons-check-circle' })
    await navigateTo(`/author/stories/${storyId}/chapters/${newChapter._id}`)
  } catch (e: any) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage || 'Không thể tạo chương mới.', color: 'warning' })
  } finally {
    isCreating.value = false
  }
}

// Hàm xóa chương
async function deleteChapter(chapterId: string) {
  if (!confirm('Bạn có chắc chắn muốn xóa chương này? Thao tác này không thể hoàn tác.')) {
    return
  }
  try {
    await $fetch(`/api/chapters/${chapterId}`, {
      method: 'DELETE'
    })
    toast.add({ title: 'Xóa chương thành công!', color: 'success' })
    await refreshChapters()
  } catch (e: any) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage || 'Không thể xóa chương.', color: 'red' })
  }
}

useHead({ title: () => `Quản lý: ${story.value?.title || 'Truyện'}` })
</script>
