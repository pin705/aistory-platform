<template>
  <UModal v-model:open="isOpen">
    <template #header>
      <h2 class="text-xl font-bold">
        {{ isEditing ? 'Chỉnh sửa Bối Cảnh' : 'Thêm Bối Cảnh mới' }}
      </h2>
    </template>
    <template #body>
      <div
        v-if="!isEditing"
        class="p-4 bg-gray-50 dark:bg-gray-800 rounded-md mb-6"
      >
        <h3 class="font-semibold mb-2">
          Khởi tạo bằng AI
        </h3>
        <div class="space-y-3">
          <UFieldGroup
            label="Vai trò"
            name="ai_role"
          >
            <USelectMenu
              v-model="formState.role"
              :items="['Nhân vật chính', 'Nhân vật phụ', 'Phản diện', 'Quần chúng']"
            />
          </UFieldGroup>
          <UFieldGroup
            label="Ý tưởng / Bối cảnh nhân vật"
            name="ai_prompt"
          >
            <UTextarea
              v-model="aiPrompt"
              :rows="4"
              class="w-full"
              placeholder="Ví dụ: Một sát thủ về hưu, tính cách lạnh lùng nhưng yêu thương động vật. Bị cuốn vào vòng xoáy báo thù sau khi thú cưng bị hại."
            />
          </UFieldGroup>
          <UButton
            variant="soft"
            icon="i-heroicons-sparkles"
            :loading="isGenerating"
            @click="handleGenerateDetails"
          >
            Gợi ý chi tiết
          </UButton>
        </div>
      </div>
      <USeparator
        v-if="!isEditing"
        class="mb-6"
      />
      <UForm
        :state="formState"
        :schema="schema"
        @submit="save"
      >
        <UFormField
          label="Tên nhân vật"
          name="name"
          class="mb-4"
        >
          <UInput v-model="formState.name" />
        </UFormField>
        <UFormField
          v-if="isEditing"
          label="Vai trò"
          name="role"
          class="mb-4"
        >
          <USelectMenu
            v-model="formState.role"
            class="w-full"
            :items="['Nhân vật chính', 'Nhân vật phụ', 'Phản diện', 'Quần chúng']"
          />
        </UFormField>
        <UFormField
          label="Mô tả (Ngoại hình, tính cách)"
          name="description"
          class="mb-4"
        >
          <UTextarea
            v-model="formState.description"
            class="w-full"
            :rows="4"
          />
        </UFormField>
        <UFormField
          label="Tiểu sử / Quá khứ"
          name="backstory"
          class="mb-4"
        >
          <UTextarea
            v-model="formState.backstory"
            class="w-full"
            :rows="5"
          />
        </UFormField>
        <UFormField
          label="Năng lực / Kỹ năng"
          name="abilities"
          class="mb-4"
        >
          <UTextarea
            v-model="formState.abilities"
            class="w-full"
            :rows="3"
          />
        </UFormField>
        <div class="flex justify-end gap-3">
          <UButton
            color="error"
            variant="ghost"
            @click="isOpen = false"
          >
            Hủy
          </UButton>
          <UButton
            type="submit"
            :loading="isLoading"
          >
            {{ isEditing ? 'Lưu thay đổi' : 'Thêm nhân vật' }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from 'zod'

const props = defineProps<{ modelValue: boolean, storyId: string, characterData?: any | null }>()
const emit = defineEmits(['update:modelValue', 'success'])
const toast = useToast()

const isLoading = ref(false)
const isGenerating = ref(false) // State cho nút AI
const aiPrompt = ref('') // State cho ô nhập prompt AI

const isEditing = computed(() => !!props.characterData)

const schema = z.object({ name: z.string().min(2, 'Tên quá ngắn') })
const formState = reactive({ name: '', role: 'Nhân vật phụ', description: '', backstory: '', abilities: '' })

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

watch(() => props.modelValue, (isOpen) => {
  aiPrompt.value = '' // Luôn reset prompt AI khi mở modal
  if (isOpen && props.characterData) { // Chế độ sửa
    Object.assign(formState, props.characterData)
  } else if (isOpen && !props.characterData) { // Chế độ thêm mới
    Object.assign(formState, { name: '', role: 'Nhân vật phụ', description: '', backstory: '', abilities: '' })
  }
})

// (MỚI) Hàm gọi API gợi ý nhân vật
async function handleGenerateDetails() {
  if (!aiPrompt.value) {
    toast.add({ title: 'Vui lòng nhập ý tưởng cho nhân vật.', color: 'warning' })
    return
  }
  isGenerating.value = true
  try {
    const result = await $fetch('/api/characters/generate-details', {
      method: 'POST',
      body: {
        storyId: props.storyId,
        role: formState.role,
        prompt: aiPrompt.value
      }
    })

    // Tự động điền kết quả vào form
    formState.name = result.name
    formState.description = result.description
    formState.backstory = result.backstory
    formState.abilities = result.abilities
    toast.add({ title: 'AI đã tạo gợi ý thành công!', icon: 'i-heroicons-sparkles' })
  } catch (e: any) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'error' })
  } finally {
    isGenerating.value = false
  }
}

async function save() {
  isLoading.value = true
  try {
    const url = isEditing.value ? `/api/characters/${props.characterData._id}` : `/api/stories/${props.storyId}/characters`
    const method = isEditing.value ? 'PUT' : 'POST'
    await $fetch(url, { method, body: formState })
    toast.add({ title: isEditing.value ? 'Cập nhật thành công!' : 'Thêm nhân vật thành công!' })
    emit('success')
    isOpen.value = false
  } catch (e: any) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'error' })
  } finally {
    isLoading.value = false
  }
}
</script>
