<!-- <template>
  <UHeader>
    <template #left>
      <UColorModeButton />

      <NuxtLink
        to="/"
        class="text-xl font-bold"
      >AI Story Platform</NuxtLink>
    </template>

    <template #right>
      <div v-if="loggedIn">
        <UDropdownMenu :items="userMenuItems">
          <UButton
            color="white"
            trailing-icon="i-heroicons-chevron-down-20-solid"
          >
            <UAvatar
              :alt="session?.user?.name || 'User'"
              size="sm"
            />
            <span class="ml-2">{{ session?.user?.name }}</span>
          </UButton>
        </UDropdownMenu>
      </div>
      <div v-else>
        <UButton to="/login">
          Đăng nhập
        </UButton>
      </div>
    </template>
  </UHeader>
</template>

<script setup lang="ts">
const { loggedIn, clear, session } = useUserSession()

const userMenuItems = [
  [
    {
      label: 'Sáng tác',
      icon: 'i-heroicons-squares-2x2',
      to: '/author/dashboard'
    },
    {
      label: 'Cài đặt API Key',
      icon: 'i-heroicons-key',
      to: '/settings/keys'
    }
  ],
  [
    {
      label: 'Đăng xuất',
      icon: 'i-heroicons-arrow-left-on-rectangle',
      click: () => clear()
    }
  ]
]
</script> -->

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'


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
      to: '/author/dashboard'
    },
    {
      label: 'Cài đặt API Key',
      icon: 'i-heroicons-key',
      to: '/settings/keys'
    }
  ],
  [
    {
      label: 'Đăng xuất',
      icon: 'i-heroicons-arrow-left-on-rectangle',
      click: () => clear()
    }
  ]
]
</script>

<template>
  <div class="fixed top-2 sm:top-4 mx-auto left-1/2 transform -translate-x-1/2 z-10">
    <UNavigationMenu
      :items="userMenuItems"
      variant="link"
      color="neutral"
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
