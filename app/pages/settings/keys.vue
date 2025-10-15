<template>
  <UContainer class="py-8">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <UAlert
        icon="i-heroicons-light-bulb"
        title="Hướng dẫn Gemini"
      >
        <template #description>
          Lấy API Key miễn phí từ <a
            href="https://aistudio.google.com/app/api-keys"
            target="_blank"
            class="underline font-semibold"
          >Google AI Studio</a> để sử dụng các model Gemini.
        </template>
      </UAlert>
      <UAlert
        icon="i-heroicons-light-bulb"
        title="Hướng dẫn Groq"
      >
        <template #description>
          Groq cung cấp tốc độ cực nhanh. Lấy API Key miễn phí tại <a
            href="https://console.groq.com/keys"
            target="_blank"
            class="underline font-semibold"
          >Groq Console</a>.
        </template>
      </UAlert>
    </div>

    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">
        Quản lý API Key
      </h1>
      <UButton
        icon="i-heroicons-plus"
        @click="isAddModalOpen = true"
      >
        Thêm Key mới
      </UButton>
    </div>

    <UCard>
      <UTable
        :data="apiKeys"
        :columns="columns"
      />
    </UCard>

    <UModal v-model:open="isAddModalOpen">
      <template #header>
        <h2 class="text-xl font-bold">
          Thêm API Key mới
        </h2>
      </template>
      <template #body>
        <UForm
          :state="addState"
          :schema="addSchema"
          @submit="submitAddKey"
        >
          <UFormField
            label="Nhà cung cấp (Provider)"
            name="provider"
            class="mb-4"
          >
            <USelectMenu
              v-model="addState.provider"
              :items="['gemini', 'groq']"
            />
          </UFormField>
          <UFormField
            label="API Key"
            name="apiKey"
            class="mb-4"
          >
            <UInput
              v-model="addState.apiKey"
              type="password"
              placeholder="dán key của bạn vào đây"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="Model AI mặc định"
            name="apiModel"
            class="mb-4"
          >
            <USelectMenu
              v-model="addState.apiModel"
              :items="availableModels"
              class="w-full"
            />
          </UFormField>
          <div class="flex justify-end gap-2 mt-4">
            <UButton
              color="gray"
              variant="ghost"
              @click="isAddModalOpen=false"
            >
              Hủy
            </UButton>
            <UButton
              type="submit"
              :loading="isLoading"
            >
              Lưu Key
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <UModal v-model:open="isEditModalOpen">
      <template #header>
        <h2 class="text-xl font-bold">
          Chỉnh sửa API Key
        </h2>
      </template>
      <template #body>
        <UForm
          v-if="selectedKey"
          :state="editState"
          :schema="editSchema"
          @submit="submitEditKey"
        >
          <UFormField
            label="Nhà cung cấp (Provider)"
            name="provider"
            class="mb-4"
          >
            <UInput
              :model-value="editState.provider"
              disabled
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="API Key mới"
            name="apiKey"
            class="mb-4"
            description="Bỏ trống nếu không muốn thay đổi."
          >
            <UInput
              v-model="editState.apiKey"
              type="password"
              placeholder="Nhập key mới để thay thế"
              class="w-full"
            />
          </UFormField>
          <div class="grid grid-cols-2 gap-4 mb-4 items-center">
            <UFormField
              label="Model AI mặc định"
              name="apiModel"
            >
              <USelectMenu
                v-model="editState.apiModel"
                :items="availableModels"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Trạng thái"
              name="isActive"
              class="flex flex-col items-start mt-1"
            >
              <USwitch v-model="editState.isActive" />
              <span class="text-xs mt-1">{{ editState.isActive ? 'Đang hoạt động' : 'Vô hiệu hóa' }}</span>
            </UFormField>
          </div>
          <div class="flex justify-end gap-2 mt-4">
            <UButton
              color="gray"
              variant="ghost"
              @click="isEditModalOpen=false"
            >
              Hủy
            </UButton>
            <UButton
              type="submit"
              :loading="isLoading"
            >
              Lưu thay đổi
            </UButton>
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
const UBadge = resolveComponent('UBadge')

const toast = useToast()
const isLoading = ref(false)
const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const selectedKey = ref<any | null>(null)

// --- DANH SÁCH MODEL ---
const geminiModels = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.5-flash-lite']
const groqModels = ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'meta-llama/llama-4-maverick-17b-128e-instruct', 'meta-llama/llama-4-scout-17b-16e-instruct']

// --- LẤY DỮ LIỆU ---
const { data: apiKeys, refresh } = await useFetch<any[]>('/api/keys', { default: () => [] })

// --- CẤU HÌNH BẢNG ---
const columns: TableColumn<any>[] = [
  { accessorKey: 'provider', header: 'Nhà cung cấp' },
  {
    accessorKey: 'isActive',
    header: 'Trạng thái',
    cell: ({ row }) => h(UBadge, {
      color: row.original.isActive ? 'success' : 'warning',
      variant: 'soft',
      label: row.original.isActive ? 'Hoạt động' : 'Vô hiệu hóa'
    })
  },
  { accessorKey: 'apiModel', header: 'Model Mặc định' },
  {
    id: 'actions',
    header: () => h('div', { class: 'text-right' }, 'Hành động'),
    cell: ({ row }) => h('div', { class: 'text-right' }, h(UDropdownMenu, { items: getActionItems(row) }, () => h(UButton, { icon: 'i-heroicons-ellipsis-horizontal-20-solid', color: 'gray', variant: 'ghost' })))
  }
]

function getActionItems(row: Row<any>) {
  return [
    [{ label: 'Sửa', icon: 'i-heroicons-pencil-square-20-solid', onSelect: () => openEditModal(row.original) }],
    [{ label: 'Xoá', icon: 'i-heroicons-trash-20-solid', labelClass: 'text-red-500', onSelect: () => deleteKey(row.original._id) }]
  ]
}

function openEditModal(key: any) {
  selectedKey.value = key
  editState.provider = key.provider
  editState.apiKey = ''
  editState.apiModel = key.apiModel
  editState.isActive = key.isActive
  isEditModalOpen.value = true
}

async function deleteKey(id: string) {
  if (!confirm('Bạn có chắc chắn muốn xóa key này?')) return
  try {
    await $fetch(`/api/keys/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Xóa key thành công!', color: 'green' })
    await refresh()
  } catch (e: any) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'red' })
  }
}

// --- FORM THÊM MỚI ---
const addSchema = z.object({ provider: z.string(), apiKey: z.string().min(10, 'API Key không hợp lệ'), apiModel: z.string() })
type AddSchema = z.output<typeof addSchema>
const addState = reactive({ provider: 'gemini', apiKey: '', apiModel: geminiModels[0] })

// Computed để chọn danh sách model động
const availableModels = computed(() => {
  const currentProvider = isEditModalOpen.value ? editState.provider : addState.provider
  return currentProvider === 'gemini' ? geminiModels : groqModels
})

// Watcher để tự động đổi model khi provider thay đổi trong form THÊM MỚI
watch(() => addState.provider, (newProvider) => {
  addState.apiModel = newProvider === 'gemini' ? geminiModels[0] : groqModels[0]
})

async function submitAddKey(event: FormSubmitEvent<AddSchema>) {
  isLoading.value = true
  try {
    await $fetch('/api/keys', { method: 'POST', body: event.data })
    toast.add({ title: 'Thêm key thành công!', color: 'green' })
    isAddModalOpen.value = false
    addState.apiKey = ''
    await refresh()
  } catch (e: any) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'red' })
  } finally { isLoading.value = false }
}

// --- FORM CHỈNH SỬA ---
const editSchema = z.object({
  apiKey: z.string().optional().or(z.string().min(10, 'API Key mới không hợp lệ')),
  apiModel: z.string(),
  isActive: z.boolean()
})
type EditSchema = z.output<typeof editSchema>
const editState = reactive({ provider: '', apiKey: '', apiModel: '', isActive: true })

async function submitEditKey(event: FormSubmitEvent<EditSchema>) {
  if (!selectedKey.value) return
  isLoading.value = true
  try {
    const body: Partial<EditSchema> & { apiKey?: string } = { ...event.data }
    if (!body.apiKey) delete body.apiKey

    await $fetch(`/api/keys/${selectedKey.value._id}`, { method: 'PUT', body })
    toast.add({ title: 'Cập nhật key thành công!', color: 'green' })
    isEditModalOpen.value = false
    await refresh()
  } catch (e: any) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'red' })
  } finally { isLoading.value = false }
}
</script>
