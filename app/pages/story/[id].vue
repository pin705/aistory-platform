<template>
  <div v-if="data">
    <section class="relative bg-gray-900 py-10 md:py-16 text-white">
      <div class="absolute inset-0">
        <img :src="data.story.coverImage || '/placeholder-cover.jpg'" class="w-full h-full object-cover opacity-20 blur-sm" />
      </div>

      <UContainer class="relative grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
        <div class="w-48 md:w-full mx-auto md:col-span-1">
          <img :src="data.story.coverImage || '/placeholder-cover.jpg'" :alt="data.story.title" class="rounded-lg shadow-2xl aspect-[2/3] object-cover" />
        </div>

        <div class="md:col-span-3 text-center md:text-left">
          <h1 class="text-3xl lg:text-5xl font-extrabold">{{ data.story.title }}</h1>
          <div class="mt-4 flex items-center justify-center md:justify-start gap-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-user-circle" />
              <span>{{ data.story.author.username }}</span>
            </div>
            <UBadge :color="statusColors[data.story.status]" variant="subtle" size="lg">{{ statusLabels[data.story.status] }}</UBadge>
          </div>
          <div class="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
            <UBadge v-for="genre in data.story.genres" :key="genre" color="gray">{{ genre }}</UBadge>
          </div>
        </div>
      </UContainer>
    </section>

    <UContainer class="py-10">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <h2 class="text-2xl font-bold mb-4 border-b pb-2">Giới thiệu</h2>
          <p class="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{{ data.story.description }}</p>
        </div>
        <div>
          <h2 class="text-2xl font-bold mb-4 border-b pb-2">Danh sách chương</h2>
          <div class="max-h-[600px] overflow-y-auto space-y-2 pr-2">
            <NuxtLink
              v-for="chapter in data.chapters"
              :key="chapter._id"
              :to="`/story/${data.story._id}/chapters/${chapter.chapterNumber}`"
              class="block p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Chương {{ chapter.chapterNumber }}: {{ chapter.title }}
            </NuxtLink>
             <div v-if="!data.chapters.length" class="text-center text-gray-500 py-4">
              Truyện chưa có chương nào.
            </div>
          </div>
        </div>
      </div>
    </UContainer>
  </div>
  <div v-else class="text-center py-20">
    <p>Đang tải thông tin truyện...</p>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const storyId = route.params.id as string

const { data, error } = await useFetch(`/api/stories/public/${storyId}`)

if (error.value) {
  // Xử lý lỗi, ví dụ chuyển hướng về trang 404
  console.error("Failed to fetch story details:", error.value)
  await navigateTo('/404')
}

// Dùng cho việc hiển thị badge trạng thái
const statusColors: Record<string, any> = { draft: 'orange', published: 'green', 'on-hold': 'gray' }
const statusLabels: Record<string, string> = { draft: 'Bản nháp', published: 'Đã xuất bản', 'on-hold': 'Tạm ngưng' }

useHead({ title: () => data.value ? data.value.story.title : 'Đang tải...' })
</script>
