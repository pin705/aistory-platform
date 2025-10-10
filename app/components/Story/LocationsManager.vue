<template>
  <div>
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="font-semibold text-lg">
            Quản lý Địa danh / Khu vực
          </h3>
          <UButton
            icon="i-heroicons-plus-circle"
            color="neutral"
            @click="openModal(null)"
          >
            Thêm Địa danh
          </UButton>
        </div>
      </template>

      <UTable
        :rows="locations"
        :columns="columns"
      />

      <div
        v-if="pending"
        class="text-center p-4"
      >
        Đang tải...
      </div>
      <div
        v-if="!pending && locations.length === 0"
        class="text-center py-6 text-gray-500"
      >
        <p>Chưa có địa danh nào được tạo.</p>
      </div>
    </UCard>

    <UModal v-model:open="isModalOpen">
      <template #body>
        <UCard>
          <template #header>
            <h2 class="text-xl font-bold">
              {{ isEditing ? 'Sửa' : 'Thêm' }} Địa danh
            </h2>
          </template>
          <UForm
            :state="formState"
            :schema="schema"
            @submit="saveLocation"
          >
            <UFormField
              label="Tên Địa danh"
              name="name"
              class="mb-4"
              required
            >
              <UInput
                v-model="formState.name"
                placeholder="Ví dụ: Vạn Thú Sơn Mạch"
              />
            </UFormField>
            <UFormField
              label="Mô tả"
              name="description"
              class="mb-4"
            >
              <UTextarea
                v-model="formState.description"
                :rows="5"
                placeholder="Mô tả cảnh quan, khí hậu, lịch sử..."
              />
            </UFormField>
            <UFormField
              label="Đặc điểm nổi bật"
              name="keyFeatures"
              class="mb-4"
            >
              <UTextarea
                v-model="formState.keyFeatures"
                :rows="3"
                placeholder="Tài nguyên, nguy hiểm, bí mật ẩn giấu..."
              />
            </UFormField>
            <div class="flex justify-end gap-2 mt-6">
              <UButton
                variant="ghost"
                color="gray"
                @click="isModalOpen = false"
              >
                Hủy
              </UButton>
              <UButton
                type="submit"
                :loading="isLoading"
              >
                Lưu
              </UButton>
            </div>
          </UForm>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import { z } from 'zod'

const props = defineProps<{ storyId: string }>()
const toast = useToast()
const UButton = resolveComponent('UButton')

// --- State & Data Fetching ---
const { data: locations, refresh, pending } = await useFetch(`/api/stories/${props.storyId}/locations`, { default: () => [] })
const isModalOpen = ref(false)
const isLoading = ref(false)
const selectedLocation = ref<any>(null)
const isEditing = computed(() => !!selectedLocation.value)

// --- Form Logic ---
const schema = z.object({
  name: z.string().min(3, 'Tên quá ngắn')
})
const formState = reactive({ name: '', description: '', keyFeatures: '' })

// --- Table & Actions ---
const columns = [
  { accessorKey: 'name', header: 'Tên Địa danh', sortable: true },
  { accessorKey: 'description', header: 'Mô tả' },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => h('div', { class: 'text-right flex justify-end gap-1' }, [
      h(UButton, { icon: 'i-heroicons-pencil-square', variant: 'ghost', onClick: () => openModal(row) }),
      h(UButton, { icon: 'i-heroicons-trash', variant: 'ghost', color: 'red', onClick: () => deleteLocation(row._id) })
    ])
  }
]

function openModal(location | null) {
  selectedLocation.value = location
  if (location) {
    Object.assign(formState, location)
  } else {
    Object.assign(formState, { name: '', description: '', keyFeatures: '' })
  }
  isModalOpen.value = true
}

async function saveLocation() {
  isLoading.value = true
  try {
    const url = isEditing.value ? `/api/locations/${selectedLocation.value._id}` : `/api/stories/${props.storyId}/locations`
    const method = isEditing.value ? 'PUT' : 'POST'
    await $fetch(url, { method, body: formState })
    toast.add({ title: 'Lưu thành công!' })
    isModalOpen.value = false
    await refresh()
  } catch (e) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'red' })
  } finally {
    isLoading.value = false
  }
}

async function deleteLocation(id: string) {
  if (!confirm('Bạn chắc chắn muốn xóa?')) return
  try {
    await $fetch(`/api/locations/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Xóa thành công!' })
    await refresh()
  } catch (e) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'red' })
  }
}
</script>
