// file: app.config.ts

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      neutral: 'zinc'
    },
    modal: {
      slots: {
        content: 'sm:max-w-3xl',
        footer: 'justify-end'
      }
    },
  }
})
