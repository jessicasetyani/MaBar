import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { env } from './config/env'

// Verify environment variables are accessible via type-safe module
console.log('Environment validation:', {
  appId: env.BACK4APP_APP_ID ? 'loaded' : 'missing',
  jsKey: env.BACK4APP_JAVASCRIPT_KEY ? 'loaded' : 'missing'
})

createApp(App).mount('#app')
