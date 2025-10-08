export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    'nuxt-mongoose',
    'nuxt-auth-utils',
      '@vueuse/nuxt',
  ],

  devtools: {
    enabled: false
  },

  // mongoose: {
  //   uri: process.env.MONGODB_URI, // Chúng ta sẽ tạo file .env ngay sau đây
  //   options: {},
  //   modelsDir: 'models',
  // },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
