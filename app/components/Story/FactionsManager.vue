<template>
  <div>
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="font-semibold text-lg">
            Quản lý Thế lực / Môn phái
          </h3>
          <UButton
            icon="i-heroicons-plus-circle"
            @click="openModal(null)"
          >
            Thêm Thế lực
          </UButton>
        </div>
      </template>

      <div
        v-if="factions && factions.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <UCard
          v-for="faction in factions"
          :key="faction._id"
          class="group relative hover:ring-2 hover:ring-primary-500 transition-all"
        >
          <template #header>
            <h4 class="font-bold text-base truncate">
              {{ faction.name }}
            </h4>
          </template>

          <p class="text-sm font-semibold text-primary-500 dark:text-primary-400 mb-2">
            {{ faction.ideology }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 h-[60px]">
            {{ faction.description }}
          </p>

          <div class="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <UTooltip text="Chỉnh sửa">
              <UButton
                icon="i-heroicons-pencil-square"
                size="sm"
                variant="soft"
                @click="openModal(faction)"
              />
            </UTooltip>
            <UTooltip text="Xoá">
              <UButton
                icon="i-heroicons-trash"
                size="sm"
                variant="soft"
                color="error"
                @click="deleteFaction(faction._id)"
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
          Chưa có thế lực nào.
        </p>
        <UButton
          class="mt-4"
          @click="openModal(null)"
        >
          Tạo thế lực đầu tiên
        </UButton>
      </div>
    </UCard>

    <UModal
      v-model:open="isModalOpen"
      :ui="{ width: 'sm:max-w-3xl' }"
    >
      <template #header>
        <h2 class="text-xl font-bold">
          {{ isEditing ? 'Sửa' : 'Thêm' }} Thế lực
        </h2>
      </template>
      <template #body>
        <UForm
          :state="formState"
          @submit="saveFaction"
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
                    placeholder="Ví dụ: Một tổ chức sát thủ bí ẩn, chỉ hoạt động về đêm, thờ phụng một vị thần bóng tối cổ xưa."
                      class="w-full"
                  />
                </UFormField>
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
                label="Tên Thế lực"
                name="name"
                required
              >
                <UInput
                  v-model="formState.name"
                  icon="i-heroicons-user-group"
                    class="w-full"
                />
              </UFormField>
            </div>

            <div class="md:col-span-2 space-y-4">
              <UFormField
                label="Tôn chỉ"
                name="ideology"
                description="Lý tưởng, mục đích hoạt động chính của thế lực."
                  class="w-full"
              >
                <UInput v-model="formState.ideology" />
              </UFormField>
              <UFormField
                label="Mô tả"
                name="description"
                description="Mô tả chi tiết về quy mô, địa bàn, phong cách, thành viên..."
                  class="w-full"
              >
                <UTextarea
                  v-model="formState.description"
                  :rows="8"
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
            >
              {{ isEditing ? 'Lưu thay đổi' : 'Thêm Thế lực' }}
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
// Toàn bộ phần script của bạn đã chính xác và được giữ nguyên
const props = defineProps<{ storyId: string }>()
const toast = useToast()

const { data: factions, refresh } = await useFetch(`/api/stories/${props.storyId}/factions`, { default: () => [] })
const isModalOpen = ref(false)
const isLoading = ref(false)
const selectedFaction = ref<any>(null)
const isEditing = computed(() => !!selectedFaction.value)
const aiPrompt = ref('')
const isGenerating = ref(false)

const formState = reactive({ name: '', ideology: '', description: '' })

function openModal(faction: any) {
  selectedFaction.value = faction
  aiPrompt.value = ''
  if (faction) Object.assign(formState, faction)
  else Object.assign(formState, { name: '', ideology: '', description: '' })
  isModalOpen.value = true
}

async function handleGenerate() {
  if (!aiPrompt.value) return toast.add({ title: 'Vui lòng nhập ý tưởng.', color: 'orange' })
  isGenerating.value = true
  try {
    const result = await $fetch('/api/lorebook/generate', {
      method: 'POST',
      body: { storyId: props.storyId, loreType: 'faction', prompt: aiPrompt.value }
    })
    formState.name = result.name
    formState.ideology = result.ideology
    formState.description = result.description
    toast.add({ title: 'AI đã tạo gợi ý thành công!', icon: 'i-heroicons-sparkles' })
  } catch (e: any) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'red' })
  } finally {
    isGenerating.value = false
  }
}

async function saveFaction() {
  isLoading.value = true
  try {
    const url = isEditing.value ? `/api/factions/${selectedFaction.value._id}` : `/api/stories/${props.storyId}/factions`
    const method = isEditing.value ? 'PUT' : 'POST'
    await $fetch(url, { method, body: formState })
    toast.add({ title: 'Lưu thành công!' })
    isModalOpen.value = false; await refresh()
  } catch (e: any) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'red' })
  } finally { isLoading.value = false }
}

async function deleteFaction(id: string) {
  if (!confirm('Bạn chắc chắn muốn xóa?')) return
  try {
    await $fetch(`/api/factions/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Xóa thành công!' }); await refresh()
  } catch (e: any) { toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'red' }) }
}
</script>
