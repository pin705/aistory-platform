<template>
  <UDropdownMenu>
    <UButton
      color="gray"
      variant="ghost"
      icon="i-heroicons-swatch-20-solid"
      aria-label="Theme"
    />

    <template #item="{ item }">
      <div class="p-2">
        <p class="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Màu chính (Primary)
        </p>
        <div class="grid grid-cols-5 gap-2">
          <UButton
            v-for="color in primaryColors"
            :key="color.value"
            :color="color.value"
            variant="solid"
            class="!rounded-full justify-center"
            @click="updatePrimaryColor(color.value)"
          >
            <UIcon v-if="appConfig.ui.primary === color.value" name="i-heroicons-check" />
          </UButton>
        </div>

        <p class="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-4 mb-2">
          Màu nền (Gray)
        </p>
        <div class="grid grid-cols-5 gap-2">
          <UButton
            v-for="color in grayColors"
            :key="color.value"
            :color="color.value"
            variant="solid"
            class="!rounded-full justify-center"
            @click="updateGrayColor(color.value)"
          >
            <UIcon v-if="appConfig.ui.gray === color.value" name="i-heroicons-check" />
          </UButton>
        </div>
      </div>
    </template>
  </UDropdownMenu>
</template>

<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'

const appConfig = useAppConfig()
const toast = useToast()

// Lấy danh sách màu từ Tailwind config
const primaryColors = computed(() =>
  appConfig.ui.colors.filter(color => color !== 'primary').map(color => ({ value: color, hex: colors[color][500] }))
)
const grayColors = computed(() => ['slate', 'cool', 'zinc', 'neutral', 'stone'].map(color => ({ value: color, hex: colors[color][500] })))

// Sử dụng localStorage để lưu lựa chọn của người dùng
const userTheme = useLocalStorage('user-theme', {
  primary: appConfig.ui.primary,
  gray: appConfig.ui.gray,
})

// Hàm cập nhật màu chính
function updatePrimaryColor(color: string) {
  appConfig.ui.primary = color
  userTheme.value.primary = color
  toast.add({ title: 'Đã đổi màu chính!' })
}

// Hàm cập nhật màu nền
function updateGrayColor(color: string) {
  appConfig.ui.gray = color
  userTheme.value.gray = color
  toast.add({ title: 'Đã đổi màu nền!' })
}
</script>
