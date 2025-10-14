<template>
  <div class="min-h-screen grid grid-cols-1 lg:grid-cols-2">
    <div class="relative hidden lg:flex flex-col items-center justify-center p-12 bg-gray-900 text-white overflow-hidden">
      <div class="stars" />

      <div class="relative z-10 w-full max-w-md">
        <h1
          v-motion-slide-bottom
          class="text-5xl font-bold tracking-tighter"
        >
          Sáng Tác Truyện
        </h1>
        <p
          v-motion-slide-bottom
          :delay="200"
          class="mt-4 text-lg text-gray-300"
        >
          Nơi Trí tuệ Nhân tạo chắp cánh cho Trí tưởng tượng của bạn.
        </p>

        <div
          v-motion-slide-bottom
          :delay="400"
          class="mt-10 space-y-6 border-l-2 border-primary-500 pl-6"
        >
          <div class="space-y-1">
            <h3 class="font-semibold">
              Sáng thế bằng AI
            </h3>
            <p class="text-sm text-gray-400">
              Từ một ý tưởng, AI phác thảo toàn bộ thế giới, nhân vật và cốt truyện cho bạn.
            </p>
          </div>
          <div class="space-y-1">
            <h3 class="font-semibold">
              Trợ lý Viết Thông minh
            </h3>
            <p class="text-sm text-gray-400">
              AI đồng hành trong từng chương, gợi ý tình tiết, đảm bảo tính nhất quán.
            </p>
          </div>
          <div class="space-y-1">
            <h3 class="font-semibold">
              Quản lý Lorebook Trực quan
            </h3>
            <p class="text-sm text-gray-400">
              Xây dựng và tra cứu mọi chi tiết về thế giới của bạn một cách dễ dàng.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-center p-4 bg-white dark:bg-gray-900">
      <UCard
        class="w-full max-w-sm"
        :ui="{ ring: 'ring-0', shadow: 'shadow-none' }"
      >
        <template #header>
          <h1
            v-motion-slide-bottom
            class="text-3xl font-bold"
          >
            Bắt đầu Hành trình
          </h1>
          <p
            v-motion-slide-bottom
            :delay="100"
            class="text-sm text-gray-500 dark:text-gray-400 mt-1"
          >
            Tạo tài khoản và giải phóng trí tưởng tượng của bạn.
          </p>
        </template>

        <div
          v-motion-slide-bottom
          :delay="200"
          class="space-y-3"
        >
          <UButton
            block
            icon="i-simple-icons-google"
            @click="() => {
              toast.add({ title: 'Chức năng đang phát triển...', color: 'info' })
            }"
          >
            Tiếp tục với Google
          </UButton>
          <UButton
            block
            icon="i-simple-icons-github"
            @click="() => {
              toast.add({ title: 'Chức năng đang phát triển...', color: 'info' })
            }"
          >
            Tiếp tục với Github
          </UButton>
        </div>

        <USeparator
          v-motion-slide-bottom
          :delay="300"
          label="HOẶC ĐĂNG KÝ BẰNG EMAIL"
          class="my-6"
        />

        <UForm
          :state="state"
          :schema="schema"
          class="space-y-4"
          @submit="submit"
        >
          <UFormField
            v-motion-slide-bottom
            :delay="400"
            label="Tên Tác giả (Username)"
            name="username"
          >
            <UInput
              v-model="state.username"
              placeholder="Bút danh của bạn"
              icon="i-heroicons-user"
              class="w-full"
            />
          </UFormField>
          <UFormField
            v-motion-slide-bottom
            :delay="500"
            label="Email"
            name="email"
          >
            <UInput
              v-model="state.email"
              placeholder="you@example.com"
              icon="i-heroicons-envelope"
              class="w-full"
            />
          </UFormField>
          <UFormField
            v-motion-slide-bottom
            :delay="600"
            label="Mật khẩu"
            name="password"
          >
            <UInput
              v-model="state.password"
              type="password"
              placeholder="********"
              icon="i-heroicons-lock-closed"
              class="w-full"
            />
          </UFormField>
          <UFormField
            v-motion-slide-bottom
            :delay="700"
            label="Xác nhận mật khẩu"
            name="passwordConfirm"
          >
            <UInput
              v-model="state.passwordConfirm"
              type="password"
              placeholder="********"
              icon="i-heroicons-lock-closed"
              class="w-full"
            />
          </UFormField>
          <UButton
            v-motion-slide-bottom
            :delay="800"
            type="submit"
            block
            :loading="isLoading"
            size="lg"
          >
            Tạo tài khoản
          </UButton>
        </UForm>

        <template #footer>
          <div
            v-motion-slide-bottom
            :delay="900"
            class="text-center"
          >
            <p class="text-sm text-gray-500">
              Đã có tài khoản?
              <NuxtLink
                to="/login"
                class="text-primary font-medium"
              >Đăng nhập ngay</NuxtLink>
            </p>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
  layout: 'auth'
})

const toast = useToast()
const isLoading = ref(false)

const schema = z.object({
  username: z.string().min(3, 'Tên người dùng phải có ít nhất 3 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  passwordConfirm: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
}).refine(data => data.password === data.passwordConfirm, {
  message: 'Mật khẩu không khớp',
  path: ['passwordConfirm'] // Hiển thị lỗi ở trường xác nhận mật khẩu
})

type Schema = z.output<typeof schema>

const state = reactive({
  username: '',
  email: '',
  password: '',
  passwordConfirm: ''
})

async function submit(event: FormSubmitEvent<Schema>) {
  isLoading.value = true
  try {
    await $fetch('/api/user/register', {
      method: 'POST',
      body: {
        username: event.data.username,
        email: event.data.email,
        password: event.data.password
      }
    })

    toast.add({ title: 'Đăng ký thành công!', description: 'Bây giờ bạn có thể đăng nhập.', color: 'success' })
    await navigateTo('/login')
  } catch (error: any) {
    toast.add({ title: 'Lỗi!', description: error.data?.statusMessage || 'Đã có lỗi xảy ra', color: 'error' })
  } finally {
    isLoading.value = false
  }
}
</script>
