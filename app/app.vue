<script setup>
// (CẬP NHẬT) Đặt tên và mô tả mới theo thương hiệu "Bút Thần Giới"
const title = 'Bút Thần Giới - Nền tảng Sáng tác truyện với Trợ lý AI'
const description
  = 'Bước vào Bút Thần Giới, nơi ngòi bút của bạn kết hợp với sức mạnh của AI để tạo nên những thế giới kỳ vĩ và những câu chuyện bất hủ. Xây dựng nhân vật, phát triển cốt truyện, và sáng tác tiểu thuyết của riêng bạn một cách dễ dàng và đầy cảm hứng.'

useHead({
  // (CẬP NHẬT) Cập nhật title template với tên mới
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} | Bút Thần Giới` : title
  },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    // (CẬP NHẬT) Thêm các thẻ meta tốt cho SEO
    { name: 'author', content: 'Bút Thần Giới' },
    { name: 'copyright', content: `Bút Thần Giới © ${new Date().getFullYear()}` }
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
  keywords: 'Bút Thần Giới, sáng tác truyện, viết truyện, trợ lý AI, AI viết truyện, sáng tác tiểu thuyết, công cụ viết lách, xây dựng thế giới, phát triển nhân vật, cốt truyện, Gemini, ChatGPT',

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
    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>
  </UApp>
</template>
