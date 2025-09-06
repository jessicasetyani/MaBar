import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
VitePWA({
      disable: process.env.NODE_ENV === 'development',
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/parseapi\.back4app\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'back4app-api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          }
        ]
      },
      manifest: {
        name: 'MaBar - Smart Padel Matchmaking',
        short_name: 'MaBar',
        description: 'Smart matchmaking platform for Padel players in Jakarta',
        theme_color: '#FDE047',
        background_color: '#FEFCE8',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      events: 'events',
    },
  },
  optimizeDeps: {
    include: ['parse', '@mabar/ai-services'],
  },
  envDir: '../', // Look for .env files in the parent directory
  server: {
    host: true,
    port: 5173,
    hmr: {
      port: 5173,
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
})
