<template>
  <div class="min-h-screen bg-lime-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Top Header Row -->
        <div
          class="flex justify-between items-center h-14 border-b border-slate-100"
        >
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
          </div>
        </div>

        <!-- Tab Navigation Row -->
        <div class="flex items-center h-12">
          <nav class="flex space-x-8">
            <button
              @click="activeTab = 'calendar'"
              :class="[
                'py-3 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'calendar'
                  ? 'border-yellow-400 text-yellow-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
              ]"
            >
              📅 Calendar & Bookings
            </button>
            <button
              @click="activeTab = 'profile'"
              :class="[
                'py-3 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'profile'
                  ? 'border-yellow-400 text-yellow-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
              ]"
            >
              🏢 Venue Profile
            </button>
            <button
              @click="activeTab = 'analytics'"
              :class="[
                'py-3 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'analytics'
                  ? 'border-yellow-400 text-yellow-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
              ]"
            >
              📊 Analytics
            </button>
          </nav>
        </div>
      </div>
    </header>

    <div class="h-[calc(100vh-6.5rem)]">
      <!-- Main Content -->
      <main class="overflow-auto main-content h-full" style="position: relative; z-index: 1;">
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
                • <strong>Add Booking:</strong> Click "Add Booking" button to
                create new bookings
              </li>
              <li>
                • <strong>View Details:</strong> Click on existing bookings to
                view player details
              </li>
              <li>
                • <strong>Edit Booking:</strong> Use the edit option in booking
                details to modify
              </li>
            </ul>
          </div>

          <!-- Calendar Container -->
          <div
            class="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
          >
            <!-- Loading State -->
            <CalendarLoadingState v-if="calendarLoading" />

            <!-- Error State -->
            <CalendarErrorState
              v-else-if="calendarError"
              :error="calendarError"
              :retrying="calendarRetrying"
              @retry="retryLoad"
              @show-offline="() => {}"
            />

            <!-- Calendar -->
            <div v-else>
              <!-- Action Buttons -->
              <div class="flex justify-end items-center mb-4 space-x-2">
                <!-- Debug Test Button -->
                <button
                  @click="testModal"
                  class="inline-flex items-center px-3 py-1.5 text-sm bg-red-500 text-white hover:bg-red-600 rounded-md transition-colors"
                >
                  Test Modal
                </button>

                <button
                  @click="refreshData"
                  class="inline-flex items-center px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                >
                  <svg
                    class="w-4 h-4 mr-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh
                </button>
              </div>

              <FullCalendar
                :options="calendarOptions"
                class="venue-calendar"
                @mounted="onCalendarMounted"
              />
            </div>
          </div>

          <!-- Enhanced Booking Details Modal -->
          <!-- Debug: showBookingDetails = {{ showBookingDetails }}, selectedBookingForDetails = {{ !!selectedBookingForDetails }} -->
          <Teleport to="body">
            <BookingDetailsModal
              v-if="showBookingDetails && selectedBookingForDetails"
              :booking="selectedBookingForDetails"
              @close="closeBookingDetails"
              @edit="editBookingFromDetails"
              @delete="deleteBookingFromDetails"
            />
          </Teleport>



          <!-- Enhanced Debug Modal State -->
          <div v-if="showBookingDetails || selectedBookingForDetails" style="position: fixed; top: 10px; right: 10px; background: red; color: white; padding: 10px; z-index: 9999; font-size: 12px; max-width: 300px;">
            <strong>🐛 MODAL DEBUG INFO</strong><br>
            showBookingDetails: {{ showBookingDetails }}<br>
            selectedBookingForDetails exists: {{ !!selectedBookingForDetails }}<br>
            selectedBookingForDetails.id: {{ selectedBookingForDetails?.id }}<br>
            Both conditions met: {{ showBookingDetails && selectedBookingForDetails }}<br>
            selectedBookingForDetails.start type: {{ selectedBookingForDetails?.start ? typeof selectedBookingForDetails.start : 'undefined' }}<br>
            selectedBookingForDetails.end type: {{ selectedBookingForDetails?.end ? typeof selectedBookingForDetails.end : 'undefined' }}<br>
            <span v-if="showBookingDetails && selectedBookingForDetails" style="color: lime;">✅ Modal SHOULD render</span>
            <span v-else style="color: orange;">❌ Modal will NOT render</span>
          </div>

          <!-- Enhanced Google Calendar-Style Booking Modal -->
          <Teleport to="body">
            <!-- Enhanced Modal Backdrop with Transitions -->
            <Transition
              enter-active-class="transition-opacity duration-300 ease-out"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="transition-opacity duration-200 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <div
                v-if="showBookingForm"
                class="enhanced-modal-backdrop"
                @click.self="closeBookingForm"
              >
                <!-- Enhanced Modal Content with Transitions -->
                <Transition
                  enter-active-class="transition-all duration-300 ease-out"
                  enter-from-class="opacity-0 scale-95"
                  enter-to-class="opacity-100 scale-100"
                  leave-active-class="transition-all duration-200 ease-in"
                  leave-from-class="opacity-100 scale-100"
                  leave-to-class="opacity-0 scale-95"
                >
                  <div
                    v-if="showBookingForm"
                    class="enhanced-modal-content"
                    @click.stop
                  >
                    <!-- Enhanced Modal Header -->
                    <div class="enhanced-modal-header">
                      <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center shadow-sm">
                          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h2 class="text-xl font-semibold text-slate-900">
                            {{ isEditMode ? 'Edit Booking' : 'Create New Booking' }}
                          </h2>
                          <p class="text-sm text-slate-600 mt-0.5">
                            {{ isEditMode ? 'Update booking details' : 'Fill in the details below to create your booking' }}
                          </p>
                        </div>
                      </div>

                      <button
                        @click="closeBookingForm"
                        class="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200 hover:scale-105"
                        aria-label="Close modal"
                      >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <!-- Enhanced Modal Body -->
                    <div class="enhanced-modal-body">
                      <BookingForm
                        :selected-slots="selectedSlots"
                        :paddle-fields="paddleFields"
                        :is-edit-mode="isEditMode"
                        :editing-booking="editingBooking"
                        @create="createBooking"
                        @update="updateBooking"
                        @delete="deleteBooking"
                        @close="closeBookingForm"
                      />
                    </div>
                  </div>
                </Transition>
              </div>
            </Transition>
          </Teleport>
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
                    {{
                      (venueOwnerData.venueDetails as any)?.address ||
                      'Not provided'
                    }}
                  </dd>
                </div>
                <div
                  v-if="
                    (venueOwnerData.venueDetails as any)?.facilities?.length
                  "
                >
                  <dt class="text-sm font-medium text-slate-500">Facilities</dt>
                  <dd class="text-sm text-slate-900">
                    {{
                      (venueOwnerData.venueDetails as any).facilities.join(', ')
                    }}
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

    <!-- Enhanced Floating Action Button (FAB) with Contextual Menu -->
    <EnhancedFloatingActionButton
      v-if="activeTab === 'calendar' && applicationStatus === 'Approved'"
      @quick-booking="openBookingModal"
      @multiple-slots="openMultipleSlotBooking"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { VenueOwnerService } from '../services/venueOwnerService'
import { BookingService } from '../services/bookingService'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import BookingForm from '../components/BookingForm.vue'
import BookingDetailsModal from '../components/BookingDetailsModal.vue'
import { CalendarLoadingState, CalendarErrorState, EnhancedFloatingActionButton } from '../components/ui'
import { SeedDataService } from '../services/seedData'
import { MaBarColors } from '../config/colors'

const router = useRouter()
const authStore = useAuthStore()
const { user } = authStore

const venueOwnerData = ref<{
  objectId: string
  personalInfo?: Record<string, unknown>
  venueDetails?: { name?: string }
  legalDocs?: Record<string, unknown>
  documents?: unknown[]
  status?: string
  submittedAt?: Date
} | null>(null)
const applicationStatus = ref('Pending Verification')
const activeTab = ref('calendar')
// Direct calendar data management
const bookings = ref<
  Array<{
    id: string
    title: string
    start: Date
    end: Date
    backgroundColor: string
    borderColor: string
    textColor: string
    resourceId?: string
    extendedProps: Record<string, unknown>
  }>
>([])
const calendarLoading = ref(false)
const calendarError = ref<string | null>(null)
const calendarRetrying = ref(false)

// Load booking data and blocked slots directly
const loadBookings = async () => {
  const venueId = venueOwnerData.value?.objectId
  if (!venueId) {
    console.warn('⚠️ No venue ID available')
    return
  }

  console.log('🔍 Loading bookings and blocked slots for venue:', venueId)
  try {
    // Load both bookings and blocked slots for complete time synchronization
    const [bookingData, blockedData] = await Promise.all([
      BookingService.getBookings(venueId),
      BookingService.getBlockedSlots(venueId),
    ])

    console.log('📅 Raw booking data:', bookingData)
    console.log('🚫 Raw blocked slots:', blockedData)

    // Format bookings for calendar
    const formattedBookings = bookingData.map((booking) => {
      console.log('📞 Raw booking before formatting:', {
        id: booking.id,
        players: booking.players,
        playerPhones: booking.playerPhones,
        playerPhonesType: typeof booking.playerPhones,
        playerPhonesLength: booking.playerPhones?.length
      })

      const formatted = BookingService.formatBookingForCalendar(booking)
      console.log('📅 Formatted booking:', {
        id: formatted.id,
        start: formatted.start,
        end: formatted.end,
        duration:
          (formatted.end.getTime() - formatted.start.getTime()) /
          (1000 * 60 * 60),
        extendedProps: {
          players: formatted.extendedProps.players,
          playerPhones: formatted.extendedProps.playerPhones,
          playerPhonesType: typeof formatted.extendedProps.playerPhones,
          playerPhonesLength: formatted.extendedProps.playerPhones?.length
        }
      })
      return formatted
    })

    // Format blocked slots for calendar
    const formattedBlocked = blockedData.map((blocked) => {
      const formatted = BookingService.formatBlockedSlotForCalendar(blocked)
      console.log('🚫 Formatted blocked slot:', {
        id: formatted.id,
        start: formatted.start,
        end: formatted.end,
        duration:
          (formatted.end.getTime() - formatted.start.getTime()) /
          (1000 * 60 * 60),
      })
      return formatted
    })

    // Combine all events for complete calendar synchronization
    bookings.value = [...formattedBookings, ...formattedBlocked]

    console.log('✅ All calendar events loaded:', {
      bookings: formattedBookings.length,
      blocked: formattedBlocked.length,
      total: bookings.value.length,
    })
  } catch (error) {
    console.error('❌ Error loading calendar data:', error)
    calendarError.value =
      error instanceof Error ? error.message : 'Failed to load calendar data'
  }
}

const loadAllData = async () => {
  calendarLoading.value = true
  calendarError.value = null

  try {
    await loadBookings()
  } catch (error) {
    calendarError.value =
      error instanceof Error ? error.message : 'Failed to load calendar data'
  } finally {
    calendarLoading.value = false
  }
}

const retryLoad = async () => {
  calendarRetrying.value = true
  await loadAllData()
  calendarRetrying.value = false
}

const refreshData = async () => {
  await loadAllData()
}
// const selectedBooking = ref<any>(null)
const showBookingForm = ref(false)
const selectedSlots = ref<
  Array<{
    id: string
    start: string
    end: string
    startTime: Date
    endTime: Date
  }>
>([])
const paddleFields = ref<string[]>(['Court 1', 'Court 2', 'Court 3', 'Court 4'])
const isEditMode = ref(false)
const editingBooking = ref<{
  id: string
  title: string
  start: Date
  end: Date
  type: string
  players?: string[]
  contact?: string
  phone?: string
  price?: number
  status?: string
  paymentStatus?: string
  reason?: string
  court?: string
} | null>(null)

const isSubmitting = ref(false)
const showBookingDetails = ref(false)
const selectedBookingForDetails = ref<{
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
    phone?: string
    price?: number
    paymentStatus?: string
    reason?: string // For blocked slots
  }
} | null>(null)
// const loadingBookings = ref(false)
// const errorMessage = ref('')

const calendarOptions = computed(() => {
  console.log('📅 Computing calendar options with:', {
    bookings: bookings.value.length,
  })

  const allEvents = [...bookings.value]
  console.log('📅 All calendar events:', allEvents)
  console.log('📅 Sample event extendedProps:', allEvents[0]?.extendedProps)
  console.log('📅 Event types in calendar:', allEvents.map(e => e.extendedProps?.type))
  console.log('📅 Events being passed to FullCalendar:', allEvents.length, 'events')

  // Log each event's clickable properties
  allEvents.forEach((event, index) => {
    if (index < 3) { // Only log first 3 events to avoid spam
      console.log(`📅 Event ${index}:`, {
        id: event.id,
        title: event.title,
        type: event.extendedProps?.type,
        hasExtendedProps: !!event.extendedProps,
        clickable: true
      })
    }
  })

  return {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
    },

    height: 'auto',
    events: allEvents,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    slotMinTime: '00:00:00',
    slotMaxTime: '24:00:00',
    slotDuration: '00:30:00',
    allDaySlot: false,
    eventColor: MaBarColors.calendar.confirmed,
    eventTextColor: MaBarColors.surface,
    eventBorderColor: MaBarColors.hover.accent,

    eventClick: (clickInfo: any) => {
      console.log('🎯 FullCalendar eventClick triggered!', clickInfo)
      return handleEventClick(clickInfo)
    },
    dateSelect: handleDateSelect,
    selectAllow: () => true,
    eventOverlap: true,
    selectOverlap: true,
    // Enhanced Google Calendar-style interactions
    eventMouseEnter: (info: { el: HTMLElement }) => {
      console.log('🖱️ Mouse enter event:', info.event?.title)
      info.el.style.cursor = 'pointer'
      info.el.style.transform = 'translateY(-1px)'
      info.el.style.zIndex = '10'
    },
    eventMouseLeave: (info: { el: HTMLElement }) => {
      console.log('🖱️ Mouse leave event:', info.event?.title)
      info.el.style.cursor = 'default'
      info.el.style.transform = 'translateY(0)'
      info.el.style.zIndex = 'auto'
    },
    // Enhanced empty slot clicks for quick single-slot booking creation
    dateClick: (info: {
      dateStr: string
      date: Date
      view: { type: string }
    }) => {
      console.log('📅 Calendar slot clicked for booking:', {
        dateStr: info.dateStr,
        viewType: info.view.type,
        date: info.date,
      })

      // Only allow booking creation on time grid views for better UX
      if (info.view.type === 'dayGridMonth') {
        // For month view, just open the modal without pre-filling time
        if (!showBookingForm.value) {
          selectedSlots.value = []
          openBookingModal()
        }
        return
      }

      // Create a 1-hour slot starting from the clicked time
      const clickedDate = new Date(info.date)
      clickedDate.setMinutes(0, 0, 0) // Round to nearest hour

      // Ensure the booking starts at least 1 hour from now
      const now = new Date()
      const minStartTime = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour from now

      let startTime = new Date(clickedDate)
      if (startTime < minStartTime) {
        startTime = new Date(minStartTime)
        startTime.setMinutes(0, 0, 0) // Round to hour
      }

      // Create a 1-hour slot
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000)

      // Create selected slots data for single click
      const slotData = {
        id: `slot-${Date.now()}`,
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        startTime: startTime,
        endTime: endTime,
      }

      selectedSlots.value = [slotData]

      console.log('📅 Single click slot data:', slotData)

      // Open the booking modal with pre-filled time slot
      if (!showBookingForm.value) {
        openBookingModal()
      }
    },
  }
})

// Logout function available if needed
// const logout = async () => {
//   await authStore.logout()
//   router.push('/')
// }

// Data loading is now handled by the useCalendarData composable

const handleEventClick = async (clickInfo: any) => {
  console.log('🔥 EVENT CLICK HANDLER TRIGGERED!')
  const event = clickInfo.event
  console.log('📅 Full event object:', event)
  console.log('📅 Event ID:', event.id)
  console.log('📅 Event title:', event.title)
  console.log('📅 Event extendedProps:', event.extendedProps)
  console.log('📅 Event start:', event.start, 'Type:', typeof event.start)
  console.log('📅 Event end:', event.end, 'Type:', typeof event.end)

  // Close any existing modals first
  showBookingForm.value = false
  showBookingDetails.value = false
  selectedBookingForDetails.value = null

  // Handle different types of calendar events
  const eventType = event.extendedProps?.type || 'booking'
  console.log('📅 Detected event type:', eventType)

  if (eventType === 'booking' || eventType === 'blocked') {
    console.log('✅ Event type is valid, creating modal data...')

    try {
      // Ensure proper Date object conversion
      const startDate = event.start instanceof Date ? event.start : new Date(event.start || Date.now())
      const endDate = event.end instanceof Date ? event.end : new Date(event.end || Date.now())

      console.log('📅 Converted dates:', {
        start: startDate,
        end: endDate,
        startValid: startDate instanceof Date && !isNaN(startDate.getTime()),
        endValid: endDate instanceof Date && !isNaN(endDate.getTime())
      })

      // Create booking details object with proper Date objects
      const bookingDetails = {
        id: event.id || `event-${Date.now()}`,
        title: event.title || 'Untitled Event',
        start: startDate,
        end: endDate,
        extendedProps: {
          type: eventType,
          status: event.extendedProps?.status || (eventType === 'blocked' ? 'blocked' : 'pending'),
          court: event.extendedProps?.court || 'Unknown Court',
          players: event.extendedProps?.players || [],
          playerPhones: event.extendedProps?.playerPhones || [],
          contact: event.extendedProps?.contact || '',
          phone: event.extendedProps?.phone || '',
          price: event.extendedProps?.price || 0,
          paymentStatus: event.extendedProps?.paymentStatus || 'pending',
          reason: event.extendedProps?.reason || '', // For blocked slots
        },
      }

      console.log('📋 Created booking details object:', bookingDetails)
      console.log('📋 Booking details validation:', {
        hasId: !!bookingDetails.id,
        hasTitle: !!bookingDetails.title,
        hasValidStart: bookingDetails.start instanceof Date && !isNaN(bookingDetails.start.getTime()),
        hasValidEnd: bookingDetails.end instanceof Date && !isNaN(bookingDetails.end.getTime()),
        hasExtendedProps: !!bookingDetails.extendedProps
      })

      // Enhanced debugging for player phone data
      console.log('📞 PLAYER PHONE DEBUG:', {
        originalEventPlayerPhones: event.extendedProps?.playerPhones,
        originalEventPlayers: event.extendedProps?.players,
        bookingDetailsPlayerPhones: bookingDetails.extendedProps.playerPhones,
        bookingDetailsPlayers: bookingDetails.extendedProps.players,
        playerPhonesType: typeof bookingDetails.extendedProps.playerPhones,
        playerPhonesLength: bookingDetails.extendedProps.playerPhones?.length,
        playersLength: bookingDetails.extendedProps.players?.length
      })

      // Set the booking details first
      selectedBookingForDetails.value = bookingDetails
      console.log('📋 selectedBookingForDetails set to:', selectedBookingForDetails.value)

      // Wait a tick to ensure reactivity updates
      await new Promise(resolve => setTimeout(resolve, 10))

      // Now show the modal
      showBookingDetails.value = true
      console.log('📋 showBookingDetails set to:', showBookingDetails.value)

      // Comprehensive debugging after modal should be visible
      setTimeout(() => {
        console.log('🔍 POST-MODAL DEBUG CHECK:')
        console.log('  - showBookingDetails:', showBookingDetails.value)
        console.log('  - selectedBookingForDetails exists:', !!selectedBookingForDetails.value)
        console.log('  - Both conditions met:', showBookingDetails.value && !!selectedBookingForDetails.value)

        // Check for BookingDetailsModal specifically
        const modalElements = document.querySelectorAll('[style*="z-index: 99999"]')
        console.log('  - Elements with z-index 99999:', modalElements.length)
        modalElements.forEach((el, index) => {
          console.log(`    Element ${index}:`, el.tagName, el.className)
          const rect = el.getBoundingClientRect()
          console.log(`    Position:`, { top: rect.top, left: rect.left, width: rect.width, height: rect.height, visible: rect.width > 0 && rect.height > 0 })
        })

        // Check for any elements that might contain BookingDetailsModal
        const teleportedElements = document.body.children
        console.log('  - Direct body children count:', teleportedElements.length)
        for (let i = 0; i < teleportedElements.length; i++) {
          const el = teleportedElements[i] as HTMLElement
          if (el.tagName === 'DIV' && el.style && el.style.position === 'fixed') {
            console.log(`    Fixed positioned div ${i}:`, el.className, el.style.zIndex)
          }
        }
      }, 200)

      console.log('📋 Showing details for:', {
        type: eventType,
        title: event.title,
        status: event.extendedProps?.status,
        court: event.extendedProps?.court,
      })
    } catch (error) {
      console.error('❌ Error in handleEventClick:', error)
      console.error('❌ Event data that caused error:', event)
    }
  } else {
    console.log('⚠️ Unknown event type clicked:', eventType)
    console.log('⚠️ Available extendedProps keys:', Object.keys(event.extendedProps || {}))
  }
}

const handleDateSelect = (selectInfo: {
  start: Date
  end: Date
  startStr: string
  endStr: string
  allDay: boolean
  view: { type: string }
}) => {
  console.log('📅 Time slots selected:', {
    start: selectInfo.start,
    end: selectInfo.end,
    startStr: selectInfo.startStr,
    endStr: selectInfo.endStr,
    viewType: selectInfo.view.type,
  })

  // Only allow booking creation on time grid views for better UX
  if (selectInfo.view.type === 'dayGridMonth') {
    // For month view, just open the modal without pre-filling time
    if (!showBookingForm.value) {
      selectedSlots.value = []
      openBookingModal()
    }
    return
  }

  // Ensure the booking starts at least 1 hour from now
  const now = new Date()
  const minStartTime = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour from now

  let startTime = new Date(selectInfo.start)
  let endTime = new Date(selectInfo.end)

  if (startTime < minStartTime) {
    const timeDiff = endTime.getTime() - startTime.getTime()
    startTime = new Date(minStartTime)
    endTime = new Date(startTime.getTime() + timeDiff)
  }

  // Create selected slots data
  const slotData = {
    id: `slot-${Date.now()}`,
    start: startTime.toISOString(),
    end: endTime.toISOString(),
    startTime: startTime,
    endTime: endTime,
  }

  selectedSlots.value = [slotData]

  console.log('📅 Selected slot data:', slotData)

  // Open the booking modal with pre-filled time slots
  if (!showBookingForm.value) {
    openBookingModal()
  }
}

const createBooking = async (bookingData: Record<string, unknown>) => {
  try {
    isSubmitting.value = true
    console.log('📝 Creating booking with data:', bookingData)

    const result = await createSingleBooking(bookingData)

    if (result.success) {
      await refreshCalendarData()
      // Close both modals to ensure proper cleanup
      closeBookingModal()
      closeBookingForm()
      alert('Booking created successfully!')
    } else {
      alert(`Failed to create booking: ${result.error}`)
    }

    return result
  } catch (error) {
    console.error('Error in createBooking:', error)
    alert(`Failed to create booking: ${(error as Error).message}`)
    return { success: false, error: (error as Error).message }
  } finally {
    isSubmitting.value = false
  }
}

const createSingleBooking = async (bookingData: Record<string, unknown>) => {
  try {
    const venueId = venueOwnerData.value?.objectId
    if (!venueId) {
      throw new Error('No venue ID available')
    }

    // Ensure exact time synchronization
    const startTime = new Date(bookingData.start as string)
    const endTime = new Date(bookingData.end as string)

    // Validate booking duration (1-24 hours)
    const duration = endTime.getTime() - startTime.getTime()
    const durationHours = duration / (1000 * 60 * 60)

    console.log('⏰ Booking time validation:', {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationHours: durationHours,
      isValid: durationHours >= 1 && durationHours <= 24,
    })

    if (durationHours < 1 || durationHours > 24) {
      throw new Error(
        `Booking duration must be between 1 and 24 hours. Current duration: ${Math.round(durationHours)} hours`
      )
    }

    // Create regular booking using BookingService
    const bookingPayload: any = {
      venueId,
      title: bookingData.title as string,
      startTime,
      endTime,
      court: (bookingData.court as string) || '',
      players: (bookingData.players as string[]) || [],
      playerPhones: (bookingData.playerPhones as string[]) || [],
      price: bookingData.price as number,
      status:
        (bookingData.status as 'confirmed' | 'pending' | 'cancelled') ||
        'confirmed',
      paymentStatus:
        (bookingData.paymentStatus as 'pending' | 'paid' | 'refunded') ||
        'pending',
    }

    // Automatically populate venue contact email from authenticated venue owner profile
    // Note: Phone contact is removed - only player phone numbers are used
    if (venueOwnerData.value?.personalInfo?.email) {
      bookingPayload.contact = venueOwnerData.value.personalInfo.email as string
    }

    await BookingService.createBooking(bookingPayload)

    console.log('✓ Booking created successfully with exact 24h duration')
    return { success: true }
  } catch (error) {
    console.error('Error creating booking:', error)
    return { success: false, error: (error as Error).message }
  }
}

const updateBooking = async (
  bookingId: string,
  bookingData: Record<string, unknown>
) => {
  try {
    isSubmitting.value = true

    // Update regular booking using BookingService
    await BookingService.updateBooking(bookingId, {
      title: bookingData.title as string,
      startTime: new Date(bookingData.start as string),
      endTime: new Date(bookingData.end as string),
      court: (bookingData.court as string) || '',
      players: (bookingData.players as string[]) || [],
      playerPhones: (bookingData.playerPhones as string[]) || [],
      contact: bookingData.contact as string,
      // Note: Venue phone contact removed - only player phone numbers are used
      price: bookingData.price as number,
      status: bookingData.status as 'confirmed' | 'pending' | 'cancelled',
      paymentStatus: bookingData.paymentStatus as
        | 'pending'
        | 'paid'
        | 'refunded',
    })

    await refreshCalendarData()
    // Close both modals to ensure proper cleanup
    closeBookingModal()
    closeBookingForm()
    alert('Booking updated successfully!')

    return { success: true }
  } catch (error) {
    console.error('Error updating booking:', error)
    alert(`Failed to update booking: ${(error as Error).message}`)
    return { success: false, error: (error as Error).message }
  } finally {
    isSubmitting.value = false
  }
}

const deleteBooking = async (bookingId: string) => {
  if (
    !confirm(
      'Are you sure you want to delete this booking? This action cannot be undone.'
    )
  ) {
    return { success: false, cancelled: true }
  }

  try {
    isSubmitting.value = true

    await BookingService.deleteBooking(bookingId)

    await refreshCalendarData()
    // Close both modals to ensure proper cleanup
    closeBookingModal()
    closeBookingForm()
    alert('Booking deleted successfully!')

    return { success: true }
  } catch (error) {
    console.error('Error deleting booking:', error)
    alert(`Failed to delete booking: ${(error as Error).message}`)
    return { success: false, error: (error as Error).message }
  } finally {
    isSubmitting.value = false
  }
}

const deleteBlockedSlot = async (slotId: string) => {
  if (
    !confirm(
      'Are you sure you want to remove this blocked slot? This action cannot be undone.'
    )
  ) {
    return { success: false, cancelled: true }
  }

  try {
    isSubmitting.value = true

    await BookingService.deleteBlockedSlot(slotId)

    await refreshCalendarData()
    // Close both modals to ensure proper cleanup
    closeBookingModal()
    closeBookingForm()
    alert('Blocked slot removed successfully!')

    return { success: true }
  } catch (error) {
    console.error('Error deleting blocked slot:', error)
    alert(`Failed to remove blocked slot: ${(error as Error).message}`)
    return { success: false, error: (error as Error).message }
  } finally {
    isSubmitting.value = false
  }
}

const closeBookingForm = () => {
  console.log('🚪 Closing booking form')
  showBookingForm.value = false
  isEditMode.value = false
  editingBooking.value = null
}

const refreshCalendarData = async () => {
  await refreshData()
}



const openBookingModal = () => {
  console.log('📝 Opening enhanced booking modal')
  // Close any other modals first
  showBookingDetails.value = false

  // Reset form state
  isEditMode.value = false
  editingBooking.value = null
  selectedSlots.value = []

  // Show the enhanced booking modal
  showBookingForm.value = true
  console.log('📝 Enhanced booking modal opened, showBookingForm:', showBookingForm.value)

  // Enhanced Debug: Check modal positioning and DOM structure
  setTimeout(() => {
    const modalElement = document.querySelector('.enhanced-modal-backdrop')
    console.log('🔍 Modal element found:', modalElement)

    if (modalElement) {
      const computedStyle = window.getComputedStyle(modalElement)
      const rect = modalElement.getBoundingClientRect()

      console.log('🎨 Modal computed styles:')
      console.log('  - position:', computedStyle.position)
      console.log('  - display:', computedStyle.display)
      console.log('  - z-index:', computedStyle.zIndex)
      console.log('  - top:', computedStyle.top)
      console.log('  - left:', computedStyle.left)
      console.log('  - width:', computedStyle.width)
      console.log('  - height:', computedStyle.height)

      console.log('📐 Modal bounding rect:')
      console.log('  - top:', rect.top)
      console.log('  - left:', rect.left)
      console.log('  - width:', rect.width)
      console.log('  - height:', rect.height)

      console.log('🌍 Viewport dimensions:')
      console.log('  - window.innerWidth:', window.innerWidth)
      console.log('  - window.innerHeight:', window.innerHeight)

      console.log('🏠 Modal parent element:', modalElement.parentElement)
      console.log('🏠 Modal parent tag:', modalElement.parentElement?.tagName)

      // Check if modal is actually teleported to body
      const isInBody = document.body.contains(modalElement) && modalElement.parentElement === document.body
      console.log('📡 Modal teleported to body:', isInBody)
    }
  }, 100)
}

const closeBookingModal = () => {
  console.log('🚪 Closing enhanced booking modal')
  showBookingForm.value = false
  isEditMode.value = false
  editingBooking.value = null
}

const openMultipleSlotBooking = () => {
  console.log('📅 Opening multiple slot booking')
  // For now, open the enhanced booking modal
  // This can be enhanced later to support multiple time slots
  openBookingModal()
}

const closeBookingDetails = () => {
  showBookingDetails.value = false
  selectedBookingForDetails.value = null
}

// Debug function to test modal
const testModal = () => {
  console.log('🧪 Testing modal manually...')

  // Reset first
  showBookingDetails.value = false
  selectedBookingForDetails.value = null

  // Create test data with proper Date objects
  const testBooking = {
    id: 'test-123',
    title: 'Test Booking',
    start: new Date(),
    end: new Date(Date.now() + 60 * 60 * 1000),
    extendedProps: {
      type: 'booking',
      status: 'confirmed',
      court: 'Court 1',
      players: ['Test Player 1', 'Test Player 2', 'Test Player 3'],
      playerPhones: ['+1234567890', '', '+0987654321'], // Test with some phones missing
      contact: 'test@example.com',
      price: 150000,
      paymentStatus: 'paid'
    }
  }

  console.log('🧪 Test booking object:', testBooking)
  console.log('🧪 Test booking validation:', {
    hasId: !!testBooking.id,
    hasTitle: !!testBooking.title,
    hasValidStart: testBooking.start instanceof Date && !isNaN(testBooking.start.getTime()),
    hasValidEnd: testBooking.end instanceof Date && !isNaN(testBooking.end.getTime()),
    hasExtendedProps: !!testBooking.extendedProps
  })

  selectedBookingForDetails.value = testBooking

  setTimeout(() => {
    showBookingDetails.value = true
    console.log('🧪 Modal state set:', {
      showBookingDetails: showBookingDetails.value,
      selectedBookingForDetails: !!selectedBookingForDetails.value,
      bothConditions: showBookingDetails.value && !!selectedBookingForDetails.value
    })

    // Check DOM after a delay
    setTimeout(() => {
      const modals = document.querySelectorAll('[style*="z-index: 99999"], [style*="z-index: 100000"]')
      console.log('🧪 Modals found after test:', modals.length)
      modals.forEach((modal, index) => {
        console.log(`🧪 Modal ${index}:`, modal.tagName, modal.textContent?.substring(0, 50))
      })
    }, 100)
  }, 10)
}

const editBookingFromDetails = () => {
  if (
    selectedBookingForDetails.value &&
    selectedBookingForDetails.value.extendedProps
  ) {
    editingBooking.value = {
      id: selectedBookingForDetails.value.id,
      title: selectedBookingForDetails.value.title,
      start: selectedBookingForDetails.value.start,
      end: selectedBookingForDetails.value.end,
      type: 'booking',
      players:
        (selectedBookingForDetails.value.extendedProps.players as string[]) ||
        [],
      contact:
        (selectedBookingForDetails.value.extendedProps.contact as string) || '',
      phone:
        (selectedBookingForDetails.value.extendedProps.phone as string) || '',
      price:
        (selectedBookingForDetails.value.extendedProps.price as number) || 0,
      status:
        (selectedBookingForDetails.value.extendedProps.status as string) ||
        'confirmed',
      paymentStatus:
        (selectedBookingForDetails.value.extendedProps
          .paymentStatus as string) || 'pending',
      court:
        (selectedBookingForDetails.value.extendedProps.court as string) || '',
    }
    isEditMode.value = true
    showBookingDetails.value = false
    // Use the enhanced modal for editing
    showBookingForm.value = true
  }
}

const deleteBookingFromDetails = async () => {
  if (selectedBookingForDetails.value?.id) {
    const booking = selectedBookingForDetails.value
    const isBlockedSlot = booking.extendedProps?.type === 'blocked'

    // Use appropriate deletion method based on booking type
    if (isBlockedSlot) {
      await deleteBlockedSlot(booking.id)
    } else {
      await deleteBooking(booking.id)
    }
    closeBookingDetails()
  }
}

const onCalendarMounted = () => {
  console.log('📅 FullCalendar mounted successfully')

  // Add styling for past time slots
  setTimeout(() => {
    const calendarEl = document.querySelector('.venue-calendar')
    if (calendarEl) {
      console.log('🔍 Adding past time slot styling')

      // Function to mark past time slots
      const markPastTimeSlots = () => {
        const now = new Date()
        const timeSlots = calendarEl.querySelectorAll('.fc-timegrid-slot[data-time]')

        timeSlots.forEach((slot: Element) => {
          const timeAttr = slot.getAttribute('data-time')
          if (timeAttr) {
            // Get the current view date and combine with time
            const currentViewDate = new Date()
            const [hours, minutes] = timeAttr.split(':').map(Number)
            const slotDateTime = new Date(currentViewDate)
            slotDateTime.setHours(hours, minutes, 0, 0)

            if (slotDateTime <= now) {
              slot.classList.add('fc-slot-past')
            } else {
              slot.classList.remove('fc-slot-past')
            }
          }
        })
      }

      // Mark past slots initially
      markPastTimeSlots()

      // Re-mark past slots when view changes or time passes
      const observer = new MutationObserver(() => {
        markPastTimeSlots()
      })

      observer.observe(calendarEl, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-time']
      })

      // Update every minute to handle time progression
      setInterval(markPastTimeSlots, 60000)
    }
  }, 1000)
}

// LiveQuery management is now handled by the useCalendarData composable

onMounted(async () => {
  try {
    const profile = await VenueOwnerService.getVenueOwnerProfile()
    console.log('🏢 VenueOwner profile loaded:', profile ? profile.id : 'null')
    if (profile && profile.id) {
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
        case 'approved': {
          applicationStatus.value = 'Approved'
          activeTab.value = 'calendar'

          // Check if venue has bookings, if not create sample data for development
          const hasBookings = await SeedDataService.hasBookings(profile.id)
          if (!hasBookings) {
            console.log(
              '🌱 No bookings found, creating sample data for development'
            )
            await SeedDataService.createSampleBookings(profile.id)
          }

          // Load calendar data directly
          console.log(
            '🚀 Loading calendar data for approved venue:',
            profile.id
          )
          await loadAllData()
          break
        }
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

// Cleanup is now handled by the useCalendarData composable
</script>

<style>
/* Enhanced Google Calendar-style CSS */
.venue-calendar {
  pointer-events: auto !important;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.venue-calendar .fc {
  font-family: inherit;
  pointer-events: auto !important;
}

/* Enhanced selection highlighting */
.venue-calendar .fc-highlight {
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.15),
    rgba(99, 102, 241, 0.15)
  ) !important;
  border: 2px dashed #3b82f6 !important;
  border-radius: 4px !important;
  animation: pulse-selection 1.5s ease-in-out infinite;
}

@keyframes pulse-selection {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

/* Google Calendar-style time slot hover */
.venue-calendar .fc-timegrid-slot {
  cursor: pointer !important;
  pointer-events: auto !important;
  border: 1px solid rgba(0, 0, 0, 0.04) !important;
  transition: all 0.15s ease !important;
  position: relative;
}

.venue-calendar .fc-timegrid-slot:hover {
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.08),
    rgba(99, 102, 241, 0.08)
  ) !important;
  border-color: rgba(59, 130, 246, 0.2) !important;
}

.venue-calendar .fc-timegrid-slot:hover::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #3b82f6;
  opacity: 0.6;
}

.venue-calendar .fc-timegrid-slots {
  pointer-events: auto !important;
}

/* Enhanced event styling */
.venue-calendar .fc-event {
  border-radius: 6px !important;
  border-width: 1px !important;
  font-weight: 500 !important;
  font-size: 12px !important;
  padding: 2px 6px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.2s ease !important;
  cursor: pointer !important;
  pointer-events: auto !important;
}

.venue-calendar .fc-event:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  z-index: 10 !important;
}

/* Blocked slots with enhanced styling */
.venue-calendar .fc-event[style*='background-color: rgb(239, 68, 68)'] {
  background: linear-gradient(135deg, #ef4444, #dc2626) !important;
  border: 2px solid #dc2626 !important;
  font-weight: 600 !important;
  color: white !important;
}

/* Confirmed bookings */
.venue-calendar .fc-event[style*='background-color: rgb(132, 204, 22)'] {
  background: linear-gradient(135deg, #84cc16, #65a30d) !important;
  border: 1px solid #65a30d !important;
  color: white !important;
}

/* Pending bookings */
.venue-calendar .fc-event[style*='background-color: rgb(253, 224, 71)'] {
  background: linear-gradient(135deg, #fde047, #facc15) !important;
  border: 1px solid #eab308 !important;
  color: #334155 !important;
}

/* Selected slots styling */
.venue-calendar .fc-event[style*='background-color: rgb(59, 130, 246)'] {
  background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
  border: 2px solid #2563eb !important;
  color: white !important;
  animation: selected-pulse 2s ease-in-out infinite;
}

@keyframes selected-pulse {
  0%,
  100% {
    opacity: 0.9;
  }
  50% {
    opacity: 1;
  }
}

/* Enhanced toolbar buttons */
.venue-calendar .fc-button-primary {
  background: linear-gradient(135deg, #fde047, #facc15) !important;
  border: 1px solid #eab308 !important;
  color: #334155 !important;
  font-weight: 500 !important;
  border-radius: 6px !important;
  padding: 6px 12px !important;
  transition: all 0.2s ease !important;
}

.venue-calendar .fc-button-primary:hover {
  background: linear-gradient(135deg, #facc15, #eab308) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(234, 179, 8, 0.3) !important;
}

.venue-calendar .fc-button-primary:disabled {
  background: #f1f5f9 !important;
  border-color: #cbd5e1 !important;
  color: #94a3b8 !important;
  transform: none !important;
  box-shadow: none !important;
}

.venue-calendar .fc-today-button {
  background: linear-gradient(135deg, #84cc16, #65a30d) !important;
  border: 1px solid #4d7c0f !important;
  color: white !important;
  font-weight: 500 !important;
}

.venue-calendar .fc-today-button:hover {
  background: linear-gradient(135deg, #65a30d, #4d7c0f) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(101, 163, 13, 0.3) !important;
}

/* Enhanced header styling */
.venue-calendar .fc-toolbar {
  margin-bottom: 1.5rem !important;
}

.venue-calendar .fc-toolbar-title {
  font-size: 1.5rem !important;
  font-weight: 600 !important;
  color: #1f2937 !important;
}

/* Time axis styling */
.venue-calendar .fc-timegrid-axis {
  font-size: 11px !important;
  color: #6b7280 !important;
  font-weight: 500 !important;
}

/* Day header styling */
.venue-calendar .fc-col-header-cell {
  background: #f8fafc !important;
  border-color: #e2e8f0 !important;
  font-weight: 600 !important;
  color: #374151 !important;
}

/* Today column highlighting */
.venue-calendar .fc-day-today {
  background: rgba(132, 204, 22, 0.05) !important;
}

/* Responsive improvements */
@media (max-width: 768px) {
  .venue-calendar .fc-toolbar {
    flex-direction: column !important;
    gap: 0.5rem !important;
  }

  .venue-calendar .fc-toolbar-chunk {
    display: flex !important;
    justify-content: center !important;
  }

  .venue-calendar .fc-button {
    padding: 4px 8px !important;
    font-size: 12px !important;
  }

  .venue-calendar .fc-toolbar-title {
    font-size: 1.25rem !important;
    text-align: center !important;
  }
}

/* Safe area for mobile devices with FAB consideration */
@supports (padding: max(0px)) {
  .venue-calendar {
    padding-bottom: max(5rem, env(safe-area-inset-bottom)) !important;
  }

  .fixed.bottom-6.right-6 {
    bottom: max(1rem, env(safe-area-inset-bottom)) !important;
  }
}

/* Enhanced flexible duration booking calendar styles */
.venue-calendar .fc-timegrid-event {
  border-radius: 8px !important;
  border-width: 2px !important;
  font-weight: 600 !important;
  font-size: 11px !important;
  padding: 4px 8px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
  transition: all 0.3s ease !important;
  min-height: 20px !important;
}

/* Long duration booking specific styling (12+ hours) */
.venue-calendar .fc-event[title*='(24h)'],
.venue-calendar .fc-event[title*='(12h)'] {
  border-left-width: 4px !important;
  background: linear-gradient(
    135deg,
    var(--bg-color),
    var(--bg-color-dark)
  ) !important;
  position: relative;
}

.venue-calendar .fc-event[title*='(24h)']:before {
  content: '24h';
  position: absolute;
  top: 2px;
  right: 4px;
  background: rgba(255, 255, 255, 0.9);
  color: #334155;
  font-size: 9px;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 3px;
  line-height: 1;
}

/* Court-specific 24-hour booking colors */
.venue-calendar .fc-event[style*='background-color: rgb(59, 130, 246)'] {
  --bg-color: #3b82f6;
  --bg-color-dark: #2563eb;
}

.venue-calendar .fc-event[style*='background-color: rgb(16, 185, 129)'] {
  --bg-color: #10b981;
  --bg-color-dark: #059669;
}

.venue-calendar .fc-event[style*='background-color: rgb(245, 158, 11)'] {
  --bg-color: #f59e0b;
  --bg-color-dark: #d97706;
}

.venue-calendar .fc-event[style*='background-color: rgb(239, 68, 68)'] {
  --bg-color: #ef4444;
  --bg-color-dark: #dc2626;
}

/* Enhanced FAB styling for flexible duration bookings with Google Calendar design */
.fixed.bottom-6.right-6 {
  filter: drop-shadow(0 10px 25px rgba(0, 0, 0, 0.15));
}

.fixed.bottom-6.right-6 button {
  box-shadow:
    0 8px 25px rgba(253, 224, 71, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  position: relative;
}

.fixed.bottom-6.right-6 button:hover {
  box-shadow:
    0 15px 40px rgba(253, 224, 71, 0.6),
    0 8px 20px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
}

.fixed.bottom-6.right-6 button:active {
  box-shadow:
    0 5px 15px rgba(253, 224, 71, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
}

/* Enhanced tooltip styling */
.fixed.bottom-6.right-6 .group:hover .absolute.bottom-full {
  animation: tooltip-appear 0.2s ease-out;
}

@keyframes tooltip-appear {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive FAB sizing for optimal visibility */
.fab-button {
  /* Base size for desktop (1920px+) */
  width: 4rem;
  height: 4rem;
}

.fab-button svg {
  width: 1.75rem;
  height: 1.75rem;
}

/* Large desktop (1440px-1919px) */
@media (max-width: 1919px) and (min-width: 1440px) {
  .fab-button {
    width: 3.75rem;
    height: 3.75rem;
  }
  .fab-button svg {
    width: 1.625rem;
    height: 1.625rem;
  }
}

/* Standard desktop (1024px-1439px) */
@media (max-width: 1439px) and (min-width: 1024px) {
  .fab-button {
    width: 3.5rem;
    height: 3.5rem;
  }
  .fab-button svg {
    width: 1.5rem;
    height: 1.5rem;
  }
}

/* Tablet landscape (768px-1023px) */
@media (max-width: 1023px) and (min-width: 768px) {
  .fixed.bottom-6.right-6 {
    bottom: 1.5rem !important;
    right: 1.5rem !important;
  }
  .fab-button {
    width: 3.25rem;
    height: 3.25rem;
  }
  .fab-button svg {
    width: 1.375rem;
    height: 1.375rem;
  }
}

/* Tablet portrait and mobile landscape (640px-767px) */
@media (max-width: 767px) and (min-width: 640px) {
  .fixed.bottom-6.right-6 {
    bottom: 1.25rem !important;
    right: 1.25rem !important;
  }
  .fab-button {
    width: 3rem;
    height: 3rem;
  }
  .fab-button svg {
    width: 1.25rem;
    height: 1.25rem;
  }
}

/* Mobile portrait (320px-639px) */
@media (max-width: 639px) {
  .fixed.bottom-6.right-6 {
    bottom: 1rem !important;
    right: 1rem !important;
  }
  .fab-button {
    width: 2.75rem;
    height: 2.75rem;
  }
  .fab-button svg {
    width: 1.125rem;
    height: 1.125rem;
  }
}

/* Very small screens (below 320px) */
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

/* Enhanced accessibility for FAB */
.fixed.bottom-6.right-6 button:focus {
  outline: none;
  box-shadow:
    0 15px 40px rgba(253, 224, 71, 0.6),
    0 8px 20px rgba(0, 0, 0, 0.2),
    0 0 0 3px rgba(59, 130, 246, 0.5) !important;
}

.fixed.bottom-6.right-6 button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Enhanced Modal Styles - Bulletproof Viewport Centering */
/* Target modals teleported to body with highest specificity */
body > .enhanced-modal-backdrop,
body .enhanced-modal-backdrop,
.enhanced-modal-backdrop {
  /* Force fixed positioning to viewport */
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  height: 100dvh !important;

  /* Background and z-index */
  background-color: rgba(0, 0, 0, 0.5) !important;
  z-index: 99999 !important;

  /* Perfect centering with CSS Grid */
  display: grid !important;
  place-items: center !important;
  place-content: center !important;

  /* Padding and overflow */
  padding: 1rem !important;
  box-sizing: border-box !important;
  overflow-y: auto !important;

  /* Reset all possible inherited styles */
  margin: 0 !important;
  transform: none !important;
  translate: none !important;
  scale: none !important;
  rotate: none !important;
  isolation: isolate !important;

  /* Ensure it's always on top */
  contain: layout style paint !important;

  /* Additional properties to ensure proper positioning */
  float: none !important;
  clear: both !important;
}

body > .enhanced-modal-backdrop .enhanced-modal-content,
body .enhanced-modal-content,
.enhanced-modal-content {
  background-color: white !important;
  border-radius: 1rem !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
  max-width: 42rem !important;
  width: 100% !important;
  max-height: 90vh !important;
  max-height: 90dvh !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
  position: relative !important;
  box-sizing: border-box !important;
  
  /* Reset positioning to ensure grid centering works */
  margin: 0 !important;
  transform: none !important;
  translate: none !important;
  scale: none !important;
  rotate: none !important;

  /* Override any Tailwind transform classes */
  --tw-translate-x: 0 !important;
  --tw-translate-y: 0 !important;
  --tw-scale-x: 1 !important;
  --tw-scale-y: 1 !important;
  --tw-rotate: 0 !important;

  /* Ensure proper grid child behavior */
  justify-self: center !important;
  align-self: center !important;
}

.enhanced-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgb(226 232 240);
  background: linear-gradient(to right, rgb(254 249 195), rgb(255 237 213));
}

/* Enhanced close button styling */
.enhanced-modal-header button[aria-label="Close modal"] {
  min-width: 2.5rem;
  min-height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.enhanced-modal-header button[aria-label="Close modal"] svg {
  width: 1.5rem !important;
  height: 1.5rem !important;
  stroke-width: 2.5;
}

.enhanced-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

/* Ensure proper centering on all devices */
@media (max-height: 600px) {
  .enhanced-modal-content {
    max-height: 95vh !important;
    max-height: 95dvh !important;
  }

  .enhanced-modal-backdrop {
    /* Keep centered even on short screens */
    place-items: center !important;
    padding: 1rem !important;
    overflow-y: auto !important;
  }
}

@media (max-width: 640px) {
  .enhanced-modal-backdrop {
    padding: 0.5rem;
    /* Ensure centering on mobile */
    place-items: center;
  }

  .enhanced-modal-content {
    max-height: 95vh;
    max-height: 95dvh;
    border-radius: 0.75rem;
    /* Ensure mobile content doesn't overflow */
    min-height: 0;
  }

  .enhanced-modal-header {
    padding: 1rem;
    flex-shrink: 0;
  }

  /* Ensure close button remains properly sized on mobile */
  .enhanced-modal-header button[aria-label="Close modal"] {
    min-width: 2.25rem;
    min-height: 2.25rem;
    padding: 0.5rem;
  }

  .enhanced-modal-header button[aria-label="Close modal"] svg {
    width: 1.25rem !important;
    height: 1.25rem !important;
  }

  .enhanced-modal-body {
    padding: 1rem;
    flex: 1;
    min-height: 0;
  }
}

/* Very small screens */
@media (max-width: 480px) {
  .enhanced-modal-backdrop {
    padding: 0.25rem;
  }

  .enhanced-modal-content {
    max-height: 98vh;
    max-height: 98dvh;
    border-radius: 0.5rem;
  }

  /* Ensure close button remains accessible on very small screens */
  .enhanced-modal-header button[aria-label="Close modal"] {
    min-width: 2rem;
    min-height: 2rem;
    padding: 0.375rem;
  }

  .enhanced-modal-header button[aria-label="Close modal"] svg {
    width: 1.125rem !important;
    height: 1.125rem !important;
  }
}

/* Landscape orientation on mobile */
@media (max-height: 500px) and (orientation: landscape) {
  .enhanced-modal-backdrop {
    /* Keep centered even in landscape */
    place-items: center !important;
    padding: 0.5rem !important;
    overflow-y: auto !important;
  }

  .enhanced-modal-content {
    max-height: 90vh !important;
    max-height: 90dvh !important;
  }
}

/* Past time slots styling - make them visually disabled */
.venue-calendar .fc-timegrid-slot[data-time] {
  position: relative;
}

/* Style for past time slots - grayed out and non-interactive */
.venue-calendar .fc-timegrid-slot.fc-slot-past {
  background-color: #f8fafc !important;
  opacity: 0.5 !important;
  pointer-events: none !important;
  cursor: not-allowed !important;
}

.venue-calendar .fc-timegrid-slot.fc-slot-past::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 2px,
    rgba(148, 163, 184, 0.1) 2px,
    rgba(148, 163, 184, 0.1) 4px
  );
  pointer-events: none;
}

/* Disable selection highlighting for past slots */
.venue-calendar .fc-highlight.fc-highlight-past {
  background-color: transparent !important;
  opacity: 0.3 !important;
}

/* Make past time labels appear disabled */
.venue-calendar .fc-timegrid-axis-cushion {
  color: #94a3b8;
}
</style>
