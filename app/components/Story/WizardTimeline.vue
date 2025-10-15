<template>
  <aside class="col-span-3 border-r border-gray-200 dark:border-gray-800 p-8 flex flex-col justify-between h-screen sticky top-0">
    <div>
      <NuxtLink
        to="/dashboard"
        class="text-sm text-gray-500 hover:underline mb-8 block"
      >‹ Quay lại Tác phẩm</NuxtLink>
      <h2 class="font-bold text-lg mb-6">
        Tiến trình sáng tạo
      </h2>
      <div class="space-y-6">
        <div
          v-for="step in wizardSteps"
          :key="step.id"
          class="flex items-start gap-4"
        >
          <div class="flex flex-col items-center flex-shrink-0">
            <button
              :disabled="step.id > highestStep"
              class="w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all disabled:cursor-not-allowed"
              :class="getStepClass(step.id)"
              @click="$emit('goToStep', step.id)"
            >
              <Icon
                v-if="currentStep > step.id"
                name="i-heroicons-check"
                class="w-5 h-5"
              />
              <span v-else>{{ step.id }}</span>
            </button>
            <div
              v-if="step.id < wizardSteps.length"
              class="w-px h-15 mt-1"
              :class="currentStep > step.id ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'"
            />
          </div>
          <div>
            <h3
              class="font-semibold"
              :class="currentStep >= step.id ? 'text-gray-900 dark:text-white' : 'text-gray-400'"
            >
              {{ step.name }}
            </h3>
            <p
              v-if="currentStep > step.id"
              class="text-xs text-primary-500 mt-1"
            >
              {{ getStepSummary(step.id) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
const props = defineProps<{
  wizardSteps: any[]
  currentStep: number
  highestStep: number
  getStepClass: (stepId: number) => string
  getStepSummary: (stepId: number) => string
}>()
defineEmits(['goToStep', 'reset'])
</script>
