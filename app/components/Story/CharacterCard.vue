<template>
  <UCard class="group relative hover:ring-2 hover:ring-primary-500 transition-all h-full flex flex-col">
    <template #header>
      <div class="flex items-center gap-3">
        <UAvatar
          :src="character.avatar"
          :alt="character.name"
          size="md"
        />
        <div class="flex-1">
          <h4 class="font-bold text-base truncate">
            {{ character.name }}
          </h4>
          <p class="text-xs text-gray-500">
            {{ character.role }}
          </p>
        </div>
      </div>
    </template>

    <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-4 flex-1">
      {{ character.description || 'Chưa có mô tả.' }}
    </p>

    <div class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
      <div class="flex items-center gap-2">
        <UButton
          icon="i-heroicons-pencil-square"
          size="lg"
          variant="ghost"
          @click="emit('edit', character)"
        />
        <UButton
          icon="i-heroicons-trash"
          size="lg"
          variant="ghost"
          @click="emit('delete', character._id)"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{ character: any }>()
const emit = defineEmits(['edit', 'delete'])
</script>
