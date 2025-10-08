<template>
  <div class="flex items-center gap-1" @mouseleave="hoverRating = 0">
    <template v-for="i in 5" :key="i">
      <button
        type="button"
        @click="setRating(i)"
        @mouseover="hoverRating = i"
        class="p-1"
      >
        <UIcon
          name="i-heroicons-star-solid"
          class="w-7 h-7 transition-colors"
          :class="[
            (hoverRating || localRating) >= i ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
          ]"
        />
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue'])

const localRating = ref(props.modelValue)
const hoverRating = ref(0)

watch(() => props.modelValue, (newVal) => {
  localRating.value = newVal
})

function setRating(rating: number) {
  localRating.value = rating
  emit('update:modelValue', rating)
}
</script>
