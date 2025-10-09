import { ref, onMounted, onUnmounted } from 'vue'

// Hàm này sẽ trả về một phiên bản "giả" (stub) của composable trên server
// để tránh lỗi "window is not defined".
const createSsrStub = () => ({
  isPlaying: ref(false),
  isPaused: ref(false),
  voices: ref<SpeechSynthesisVoice[]>([]),
  currentWordCharIndex: ref(-1),
  speak: () => console.warn('TTS is only available on the client-side.'),
  togglePauseResume: () => {},
  stop: () => {},
  isAvailable: ref(false) // Thêm cờ để biết TTS có sẵn hay không
})

export function useTTS() {
  // Nếu đang ở môi trường server, trả về phiên bản giả và dừng lại
  if (import.meta.server) {
    return createSsrStub()
  }

  // Code phía dưới chỉ chạy ở client
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
    // Lấy các giọng đọc tiếng Việt
    voices.value = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('vi'))
  }

  const speak = (text: string, voiceURI?: string, rate = 1) => {
    if (!isAvailable.value) return
    // Dừng phát lại hiện tại trước khi bắt đầu cái mới
    if (window.speechSynthesis.speaking) {
      stop()
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'vi-VN'
    utterance.rate = rate

    if (voiceURI) {
      // Lấy danh sách giọng đọc "tươi" nhất từ trình duyệt
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
    utterance.onend = () => stop()
    utterance.onerror = (e) => {
      console.error('SpeechSynthesis Error:', e)
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
    isPaused.value = !isPaused.value
  }

  // Chỉ thiết lập listener và dọn dẹp ở client
  onMounted(() => {
    if (isAvailable.value) {
      // Đảm bảo voices được load khi component được mount
      if (window.speechSynthesis.getVoices().length) {
        loadVoices()
      }
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  })

  // Dọn dẹp khi component bị hủy để tránh memory leak
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
