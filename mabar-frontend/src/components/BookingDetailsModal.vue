<template>
  <!-- Debug indicator for BookingDetailsModal -->
  <div style="position: fixed; top: 50px; right: 10px; background: lime; color: black; padding: 5px; z-index: 100001; font-size: 10px;">
    ✅ BookingDetailsModal RENDERED!
  </div>

  <div
    style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); z-index: 100000; display: flex; align-items: center; justify-content: center; padding: 1rem;"
    @click="$emit('close')"
  >
    <div
      style="background: white; border-radius: 0.75rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); max-width: 28rem; width: 100%; max-height: 90vh; overflow: hidden; position: relative;"
      @click.stop
    >
        <!-- Header -->
        <div style="padding: 1.5rem; border-bottom: 1px solid #e2e8f0;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <h3 style="font-size: 1.125rem; font-weight: 600; color: #0f172a; margin: 0;">
                {{ formatTitle(booking) }}
              </h3>
              <p style="font-size: 0.875rem; color: #64748b; margin: 0.25rem 0 0 0;">
                {{ formatDate(booking.start) }}
              </p>
            </div>
            <button
              @click="$emit('close')"
              style="color: #94a3b8; background: none; border: none; cursor: pointer; padding: 0.25rem; border-radius: 0.25rem; transition: color 0.2s;"
              @mouseover="$event.target.style.color = '#64748b'"
              @mouseout="$event.target.style.color = '#94a3b8'"
            >
              <svg
                style="width: 1.25rem; height: 1.25rem;"
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
        <div style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
          <!-- Time & Court -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <div style="font-size: 0.75rem; font-weight: 500; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">
                Time
              </div>
              <p style="font-size: 0.875rem; font-weight: 500; color: #0f172a; margin: 0;">
                {{ formatTime(booking.start) }} - {{ formatTime(booking.end) }}
              </p>
            </div>
            <div>
              <div style="font-size: 0.75rem; font-weight: 500; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">
                Court
              </div>
              <p style="font-size: 0.875rem; font-weight: 500; color: #0f172a; margin: 0;">
                {{ booking.extendedProps?.court }}
              </p>
            </div>
          </div>

          <!-- Players -->
          <div v-if="booking.extendedProps?.players?.length">
            <div style="font-size: 0.75rem; font-weight: 500; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">
              Players
            </div>
            <div style="margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
              <div
                v-for="(player, index) in booking.extendedProps.players"
                :key="index"
                style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;"
              >
                <div style="width: 1.5rem; height: 1.5rem; background-color: #fef3c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 500; color: #92400e; flex-shrink: 0;">
                  {{ index + 1 }}
                </div>
                <span style="font-size: 0.875rem; color: #0f172a; font-weight: 500;">{{ player }}</span>
                <span
                  v-if="booking.extendedProps.playerPhones && booking.extendedProps.playerPhones[index]"
                  style="font-size: 0.875rem; color: #64748b; margin-left: 0.5rem; font-weight: 400;"
                >
                  - {{ booking.extendedProps.playerPhones[index] }}
                </span>
              </div>
            </div>
          </div>

          <!-- Contact Info -->
          <!-- Note: Venue phone contact removed - only player phone numbers are used -->

          <!-- Blocked Slot Reason -->
          <div v-if="booking.extendedProps?.type === 'blocked' && booking.extendedProps?.reason" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.75rem; font-weight: 500; color: #dc2626; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">
              Blocked Reason
            </div>
            <p style="font-size: 0.875rem; color: #991b1b; margin: 0;">
              {{ booking.extendedProps.reason }}
            </p>
          </div>

          <!-- Status & Payment -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <div style="font-size: 0.75rem; font-weight: 500; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">
                Status
              </div>
              <span
                :style="{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.125rem 0.625rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  marginTop: '0.25rem',
                  backgroundColor: booking.extendedProps?.status === 'confirmed' ? '#dcfce7' : '#fef3c7',
                  color: booking.extendedProps?.status === 'confirmed' ? '#166534' : '#92400e'
                }"
              >
                {{ booking.extendedProps?.status || 'pending' }}
              </span>
            </div>
            <div v-if="booking.extendedProps?.price">
              <div style="font-size: 0.75rem; font-weight: 500; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">
                Price
              </div>
              <p style="font-size: 0.875rem; font-weight: 500; color: #0f172a; margin: 0;">
                Rp {{ formatPrice(booking.extendedProps.price) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div style="padding: 1.5rem; border-top: 1px solid #e2e8f0; display: flex; gap: 0.75rem;">
          <!-- Actions for regular bookings -->
          <template v-if="booking.extendedProps?.type !== 'blocked'">
            <button
              @click="$emit('edit')"
              style="flex: 1; padding: 0.5rem 1rem; background-color: #facc15; color: #1e293b; border-radius: 0.5rem; font-weight: 500; border: none; cursor: pointer; transition: background-color 0.2s;"
              @mouseover="$event.target.style.backgroundColor = '#eab308'"
              @mouseout="$event.target.style.backgroundColor = '#facc15'"
            >
              Edit Booking
            </button>
            <button
              @click="$emit('delete')"
              style="padding: 0.5rem 1rem; background-color: #dc2626; color: white; border-radius: 0.5rem; font-weight: 500; border: none; cursor: pointer; transition: background-color 0.2s;"
              @mouseover="$event.target.style.backgroundColor = '#b91c1c'"
              @mouseout="$event.target.style.backgroundColor = '#dc2626'"
            >
              Delete
            </button>
          </template>

          <!-- Actions for blocked slots -->
          <template v-else>
            <button
              @click="$emit('delete')"
              style="flex: 1; padding: 0.5rem 1rem; background-color: #dc2626; color: white; border-radius: 0.5rem; font-weight: 500; border: none; cursor: pointer; transition: background-color 0.2s;"
              @mouseover="$event.target.style.backgroundColor = '#b91c1c'"
              @mouseout="$event.target.style.backgroundColor = '#dc2626'"
            >
              Remove Block
            </button>
          </template>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'

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
      playerPhones?: string[] // Phone numbers corresponding to each player
      contact?: string
      // Note: Venue phone contact removed - only player phone numbers are used
      price?: number
      paymentStatus?: string
      reason?: string // For blocked slots
    }
  }
}

const props = defineProps<Props>()
defineEmits<{
  close: []
  edit: []
  delete: []
}>()

// Computed property to determine if booking is historical (past)
const isHistoricalBooking = computed(() => {
  const now = new Date()
  const bookingEnd = props.booking.end

  // Ensure we have a valid Date object
  if (!(bookingEnd instanceof Date) || isNaN(bookingEnd.getTime())) {
    console.warn('⚠️ Invalid booking end date:', bookingEnd)
    return false // Default to allowing edits if date is invalid
  }

  const isHistorical = bookingEnd <= now
  console.log('📅 Booking time check:', {
    bookingEnd: bookingEnd.toISOString(),
    currentTime: now.toISOString(),
    isHistorical
  })

  return isHistorical
})

// Debug logging
console.log('🟢 BookingDetailsModal component created with props:', props.booking)

onMounted(() => {
  console.log('🟢 BookingDetailsModal component mounted')
  console.log('🟢 Booking data:', {
    id: props.booking.id,
    title: props.booking.title,
    start: props.booking.start,
    end: props.booking.end,
    startType: typeof props.booking.start,
    endType: typeof props.booking.end,
    startValid: props.booking.start instanceof Date && !isNaN(props.booking.start.getTime()),
    endValid: props.booking.end instanceof Date && !isNaN(props.booking.end.getTime())
  })

  // Enhanced debugging for player phone data in modal
  console.log('📞 MODAL PLAYER PHONE DEBUG:', {
    extendedProps: props.booking.extendedProps,
    players: props.booking.extendedProps?.players,
    playerPhones: props.booking.extendedProps?.playerPhones,
    playersLength: props.booking.extendedProps?.players?.length,
    playerPhonesLength: props.booking.extendedProps?.playerPhones?.length,
    playerPhonesType: typeof props.booking.extendedProps?.playerPhones,
    hasPlayerPhones: !!props.booking.extendedProps?.playerPhones,
    playerPhonesArray: Array.isArray(props.booking.extendedProps?.playerPhones)
  })

  // Log each player and corresponding phone
  if (props.booking.extendedProps?.players) {
    props.booking.extendedProps.players.forEach((player, index) => {
      console.log(`📞 Player ${index + 1}: "${player}" - Phone: "${props.booking.extendedProps?.playerPhones?.[index] || 'NO PHONE'}"`)
    })
  }
})

onUnmounted(() => {
  console.log('🔴 BookingDetailsModal component unmounted')
})

const formatTitle = (booking: Props['booking']) => {
  const courtName = booking.extendedProps?.court || 'Unknown Court'
  const duration = calculateDuration(booking.start, booking.end)
  return `${courtName} - ${duration}`
}

const calculateDuration = (start: Date, end: Date) => {
  const startTime = new Date(start).getTime()
  const endTime = new Date(end).getTime()
  const durationMs = endTime - startTime
  const durationHours = durationMs / (1000 * 60 * 60)

  if (durationHours === 1) {
    return '1 hour'
  } else if (durationHours % 1 === 0) {
    // Whole hours
    return `${durationHours} hours`
  } else if (durationHours % 0.5 === 0) {
    // Half hours (e.g., 1.5, 2.5)
    return `${durationHours} hours`
  } else {
    // Round to nearest 0.25 hour for display
    const roundedHours = Math.round(durationHours * 4) / 4
    return `${roundedHours} hours`
  }
}

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
