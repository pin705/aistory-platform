<script setup>
const isLoading = useState('isLoading', () => false)

// 2. Lấy context của ứng dụng Nuxt.
const nuxtApp = useNuxtApp()

// 3. Lắng nghe các sự kiện (hook) chuyển trang.
nuxtApp.hook('page:start', () => {
  isLoading.value = true
})
nuxtApp.hook('page:finish', () => {
  isLoading.value = false
})

// (CẬP NHẬT) Đặt tên và mô tả mới theo thương hiệu "Sáng tác truyện"
const title = 'Sáng tác truyện - Nền tảng Sáng tác truyện với Trợ lý AI'
const description
  = 'Bước vào Sáng tác truyện, nơi ngòi bút của bạn kết hợp với sức mạnh của AI để tạo nên những thế giới kỳ vĩ và những câu chuyện bất hủ. Xây dựng nhân vật, phát triển cốt truyện, và sáng tác tiểu thuyết của riêng bạn một cách dễ dàng và đầy cảm hứng.'

useHead({
  // (CẬP NHẬT) Cập nhật title template với tên mới
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} | Sáng tác truyện` : title
  },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    // (CẬP NHẬT) Thêm các thẻ meta tốt cho SEO
    { name: 'author', content: 'Sáng tác truyện' },
    { name: 'copyright', content: `Sáng tác truyện © ${new Date().getFullYear()}` }
  ],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  htmlAttrs: {
    lang: 'vi'
  }
})

useSeoMeta({
  title,
  description,
  // (CẬP NHẬT) Thêm tên thương hiệu vào keywords
  keywords: 'Sáng tác truyện, sáng tác truyện, viết truyện, trợ lý AI, AI viết truyện, sáng tác tiểu thuyết, công cụ viết lách, xây dựng thế giới, phát triển nhân vật, cốt truyện, Gemini, ChatGPT',

  // Open Graph (Facebook, Zalo...)
  ogTitle: title,
  ogDescription: description,
  ogImage: '/og-image.png', // Nhớ tạo ảnh đại diện thương hiệu
  ogType: 'website',
  ogLocale: 'vi_VN',

  // Twitter Card (Twitter/X)
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: '/og-image.png'
})
</script>

<template>
  <UApp>
    <AppLoading />
    <!-- <NuxtLoadingIndicator /> -->
    <Navbar />
    <UMain>
      <VitePwaManifest />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>
  </UApp>
</template>
