import { useLocalStorage } from '@vueuse/core'

// Sử dụng useState để tạo state toàn cục (singleton)
export const useReader = () => {
  const readerSettings = useState('reader-settings', () => useLocalStorage('reader-settings', {
    fontFamily: 'font-sans',
    fontSize: 'prose-base',
    theme: 'theme-light',
    voiceURI: '',
    rate: 1
  }))

  const isSettingsOpen = useState('is-settings-open', () => ref(false))

  const fontSizes = ['prose-sm', 'prose-base', 'prose-lg', 'prose-xl', 'prose-2xl']

  // fontSizeIndex không cần chia sẻ toàn cục, có thể để trong component Settings
  // Nhưng để ở đây cũng tiện cho việc quản lý
  const fontSizeIndex = ref(fontSizes.indexOf(readerSettings.value.fontSize))
  if (fontSizeIndex.value === -1) fontSizeIndex.value = 1

  watch(fontSizeIndex, (newIndex) => {
    readerSettings.value.fontSize = fontSizes[newIndex]
  })

  const increaseFontSize = () => { if (fontSizeIndex.value < fontSizes.length - 1) fontSizeIndex.value++ }
  const decreaseFontSize = () => { if (fontSizeIndex.value > 0) fontSizeIndex.value-- }

  return {
    readerSettings,
    isSettingsOpen,
    fontSizes,
    fontSizeIndex,
    increaseFontSize,
    decreaseFontSize
  }
}
