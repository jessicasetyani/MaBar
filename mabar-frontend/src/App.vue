<template>
  <div id="app">
    <!-- Show layout only when user is authenticated and has a role -->
    <AppLayout v-if="showLayout" />
    <!-- Show auth flow when not authenticated or no role -->
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from './stores/auth'
import AppLayout from './components/AppLayout.vue'

const authStore = useAuthStore()

// Show layout when user is authenticated and has a role
const showLayout = computed(() => {
  return authStore.isAuthenticated && authStore.user?.role
})
</script>
