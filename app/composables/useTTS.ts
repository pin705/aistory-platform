import { ref, onMounted, onUnmounted } from 'vue'

const createSsrStub = () => ({
  isAvailable: ref(false),
  isPlaying: ref(false),
  isPaused: ref(false),
  voices: ref<SpeechSynthesisVoice[]>([]),
  currentWordCharIndex: ref(-1),
  speak: () => console.warn('TTS is only available on the client-side.'),
  togglePauseResume: () => {},
  stop: () => {},
})

export function useTTS() {
  if (import.meta.server) {
    return createSsrStub()
  }

  const isAvailable = ref(typeof window !== 'undefined' && 'speechSynthesis' in window)
  const isPlaying = ref(false)
  const isPaused = ref(false)
  const voices = ref<SpeechSynthesisVoice[]>([])
  const currentWordCharIndex = ref(-1)

  const stop = () => {
    if (!isAvailable.value) return
    window.speechSynthesis.cancel()
    isPlaying.value = false
    isPaused.value = false
    currentWordCharIndex.value = -1
  }

  const loadVoices = () => {
    console.log('Loading voices...', isAvailable.value)
    if (!isAvailable.value) return
    voices.value = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('vi'))
  }

  const speak = (text: string, voiceURI?: string, rate = 1) => {
    if (!isAvailable.value) return
    if (window.speechSynthesis.speaking) {
      stop()
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'vi-VN'
    utterance.rate = rate

    if (voiceURI) {
      const liveVoices = window.speechSynthesis.getVoices()
      const selectedVoice = liveVoices.find(v => v.voiceURI === voiceURI)
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }
    }

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        currentWordCharIndex.value = event.charIndex
      }
    }

    utterance.onstart = () => { isPlaying.value = true; isPaused.value = false }
    utterance.onpause = () => { isPaused.value = true }
    utterance.onresume = () => { isPaused.value = false }
    utterance.onend = () => stop()

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted') {
        console.error('SpeechSynthesis Error:', e.error)
      }
      stop()
    }

    window.speechSynthesis.speak(utterance)
  }

  const togglePauseResume = () => {
    if (!isAvailable.value || !isPlaying.value) return
    if (isPaused.value) {
      window.speechSynthesis.resume()
    } else {
      window.speechSynthesis.pause()
    }
  }

  // (CẬP NHẬT) Sửa lại logic onMounted cho mạnh mẽ hơn
  onMounted(() => {
    if (isAvailable.value) {
      // 1. Gán sự kiện listener TRƯỚC. Điều này đảm bảo chúng ta không bỏ lỡ
      //    sự kiện nếu nó xảy ra trong khi chúng ta đang xử lý.
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices
      }

      // 2. Thực hiện một lần gọi `loadVoices` ngay lập tức.
      //    Điều này xử lý trường hợp các giọng đọc đã có sẵn trong cache của trình duyệt.
      loadVoices()
    }
  })

  onUnmounted(stop)

  return {
    isAvailable,
    isPlaying,
    isPaused,
    voices,
    currentWordCharIndex,
    speak,
    togglePauseResume,
    stop
  }
}
