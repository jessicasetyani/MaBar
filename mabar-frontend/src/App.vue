<template>
  <div id="app">
    <!-- Show layout only when user has completed onboarding -->
    <AppLayout v-if="showLayout" />
    <!-- Show auth flow or onboarding when not completed -->
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from './stores/auth'
import AppLayout from './components/AppLayout.vue'

const authStore = useAuthStore()

// Show layout only when user is authenticated and has completed onboarding
const showLayout = computed(() => {
  return (
    authStore.isAuthenticated &&
    authStore.user?.role &&
    authStore.hasCompletedOnboarding
  )
})
</script>
