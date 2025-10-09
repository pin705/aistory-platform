<template>
  <div>
    <div class="hidden">
      <span class="font-sans font-serif font-mono prose-sm prose-base prose-lg prose-xl prose-2xl" />
    </div>

    <div
      v-if="data"
      :class="readerSettings.theme"
      class="bg-background text-foreground transition-colors duration-300 min-h-screen"
    >
      <header
        class="fixed top-0 left-0 right-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border transition-transform duration-300"
        :class="{ '-translate-y-full': !isUIVisible }"
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
            <span class="font-bold truncate group-hover:text-primary-500">{{ data.story.title }}</span>
          </NuxtLink>
          <div class="text-center truncate px-4 hidden sm:block w-1/3">
            Chương {{ data.currentChapter.chapterNumber }}: {{ data.currentChapter.title }}
          </div>
          <div class="w-1/3 flex justify-end">
            <button
              class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 sm:hidden"
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

      <main
        class="py-24"
        @click.self="toggleUIVisibility"
      >
        <div
          ref="contentRef"
          class="prose dark:prose-invert max-w-4xl mx-auto px-4 transition-all duration-300"
          :class="[readerSettings.fontSize, readerSettings.fontFamily]"
          v-html="data.currentChapter.content"
        />
      </main>

      <footer
        class="fixed bottom-0 left-0 right-0 z-20 bg-background/80 backdrop-blur-sm border-t border-border transition-transform duration-300"
        :class="{ 'translate-y-full': !isUIVisible }"
      >
        <div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl grid grid-cols-3 items-center h-20">
          <div class="flex justify-start">
            <NuxtLink
              :to="prevChapterLink"
              :class="['flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-semibold', !data.prevChapter ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-800']"
              :disabled="!data.prevChapter"
            >
              <Icon
                name="heroicons:arrow-left-circle"
                class="w-5 h-5"
              />
              Chương trước
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
              class="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
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
              :class="['flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-semibold', !data.nextChapter ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-800']"
              :disabled="!data.nextChapter"
            >
              Chương sau
              <Icon
                name="heroicons:arrow-right-circle"
                class="w-5 h-5"
              />
            </NuxtLink>
          </div>
        </div>
      </footer>

      <Transition
        enter-active-class="transform transition ease-in-out duration-300"
        enter-from-class="translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transform transition ease-in-out duration-300"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-full"
      >
        <div
          v-if="isSettingsOpen"
          class="fixed inset-0 z-50"
        >
          <div
            class="fixed inset-0 bg-gray-900/25"
            @click="isSettingsOpen = false"
          />
          <div class="fixed top-0 bottom-0 right-0 w-full max-w-sm bg-background border-l border-border">
            <div class="p-4 border-b border-border flex items-center justify-between">
              <h2 class="font-bold text-xl">
                Tùy chỉnh đọc truyện
              </h2>
              <button
                class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                @click="isSettingsOpen = false"
              >
                <Icon
                  name="heroicons:x-mark"
                  class="w-6 h-6"
                />
              </button>
            </div>
            <div class="p-4 space-y-8">
              <div>
                <label class="block text-sm font-medium mb-2">Màu nền</label>
                <div class="flex items-center gap-2">
                  <button
                    v-for="theme in themeOptions"
                    :key="theme.value"
                    class="flex-1 justify-center px-3 py-2 text-sm rounded-md border"
                    :class="readerSettings.theme === theme.value ? 'bg-primary-500 text-white border-primary-500' : 'hover:bg-gray-50 dark:hover:bg-gray-800'"
                    @click="readerSettings.theme = theme.value"
                  >
                    {{ theme.label }}
                  </button>
                </div>
              </div>
              <div>
                <label
                  for="font-family"
                  class="block text-sm font-medium mb-2"
                >Font chữ</label>
                <select
                  id="font-family"
                  v-model="readerSettings.fontFamily"
                  class="w-full px-3 py-2 border border-border rounded-md bg-transparent focus:ring-1 focus:ring-primary-500 focus:outline-none"
                >
                  <option
                    v-for="font in fontOptions"
                    :key="font.value"
                    :value="font.value"
                  >
                    {{ font.label }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Cỡ chữ</label>
                <div class="flex items-center gap-4">
                  <button
                    class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                    @click="decreaseFontSize"
                  >
                    <Icon
                      name="heroicons:minus"
                      class="w-5 h-5"
                    />
                  </button>
                  <input
                    v-model="fontSizeIndex"
                    type="range"
                    :min="0"
                    :max="fontSizes.length - 1"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-500"
                  >
                  <button
                    class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                    @click="increaseFontSize"
                  >
                    <Icon
                      name="heroicons:plus"
                      class="w-5 h-5"
                    />
                  </button>
                </div>
              </div>
              <hr class="border-border">
              <h3 class="text-sm font-medium">
                Đọc thành tiếng
              </h3>
              <div>
                <label
                  for="voice"
                  class="block text-sm font-medium mb-2"
                >Giọng đọc</label>
                <select
                  id="voice"
                  v-model="readerSettings.voiceURI"
                  :disabled="!voiceOptions.length"
                  class="w-full px-3 py-2 border border-border rounded-md bg-transparent focus:ring-1 focus:ring-primary-500 focus:outline-none disabled:opacity-50"
                >
                  <option
                    v-if="!voiceOptions.length"
                    value=""
                  >
                    Không có giọng Tiếng Việt
                  </option>
                  <option
                    v-for="voice in voiceOptions"
                    :key="voice.uri"
                    :value="voice.uri"
                  >
                    {{ voice.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Tốc độ đọc: {{ readerSettings.rate }}x</label>
                <input
                  v-model="readerSettings.rate"
                  type="range"
                  :min="0.5"
                  :max="2"
                  :step="0.1"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-500"
                >
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
    <div
      v-else
      class="flex items-center justify-center min-h-screen"
    >
      Đang tải chương...
    </div>
  </div>
</template>

<script setup lang="ts">
// Toàn bộ phần script không cần thay đổi.
// Logic vẫn giữ nguyên vì chúng ta chỉ thay đổi phần giao diện.
import { useLocalStorage, useEventListener, useScroll } from '@vueuse/core'
import { ref, watch, computed, onMounted } from 'vue'

const route = useRoute()
const router = useRouter()
const storyId = route.params.id as string
const chapterNumber = route.params.chapterNumber as string

definePageMeta({ layout: 'full-width' })

const { data, error } = await useFetch(`/api/chapters/public/${storyId}/${chapterNumber}`)
if (error.value) { navigateTo('/404', { replace: true }) }

const isUIVisible = ref(true)
const contentRef = ref<HTMLElement | null>(null)
const { y, isScrolling, directions } = useScroll(contentRef)
watch(y, () => { if (isScrolling.value) { isUIVisible.value = directions.top } })
function toggleUIVisibility(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('.prose')) { isUIVisible.value = !isUIVisible.value }
}

const plainContent = computed(() => {
  if (import.meta.server || !data.value?.currentChapter.content) return ''
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = data.value.currentChapter.content
  return (tempDiv.textContent || tempDiv.innerText || '').trim()
})
const { isPlaying, isPaused, voices, currentWordCharIndex, speak, togglePauseResume, stop } = useTTS()

function play() {
  speak(plainContent.value, readerSettings.value.voiceURI, readerSettings.value.rate)
}

watch(currentWordCharIndex, (newIndex, oldIndex) => {
  if (!contentRef.value) return
  const oldHighlight = contentRef.value.querySelector('span.highlight')
  if (oldHighlight) {
    oldHighlight.replaceWith(document.createTextNode(oldHighlight.textContent || ''))
  }
  if (newIndex > -1) {
    const textNodes = Array.from(contentRef.value.querySelectorAll('p, h1, h2, h3, h4, h5, h6'))
      .flatMap(el => Array.from(el.childNodes))
      .filter((node): node is Text => node.nodeType === Node.TEXT_NODE && !!node.textContent?.trim())

    let charCount = 0
    for (const node of textNodes) {
      if (newIndex >= charCount && newIndex < charCount + (node.textContent?.length || 0)) {
        const localIndex = newIndex - charCount
        let wordEndIndex = (node.textContent || '').indexOf(' ', localIndex)
        if (wordEndIndex === -1) {
          wordEndIndex = node.textContent?.length || 0
        }
        const range = document.createRange()
        range.setStart(node, localIndex)
        range.setEnd(node, wordEndIndex)

        const highlightSpan = document.createElement('span')
        highlightSpan.className = 'highlight'
        range.surroundContents(highlightSpan)
        break
      }
      charCount += node.textContent?.length || 0
    }
  }
})

const isSettingsOpen = ref(false)
const fontOptions = [{ label: 'Mặc định (Sans)', value: 'font-sans' }, { label: 'Cổ điển (Serif)', value: 'font-serif' }, { label: 'Dễ đọc (Mono)', value: 'font-mono' }]
const fontSizes = ['prose-sm', 'prose-base', 'prose-lg', 'prose-xl', 'prose-2xl']
const themeOptions = [{ label: 'Sáng', value: 'theme-light' }, { label: 'Tối', value: 'theme-dark' }, { label: 'Sepia', value: 'theme-sepia' }]

const readerSettings = useLocalStorage('reader-settings', {
  fontFamily: 'font-sans', fontSize: 'prose-base', theme: 'theme-light', voiceURI: '', rate: 1
})

const voiceOptions = computed(() => {
  if (!voices.value.length) return []
  return voices.value.map(v => ({ name: `${v.name} (${v.lang})`, uri: v.voiceURI }))
})
watch(voices, (newVoices) => {
  if (!readerSettings.value.voiceURI && newVoices.length > 0) {
    const vietnameseVoice = newVoices.find(v => v.lang === 'vi-VN') || newVoices[0]
    readerSettings.value.voiceURI = vietnameseVoice.voiceURI
  }
})

const fontSizeIndex = ref(fontSizes.indexOf(readerSettings.value.fontSize))
if (fontSizeIndex.value === -1) fontSizeIndex.value = 1
watch(fontSizeIndex, (newIndex) => { readerSettings.value.fontSize = fontSizes[newIndex] })
const increaseFontSize = () => { if (fontSizeIndex.value < fontSizes.length - 1) fontSizeIndex.value++ }
const decreaseFontSize = () => { if (fontSizeIndex.value > 0) fontSizeIndex.value-- }

const metaDescription = computed(() => plainContent.value.substring(0, 160) + '...')
useSeoMeta({ title: () => `${data.value?.story.title} - Chương ${data.value?.currentChapter.chapterNumber}`, description: metaDescription })

const prevChapterLink = computed(() => data.value?.prevChapter ? `/story/${storyId}/chapters/${data.value.prevChapter.chapterNumber}` : undefined)
const nextChapterLink = computed(() => data.value?.nextChapter ? `/story/${storyId}/chapters/${data.value.nextChapter.chapterNumber}` : undefined)
useEventListener(document, 'keydown', (e) => {
  if (e.key === 'ArrowRight' && nextChapterLink.value) { stop(); router.push(nextChapterLink.value) }
  if (e.key === 'ArrowLeft' && prevChapterLink.value) { stop(); router.push(prevChapterLink.value) }
})

onBeforeRouteLeave(() => { stop() })
</script>

<style>
/* CSS không thay đổi so với phiên bản trước */
:root { --background-color: #ffffff; --foreground-color: #111827; --border-color: #e5e7eb; }
.theme-dark { --background-color: #111827; --foreground-color: #d1d5db; --border-color: #374151; }
.theme-sepia { --background-color: #f1e7d0; --foreground-color: #5b4636; --border-color: #d3c5a8; }
.bg-background { background-color: var(--background-color); }
.text-foreground { color: var(--foreground-color); }
.border-border { border-color: var(--border-color); }

.prose :where(a):not(:where([class~="not-prose"] *)) { color: var(--foreground-color); text-decoration: underline; }
.prose { transition: color 0.3s; }
.theme-dark .prose, .theme-sepia .prose { color: var(--foreground-color); }

.highlight { background-color: #fef08a; color: #111827; padding: 2px 1px; border-radius: 3px; }
.theme-dark .highlight { background-color: #facc15; color: #111827; }
.theme-sepia .highlight { background-color: rgba(185, 28, 28, 0.4); }
</style>
