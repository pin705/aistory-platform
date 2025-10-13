<template>
  <UContainer class="py-8">
    <div class="flex justify-between items-center mb-6">
      <div>
        <NuxtLink
          to="/dashboard"
          class="text-sm text-gray-500 hover:underline"
        >‹ Quay lại Tác phẩm</NuxtLink>
        <h1 class="text-3xl font-bold">
          {{ story?.title }}
        </h1>
      </div>
      <UButton
        icon="i-heroicons-plus-circle"
        :loading="isCreating"
        color="neutral"
        @click="createNewChapter"
      >
        Viết chương mới
      </UButton>
    </div>

    <UTabs
      :items="tabsManager"
      class="w-full"
      color="neutral"
    >
      <template #chapters="{ item }">
        <UCard class="mt-4">
          <template #header>
            <h3 class="text-lg font-semibold">
              {{ item.label }}
            </h3>
          </template>
          <UTable
            ref="table"
            v-model:pagination="pagination"
            :pagination-options="{
              getPaginationRowModel: getPaginationRowModel()
            }"
            :data="chapters"
            :columns="chapterColumns"
          />
          <div class="flex justify-center border-t border-default pt-4">
            <UPagination
              :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
              :items-per-page="table?.tableApi?.getState().pagination.pageSize"
              :total="table?.tableApi?.getFilteredRowModel().rows.length"
              @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
            />
          </div>
        </UCard>
      </template>

      <template #characters="{ item }">
        <div class="mt-4">
          <StoryCharacterManager :story-id="storyId" />
        </div>
      </template>

      <template #factions="{ item }">
        <div class="mt-4">
          <StoryFactionsManager :story-id="storyId" />
        </div>
      </template>

      <template #realms="{ item }">
        <div class="mt-4">
          <StoryRealmsManager :story-id="storyId" />
        </div>
      </template>
    </UTabs>
  </UContainer>
</template>

<script setup lang="ts">
// Import các thành phần cần thiết
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import { getPaginationRowModel } from '@tanstack/vue-table'

// Resolve các component UI sẽ dùng trong hàm `h()`
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const USelect = resolveComponent('USelect')
const UBadge = resolveComponent('UBadge')
const table = useTemplateRef('table')

const route = useRoute()
const toast = useToast()
const storyId = route.params.id as string
const isCreating = ref(false)
const pagination = ref({
  pageIndex: 0,
  pageSize: 5
})
const tabsManager = [
  { slot: 'chapters', label: 'Quản lý Chương' },
  { slot: 'characters', label: 'Quản lý Nhân vật' },
  { slot: 'factions', label: 'Quản lý Thế lực' },
  { slot: 'realms', label: 'Quản lý Cảnh giới' }
  // Thêm các tab khác tại đây khi bạn tạo component tương ứng
]

const chapterStatusOptions = [
  { value: 'draft', label: 'Bản nháp', icon: 'i-heroicons-pencil-square-20-solid' },
  { value: 'published', label: 'Đã xuất bản', icon: 'i-heroicons-check-circle-20-solid' }
]
const chapterStatusColors: Record<string, any> = {
  draft: 'orange',
  published: 'green'
}
const chapterStatusLabels: Record<string, string> = {
  draft: 'Bản nháp',
  published: 'Đã xuất bản'
}

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
const { data: chapters, refresh: refreshChapters } = await useFetch<ChapterRow[]>(`/api/stories/${storyId}/chapters`)
async function handleChapterStatusChange(chapterId: string, newStatus: string) {
  try {
    await $fetch(`/api/chapters/${chapterId}/status`, {
      method: 'PATCH',
      body: { status: newStatus }
    })
    toast.add({ title: 'Cập nhật trạng thái thành công!' })
    // Làm mới lại bảng để cập nhật `updatedAt`
    await refreshChapters()
  } catch (e) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage || 'Không thể cập nhật', color: 'error' })
  }
}

// (CẬP NHẬT) Định nghĩa cột cho bảng chương
const chapterColumns: TableColumn<ChapterRow>[] = [
  { accessorKey: 'chapterNumber', header: 'Chương số' },
  { accessorKey: 'title', header: 'Tiêu đề' },
  // (CẬP NHẬT) Cột Trạng thái tương tác
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: ({ row }) => h(USelect, {
      'modelValue': row.original.status,
      'items': chapterStatusOptions,
      'class': 'w-36',
      'onUpdate:modelValue': newStatus => handleChapterStatusChange(row.original._id, newStatus)
    }, {
      label: () => h(UBadge, {
        color: chapterStatusColors[row.original.status] || 'gray',
        variant: 'soft',
        size: 'xs'
      }, () => chapterStatusLabels[row.original.status] || row.original.status)
    })
  },
  { accessorKey: 'updatedAt', header: 'Cập nhật', cell: ({ row }) => new Date(row.getValue('updatedAt')).toLocaleString('vi-VN') },
  {
    id: 'actions',
    header: () => h('div', { class: 'text-right' }, 'Hành động'),
    cell: ({ row }) => h('div', { class: 'text-right' }, h(UDropdownMenu,
      { items: getActionItems(row), content: { align: 'end' } }, () => h(UButton, { icon: 'i-heroicons-ellipsis-horizontal-20-solid', color: 'gray', variant: 'ghost' })))
  }
]

// Hàm tạo các item cho dropdown menu
function getActionItems(row: Row<ChapterRow>) {
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
  } catch (e) {
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
  } catch (e) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage || 'Không thể xóa chương.', color: 'red' })
  }
}

useHead({ title: () => `Quản lý: ${story.value?.title || 'Truyện'}` })
</script>
