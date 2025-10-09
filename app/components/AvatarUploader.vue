<template>
  <div class="relative w-32 h-32">
    <UAvatar
      :src="previewUrl || currentAvatar || '/placeholder-avatar.png'"
      size="3xl"
      class="w-full h-full"
    />
    <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full">
      <label
        for="avatar-upload"
        class="cursor-pointer text-white p-4 rounded-full"
      >
        <Icon
          name="heroicons:arrow-up-tray"
          class="w-8 h-8"
        />
      </label>
      <input
        id="avatar-upload"
        type="file"
        class="hidden"
        accept="image/*"
        @change="handleFileChange"
      >
    </div>
    <div
      v-if="isLoading"
      class="absolute inset-0 bg-black/70 flex items-center justify-center rounded-full"
    >
      <Icon
        name="i-lucide-loader"
        class="w-8 h-8 animate-spin text-white"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits(['update:modelValue'])

const toast = useToast()
const isLoading = ref(false)
const previewUrl = ref<string | null>(null)

// Sử dụng computed để đồng bộ 2 chiều với component cha
const currentAvatar = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

// (CẬP NHẬT) Hàm xử lý upload theo logic pre-signed URL
async function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  // Hiển thị ảnh preview ngay lập tức
  previewUrl.value = URL.createObjectURL(file)
  isLoading.value = true

  try {
    // 1. Gọi API của bạn để lấy pre-signed URL
    const { uploadUrl, publicUrl } = await $fetch('/api/upload/presigned-url', { // <-- Đảm bảo đường dẫn này đúng với API của bạn
      method: 'POST',
      body: {
        fileName: file.name,
        fileType: file.type
      }
    })

    // 2. Tải file trực tiếp lên `uploadUrl` bằng phương thức PUT
    //    Lưu ý: body là file gốc, không phải FormData
    await $fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type
      },
      body: file
    })

    // 3. Sau khi upload thành công, cập nhật modelValue bằng `publicUrl`
    currentAvatar.value = publicUrl

    toast.add({ title: 'Cập nhật avatar thành công!' })
  } catch (error) {
    console.error('Lỗi upload ảnh:', error)
    toast.add({ title: 'Lỗi upload ảnh', description: 'Vui lòng thử lại sau.', color: 'red' })
  } finally {
    isLoading.value = false
    // Xóa URL preview để hiển thị ảnh mới từ `currentAvatar`
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = null
    }
  }
}
</script>
