<template>
  <div class="flex items-center">
    <template v-for="i in 5" :key="i">
      <UIcon
        :name="getStarName(i)"
        class="w-5 h-5"
        :class="[
          Math.ceil(rating) >= i ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
        ]"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  rating: {
    type: Number,
    required: true,
    default: 0
  }
})

function getStarName(index: number): string {
  if (props.rating >= index) {
    // Sao đầy
    return 'i-heroicons-star-solid'
  }
  if (props.rating > index - 1 && props.rating < index) {
    // Nửa sao
    return 'i-heroicons-star-half-solid'
  }
  // Sao rỗng
  return 'i-heroicons-star'
}
</script>
