<template>
  <UHeader>
    <!-- <template #title>
        <Logo class="h-6 w-auto" />
      </template> -->

    <template #left>
      <UColorModeButton />

      <NuxtLink to="/" class="text-xl font-bold">AI Story Platform</NuxtLink>
    </template>

    <template #right>
      <div v-if="loggedIn">
        <UDropdownMenu :items="userMenuItems">
          <UButton
            color="white"
            trailing-icon="i-heroicons-chevron-down-20-solid"
          >
            <UAvatar :alt="session?.user?.name || 'User'" size="sm" />
            <span class="ml-2">{{ session?.user?.name }}</span>
          </UButton>
        </UDropdownMenu>
      </div>
      <div v-else>
        <UButton to="/login">Đăng nhập</UButton>
      </div>
    </template>
  </UHeader>
</template>

<script setup lang="ts">
const { loggedIn, clear, session } = useUserSession();

// Menu cho người dùng đã đăng nhập
const userMenuItems = [
  [
    {
      label: "Bảng điều khiển",
      icon: "i-heroicons-squares-2x2",
      to: "/author/dashboard",
    },
    {
      label: "Cài đặt API Key",
      icon: "i-heroicons-key",
      to: "/settings/keys",
    },
  ],
  [
    {
      label: "Đăng xuất",
      icon: "i-heroicons-arrow-left-on-rectangle",
      click: () => clear(), // Gọi hàm clear session để đăng xuất
    },
  ],
];
</script>
