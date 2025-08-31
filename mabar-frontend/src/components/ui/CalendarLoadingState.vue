<template>
  <div class="calendar-loading-container">
    <!-- Calendar Header Skeleton -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-4">
        <div class="flex space-x-2">
          <div class="h-8 w-16 bg-slate-200 rounded animate-pulse"></div>
          <div class="h-8 w-16 bg-slate-200 rounded animate-pulse"></div>
          <div class="h-8 w-20 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <div class="h-8 w-32 bg-slate-200 rounded animate-pulse"></div>
        <div class="flex space-x-2">
          <div class="h-8 w-24 bg-slate-200 rounded animate-pulse"></div>
          <div class="h-8 w-20 bg-slate-200 rounded animate-pulse"></div>
          <div class="h-8 w-16 bg-slate-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>

    <!-- Calendar Grid Skeleton -->
    <div class="bg-white rounded-lg border border-slate-200 p-4">
      <!-- Day Headers -->
      <div class="grid grid-cols-8 gap-px mb-2">
        <div class="h-8 bg-slate-100 rounded"></div>
        <div v-for="day in 7" :key="day" class="h-8 bg-slate-100 rounded"></div>
      </div>

      <!-- Time Slots -->
      <div class="space-y-px">
        <div v-for="hour in 16" :key="hour" class="grid grid-cols-8 gap-px">
          <div
            class="h-12 bg-slate-50 rounded flex items-center justify-center"
          >
            <div class="h-3 w-12 bg-slate-200 rounded animate-pulse"></div>
          </div>
          <div
            v-for="day in 7"
            :key="day"
            class="h-12 bg-slate-50 rounded relative"
          >
            <!-- Random booking skeletons -->
            <div
              v-if="Math.random() > 0.7"
              class="absolute inset-1 bg-slate-200 rounded animate-pulse"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Message -->
    <div class="text-center mt-4">
      <div class="inline-flex items-center space-x-2 text-slate-600">
        <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
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
        <span class="text-sm">Loading calendar data...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props needed for this loading state
</script>

<style scoped>
.calendar-loading-container {
  min-height: 600px;
}
</style>
