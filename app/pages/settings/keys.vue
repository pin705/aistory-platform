<template>
  <UContainer class="py-8">
    <UAlert
      icon="i-heroicons-light-bulb"
      color="primary"
      variant="subtle"
      title="Tại sao cần API Key?"
      class="mb-8"
    >
      <template #description>
        <p>
          Để sử dụng các tính năng AI thông minh như "AI Phác thảo" hay "Trợ lý Sáng tác", nền tảng cần kết nối đến các dịch vụ AI như Gemini của Google.
          <br>
          Bằng cách sử dụng API Key của riêng bạn, bạn có toàn quyền kiểm soát và chi trả cho việc sử dụng AI của mình.
          <br>
          <a
            href="https://aistudio.google.com/app/api-keys"
            target="_blank"
            class="underline font-semibold"
          >Nhấn vào đây để lấy API Key miễn phí từ Google AI Studio.</a>
        </p>
      </template>
    </UAlert>

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
              class="w-full"
              :items="['gemini', 'openai', 'groq']"
            />
          </UFormField>
          <UFormField
            label="API Key"
            name="apiKey"
            class="mb-4"
          >
            <UInput
              v-model="addState.apiKey"
              class="w-full"
              type="password"
              placeholder="dán key của bạn vào đây"
            />
          </UFormField>
          <UButton
            type="submit"
            :loading="isLoading"
          >
            Lưu Key
          </UButton>
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
              class="w-full"
              disabled
            />
          </UFormField>
          <UFormField
            label="API Key mới"
            name="apiKey"
            class="mb-4"
          >
            <UInput
              v-model="editState.apiKey"
              type="password"
              class="w-full"
              placeholder="Nhập key mới để thay thế"
            />
          </UFormField>
          <UButton
            type="submit"
            :loading="isLoading"
          >
            Lưu thay đổi
          </UButton>
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

const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const selectedKey = ref<ApiKeyRow | null>(null)

type ApiKeyRow = {
  _id: string
  provider: string
  encryptedKey: string
}

const { data: apiKeys, refresh } = await useFetch<ApiKeyRow[]>('/api/keys', {
  default: () => []
})

const columns: TableColumn<ApiKeyRow>[] = [
  { accessorKey: 'provider', header: 'Nhà cung cấp' },
  {
    accessorKey: 'encryptedKey',
    header: 'Key',
    cell: ({ row }) => {
      const key = row.getValue('encryptedKey') as string
      return h(
        'span',
        { class: 'font-mono' },
        `${key?.substring(0, 4)}...${key?.slice(-4)}`
      )
    }
  },
  {
    id: 'actions',
    header: () => h('div', { class: 'text-right' }, 'Hành động'),
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right' },
        h(
          UDropdownMenu,
          { items: getActionItems(row), content: { align: 'end' } },
          () =>
            h(UButton, {
              icon: 'i-heroicons-ellipsis-horizontal-20-solid',
              color: 'gray',
              variant: 'ghost'
            })
        )
      )
  }
]

function openEditModal(key: ApiKeyRow) {
  selectedKey.value = key
  editState.provider = key.provider
  editState.apiKey = ''
  isEditModalOpen.value = true
}

function getActionItems(row: Row<ApiKeyRow>) {
  return [
    {
      label: 'Sửa',
      icon: 'i-heroicons-pencil-square-20-solid',
      onSelect: () => openEditModal(row.original)
    },
    { type: 'separator' as const },
    {
      label: 'Xoá',
      labelClass: 'text-red-500 dark:text-red-400',
      icon: 'i-heroicons-trash-20-solid',
      onSelect: () => deleteKey(row.original._id)
    }
  ]
}

// --- Form Thêm Mới ---
const addSchema = z.object({
  provider: z.string(),
  apiKey: z.string().min(10, 'API Key không hợp lệ')
})
type AddSchema = z.output<typeof addSchema>
const addState = reactive({ provider: 'gemini', apiKey: '' })

async function submitAddKey(event: FormSubmitEvent<AddSchema>) {
  isLoading.value = true
  try {
    await $fetch('/api/keys', { method: 'POST', body: event.data })
    toast.add({ title: 'Thêm key thành công!', color: 'success' })
    isAddModalOpen.value = false
    addState.apiKey = ''
    await refresh()
  } catch (e: any) {
    toast.add({
      title: 'Lỗi!',
      description: e.data?.statusMessage || 'Đã xảy ra lỗi',
      color: 'warning'
    })
  } finally {
    isLoading.value = false
  }
}

// --- Form Chỉnh Sửa ---
const editSchema = z.object({
  provider: z.string(),
  apiKey: z.string().min(10, 'API Key mới không hợp lệ')
})
type EditSchema = z.output<typeof editSchema>
const editState = reactive({ provider: '', apiKey: '' })

async function submitEditKey(event: FormSubmitEvent<EditSchema>) {
  if (!selectedKey.value) return
  isLoading.value = true
  try {
    await $fetch(`/api/keys/${selectedKey.value._id}`, {
      method: 'PUT',
      body: { apiKey: event.data.apiKey }
    })
    toast.add({ title: 'Cập nhật key thành công!', color: 'success' })
    isEditModalOpen.value = false
    await refresh()
  } catch (e: any) {
    toast.add({
      title: 'Lỗi!',
      description: e.data?.statusMessage || 'Đã xảy ra lỗi',
      color: 'warning'
    })
  } finally {
    isLoading.value = false
  }
}

// --- Hàm Xóa ---
async function deleteKey(id: string) {
  if (!confirm('Bạn có chắc chắn muốn xóa key này?')) return
  try {
    await $fetch(`/api/keys/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Xóa key thành công!', color: 'success' })
    await refresh()
  } catch (e: any) {
    toast.add({
      title: 'Lỗi!',
      description: e.data?.statusMessage || 'Đã xảy ra lỗi',
      color: 'warning'
    })
  }
}
</script>
