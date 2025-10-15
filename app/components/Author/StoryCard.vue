<template>
  <div class="group relative border rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800">
    <div class="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
      <UBadge
        v-if="isHot"
        color="error"
        variant="solid"
        size="xs"
        class="shadow-md"
      >
        <UIcon
          name="i-heroicons-fire-20-solid"
          class="mr-1"
        /> Hot
      </UBadge>
      <UBadge
        v-if="isNew"
        variant="solid"
        size="xs"
        class="shadow-md"
      >
        <UIcon
          name="i-heroicons-sparkles-20-solid"
          class="mr-1"
        /> Mới
      </UBadge>
    </div>

    <div
      v-if="story.modelUsed"
      class="absolute top-2 right-2 z-10"
    >
      <UTooltip text="Model AI được sử dụng để sáng tác">
        <UBadge
          variant="solid"
          size="xs"
        >
          <UIcon
            name="i-heroicons-cpu-chip"
            class="mr-1"
          />
          {{ story.modelUsed }}
        </UBadge>
      </UTooltip>
    </div>

    <img
      :src="story.coverImage || '/placeholder-cover.jpg'"
      :alt="story.title"
      class="aspect-[2/3] w-full object-cover"
    >

    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex flex-col justify-end p-4">
      <h3 class="font-bold text-white text-lg line-clamp-2">
        {{ story.title }}
      </h3>
      <div class="mt-2 flex items-center justify-between">
        <UBadge
          :color="statusColors[story.status]"
          size="xs"
        >
          {{ statusLabels[story.status] }}
        </UBadge>
        <span class="text-xs text-gray-300">{{ story.chapterCount || 0 }} chương</span>
      </div>
    </div>

    <div class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <div class="flex items-center gap-2">
        <template
          v-for="(action, index) in flattenedActions"
          :key="index"
        >
          <UTooltip
            v-if="action.label"
            :text="action.label"
          >
            <UButton
              :icon="action.icon"
              :color="action.label === 'Xoá truyện' ? 'error' : 'neutral'"
              variant="ghost"
              class="bg-white/10 hover:bg-white/20 text-white rounded-full"
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

const flattenedActions = computed(() => {
  if (props.getActionItems) {
    return props.getActionItems(props.story).flat()
  }
  return []
})

// (MỚI) Logic để xác định các trạng thái đặc biệt
const oneDayAgo = new Date()
oneDayAgo.setDate(oneDayAgo.getDate() - 1)

const sevenDaysAgo = new Date()
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

// Truyện được coi là "Hot" nếu có trên 10,000 lượt xem (bạn có thể thay đổi ngưỡng này)
const isHot = computed(() => props.story.views > 10000)

// Truyện được coi là "Mới" nếu được tạo trong vòng 7 ngày gần đây
const isNew = computed(() => new Date(props.story.createdAt) > sevenDaysAgo)

// (Tùy chọn) Truyện có "Chương mới" nếu được cập nhật trong vòng 24 giờ
const hasNewChapter = computed(() => new Date(props.story.updatedAt) > oneDayAgo)
// Bạn có thể thêm một huy hiệu "Chương mới" tương tự như "Hot" và "Mới" nếu muốn
</script>
