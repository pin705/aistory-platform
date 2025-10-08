<template>
  <div class="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
    <NuxtLink :to="`/story/${story._id}`" class="absolute inset-0 z-10" />
    <div class="aspect-[2/3] w-full">
      <img
        :src="story.coverImage || '/placeholder-cover.jpg'"
        :alt="story.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    </div>
    <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4">
      <h3 class="font-bold text-white text-lg truncate group-hover:text-primary-300 transition-colors">
        {{ story.title }}
      </h3>
      <p class="text-gray-300 text-sm mt-1 line-clamp-2">
        {{ story.description }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  story: {
    type: Object as () => ({ _id: string; title: string; description?: string; coverImage?: string }),
    required: true
  }
})
</script>
