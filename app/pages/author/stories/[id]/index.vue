<template>
  <UContainer class="py-8">
    <div class="flex justify-between items-center mb-6">
      <div>
        <NuxtLink
          to="/dashboard"
          class="text-sm text-gray-500 hover:underline"
        >‹ Quay lại Tác phẩm</NuxtLink>
        <h1 class="text-3xl font-bold">
          {{ story?.title }}
        </h1>
      </div>
    </div>

    <UTabs
      :items="tabsManager"
      class="w-full"
    >
      <template #chapters="{ item }">
        <StoryChapterManager :story-id="storyId" />
      </template>

      <template #characters="{ item }">
        <div class="mt-4">
          <StoryCharacterManager :story-id="storyId" />
        </div>
      </template>

      <template #factions="{ item }">
        <div class="mt-4">
          <StoryFactionsManager :story-id="storyId" />
        </div>
      </template>

      <template #realms="{ item }">
        <div class="mt-4">
          <StoryRealmsManager :story-id="storyId" />
        </div>
      </template>
      <template #location="{ item }">
        <div class="mt-4">
          <StoryLocationsManager :story-id="storyId" />
        </div>
      </template>
    </UTabs>
  </UContainer>
</template>

<script setup lang="ts">
const route = useRoute()
const storyId = route.params.id as string

const tabsManager = [
  { slot: 'chapters', label: 'Quản lý Chương' },
  { slot: 'characters', label: 'Quản lý Nhân vật' },
  { slot: 'factions', label: 'Quản lý Thế lực' },
  { slot: 'realms', label: 'Quản lý Cảnh giới' },
  { slot: 'location', label: 'Quản lý Địa danh' }
]

const { data: story } = await useFetch(`/api/stories/${storyId}`)
useHead({ title: () => `Quản lý: ${story.value?.title || 'Truyện'}` })
</script>
