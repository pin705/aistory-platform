<template>
  <div class="flex h-screen bg-gray-100 dark:bg-[#18181b]/50">
    <div
      class="flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18181b] transition-all duration-300 overflow-hidden"
      :class="isLeftSidebarOpen ? 'w-80' : 'w-0'"
    >
      <div
        v-if="isLeftSidebarOpen"
        class="flex flex-col h-full"
      >
        <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <h2 class="font-bold text-lg">
            Cấu trúc truyện
          </h2>
        </div>
        <div class="flex-1 overflow-y-auto p-2">
          <UAccordion
            :items="sidebarNav"
            multiple
            default-value="0"
          >
            <template #chapters>
              <div class="p-2 space-y-1">
                <NuxtLink
                  v-for="chap in storyChapters"
                  :key="chap._id"
                  :to="`/author/stories/${storyId}/chapters/${chap._id}`"
                  class="block px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  active-class="bg-gray-100 dark:bg-[#18181b] font-semibold"
                >
                  Ch.{{ chap.chapterNumber }}: {{ chap.title }}
                </NuxtLink>
              </div>
            </template>
            <template #lorebook>
              <StoryCharacterManager :story-id="storyId" />
            </template>
          </UAccordion>
        </div>
      </div>
    </div>

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="flex-shrink-0 z-20 bg-background/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between h-16 px-4">
          <div class="flex items-center gap-2">
            <UTooltip text="Về trang Tác phẩm">
              <UButton
                to="/dashboard"
                icon="i-heroicons-arrow-left-circle-20-solid"
                variant="ghost"
              />
            </UTooltip>

            <USeparator
              orientation="vertical"
              class="h-6"
            />

            <UTooltip text="Điều hướng & Lorebook">
              <UButton
                icon="i-heroicons-bars-3"
                variant="ghost"
                @click="isLeftSidebarOpen = !isLeftSidebarOpen"
              />
            </UTooltip>
            <UInput
              v-model="chapterTitle"
              placeholder="Nhập tiêu đề chương"
              size="md"
              variant="none"
              class="font-bold text-lg p-0"
            />
          </div>

          <div class="flex items-center gap-2 sm:gap-4">
            <div class="text-sm text-gray-500 hidden sm:block">
              {{ autoSaveStatusText }}
            </div>
            <UButton
              :loading="isSaving && autoSaveStatus !== 'saving'"
              icon="i-heroicons-check"
              color="neutral"
              @click="saveChapter(false)"
            >
              Lưu chương
            </UButton>
            <UTooltip :text="isRightSidebarOpen ? 'Ẩn Trợ lý AI' : 'Hiện Trợ lý AI'">
              <UButton
                :icon="isRightSidebarOpen ? 'i-heroicons-sparkles-solid' : 'i-heroicons-sparkles'"
                variant="ghost"
                @click="isRightSidebarOpen = !isRightSidebarOpen"
              />
            </UTooltip>
            <USeparator
              orientation="vertical"
              class="h-6"
            />
            <UTooltip :text="isFocusMode ? 'Thoát Chế độ Tập trung' : 'Chế độ Tập trung'">
              <UButton
                :icon="isFocusMode ? 'i-heroicons-arrows-pointing-in' : 'i-heroicons-arrows-pointing-out'"
                variant="ghost"
                @click="toggleFocusMode"
              />
            </UTooltip>
            <UTooltip :text="isFullscreen ? 'Thoát Toàn màn hình' : 'Toàn màn hình'">
              <UButton
                :icon="isFullscreen ? 'i-heroicons-viewfinder-circle' : 'i-heroicons-arrows-pointing-out-20-solid'"
                variant="ghost"
                @click="toggleFullscreen"
              />
            </UTooltip>
          </div>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-2 sm:p-6 lg:p-8">
        <div class="bg-white dark:bg-[#18181b] shadow-lg rounded-lg max-w-4xl mx-auto">
          <div
            v-if="editor"
            class="flex items-center flex-wrap gap-1 p-2 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-[#18181b] z-10 rounded-t-lg"
          >
            <UButton
              size="sm"
              :variant="editor.isActive('bold') ? 'soft' : 'ghost'"
              @click="editor.chain().focus().toggleBold().run()"
            >
              <Icon name="i-lucide-bold" />
            </UButton>
            <UButton
              size="sm"
              :variant="editor.isActive('italic') ? 'soft' : 'ghost'"
              @click="editor.chain().focus().toggleItalic().run()"
            >
              <Icon name="i-lucide-italic" />
            </UButton>
            <UButton
              size="sm"
              :variant="editor.isActive('strike') ? 'soft' : 'ghost'"
              @click="editor.chain().focus().toggleStrike().run()"
            >
              <Icon name="i-lucide-strikethrough" />
            </UButton>
            <USeparator
              orientation="vertical"
              class="mx-1 h-5"
            />
            <UButton
              size="sm"
              :variant="editor.isActive('heading', { level: 2 }) ? 'soft' : 'ghost'"
              @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
            >
              H2
            </UButton>
            <UButton
              size="sm"
              :variant="editor.isActive('heading', { level: 3 }) ? 'soft' : 'ghost'"
              @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
            >
              H3
            </UButton>
          </div>
          <TiptapBubbleMenu
            v-if="editor"
            :editor="editor"
            :tippy-options="{ duration: 100 }"
            class="bg-primary p-1 rounded-md shadow-lg flex gap-1"
          >
            <UButton
              size="xs"
              color="white"
              variant="ghost"
              @click="rewriteSelection('improve')"
            >
              Cải thiện
            </UButton>
            <UButton
              size="xs"
              color="white"
              variant="ghost"
              @click="rewriteSelection('shorter')"
            >
              Rút gọn
            </UButton>
            <UButton
              size="xs"
              color="white"
              variant="ghost"
              @click="rewriteSelection('longer')"
            >
              Mở rộng
            </UButton>
          </TiptapBubbleMenu>
          <TiptapEditorContent :editor="editor" />
          <div class="flex justify-end items-center text-xs text-gray-400 p-2 border-t border-gray-200 dark:border-gray-800">
            <div
              v-if="editor"
              class="select-none"
            >
              {{ editor.storage.characterCount.words() }} từ
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="flex-shrink-0 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18181b] transition-all duration-300 overflow-hidden"
      :class="isRightSidebarOpen ? 'w-96' : 'w-0'"
    >
      <div
        v-if="isRightSidebarOpen"
        class="flex flex-col h-full"
      >
        <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <h3 class="font-semibold flex items-center gap-2">
            <Icon
              name="i-heroicons-sparkles-20-solid"
              class="text-primary"
            /> Trợ lý Sáng tác
          </h3>
        </div>
        <div class="flex-1 p-4 space-y-4 overflow-y-auto">
          <p class="text-sm text-gray-500">
            Nhập yêu cầu để AI viết tiếp, hoặc bôi đen văn bản trong trình soạn thảo để chỉnh sửa.
          </p>
          <UTextarea
            v-model="userPrompt"
            :rows="8"
            :placeholder="promptPlaceholder"
            class="w-full"
          />
          <UButton
            :loading="isGenerating"
            class="w-full"
            icon="i-heroicons-pencil-square"
            color="neutral"
            @click="generateNextScene"
          >
            Tạo nội dung
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent as TiptapEditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import CharacterCount from '@tiptap/extension-character-count'
import { watchDebounced, useFullscreen } from '@vueuse/core'
import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/vue-3/menus'

definePageMeta({ layout: 'full-width' }) // Sử dụng layout không có padding

const route = useRoute()
const toast = useToast()
const storyId = route.params.id as string
const chapterId = route.params.chapterId as string

// ----- STATE GIAO DIỆN -----
const isLeftSidebarOpen = ref(true)
const isRightSidebarOpen = ref(true)
const isFocusMode = ref(false)
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

function toggleFocusMode() {
  isFocusMode.value = !isFocusMode.value
  if (isFocusMode.value) {
    isLeftSidebarOpen.value = false
    isRightSidebarOpen.value = false
  }
}
watch(isLeftSidebarOpen, (isOpen) => { if (isOpen) isFocusMode.value = false })
watch(isRightSidebarOpen, (isOpen) => { if (isOpen) isFocusMode.value = false })

// ----- LẤY DỮ LIỆU -----
const { data: storyChapters } = await useFetch(`/api/stories/${storyId}/chapters-list`, { default: () => [] })
const { data: chapterData, pending: isLoadingChapter } = await useFetch(chapterId !== 'new' ? `/api/chapters/${chapterId}` : null, { lazy: true })

// Cấu trúc cho Sidebar Trái
const sidebarNav = [
  { label: 'Danh sách chương', slot: 'chapters' },
  { label: 'Lorebook', slot: 'lorebook' }
]

// ----- LOGIC EDITOR -----
const isSaving = ref(false)
const isGenerating = ref(false)
const autoSaveStatus = ref<'idle' | 'saving' | 'saved'>('idle')
const userPrompt = ref('')
const chapterTitle = ref('')
const promptPlaceholder = `Ví dụ: "Viết cảnh Lục Thiếu Du đột phá, mô tả sự đau đớn và năng lượng kinh khủng bộc phát."`

const autoSaveStatusText = computed(() => {
  if (autoSaveStatus.value === 'saving') return 'Đang lưu...'
  if (autoSaveStatus.value === 'saved') return 'Đã lưu ✓'
  return ''
})

const editor = useEditor({
  content: '',
  extensions: [StarterKit, CharacterCount],
  editorProps: { attributes: { class: 'prose dark:prose-invert max-w-none p-4 focus:outline-none min-h-[70vh]' } }
})

watch(chapterData, (newData) => {
  if (newData) {
    chapterTitle.value = newData.title
    if (editor.value && !editor.value.isFocused) {
      editor.value?.commands.setContent(newData.content, false)
    }
  }
}, { immediate: true })

watchDebounced(() => [chapterTitle.value, editor.value?.getHTML()],
  async ([newTitle, newContent], [oldTitle, oldContent]) => {
    const hasChanged = newTitle !== oldTitle || newContent !== oldContent
    if (editor.value && hasChanged && chapterId !== 'new' && !isSaving.value) {
      autoSaveStatus.value = 'saving'
      await saveChapter(true)
      autoSaveStatus.value = 'saved'
      setTimeout(() => autoSaveStatus.value = 'idle', 2000)
    }
  }, { debounce: 2500, deep: true }
)

async function saveChapter(isSilent = false) {
  isSaving.value = true
  try {
    const htmlContent = editor.value?.getHTML() || ''
    const method = chapterId === 'new' ? 'POST' : 'PUT'
    const url = chapterId === 'new' ? `/api/stories/${storyId}/chapters` : `/api/chapters/${chapterId}`

    const savedChapter = await $fetch(url, {
      method,
      body: { title: chapterTitle.value, content: htmlContent }
    })

    // Chỉ hiển thị toast khi không ở chế độ im lặng
    if (!isSilent) {
      toast.add({ title: 'Lưu chương thành công!', color: 'success' })
    }

    // Luôn kích hoạt indexing
    $fetch(`/api/chapters/${savedChapter._id || chapterId}/index-content`, { method: 'POST' })
      .catch(err => console.error('Indexing failed:', err))

    // Nếu là tạo chương mới, chuyển hướng đến trang sửa chương đó
    if (chapterId === 'new') {
      navigateTo(`/author/stories/${storyId}/chapters/${savedChapter._id}`)
    }
  } catch (e: any) {
    if (!isSilent) {
      toast.add({ title: 'Lỗi khi lưu!', description: e.data?.statusMessage, color: 'error' })
    }
  } finally {
    isSaving.value = false
  }
}

// Hàm hỏi thăm kết quả job
function pollForSceneResult(jobId: string, timeout = 180000) { // Timeout 3 phút
  const startTime = Date.now()
  const interval = setInterval(async () => {
    if (Date.now() - startTime > timeout) {
      clearInterval(interval)
      toast.add({ title: 'Lỗi!', description: 'Yêu cầu đã quá thời gian.', color: 'error' })
      isGenerating.value = false
      return
    }
    try {
      const response = await $fetch(`/api/jobs/${jobId}`)
      if (response.status === 'completed') {
        clearInterval(interval)
        if (response.result?.generatedText) {
          editor.value?.chain().focus().insertContent(response.result.generatedText).run()
          toast.add({ title: 'AI đã viết xong!', icon: 'i-heroicons-check-circle' })
        } else {
          toast.add({ title: 'Lỗi!', description: 'AI không trả về nội dung.', color: 'error' })
        }
        isGenerating.value = false
      } else if (response.status === 'failed') {
        clearInterval(interval)
        isGenerating.value = false
        toast.add({ title: 'Lỗi từ AI!', description: response.error, color: 'error' })
      }
    } catch (error) {
      clearInterval(interval)
      isGenerating.value = false
      toast.add({ title: 'Lỗi!', description: 'Không thể kiểm tra trạng thái công việc.', color: 'error' })
    }
  }, 3000) // Hỏi thăm mỗi 3 giây
}

// Hàm gọi API tạo nội dung (bất đồng bộ)
async function generateNextScene() {
  if (!userPrompt.value) {
    toast.add({ title: 'Vui lòng nhập yêu cầu cho AI', color: 'warning' })
    return
  }
  isGenerating.value = true
  toast.add({ title: 'Đã gửi yêu cầu cho AI', description: 'Tác vụ đang được xử lý nền...', icon: 'i-heroicons-clock' })

  try {
    const { jobId } = await $fetch('/api/chapters/generate-scene', {
      method: 'POST',
      body: {
        storyId,
        currentContent: editor.value?.getHTML() || '',
        userPrompt: userPrompt.value
      }
    })
    pollForSceneResult(jobId)
  } catch (e: any) {
    toast.add({ title: 'Lỗi khi gửi yêu cầu!', description: e.data?.statusMessage, color: 'error' })
    isGenerating.value = false
  }
}

async function rewriteSelection(mode: string) {
  // TODO: Gọi API rewrite
  toast.add({ title: `Đã gửi yêu cầu "${mode}" cho AI...` })
}
</script>

<style>
.tiptap p.is-editor-empty:first-child::before {
  content: 'Bắt đầu viết...';
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}
.tiptap:focus { outline: none; }
</style>
