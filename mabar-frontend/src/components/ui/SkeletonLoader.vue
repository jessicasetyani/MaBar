<template>
  <div class="animate-pulse" role="status" aria-label="Loading content">
    <!-- Card Skeleton -->
    <div v-if="type === 'card'" class="md-card p-6">
      <div class="skeleton h-6 w-3/4 mb-4 rounded"></div>
      <div class="skeleton h-4 w-full mb-2 rounded"></div>
      <div class="skeleton h-4 w-5/6 mb-4 rounded"></div>
      <div class="skeleton h-10 w-24 rounded"></div>
    </div>

    <!-- List Item Skeleton -->
    <div
      v-else-if="type === 'list-item'"
      class="flex items-center space-x-4 p-4"
    >
      <div class="skeleton h-12 w-12 rounded-full"></div>
      <div class="flex-1">
        <div class="skeleton h-4 w-3/4 mb-2 rounded"></div>
        <div class="skeleton h-3 w-1/2 rounded"></div>
      </div>
    </div>

    <!-- Text Skeleton -->
    <div v-else-if="type === 'text'" class="space-y-2">
      <div class="skeleton h-4 w-full rounded"></div>
      <div class="skeleton h-4 w-5/6 rounded"></div>
      <div class="skeleton h-4 w-4/5 rounded"></div>
    </div>

    <!-- Button Skeleton -->
    <div
      v-else-if="type === 'button'"
      class="skeleton h-10 w-24 rounded-lg"
    ></div>

    <!-- Custom Skeleton -->
    <div v-else :class="customClass" class="skeleton rounded"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'card' | 'list-item' | 'text' | 'button' | 'custom'
  customClass?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  customClass: 'h-4 w-full',
})
</script>
