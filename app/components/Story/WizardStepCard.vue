<template>
  <div :key="title">
    <h1 class="text-4xl font-bold tracking-tight">{{ title }}</h1>
    <p class="text-gray-500 dark:text-gray-400 mt-2 mb-8">{{ description }}</p>
    <div class="space-y-6">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>
