<template>
  <div class="flex justify-between items-center mb-6">
    <div>
      <h3 class="text-lg font-semibold">
        Quản lý Nhân vật
      </h3>
    </div>
    <UButton
      icon="i-heroicons-plus-circle"
      @click="openModal(null)"
       color="neutral"
    >
      Thêm Nhân vật
    </UButton>
  </div>

  <div class="mb-4">
    <UInput
      v-model="searchQuery"
      icon="i-heroicons-magnifying-glass"
      placeholder="Tìm kiếm nhân vật..."
    />
  </div>

  <div v-if="!pending && characterData.length">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <StoryCharacterCard
        v-for="character in characterData"
        :key="character._id"
        :character="character"
        @edit="openModal"
        @delete="deleteCharacter"
      />
    </div>
    <div class="flex justify-center mt-8">
      <UPagination
        v-model="page"
        :page-count="limit"
        :total="characterData.total"
      />
    </div>
  </div>
  <div
    v-else-if="pending"
    class="text-center py-10"
  >
    Đang tải...
  </div>
  <div
    v-else
    class="text-center py-16 border-2 border-dashed rounded-lg"
  >
    <p class="text-gray-500">
      Không tìm thấy nhân vật nào.
    </p>
  </div>

  <StoryCharacterModal
    v-model="isModalOpen"
    :story-id="storyId"
    :character-data="selectedCharacter"
    @success="refreshCharacters"
  />
</template>

<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'

const props = defineProps<{ storyId: string }>()
const toast = useToast()
const storyId = props.storyId

// ----- STATE -----
const isModalOpen = ref(false)
const selectedCharacter = ref<any | null>(null)

// ----- (CẬP NHẬT) State cho Tìm kiếm và Phân trang -----
const searchQuery = ref('')
const page = ref(1)
const limit = ref(12) // Hiển thị 12 nhân vật mỗi trang

// ----- (CẬP NHẬT) Fetch dữ liệu động với phân trang và tìm kiếm -----
const { data: characterData, refresh: refreshCharacters, pending } = await useFetch(`/api/stories/${storyId}/characters`, {
  query: {
    q: searchQuery,
    page: page,
    limit: limit
  },
  default: () => ({ characters: [], total: 0 }),
  watch: [page] // Tự động fetch lại khi `page` thay đổi
})

// Tự động tìm kiếm sau khi người dùng ngừng gõ
watchDebounced(searchQuery, () => {
  // Khi tìm kiếm, luôn quay về trang 1
  if (page.value !== 1) {
    page.value = 1
  } else {
    refreshCharacters()
  }
}, { debounce: 300 })

// ----- HÀNH ĐỘNG (MODAL & DELETE) -----
function openModal(character: any | null) {
  selectedCharacter.value = character
  isModalOpen.value = true
}

async function deleteCharacter(characterId: string) {
  if (!confirm('Bạn có chắc chắn muốn xóa nhân vật này?')) return
  try {
    await $fetch(`/api/characters/${characterId}`, { method: 'DELETE' })
    toast.add({ title: 'Xóa nhân vật thành công!' })
    await refreshCharacters()
  } catch (e: any) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'error' })
  }
}

useHead({ title: 'Quản lý Nhân vật' })
</script>
