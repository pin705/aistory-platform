<template>
  <header
    class="fixed top-0 left-0 right-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border transition-transform duration-300"
    :class="{ '-translate-y-full': !isVisible }"
  >
    <div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex items-center justify-between h-16">
      <NuxtLink
        :to="`/story/${storyId}`"
        class="flex items-center gap-2 group w-1/3"
      >
        <Icon
          name="heroicons:arrow-left"
          class="w-5 h-5 flex-shrink-0"
        />
        <span class="font-bold truncate group-hover:text-primary-500">{{ storyTitle }}</span>
      </NuxtLink>
      <div class="text-center truncate px-4 hidden sm:block w-1/3">
        Chương {{ chapterData.chapterNumber }}: {{ chapterData.title }}
      </div>
      <div class="w-1/3 flex justify-end">
        <button
          class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 sm:hidden"
          @click="isSettingsOpen = true"
        >
          <Icon
            name="heroicons:cog-6-tooth"
            class="w-6 h-6"
          />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  storyId: string
  storyTitle: string
  chapterData: any
  isVisible: boolean
}>()
const { isSettingsOpen } = useReader()
</script>
