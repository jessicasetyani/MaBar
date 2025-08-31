<template>
  <div
    class="calendar-error-container bg-white rounded-lg border border-red-200 p-8"
  >
    <div class="text-center">
      <!-- Error Icon -->
      <div
        class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4"
      >
        <svg
          class="h-8 w-8 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>

      <!-- Error Message -->
      <h3 class="text-lg font-semibold text-slate-900 mb-2">
        {{ title || 'Failed to Load Calendar' }}
      </h3>
      <p class="text-slate-600 mb-6 max-w-md mx-auto">
        {{
          message ||
          'We encountered an issue loading your booking data. Please check your connection and try again.'
        }}
      </p>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          @click="$emit('retry')"
          :disabled="retrying"
          class="inline-flex items-center px-4 py-2 bg-yellow-400 text-slate-800 rounded-lg hover:bg-yellow-500 disabled:bg-slate-200 disabled:text-slate-400 font-medium transition-colors"
        >
          <svg
            v-if="retrying"
            class="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <svg
            v-else
            class="mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {{ retrying ? 'Retrying...' : 'Try Again' }}
        </button>

        <button
          @click="$emit('showOffline')"
          class="inline-flex items-center px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg font-medium transition-colors"
        >
          <svg
            class="mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          View Offline Mode
        </button>
      </div>

      <!-- Technical Details (collapsible) -->
      <div
        v-if="error && showDetails"
        class="mt-6 p-4 bg-red-50 rounded-lg text-left"
      >
        <h4 class="text-sm font-medium text-red-800 mb-2">
          Technical Details:
        </h4>
        <pre class="text-xs text-red-700 whitespace-pre-wrap">{{ error }}</pre>
      </div>

      <button
        v-if="error"
        @click="showDetails = !showDetails"
        class="mt-4 text-sm text-slate-500 hover:text-slate-700 underline"
      >
        {{ showDetails ? 'Hide' : 'Show' }} Technical Details
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title?: string
  message?: string
  error?: string
  retrying?: boolean
}

defineProps<Props>()
defineEmits<{
  retry: []
  showOffline: []
}>()

const showDetails = ref(false)
</script>

<style scoped>
.calendar-error-container {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
