import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      events: 'events'
    }
  },
  optimizeDeps: {
    include: ['parse']
  },
  envDir: '../', // Look for .env files in the parent directory
})
