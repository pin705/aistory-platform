<template>
  <UCard>
    <template #header>
      <div class="flex gap-4">
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          placeholder="Tìm kiếm tên, mô tả..."
          class="flex-1"
        />
        <UButton
          icon="i-heroicons-plus-circle"
          color="neutral"
          @click="openModal(null)"
        >
          Thêm Nhân Vật
        </UButton>
      </div>
    </template>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel()
      }"
      :data="characters"
      :columns="columns"
    />

    <div
      v-if="pending"
      class="text-center p-4"
    >
      Đang tải...
    </div>

    <div class="flex justify-center border-t border-default pt-4">
      <UPagination
        :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
        :total="table?.tableApi?.getFilteredRowModel().rows.length"
        @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
      />
    </div>
  </UCard>

  <StoryCharacterModal
    v-model="isModalOpen"
    :story-id="storyId"
    :character-data="selectedCharacter"
    @success="refreshCharacters"
  />
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import { watchDebounced } from '@vueuse/core'
import { getPaginationRowModel } from '@tanstack/vue-table'

const props = defineProps<{
  storyId: string
}>()

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const table = useTemplateRef('table')

const pagination = ref({
  pageIndex: 0,
  pageSize: 5
})

const toast = useToast()
const storyId = props.storyId
// State cho Modal
const isModalOpen = ref(false)
const selectedCharacter = ref<any | null>(null)

// State cho tìm kiếm
const searchQuery = ref('')

// Fetch dữ liệu động
const { data: characters, refresh: refreshCharacters, pending } = await useFetch(`/api/stories/${storyId}/characters`, {
  query: { q: searchQuery }, // query sẽ tự động cập nhật khi ref thay đổi
  default: () => []
})
console.log(characters.value)
// Tự động fetch lại dữ liệu khi người dùng ngừng gõ vào ô tìm kiếm 300ms
watchDebounced(searchQuery, () => refreshCharacters(), { debounce: 300 })

const columns: TableColumn<any>[] = [
  { accessorKey: 'name', header: 'Tên' },
  { accessorKey: 'role', header: 'Vai trò' },
  { accessorKey: 'description', header: 'Mô tả', cell: ({ row }) => h('div', { class: 'max-w-[200px] truncate' }, row.getValue('description')) },
  // { accessorKey: 'backstory', header: 'Tiểu sử', cell: ({ row }) => h('div', { class: 'max-w-[200px] truncate' }, row.getValue('backstory')) },
  // { accessorKey: 'abilities', header: 'Khả năng', cell: ({ row }) => h('div', { class: 'max-w-[200px] truncate' }, row.getValue('abilities')) },
  {
    id: 'actions',
    header: () => h('div', { class: 'text-right' }, 'Hành động'),
    cell: ({ row }) => h('div', { class: 'text-right' }, h(UDropdownMenu, { items: getActionItems(row) }, () => h(UButton, { icon: 'i-heroicons-ellipsis-horizontal-20-solid', color: 'gray', variant: 'ghost' })))
  }
]

function getActionItems(row: Row<any>) {
  return [
    { label: 'Sửa', icon: 'i-heroicons-pencil-square-20-solid', onSelect: () => openModal(row.original) },
    { type: 'separator' },
    { label: 'Xoá', color: 'error', icon: 'i-heroicons-trash-20-solid', onSelect: () => deleteCharacter(row.original._id) }
  ]
}

function openModal(character) {
  selectedCharacter.value = character
  isModalOpen.value = true
}

async function deleteCharacter(characterId: string) {
  if (!confirm('Bạn có chắc chắn muốn xóa nhân vật này?')) return
  try {
    await $fetch(`/api/characters/${characterId}`, { method: 'DELETE' })
    toast.add({ title: 'Xóa nhân vật thành công!' })
    await refreshCharacters()
  } catch (e) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'error' })
  }
}

useHead({ title: 'Quản lý Nhân vật' })
</script>
