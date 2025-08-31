<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Time Selection -->
    <div v-if="!isEditMode && selectedSlots.length === 0" class="space-y-3">
      <label class="block text-sm font-medium text-slate-700"
        >Select Time</label
      >
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs text-slate-600 mb-1">Start Time</label>
          <input
            v-model="formData.startTime"
            type="datetime-local"
            class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
        </div>
        <div>
          <label class="block text-xs text-slate-600 mb-1">End Time</label>
          <input
            v-model="formData.endTime"
            type="datetime-local"
            class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
        </div>
      </div>
    </div>

    <!-- Enhanced Selected Slots Display -->
    <div
      v-else-if="selectedSlots.length > 0"
      class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200"
    >
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center space-x-2">
          <div
            class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"
          >
            <span class="text-blue-600 text-sm font-bold">{{
              selectedSlots.length
            }}</span>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-blue-800">
              Selected Time Slots
            </h4>
            <p class="text-xs text-blue-600">{{ getSlotsSummary() }}</p>
          </div>
        </div>
        <div class="flex space-x-2">
          <button
            v-if="selectedSlots.length > 1"
            type="button"
            @click="toggleBatchMode"
            :class="[
              'px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200',
              batchMode
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-blue-700 hover:bg-blue-100 border border-blue-200',
            ]"
          >
            <span class="flex items-center space-x-1">
              <svg
                class="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="
                    batchMode
                      ? 'M9 12l2 2 4-4'
                      : 'M4 6h16M4 10h16M4 14h16M4 18h16'
                  "
                />
              </svg>
              <span>{{ batchMode ? 'Batch Mode' : 'Individual' }}</span>
            </span>
          </button>
        </div>
      </div>

      <!-- Slots Grid -->
      <div class="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
        <div
          v-for="(slot, index) in selectedSlots"
          :key="slot.id"
          class="flex justify-between items-center text-sm bg-white rounded-lg p-3 border border-blue-100 hover:border-blue-200 transition-colors"
        >
          <div class="flex items-center space-x-3">
            <div
              class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600"
            >
              {{ index + 1 }}
            </div>
            <div>
              <div class="font-medium text-slate-800">
                {{ formatDateTime(slot.startTime) }} -
                {{ formatDateTime(slot.endTime) }}
              </div>
              <div class="text-xs text-slate-500">
                Duration: {{ getDuration(slot.startTime, slot.endTime) }}
              </div>
            </div>
          </div>
          <button
            type="button"
            @click="removeSlot(index)"
            class="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-md transition-colors"
            title="Remove slot"
          >
            <svg
              class="w-4 h-4"
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

      <!-- Batch Mode Info -->
      <div
        v-if="batchMode && selectedSlots.length > 1"
        class="mt-4 pt-3 border-t border-blue-200"
      >
        <div class="flex items-center space-x-2 text-xs text-blue-700">
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span
            >Batch mode: All {{ selectedSlots.length }} slots will use identical
            booking details</span
          >
        </div>
      </div>
    </div>

    <!-- Court Selection -->
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-2"
        >Paddle Field</label
      >
      <select
        v-model="formData.court"
        class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
        required
      >
        <option value="">Select a court</option>
        <option v-for="field in paddleFields" :key="field" :value="field">
          {{ field }}
        </option>
      </select>
    </div>

    <!-- Booking Type -->
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-2"
        >Booking Type</label
      >
      <div class="flex space-x-4">
        <label class="flex items-center">
          <input
            v-model="formData.type"
            type="radio"
            value="booking"
            class="mr-2 text-yellow-400 focus:ring-yellow-400"
          />
          <span class="text-sm">Regular Booking</span>
        </label>
        <label class="flex items-center">
          <input
            v-model="formData.type"
            type="radio"
            value="blocked"
            class="mr-2 text-red-500 focus:ring-red-400"
          />
          <span class="text-sm">Block Time Slot</span>
        </label>
      </div>
    </div>

    <!-- Booking Details (only for regular bookings) -->
    <div v-if="formData.type === 'booking'" class="space-y-4">
      <!-- Title -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1"
          >Booking Title</label
        >
        <input
          v-model="formData.title"
          type="text"
          placeholder="e.g., John vs Mike - Training Session"
          class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
          required
        />
      </div>

      <!-- Players -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1"
          >Players</label
        >
        <div class="space-y-2">
          <input
            v-for="(_, index) in formData.players"
            :key="index"
            v-model="formData.players[index]"
            type="text"
            :placeholder="`Player ${index + 1} name`"
            class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
        <button
          type="button"
          @click="addPlayer"
          class="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          + Add Player
        </button>
      </div>

      <!-- Contact Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >Contact Email</label
          >
          <input
            v-model="formData.contact"
            type="email"
            placeholder="contact@example.com"
            class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >Phone Number</label
          >
          <input
            v-model="formData.phone"
            type="tel"
            placeholder="+62 812-3456-7890"
            class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
        </div>
      </div>

      <!-- Price and Status -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >Price (IDR)</label
          >
          <input
            v-model.number="formData.price"
            type="number"
            min="0"
            placeholder="150000"
            class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >Status</label
          >
          <select
            v-model="formData.status"
            class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >Payment</label
          >
          <select
            v-model="formData.paymentStatus"
            class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Block Reason (only for blocked slots) -->
    <div v-if="formData.type === 'blocked'">
      <label class="block text-sm font-medium text-slate-700 mb-1"
        >Block Reason</label
      >
      <input
        v-model="formData.blockReason"
        type="text"
        placeholder="e.g., Maintenance, Private Event"
        class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
        required
      />
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end space-x-3 pt-4 border-t border-slate-200">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
      >
        Cancel
      </button>

      <button
        v-if="isEditMode"
        type="button"
        @click="handleDelete"
        class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
      >
        Delete
      </button>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="px-6 py-2.5 bg-yellow-400 text-slate-800 rounded-lg hover:bg-yellow-500 disabled:bg-slate-300 disabled:text-slate-500 transition-all duration-200 font-semibold flex items-center space-x-2"
      >
        <svg
          v-if="isSubmitting"
          class="animate-spin w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <span>
          {{ isSubmitting ? 'Creating...' : isEditMode ? 'Update' : 'Create' }}
          {{ formData.type === 'blocked' ? 'Block' : 'Booking' }}
          {{
            selectedSlots.length > 1 && batchMode
              ? ` (${selectedSlots.length})`
              : ''
          }}
        </span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

interface Props {
  selectedSlots: any[]
  paddleFields: string[]
  isEditMode: boolean
  editingBooking: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  create: [bookingData: any]
  update: [bookingId: string, bookingData: any]
  delete: [bookingId: string]
  cancel: []
  removeSlot: [index: number]
}>()

const formData = ref({
  type: 'booking',
  title: '',
  startTime: '',
  endTime: '',
  court: '',
  players: ['', '', '', ''],
  contact: '',
  phone: '',
  price: 150000,
  status: 'confirmed',
  paymentStatus: 'pending',
  blockReason: '',
})

const batchMode = ref(false)
const isSubmitting = ref(false)

const formatDateTime = (date: Date) => {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

const getDuration = (start: Date, end: Date) => {
  const diff = new Date(end).getTime() - new Date(start).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

const getSlotsSummary = () => {
  if (props.selectedSlots.length === 0) return ''
  if (props.selectedSlots.length === 1) return 'Single slot'

  const totalDuration = props.selectedSlots.reduce((total, slot) => {
    const diff = new Date(slot.end).getTime() - new Date(slot.start).getTime()
    return total + diff
  }, 0)

  const hours = Math.floor(totalDuration / (1000 * 60 * 60))
  const minutes = Math.floor((totalDuration % (1000 * 60 * 60)) / (1000 * 60))
  return `Total: ${hours}h ${minutes}m`
}

const addPlayer = () => {
  formData.value.players.push('')
}

const removeSlot = (index: number) => {
  emit('removeSlot', index)
}

const toggleBatchMode = () => {
  batchMode.value = !batchMode.value
}

const handleSubmit = async () => {
  const baseData = {
    court: formData.value.court,
    type: formData.value.type,
  }

  if (formData.value.type === 'blocked') {
    // Handle blocked slots
    if (props.selectedSlots.length > 1 && batchMode.value) {
      // Batch create blocked slots
      for (const slot of props.selectedSlots) {
        const blockData = {
          ...baseData,
          title: `🚫 ${formData.value.blockReason}`,
          reason: formData.value.blockReason,
          start: slot.start,
          end: slot.end,
        }
        await emit('create', blockData)
      }
    } else {
      // Single or individual blocked slots
      const blockData = {
        ...baseData,
        title: `🚫 ${formData.value.blockReason}`,
        reason: formData.value.blockReason,
        start:
          props.selectedSlots.length > 0
            ? props.selectedSlots[0].start
            : formData.value.startTime,
        end:
          props.selectedSlots.length > 0
            ? props.selectedSlots[props.selectedSlots.length - 1].end
            : formData.value.endTime,
      }

      if (props.isEditMode) {
        emit('update', props.editingBooking.id, blockData)
      } else {
        emit('create', blockData)
      }
    }
  } else {
    // Handle regular bookings
    if (props.selectedSlots.length > 1 && batchMode.value) {
      // Batch create bookings with sequential processing
      for (let i = 0; i < props.selectedSlots.length; i++) {
        const slot = props.selectedSlots[i]
        const bookingData = {
          ...baseData,
          title: `${formData.value.title} ${props.selectedSlots.length > 1 ? `(${i + 1}/${props.selectedSlots.length})` : ''}`,
          start: slot.start,
          end: slot.end,
          players: formData.value.players.filter((p) => p.trim()),
          contact: formData.value.contact,
          phone: formData.value.phone,
          price: formData.value.price,
          status: formData.value.status,
          paymentStatus: formData.value.paymentStatus,
        }
        await emit('create', bookingData)
      }
    } else {
      // Single or individual bookings
      const bookingData = {
        ...baseData,
        title: formData.value.title,
        start:
          props.selectedSlots.length > 0
            ? props.selectedSlots[0].start
            : formData.value.startTime,
        end:
          props.selectedSlots.length > 0
            ? props.selectedSlots[props.selectedSlots.length - 1].end
            : formData.value.endTime,
        players: formData.value.players.filter((p) => p.trim()),
        contact: formData.value.contact,
        phone: formData.value.phone,
        price: formData.value.price,
        status: formData.value.status,
        paymentStatus: formData.value.paymentStatus,
      }

      if (props.isEditMode) {
        emit('update', props.editingBooking.id, bookingData)
      } else {
        emit('create', bookingData)
      }
    }
  }
}

const handleDelete = () => {
  if (confirm('Are you sure you want to delete this booking?')) {
    emit('delete', props.editingBooking.id)
  }
}

// Initialize form data when editing
watch(
  () => props.editingBooking,
  (booking) => {
    if (booking && props.isEditMode) {
      formData.value = {
        type: booking.type === 'blocked' ? 'blocked' : 'booking',
        title: booking.title || '',
        startTime: booking.start
          ? new Date(booking.start).toISOString().slice(0, 16)
          : '',
        endTime: booking.end
          ? new Date(booking.end).toISOString().slice(0, 16)
          : '',
        court: booking.court || '',
        players: booking.players || ['', '', '', ''],
        contact: booking.contact || '',
        phone: booking.phone || '',
        price: booking.price || 150000,
        status: booking.status || 'confirmed',
        paymentStatus: booking.paymentStatus || 'pending',
        blockReason: booking.reason || '',
      }
    }
  },
  { immediate: true }
)

onMounted(() => {
  // Set default times if no slots selected
  if (props.selectedSlots.length === 0 && !props.isEditMode) {
    const now = new Date()
    now.setMinutes(0, 0, 0)
    const later = new Date(now)
    later.setHours(later.getHours() + 1)

    formData.value.startTime = now.toISOString().slice(0, 16)
    formData.value.endTime = later.toISOString().slice(0, 16)
  }
})
</script>
