import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { env } from './config/env'
import './services/back4app'
import { testBack4AppConnection } from './utils/testConnection'

// Verify environment variables are accessible via type-safe module
console.log('Environment validation:', {
  appId: env.BACK4APP_APP_ID ? 'loaded' : 'missing',
  jsKey: env.BACK4APP_JAVASCRIPT_KEY ? 'loaded' : 'missing'
})

// Test Back4App connection on startup
testBack4AppConnection().then(result => {
  if (result.success) {
    console.log('✅ Back4App:', result.message)
  } else {
    console.warn('⚠️ Back4App:', result.message)
  }
}).catch(error => {
  console.error('❌ Back4App connection test failed:', error)
})

createApp(App).mount('#app')
