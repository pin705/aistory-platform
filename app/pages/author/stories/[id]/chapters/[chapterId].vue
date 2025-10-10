<template>
  <div
    v-if="chapterData"
    class="bg-gray-50 dark:bg-gray-900/50 min-h-screen"
  >
    <header class="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <UContainer class="flex items-center justify-between h-16">
        <div class="flex items-center gap-4">
          <!-- <UButton
            icon="i-heroicons-queue-list"
            variant="ghost"
            @click="isNavOpen = true"
          /> -->
          <div class="flex flex-col">
            <NuxtLink
              :to="`/author/stories/${storyId}`"
              class="text-xs text-gray-500 hover:underline"
            >
              {{ chapterData?.title }}
            </NuxtLink>
            <UInput
              v-model="chapterTitle"
              placeholder="Nhập tiêu đề chương"
              size="md"
              variant="none"
              class="font-bold text-lg p-0"
            />
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div
            class="text-sm text-gray-500 transition-opacity duration-300 flex items-center gap-1"
            :class="autoSaveStatus === 'idle' ? 'opacity-0' : 'opacity-100'"
          >
            <span v-if="autoSaveStatus === 'saving'">Đang lưu...</span>
            <span v-if="autoSaveStatus === 'saved'">Đã lưu ✓</span>
          </div>
          <UButton
            :loading="isSaving && autoSaveStatus !== 'saving'"
            icon="i-heroicons-check"
            @click="saveChapter(false)"
             color="neutral"
          >
            Lưu
          </UButton>
        </div>
      </UContainer>
    </header>

    <UContainer class="py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <div class="bg-white dark:bg-gray-900 shadow-md rounded-lg">
          <div
            v-if="editor"
            class="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-800 sticky top-16 bg-white dark:bg-gray-900 z-10 rounded-t-lg"
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
            class="p-1 rounded-md shadow-lg flex gap-1"
          >
            <UButton
              size="xs"
              color="neutral"
              variant="soft"
              @click="rewriteSelection('improve')"
            >
              Cải thiện
            </UButton>
            <UButton
              size="xs"
              color="neutral"
              variant="soft"
              @click="rewriteSelection('shorter')"
            >
              Rút gọn
            </UButton>
            <UButton
              size="xs"
              color="neutral"
              variant="soft"
              @click="rewriteSelection('longer')"
            >
              Mở rộng
            </UButton>
          </TiptapBubbleMenu>

          <TiptapEditorContent :editor="editor" />

          <div class="flex justify-between items-center text-xs text-gray-400 dark:text-gray-500 p-2 border-t border-gray-200 dark:border-gray-800">
            <div
              v-if="editor"
              class="select-none"
            >
              {{ editor.storage.characterCount.words() }} từ / {{ editor.storage.characterCount.characters() }} ký tự
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-1">
        <div class="sticky top-20">
          <UCard>
            <template #header>
              <h3 class="font-semibold flex items-center gap-2">
                <Icon
                  name="i-heroicons-sparkles"
                  class="text-primary"
                /> Trợ lý Sáng tác
              </h3>
            </template>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Nhập yêu cầu để AI viết tiếp:
            </p>
            <UTextarea
              v-model="userPrompt"
              :rows="8"
              :placeholder="promptPlaceholder"
              class="w-full"
            />
            <UButton
              :loading="isGenerating"
              class="mt-4 w-full"
              icon="i-heroicons-pencil-square"
              @click="generateNextScene"
               color="neutral"
            >
              Tạo nội dung
            </UButton>
          </UCard>
        </div>
      </div>
    </UContainer>
  </div>
  <div
    v-else
    class="flex items-center justify-center h-screen"
  >
    <div class="text-center">
      <div
        class="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-primary"
        role="status"
      >
        <!-- <span class="visually-hidden">Loading...</span> -->
      </div>
      <p class="mt-2 text-gray-500">
        Đang tải chương...
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent as TiptapEditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import CharacterCount from '@tiptap/extension-character-count' // (MỚI) Import Word Count
import { watchDebounced } from '@vueuse/core' // (MỚI) Import cho Auto-Save
import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/vue-3/menus'

const route = useRoute()
const toast = useToast()
const storyId = route.params.id as string
const chapterId = route.params.chapterId as string
const isNavOpen = ref(false)

const tabs = [
  { slot: 'write', label: 'Viết Tiếp', description: 'Nhập yêu cầu để AI viết tiếp:' },
  { slot: 'lorebook', label: 'Lorebook' }
]

// Các state quản lý trạng thái
const isSaving = ref(false)
const isGenerating = ref(false)
const autoSaveStatus = ref<'idle' | 'saving' | 'saved'>('idle') // (MỚI) State cho Auto-Save
const userPrompt = ref('')
const chapterTitle = ref('')

// Lấy dữ liệu chương
const { data: chapterData } = await useFetch(chapterId !== 'new' ? `/api/chapters/${chapterId}` : null, { lazy: true })

const promptPlaceholder = `Ví dụ: "Viết cảnh Lục Thiếu Du đột phá, mô tả sự đau đớn và năng lượng kinh khủng bộc phát."`

// Khởi tạo TipTap Editor với các extension mới
const editor = useEditor({
  content: '',
  extensions: [
    StarterKit,
    CharacterCount // (MỚI) Kích hoạt Word Count
  ],
  editorProps: { attributes: { class: 'prose dark:prose-invert max-w-none p-4 focus:outline-none min-h-[60vh]' } }
})

async function rewriteSelection(mode: 'improve' | 'shorter' | 'longer') {
  if (!editor.value) return
  const { from, to } = editor.value.state.selection
  const selectedText = editor.value.state.doc.textBetween(from, to)

  if (!selectedText) {
    toast.add({ title: 'Vui lòng bôi đen đoạn văn bản cần xử lý', color: 'warning' })
    return
  }

  // TODO: Gọi một API mới, ví dụ `/api/chapters/rewrite-text`
  // Gửi đi `selectedText` và `mode`
  // Nhận kết quả và thay thế đoạn văn bản đã chọn
  toast.add({ title: `Đã gửi yêu cầu "${mode}" cho AI...` })
  // Ví dụ: editor.value.chain().focus().deleteSelection().insertContent(result.rewrittenText).run()
}

// `watch` dữ liệu từ `useFetch` để cập nhật editor và title
watch(chapterData, (newData) => {
  if (newData) {
    chapterTitle.value = newData.title
    if (editor.value && !editor.value.isFocused) {
      editor.value?.commands.setContent(newData.content, false) // `false` để không emit update
    }
  }
}, { immediate: true })

// (MỚI) Logic Tự động lưu
watchDebounced(
  () => [chapterTitle.value, editor.value?.getHTML()],
  async ([newTitle, newContent], [oldTitle, oldContent]) => {
    // Chỉ tự động lưu khi có thay đổi thực sự và không phải lần load đầu tiên
    const hasChanged = newTitle !== oldTitle || newContent !== oldContent
    if (editor.value && hasChanged && chapterId !== 'new') {
      autoSaveStatus.value = 'saving'
      await saveChapter(true) // Gọi hàm save ở chế độ im lặng
      autoSaveStatus.value = 'saved'
      setTimeout(() => autoSaveStatus.value = 'idle', 2000) // Ẩn thông báo sau 2s
    }
  },
  { debounce: 2500, deep: true } // Kích hoạt sau 2.5s không có thay đổi
)

// (CẬP NHẬT) Hàm lưu chương để hỗ trợ chế độ "im lặng"
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
      toast.add({ title: 'Lưu chương thành công!', color: 'green' })
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
</script>

<style>
.tiptap p.is-editor-empty:first-child::before {
  content: 'Bắt đầu viết chương của bạn ở đây...';
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}
.tiptap:focus {
  outline: none;
}
</style>
