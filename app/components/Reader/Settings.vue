<template>
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
                :class="[...baseButtonClasses, readerSettings.theme === theme.value ? activeThemeClasses : inactiveThemeClasses]"
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
              :class="selectClasses"
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
                :class="baseButtonClasses"
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
                :class="sliderClasses"
              >
              <button
                :class="baseButtonClasses"
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
              :class="[selectClasses, 'disabled:opacity-50']"
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
              :class="sliderClasses"
            >
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const {
  readerSettings, isSettingsOpen, fontSizes, fontSizeIndex, increaseFontSize, decreaseFontSize
} = useReader()

const { voices } = useTTS()

// Tailwind classes for reuse
const baseButtonClasses = 'p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800'
const activeThemeClasses = 'bg-primary-500 text-white border-primary-500'
const inactiveThemeClasses = 'hover:bg-gray-50 dark:hover:bg-gray-800'
const selectClasses = 'w-full px-3 py-2 border border-border rounded-md bg-transparent focus:ring-1 focus:ring-primary-500 focus:outline-none'
const sliderClasses = 'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-500'

const fontOptions = [{ label: 'Mặc định (Sans)', value: 'font-sans' }, { label: 'Cổ điển (Serif)', value: 'font-serif' }, { label: 'Dễ đọc (Mono)', value: 'font-mono' }]
const themeOptions = [{ label: 'Sáng', value: 'theme-light' }, { label: 'Tối', value: 'theme-dark' }, { label: 'Sepia', value: 'theme-sepia' }]
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
</script>
