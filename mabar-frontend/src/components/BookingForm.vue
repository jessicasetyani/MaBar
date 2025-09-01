<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- 24-Hour Booking Time Selection -->
    <div v-if="!isEditMode && selectedSlots.length === 0" class="space-y-3">
      <div
        class="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200"
      >
        <div class="flex items-center space-x-2 mb-3">
          <div
            class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center"
          >
            <svg
              class="w-4 h-4 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-yellow-800">
              24-Hour Booking
            </h4>
            <p class="text-xs text-yellow-600">
              Fixed 24-hour duration from selected start time
            </p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2"
            >Start Time</label
          >
          <input
            v-model="formData.startTime"
            type="datetime-local"
            class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
            @change="updateEndTime"
          />
        </div>

        <div
          v-if="formData.startTime"
          class="mt-3 p-3 bg-white rounded-md border border-yellow-200"
        >
          <div class="text-sm text-slate-600">
            <strong>Booking Duration:</strong> 24 hours
          </div>
          <div class="text-sm text-slate-600">
            <strong>End Time:</strong> {{ formatEndTime() }}
          </div>
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

    <!-- Booking Details -->
    <div class="space-y-4">
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

      <!-- Players with Individual Phones (minimum 1, maximum 4) -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">
          Players with Phone Numbers (minimum 1, maximum 4)
          <span class="text-xs text-slate-500 ml-1"
            >{{ getValidPlayerCount() }}/4 players</span
          >
        </label>

        <div class="space-y-3">
          <div
            v-for="(player, index) in formData.players"
            :key="index"
            class="flex items-center space-x-2"
          >
            <div
              class="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-medium text-slate-600"
            >
              {{ index + 1 }}
            </div>
            <div class="flex-1 grid grid-cols-2 gap-2">
              <input
                v-model="formData.players[index]"
                type="text"
                :placeholder="
                  index === 0
                    ? 'Main player name (required)'
                    : `Player ${index + 1} name`
                "
                :required="index === 0"
                :class="[
                  'px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors',
                  getPlayerValidationClass(player, index),
                ]"
                @blur="validatePlayerName(index)"
              />
              <input
                v-model="formData.playerPhones[index]"
                type="tel"
                :placeholder="
                  index === 0 ? 'Phone (required)' : `Player ${index + 1} phone`
                "
                :required="
                  index === 0 ||
                  !!(formData.players[index] && formData.players[index].trim())
                "
                class="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <button
              v-if="formData.players.length > 1 && index > 0"
              type="button"
              @click="removePlayer(index)"
              class="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
              title="Remove player"
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

        <!-- Player validation feedback -->
        <div
          v-if="playerValidationError"
          class="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-md"
        >
          {{ playerValidationError }}
        </div>

        <div class="mt-3 flex justify-between items-center">
          <button
            v-if="formData.players.length < 4"
            type="button"
            @click="addPlayer"
            class="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Add Player ({{ getValidPlayerCount() }}/4)
          </button>
          <div class="text-xs text-slate-500">
            {{
              getValidPlayerCount() === 1
                ? 'Singles match'
                : getValidPlayerCount() === 2
                  ? 'Doubles match'
                  : `${getValidPlayerCount()} players`
            }}
          </div>
        </div>
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
          24-Hour Booking
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
import { ValidationUtils } from '../utils/validation'

interface Props {
  selectedSlots: Array<{
    id: string
    start: string
    end: string
    startTime: Date
    endTime: Date
  }>
  paddleFields: string[]
  isEditMode: boolean
  editingBooking: {
    id: string
    title: string
    start: Date
    end: Date
    type: string
    players?: string[]
    playerPhones?: string[]
    contact?: string
    phone?: string
    price?: number
    status?: string
    paymentStatus?: string
    reason?: string
    court?: string
  } | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  create: [bookingData: Record<string, unknown>]
  update: [bookingId: string, bookingData: Record<string, unknown>]
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
  playerPhones: ['', '', '', ''],
  contact: '',
  phone: '',
  price: 150000,
  status: 'confirmed',
  paymentStatus: 'pending',
})

// Update end time to be exactly 24 hours after start time
const updateEndTime = () => {
  if (formData.value.startTime) {
    const startDate = new Date(formData.value.startTime)
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000) // Add 24 hours
    formData.value.endTime = endDate.toISOString().slice(0, 16)
  }
}

const formatEndTime = () => {
  if (formData.value.startTime) {
    const startDate = new Date(formData.value.startTime)
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
    return endDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }
  return ''
}

const batchMode = ref(false)
const isSubmitting = ref(false)
const playerValidationError = ref('')

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
  if (formData.value.players.length < 4) {
    formData.value.players.push('')
    formData.value.playerPhones.push('')
    playerValidationError.value = ''
  }
}

const removePlayer = (index: number) => {
  if (formData.value.players.length > 1 && index > 0) {
    formData.value.players.splice(index, 1)
    formData.value.playerPhones.splice(index, 1)
    validatePlayers()
  }
}

const getValidPlayerCount = () => {
  return formData.value.players.filter((p) => p && p.trim()).length
}

const getPlayerValidationClass = (player: string, index: number) => {
  if (index === 0 && (!player || !player.trim())) {
    return 'border-red-300 focus:ring-red-400 focus:border-red-400'
  }
  if (player && player.trim()) {
    return 'border-green-300 focus:ring-green-400 focus:border-green-400'
  }
  return 'border-slate-300 focus:ring-yellow-400 focus:border-yellow-400'
}

const validatePlayerName = (index: number) => {
  const player = formData.value.players[index]
  if (index === 0 && (!player || !player.trim())) {
    playerValidationError.value = 'Main player name is required'
    return false
  }
  validatePlayers()
  return true
}

const validatePlayers = () => {
  const validation = ValidationUtils.validatePlayers(formData.value.players)
  if (!validation.isValid) {
    playerValidationError.value = validation.error || ''
    return false
  }
  playerValidationError.value = ''
  return true
}

const removeSlot = (index: number) => {
  emit('removeSlot', index)
}

const toggleBatchMode = () => {
  batchMode.value = !batchMode.value
}

const handleSubmit = async () => {
  // Validate required fields
  if (!validatePlayers()) {
    return
  }

  if (
    !formData.value.contact ||
    !ValidationUtils.isValidEmail(formData.value.contact)
  ) {
    alert('Please provide a valid email address.')
    return
  }

  if (
    !formData.value.phone ||
    !ValidationUtils.isValidPhoneNumber(formData.value.phone)
  ) {
    alert(
      'Please provide a valid Indonesian phone number (e.g., +62812345678 or 08123456789).'
    )
    return
  }

  if (!ValidationUtils.isValidPrice(formData.value.price)) {
    alert('Please provide a valid price.')
    return
  }

  isSubmitting.value = true

  try {
    const baseData = {
      court: formData.value.court,
      type: 'booking',
    }

    // Handle regular bookings
    const validPlayers = formData.value.players.filter((p) => p && p.trim())
    const validPlayerPhones = formData.value.playerPhones.filter(
      (p, index) =>
        formData.value.players[index] &&
        formData.value.players[index].trim() &&
        p &&
        p.trim()
    )

    if (props.selectedSlots.length > 1 && batchMode.value) {
      // Batch create bookings with sequential processing
      for (let i = 0; i < props.selectedSlots.length; i++) {
        const slot = props.selectedSlots[i]
        const bookingData = {
          ...baseData,
          title: `${formData.value.title} ${props.selectedSlots.length > 1 ? `(${i + 1}/${props.selectedSlots.length})` : ''}`,
          start: slot.start,
          end: slot.end,
          players: validPlayers,
          playerPhones: validPlayerPhones,
          contact: formData.value.contact,
          phone: formData.value.phone,
          price: formData.value.price,
          status: formData.value.status,
          paymentStatus: formData.value.paymentStatus,
        }
        await emit('create', bookingData)
      }
    } else {
      // Single booking
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
        players: validPlayers,
        playerPhones: validPlayerPhones,
        contact: formData.value.contact,
        phone: formData.value.phone,
        price: formData.value.price,
        status: formData.value.status,
        paymentStatus: formData.value.paymentStatus,
      }

      if (props.isEditMode && props.editingBooking) {
        emit('update', props.editingBooking.id, bookingData)
      } else {
        emit('create', bookingData)
      }
    }
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = () => {
  if (
    props.editingBooking &&
    confirm('Are you sure you want to delete this booking?')
  ) {
    emit('delete', props.editingBooking.id)
  }
}

// Initialize form data when editing
watch(
  () => props.editingBooking,
  (booking) => {
    if (booking && props.isEditMode) {
      const players = booking.players || []
      const playerPhones = booking.playerPhones || []

      // Ensure we have at least 1 player slot, max 4
      const playerSlots = [...players]
      const phoneSlots = [...playerPhones]

      while (playerSlots.length < 1) playerSlots.push('')
      while (playerSlots.length < 4) playerSlots.push('')
      while (phoneSlots.length < playerSlots.length) phoneSlots.push('')

      // Clear validation errors when editing
      playerValidationError.value = ''

      formData.value = {
        type: 'booking',
        title: booking.title || '',
        startTime: booking.start
          ? new Date(booking.start).toISOString().slice(0, 16)
          : '',
        endTime: booking.end
          ? new Date(booking.end).toISOString().slice(0, 16)
          : '',
        court: booking.court || '',
        players: playerSlots,
        playerPhones: phoneSlots,
        contact: booking.contact || '',
        phone: booking.phone || '',
        price: booking.price || 150000,
        status: booking.status || 'confirmed',
        paymentStatus: booking.paymentStatus || 'pending',
      }
    }
  },
  { immediate: true }
)

onMounted(() => {
  // Set default times if no slots selected - default to next hour for 24-hour booking
  if (props.selectedSlots.length === 0 && !props.isEditMode) {
    const now = new Date()
    now.setMinutes(0, 0, 0)
    now.setHours(now.getHours() + 1) // Start from next hour

    formData.value.startTime = now.toISOString().slice(0, 16)
    updateEndTime() // Set end time to 24 hours later
  }

  // Initialize with minimum required player slots
  if (formData.value.players.length === 0) {
    formData.value.players = ['', '', '', '']
    formData.value.playerPhones = ['', '', '', '']
  }
})
</script>
