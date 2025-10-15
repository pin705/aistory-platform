<template>
  <UContainer class="py-10">
    <h1 class="text-3xl font-bold mb-8">
      Hồ sơ của bạn
    </h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="md:col-span-1">
        <UCard v-if="user">
          <div class="flex flex-col items-center text-center">
            <AvatarUploader v-model="formState.avatar" />
            <h2 class="text-xl font-bold mt-4">
              {{ user.username }}
            </h2>
            <p class="text-sm text-gray-500">
              {{ user.email }}
            </p>
          </div>
        </UCard>
      </div>

      <div class="md:col-span-2">
        <UCard>
          <template #header>
            <h3 class="font-semibold">
              Thông tin cá nhân
            </h3>
          </template>

          <UForm
            :state="formState"
            :schema="schema"
            @submit="updateProfile"
          >
            <UFormField
              label="Tên hiển thị"
              name="username"
              class="mb-4"
            >
              <UInput v-model="formState.username" class="w-full" />
            </UFormField>
            <UFormField
              label="Tiểu sử (Bio)"
              name="bio"
              class="mb-4"
            >
              <UTextarea
                v-model="formState.bio"
                :rows="5"
                class="w-full"
                placeholder="Giới thiệu một chút về bản thân bạn..."
              />
            </UFormField>
            <UButton
              type="submit"
              :loading="isLoading"
               color="neutral"
            >
              Lưu thay đổi
            </UButton>
          </UForm>
        </UCard>

        <UCard class="mt-8">
          <template #header>
            <h3 class="font-semibold">
              Đổi mật khẩu
            </h3>
          </template>
          <p class="text-sm text-gray-500">
            Chức năng đang được phát triển.
          </p>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { z } from 'zod'

const { fetch } = useUserSession()
useHead({ title: 'Hồ sơ người dùng' })

const toast = useToast()
const isLoading = ref(false)

// Lấy dữ liệu người dùng ban đầu
const { data: user, refresh } = await useFetch('/api/user/profile')

const schema = z.object({
  username: z.string().min(3, 'Tên phải có ít nhất 3 ký tự'),
  bio: z.string().max(200, 'Tiểu sử không quá 200 ký tự').optional(),
  avatar: z.string().optional()
})

const formState = reactive({
  username: '',
  bio: '',
  avatar: ''
})

// Đồng bộ avatar thay đổi từ AvatarUploader vào formState
watch(() => formState.avatar, (newAvatar) => {
  if (newAvatar && newAvatar !== user.value?.avatar) {
    updateProfile()
  }
})

// Điền dữ liệu vào form khi fetch xong
watchEffect(() => {
  if (user.value) {
    formState.username = user.value.username
    formState.bio = user.value.bio || ''
    formState.avatar = user.value.avatar || ''
  }
})

async function updateProfile() {
  isLoading.value = true
  try {
    await $fetch('/api/user/profile', {
      method: 'PUT',
      body: {
        username: formState.username,
        bio: formState.bio,
        avatar: formState.avatar
      }
    })
    toast.add({ title: 'Cập nhật hồ sơ thành công!' })
    await refresh() // Tải lại dữ liệu mới nhất
    await fetch() // Cập nhật lại session
  } catch (error) {
    toast.add({ title: 'Lỗi!', description: 'Không thể cập nhật hồ sơ.', color: 'error' })
  } finally {
    isLoading.value = false
  }
}
</script>
