<template>
  <Transition
    enter-active-class="ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isLoading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-white/75 dark:bg-gray-900/75 backdrop-blur-sm"
    >
      <Icon name="i-lucide-loader-circle" class="w-12 h-12 animate-spin text-primary" />
    </div>
  </Transition>
</template>

<script setup lang="ts">
// Lấy state `isLoading` toàn cục.
// Component này sẽ tự động phản ứng với bất kỳ thay đổi nào của state này.
const isLoading = useState('isLoading')
</script>
