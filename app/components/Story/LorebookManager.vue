<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Quản lý các nhân vật trong truyện.
      </p>
      <UButton
        size="sm"
        icon="i-heroicons-plus"
        @click="openCharacterModal(null)"
      >
        Thêm Nhân vật
      </UButton>
    </div>

    <div class="space-y-2 mt-4 max-h-[60vh] overflow-y-auto">
      <div
        v-for="char in characters"
        :key="char._id"
        class="p-2 border rounded-md relative group"
      >
        <p class="font-bold">
          {{ char.name }} <UBadge
            size="xs"
            variant="subtle"
          >
            {{ char.role }}
          </UBadge>
        </p>
        <p class="text-xs text-gray-500 line-clamp-2">
          {{ char.description }}
        </p>
        <div class="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <UButton
            icon="i-heroicons-pencil-square"
            @click="openCharacterModal(char)"
          />
          <UButton
            color="red"
            icon="i-heroicons-trash"
            @click="deleteCharacter(char._id)"
          />
        </div>
      </div>
      <div
        v-if="!characters?.length"
        class="text-center text-sm text-gray-400 py-4"
      >
        Chưa có nhân vật nào.
      </div>
    </div>

    <UModal v-model:open="isCharacterModalOpen">
      <template #header>
        <h2 class="text-xl font-bold">
          {{ isEditingCharacter ? 'Chỉnh sửa Nhân vật' : 'Thêm Nhân vật mới' }}
        </h2>
      </template>
      <template #body>
        <UForm
          :state="characterFormState"
          :schema="characterSchema"
          @submit="saveCharacter"
        >
          <UFormField
            label="Tên nhân vật"
            name="name"
            class="mb-4"
          >
            <UInput
              v-model="characterFormState.name"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="Vai trò"
            name="role"
            class="mb-4"
          >
            <USelectMenu
              v-model="characterFormState.role"
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
              v-model="characterFormState.description"
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
              v-model="characterFormState.backstory"
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
              v-model="characterFormState.abilities"
              class="w-full"
              :rows="3"
            />
          </UFormField>
          <div class="flex justify-end gap-3">
            <UButton
              color="error"
              variant="ghost"
              @click="isCharacterModalOpen = false"
            >
              Hủy
            </UButton>
            <UButton
              type="submit"
              :loading="isSavingCharacter"
            >
              {{ isEditingCharacter ? 'Lưu thay đổi' : 'Thêm nhân vật' }}
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'

// Component này nhận `storyId` từ component cha
const props = defineProps({
  storyId: {
    type: String,
    required: true
  }
})

const toast = useToast()

// Toàn bộ logic quản lý nhân vật được gói gọn trong component này
const { data: characters, refresh: refreshCharacters } = await useFetch(`/api/stories/${props.storyId}/characters`)

const isCharacterModalOpen = ref(false)
const isSavingCharacter = ref(false)
const selectedCharacter = ref<any>(null)
const isEditingCharacter = computed(() => !!selectedCharacter.value)

const characterSchema = z.object({ name: z.string().min(2, 'Tên quá ngắn') })
const characterFormState = reactive({ name: '', role: 'Nhân vật phụ', description: '', backstory: '', abilities: '' })

function openCharacterModal(character: any | null) {
  if (character) {
    selectedCharacter.value = character
    Object.assign(characterFormState, character)
  } else {
    selectedCharacter.value = null
    Object.assign(characterFormState, { name: '', role: 'Nhân vật phụ', description: '', backstory: '', abilities: '' })
  }
  isCharacterModalOpen.value = true
}

async function saveCharacter() {
  isSavingCharacter.value = true
  try {
    if (isEditingCharacter.value) {
      await $fetch(`/api/characters/${selectedCharacter.value._id}`, { method: 'PUT', body: characterFormState })
      toast.add({ title: 'Cập nhật nhân vật thành công!' })
    } else {
      await $fetch(`/api/stories/${props.storyId}/characters`, { method: 'POST', body: characterFormState })
      toast.add({ title: 'Thêm nhân vật thành công!' })
    }
    isCharacterModalOpen.value = false
    await refreshCharacters()
  } catch (e: any) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'red' })
  } finally {
    isSavingCharacter.value = false
  }
}

async function deleteCharacter(characterId: string) {
  if (!confirm('Bạn có chắc chắn muốn xóa nhân vật này?')) return
  try {
    await $fetch(`/api/characters/${characterId}`, { method: 'DELETE' })
    toast.add({ title: 'Xóa nhân vật thành công!', color: 'green' })
    await refreshCharacters()
  } catch (e: any) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'red' })
  }
}
</script>
