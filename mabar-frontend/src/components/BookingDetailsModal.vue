<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      @click="$emit('close')"
    >
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full" @click.stop>
        <!-- Header -->
        <div class="p-6 border-b border-slate-200">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-semibold text-slate-900">
                {{ booking.title }}
              </h3>
              <p class="text-sm text-slate-600 mt-1">
                {{ formatDate(booking.start) }}
              </p>
            </div>
            <button
              @click="$emit('close')"
              class="text-slate-400 hover:text-slate-600"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 space-y-4">
          <!-- Time & Court -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                class="text-xs font-medium text-slate-500 uppercase tracking-wide"
                >Time</label
              >
              <p class="text-sm font-medium text-slate-900">
                {{ formatTime(booking.start) }} - {{ formatTime(booking.end) }}
              </p>
            </div>
            <div>
              <label
                class="text-xs font-medium text-slate-500 uppercase tracking-wide"
                >Court</label
              >
              <p class="text-sm font-medium text-slate-900">
                {{ booking.extendedProps?.court }}
              </p>
            </div>
          </div>

          <!-- Players -->
          <div v-if="booking.extendedProps?.players?.length">
            <label
              class="text-xs font-medium text-slate-500 uppercase tracking-wide"
              >Players</label
            >
            <div class="mt-2 space-y-2">
              <div
                v-for="(player, index) in booking.extendedProps.players"
                :key="index"
                class="flex items-center space-x-2"
              >
                <div
                  class="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-xs font-medium text-yellow-800"
                >
                  {{ index + 1 }}
                </div>
                <span class="text-sm text-slate-900">{{ player }}</span>
              </div>
            </div>
          </div>

          <!-- Contact Info -->
          <div class="grid grid-cols-1 gap-3">
            <div v-if="booking.extendedProps?.contact">
              <label
                class="text-xs font-medium text-slate-500 uppercase tracking-wide"
                >Venue Contact</label
              >
              <p class="text-sm text-slate-900">
                {{ booking.extendedProps.contact }}
              </p>
            </div>
            <!-- Note: Venue phone contact removed - only player phone numbers are used -->
          </div>

          <!-- Status & Payment -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                class="text-xs font-medium text-slate-500 uppercase tracking-wide"
                >Status</label
              >
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1',
                  booking.extendedProps?.status === 'confirmed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800',
                ]"
              >
                {{ booking.extendedProps?.status || 'pending' }}
              </span>
            </div>
            <div v-if="booking.extendedProps?.price">
              <label
                class="text-xs font-medium text-slate-500 uppercase tracking-wide"
                >Price</label
              >
              <p class="text-sm font-medium text-slate-900">
                Rp {{ formatPrice(booking.extendedProps.price) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="p-6 border-t border-slate-200 flex space-x-3">
          <button
            @click="$emit('edit')"
            class="flex-1 px-4 py-2 bg-yellow-400 text-slate-800 rounded-lg hover:bg-yellow-500 font-medium transition-colors"
          >
            Edit Booking
          </button>
          <button
            @click="$emit('delete')"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  booking: {
    id: string
    title: string
    start: Date
    end: Date
    extendedProps?: {
      type: string
      status?: string
      court?: string
      players?: string[]
      contact?: string
      // Note: Venue phone contact removed - only player phone numbers are used
      price?: number
      paymentStatus?: string
    }
  }
}

defineProps<Props>()
defineEmits<{
  close: []
  edit: []
  delete: []
}>()

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID').format(price)
}
</script>
