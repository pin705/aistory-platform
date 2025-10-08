<template>
  <div
    v-if="data"
    :class="readerSettings.theme"
    class="bg-background text-foreground transition-colors duration-300"
  >
    <header
      class="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border"
    >
      <UContainer class="flex items-center justify-between h-16">
        <div class="flex-1">
          <NuxtLink
            :to="`/story/${storyId}`"
            class="flex items-center gap-2 group"
          >
            <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
            <span class="font-bold truncate group-hover:text-primary">{{
              data.story.title
            }}</span>
          </NuxtLink>
        </div>
        <div class="flex-1 text-center truncate px-4">
          Chương {{ data.currentChapter.chapterNumber }}:
          {{ data.currentChapter.title }}
        </div>
        <div class="flex-1 flex justify-end items-center gap-2">
          <UButton
            @click="isSettingsOpen = true"
            icon="i-heroicons-cog-6-tooth"
            color="neutral"
            variant="ghost"
          />
        </div>
      </UContainer>
    </header>

    <main class="py-8">
      <div
        class="prose dark:prose-invert max-w-4xl mx-auto px-4"
        :class="[readerSettings.fontSize, readerSettings.fontFamily]"
        v-html="data.currentChapter.content"
      />
    </main>

    <footer class="py-8 border-t border-border">
      <UContainer class="flex justify-between items-center">
        <UButton
          :to="
            data.prevChapter
              ? `/story/${storyId}/chapters/${data.prevChapter.chapterNumber}`
              : undefined
          "
          :disabled="!data.prevChapter"
          icon="i-heroicons-arrow-left-circle"
          size="lg"
          variant="outline"
        >
          Chương trước
        </UButton>
        <UButton
          :to="
            data.nextChapter
              ? `/story/${storyId}/chapters/${data.nextChapter.chapterNumber}`
              : undefined
          "
          :disabled="!data.nextChapter"
          icon="i-heroicons-arrow-right-circle"
          trailing
          size="lg"
          variant="outline"
        >
          Chương sau
        </UButton>
      </UContainer>
    </footer>

    <USlideover v-model:open="isSettingsOpen">
      <template #header>
        <h2 class="font-bold">Tùy chỉnh đọc truyện</h2>
      </template>

      <template #content>
        <UCard
          class="flex flex-col flex-1"
          :ui="{
            body: { base: 'flex-1' },
            ring: '',
            divide: 'divide-y divide-gray-100 dark:divide-gray-800',
          }"
        >
          <div class="space-y-6 p-4">
            <UFieldGroup label="Font chữ">
              <USelectMenu
                v-model="readerSettings.fontFamily"
                :items="fontOptions"
              />
            </UFieldGroup>

            <UFieldGroup label="Cỡ chữ">
              <div class="flex items-center gap-2">
                <USlider
                  v-model="fontSizeIndex"
                  :min="0"
                  :max="fontSizes.length - 1"
                />
              </div>
            </UFieldGroup>
          </div>
        </UCard>
      </template>
    </USlideover>
  </div>
  <div v-else class="text-center py-20">Đang tải chương...</div>
</template>

<script setup lang="ts">
import { useLocalStorage, useEventListener } from "@vueuse/core";

const route = useRoute();
const router = useRouter();
const storyId = route.params.id as string;
const chapterNumber = route.params.chapterNumber as string;

const { data, error } = await useFetch(
  `/api/chapters/public/${storyId}/${chapterNumber}`
);

if (error.value) {
  console.error("Failed to fetch chapter:", error.value);
  await navigateTo("/404", { replace: true });
}

// ----- TÙY CHỈNH TRẢI NGHIỆM ĐỌC -----
const isSettingsOpen = ref(false);

// Các tùy chọn Font
const fontOptions = [
  { label: "Mặc định (Sans)", value: "font-sans" },
  { label: "Cổ điển (Serif)", value: "font-serif" },
  { label: "Dễ đọc (Mono)", value: "font-mono" },
];
// Các tùy chọn Cỡ chữ
const fontSizes = [
  "prose-sm",
  "prose-base",
  "prose-lg",
  "prose-xl",
  "prose-2xl",
];
const fontSizeIndex = ref(1);

// Các tùy chọn Nền
const themeOptions = [
  { label: "Sáng", value: "theme-light" },
  { label: "Tối", value: "theme-dark" },
  { label: "Sepia", value: "theme-sepia" },
];

// Lưu cài đặt của người dùng vào Local Storage để ghi nhớ
const readerSettings = useLocalStorage("reader-settings", {
  fontFamily: "font-sans",
  fontSize: "prose-base",
  theme: "theme-light", // Mặc định là nền sáng
});

// Cập nhật fontSize class khi index thay đổi
watch(fontSizeIndex, (newIndex) => {
  readerSettings.value.fontSize = fontSizes[newIndex];
});

// ----- TỐI ƯU SEO -----
// Lấy 160 ký tự đầu tiên của chương (đã loại bỏ HTML) để làm meta description
const plainContent = computed(
  () => data.value?.currentChapter.content.replace(/<[^>]*>?/gm, "") || ""
);
const metaDescription = computed(
  () => plainContent.value.substring(0, 160) + "..."
);

useSeoMeta({
  title: () =>
    `${data.value?.story.title} - Chương ${data.value?.currentChapter.chapterNumber}`,
  description: metaDescription,
  ogTitle: () =>
    `${data.value?.story.title} - Chương ${data.value?.currentChapter.chapterNumber}`,
  ogDescription: metaDescription,
});

// ----- ĐIỀU HƯỚNG BẰNG BÀN PHÍM -----
useEventListener(document, "keydown", (e) => {
  if (e.key === "ArrowRight" && data.value?.nextChapter) {
    router.push(
      `/story/${storyId}/chapters/${data.value.nextChapter.chapterNumber}`
    );
  }
  if (e.key === "ArrowLeft" && data.value?.prevChapter) {
    router.push(
      `/story/${storyId}/chapters/${data.value.prevChapter.chapterNumber}`
    );
  }
});
</script>
