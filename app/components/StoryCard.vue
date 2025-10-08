<template>
  <UCard
    :ui="{
      ring: 'ring-1 ring-gray-200 dark:ring-gray-800',
      divide: 'divide-y-0',
      body: { padding: 'p-0 sm:p-0' },
      header: { padding: 'p-4 sm:p-4' },
      footer: { padding: 'p-2 sm:p-2' },
    }"
  >
    <template #header>
      <h3 class="text-lg font-bold truncate">{{ story.title }}</h3>
      <p class="text-sm text-gray-500">Tác giả: {{ story.author.username }}</p>
    </template>

    <div class="p-4">
      <p class="text-sm line-clamp-3">{{ story.description }}</p>
    </div>

    <template #footer>
      <div class="flex flex-wrap gap-2">
        <UBadge v-for="genre in story.genres" :key="genre" color="gray" variant="soft">
          {{ genre }}
        </UBadge>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
// Định nghĩa prop `story` mà component này sẽ nhận
defineProps({
  story: {
    type: Object,
    required: true,
  },
})
</script>
