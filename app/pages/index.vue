<template>
  <div v-if="homeData">
    <section class="mb-12">
      <UCarousel
        v-slot="{ item }"
        :items="homeData.featuredStories"
        :ui="{ item: 'basis-full' }"
        class="rounded-lg overflow-hidden"
        arrows
        indicators
      >
        <div class="relative aspect-[16/7] w-full">
          <img
            :src="item.coverImage"
            class="w-full h-full object-cover filter brightness-50"
            draggable="false"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <UContainer class="absolute bottom-0 left-0 right-0 py-4 sm:py-8 text-white">
            <h2 class="text-2xl sm:text-3xl md:text-5xl font-bold line-clamp-2">
              {{ item.title }}
            </h2>
            <p class="mt-2 max-w-2xl text-gray-300 line-clamp-2 text-sm sm:text-base">
              {{ item.description }}
            </p>
            <div class="mt-4 flex flex-wrap gap-2">
              <UBadge
                v-for="genre in item.genres"
                :key="genre"
                color="white"
                variant="outline"
              >
                {{ genre }}
              </UBadge>
            </div>
          </UContainer>
        </div>
      </UCarousel>
    </section>

    <UContainer>
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div class="lg:col-span-3">
          <UTabs
            :items="mainTabs"
            variant="link"
          >
            <template #editorPicks="{ item }">
              <div class="flex justify-between items-center my-6">
                <h2 class="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <UIcon
                    name="i-heroicons-star-20-solid"
                    class="text-yellow-500"
                  /> {{ item.label }}
                </h2>
                <UButton
                  label="Xem tất cả"
                  variant="link"
                  trailing-icon="i-heroicons-arrow-right"
                />
              </div>
              <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                <StoryCard
                  v-for="story in homeData.editorPicks"
                  :key="story._id"
                  :story="story"
                />
              </div>
            </template>
            <template #newlyCompleted="{ item }">
              <div class="flex justify-between items-center my-6">
                <h2 class="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <UIcon
                    name="i-heroicons-check-badge-20-solid"
                    class="text-green-500"
                  /> {{ item.label }}
                </h2>
                <UButton
                  label="Xem tất cả"
                  variant="link"
                  trailing-icon="i-heroicons-arrow-right"
                />
              </div>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <StoryCard
                  v-for="story in homeData.newlyCompleted"
                  :key="story._id"
                  :story="story"
                />
              </div>
            </template>
          </UTabs>
        </div>

        <div class="lg:col-span-1 space-y-8">
          <div>
            <h3 class="text-lg lg:text-xl font-bold mb-4 border-b-2 border-primary pb-2">
              Bảng Xếp Hạng Truyện
            </h3>
            <div class="space-y-1">
              <NuxtLink
                v-for="(story, index) in homeData.storyPowerRankings"
                :key="story._id"
                :to="`/story/${story.slug}`"
                class="flex items-start gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span
                  class="text-xl md:text-2xl font-bold w-6 text-center"
                  :class="getRankColor(index + 1)"
                >{{ index + 1 }}</span>
                <div class="flex-1 overflow-hidden">
                  <p class="font-semibold line-clamp-1">{{ story.title }}</p>
                  <p class="text-xs text-gray-500 flex items-center gap-2">
                    <span>{{ story.author.username }}</span>
                    <span class="flex items-center gap-1"><UIcon name="i-heroicons-eye" /> {{ story.views }}</span>
                  </p>
                </div>
              </NuxtLink>
            </div>
          </div>

          <div>
            <h3 class="text-lg lg:text-xl font-bold mb-4 border-b-2 border-primary pb-2">
              Tác Giả Nổi Bật
            </h3>
            <div class="space-y-2">
              <NuxtLink
                v-for="author in homeData.featuredAuthors"
                :key="author._id"
                :to="`/author/${author.slug}`"
                class="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <UAvatar
                  :src="author.avatar"
                  :alt="author.username"
                />
                <div class="flex-1 overflow-hidden">
                  <p class="font-semibold truncate">{{ author.username }}</p>
                  <p class="text-xs text-gray-500">{{ author.storyCount }} tác phẩm</p>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </UContainer>
  </div>
  <div
    v-else
    class="text-center py-20"
  >
    Đang tải...
  </div>
</template>

<script setup lang="ts">
const { data: homeData, pending } = useFetch('/api/home-data')

const mainTabs = [
  { slot: 'editorPicks', label: 'Biên tập viên đề cử' },
  { slot: 'newlyCompleted', label: 'Mới hoàn thành' }
]

function getRankColor(rank: number) {
  if (rank === 1) return 'text-red-500'
  if (rank === 2) return 'text-orange-500'
  if (rank === 3) return 'text-yellow-500'
  return 'text-gray-400'
}

useHead({ title: 'Trang chủ - Sáng tác truyện' })
</script>
