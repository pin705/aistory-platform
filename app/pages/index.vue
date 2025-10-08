<template>
  <div>
    <section class="bg-gray-900 text-white">
      <UContainer class="py-12 md:py-20 text-center">
        <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight">Chào mừng đến với LoreWeaver AI</h1>
        <p class="mt-4 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
          Nơi những ý tưởng của bạn được chắp cánh bởi trí tuệ nhân tạo, tạo nên những thế giới truyện kỳ vĩ.
        </p>
        <UButton size="xl" class="mt-8" to="/author/dashboard">Bắt đầu Sáng tác</UButton>
      </UContainer>
    </section>

    <UContainer class="py-10">
      <section v-if="homeData?.hotStories?.length" class="mb-12">
        <h2 class="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
          <UIcon name="i-heroicons-fire-20-solid" class="text-red-500" />
          Truyện Hot
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          <StoryCard v-for="story in homeData.hotStories" :key="story._id" :story="story" />
        </div>
      </section>

      <section v-if="homeData?.newStories?.length">
        <h2 class="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
          <UIcon name="i-heroicons-sparkles-20-solid" class="text-yellow-500" />
          Mới Cập Nhật
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          <StoryCard v-for="story in homeData.newStories" :key="story._id" :story="story" />
        </div>
      </section>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
// (CẬP NHẬT) Chỉ cần một lệnh useFetch
const { data: homeData } = useFetch('/api/stories')

useHead({ title: 'Trang chủ - LoreWeaver AI' })
</script>
