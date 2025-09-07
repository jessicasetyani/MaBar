<template>
  <div
    v-if="show"
    :class="alertClasses"
    class="md-card p-4 mb-4 transition-standard"
    role="alert"
    :aria-live="type === 'error' ? 'assertive' : 'polite'"
  >
    <div class="flex items-start gap-3">
      <div class="flex-shrink-0">
        <component :is="iconComponent" class="icon-md" />
      </div>
      <div class="flex-1">
        <h4 v-if="title" class="md-label-large font-medium mb-1">
          {{ title }}
        </h4>
        <p class="md-body-large">{{ message }}</p>
      </div>
      <button
        v-if="dismissible"
        @click="$emit('dismiss')"
        class="flex-shrink-0 p-1 hover:bg-black/10 rounded transition-standard focus-visible"
        aria-label="Dismiss alert"
      >
        <svg class="icon-sm" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  show?: boolean
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: true,
  dismissible: true,
})

defineEmits<{
  dismiss: []
}>()

const alertClasses = computed(() => {
  const classes = {
    success: 'feedback-success',
    error: 'feedback-error',
    warning: 'feedback-warning',
    info: 'feedback-info',
  }
  return classes[props.type]
})

const iconComponent = computed(() => {
  const icons = {
    success: 'CheckCircleIcon',
    error: 'XCircleIcon',
    warning: 'ExclamationTriangleIcon',
    info: 'InformationCircleIcon',
  }
  return icons[props.type]
})
</script>
