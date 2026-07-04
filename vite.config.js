import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'legacy',
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    environmentOptions: {
      jsdom: {
        url: 'http://localhost/',
      },
    },
  },
})
