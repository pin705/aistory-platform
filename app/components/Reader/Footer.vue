<template>
  <footer
    class="fixed bottom-0 left-0 right-0 z-20 bg-background/80 backdrop-blur-sm border-t border-border transition-transform duration-300"
    :class="{ 'translate-y-full': !isVisible }"
  >
    <div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl grid grid-cols-3 items-center h-20">
      <div class="flex justify-start">
        <NuxtLink
          :to="prevChapterLink"
          :class="['flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-semibold', !prevChapter ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-800']"
          :disabled="!prevChapter"
        >
          <Icon
            name="heroicons:arrow-left-circle"
            class="w-5 h-5"
          /> Chương trước
        </NuxtLink>
      </div>
      <div class="flex justify-center items-center gap-1">
        <button
          :disabled="!plainContent"
          class="p-3 rounded-full"
          :class="isPlaying && !isPaused ? 'bg-primary-50 text-primary-500' : 'hover:bg-gray-100 dark:hover:bg-gray-800'"
          @click="play"
        >
          <Icon
            :name="!isPlaying || isPaused ? 'heroicons:play-circle' : 'heroicons:speaker-wave'"
            class="w-7 h-7"
          />
        </button>
        <button
          :disabled="!isPlaying"
          class="p-3 rounded-full"
          :class="isPaused ? 'bg-primary-50 text-primary-500' : 'hover:bg-gray-100 dark:hover:bg-gray-800'"
          @click="togglePauseResume"
        >
          <Icon
            :name="isPaused ? 'heroicons:play-circle' : 'heroicons:pause-circle'"
            class="w-7 h-7"
          />
        </button>
        <button
          :disabled="!isPlaying"
          class="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'"
          @click="stop"
        >
          <Icon
            name="heroicons:stop-circle"
            class="w-7 h-7"
          />
        </button>
        <div class="border-l h-6 mx-1 border-border" />
        <button
          class="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          @click="isSettingsOpen = true"
        >
          <Icon
            name="heroicons:cog-6-tooth"
            class="w-7 h-7"
          />
        </button>
      </div>
      <div class="flex justify-end">
        <NuxtLink
          :to="nextChapterLink"
          :class="['flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-semibold', !nextChapter ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-800']"
          :disabled="!nextChapter"
        >
          Chương sau <Icon
            name="heroicons:arrow-right-circle"
            class="w-5 h-5"
          />
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const props = defineProps<{
  storyId: string
  prevChapter: any
  nextChapter: any
  isVisible: boolean
  plainContent: string
}>()
const { isSettingsOpen, readerSettings } = useReader()
const { isPlaying, isPaused, speak, togglePauseResume, stop } = useTTS()

const prevChapterLink = computed(() => props.prevChapter ? `/story/${props.storyId}/chapters/${props.prevChapter.chapterNumber}` : undefined)
const nextChapterLink = computed(() => props.nextChapter ? `/story/${props.storyId}/chapters/${props.nextChapter.chapterNumber}` : undefined)

function play() {
  speak(props.plainContent, readerSettings.value.voiceURI, readerSettings.value.rate)
}
</script>
