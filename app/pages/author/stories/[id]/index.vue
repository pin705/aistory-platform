<template>
  <UContainer class="py-8">
    <div class="mb-8">
      <NuxtLink
        to="/author/dashboard"
        class="text-sm text-gray-500 hover:underline"
      >‹ Tác phẩm của tôi</NuxtLink>
      <h1 class="text-3xl font-bold mt-1">
        {{ story?.title }}
      </h1>
    </div>

    <div class="grid grid-cols-12 gap-8">
      <div class="col-span-2">
        <UTabs
          v-model="selectedTab"
          :items="tabsManager"
          orientation="vertical"
          color="neutral"
        />
      </div>

      <div class="col-span-10">
        <div v-if="selectedTab == 0">
          <StoryChapterManager :story-id="storyId" />
        </div>
        <div v-else-if="selectedTab == 1">
          <StoryCharacterManager :story-id="storyId" />
        </div>
        <div v-else-if="selectedTab == 2">
          <StoryFactionsManager :story-id="storyId" />
        </div>
        <div v-else-if="selectedTab == 3">
          <StoryRealmsManager :story-id="storyId" />
        </div>
        <div v-else-if="selectedTab == 4">
          <StoryLocationsManager :story-id="storyId" />
        </div>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
const route = useRoute()
const storyId = route.params.id as string

const tabsManager = [
  { slot: 'chapters', label: 'Quản lý Chương', icon: 'i-heroicons-book-open' },
  { slot: 'characters', label: 'Quản lý Nhân vật', icon: 'i-heroicons-user-group' },
  { slot: 'factions', label: 'Quản lý Thế lực', icon: 'i-heroicons-shield-check' },
  { slot: 'realms', label: 'Quản lý Cảnh giới', icon: 'i-lucide-bar-chart-big' },
  { slot: 'location', label: 'Quản lý Địa danh', icon: 'i-heroicons-map' }
]

const selectedTab = ref(0)

// (MỚI) State để theo dõi tab đang được chọn
// `useRoute().query.tab` cho phép chia sẻ link với tab đã chọn
// const selectedTab = computed(() => {
//   const tabQuery = route.query.tab as string
//   return tabsManager.find(t => t.slot === tabQuery) || tabsManager[0]
// })

// Cập nhật URL khi đổi tab (tốt cho UX và bookmark)
// watch(selectedTab, (newTab) => {
//   const router = useRouter()
//   router.replace({ query: { ...route.query, tab: newTab.slot } })
// })

const { data: story } = await useFetch(`/api/stories/${storyId}`)
useHead({ title: () => `Quản lý: ${story.value?.title || 'Truyện'}` })
</script>
