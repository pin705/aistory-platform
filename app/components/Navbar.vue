<script setup lang="ts">
const { loggedIn, clear, session } = useUserSession()

const items = [
  [
    {
      label: 'Đề xuất',
      // icon: 'i-heroicons-home-20-solid',
      to: '/'
    },
    {
      label: 'Sáng tác',
      // icon: 'i-heroicons-squares-2x2',
      to: !loggedIn.value ? '/dang-nhap' : '/dashboard'
    },
    {
      label: 'Khám phá',
      // icon: 'i-heroicons-compass-20-solid',
      to: '/kham-pha'
    },
    {
      label: 'Đăng nhập',
      icon: 'i-heroicons-arrow-right-on-rectangle',
      to: '/dang-nhap',
      class: loggedIn.value ? 'hidden' : ''
    },
    {
      label: '',
      icon: 'i-heroicons-user-20-solid',
      avatar: {
        src: session?.value?.user?.avatar
      },
      class: !loggedIn.value ? 'hidden' : '',
      children: [
        {
          label: 'Hồ sơ',
          icon: 'i-heroicons-user-circle-20-solid',
          to: '/profile'
        },
        {
          label: 'API Key',
          icon: 'i-heroicons-key',
          to: '/settings/keys'
        },
        {
          label: 'Đăng xuất',
          icon: 'i-heroicons-arrow-left-on-rectangle',
          to: '/dang-nhap'
        }
      ]
    }
  ]
]
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/">
        <AppLogo />
      </NuxtLink>

      <!-- <TemplateMenu /> -->
    </template>

    <template #right>
      <UNavigationMenu
        :items="items"
        variant="link"
        class="hidden lg:block"
      />

      <!-- <UButton
        label="Download App"
        variant="subtle"
        class="hidden lg:block"
      /> -->

      <UColorModeButton />
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />
      <!-- <UButton
        class="mt-4"
        label="Download App"
        variant="subtle"
        block
      /> -->
    </template>
  </UHeader>
</template>
