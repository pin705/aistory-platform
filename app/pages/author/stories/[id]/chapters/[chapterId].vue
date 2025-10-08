<template>
  <UContainer class="py-8">
    <div class="mb-6">
      <NuxtLink :to="`/author/stories/${storyId}`" class="text-sm text-gray-500 hover:underline">‹ Quay lại danh sách chương</NuxtLink>
      <UInput
        v-model="chapterTitle"
        placeholder="Nhập tiêu đề chương"
        size="xl"
        variant="none"
        class="mt-2 text-3xl font-bold w-full p-0"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md">

          <TiptapBubbleMenu v-if="editor" :editor="editor" :tippy-options="{ duration: 100 }" class="bg-gray-800 p-1 rounded-md shadow-lg flex gap-1">
            <UButton size="sm" :variant="editor.isActive('bold') ? 'soft' : 'ghost'" color="white" @click="editor.chain().focus().toggleBold().run()">Bold</UButton>
            <UButton size="sm" :variant="editor.isActive('italic') ? 'soft' : 'ghost'" color="white" @click="editor.chain().focus().toggleItalic().run()">Italic</UButton>
            <UButton size="sm" :variant="editor.isActive('heading', { level: 2 }) ? 'soft' : 'ghost'" color="white" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">H2</UButton>
            <UButton size="sm" :variant="editor.isActive('heading', { level: 3 }) ? 'soft' : 'ghost'" color="white" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()">H3</UButton>
          </TiptapBubbleMenu>

          <TiptapEditorContent :editor="editor" />

          <div class="flex justify-between items-center text-xs text-gray-400 dark:text-gray-500 p-2 border-t border-gray-200 dark:border-gray-800">
            <div v-if="editor" class="select-none">
              {{ editor.storage.characterCount.words() }} từ / {{ editor.storage.characterCount.characters() }} ký tự
            </div>
            <div class="text-right transition-opacity duration-300" :class="autoSaveStatus === 'idle' ? 'opacity-0' : 'opacity-100'">
              <span v-if="autoSaveStatus === 'saving'">Đang lưu...</span>
              <span v-if="autoSaveStatus === 'saved'" class="flex items-center gap-1">Đã lưu ✓</span>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-1">
        <div class="sticky top-20">
          <UCard>
            <UTabs :items="tabs">
              <template #write="{ item }">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">{{ item.description }}</p>
                <UTextarea v-model="userPrompt" :rows="6" :placeholder="promptPlaceholder" />
                <UButton @click="generateNextScene" :loading="isGenerating" class="mt-4 w-full" icon="i-heroicons-pencil-square">Tạo nội dung</UButton>
              </template>
              <template #lorebook>
                <StoryLorebookManager :story-id="storyId" />
              </template>
            </UTabs>
          </UCard>
        </div>
      </div>
    </div>

    <div class="flex justify-end mt-6 gap-3">
      <UButton color="error" variant="ghost" @click="deleteChapter">Xóa chương</UButton>
      <UButton :loading="isSaving && autoSaveStatus !== 'saving'" @click="saveChapter(false)" size="lg">Lưu chương</UButton>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { useEditor, EditorContent as TiptapEditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import CharacterCount from '@tiptap/extension-character-count' // (MỚI) Import Word Count
import { watchDebounced } from '@vueuse/core' // (MỚI) Import cho Auto-Save
import { BubbleMenu as TiptapBubbleMenu} from '@tiptap/vue-3/menus'

const route = useRoute();
const toast = useToast();
const storyId = route.params.id as string;
const chapterId = route.params.chapterId as string;

const tabs = [
  { slot: 'write', label: 'Viết Tiếp', description: 'Nhập yêu cầu để AI viết tiếp:' },
  { slot: 'lorebook', label: 'Lorebook' },
];

// Các state quản lý trạng thái
const isSaving = ref(false);
const isGenerating = ref(false);
const autoSaveStatus = ref<'idle' | 'saving' | 'saved'>('idle'); // (MỚI) State cho Auto-Save
const userPrompt = ref("");
const chapterTitle = ref("");

// Lấy dữ liệu chương
const { data: chapterData } = await useFetch(chapterId !== 'new' ? `/api/chapters/${chapterId}` : null, { lazy: true });

const promptPlaceholder = `Ví dụ: "Viết cảnh Lục Thiếu Du đột phá, mô tả sự đau đớn và năng lượng kinh khủng bộc phát."`;

// Khởi tạo TipTap Editor với các extension mới
const editor = useEditor({
  content: '',
  extensions: [
    StarterKit,
    CharacterCount, // (MỚI) Kích hoạt Word Count
  ],
  editorProps: { attributes: { class: "prose dark:prose-invert max-w-none p-4 focus:outline-none min-h-[60vh]" } }
});

// `watch` dữ liệu từ `useFetch` để cập nhật editor và title
watch(chapterData, (newData) => {
  if (newData) {
    chapterTitle.value = newData.title;
    if (editor.value && !editor.value.isFocused) {
      editor.value?.commands.setContent(newData.content, false); // `false` để không emit update
    }
  }
}, { immediate: true });

// (MỚI) Logic Tự động lưu
watchDebounced(
  () => [chapterTitle.value, editor.value?.getHTML()],
  async ([newTitle, newContent], [oldTitle, oldContent]) => {
    // Chỉ tự động lưu khi có thay đổi thực sự và không phải lần load đầu tiên
    const hasChanged = newTitle !== oldTitle || newContent !== oldContent;
    if (editor.value && hasChanged && chapterId !== 'new') {
      autoSaveStatus.value = 'saving';
      await saveChapter(true); // Gọi hàm save ở chế độ im lặng
      autoSaveStatus.value = 'saved';
      setTimeout(() => autoSaveStatus.value = 'idle', 2000); // Ẩn thông báo sau 2s
    }
  },
  { debounce: 2500, deep: true } // Kích hoạt sau 2.5s không có thay đổi
)

async function deleteChapter() {
  if (chapterId === 'new') return;
  if (!confirm('Bạn có chắc chắn muốn xóa chương này?')) return;
  try {
    await $fetch(`/api/chapters/${chapterId}`, { method: 'DELETE' });
    toast.add({ title: 'Xóa chương thành công' });
    navigateTo(`/author/stories/${storyId}`);
  } catch (e: any) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'error' })
  }
}

// (CẬP NHẬT) Hàm lưu chương để hỗ trợ chế độ "im lặng"
async function saveChapter(isSilent = false) {
  isSaving.value = true;
  try {
    const htmlContent = editor.value?.getHTML() || '';
    const method = chapterId === 'new' ? 'POST' : 'PUT';
    const url = chapterId === 'new' ? `/api/stories/${storyId}/chapters` : `/api/chapters/${chapterId}`;

    const savedChapter = await $fetch(url, {
      method,
      body: { title: chapterTitle.value, content: htmlContent }
    });

    // Chỉ hiển thị toast khi không ở chế độ im lặng
    if (!isSilent) {
      toast.add({ title: 'Lưu chương thành công!', color: 'green' })
    }

    // Luôn kích hoạt indexing
    $fetch(`/api/chapters/${savedChapter._id || chapterId}/index-content`, { method: 'POST' })
      .catch(err => console.error('Indexing failed:', err));

    // Nếu là tạo chương mới, chuyển hướng đến trang sửa chương đó
    if (chapterId === 'new') {
      navigateTo(`/author/stories/${storyId}/chapters/${savedChapter._id}`)
    }
  } catch (e: any) {
    if (!isSilent) {
      toast.add({ title: 'Lỗi khi lưu!', description: e.data?.statusMessage, color: 'error' })
    }
  } finally {
    isSaving.value = false;
  }
}

// Hàm hỏi thăm kết quả job
function pollForSceneResult(jobId: string, timeout = 180000) { // Timeout 3 phút
  const startTime = Date.now();
  const interval = setInterval(async () => {
    if (Date.now() - startTime > timeout) {
      clearInterval(interval);
      toast.add({ title: 'Lỗi!', description: 'Yêu cầu đã quá thời gian.', color: 'error' });
      isGenerating.value = false;
      return;
    }
    try {
      const response = await $fetch(`/api/jobs/${jobId}`);
      if (response.status === 'completed') {
        clearInterval(interval);
        if (response.result?.generatedText) {
          editor.value?.chain().focus().insertContent(response.result.generatedText).run();
          toast.add({ title: 'AI đã viết xong!', icon: 'i-heroicons-check-circle' });
        } else {
          toast.add({ title: 'Lỗi!', description: 'AI không trả về nội dung.', color: 'error' });
        }
        isGenerating.value = false;
      } else if (response.status === 'failed') {
        clearInterval(interval);
        isGenerating.value = false;
        toast.add({ title: 'Lỗi từ AI!', description: response.error, color: 'error' });
      }
    } catch (error) {
      clearInterval(interval);
      isGenerating.value = false;
      toast.add({ title: 'Lỗi!', description: 'Không thể kiểm tra trạng thái công việc.', color: 'error' });
    }
  }, 3000); // Hỏi thăm mỗi 3 giây
}

// Hàm gọi API tạo nội dung (bất đồng bộ)
async function generateNextScene() {
  if (!userPrompt.value) {
    toast.add({ title: 'Vui lòng nhập yêu cầu cho AI', color: 'warning' })
    return
  }
  isGenerating.value = true;
  toast.add({ title: 'Đã gửi yêu cầu cho AI', description: 'Tác vụ đang được xử lý nền...', icon: 'i-heroicons-clock' })

  try {
    const { jobId } = await $fetch("/api/chapters/generate-scene", {
      method: "POST",
      body: {
        storyId,
        currentContent: editor.value?.getHTML() || '',
        userPrompt: userPrompt.value,
      },
    });
    pollForSceneResult(jobId);
  } catch (e: any) {
    toast.add({ title: "Lỗi khi gửi yêu cầu!", description: e.data?.statusMessage, color: "error" });
    isGenerating.value = false;
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
