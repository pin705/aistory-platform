<template>
  <UContainer class="py-8">
    <UAlert
      icon="i-heroicons-light-bulb"
      color="primary"
      variant="subtle"
      title="Tại sao cần API Key & Model?"
      class="mb-8"
    >
      <template #description>
        <p>Sử dụng API Key của riêng bạn để kiểm soát chi phí. Chọn Model AI phù hợp với nhu cầu của bạn: các model 'flash' nhanh hơn và rẻ hơn cho các tác vụ đơn giản, trong khi các model 'pro' mạnh mẽ hơn cho việc sáng tác phức tạp.</p>
        <a
          href="https://aistudio.google.com/app/api-keys"
          target="_blank"
          class="underline font-semibold"
        >Nhấn vào đây để lấy API Key miễn phí từ Google AI Studio.</a>
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
              :items="['gemini']"
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
          <UFormField
            label="Model AI mặc định"
            name="apiModel"
            class="mb-4"
          >
            <USelectMenu
              v-model="addState.apiModel"
              class="w-full"
              :items="geminiModels"
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
            description="Bỏ trống nếu không muốn thay đổi."
          >
            <UInput
              v-model="editState.apiKey"
              type="password"
              class="w-full"
              placeholder="Nhập key mới để thay thế"
            />
          </UFormField>
          <UFormField
            label="Model AI mặc định"
            name="apiModel"
            class="mb-4"
          >
            <USelectMenu
              v-model="editState.apiModel"
              class="w-full"
              :items="geminiModels"
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
  apiModel: string
}

const geminiModels = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.5-flash-lite']

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
  { accessorKey: 'apiModel', header: 'Model Mặc định' },
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
  editState.apiModel = key.apiModel || geminiModels[0]
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
  apiKey: z.string().min(10, 'API Key không hợp lệ'),
  apiModel: z.string().optional()
})

// --- Form Chỉnh Sửa ---
const editSchema = z.object({
  provider: z.string(),
  apiKey: z.string().min(10, 'API Key mới không hợp lệ'),
  apiModel: z.string().optional()
})

type AddSchema = z.output<typeof addSchema>
const addState = reactive({ provider: 'gemini', apiKey: '', apiModel: geminiModels[0] })

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

type EditSchema = z.output<typeof editSchema>
const editState = reactive({ provider: '', apiKey: '', apiModel: geminiModels[0] })

async function submitEditKey(event: FormSubmitEvent<EditSchema>) {
  if (!selectedKey.value) return
  isLoading.value = true
  try {
    await $fetch(`/api/keys/${selectedKey.value._id}`, {
      method: 'PUT',
      body: { apiKey: event.data.apiKey, apiModel: event.data.apiModel }
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
