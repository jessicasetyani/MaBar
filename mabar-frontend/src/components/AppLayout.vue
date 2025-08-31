<template>
  <div class="min-h-screen bg-background">
    <AppHeader />
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view />
    </main>
    <FloatingActionButton aria-label="Quick action" @click="handleFabClick" />
  </div>
</template>

<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import { FloatingActionButton } from './ui'

const handleFabClick = () => {
  // TODO: Implement FAB action based on current route/context
  console.log('FAB clicked')
}
</script>
