<template>
  <div
    v-if="homeData"
    class=""
  >
    <section class="text-white">
      <UContainer class="grid lg:grid-cols-2 gap-12 items-center py-20 lg:py-32">
        <div v-motion-slide-visible-once-left>
          <UBadge variant="subtle" color="neutral">
            Nền tảng Sáng tác truyện bằng AI
          </UBadge>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter mt-4 dark:text-white text-black">
            Sáng tác tiểu thuyết của bạn, vận hành bởi AI.
          </h1>
          <p class="mt-4 text-lg dark:text-white/40 text-black/30">
            Từ ý tưởng đến chương cuối, Sáng Tác Truyện là người bạn đồng hành sáng tạo, giúp bạn xây dựng thế giới, phát triển nhân vật và vượt qua mọi rào cản của việc viết lách.
          </p>
          <div class="mt-8 flex gap-3">
            <UButton
              to="/author/stories/new"
              icon="i-heroicons-pencil-square-20-solid"
              color="neutral"
            >
              Bắt đầu Sáng tác
            </UButton>
            <UButton
              to="/kham-pha"
              variant="ghost"
              trailing-icon="i-heroicons-arrow-right"
              color="neutral"
            >
              Khám phá Truyện
            </UButton>
          </div>
        </div>
        <div
          v-motion-slide-visible-once-right
          class="hidden lg:block"
        >
          <UCarousel
            v-slot="{ item }"
            :items="homeData.featuredStories"
            :ui="{ item: 'basis-full' }"
            loop
            autoplay
            class="rounded-lg shadow-2xl"
            :arrows="false"
            :indicators="false"
          >
            <img
              :src="item.coverImage"
              class="aspect-[4/3] w-full object-cover"
              draggable="false"
            >
          </UCarousel>
        </div>
      </UContainer>
    </section>
    <section class="py-20 lg:py-24">
      <UContainer>
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-3xl font-bold">
            Tác phẩm Mới nhất
          </h2>
          <UButton
            label="Xem tất cả"
            variant="link"
            trailing-icon="i-heroicons-arrow-right"
            to="/kham-pha"
          />
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          <StoryCard
            v-for="story in homeData.editorPicks"
            :key="story._id"
            :story="story"
          />
        </div>
      </UContainer>
    </section>
  </div>
  <div
    v-else
    class="text-center py-20"
  >
    Đang tải...
  </div>
</template>

<script setup lang="ts">
const { data: homeData } = useFetch('/api/home-data')

// Dữ liệu cho khu vực Features
const features = [
  { icon: 'i-lucide-wand-2', title: 'AI Sáng thế', description: 'Từ một ý tưởng, AI tự động phác thảo tên truyện, mô tả, nhân vật và cả thế giới cho bạn.', delay: 1 },
  { icon: 'i-lucide-bot', title: 'Trợ lý Soạn thảo', description: 'AI đồng hành cùng bạn trong từng chương, giúp tạo dàn ý, viết tiếp và gỡ bí ý tưởng.', delay: 2 },
  { icon: 'i-lucide-library', title: 'Lorebook Thông minh', description: 'Quản lý mọi chi tiết về nhân vật, địa danh, thế lực... một cách trực quan và nhất quán.', delay: 3 }
]

// SEO cho trang chủ
useHead({ title: 'Nhà văn sách & tiểu thuyết AI - Viết tiểu thuyết AI miễn phí | Sáng tác truyện' })
</script>
