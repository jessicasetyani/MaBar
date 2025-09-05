<template>
  <div class="fixed bottom-6 right-6 z-[9999]">
    <div class="relative">
      <!-- Removed contextual menu for direct booking experience -->

      <!-- Main FAB Button -->
      <button
        @click="handleDirectBooking"
        :class="[
          'fab-button bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-400',
          'hover:from-yellow-500 hover:via-yellow-600 hover:to-orange-500',
          'text-slate-800 rounded-full shadow-2xl hover:shadow-3xl',
          'transform hover:scale-110 active:scale-95',
          'transition-all duration-300 ease-out',
          'flex items-center justify-center group relative overflow-hidden',
          'w-14 h-14'
        ]"
        :title="'Create New Booking'"
        :aria-label="'Create new booking'"
      >
        <!-- Animated background gradient -->
        <div
          class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        ></div>

        <!-- Plus icon with enhanced animation -->
        <svg
          class="w-7 h-7 transition-all duration-300 relative z-10 group-hover:rotate-180 group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          stroke-width="3"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>

        <!-- Ripple effect -->
        <div
          class="absolute inset-0 rounded-full bg-white/30 scale-0 group-active:scale-100 transition-transform duration-200"
        ></div>
      </button>

      <!-- Tooltip -->
      <div
        class="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none"
      >
        Create New Booking
        <div
          class="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No imports needed for this simplified version

interface Props {
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  quickBooking: []
  multipleSlots: []
}>()

// Direct booking handler - opens modal immediately on FAB click
const handleDirectBooking = () => {
  emit('quickBooking')
}
</script>

<style scoped>
.fab-button {
  width: 3.5rem;
  height: 3.5rem;
}

/* Enhanced accessibility for FAB */
.fab-button:focus {
  outline: none;
  box-shadow:
    0 15px 40px rgba(253, 224, 71, 0.6),
    0 8px 20px rgba(0, 0, 0, 0.2),
    0 0 0 3px rgba(59, 130, 246, 0.5) !important;
}

.fab-button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .fab-button {
    width: 3rem;
    height: 3rem;
  }
  .fab-button svg {
    width: 1.5rem;
    height: 1.5rem;
  }
}

@media (max-width: 480px) {
  .fixed.bottom-6.right-6 {
    bottom: 1rem !important;
    right: 1rem !important;
  }
}

@media (max-width: 319px) {
  .fixed.bottom-6.right-6 {
    bottom: 0.75rem !important;
    right: 0.75rem !important;
  }
  .fab-button {
    width: 2.5rem;
    height: 2.5rem;
  }
  .fab-button svg {
    width: 1rem;
    height: 1rem;
  }
}

/* Safe area support for devices with notches */
@supports (padding: max(0px)) {
  .fixed.bottom-6.right-6 {
    bottom: max(1.5rem, env(safe-area-inset-bottom) + 1rem) !important;
    right: max(1.5rem, env(safe-area-inset-right) + 1rem) !important;
  }
}
</style>
