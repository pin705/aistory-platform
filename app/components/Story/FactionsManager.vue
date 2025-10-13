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
            color="neutral"
            @click="openModal(null)"
          >
            Thêm Thế lực
          </UButton>
        </div>
      </template>
      <UTable
        :data="factions"
        :columns="columns"
      />
    </UCard>

    <UModal v-model:open="isModalOpen">
      <template #header>
        <h2 class="text-xl font-bold">
          {{ isEditing ? 'Sửa' : 'Thêm' }} Thế lực
        </h2>
      </template>
      <template #body>
        <div
          v-if="!isEditing"
          class="p-4 bg-gray-50 dark:bg-gray-800 rounded-md mb-6 border dark:border-gray-700"
        >
          <h3 class="font-semibold mb-2 flex items-center gap-2">
            <Icon name="i-heroicons-sparkles" /> Khởi tạo bằng AI
          </h3>
          <UFormGroup
            label="Nhập ý tưởng của bạn"
            name="ai_prompt"
          >
            <UTextarea
              v-model="aiPrompt"
              :rows="3"
              placeholder="Ví dụ: Một môn phái tà đạo chuyên luyện thi thể, mục tiêu là trường sinh bất tử."
            />
          </UFormGroup>
          <UButton
            variant="soft"
            :loading="isGenerating"
            class="mt-2"
            @click="handleGenerate"
          >
            Gợi ý
          </UButton>
        </div>

        <UForm
          :state="formState"
          @submit="saveFaction"
        >
          <UFormField
            label="Tên Thế lực"
            name="name"
            class="mb-4"
          >
            <UInput v-model="formState.name" />
          </UFormField>
          <UFormField
            label="Tôn chỉ"
            name="ideology"
            class="mb-4"
          >
            <UInput v-model="formState.ideology" />
          </UFormField>
          <UFormField
            label="Mô tả"
            name="description"
            class="mb-4"
          >
            <UTextarea v-model="formState.description" />
          </UFormField>
          <div class="flex justify-end gap-2">
            <UButton
              variant="ghost"
              color="gray"
              @click="isModalOpen = false"
            >
              Hủy
            </UButton><UButton
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
const columns = [
  { accessorKey: 'name', header: 'Tên' }, { accessorKey: 'ideology', header: 'Tôn chỉ' },
  { id: 'actions', cell: ({ row }) => h('div', { class: 'text-right' }, [h(resolveComponent('UButton'), { icon: 'i-heroicons-pencil-square', variant: 'ghost', onClick: () => openModal(row) }), h(resolveComponent('UButton'), { icon: 'i-heroicons-trash', variant: 'ghost', color: 'red', onClick: () => deleteFaction(row._id) })]) }
]

function openModal(faction) {
  selectedFaction.value = faction
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
    // Tự động điền kết quả vào form
    formState.name = result.name
    formState.ideology = result.ideology
    formState.description = result.description
    toast.add({ title: 'AI đã tạo gợi ý thành công!', icon: 'i-heroicons-sparkles' })
  } catch (e) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'error' })
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
  } catch (e) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'error' })
  } finally { isLoading.value = false }
}

async function deleteFaction(id: string) {
  if (!confirm('Bạn chắc chắn muốn xóa?')) return
  try {
    await $fetch(`/api/factions/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Xóa thành công!' }); await refresh()
  } catch (e) { toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'error' }) }
}
</script>
