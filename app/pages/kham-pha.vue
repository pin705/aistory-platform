<template>
  <UContainer class="py-10">
    <div class="text-center mb-8">
      <UButton
        size="xl"
        variant="ghost"
        class="text-2xl font-bold"
      >
        <template #leading>
          <UIcon
            name="i-heroicons-book-open-solid"
            class="w-8 h-8"
          />
        </template>

        Khám phá Truyện

        <!-- <template #trailing>
          <UIcon name="i-heroicons-chevron-down-20-solid" class="w-5 h-5" />
        </template> -->
      </UButton>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <aside class="lg:col-span-1 lg:sticky top-20 self-start">
        <UCard>
          <div class="space-y-6">
            <div>
              <h2 class="text-xl font-bold mb-4">
                Tìm truyện của bạn
              </h2>
              <UInput
                v-model="filters.q"
                placeholder="Tìm theo tên truyện..."
                icon="i-heroicons-magnifying-glass"
                class="w-full"
              />
            </div>
            <UFormField
              label="Bộ lọc nâng cao"
              :toggleable="true"
              class="font-semibold"
            >
              <USelectMenu
                v-model="filters.genre"
                :items="genresFromAPI"
                placeholder="Tất cả thể loại"
                clearable
                class=" w-full"
              />
            </UFormField>
            <UFormField
              label="Sắp xếp nâng cao"
              :toggleable="true"
              class="font-semibold"
            >
              <USelectMenu
                v-model="filters.sort"
                :items="sortOptions"
                value-key="value"
                class=" w-full"
              />
            </UFormField>
            <UButton
              label="Đặt lại bộ lọc"
              variant="ghost"
              class="w-full justify-center"
              color="neutral"
              @click="resetFilters"
            />
          </div>
        </UCard>
      </aside>

      <main class="lg:col-span-3">
        <div
          v-if="!pending || stories.length > 0"
          class="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6"
        >
          <StoryCard
            v-for="story in stories"
            :key="story._id"
            :story="story"
          />
        </div>

        <div
          ref="scrollTrigger"
          class="text-center py-8"
        >
          <p
            v-if="pending"
            class="text-gray-500"
          >
            Đang tải thêm truyện...
          </p>
          <p
            v-if="!pending && noMoreResults"
            class="text-gray-400"
          >
            Bạn đã xem hết tất cả truyện.
          </p>
        </div>
      </main>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { useInfiniteScroll } from '@vueuse/core'
import { ref, reactive, watch } from 'vue'

useHead({ title: 'Khám phá Truyện | Sáng Tác Truyện' })

const { data: genresFromAPI } = await useFetch<string[]>('/api/genres', { default: () => [] })

// ----- STATE QUẢN LÝ -----
const stories = ref<any[]>([])
const page = ref(1)
const pending = ref(false)
const noMoreResults = ref(false)
const scrollTrigger = ref<HTMLElement | null>(null)

// ----- BỘ LỌC VÀ SẮP XẾP -----
const sortOptions = [
  { label: 'Mới cập nhật', value: { sort: 'updatedAt', direction: 'desc' } },
  { label: 'Mới nhất', value: { sort: 'createdAt', direction: 'desc' } },
  { label: 'Lượt xem cao', value: { sort: 'views', direction: 'desc' } },
  { label: 'Rating cao', value: { sort: 'averageRating', direction: 'desc' } }
]

const filters = reactive({
  q: '',
  genre: undefined,
  sort: sortOptions[0].value
})

// ----- LOGIC FETCH DỮ LIỆU -----
async function fetchStories() {
  if (pending.value || noMoreResults.value) return

  pending.value = true
  try {
    const newStories = await $fetch<any[]>('/api/stories/public', {
      query: {
        page: page.value,
        limit: 12,
        q: filters.q || undefined,
        genre: filters.genre || undefined,
        sort: filters.sort.sort,
        direction: filters.sort.direction
      }
    })

    if (newStories.length === 0) {
      noMoreResults.value = true
    } else {
      stories.value.push(...newStories)
      page.value++
    }
  } catch (error) {
    console.error('Failed to fetch stories:', error)
  } finally {
    pending.value = false
  }
}

// Hàm reset và fetch lại từ đầu khi bộ lọc thay đổi
function applyFilters() {
  stories.value = []
  page.value = 1
  noMoreResults.value = false
  fetchStories()
}

function resetFilters() {
  filters.q = ''
  filters.genre = undefined
  filters.sort = sortOptions[0].value
}

// Theo dõi sự thay đổi của bộ lọc
watch(filters, applyFilters, { deep: true })

// ----- CUỘN VÔ HẠN (INFINITE SCROLL) -----
useInfiniteScroll(
  scrollTrigger,
  () => {
    fetchStories()
  },
  { distance: 200 } // Tải thêm khi còn cách 200px
)

// Tải trang đầu tiên khi component được tạo
onMounted(() => {
  if (stories.value.length === 0) {
    fetchStories()
  }
})
</script>
