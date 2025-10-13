// file: app.config.ts

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      neutral: 'zinc'
    },
    modal: {
      slots: {
        content: 'sm:max-w-xl md:max-w-2xl lg:max-w-3xl',
        footer: 'justify-end'
      }
    },
  }
})
