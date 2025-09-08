import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'

// Debug environment variables first
console.log('🔍 Raw environment variables:', {
  all: import.meta.env,
  appId: import.meta.env.VITE_BACK4APP_APP_ID,
  jsKey: import.meta.env.VITE_BACK4APP_JAVASCRIPT_KEY,
})

try {
  const { env } = await import('./config/env')
  console.log('✅ Environment validation passed:', {
    appId: env.BACK4APP_APP_ID ? 'loaded' : 'missing',
    jsKey: env.BACK4APP_JAVASCRIPT_KEY ? 'loaded' : 'missing',
  })
} catch (error) {
  console.error('❌ Environment validation failed:', error)
  // Continue without env validation for now
}

import './services/back4app'
import { useAuthStore } from './stores/auth'
import { router } from './router'
import { registerSW } from 'virtual:pwa-register'

// Initialize app asynchronously to handle session check
async function initializeApp() {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  // Initialize auth session and wait for it to complete
  const authStore = useAuthStore()
  await authStore.checkSession().catch(error => {
    console.warn('Failed to check session:', error)
  })



  // Register service worker only in production
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    registerSW({
      onNeedRefresh() {
        console.log('New content available, please refresh.')
      },
      onOfflineReady() {
        console.log('App ready to work offline.')
      },
    })
  }

  app.mount('#app')
}

// Start the app
initializeApp().catch(error => {
  console.error('Failed to initialize app:', error)
})
