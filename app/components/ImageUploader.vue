<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Ảnh bìa</label>
    <div class="mt-1">
      <div class="relative w-32 h-48 rounded-md group">
        <label for="cover-image-upload" class="cursor-pointer">
          <div class="w-full h-full rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
            <img v-if="imageUrl" :src="imageUrl" alt="Ảnh bìa" class="w-full h-full object-cover" />
            <UIcon v-else name="i-heroicons-photo" class="w-12 h-12 text-gray-400" />
          </div>

          <div v-if="!isUploading" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
            <UIcon name="i-heroicons-pencil-square" class="w-8 h-8 text-white" />
          </div>
        </label>

        <input id="cover-image-upload" type="file" @change="onFileChange" accept="image/png, image/jpeg, image/webp" class="hidden" />

        <UButton
          v-if="imageUrl && !isUploading"
          @click="removeImage"
          icon="i-heroicons-x-mark-20-solid"
          size="xs"
          color="error"
          variant="solid"
          class="absolute top-1 right-1"
        />

        <div v-if="isUploading" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-md p-4">
          <div class="w-full">
            <UProgress :value="uploadProgress" />
            <p class="text-xs mt-1 text-white text-center">Đang tải... {{ uploadProgress }}%</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue?: string }>()
const emit = defineEmits(['update:modelValue'])

const toast = useToast()
const imageUrl = ref(props.modelValue)
const isUploading = ref(false)
const uploadProgress = ref(0)

watch(() => props.modelValue, (newVal) => {
  imageUrl.value = newVal
})

// (MỚI) Hàm để xóa ảnh
function removeImage() {
  imageUrl.value = ''
  emit('update:modelValue', '')
  // Reset input file để người dùng có thể chọn lại cùng 1 file
  const input = document.getElementById('cover-image-upload') as HTMLInputElement;
  if (input) {
    input.value = '';
  }
}

async function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  isUploading.value = true
  uploadProgress.value = 0

  try {
    const { uploadUrl, publicUrl } = await $fetch('/api/upload/presigned-url', {
      method: 'POST',
      body: { fileName: file.name, fileType: file.type }
    })

    const xhr = new XMLHttpRequest()
    xhr.open('PUT', uploadUrl)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        uploadProgress.value = Math.round((e.loaded / e.total) * 100)
      }
    }
    xhr.onload = () => {
      if (xhr.status === 200) {
        imageUrl.value = publicUrl
        emit('update:modelValue', publicUrl)
        toast.add({ title: 'Tải ảnh bìa thành công!' })
      } else {
        toast.add({ title: 'Lỗi khi tải ảnh lên R2.', color: 'error' })
      }
      isUploading.value = false
    }
    xhr.onerror = () => {
      toast.add({ title: 'Lỗi mạng, không thể tải ảnh.', color: 'error' })
      isUploading.value = false
    }
    xhr.send(file)

  } catch (e: any) {
    toast.add({ title: 'Lỗi!', description: e.data?.statusMessage || 'Không thể lấy URL tải lên.', color: 'error' })
    isUploading.value = false
  }
}
</script>
