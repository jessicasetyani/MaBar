<template>
  <div class="min-h-screen bg-lime-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <h1 class="text-xl font-semibold text-slate-900">
              {{ venueOwnerData?.venueDetails?.name || 'Venue Dashboard' }}
            </h1>
            <span
              v-if="applicationStatus === 'Approved'"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-lime-100 text-lime-800"
            >
              ✓ Verified
            </span>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-slate-600">{{ user?.email }}</span>
            <button
              @click="logout"
              class="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="flex h-[calc(100vh-4rem)]">
      <!-- Sidebar -->
      <aside
        class="w-64 bg-white shadow-sm border-r border-slate-200 hidden lg:block"
      >
        <nav class="p-4 space-y-2">
          <button
            @click="activeTab = 'calendar'"
            :class="[
              'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === 'calendar'
                ? 'bg-yellow-100 text-yellow-800'
                : 'text-slate-600 hover:bg-slate-100',
            ]"
          >
            📅 Calendar & Bookings
          </button>
          <button
            @click="activeTab = 'profile'"
            :class="[
              'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === 'profile'
                ? 'bg-yellow-100 text-yellow-800'
                : 'text-slate-600 hover:bg-slate-100',
            ]"
          >
            🏢 Venue Profile
          </button>
          <button
            @click="activeTab = 'analytics'"
            :class="[
              'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === 'analytics'
                ? 'bg-yellow-100 text-yellow-800'
                : 'text-slate-600 hover:bg-slate-100',
            ]"
          >
            📊 Analytics
          </button>
        </nav>
      </aside>

      <!-- Mobile Navigation -->
      <div
        class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-10"
      >
        <nav class="flex">
          <button
            @click="activeTab = 'calendar'"
            :class="[
              'flex-1 py-3 px-2 text-center text-xs font-medium transition-colors',
              activeTab === 'calendar'
                ? 'bg-yellow-100 text-yellow-800'
                : 'text-slate-600',
            ]"
          >
            📅<br />Calendar
          </button>
          <button
            @click="activeTab = 'profile'"
            :class="[
              'flex-1 py-3 px-2 text-center text-xs font-medium transition-colors',
              activeTab === 'profile'
                ? 'bg-yellow-100 text-yellow-800'
                : 'text-slate-600',
            ]"
          >
            🏢<br />Profile
          </button>
          <button
            @click="activeTab = 'analytics'"
            :class="[
              'flex-1 py-3 px-2 text-center text-xs font-medium transition-colors',
              activeTab === 'analytics'
                ? 'bg-yellow-100 text-yellow-800'
                : 'text-slate-600',
            ]"
          >
            📊<br />Analytics
          </button>
        </nav>
      </div>

      <!-- Main Content -->
      <main class="flex-1 overflow-auto pb-16 lg:pb-0">
        <!-- Calendar Tab -->
        <div v-if="activeTab === 'calendar'" class="p-6">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-slate-900 mb-2">
              Booking Calendar
            </h2>
            <p class="text-slate-600">
              Manage your court bookings and availability
            </p>
          </div>

          <!-- Instructions -->
          <div class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p class="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Click and drag on empty time slots to
              block/unblock them. Click on blocked slots to unblock.
            </p>
          </div>

          <!-- Calendar Container -->
          <div
            class="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
          >
            <FullCalendar :options="calendarOptions" class="venue-calendar" />
          </div>

          <!-- Booking Details Modal -->
          <div
            v-if="showBookingModal"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            @click="closeBookingModal"
          >
            <div
              class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              @click.stop
            >
              <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                  <h3 class="text-lg font-semibold text-slate-900">
                    Booking Details
                  </h3>
                  <button
                    @click="closeBookingModal"
                    class="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                <div v-if="selectedBooking" class="space-y-4">
                  <!-- Status Badge -->
                  <div class="flex items-center space-x-2">
                    <span
                      :class="[
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        selectedBooking.status === 'confirmed'
                          ? 'bg-lime-100 text-lime-800'
                          : 'bg-yellow-100 text-yellow-800',
                      ]"
                    >
                      {{
                        selectedBooking.status === 'confirmed'
                          ? '✓ Confirmed'
                          : '⏳ Pending'
                      }}
                    </span>
                    <span
                      :class="[
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        selectedBooking.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800',
                      ]"
                    >
                      {{
                        selectedBooking.paymentStatus === 'paid'
                          ? '💳 Paid'
                          : '💳 Unpaid'
                      }}
                    </span>
                  </div>

                  <!-- Time & Court -->
                  <div class="bg-slate-50 rounded-lg p-3">
                    <div class="text-sm text-slate-600 mb-1">
                      Time & Location
                    </div>
                    <div class="font-medium text-slate-900">
                      {{ formatTime(selectedBooking.start) }} -
                      {{ formatTime(selectedBooking.end) }}
                    </div>
                    <div class="text-sm text-slate-600">
                      {{ selectedBooking.court }}
                    </div>
                  </div>

                  <!-- Players -->
                  <div>
                    <div class="text-sm text-slate-600 mb-2">Players</div>
                    <div class="space-y-1">
                      <div
                        v-for="player in selectedBooking.players"
                        :key="player"
                        class="text-sm text-slate-900"
                      >
                        👤 {{ player }}
                      </div>
                    </div>
                  </div>

                  <!-- Contact Info -->
                  <div>
                    <div class="text-sm text-slate-600 mb-2">
                      Contact Information
                    </div>
                    <div class="space-y-1">
                      <div class="text-sm text-slate-900">
                        📧 {{ selectedBooking.contact }}
                      </div>
                      <div class="text-sm text-slate-900">
                        📱 {{ selectedBooking.phone }}
                      </div>
                    </div>
                  </div>

                  <!-- Price -->
                  <div class="bg-slate-50 rounded-lg p-3">
                    <div class="text-sm text-slate-600 mb-1">Total Price</div>
                    <div class="text-lg font-semibold text-slate-900">
                      {{ formatPrice(selectedBooking.price) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Tab -->
        <div v-if="activeTab === 'profile'" class="p-6">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-slate-900 mb-2">
              Venue Profile
            </h2>
            <p class="text-slate-600">
              Your venue information and verification status
            </p>
          </div>

          <!-- Status Card -->
          <div class="mb-6">
            <div
              class="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
            >
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div
                    :class="[
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      applicationStatus === 'Approved'
                        ? 'bg-lime-100'
                        : 'bg-yellow-100',
                    ]"
                  >
                    <span
                      :class="
                        applicationStatus === 'Approved'
                          ? 'text-lime-600'
                          : 'text-yellow-600'
                      "
                    >
                      {{ applicationStatus === 'Approved' ? '✓' : '⏳' }}
                    </span>
                  </div>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-slate-900">
                    Status: {{ applicationStatus }}
                  </h3>
                  <p class="text-sm text-slate-600">
                    {{
                      applicationStatus === 'Approved'
                        ? 'Your venue is verified and ready to accept bookings'
                        : 'Your venue registration is under review'
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Profile Details -->
          <div
            v-if="venueOwnerData"
            class="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <!-- Venue Details -->
            <div
              class="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
            >
              <h3 class="text-lg font-medium text-slate-900 mb-4">
                Venue Information
              </h3>
              <dl class="space-y-3">
                <div>
                  <dt class="text-sm font-medium text-slate-500">Venue Name</dt>
                  <dd class="text-sm text-slate-900">
                    {{ venueOwnerData.venueDetails?.name }}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-slate-500">Address</dt>
                  <dd class="text-sm text-slate-900">
                    {{ venueOwnerData.venueDetails?.address }}
                  </dd>
                </div>
                <div v-if="venueOwnerData.venueDetails?.facilities?.length">
                  <dt class="text-sm font-medium text-slate-500">Facilities</dt>
                  <dd class="text-sm text-slate-900">
                    {{ venueOwnerData.venueDetails.facilities.join(', ') }}
                  </dd>
                </div>
              </dl>
            </div>

            <!-- Personal Information -->
            <div
              class="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
            >
              <h3 class="text-lg font-medium text-slate-900 mb-4">
                Owner Information
              </h3>
              <dl class="space-y-3">
                <div>
                  <dt class="text-sm font-medium text-slate-500">Name</dt>
                  <dd class="text-sm text-slate-900">
                    {{ venueOwnerData.personalInfo?.name }}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-slate-500">Email</dt>
                  <dd class="text-sm text-slate-900">
                    {{ venueOwnerData.personalInfo?.email }}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-slate-500">Phone</dt>
                  <dd class="text-sm text-slate-900">
                    {{ venueOwnerData.legalDocs?.phone }}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <!-- Analytics Tab -->
        <div v-if="activeTab === 'analytics'" class="p-6">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-slate-900 mb-2">Analytics</h2>
            <p class="text-slate-600">
              Booking statistics and performance metrics
            </p>
          </div>

          <div
            class="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
          >
            <div class="flex items-center justify-center h-96 text-slate-500">
              📊 Analytics dashboard coming soon
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="!venueOwnerData && activeTab === 'profile'" class="p-6">
          <div class="text-center py-12">
            <div class="text-slate-500">Loading venue information...</div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { VenueOwnerService } from '../services/venueOwnerService'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import Parse from '../services/back4app'

const router = useRouter()
const authStore = useAuthStore()
const { user } = authStore

const venueOwnerData = ref<any>(null)
const applicationStatus = ref('Pending Verification')
const activeTab = ref('calendar')
const bookings = ref<any[]>([])
const blockedSlots = ref<any[]>([])
const selectedBooking = ref<any>(null)
const showBookingModal = ref(false)
const liveQuerySubscriptions = ref<any[]>([])

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  height: 'auto',
  events: [...bookings.value, ...blockedSlots.value],
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  slotMinTime: '06:00:00',
  slotMaxTime: '23:00:00',
  allDaySlot: false,
  eventColor: '#84CC16',
  eventTextColor: '#ffffff',
  eventBorderColor: '#65A30D',
  select: handleSlotSelect,
  eventClick: handleEventClick,
}))

const logout = async () => {
  await authStore.logout()
  router.push('/')
}

const loadBookings = async () => {
  try {
    // Try to load from Parse first, fallback to mock data
    const BookingClass = Parse.Object.extend('Booking')
    const query = new Parse.Query(BookingClass)
    query.equalTo('venueId', venueOwnerData.value?.objectId || 'mock-venue')

    const parseBookings = await query.find()

    if (parseBookings.length > 0) {
      bookings.value = parseBookings.map((booking) => ({
        id: booking.id,
        title:
          booking.get('title') ||
          `${booking.get('court')} - ${booking.get('players')?.join(' vs ')}`,
        start: booking.get('startTime'),
        end: booking.get('endTime'),
        backgroundColor:
          booking.get('status') === 'confirmed' ? '#84CC16' : '#FDE047',
        borderColor:
          booking.get('status') === 'confirmed' ? '#65A30D' : '#FACC15',
        textColor:
          booking.get('status') === 'confirmed' ? '#ffffff' : '#334155',
        extendedProps: {
          type: 'booking',
          status: booking.get('status'),
          court: booking.get('court'),
          players: booking.get('players') || [],
          contact: booking.get('contact'),
          phone: booking.get('phone'),
          price: booking.get('price'),
          paymentStatus: booking.get('paymentStatus'),
        },
      }))
    } else {
      // Fallback to mock data
      bookings.value = [
        {
          id: '1',
          title: 'Court 1 - John & Mike vs Sarah & Lisa',
          start: new Date().toISOString().split('T')[0] + 'T10:00:00',
          end: new Date().toISOString().split('T')[0] + 'T11:30:00',
          backgroundColor: '#84CC16',
          borderColor: '#65A30D',
          extendedProps: {
            type: 'booking',
            status: 'confirmed',
            court: 'Court 1',
            players: ['John Doe', 'Mike Smith', 'Sarah Johnson', 'Lisa Brown'],
            contact: 'john.doe@email.com',
            phone: '+62 812-3456-7890',
            price: 150000,
            paymentStatus: 'paid',
          },
        },
        {
          id: '2',
          title: 'Court 2 - Training Session',
          start: new Date().toISOString().split('T')[0] + 'T14:00:00',
          end: new Date().toISOString().split('T')[0] + 'T15:30:00',
          backgroundColor: '#FDE047',
          borderColor: '#FACC15',
          textColor: '#334155',
          extendedProps: {
            type: 'booking',
            status: 'pending',
            court: 'Court 2',
            players: ['Alex Wilson'],
            contact: 'alex.wilson@email.com',
            phone: '+62 813-7654-3210',
            price: 100000,
            paymentStatus: 'pending',
          },
        },
      ]
    }
  } catch (error) {
    console.error('Error loading bookings:', error)
    // Use mock data on error
    bookings.value = [
      {
        id: '1',
        title: 'Court 1 - John & Mike vs Sarah & Lisa',
        start: new Date().toISOString().split('T')[0] + 'T10:00:00',
        end: new Date().toISOString().split('T')[0] + 'T11:30:00',
        backgroundColor: '#84CC16',
        borderColor: '#65A30D',
        extendedProps: {
          type: 'booking',
          status: 'confirmed',
          court: 'Court 1',
          players: ['John Doe', 'Mike Smith', 'Sarah Johnson', 'Lisa Brown'],
          contact: 'john.doe@email.com',
          phone: '+62 812-3456-7890',
          price: 150000,
          paymentStatus: 'paid',
        },
      },
    ]
  }
}

const loadBlockedSlots = async () => {
  try {
    const BlockedSlotClass = Parse.Object.extend('BlockedSlot')
    const query = new Parse.Query(BlockedSlotClass)
    query.equalTo('venueId', venueOwnerData.value?.objectId || 'mock-venue')

    const parseBlocked = await query.find()

    if (parseBlocked.length > 0) {
      blockedSlots.value = parseBlocked.map((blocked) => ({
        id: blocked.id,
        title: '🚫 Blocked',
        start: blocked.get('startTime'),
        end: blocked.get('endTime'),
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
        textColor: '#ffffff',
        extendedProps: {
          type: 'blocked',
        },
      }))
    } else {
      // Mock blocked slots data
      blockedSlots.value = [
        {
          id: 'blocked-1',
          title: '🚫 Blocked',
          start: new Date().toISOString().split('T')[0] + 'T12:00:00',
          end: new Date().toISOString().split('T')[0] + 'T13:30:00',
          backgroundColor: '#EF4444',
          borderColor: '#DC2626',
          textColor: '#ffffff',
          extendedProps: {
            type: 'blocked',
          },
        },
      ]
    }
  } catch (error) {
    console.error('Error loading blocked slots:', error)
    blockedSlots.value = []
  }
}

const handleSlotSelect = async (selectInfo: any) => {
  const { start, end } = selectInfo

  // Check if slot overlaps with existing bookings
  const hasBooking = bookings.value.some((booking) => {
    const bookingStart = new Date(booking.start)
    const bookingEnd = new Date(booking.end)
    return start < bookingEnd && end > bookingStart
  })

  if (hasBooking) {
    alert('Cannot block slot - there is an existing booking')
    return
  }

  // Check if slot is already blocked
  const existingBlockIndex = blockedSlots.value.findIndex((blocked) => {
    const blockedStart = new Date(blocked.start)
    const blockedEnd = new Date(blocked.end)
    return (
      start.getTime() === blockedStart.getTime() &&
      end.getTime() === blockedEnd.getTime()
    )
  })

  try {
    if (existingBlockIndex >= 0) {
      // Unblock the slot - remove from Parse
      const BlockedSlotClass = Parse.Object.extend('BlockedSlot')
      const query = new Parse.Query(BlockedSlotClass)
      const blockedSlot = await query.get(
        blockedSlots.value[existingBlockIndex].id
      )
      await blockedSlot.destroy()

      // Remove from local array (will be updated by LiveQuery)
      blockedSlots.value.splice(existingBlockIndex, 1)
      console.log('Slot unblocked')
    } else {
      // Block the slot - save to Parse
      const BlockedSlotClass = Parse.Object.extend('BlockedSlot')
      const blockedSlot = new BlockedSlotClass()

      blockedSlot.set('venueId', venueOwnerData.value?.objectId || 'mock-venue')
      blockedSlot.set('startTime', start.toISOString())
      blockedSlot.set('endTime', end.toISOString())

      const savedSlot = await blockedSlot.save()

      // Add to local array (will be updated by LiveQuery)
      const newBlockedSlot = {
        id: savedSlot.id,
        title: '🚫 Blocked',
        start: start.toISOString(),
        end: end.toISOString(),
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
        textColor: '#ffffff',
        extendedProps: {
          type: 'blocked',
        },
      }
      blockedSlots.value.push(newBlockedSlot)
      console.log('Slot blocked')
    }
  } catch (error) {
    console.error('Error updating blocked slot:', error)
    alert('Failed to update slot. Please try again.')
  }

  // Clear selection
  selectInfo.view.calendar.unselect()
}

const handleEventClick = async (clickInfo: any) => {
  const event = clickInfo.event

  if (event.extendedProps?.type === 'blocked') {
    if (confirm('Do you want to unblock this time slot?')) {
      try {
        const BlockedSlotClass = Parse.Object.extend('BlockedSlot')
        const query = new Parse.Query(BlockedSlotClass)
        const blockedSlot = await query.get(event.id)
        await blockedSlot.destroy()

        const blockIndex = blockedSlots.value.findIndex(
          (blocked) => blocked.id === event.id
        )
        if (blockIndex >= 0) {
          blockedSlots.value.splice(blockIndex, 1)
          console.log('Slot unblocked')
        }
      } catch (error) {
        console.error('Error unblocking slot:', error)
        alert('Failed to unblock slot. Please try again.')
      }
    }
  } else if (event.extendedProps?.type === 'booking') {
    selectedBooking.value = {
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      ...event.extendedProps,
    }
    showBookingModal.value = true
  }
}

const closeBookingModal = () => {
  showBookingModal.value = false
  selectedBooking.value = null
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
}

const setupLiveQueries = async () => {
  try {
    const venueId = venueOwnerData.value?.objectId || 'mock-venue'

    // Set up LiveQuery for bookings
    const BookingClass = Parse.Object.extend('Booking')
    const bookingQuery = new Parse.Query(BookingClass)
    bookingQuery.equalTo('venueId', venueId)

    const bookingSubscription = await bookingQuery.subscribe()

    bookingSubscription.on('create', (booking: any) => {
      console.log('New booking created:', booking)
      const newBooking = {
        id: booking.id,
        title:
          booking.get('title') ||
          `${booking.get('court')} - ${booking.get('players')?.join(' vs ')}`,
        start: booking.get('startTime'),
        end: booking.get('endTime'),
        backgroundColor:
          booking.get('status') === 'confirmed' ? '#84CC16' : '#FDE047',
        borderColor:
          booking.get('status') === 'confirmed' ? '#65A30D' : '#FACC15',
        textColor:
          booking.get('status') === 'confirmed' ? '#ffffff' : '#334155',
        extendedProps: {
          type: 'booking',
          status: booking.get('status'),
          court: booking.get('court'),
          players: booking.get('players') || [],
          contact: booking.get('contact'),
          phone: booking.get('phone'),
          price: booking.get('price'),
          paymentStatus: booking.get('paymentStatus'),
        },
      }
      bookings.value.push(newBooking)
    })

    bookingSubscription.on('update', (booking: any) => {
      console.log('Booking updated:', booking)
      const index = bookings.value.findIndex((b) => b.id === booking.id)
      if (index >= 0) {
        bookings.value[index] = {
          id: booking.id,
          title:
            booking.get('title') ||
            `${booking.get('court')} - ${booking.get('players')?.join(' vs ')}`,
          start: booking.get('startTime'),
          end: booking.get('endTime'),
          backgroundColor:
            booking.get('status') === 'confirmed' ? '#84CC16' : '#FDE047',
          borderColor:
            booking.get('status') === 'confirmed' ? '#65A30D' : '#FACC15',
          textColor:
            booking.get('status') === 'confirmed' ? '#ffffff' : '#334155',
          extendedProps: {
            type: 'booking',
            status: booking.get('status'),
            court: booking.get('court'),
            players: booking.get('players') || [],
            contact: booking.get('contact'),
            phone: booking.get('phone'),
            price: booking.get('price'),
            paymentStatus: booking.get('paymentStatus'),
          },
        }
      }
    })

    bookingSubscription.on('delete', (booking: any) => {
      console.log('Booking deleted:', booking)
      const index = bookings.value.findIndex((b) => b.id === booking.id)
      if (index >= 0) {
        bookings.value.splice(index, 1)
      }
    })

    // Set up LiveQuery for blocked slots
    const BlockedSlotClass = Parse.Object.extend('BlockedSlot')
    const blockedQuery = new Parse.Query(BlockedSlotClass)
    blockedQuery.equalTo('venueId', venueId)

    const blockedSubscription = await blockedQuery.subscribe()

    blockedSubscription.on('create', (blocked: any) => {
      console.log('New blocked slot created:', blocked)
      const newBlocked = {
        id: blocked.id,
        title: '🚫 Blocked',
        start: blocked.get('startTime'),
        end: blocked.get('endTime'),
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
        textColor: '#ffffff',
        extendedProps: {
          type: 'blocked',
        },
      }
      // Check if not already in array to prevent duplicates
      if (!blockedSlots.value.find((b) => b.id === blocked.id)) {
        blockedSlots.value.push(newBlocked)
      }
    })

    blockedSubscription.on('delete', (blocked: any) => {
      console.log('Blocked slot deleted:', blocked)
      const index = blockedSlots.value.findIndex((b) => b.id === blocked.id)
      if (index >= 0) {
        blockedSlots.value.splice(index, 1)
      }
    })

    // Store subscriptions for cleanup
    liveQuerySubscriptions.value = [bookingSubscription, blockedSubscription]

    console.log('✅ LiveQuery subscriptions established')
  } catch (error) {
    console.error('Error setting up LiveQuery:', error)
  }
}

const cleanupLiveQueries = () => {
  liveQuerySubscriptions.value.forEach((subscription) => {
    try {
      subscription.unsubscribe()
    } catch (error) {
      console.error('Error unsubscribing from LiveQuery:', error)
    }
  })
  liveQuerySubscriptions.value = []
  console.log('🧹 LiveQuery subscriptions cleaned up')
}

onMounted(async () => {
  try {
    const profile = await VenueOwnerService.getVenueOwnerProfile()
    if (profile) {
      venueOwnerData.value = {
        objectId: profile.id,
        personalInfo: profile.get('personalInfo'),
        venueDetails: profile.get('venueDetails'),
        legalDocs: profile.get('legalDocs'),
        documents: profile.get('documents') || [],
        status: profile.get('status'),
        submittedAt: profile.get('submittedAt'),
      }

      const status = profile.get('status')
      switch (status) {
        case 'pending_verification':
          applicationStatus.value = 'Pending Verification'
          break
        case 'approved':
          applicationStatus.value = 'Approved'
          activeTab.value = 'calendar'
          await loadBookings()
          await loadBlockedSlots()
          await setupLiveQueries()
          break
        case 'rejected':
          applicationStatus.value = 'Rejected'
          activeTab.value = 'profile'
          break
        default:
          applicationStatus.value = 'Unknown'
          activeTab.value = 'profile'
      }
    } else {
      router.push('/onboarding/venue-owner')
    }
  } catch (error) {
    console.error('Error loading venue owner data:', error)
    activeTab.value = 'profile'
  }
})

onUnmounted(() => {
  cleanupLiveQueries()
})
</script>

<style>
.venue-calendar .fc {
  font-family: inherit;
}

.venue-calendar .fc-button-primary {
  background-color: #fde047;
  border-color: #facc15;
  color: #334155;
}

.venue-calendar .fc-button-primary:hover {
  background-color: #facc15;
  border-color: #eab308;
}

.venue-calendar .fc-button-primary:disabled {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
  color: #94a3b8;
}

.venue-calendar .fc-today-button {
  background-color: #84cc16;
  border-color: #65a30d;
  color: white;
}

.venue-calendar .fc-today-button:hover {
  background-color: #65a30d;
  border-color: #4d7c0f;
}
</style>
