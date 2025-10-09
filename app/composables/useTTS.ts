import { ref, onUnmounted } from 'vue'

export function useTTS() {
  const isPlaying = ref(false)
  const isPaused = ref(false)
  const voices = ref<SpeechSynthesisVoice[]>([])
  const currentWordCharIndex = ref(-1)

  const loadVoices = () => {
    voices.value = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('vi'))
  }

  window.speechSynthesis.onvoiceschanged = loadVoices
  loadVoices()

  const stop = () => {
    window.speechSynthesis.cancel()
    isPlaying.value = false
    isPaused.value = false
    currentWordCharIndex.value = -1
  }

  const speak = (text: string, voiceURI?: string, rate = 1) => {
    if (window.speechSynthesis.speaking) {
      stop()
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'vi-VN'
    utterance.rate = rate

    // (FIX) Lấy danh sách voice "tươi" từ trình duyệt và tìm kiếm trên đó
    if (voiceURI) {
      const liveVoices = window.speechSynthesis.getVoices();
      const selectedVoice = liveVoices.find(v => v.voiceURI === voiceURI);
      if (selectedVoice) {
        utterance.voice = selectedVoice; // Gán đối tượng voice gốc
      }
    }

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        currentWordCharIndex.value = event.charIndex;
      }
    }

    utterance.onstart = () => { isPlaying.value = true; isPaused.value = false; }
    utterance.onend = () => { stop() }
    utterance.onerror = () => { stop() }

    window.speechSynthesis.speak(utterance)
  }

  const togglePauseResume = () => {
    if (isPlaying.value) {
      if (isPaused.value) {
        window.speechSynthesis.resume()
        isPaused.value = false
      } else {
        window.speechSynthesis.pause()
        isPaused.value = true
      }
    }
  }

  onUnmounted(stop)

  return {
    isPlaying,
    isPaused,
    voices,
    currentWordCharIndex,
    speak,
    togglePauseResume,
    stop
  }
}
