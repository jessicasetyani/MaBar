<template>
  <div id="app">
    <!-- Show layout only when user has completed onboarding -->
    <AppLayout v-if="showLayout" />
    <!-- Show auth flow or onboarding when not completed -->
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import AppLayout from './components/AppLayout.vue'

const authStore = useAuthStore()
const themeStore = useThemeStore()

// Initialize theme on app startup
onMounted(() => {
  themeStore.initTheme()
})

// Show layout only when user is authenticated and has completed onboarding
const showLayout = computed(() => {
  return (
    authStore.isAuthenticated &&
    authStore.user?.role &&
    authStore.hasCompletedOnboarding
  )
})
</script>
