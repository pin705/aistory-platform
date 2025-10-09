<template>
  <div class="flex items-center justify-center min-h-screen">
    <UCard class="w-full max-w-sm">
      <template #header>
        <h1 class="text-2xl font-bold text-center">Tạo tài khoản</h1>
      </template>

      <UForm :state="state" :schema="schema" @submit="submit">
        <UFormField label="Tên người dùng" name="username" class="mb-4">
          <UInput v-model="state.username" placeholder="Dùng để hiển thị" icon="i-heroicons-user" class="w-full" />
        </UFormField>

        <UFormField label="Email" name="email" class="mb-4">
          <UInput v-model="state.email" placeholder="you@example.com" class="w-full" icon="i-heroicons-envelope"  />
        </UFormField>

        <UFormField label="Mật khẩu" name="password" class="mb-4">
          <UInput v-model="state.password" type="password" placeholder="********" icon="i-heroicons-lock-closed" class="w-full" />
        </UFormField>

        <UFormField label="Xác nhận mật khẩu" name="passwordConfirm" class="mb-4">
          <UInput v-model="state.passwordConfirm" type="password" placeholder="********" class="w-full" icon="i-heroicons-lock-closed" />
        </UFormField>

        <UButton type="submit" block :loading="isLoading">
          Đăng ký
        </UButton>
      </UForm>

      <div class="mt-4 text-center">
        <p class="text-sm text-gray-500">
          Đã có tài khoản?
          <NuxtLink to="/login" class="text-primary font-medium">Đăng nhập</NuxtLink>
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

const toast = useToast()
const isLoading = ref(false)

const schema = z.object({
  username: z.string().min(3, 'Tên người dùng phải có ít nhất 3 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  passwordConfirm: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
}).refine(data => data.password === data.passwordConfirm, {
  message: 'Mật khẩu không khớp',
  path: ['passwordConfirm'], // Hiển thị lỗi ở trường xác nhận mật khẩu
})

type Schema = z.output<typeof schema>

const state = reactive({
  username: '',
  email: '',
  password: '',
  passwordConfirm: '',
})

async function submit(event: FormSubmitEvent<Schema>) {
  isLoading.value = true
  try {
    await $fetch('/api/user/register', {
      method: 'POST',
      body: {
        username: event.data.username,
        email: event.data.email,
        password: event.data.password,
      },
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
