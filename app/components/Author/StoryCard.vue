<template>
  <div class="group relative border rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800">
    <img :src="story.coverImage || '/placeholder-cover.jpg'" :alt="story.title" class="aspect-[2/3] w-full object-cover">

    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex flex-col justify-end p-4">
      <h3 class="font-bold text-white text-lg line-clamp-2">{{ story.title }}</h3>
      <div class="mt-2 flex items-center justify-between">
        <UBadge :color="statusColors[story.status]" variant="soft" size="xs">{{ statusLabels[story.status] }}</UBadge>
        <span class="text-xs text-gray-300">{{ story.chapterCount || 0 }} chương</span>
      </div>
    </div>

    <div class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <div class="flex items-center gap-2">
        <template v-for="(action, index) in flattenedActions" :key="index">
          <UTooltip v-if="action.label" :text="action.label">
            <UButton
              :icon="action.icon"
              :color="action.label === 'Xoá truyện' ? 'red' : 'gray'"
              variant="ghost"
              class="bg-white/10 hover:bg-white/20 text-white"
              @click="action.click"
            />
          </UTooltip>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  story: { type: Object, required: true },
  statusColors: { type: Object, required: true },
  statusLabels: { type: Object, required: true },
  getActionItems: { type: Function, required: true }
})

// (MỚI) Dùng computed để làm phẳng mảng actions từ getActionItems
// (ví dụ: từ [[item1], [item2]] thành [item1, item2])
const flattenedActions = computed(() => {
  if (props.getActionItems) {
    return props.getActionItems(props.story).flat();
  }
  return [];
});
</script>
