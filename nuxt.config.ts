export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    'nuxt-mongoose',
    'nuxt-auth-utils',
    '@vueuse/nuxt',
    '@vite-pwa/nuxt'
  ],

  devtools: {
    enabled: false
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      // Thay thế bằng URL của website bạn khi deploy
      baseURL: process.env.BASE_URL || 'http://localhost:3000'
    },
    session: {
      password: 'password-with-at-least-32-characters',
      cookie: {
        secure: false, // Chỉ dùng secure cookie trong production (HTTPS)
        sameSite: 'none' // Hoặc 'none' nếu cần truy cập cross-site
      }
    }
  },
  routeRules: {
    '/': { prerender: true },
    '/dashboard/**': { ssr: false },
    '/author/**': { ssr: false }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  mongoose: {
    uri: process.env.MONGODB_URI, // Chúng ta sẽ tạo file .env ngay sau đây
    // options: {},
    modelsDir: 'models'
  },

  pwa: {
    // registerType: 'prompt',
    manifest: {
      name: 'Mực thần ký',
      short_name: 'Mực thần ký',
      theme_color: '#1e1e1e',
      icons: [
        {
          src: 'favicon_io/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'favicon_io/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: 'favicon_io/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    },
    injectRegister: 'auto', // Đảm bảo đăng ký SW đúng cách
    workbox: {
      cleanupOutdatedCaches: true // Xoá cache cũ khi có cache mới
    }
  }
})
