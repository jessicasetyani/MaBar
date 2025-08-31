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
import { testBack4AppConnection } from './utils/testConnection'
import { useAuthStore } from './stores/auth'
import { router } from './router'
import { registerSW } from 'virtual:pwa-register'

// Test Back4App connection on startup
testBack4AppConnection()
  .then((result) => {
    if (result.success) {
      console.log('✅ Back4App:', result.message)
    } else {
      console.warn('⚠️ Back4App:', result.message)
    }
  })
  .catch((error) => {
    console.error('❌ Back4App connection test failed:', error)
  })

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize auth session
const authStore = useAuthStore()
authStore.checkSession()

// Test auth flow in development
if (import.meta.env.DEV) {
  import('./utils/authTest').then(({ testAuthFlow }) => {
    testAuthFlow().then((result) => {
      console.log('🧪 Auth Test Result:', result)
    })
  })
}

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
