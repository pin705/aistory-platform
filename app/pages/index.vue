<template>
  <UContainer>
    <h1 class="text-3xl font-bold my-8">Khám phá truyện mới</h1>

    {{ error }}
    <div v-if="pending" class="text-center">Đang tải...</div>
    <div v-else-if="error" class="text-center text-red-500">Không thể tải danh sách truyện.</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink v-for="story in stories" :key="story._id" :to="`/story/${story._id}`">
        <StoryCard :story="story" />
      </NuxtLink>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
// Fetch dữ liệu từ API khi component được tạo
const { data: stories, pending, error } = await useFetch('/api/stories')

// Đặt tiêu đề cho trang
useHead({
  title: 'Trang chủ - Nền tảng truyện AI',
})

definePageMeta({
  middleware: () => {
    const { loggedIn } = useUserSession();
    if (!loggedIn.value) return navigateTo("/login");
  },
});
</script>
