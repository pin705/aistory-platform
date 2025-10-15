<script setup lang="ts">
const { loggedIn, clear, session } = useUserSession()

const userMenuItems = [
  [
    {
      label: 'Đề xuất',
      icon: 'i-heroicons-home-20-solid',
      to: '/'
    },
    {
      label: 'Sáng tác',
      icon: 'i-heroicons-squares-2x2',
      to: '/dashboard',
      disable: !loggedIn.value
    },
    {
      label: 'Đăng nhập',
      icon: 'i-heroicons-arrow-right-on-rectangle',
      to: '/login',
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
          to: '/login'
        }
      ]
    }
  ]

]
</script>

<template>
  <div class="fixed top-2 sm:top-4 mx-auto left-1/2 transform -translate-x-1/2 z-10">
    <UNavigationMenu
      :items="userMenuItems"
      variant="link"
      class="bg-muted/80 backdrop-blur-sm rounded-full px-2 sm:px-4 border border-muted/50 shadow-lg shadow-neutral-950/5"
      :ui="{
        link: 'px-2 py-1',
        linkLeadingIcon: 'hidden'
      }"
    >
      <template #list-trailing>
        <UColorModeButton />
      </template>
    </UNavigationMenu>
  </div>
</template>
