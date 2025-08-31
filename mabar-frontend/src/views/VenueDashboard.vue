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
            <p class="text-sm text-blue-800 mb-2">
              💡 <strong>How to Manage Bookings:</strong>
            </p>
            <ul class="text-sm text-blue-700 space-y-1">
              <li>
                • <strong>Select Time Slots:</strong> Click on empty time slots
                to select/deselect
              </li>
              <li>
                • <strong>Create Booking:</strong> Select slots and fill the
                booking form, or use the + button
              </li>
              <li>
                • <strong>Edit Booking:</strong> Click on existing bookings to
                edit or delete
              </li>
              <li>
                • <strong>Block Slots:</strong> Use the booking form to block
                time slots
              </li>
            </ul>

            <!-- Selected Slots Info -->
            <div
              v-if="selectedSlots.length > 0"
              class="mt-3 pt-3 border-t border-blue-200"
            >
              <p class="text-sm text-blue-800">
                ✓ {{ selectedSlots.length }} time slot(s) selected
                <button
                  @click="clearSelection"
                  class="ml-2 text-blue-600 hover:text-blue-800 underline"
                >
                  Clear Selection
                </button>
              </p>
            </div>
          </div>

          <!-- Calendar Container -->
          <div
            class="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
          >
            <FullCalendar
              :options="calendarOptions"
              class="venue-calendar"
              @mounted="onCalendarMounted"
            />
          </div>

          <!-- Booking Form Modal -->
          <div
            v-if="showBookingForm"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            @click="clearSelection"
          >
            <div
              class="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              @click.stop
            >
              <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                  <h3 class="text-lg font-semibold text-slate-900">
                    {{ isEditMode ? 'Edit Booking' : 'Create Booking' }}
                  </h3>
                  <button
                    @click="clearSelection"
                    class="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                <BookingForm
                  :selected-slots="selectedSlots"
                  :paddle-fields="paddleFields"
                  :is-edit-mode="isEditMode"
                  :editing-booking="editingBooking"
                  @create="createBooking"
                  @update="updateBooking"
                  @delete="deleteBooking"
                  @cancel="clearSelection"
                />
              </div>
            </div>
          </div>

          <!-- Floating Action Button -->
          <div class="fixed bottom-6 right-6 z-40">
            <button
              @click="openManualBookingForm"
              class="w-14 h-14 bg-yellow-400 hover:bg-yellow-500 text-slate-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
              title="Create New Booking"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
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
import BookingForm from '../components/BookingForm.vue'

const router = useRouter()
const authStore = useAuthStore()
const { user } = authStore

const venueOwnerData = ref<any>(null)
const applicationStatus = ref('Pending Verification')
const activeTab = ref('calendar')
const bookings = ref<any[]>([])
const blockedSlots = ref<any[]>([])
// const selectedBooking = ref<any>(null)
// const showBookingModal = ref(false)
const showBookingForm = ref(false)
const selectedSlots = ref<any[]>([])
const paddleFields = ref<string[]>(['Court 1', 'Court 2', 'Court 3', 'Court 4'])
const liveQuerySubscriptions = ref<any[]>([])
const isEditMode = ref(false)
const editingBooking = ref<any>(null)

const calendarOptions = computed(() => {
  const selectedSlotEvents = selectedSlots.value.map((slot) => ({
    id: `selected-${slot.id}`,
    start: slot.start,
    end: slot.end,
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB',
    textColor: '#ffffff',
    title: '✓ Selected',
    extendedProps: {
      type: 'selected',
    },
  }))

  return {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    height: 'auto',
    events: [...bookings.value, ...blockedSlots.value, ...selectedSlotEvents],
    selectable: true,
    selectMirror: false,
    dayMaxEvents: true,
    weekends: true,
    slotMinTime: '06:00:00',
    slotMaxTime: '23:00:00',
    slotDuration: '00:30:00',
    allDaySlot: false,
    eventColor: '#84CC16',
    eventTextColor: '#ffffff',
    eventBorderColor: '#65A30D',
    select: handleSlotSelect,
    eventClick: handleEventClick,
    selectAllow: () => true,
    eventOverlap: true,
    selectOverlap: true,
  }
})

const logout = async () => {
  await authStore.logout()
  router.push('/')
}

const loadBookings = async () => {
  try {
    // Try to load from Parse first, fallback to mock data
    const BookingClass = Parse.Object.extend('Booking')
    const query = new Parse.Query(BookingClass)
    const venueId = venueOwnerData.value?.objectId || 'mock-venue'
    console.log('🔍 Loading bookings for venue ID:', venueId)
    query.equalTo('venueId', venueId)

    const parseBookings = await query.find()
    console.log('📅 Found bookings:', parseBookings.length)

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
        resourceId: booking.get('court'), // For multi-field support
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
      // Fallback to mock data with multiple fields
      const today = new Date().toISOString().split('T')[0]
      bookings.value = [
        {
          id: '1',
          title: 'John & Mike vs Sarah & Lisa',
          start: `${today}T10:00:00`,
          end: `${today}T11:30:00`,
          backgroundColor: '#84CC16',
          borderColor: '#65A30D',
          resourceId: 'Court 1',
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
          title: 'Training Session',
          start: `${today}T10:00:00`,
          end: `${today}T11:30:00`,
          backgroundColor: '#FDE047',
          borderColor: '#FACC15',
          textColor: '#334155',
          resourceId: 'Court 2',
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
        {
          id: '3',
          title: 'Match Tournament',
          start: `${today}T14:00:00`,
          end: `${today}T15:30:00`,
          backgroundColor: '#84CC16',
          borderColor: '#65A30D',
          resourceId: 'Court 3',
          extendedProps: {
            type: 'booking',
            status: 'confirmed',
            court: 'Court 3',
            players: ['Player A', 'Player B', 'Player C', 'Player D'],
            contact: 'tournament@example.com',
            phone: '+62 814-1234-5678',
            price: 200000,
            paymentStatus: 'paid',
          },
        },
      ]
    }
  } catch (error) {
    console.error('Error loading bookings:', error)
    // Use mock data on error
    const today = new Date().toISOString().split('T')[0]
    bookings.value = [
      {
        id: '1',
        title: 'John & Mike vs Sarah & Lisa',
        start: `${today}T10:00:00`,
        end: `${today}T11:30:00`,
        backgroundColor: '#84CC16',
        borderColor: '#65A30D',
        resourceId: 'Court 1',
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
    const venueId = venueOwnerData.value?.objectId || 'mock-venue'
    console.log('🔍 Loading blocked slots for venue ID:', venueId)
    query.equalTo('venueId', venueId)

    const parseBlocked = await query.find()
    console.log('🚫 Found blocked slots:', parseBlocked.length)

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
  console.log('🎯 handleSlotSelect called!', selectInfo)
  const { start, end } = selectInfo

  // Add selected slot to selection array
  const slotId = `${start.toISOString()}-${end.toISOString()}`
  const existingIndex = selectedSlots.value.findIndex(
    (slot) => slot.id === slotId
  )

  if (existingIndex >= 0) {
    // Unselect slot
    selectedSlots.value.splice(existingIndex, 1)
  } else {
    // Select slot
    selectedSlots.value.push({
      id: slotId,
      start: start.toISOString(),
      end: end.toISOString(),
      startTime: start,
      endTime: end,
    })
  }

  // Clear calendar selection
  selectInfo.view.calendar.unselect()

  // Show booking form if slots are selected
  if (selectedSlots.value.length > 0) {
    showBookingForm.value = true
  }
}

const handleEventClick = async (clickInfo: any) => {
  const event = clickInfo.event

  if (event.extendedProps?.type === 'blocked') {
    if (confirm('Do you want to unblock this time slot?')) {
      await unblockSlot(event.id)
    }
  } else if (event.extendedProps?.type === 'booking') {
    // Open edit mode for booking
    editingBooking.value = {
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      ...event.extendedProps,
    }
    isEditMode.value = true
    showBookingForm.value = true
  }
}

const unblockSlot = async (eventId: string) => {
  try {
    const BlockedSlotClass = Parse.Object.extend('BlockedSlot')
    const query = new Parse.Query(BlockedSlotClass)
    const blockedSlot = await query.get(eventId)
    await blockedSlot.destroy()

    const blockIndex = blockedSlots.value.findIndex(
      (blocked) => blocked.id === eventId
    )
    if (blockIndex >= 0) {
      blockedSlots.value.splice(blockIndex, 1)
    }
  } catch (error) {
    console.error('Error unblocking slot:', error)
    alert('Failed to unblock slot. Please try again.')
  }
}

const createBooking = async (bookingData: any) => {
  try {
    if (bookingData.type === 'blocked') {
      // Create blocked slot
      const BlockedSlotClass = Parse.Object.extend('BlockedSlot')
      const blockedSlot = new BlockedSlotClass()

      blockedSlot.set('venueId', venueOwnerData.value?.objectId || 'mock-venue')
      blockedSlot.set('startTime', new Date(bookingData.start))
      blockedSlot.set('endTime', new Date(bookingData.end))
      blockedSlot.set('court', bookingData.court)
      blockedSlot.set('reason', bookingData.reason)
      blockedSlot.set('createdBy', Parse.User.current())

      await blockedSlot.save()
    } else {
      // Create regular booking
      const BookingClass = Parse.Object.extend('Booking')
      const booking = new BookingClass()

      booking.set('venueId', venueOwnerData.value?.objectId || 'mock-venue')
      booking.set('title', bookingData.title)
      booking.set('startTime', new Date(bookingData.start))
      booking.set('endTime', new Date(bookingData.end))
      booking.set('court', bookingData.court)
      booking.set('players', bookingData.players || [])
      booking.set('contact', bookingData.contact)
      booking.set('phone', bookingData.phone)
      booking.set('price', bookingData.price)
      booking.set('status', bookingData.status || 'confirmed')
      booking.set('paymentStatus', bookingData.paymentStatus || 'pending')
      booking.set('createdBy', Parse.User.current())

      await booking.save()
    }

    // Clear selected slots
    selectedSlots.value = []
    showBookingForm.value = false

    return { success: true }
  } catch (error) {
    console.error('Error creating booking/block:', error)
    alert(
      `Failed to create ${bookingData.type === 'blocked' ? 'block' : 'booking'}: ${(error as Error).message}`
    )
    return { success: false, error: (error as Error).message }
  }
}

const updateBooking = async (bookingId: string, bookingData: any) => {
  try {
    if (bookingData.type === 'blocked') {
      // Update blocked slot
      const BlockedSlotClass = Parse.Object.extend('BlockedSlot')
      const query = new Parse.Query(BlockedSlotClass)
      const blockedSlot = await query.get(bookingId)

      blockedSlot.set('startTime', new Date(bookingData.start))
      blockedSlot.set('endTime', new Date(bookingData.end))
      blockedSlot.set('court', bookingData.court)
      blockedSlot.set('reason', bookingData.reason)

      await blockedSlot.save()
    } else {
      // Update regular booking
      const BookingClass = Parse.Object.extend('Booking')
      const query = new Parse.Query(BookingClass)
      const booking = await query.get(bookingId)

      booking.set('title', bookingData.title)
      booking.set('startTime', new Date(bookingData.start))
      booking.set('endTime', new Date(bookingData.end))
      booking.set('court', bookingData.court)
      booking.set('players', bookingData.players || [])
      booking.set('contact', bookingData.contact)
      booking.set('phone', bookingData.phone)
      booking.set('price', bookingData.price)
      booking.set('status', bookingData.status)
      booking.set('paymentStatus', bookingData.paymentStatus)

      await booking.save()
    }

    // Reset edit mode
    isEditMode.value = false
    editingBooking.value = null
    showBookingForm.value = false

    return { success: true }
  } catch (error) {
    console.error('Error updating booking/block:', error)
    alert(
      `Failed to update ${bookingData.type === 'blocked' ? 'block' : 'booking'}: ${(error as Error).message}`
    )
    return { success: false, error: (error as Error).message }
  }
}

const deleteBooking = async (bookingId: string) => {
  try {
    // Try to delete as booking first, then as blocked slot
    try {
      const BookingClass = Parse.Object.extend('Booking')
      const query = new Parse.Query(BookingClass)
      const booking = await query.get(bookingId)
      await booking.destroy()
    } catch {
      // If not found as booking, try as blocked slot
      const BlockedSlotClass = Parse.Object.extend('BlockedSlot')
      const query = new Parse.Query(BlockedSlotClass)
      const blockedSlot = await query.get(bookingId)
      await blockedSlot.destroy()
    }

    // Reset edit mode
    isEditMode.value = false
    editingBooking.value = null
    showBookingForm.value = false

    return { success: true }
  } catch (error) {
    console.error('Error deleting booking/block:', error)
    alert(`Failed to delete: ${(error as Error).message}`)
    return { success: false, error: (error as Error).message }
  }
}

const clearSelection = () => {
  selectedSlots.value = []
  showBookingForm.value = false
  isEditMode.value = false
  editingBooking.value = null
}

const openManualBookingForm = () => {
  clearSelection()
  showBookingForm.value = true
}

const onCalendarMounted = () => {
  console.log('📅 FullCalendar mounted successfully')
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
    console.log('🏢 VenueOwner profile loaded:', profile ? profile.id : 'null')
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
      console.log('📋 Venue data set:', {
        id: profile.id,
        status: profile.get('status'),
        name: profile.get('venueDetails')?.name,
      })

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
/* Ensure calendar can receive mouse events */
.venue-calendar {
  pointer-events: auto !important;
}

.venue-calendar .fc {
  font-family: inherit;
  pointer-events: auto !important;
}

/* Make selection more visible */
.venue-calendar .fc-highlight {
  background: rgba(59, 130, 246, 0.3) !important;
  border: 2px dashed #3b82f6 !important;
}

/* Improve time slot hover effect */
.venue-calendar .fc-timegrid-slot:hover {
  background-color: rgba(59, 130, 246, 0.1) !important;
}

/* Style for selectable areas */
.venue-calendar .fc-timegrid-slot {
  cursor: crosshair !important;
  pointer-events: auto !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
}

.venue-calendar .fc-timegrid-slots {
  pointer-events: auto !important;
}

/* Make blocked slots more obvious */
.venue-calendar .fc-event[style*='background-color: rgb(239, 68, 68)'] {
  border: 2px solid #dc2626 !important;
  font-weight: bold;
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
