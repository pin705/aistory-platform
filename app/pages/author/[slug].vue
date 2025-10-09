<template>
  <div
    v-if="authorData"
    class="bg-gray-50 dark:bg-gray-900/50 min-h-screen"
  >
    <section class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <UContainer class="py-8">
        <div class="flex flex-col sm:flex-row items-center gap-6">
          <UAvatar
            :src="authorData.author.avatar"
            :alt="authorData.author.username"
            size="3xl"
          />
          <div class="flex-1 text-center sm:text-left">
            <h1 class="text-3xl font-bold">
              {{ authorData.author.username }}
            </h1>
            <p class="text-sm text-gray-500 mt-1">
              Thành viên từ {{ new Date(authorData.author.createdAt).toLocaleDateString('vi-VN') }}
            </p>
            <div class="mt-4 flex items-center justify-center sm:justify-start gap-6">
              <div>
                <p class="font-bold text-xl">
                  {{ authorData.stats.storyCount }}
                </p><p class="text-xs text-gray-500">
                  Tác phẩm
                </p>
              </div>
              <div>
                <p class="font-bold text-xl">
                  {{ authorData.stats.followerCount }}
                </p><p class="text-xs text-gray-500">
                  Người theo dõi
                </p>
              </div>
              <div>
                <p class="font-bold text-xl">
                  {{ authorData.stats.totalViews }}
                </p><p class="text-xs text-gray-500">
                  Tổng lượt đọc
                </p>
              </div>
            </div>
          </div>
          <UButton
            :loading="isFollowingLoading"
            :variant="isFollowingState ? 'soft' : 'solid'"
            size="lg"
            :icon="isFollowingState ? 'i-heroicons-check' : 'i-heroicons-user-plus'"
            @click="handleFollow"
          >
            {{ isFollowingState ? 'Đang theo dõi' : 'Theo dõi' }}
          </UButton>
        </div>
      </UContainer>
    </section>

    <UContainer class="py-10">
      <UTabs
        :items="tabs"
        class="w-full"
        variant="link"
      >
        <template #works="{ item }">
          <UCard>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              <StoryCard
                v-for="story in authorData.stories"
                :key="story._id"
                :story="story"
              />
            </div>
          </UCard>
        </template>

        <template #activity="{ item }">
          <UCard>
            <div class="space-y-6">
              <div
                v-for="item in activityFeed"
                :key="item.id"
                class="flex gap-3"
              >
                <Icon
                  :name="item.icon"
                  class="w-6 h-6 mt-1 flex-shrink-0"
                  :class="item.iconClass"
                />
                <div class="flex-1">
                  <p v-html="item.text" />
                  <p class="text-xs text-gray-400">
                    {{ formatDistanceToNow(new Date(item.date), { addSuffix: true, locale: vi }) }}
                  </p>
                </div>
              </div>
            </div>
          </UCard>
        </template>

        <template #about="{ item }">
          <UCard class="mt-6">
            <p
              v-if="authorData.author.bio"
              class="text-gray-600 dark:text-gray-300 whitespace-pre-wrap"
            >
              {{ authorData.author.bio }}
            </p>
            <p
              v-else
              class="text-gray-400"
            >
              Tác giả này chưa có giới thiệu.
            </p>
          </UCard>
        </template>
      </UTabs>
    </UContainer>
  </div>
  <div
    v-else
    class="text-center py-20"
  >
    Đang tải thông tin tác giả...
  </div>
</template>

<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

const route = useRoute()
const toast = useToast()
const { loggedIn } = useUserSession()
const slug = route.params.slug as string

const { data: authorData, error } = await useFetch(`/api/authors/${slug}`)
if (error.value) { await navigateTo('/404', { replace: true }) }

const tabs = [
  { slot: 'works', label: 'Tác phẩm' },
  { slot: 'activity', label: 'Hoạt động mới' },
  { slot: 'about', label: 'Giới thiệu' }
]

// ----- LOGIC THEO DÕI -----
const isFollowingLoading = ref(false)
const isFollowingState = ref(authorData.value?.isFollowing || false)
async function handleFollow() {
  if (!loggedIn.value) {
    return toast.add({ title: 'Vui lòng đăng nhập để theo dõi tác giả', color: 'warning' })
  }
  isFollowingLoading.value = true
  try {
    const result = await $fetch(`/api/authors/${authorData.value?.author._id}/follow`, { method: 'POST' })
    isFollowingState.value = result.isFollowing
    // Cập nhật số follower mà không cần fetch lại toàn bộ trang
    if (authorData.value) {
      authorData.value.stats.followerCount += result.isFollowing ? 1 : -1
    }
  } catch (e: any) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage, color: 'error' })
  } finally {
    isFollowingLoading.value = false
  }
}

// ----- LOGIC HOẠT ĐỘNG MỚI -----
const activityFeed = computed(() => {
  if (!authorData.value) return []

  const chapters = authorData.value.latestChapters.map(c => ({
    id: `c-${c._id}`,
    type: 'chapter',
    icon: 'i-heroicons-book-open',
    iconClass: 'text-green-500',
    text: `Đã xuất bản <strong>Chương ${c.chapterNumber}: ${c.title}</strong> trong truyện <em>${c.storyId.title}</em>`,
    date: c.createdAt
  }))

  const reviews = authorData.value.latestReviews.map(r => ({
    id: `r-${r._id}`,
    type: 'review',
    icon: 'i-heroicons-star',
    iconClass: 'text-yellow-500',
    text: `<strong>${r.userId.username}</strong> đã để lại một đánh giá cho truyện <em>${r.storyId.title}</em>`,
    date: r.createdAt
  }))

  return [...chapters, ...reviews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

useHead({ title: () => `Tác giả ${authorData.value?.author.username || ''} | Bút Thần Giới` })
</script>
