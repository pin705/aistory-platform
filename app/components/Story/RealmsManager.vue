<template>
  <div>
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="font-semibold text-lg">
            Hệ thống Tu luyện / Cảnh giới
          </h3>
          <UButton
            icon="i-heroicons-plus-circle"
            color="neutral"
            @click="openModal(null)"
          >
            Thêm Cảnh giới
          </UButton>
        </div>
      </template>

      <UTable
        :rows="realms"
        :columns="columns"
      />

      <div
        v-if="pending"
        class="text-center p-4"
      >
        Đang tải...
      </div>
      <div
        v-if="!pending && realms.length === 0"
        class="text-center py-6 text-gray-500"
      >
        <p>Chưa có cảnh giới nào được thiết lập.</p>
      </div>
    </UCard>

    <UModal v-model:open="isModalOpen">
      <template #body>
        <UCard>
          <template #header>
            <h2 class="text-xl font-bold">
              {{ isEditing ? 'Sửa' : 'Thêm' }} Cảnh giới
            </h2>
          </template>
          <UForm
            :state="formState"
            :schema="schema"
            @submit="saveRealm"
          >
            <UFormField
              label="Tên Cảnh giới"
              name="name"
              class="mb-4"
              required
            >
              <UInput
                v-model="formState.name"
                placeholder="Ví dụ: Kim Đan Kỳ"
              />
            </UFormField>
            <UFormField
              label="Cấp độ (Số thứ tự)"
              name="level"
              class="mb-4"
              required
            >
              <UInput
                v-model.number="formState.level"
                type="number"
                placeholder="Dùng để sắp xếp, vd: 3"
              />
            </UFormField>
            <UFormField
              label="Mô tả"
              name="description"
              class="mb-4"
            >
              <UTextarea
                v-model="formState.description"
                placeholder="Mô tả đặc điểm của người tu luyện ở cảnh giới này..."
              />
            </UFormField>
            <UFormField
              label="Điều kiện đột phá"
              name="breakthroughConditions"
              class="mb-4"
            >
              <UTextarea
                v-model="formState.breakthroughConditions"
                placeholder="Cần những gì để đột phá lên cảnh giới tiếp theo..."
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
const { data: realms, refresh, pending } = await useFetch(`/api/stories/${props.storyId}/realms`, {
  default: () => [],
  transform: data => data.sort((a, b) => a.level - b.level) // Luôn sắp xếp theo level
})
const isModalOpen = ref(false)
const isLoading = ref(false)
const selectedRealm = ref<any>(null)
const isEditing = computed(() => !!selectedRealm.value)

// --- Form Logic ---
const schema = z.object({
  name: z.string().min(2, 'Tên quá ngắn'),
  level: z.number().min(1, 'Cấp độ phải lớn hơn 0')
})
const formState = reactive({ name: '', level: 1, description: '', breakthroughConditions: '' })

// --- Table & Actions ---
const columns = [
  { accessorKey: 'level', header: 'Cấp độ', sortable: true },
  { accessorKey: 'name', header: 'Tên Cảnh giới', sortable: true },
  { accessorKey: 'description', header: 'Mô tả' },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => h('div', { class: 'text-right flex justify-end gap-1' }, [
      h(UButton, { icon: 'i-heroicons-pencil-square', variant: 'ghost', onClick: () => openModal(row) }),
      h(UButton, { icon: 'i-heroicons-trash', variant: 'ghost', color: 'red', onClick: () => deleteRealm(row._id) })
    ])
  }
]

function openModal(realm | null) {
  selectedRealm.value = realm
  if (realm) {
    Object.assign(formState, realm)
  } else {
    // Gợi ý level tiếp theo khi thêm mới
    const nextLevel = realms.value.length > 0 ? Math.max(...realms.value.map(r => r.level)) + 1 : 1
    Object.assign(formState, { name: '', level: nextLevel, description: '', breakthroughConditions: '' })
  }
  isModalOpen.value = true
}

async function saveRealm() {
  isLoading.value = true
  try {
    const url = isEditing.value ? `/api/realms/${selectedRealm.value._id}` : `/api/stories/${props.storyId}/realms`
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

async function deleteRealm(id: string) {
  if (!confirm('Bạn chắc chắn muốn xóa cảnh giới này?')) return
  try {
    await $fetch(`/api/realms/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Xóa thành công!' })
    await refresh()
  } catch (e) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'red' })
  }
}
</script>
