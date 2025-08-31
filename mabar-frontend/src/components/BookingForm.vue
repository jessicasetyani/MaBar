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

    <!-- Selected Slots Display -->
    <div v-else-if="selectedSlots.length > 0" class="bg-blue-50 rounded-lg p-3">
      <h4 class="text-sm font-medium text-blue-800 mb-2">
        Selected Time Slots
      </h4>
      <div class="space-y-1">
        <div
          v-for="slot in selectedSlots"
          :key="slot.id"
          class="text-sm text-blue-700"
        >
          {{ formatDateTime(slot.startTime) }} -
          {{ formatDateTime(slot.endTime) }}
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
        class="px-6 py-2 bg-yellow-400 text-slate-800 rounded-md hover:bg-yellow-500 transition-colors font-medium"
      >
        {{ isEditMode ? 'Update' : 'Create' }}
        {{ formData.type === 'blocked' ? 'Block' : 'Booking' }}
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

const formatDateTime = (date: Date) => {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

const addPlayer = () => {
  formData.value.players.push('')
}

const handleSubmit = () => {
  const baseData = {
    court: formData.value.court,
    type: formData.value.type,
  }

  if (formData.value.type === 'blocked') {
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
  } else {
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
