<template>
  <UModal
    v-model:open="isOpen"
  >
    <template #header>
      <h2 class="text-xl font-bold">
        {{ isEditing ? 'Chỉnh sửa Nhân Vật' : 'Thêm Nhân Vật mới' }}
      </h2>
    </template>
    <template #body>
      <UForm
        :state="formState"
        :schema="schema"
        @submit="save"
      >
        <div class="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div class="md:col-span-2 space-y-6">
            <div
              v-if="!isEditing"
              class="p-4 bg-gray-50 dark:bg-gray-800 rounded-md border dark:border-gray-700"
            >
              <h3 class="font-semibold mb-2 flex items-center gap-2">
                <Icon name="i-heroicons-sparkles" /> Khởi tạo bằng AI
              </h3>
              <div class="space-y-3">
                <UFormField
                  label="Vai trò"
                  name="ai_role"
                >
                  <USelectMenu
                    v-model="formState.role"
                    :items="['Nhân vật chính', 'Nhân vật phụ', 'Phản diện', 'Quần chúng']"
                    class="w-full"
                  />
                </UFormField>
                <UFormField
                  label="Ý tưởng / Bối cảnh nhân vật"
                  name="ai_prompt"
                >
                  <UTextarea
                    v-model="aiPrompt"
                    :rows="4"
                    placeholder="Ví dụ: Một sát thủ về hưu, tính cách lạnh lùng..."
                    class="w-full"
                  />
                </UFormField>
                <UButton
                  variant="soft"
                  :loading="isGenerating"
                  block
                  @click="handleGenerateDetails"
                >
                  Gợi ý chi tiết
                </UButton>
              </div>
            </div>

            <UFormField
              label="Tên nhân vật"
              name="name"
              required
            >
              <UInput
                v-model="formState.name"
                icon="i-heroicons-user"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Vai trò"
              name="role"
            >
              <USelectMenu
                v-model="formState.role"
                :items="['Nhân vật chính', 'Nhân vật phụ', 'Phản diện', 'Quần chúng']"
                class="w-full"
              />
            </UFormField>
          </div>

          <div class="md:col-span-3">
            <USeparator label="Thông tin Mô tả" />
            <div class="space-y-4 pt-6">
              <UFormField
                label="Mô tả"
                name="description"
                description="Ngoại hình, khí chất, tính cách tổng quan của nhân vật."
              >
                <UTextarea
                  v-model="formState.description"
                  :rows="5"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="Tiểu sử / Quá khứ"
                name="backstory"
                description="Các sự kiện quan trọng đã định hình nên con người họ."
              >
                <UTextarea
                  v-model="formState.backstory"
                  :rows="6"
                  class="w-full"
                />
              </UFormField>
            </div>

            <USeparator
              label="Năng lực"
              class="mt-6"
            />
            <div class="space-y-4 pt-6">
              <UFormField
                label="Các kỹ năng / Công pháp"
                name="abilities"
              >
                <div class="space-y-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md border dark:border-gray-700">
                  <div
                    v-for="(ability, index) in formState.abilities"
                    :key="index"
                    class="flex items-center gap-2"
                  >
                    <UTextarea
                      v-model="formState.abilities[index]"
                      :rows="1"
                      autoresize
                      placeholder="Mô tả một kỹ năng..."
                      class="w-full"
                    />
                    <UButton
                      icon="i-heroicons-trash"
                      color="error"
                      variant="soft"
                      @click="removeAbility(index)"
                    />
                  </div>
                  <UButton
                    label="Thêm kỹ năng"
                    icon="i-heroicons-plus"
                    variant="outline"
                    size="sm"
                    @click="addAbility"
                  />
                </div>
              </UFormField>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-8 border-t border-gray-200 dark:border-gray-800 pt-4">
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
            color="neutral"
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

const schema = z.object({ name: z.string().min(2, 'Tên quá ngắn'), abilities: z.array(z.string()).optional() })
const formState = reactive({ name: '', role: 'Nhân vật phụ', description: '', backstory: '', abilities: [] })

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

watch(() => props.modelValue, (isOpen) => {
  aiPrompt.value = ''
  if (isOpen && props.characterData) { // Chế độ sửa
    Object.assign(formState, props.characterData)
    // Đảm bảo abilities luôn là một mảng
    if (typeof props.characterData.abilities === 'string') {
      formState.abilities = [props.characterData.abilities]
    }
  } else if (isOpen && !props.characterData) { // Chế độ thêm mới
    Object.assign(formState, { name: '', role: 'Nhân vật phụ', description: '', backstory: '', abilities: [''] }) // Bắt đầu với 1 ô trống
  }
})

function addAbility() {
  formState.abilities.push('')
}

function removeAbility(index: number) {
  formState.abilities.splice(index, 1)
}

// (MỚI) Hàm gọi API gợi ý nhân vật
async function handleGenerateDetails() {
  if (!aiPrompt.value) {
    toast.add({ title: 'Vui lòng nhập ý tưởng cho nhân vật.', color: 'warning' })
    return
  }
  isGenerating.value = true
  try {
    const result = await $fetch('/api/lorebook/generate', {
      method: 'POST',
      body: { storyId: props.storyId, loreType: 'character', prompt: aiPrompt.value }
    })

    // Tự động điền kết quả vào form
    formState.name = result.name
    formState.description = result.description
    formState.backstory = result.backstory
    formState.abilities = result.abilities
    toast.add({ title: 'AI đã tạo gợi ý thành công!', icon: 'i-heroicons-sparkles' })
  } catch (e) {
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
