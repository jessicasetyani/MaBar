<script setup lang="ts">
import AuthFlow from './components/AuthFlow.vue'
</script>

<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" v-if="Component" />
    <AuthFlow v-else />
  </router-view>
</template>