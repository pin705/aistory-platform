<template>
  <div class="flex items-center justify-center min-h-screen">
    <UCard class="w-full max-w-sm">
      <template #header>
        <h1 class="text-2xl font-bold text-center">
          Đăng nhập
        </h1>
      </template>

      <UForm
        :state="state"
        :schema="schema"
        @submit="submit"
      >
        <UFormField
          label="Email"
          name="email"
          class="mb-4"
        >
          <UInput
            v-model="state.email"
            placeholder="you@example.com"
            icon="i-heroicons-envelope"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Mật khẩu"
          name="password"
          class="mb-4"
        >
          <UInput
            v-model="state.password"
            type="password"
            placeholder="********"
            icon="i-heroicons-lock-closed"
            class="w-full"
          />
        </UFormField>

        <UButton
          type="submit"
          block
          :loading="isLoading"
        >
          Đăng nhập
        </UButton>
      </UForm>

      <div class="mt-4 text-center">
        <p class="text-sm text-gray-500">
          Chưa có tài khoản?
          <NuxtLink
            to="/register"
            class="text-primary font-medium"
          >Đăng ký ngay</NuxtLink>
        </p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
  layout: 'auth'
})

const { fetch } = useUserSession()
const toast = useToast()
const isLoading = ref(false)

// Định nghĩa schema validation bằng Zod
const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
})

type Schema = z.output<typeof schema>

const state = reactive({
  email: '',
  password: ''
})

// Hàm xử lý khi submit form
async function submit(event: FormSubmitEvent<Schema>) {
  isLoading.value = true
  try {
    await $fetch('/api/user/login', {
      method: 'POST',
      body: {
        email: event.data.email,
        password: event.data.password
      }
    })

    await fetch()

    toast.add({ title: 'Đăng nhập thành công!', color: 'success' })

    // Chuyển hướng về trang chủ sau khi đăng nhập thành công
    await navigateTo('/')
  } catch (error) {
    toast.add({
      title: 'Lỗi!',
      description: 'Email hoặc mật khẩu không đúng.',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}
</script>
