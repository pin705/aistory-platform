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
            @click="openModal(null)"
             color="neutral"
          >
            Thêm Địa danh
          </UButton>
        </div>
      </template>

      <div
        v-if="locations && locations.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <UCard
          v-for="location in locations"
          :key="location._id"
          class="group relative hover:ring-2 hover:ring-primary-500 transition-all"
        >
          <template #header>
            <h4 class="font-bold text-base truncate">
              {{ location.name }}
            </h4>
          </template>

          <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 h-[60px]">
            {{ location.description }}
          </p>

          <div class="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <UTooltip text="Chỉnh sửa">
              <UButton
                icon="i-heroicons-pencil-square"
                size="sm"
                variant="soft"
                @click="openModal(location)"
                 color="neutral"
              />
            </UTooltip>
            <UTooltip text="Xoá">
              <UButton
                icon="i-heroicons-trash"
                size="sm"
                variant="soft"
                color="error"
                @click="deleteLocation(location._id)"
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
          Chưa có địa danh nào được tạo.
        </p>
        <UButton
          class="mt-4"
          @click="openModal(null)"
           color="neutral"
        >
          Tạo địa danh đầu tiên
        </UButton>
      </div>
    </UCard>

    <UModal
      v-model:open="isModalOpen"
      :ui="{ width: 'sm:max-w-3xl' }"
    >
      <template #header>
        <h2 class="text-xl font-bold">
          {{ isEditing ? 'Sửa' : 'Thêm' }} Địa danh
        </h2>
      </template>
      <template #body>
        <UForm
          :state="formState"
          :schema="schema"
          @submit="saveLocation"
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
                <UFormField
                  label="Nhập ý tưởng của bạn"
                  name="ai_prompt"
                >
                  <UTextarea
                    v-model="aiPrompt"
                    :rows="3"
                    placeholder="Ví dụ: Một thành phố bay trên mây..."
                    class="w-full"
                  />
                </UFormField>
                <UButton
                  variant="soft"
                  :loading="isGenerating"
                  class="mt-2"
                  @click="handleGenerate"
                   color="neutral"
                >
                  Gợi ý
                </UButton>
              </div>

              <UFormField
                label="Tên Địa danh"
                name="name"
                required
              >
                <UInput
                  v-model="formState.name"
                  icon="i-heroicons-map-pin"
                  placeholder="Ví dụ: Một thành phố bay lơ lửng trên mây, được xây dựng bởi một chủng tộc cổ đại đã biến mất."
                  class="w-full"
                />
              </UFormField>
            </div>

            <div class="md:col-span-2 space-y-4">
              <UFormField
                label="Mô tả"
                name="description"
                description="Mô tả tổng quan về cảnh quan, khí hậu, lịch sử, dân cư..."
              >
                <UTextarea
                  v-model="formState.description"
                  :rows="8"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="Đặc điểm nổi bật"
                name="keyFeatures"
                description="Các tài nguyên đặc biệt, mối nguy hiểm, hoặc bí mật ẩn giấu tại nơi này."
              >
                <UTextarea
                  v-model="formState.keyFeatures"
                  :rows="5"
                  class="w-full"
                />
              </UFormField>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-8 border-t border-gray-200 dark:border-gray-800 pt-4">
            <UButton
              variant="ghost"
              @click="isModalOpen = false"
              color="error"
            >
              Hủy
            </UButton>
            <UButton
              type="submit"
              :loading="isLoading"
               color="neutral"
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

const { data: locations, refresh, pending } = await useFetch(`/api/stories/${props.storyId}/locations`, { default: () => [] })
const isModalOpen = ref(false)
const isLoading = ref(false)
const selectedLocation = ref<any>(null)
const isEditing = computed(() => !!selectedLocation.value)
const aiPrompt = ref('')
const isGenerating = ref(false)

const schema = z.object({ name: z.string().min(3, 'Tên quá ngắn') })
const formState = reactive({ name: '', description: '', keyFeatures: '' })

function openModal(location: any) {
  selectedLocation.value = location
  aiPrompt.value = ''
  if (location) {
    Object.assign(formState, location)
  } else {
    Object.assign(formState, { name: '', description: '', keyFeatures: '' })
  }
  isModalOpen.value = true
}

async function handleGenerate() {
  if (!aiPrompt.value) return toast.add({ title: 'Vui lòng nhập ý tưởng.', color: 'orange' })
  isGenerating.value = true
  try {
    const result = await $fetch('/api/lorebook/generate', {
      method: 'POST',
      body: { storyId: props.storyId, loreType: 'location', prompt: aiPrompt.value }
    })
    formState.name = result.name
    formState.description = result.description
    formState.keyFeatures = result.keyFeatures
    toast.add({ title: 'AI đã tạo gợi ý thành công!', icon: 'i-heroicons-sparkles' })
  } catch (e: any) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'red' })
  } finally {
    isGenerating.value = false
  }
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
  } catch (e: any) {
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
  } catch (e: any) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'red' })
  }
}
</script>
