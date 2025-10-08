<template>
  <div v-if="storyData">
    <section class="border-b border-gray-200 dark:border-gray-800">
      <UContainer class="py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        <div class="md:col-span-3">
          <img :src="story.coverImage || '/placeholder-cover.jpg'" :alt="story.title" class="rounded-lg shadow-lg aspect-[2/3] object-cover w-full" />
        </div>

        <div class="md:col-span-9 flex flex-col justify-center">
          <h1 class="text-3xl lg:text-4xl font-bold">{{ story.title }}</h1>
          <div class="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div class="flex items-center gap-1.5">
              <UIcon name="i-heroicons-user-circle" />
              <span>{{ story.author.username }}</span>
            </div>
            <span>|</span>
            <UBadge :color="statusColors[story.status]" variant="subtle">{{ statusLabels[story.status] }}</UBadge>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <UBadge v-for="genre in story.genres" :key="genre" color="gray" variant="outline">{{ genre }}</UBadge>
          </div>

          <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border-t border-gray-200 dark:border-gray-800 pt-6">
            <div>
              <p class="font-bold text-2xl">{{ chapters?.length || 0 }}</p>
              <p class="text-sm text-gray-500">Chương</p>
            </div>
            <div>
              <p class="font-bold text-2xl">{{ story.views || 0 }}</p>
              <p class="text-sm text-gray-500">Lượt xem</p>
            </div>
            <div>
              <div class="font-bold text-2xl flex items-center justify-center gap-1">
                <UIcon name="i-heroicons-star-solid" class="text-yellow-400" />
                <span>{{ story.averageRating ? story.averageRating.toFixed(1) : 'N/A' }}</span>
              </div>
              <p class="text-sm text-gray-500">/ {{ story.reviewCount }} đánh giá</p>
            </div>
            <div>
              <p class="font-bold text-2xl">{{ formatDistanceToNow(new Date(story.updatedAt), { addSuffix: true, locale: vi }) }}</p>
              <p class="text-sm text-gray-500">Cập nhật</p>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <UContainer class="py-10">
      <UTabs :items="tabs" class="w-full">
        <template #description="{ item }">
          <h2 class="text-2xl font-bold mb-4">{{ item.label }}</h2>
          <p class="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{{ story.description }}</p>
        </template>

        <template #chapters="{ item }">
          <h2 class="text-2xl font-bold mb-4">{{ item.label }}</h2>
          <div class="max-h-[60vh] overflow-y-auto space-y-1">
            <NuxtLink v-for="chapter in chapters" :key="chapter._id" :to="`/story/${story._id}/chapters/${chapter.chapterNumber}`"
              class="flex justify-between p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <span>Chương {{ chapter.chapterNumber }}: {{ chapter.title }}</span>
              <span class="text-sm text-gray-400">{{ formatDistanceToNow(new Date(chapter.updatedAt), { addSuffix: true, locale: vi }) }}</span>
            </NuxtLink>
          </div>
        </template>

         <template #reviews="{ item }">
           <h2 class="text-2xl font-bold mb-6">{{ item.label }} ({{ reviews.length }})</h2>
           <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div class="md:col-span-1">
                <h3 class="font-semibold mb-4">Viết đánh giá của bạn</h3>
                <div v-if="loggedIn">
                  <UForm :state="newReviewState" :schema="reviewSchema" @submit="submitReview">
                    <UFieldGroup label="Đánh giá của bạn" name="rating" class="mb-4">
                      <StarInput v-model="newReviewState.rating" />
                    </UFieldGroup>
                    <UFieldGroup label="Bình luận" name="comment">
                      <UTextarea v-model="newReviewState.comment" placeholder="Chia sẻ cảm nhận của bạn về câu truyện..." />
                    </UFieldGroup>
                    <UButton type="submit" :loading="isSubmittingReview" class="mt-4">Gửi đánh giá</UButton>
                  </UForm>
                </div>
                <div v-else>
                  <p class="text-sm text-gray-500">Vui lòng <NuxtLink to="/login" class="text-primary font-medium">đăng nhập</NuxtLink> để để lại đánh giá.</p>
                </div>
             </div>
             <div class="md:col-span-2">
                <div v-if="reviews.length > 0" class="space-y-6">
                  <div v-for="review in reviews" :key="review._id">
                    <div class="flex items-center gap-3">
                      <UAvatar :src="review.userId.avatar" :alt="review.userId.username" />
                      <div>
                        <p class="font-semibold">{{ review.userId.username }}</p>
                        <StarRating :rating="review.rating" />
                      </div>
                    </div>
                    <p class="mt-3 text-gray-700 dark:text-gray-300">{{ review.comment }}</p>
                    <p class="text-xs text-gray-400 mt-2">{{ formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: vi }) }}</p>
                  </div>
                </div>
                <div v-else class="text-center py-10">
                  <p>Chưa có đánh giá nào cho truyện này.</p>
                </div>
             </div>
           </div>
        </template>
      </UTabs>
    </UContainer>
  </div>
  <div v-else class="text-center py-20"><p>Đang tải thông tin truyện...</p></div>
</template>

<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { z } from 'zod'

const { loggedIn } = useUserSession() // Kiểm tra người dùng đã đăng nhập chưa

const route = useRoute()
const storyId = route.params.id as string

const { data: storyData, error } = await useFetch(`/api/stories/public/${storyId}`)
const { data: reviews, refresh: refreshReviews } = await useFetch(`/api/stories/${storyId}/reviews`, { default: () => [] })

if (error.value) {
  console.error("Failed to fetch story details:", error.value)
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
  } catch (e: any) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'red' })
  } finally {
    isSubmittingReview.value = false
  }
}

useHead({ title: () => story.value ? story.value.title : 'Đang tải...' })
</script>
