<template>
  <div v-if="story">
    <section
      class="relative border-b border-gray-200 dark:border-gray-800 py-10 overflow-hidden"
    >
      <div class="absolute inset-0">
        <img
          :src="story.coverImage || '/placeholder-cover.jpg'"
          :alt="story.title"
          class="w-full h-full object-cover filter blur-2xl brightness-50"
        >
      </div>
      <UContainer
        class="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
      >
        <div class="md:col-span-3">
          <img
            :src="story.coverImage || '/placeholder-cover.jpg'"
            :alt="story.title"
            class="rounded-lg shadow-2xl aspect-[2/3] object-cover w-full mx-auto md:mx-0 max-w-[250px]"
          >
        </div>

        <div class="md:col-span-9 flex flex-col justify-center text-white">
          <h1 class="text-3xl lg:text-5xl font-bold tracking-tight">
            {{ story.title }}
          </h1>
          <div class="mt-4 flex items-center gap-4 text-sm text-gray-300">
            <div
              class="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <UIcon name="i-heroicons-user-circle" />
              <span>{{ story.author.username }}</span>
            </div>
            <span>|</span>
            <UBadge
              :color="statusColors[story.status]"
              variant="subtle"
              size="lg"
            >
              {{ statusLabels[story.status] }}
            </UBadge>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <UBadge
              v-for="genre in story.genres"
              :key="genre"
              color="gray"
              variant="outline"
            >
              {{ genre }}
            </UBadge>
          </div>

          <div class="mt-8 flex items-center gap-3">
            <UButton
              :to="firstChapterLink"
              icon="i-heroicons-book-open"
              size="xl"
              class="flex-1 sm:flex-none justify-center"
              color="neutral"
            >
              Đọc từ đầu
            </UButton>
            <UButton
              :to="latestChapterLink"
              icon="i-heroicons-sparkles"
              size="xl"
              class="flex-1 sm:flex-none justify-center"
            >
              Chương mới nhất
            </UButton>
            <UButton
              :loading="isAddingToLibrary"
              :icon="
                isInLibrary
                  ? 'i-heroicons-check-circle'
                  : 'i-heroicons-plus-circle'
              "
              size="xl"
              variant="ghost"
              class="hidden sm:inline-flex"
              @click="addToLibrary"
            />
          </div>
        </div>
      </UContainer>
    </section>

    <section class="bg-gray-50 dark:bg-gray-800/50">
      <UContainer
        class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center py-6"
      >
        <div>
          <p class="font-bold text-2xl">
            {{ chapters?.length || 0 }}
          </p>
          <p class="text-sm text-gray-500">
            Chương
          </p>
        </div>
        <div>
          <p class="font-bold text-2xl">
            {{ story.views || 0 }}
          </p>
          <p class="text-sm text-gray-500">
            Lượt xem
          </p>
        </div>
        <div>
          <div
            class="font-bold text-2xl flex items-center justify-center gap-1"
          >
            <UIcon
              name="i-heroicons-star-solid"
              class="text-yellow-400"
            />
            <span>{{
              story.averageRating ? story.averageRating.toFixed(1) : "–"
            }}</span>
          </div>
          <p class="text-sm text-gray-500">
            / {{ story.reviewCount || 0 }} đánh giá
          </p>
        </div>
        <div>
          <p class="font-bold text-lg">
            {{
              formatDistanceToNow(new Date(story.updatedAt), {
                addSuffix: true,
                locale: vi
              })
            }}
          </p>
          <p class="text-sm text-gray-500">
            Cập nhật
          </p>
        </div>
      </UContainer>
    </section>

    <UContainer class="py-10">
      <UTabs
        :items="tabs"
        class="w-full"
        color="neutral"
        variant="link"
      >
        <template #description="{ item }">
          <!-- <template #header>
              <h2 class="text-xl font-semibold">
                {{ item.label }}
              </h2>
            </template> -->
          <p class="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
            {{ story.description }}
          </p>
        </template>
        <template #chapters="{ item }">
          <div class="max-h-[60vh] overflow-y-auto space-y-1 -m-3">
            <NuxtLink
              v-for="chapter in chapters"
              :key="chapter._id"
              :to="`/story/${story._id}/chapters/${chapter.chapterNumber}`"
              class="flex justify-between p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span>Chương {{ chapter.chapterNumber }}: {{ chapter.title }}</span>
              <span class="text-sm text-gray-400 flex-shrink-0 ml-4">{{
                formatDistanceToNow(new Date(chapter.updatedAt), {
                  addSuffix: true,
                  locale: vi
                })
              }}</span>
            </NuxtLink>
          </div>
        </template>
        <template #reviews="{ item }">
          <h2 class="text-xl font-semibold">
            {{ item.label }} ({{ reviews.length }})
          </h2>
        </template>
      </UTabs>
    </UContainer>
  </div>
  <div
    v-else
    class="text-center py-20"
  >
    <p>Đang tải thông tin truyện...</p>
  </div>
</template>

<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { z } from 'zod'

const { loggedIn } = useUserSession() // Kiểm tra người dùng đã đăng nhập chưa

const route = useRoute()
const toast = useToast()
const storyId = route.params.id as string

const {
  data: storyData,
  error,
  refresh: refreshStoryData
} = await useFetch(`/api/stories/public/${storyId}`)
const { data: reviews, refresh: refreshReviews } = await useFetch(
  `/api/stories/${storyId}/reviews`,
  { default: () => [] }
)

if (error.value) {
  console.error('Failed to fetch story details:', error.value)
  await navigateTo('/404', { replace: true })
}

// Gán data vào các biến computed để dễ dùng
const story = computed(() => storyData.value?.story)
const chapters = computed(() => storyData.value?.chapters)

const tabs = [
  { slot: 'description', label: 'Giới thiệu' },
  { slot: 'chapters', label: 'Danh sách chương' },
  { slot: 'reviews', label: 'Đánh giá & Bình luận' }
]

// (MỚI) Link cho các nút hành động
const firstChapterLink = computed(() =>
  chapters.value?.length ? `/story/${story.value._id}/chapters/1` : undefined
)
const latestChapterLink = computed(() =>
  chapters.value?.length
    ? `/story/${story.value._id}/chapters/${
      chapters.value[chapters.value.length - 1].chapterNumber
    }`
    : undefined
)

// (MỚI) State và hàm giả lập cho "Thêm vào tủ truyện"
const isAddingToLibrary = ref(false)
const isInLibrary = ref(false) // Giả sử ban đầu chưa có trong tủ
function addToLibrary() {
  // TODO: Gọi API để thêm/xóa truyện khỏi tủ truyện của người dùng
  if (!loggedIn.value) {
    toast.add({
      title: 'Vui lòng đăng nhập để sử dụng tính năng này',
      color: 'orange'
    })
    return
  }
  isAddingToLibrary.value = true
  setTimeout(() => {
    isInLibrary.value = !isInLibrary.value
    isAddingToLibrary.value = false
    toast.add({
      title: isInLibrary.value
        ? 'Đã thêm vào tủ truyện!'
        : 'Đã xóa khỏi tủ truyện'
    })
  }, 1000)
}

const isSubmittingReview = ref(false)
const reviewSchema = z.object({
  rating: z.number().min(1, 'Vui lòng chọn số sao'),
  comment: z.string().min(10, 'Bình luận phải có ít nhất 10 ký tự')
})
const newReviewState = reactive({ rating: 0, comment: '' })

async function submitReview() {
  isSubmittingReview.value = true
  try {
    await $fetch(`/api/stories/${storyId}/reviews`, {
      method: 'POST',
      body: newReviewState
    })
    toast.add({ title: 'Gửi đánh giá thành công!' })
    newReviewState.rating = 0
    newReviewState.comment = ''
    await refreshReviews() // Tải lại danh sách bình luận
    await refreshStoryData() // Tải lại thông tin truyện để cập nhật rating trung bình
  } catch (e) {
    toast.add({
      title: 'Lỗi!',
      description: e.data?.statusMessage,
      color: 'error'
    })
  } finally {
    isSubmittingReview.value = false
  }
}

const config = useRuntimeConfig()
// 1. Tạo các biến SEO cơ bản một cách động
const pageTitle = computed(() => `${story.value.title} - ${story.value.author.username} | Bút Thần Giới`)
const pageDescription = computed(() => (story.value.description || '').substring(0, 160) + '...')
const canonicalUrl = computed(() => `${config.public.baseURL}${route.fullPath}`)
const ogImageUrl = computed(() => story.value.coverImage || `${config.public.baseURL}/og-image.png`)

// 2. Sử dụng useSeoMeta để chèn các thẻ meta
useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  keywords: () => ['đọc truyện', 'tiểu thuyết', story.value.title, story.value.author.username, ...(story.value.tags || [])].join(', '),

  // Open Graph (Facebook, Zalo, Messenger...)
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogImage: ogImageUrl,
  ogUrl: canonicalUrl,
  ogType: 'article', // 'article' tốt hơn 'website' cho trang chi tiết
  ogLocale: 'vi_VN',

  // Các thẻ meta Article chi tiết hơn
  articleAuthor: () => story.value.author.username,
  articlePublishedTime: () => new Date(story.value.createdAt).toISOString(),
  articleModifiedTime: () => new Date(story.value.updatedAt).toISOString(),
  articleTag: () => story.value.tags,

  // Twitter Card (Khi chia sẻ trên Twitter/X)
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
  twitterImage: ogImageUrl
})

// 3. (NÂNG CAO) Thêm Structured Data (JSON-LD) cho Google Rich Snippets
// Giúp Google hiểu đây là một cuốn sách/truyện và có thể hiển thị xếp hạng sao
const jsonLd = computed(() => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    'name': story.value.title,
    'author': {
      '@type': 'Person',
      'name': story.value.author.username
    },
    'description': story.value.description,
    'image': ogImageUrl.value,
    'url': canonicalUrl.value,
    'inLanguage': 'vi-VN',
    'genre': story.value.genres,
    'datePublished': new Date(story.value.createdAt).toISOString(),
    'dateModified': new Date(story.value.updatedAt).toISOString(),
    // Chỉ thêm xếp hạng nếu có
    'aggregateRating': story.value.reviewCount > 0
      ? {
          '@type': 'AggregateRating',
          'ratingValue': story.value.averageRating.toFixed(1),
          'ratingCount': story.value.reviewCount
        }
      : undefined
  }
  return schema
})

// Sử dụng useHead để chèn JSON-LD
useHead({
  script: [
    {
      type: 'application/ld+json',
      children: () => JSON.stringify(jsonLd.value, null, 2)
    }
  ],
  // Thêm link canonical
  link: [
    { rel: 'canonical', href: canonicalUrl }
  ]
})
</script>
