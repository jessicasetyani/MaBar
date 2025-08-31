<template>
  <div class="flex items-center justify-center" :class="containerClass">
    <div
      class="loading-spinner"
      :class="sizeClass"
      role="status"
      :aria-label="ariaLabel"
    ></div>
    <span v-if="showText" class="ml-2 md-body-large">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  showText?: boolean
  containerClass?: string
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  text: 'Loading...',
  showText: false,
  containerClass: '',
  ariaLabel: 'Loading content',
})

const sizeClass = computed(() => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-8 h-8 border-4',
  }
  return sizes[props.size]
})
</script>
