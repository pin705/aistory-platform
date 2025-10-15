<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">
          Danh sách chương
        </h3>
        <UButton
          icon="i-heroicons-plus-circle"
          :loading="isCreating"
          color="neutral"
          @click="createNewChapter"
        >
          Viết chương mới
        </UButton>
      </div>
    </template>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      :data="chapterData"
      :columns="chapterColumns"
      :loading="pending"
      :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Đang tải...' }"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel()
      }"
      @select="(row) => {
        navigateTo(`/author/stories/${storyId}/chapters/${row.original._id}`)
      }"
    />

    <template #footer>
      <div
        class="flex justify-center pt-4 border-t border-gray-200 dark:border-gray-800"
      >
        <UPagination
          :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
          :items-per-page="table?.tableApi?.getState().pagination.pageSize"
          :total="table?.tableApi?.getFilteredRowModel().rows.length"
          color="neutral"
          @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
        />
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import { getPaginationRowModel } from '@tanstack/vue-table'

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UBadge = resolveComponent('UBadge')
const USelect = resolveComponent('USelect')
const table = useTemplateRef('table')
const pagination = ref({
  pageIndex: 0,
  pageSize: 5
})
const route = useRoute()
const toast = useToast()
const storyId = route.params.id as string
const isCreating = ref(false)

type ChapterRow = { _id: string, chapterNumber: number, title: string, status: 'draft' | 'published', updatedAt: string }

// ----- Fetch dữ liệu động với phân trang và tìm kiếm -----
const { data: chapterData, refresh: refreshChapters, pending } = await useFetch(`/api/stories/${storyId}/chapters`, {
  query: { page: pagination.value.pageIndex + 1, limit: pagination.value.pageSize },
  default: () => ({ chapters: [] as ChapterRow[], total: 0 }),
  watch: [pagination] // Tự động fetch lại dữ liệu mỗi khi `pagination` thay đổi
})

// ----- Logic Cột và Hành động trong Bảng -----
const chapterStatusOptions = [
  { value: 'draft', label: 'Bản nháp' },
  { value: 'published', label: 'Đã xuất bản' }
]

async function handleChapterStatusChange(chapterId: string, newStatus: string) {
  try {
    await $fetch(`/api/chapters/${chapterId}/status`, {
      method: 'PATCH', body: { status: newStatus }
    })
    toast.add({ title: 'Cập nhật trạng thái thành công!' })
    await refreshChapters()
  } catch (e) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage || 'Không thể cập nhật', color: 'error' })
  }
}

const chapterColumns: TableColumn<ChapterRow>[] = [
  { accessorKey: 'chapterNumber', header: 'Chương số' },
  { accessorKey: 'title', header: 'Tiêu đề' },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    // (CẬP NHẬT) Sửa lại hàm cell để render UBadge
    cell: ({ row }) => {
      const status = row.original.status
      return h(UBadge, {
        color: statusColors[status] || 'gray', // Lấy màu từ object, fallback về màu xám
        variant: 'soft',
        label: statusLabels[status] || status // Lấy nhãn từ object, fallback về giá trị gốc
      })
    }
  },
  { accessorKey: 'updatedAt', header: 'Cập nhật', cell: ({ row }) => new Date(row.original.updatedAt).toLocaleDateString('vi-VN') },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => h('div', { class: 'text-right' }, h(UDropdownMenu,
      { items: getActionItems(row), content: { align: 'end' } },
      () => h(UButton, { icon: 'i-heroicons-ellipsis-horizontal-20-solid', variant: 'ghost' })
    ))
  }
]

function getActionItems(row: Row<ChapterRow>) {
  return [
    [{ label: 'Chỉnh sửa', icon: 'i-heroicons-pencil-square-20-solid', onSelect: () => navigateTo(`/author/stories/${storyId}/chapters/${row.original._id}`) }],
    [{ label: 'Xoá', icon: 'i-heroicons-trash-20-solid', labelClass: 'text-red-500 dark:text-red-400', onSelect: () => deleteChapter(row.original._id) }]
  ]
}

async function createNewChapter() {
  isCreating.value = true
  try {
    const newChapter = await $fetch(`/api/stories/${storyId}/chapters`, { method: 'POST', body: {} })
    toast.add({ title: 'Đã tạo chương mới!', icon: 'i-heroicons-check-circle' })
    await refreshChapters() // Làm mới để xem chương mới trong danh sách
    await navigateTo(`/author/stories/${storyId}/chapters/${newChapter._id}`)
  } catch (e) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'warning' })
  } finally {
    isCreating.value = false
  }
}

async function deleteChapter(chapterId: string) {
  if (!confirm('Bạn có chắc chắn muốn xóa chương này?')) return
  try {
    await $fetch(`/api/chapters/${chapterId}`, { method: 'DELETE' })
    toast.add({ title: 'Xóa chương thành công!', color: 'success' })
    await refreshChapters()
  } catch (e) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'error' })
  }
}
</script>
