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

      <div
        v-if="realms && realms.length > 0"
        class="space-y-4"
      >
        <UCard
          v-for="realm in realms"
          :key="realm._id"
          class="group relative"
        >
          <div class="flex items-start gap-4">
            <div class="text-center flex-shrink-0">
              <p class="text-xs text-gray-500">
                Cấp
              </p>
              <p class="text-2xl font-bold text-primary">
                {{ realm.level }}
              </p>
            </div>
            <div class="flex-1">
              <h4 class="font-bold text-base">
                {{ realm.name }}
              </h4>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{ realm.description }}
              </p>
            </div>
          </div>

          <div class="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <UTooltip text="Chỉnh sửa">
              <UButton
                icon="i-heroicons-pencil-square"
                size="sm"
                variant="soft"
                @click="openModal(realm)"
              />
            </UTooltip>
            <UTooltip text="Xoá">
              <UButton
                icon="i-heroicons-trash"
                size="sm"
                color="red"
                variant="soft"
                @click="deleteRealm(realm._id)"
              />
            </UTooltip>
          </div>
        </UCard>
      </div>

      <div
        v-else
        class="text-center py-10 border-2 border-dashed rounded-lg"
      >
        <p class="text-gray-500">
          Chưa có cảnh giới nào được thiết lập.
        </p>
        <UButton
          class="mt-4"
          @click="openModal(null)"
        >
          Tạo cảnh giới đầu tiên
        </UButton>
      </div>
    </UCard>

    <UModal
      v-model:open="isModalOpen"
      :ui="{ width: 'sm:max-w-3xl' }"
    >
      <template #header>
        <h2 class="text-xl font-bold">
          {{ isEditing ? 'Sửa' : 'Thêm' }} Cảnh giới
        </h2>
      </template>
      <template #body>
        <UForm
          :state="formState"
          :schema="schema"
          @submit="saveRealm"
        >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-1 space-y-6">
              <div
                v-if="!isEditing"
                class="p-4 bg-gray-50 dark:bg-gray-800 rounded-md border dark:border-gray-700"
              >
                <h3 class="font-semibold mb-2 flex items-center gap-2">
                  <Icon name="i-heroicons-sparkles" /> Khởi tạo bằng AI
                </h3>
                <UFieldGroup
                  label="Nhập ý tưởng của bạn"
                  name="ai_prompt"
                >
                  <UTextarea
                    v-model="aiPrompt"
                    :rows="3"
                    placeholder="Ví dụ: Cảnh giới ngưng tụ linh khí thành thể rắn..."
                    class="w-full"
                  />
                </UFieldGroup>
                <UButton
                  variant="soft"
                  :loading="isGenerating"
                  class="mt-2"
                  @click="handleGenerate"
                >
                  Gợi ý
                </UButton>
              </div>

              <UFormField
                label="Tên Cảnh giới"
                name="name"
                required
              >
                <UInput
                  v-model="formState.name"
                  icon="i-heroicons-bolt"
                  placeholder="Ví dụ: Kim Đan Kỳ"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="Cấp độ (Số thứ tự)"
                name="level"
                required
              >
                <UInput
                  v-model.number="formState.level"
                  type="number"
                  icon="i-heroicons-bars-arrow-up"
                  placeholder="Dùng để sắp xếp, vd: 3"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div class="md:col-span-2 space-y-4">
              <UFormField
                label="Mô tả"
                name="description"
                description="Mô tả các đặc điểm, sức mạnh, và biểu hiện của tu sĩ ở cảnh giới này."
              >
                <UTextarea
                  v-model="formState.description"
                  :rows="8"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="Điều kiện đột phá"
                name="breakthroughConditions"
                description="Cần những loại đan dược, công pháp, tâm cảnh hay kỳ ngộ gì để đột phá lên cảnh giới tiếp theo."
              >
                <UTextarea
                  v-model="formState.breakthroughConditions"
                  :rows="5"
                  class="w-full"
                />
              </UFormField>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-8 border-t border-gray-200 dark:border-gray-800 pt-4">
            <UButton
              variant="ghost"
              color="gray"
              @click="isModalOpen = false"
            >
              Hủy
            </UButton>
            <UButton
              color="neutral"
              type="submit"
              :loading="isLoading"
            >
              Lưu
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
// Toàn bộ phần script của bạn đã chính xác và được giữ nguyên
import { z } from 'zod'

const props = defineProps<{ storyId: string }>()
const toast = useToast()

const { data: realms, refresh, pending } = await useFetch(`/api/stories/${props.storyId}/realms`, {
  default: () => [],
  transform: data => data.sort((a, b) => a.level - b.level)
})

const isModalOpen = ref(false)
const isLoading = ref(false)
const selectedRealm = ref<any>(null)
const isEditing = computed(() => !!selectedRealm.value)
const aiPrompt = ref('')
const isGenerating = ref(false)

const schema = z.object({
  name: z.string().min(2, 'Tên quá ngắn'),
  level: z.number().min(0, 'Cấp độ không thể âm')
})
const formState = reactive({ name: '', level: 0, description: '', breakthroughConditions: '' })

function openModal(realm: any) {
  selectedRealm.value = realm
  aiPrompt.value = ''
  if (realm) {
    Object.assign(formState, realm)
  } else {
    const nextLevel = realms.value.length > 0 ? Math.max(...realms.value.map(r => r.level)) + 1 : 1
    Object.assign(formState, { name: '', level: nextLevel, description: '', breakthroughConditions: '' })
  }
  isModalOpen.value = true
}

async function handleGenerate() {
  if (!aiPrompt.value) return toast.add({ title: 'Vui lòng nhập ý tưởng.', color: 'orange' })
  isGenerating.value = true
  try {
    const result = await $fetch('/api/lorebook/generate', {
      method: 'POST',
      body: { storyId: props.storyId, loreType: 'realm', prompt: aiPrompt.value }
    })
    formState.name = result.name
    formState.level = result.level
    formState.description = result.description
    formState.breakthroughConditions = result.breakthroughConditions
    toast.add({ title: 'AI đã tạo gợi ý thành công!', icon: 'i-heroicons-sparkles' })
  } catch (e: any) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'red' })
  } finally {
    isGenerating.value = false
  }
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
  } catch (e: any) {
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
  } catch (e: any) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'red' })
  }
}
</script>
