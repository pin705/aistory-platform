<script setup>
// (THAY ĐỔI) Đặt các biến title và description ở đây để dễ quản lý
const title = "LoreWeaver AI - Trợ lý Sáng tác truyện bằng AI";
const description =
  "Sử dụng sức mạnh của AI (Gemini, ChatGPT) để xây dựng thế giới, phát triển nhân vật và viết nên những chương truyện hấp dẫn. LoreWeaver AI là người bạn đồng hành sáng tạo, giúp bạn biến ý tưởng thành tiểu thuyết hoàn chỉnh.";

useHead({
  // (THAY ĐỔI) Đặt title template để các trang con có tiêu đề đẹp hơn
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} | LoreWeaver AI` : title;
  },
  meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
  link: [{ rel: "icon", href: "/favicon.ico" }],
  htmlAttrs: {
    // (QUAN TRỌNG) Chuyển ngôn ngữ chính sang Tiếng Việt
    lang: "vi",
  },
});

useSeoMeta({
  // title và description sẽ được lấy từ biến đã khai báo ở trên
  title,
  description,
  // (MỚI) Thêm keywords để hỗ trợ SEO
  keywords: 'viết truyện, sáng tác, tiểu thuyết, AI, trợ lý AI, viết truyện AI, Gemini, Lorebook, phát triển nhân vật, cốt truyện',

  // Open Graph (dùng khi chia sẻ trên Facebook, Zalo...)
  ogTitle: title,
  ogDescription: description,
  // (QUAN TRỌNG) Thay thế bằng ảnh đại diện của nền tảng bạn
  ogImage: "/og-image.png", // Tạo một ảnh kích thước 1200x630px và đặt vào thư mục /public
  ogType: 'website',
  ogLocale: 'vi_VN',

  // Twitter Card (dùng khi chia sẻ trên Twitter/X)
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: description,
  // (QUAN TRỌNG) Thay thế bằng ảnh đại diện của nền tảng bạn
  twitterImage: "/og-image.png",
});
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
