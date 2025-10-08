<template>
  <UContainer class="py-8">
    <div class="mb-6">
      <NuxtLink
        :to="`/author/stories/${storyId}`"
        class="text-sm text-gray-500 hover:underline"
        >‹ Quay lại danh sách chương</NuxtLink
      >
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
        <div
          class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md"
        >
          <div
            v-if="editor"
            class="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-800 sticky top-[65px] bg-white dark:bg-gray-900 z-10"
          >
            <UButton
              size="sm"
              :variant="editor.isActive('bold') ? 'soft' : 'ghost'"
              @click="editor.chain().focus().toggleBold().run()"
              >Bold</UButton
            >
            <UButton
              size="sm"
              :variant="editor.isActive('italic') ? 'soft' : 'ghost'"
              @click="editor.chain().focus().toggleItalic().run()"
              >Italic</UButton
            >
            <UButton
              size="sm"
              :variant="editor.isActive('strike') ? 'soft' : 'ghost'"
              @click="editor.chain().focus().toggleStrike().run()"
              >Strike</UButton
            >
          </div>
          <TiptapEditorContent :editor="editor" />
        </div>
      </div>

      <div class="lg:col-span-1">
        <div class="sticky top-20">
          <UCard>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Nhập yêu cầu để AI viết tiếp
            </p>
            <UTextarea
              v-model="userPrompt"
              :rows="6"
              class="w-full"
              :placeholder="promptPlaceholder"
            />
            <UButton
              @click="generateNextScene"
              :loading="isGenerating"
              class="mt-4 w-full"
              icon="i-heroicons-pencil-square"
              >Tạo nội dung</UButton
            >
          </UCard>
        </div>
      </div>
    </div>

    <div class="flex justify-end mt-6 gap-3">
      <UButton color="error" variant="ghost">Xóa chương</UButton>
      <UButton :loading="isSaving" @click="saveChapter" size="lg"
        >Lưu chương</UButton
      >
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { z } from "zod";
import { useEditor, EditorContent as TiptapEditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";

const route = useRoute();
const toast = useToast();
const storyId = route.params.id as string;
const chapterId = route.params.chapterId as string;

const tabs = [
  {
    slot: "write",
    label: "Viết Tiếp",
    description: "Nhập yêu cầu để AI viết tiếp:",
  },
  {
    slot: "lorebook",
    label: "Lorebook",
    description: "Quản lý các nhân vật trong truyện.",
  },
];

// Các state quản lý trạng thái chung
const isSaving = ref(false);
const isGenerating = ref(false);
const userPrompt = ref("");
const chapterTitle = ref("");

// Lấy dữ liệu chương
const { data: chapterData, pending } = await useFetch(
  chapterId !== "new" ? `/api/chapters/${chapterId}` : null,
  { lazy: true }
);

const promptPlaceholder = `Ví dụ: "Viết cảnh Lục Thiếu Du đột phá, mô tả sự đau đớn và năng lượng kinh khủng bộc phát."`;

// Khởi tạo TipTap Editor
const editor = useEditor({
  content: "",
  extensions: [StarterKit],
  editorProps: {
    attributes: {
      class:
        "prose dark:prose-invert max-w-none p-4 focus:outline-none min-h-[60vh]",
    },
  },
});
watch(
  chapterData,
  (newData) => {
    if (newData) {
      chapterTitle.value = newData.title;
      editor.value?.commands.setContent(newData.content);
    }
  },
  { immediate: true }
);

const isCharacterModalOpen = ref(false);
const selectedCharacter = ref<any>(null);

const characterFormState = reactive({
  name: "",
  role: "Nhân vật phụ",
  description: "",
  backstory: "",
  abilities: "",
});

async function generateNextScene() {
  isGenerating.value = true;
  try {
    const result = await $fetch("/api/chapters/generate-scene", {
      method: "POST",
      body: {
        storyId,
        currentContent: editor.value?.getText() || "",
        userPrompt: userPrompt.value,
      },
    });
    if (result.generatedText) {
      editor.value
        ?.chain()
        .focus()
        .insertContent(` ${result.generatedText}`)
        .run();
      toast.add({
        title: "AI đã viết xong!",
        icon: "i-heroicons-check-circle",
      });
    }
  } catch (e: any) {
    toast.add({
      title: "Lỗi khi tạo nội dung!",
      description: e.data?.statusMessage,
      color: "warning",
    });
  } finally {
    isGenerating.value = false;
  }
}

async function saveChapter() {
  isSaving.value = true;
  try {
    const htmlContent = editor.value?.getHTML() || "";
    const method = chapterId === "new" ? "POST" : "PUT";
    const url =
      chapterId === "new"
        ? `/api/stories/${storyId}/chapters`
        : `/api/chapters/${chapterId}`;

    const savedChapter = await $fetch(url, {
      method,
      body: { title: chapterTitle.value, content: htmlContent },
    });
    toast.add({ title: "Lưu chương thành công!", color: "success" });

    $fetch(`/api/chapters/${savedChapter._id || chapterId}/index-content`, {
      method: "POST",
    })
      .then(() =>
        console.log(
          "Indexing started for chapter:",
          savedChapter._id || chapterId
        )
      )
      .catch((err) => console.error("Indexing failed:", err));

    if (chapterId === "new") {
      navigateTo(`/author/stories/${storyId}/chapters/${savedChapter._id}`);
    }
  } catch (e: any) {
    toast.add({
      title: "Lỗi khi lưu!",
      description: e.data?.statusMessage,
      color: "warning",
    });
  } finally {
    isSaving.value = false;
  }
}
</script>

<style>
/* Tùy chỉnh thêm cho trình soạn thảo Tiptap */
.tiptap p.is-editor-empty:first-child::before {
  content: "Bắt đầu viết chương của bạn ở đây...";
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}
.tiptap:focus {
  outline: none;
}
</style>
