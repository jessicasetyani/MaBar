import { ref, onMounted, onUnmounted, isRef, watch, type Ref } from 'vue'
import { BookingService } from '../services/bookingService'
import Parse from '../services/back4app'

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  backgroundColor: string
  borderColor: string
  textColor: string
  resourceId?: string
  extendedProps: Record<string, unknown>
}

export function useCalendarData(venueId: string | Ref<string>) {
  const reactiveVenueId = isRef(venueId) ? venueId : ref(venueId)
  const bookings = ref<CalendarEvent[]>([])
  const blockedSlots = ref<CalendarEvent[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isRetrying = ref(false)
  const liveQuerySubscriptions = ref<Array<{ unsubscribe: () => void }>>([])

  const loadBookings = async (limit: number = 100, skip: number = 0) => {
    try {
      console.log('🚀 loadBookings called with venueId:', reactiveVenueId.value)

      if (!reactiveVenueId.value) {
        console.warn('⚠️ No venue ID available, showing empty calendar')
        bookings.value = []
        return
      }

      console.log('🔍 Loading bookings for venue ID:', reactiveVenueId.value)
      const bookingData = await BookingService.getBookings(
        reactiveVenueId.value,
        limit,
        skip
      )
      console.log(
        '📅 Found bookings from service:',
        bookingData.length,
        bookingData
      )

      const formattedBookings = bookingData.map((booking) => {
        const formatted = BookingService.formatBookingForCalendar(booking)
        console.log('🔄 Formatted booking:', formatted)
        return formatted
      })

      bookings.value = formattedBookings
      console.log(
        '📊 Final bookings array:',
        bookings.value.length,
        bookings.value
      )
    } catch (err) {
      console.error('❌ Error loading bookings:', err)
      bookings.value = []
      throw err
    }
  }

  const loadBlockedSlots = async (limit: number = 100, skip: number = 0) => {
    try {
      if (!reactiveVenueId.value) {
        console.warn('⚠️ No venue ID available, showing empty blocked slots')
        blockedSlots.value = []
        return
      }

      console.log(
        '🔍 Loading blocked slots for venue ID:',
        reactiveVenueId.value
      )
      const blockedData = await BookingService.getBlockedSlots(
        reactiveVenueId.value,
        limit,
        skip
      )
      console.log('🚫 Found blocked slots:', blockedData.length)

      blockedSlots.value = blockedData.map((slot) =>
        BookingService.formatBlockedSlotForCalendar(slot)
      )

      console.log(
        '📊 Blocked slots loaded and formatted:',
        blockedSlots.value.length
      )
    } catch (err) {
      console.error('Error loading blocked slots:', err)
      blockedSlots.value = []
      throw err
    }
  }

  const loadAllData = async (showLoading = true) => {
    if (showLoading) {
      isLoading.value = true
    }
    error.value = null

    try {
      await Promise.all([loadBookings(), loadBlockedSlots()])
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to load calendar data'
      console.error('Calendar data loading error:', err)
    } finally {
      isLoading.value = false
      isRetrying.value = false
    }
  }

  const retryLoad = async () => {
    isRetrying.value = true
    await loadAllData(false)
  }

  const setupLiveQueries = async () => {
    try {
      if (!reactiveVenueId.value) return

      // Set up LiveQuery for bookings
      const BookingClass = Parse.Object.extend('Booking')
      const bookingQuery = new Parse.Query(BookingClass)
      bookingQuery.equalTo('venueId', reactiveVenueId.value)

      const bookingSubscription = await bookingQuery.subscribe()

      bookingSubscription.on('create', (booking: Parse.Object) => {
        console.log('New booking created:', booking)
        const newBooking = BookingService.formatBookingForCalendar({
          id: booking.id,
          venueId: booking.get('venueId'),
          title: booking.get('title'),
          startTime: booking.get('startTime'),
          endTime: booking.get('endTime'),
          court: booking.get('court'),
          players: booking.get('players') || [],
          playerPhones: booking.get('playerPhones') || [],
          contact: booking.get('contact'),
          price: booking.get('price'),
          status: booking.get('status'),
          paymentStatus: booking.get('paymentStatus'),
        })
        bookings.value.push(newBooking)
      })

      bookingSubscription.on('update', (booking: Parse.Object) => {
        console.log('Booking updated:', booking)
        const index = bookings.value.findIndex((b) => b.id === booking.id)
        if (index >= 0) {
          bookings.value[index] = BookingService.formatBookingForCalendar({
            id: booking.id,
            venueId: booking.get('venueId'),
            title: booking.get('title'),
            startTime: booking.get('startTime'),
            endTime: booking.get('endTime'),
            court: booking.get('court'),
            players: booking.get('players') || [],
            playerPhones: booking.get('playerPhones') || [],
            contact: booking.get('contact'),
            price: booking.get('price'),
            status: booking.get('status'),
            paymentStatus: booking.get('paymentStatus'),
          })
        }
      })

      bookingSubscription.on('delete', (booking: Parse.Object) => {
        console.log('Booking deleted:', booking)
        const index = bookings.value.findIndex((b) => b.id === booking.id)
        if (index >= 0) {
          bookings.value.splice(index, 1)
        }
      })

      // Set up LiveQuery for blocked slots
      const BlockedSlotClass = Parse.Object.extend('BlockedSlot')
      const blockedQuery = new Parse.Query(BlockedSlotClass)
      blockedQuery.equalTo('venueId', reactiveVenueId.value)

      const blockedSubscription = await blockedQuery.subscribe()

      blockedSubscription.on('create', (blocked: Parse.Object) => {
        console.log('New blocked slot created:', blocked)
        const newBlocked = BookingService.formatBlockedSlotForCalendar({
          id: blocked.id,
          venueId: blocked.get('venueId'),
          startTime: blocked.get('startTime'),
          endTime: blocked.get('endTime'),
          court: blocked.get('court'),
          reason: blocked.get('reason'),
        })
        if (!blockedSlots.value.find((b) => b.id === blocked.id)) {
          blockedSlots.value.push(newBlocked)
        }
      })

      blockedSubscription.on('delete', (blocked: Parse.Object) => {
        console.log('Blocked slot deleted:', blocked)
        const index = blockedSlots.value.findIndex((b) => b.id === blocked.id)
        if (index >= 0) {
          blockedSlots.value.splice(index, 1)
        }
      })

      liveQuerySubscriptions.value = [bookingSubscription, blockedSubscription]
      console.log('✅ LiveQuery subscriptions established')
    } catch (err) {
      console.error('Error setting up LiveQuery:', err)
    }
  }

  const cleanupLiveQueries = () => {
    liveQuerySubscriptions.value.forEach((subscription) => {
      try {
        subscription.unsubscribe()
      } catch (err) {
        console.error('Error unsubscribing from LiveQuery:', err)
      }
    })
    liveQuerySubscriptions.value = []
    console.log('🧹 LiveQuery subscriptions cleaned up')
  }

  const refreshData = async () => {
    await loadAllData(false)
  }

  // Watch for venue ID changes and load data
  watch(
    reactiveVenueId,
    async (newVenueId) => {
      console.log('🔄 Venue ID changed in composable:', newVenueId)
      if (newVenueId) {
        console.log('🚀 Auto-loading data for venue:', newVenueId)
        await loadAllData()
        await setupLiveQueries()
      }
    },
    { immediate: true }
  )

  // Auto-setup when venueId is available
  onMounted(() => {
    console.log('📍 Composable mounted with venueId:', reactiveVenueId.value)
    if (reactiveVenueId.value) {
      loadAllData()
      setupLiveQueries()
    }
  })

  onUnmounted(() => {
    cleanupLiveQueries()
  })

  return {
    bookings,
    blockedSlots,
    isLoading,
    error,
    isRetrying,
    loadAllData,
    retryLoad,
    refreshData,
    setupLiveQueries,
    cleanupLiveQueries,
  }
}
