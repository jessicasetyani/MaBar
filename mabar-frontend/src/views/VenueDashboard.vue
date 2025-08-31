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
      <main class="overflow-auto main-content h-full">
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
              <div class="flex justify-between items-center mb-4">
                <button
                  @click="handleFABClick"
                  class="inline-flex items-center px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-800 rounded-lg font-medium transition-colors"
                >
                  <svg
                    class="w-4 h-4 mr-2"
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
                  Add Booking
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

          <!-- Booking Details Modal -->
          <BookingDetailsModal
            v-if="showBookingDetails && selectedBookingForDetails"
            :booking="selectedBookingForDetails"
            @close="closeBookingDetails"
            @edit="editBookingFromDetails"
            @delete="deleteBookingFromDetails"
          />

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

    <!-- Fixed FAB for Creating Bookings -->
    <div
      v-if="activeTab === 'calendar' && applicationStatus === 'Approved'"
      class="fab-container fixed right-6 bottom-6 z-50"
    >
      <!-- Quick Create Popover -->
      <div
        v-if="showQuickCreate"
        class="absolute bottom-16 right-0 bg-white rounded-xl shadow-2xl border border-slate-200 p-5 w-80 z-50 transform transition-all duration-200 scale-100"
        @click.stop
      >
        <!-- Popover Header -->
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center space-x-2">
            <div
              class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center"
            >
              <span class="text-yellow-600 text-sm">⚡</span>
            </div>
            <h3 class="font-semibold text-slate-900">Quick Create</h3>
          </div>
          <button
            @click="showQuickCreate = false"
            class="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
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

        <!-- Quick Form -->
        <form @submit.prevent="handleQuickCreate" class="space-y-4">
          <!-- Court Selection with Visual Indicators -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2"
              >Court</label
            >
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="field in paddleFields"
                :key="field"
                type="button"
                @click="quickCreateData.court = field"
                :class="[
                  'p-3 rounded-lg border-2 text-sm font-medium transition-all',
                  quickCreateData.court === field
                    ? 'border-yellow-400 bg-yellow-50 text-yellow-800'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50',
                ]"
              >
                {{ field }}
              </button>
            </div>
          </div>

          <!-- Title with Smart Suggestions -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2"
              >Title</label
            >
            <input
              v-model="quickCreateData.title"
              type="text"
              placeholder="e.g., Training Session, Match Game"
              class="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              required
            />
            <!-- Quick Suggestions -->
            <div class="flex flex-wrap gap-1 mt-2">
              <button
                v-for="suggestion in [
                  'Training',
                  'Match',
                  'Tournament',
                  'Private',
                ]"
                :key="suggestion"
                type="button"
                @click="quickCreateData.title = suggestion + ' Session'"
                class="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
              >
                {{ suggestion }}
              </button>
            </div>
          </div>

          <!-- Time Selection -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1"
                >Duration</label
              >
              <select
                v-model="quickCreateData.duration"
                class="w-full px-2 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option :value="60">1 hour</option>
                <option :value="90">1.5 hours</option>
                <option :value="120">2 hours</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1"
                >Start Time</label
              >
              <select
                v-model="quickCreateData.startHour"
                class="w-full px-2 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option
                  v-for="hour in availableHours"
                  :key="hour"
                  :value="hour"
                >
                  {{ hour }}:00
                </option>
              </select>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex space-x-2 pt-2">
            <button
              type="submit"
              :disabled="!quickCreateData.court || !quickCreateData.title"
              class="flex-1 px-4 py-2.5 bg-yellow-400 text-slate-800 rounded-lg hover:bg-yellow-500 disabled:bg-slate-200 disabled:text-slate-400 text-sm font-semibold transition-colors"
            >
              Create Booking
            </button>
            <button
              type="button"
              @click="openFullForm"
              class="px-4 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
            >
              More Options
            </button>
          </div>
        </form>
      </div>

      <!-- Multi-Court Selection Panel -->
      <div
        v-if="showMultiCourtPanel"
        class="absolute bottom-16 right-0 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 w-72 z-50"
        @click.stop
      >
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-semibold text-slate-900">Multi-Court Booking</h3>
          <button
            @click="showMultiCourtPanel = false"
            class="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
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

        <!-- Selected Slots Summary -->
        <div class="bg-blue-50 rounded-lg p-3 mb-3">
          <div class="text-sm font-medium text-blue-800 mb-1">
            {{ selectedSlots.length }} slots selected
          </div>
          <div class="text-xs text-blue-600">
            {{ getSelectedCourts().join(', ') }}
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="space-y-2">
          <button
            @click="createBatchBooking"
            class="w-full px-3 py-2 bg-yellow-400 text-slate-800 rounded-lg hover:bg-yellow-500 text-sm font-medium transition-colors"
          >
            Create All Bookings
          </button>
          <button
            @click="openFullForm"
            class="w-full px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm transition-colors"
          >
            Customize Each Booking
          </button>
        </div>
      </div>

      <!-- Main FAB with Enhanced Design -->
      <div class="relative">
        <!-- Selection Counter Badge -->
        <div
          v-if="selectedSlots.length > 0"
          class="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold z-10 animate-pulse"
        >
          {{ selectedSlots.length }}
        </div>

        <!-- Main FAB Button -->
        <button
          @click="handleFABClick"
          class="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group relative overflow-hidden bg-yellow-400 hover:bg-yellow-500 text-slate-800"
          title="Add Booking"
        >
          <!-- Enhanced Tooltip -->
          <div
            class="absolute bottom-16 right-0 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
          >
            Add Booking
          </div>
          <!-- Background Animation -->
          <div
            class="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"
          ></div>

          <!-- Icon -->
          <svg
            class="w-6 h-6 transition-transform duration-200 relative z-10"
            :class="showQuickCreate ? 'rotate-45' : 'rotate-0'"
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
import interactionPlugin from '@fullcalendar/interaction'
import Parse from '../services/back4app'
import BookingForm from '../components/BookingForm.vue'
import BookingDetailsModal from '../components/BookingDetailsModal.vue'
import { CalendarLoadingState, CalendarErrorState } from '../components/ui'
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
const blockedSlots = ref<
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

// Load booking data directly
const loadBookings = async () => {
  const venueId = venueOwnerData.value?.objectId
  if (!venueId) {
    console.warn('⚠️ No venue ID available')
    return
  }

  console.log('🔍 Loading bookings for venue:', venueId)
  try {
    const bookingData = await BookingService.getBookings(venueId)
    console.log('📅 Raw booking data:', bookingData)

    bookings.value = bookingData.map((booking) => {
      const formatted = BookingService.formatBookingForCalendar(booking)
      console.log('📅 Formatted booking:', formatted)
      return formatted
    })

    console.log('✅ Bookings loaded:', bookings.value.length)
  } catch (error) {
    console.error('❌ Error loading bookings:', error)
    calendarError.value =
      error instanceof Error ? error.message : 'Failed to load bookings'
  }
}

const loadBlockedSlots = async () => {
  const venueId = venueOwnerData.value?.objectId
  if (!venueId) return

  try {
    const blockedData = await BookingService.getBlockedSlots(venueId)
    blockedSlots.value = blockedData.map((slot) =>
      BookingService.formatBlockedSlotForCalendar(slot)
    )
  } catch (error) {
    console.error('❌ Error loading blocked slots:', error)
  }
}

const loadAllData = async () => {
  calendarLoading.value = true
  calendarError.value = null

  try {
    await Promise.all([loadBookings(), loadBlockedSlots()])
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
// const showBookingModal = ref(false)
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
const showQuickCreate = ref(false)
const showMultiCourtPanel = ref(false)
const multiSelectMode = ref(false)
const isSubmitting = ref(false)
const showBookingDetails = ref(false)
const selectedBookingForDetails = ref<{
  id: string
  title: string
  start: Date
  end: Date
  extendedProps?: Record<string, unknown>
} | null>(null)
// const loadingBookings = ref(false)
// const errorMessage = ref('')
const quickCreateData = ref({
  court: '',
  title: '',
  duration: 90, // minutes
  startHour: new Date().getHours() + 1,
})

const availableHours = computed(() => {
  const hours = []
  for (let i = 6; i <= 22; i++) {
    hours.push(i)
  }
  return hours
})

const calendarOptions = computed(() => {
  console.log('📅 Computing calendar options with:', {
    bookings: bookings.value.length,
    blockedSlots: blockedSlots.value.length,
    selectedSlots: selectedSlots.value.length,
  })

  const selectedSlotEvents = selectedSlots.value.map((slot) => ({
    id: `selected-${slot.id}`,
    start: slot.start,
    end: slot.end,
    backgroundColor: MaBarColors.calendar.selected,
    borderColor: '#2563EB',
    textColor: MaBarColors.surface,
    title: '✓ Selected',
    extendedProps: {
      type: 'selected',
    },
  }))

  const allEvents = [
    ...bookings.value,
    ...blockedSlots.value,
    ...selectedSlotEvents,
  ]
  console.log('📅 All calendar events:', allEvents)

  return {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    height: 'auto',
    events: allEvents,
    selectable: false,
    selectMirror: false,
    dayMaxEvents: true,
    weekends: true,
    slotMinTime: '06:00:00',
    slotMaxTime: '23:00:00',
    slotDuration: '00:30:00',
    allDaySlot: false,
    eventColor: MaBarColors.calendar.confirmed,
    eventTextColor: MaBarColors.surface,
    eventBorderColor: MaBarColors.hover.accent,

    eventClick: handleEventClick,
    selectAllow: () => true,
    eventOverlap: true,
    selectOverlap: true,
    // Enhanced Google Calendar-style interactions
    eventMouseEnter: (info: { el: HTMLElement }) => {
      info.el.style.cursor = 'pointer'
      info.el.style.transform = 'translateY(-1px)'
      info.el.style.zIndex = '10'
    },
    eventMouseLeave: (info: { el: HTMLElement }) => {
      info.el.style.cursor = 'default'
      info.el.style.transform = 'translateY(0)'
      info.el.style.zIndex = 'auto'
    },
    // Add click outside to clear selection
    dateClick: () => {
      // If clicking on empty space, clear selection
      if (selectedSlots.value.length > 0) {
        clearSelection()
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

const handleEventClick = async (clickInfo: {
  event: {
    id: string
    title: string
    start: Date
    end: Date
    extendedProps?: Record<string, unknown>
  }
}) => {
  const event = clickInfo.event

  // Close any open popovers
  showQuickCreate.value = false
  showMultiCourtPanel.value = false

  if (event.extendedProps?.type === 'selected') {
    // Handle selected slot click - remove from selection
    const slotId = event.id.replace('selected-', '')
    const index = selectedSlots.value.findIndex((slot) => slot.id === slotId)
    if (index >= 0) {
      selectedSlots.value.splice(index, 1)
    }
  } else if (event.extendedProps?.type === 'blocked') {
    // Show edit/delete options for blocked slots
    editingBooking.value = {
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      type: 'blocked',
      ...event.extendedProps,
    }
    isEditMode.value = true
    showBookingForm.value = true
  } else if (event.extendedProps?.type === 'booking') {
    // Show booking details modal first
    selectedBookingForDetails.value = event
    showBookingDetails.value = true
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

const createBooking = async (bookingData: Record<string, unknown>) => {
  try {
    isSubmitting.value = true

    // Handle batch operations
    if (bookingData.type === 'batch' && bookingData.items) {
      const results = []
      for (const item of bookingData.items) {
        const result = await createSingleBooking(item)
        results.push(result)
      }

      const successCount = results.filter((r) => r.success).length
      const failCount = results.length - successCount

      if (failCount > 0) {
        alert(
          `Created ${successCount} bookings successfully. ${failCount} failed.`
        )
      }

      clearSelection()
      await refreshCalendarData()
      return { success: successCount > 0, successCount, failCount }
    } else {
      // Single booking/block
      const result = await createSingleBooking(bookingData)

      if (result.success) {
        clearSelection()
        await refreshCalendarData()
        alert(
          `${bookingData.type === 'blocked' ? 'Time slot blocked' : 'Booking created'} successfully!`
        )
      } else {
        alert(
          `Failed to create ${bookingData.type === 'blocked' ? 'block' : 'booking'}: ${result.error}`
        )
      }

      return result
    }
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

    if (bookingData.type === 'blocked') {
      // Create blocked slot using BookingService
      await BookingService.createBlockedSlot({
        venueId,
        startTime: new Date(bookingData.start as string),
        endTime: new Date(bookingData.end as string),
        court: bookingData.court as string,
        reason: bookingData.reason as string,
      })
    } else {
      // Create regular booking using BookingService
      await BookingService.createBooking({
        venueId,
        title: bookingData.title as string,
        startTime: new Date(bookingData.start as string),
        endTime: new Date(bookingData.end as string),
        court: bookingData.court as string,
        players: (bookingData.players as string[]) || [],
        playerPhones: (bookingData.playerPhones as string[]) || [],
        contact: bookingData.contact as string,
        phone: bookingData.phone as string,
        price: bookingData.price as number,
        status:
          (bookingData.status as 'confirmed' | 'pending' | 'cancelled') ||
          'confirmed',
        paymentStatus:
          (bookingData.paymentStatus as 'pending' | 'paid' | 'refunded') ||
          'pending',
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error creating single booking/block:', error)
    return { success: false, error: (error as Error).message }
  }
}

const updateBooking = async (
  bookingId: string,
  bookingData: Record<string, unknown>
) => {
  try {
    isSubmitting.value = true

    if (bookingData.type === 'blocked') {
      // Update blocked slot using BookingService
      await BookingService.updateBlockedSlot(bookingId, {
        startTime: new Date(bookingData.start as string),
        endTime: new Date(bookingData.end as string),
        court: bookingData.court as string,
        reason: bookingData.reason as string,
      })
    } else {
      // Update regular booking using BookingService
      await BookingService.updateBooking(bookingId, {
        title: bookingData.title as string,
        startTime: new Date(bookingData.start as string),
        endTime: new Date(bookingData.end as string),
        court: bookingData.court as string,
        players: (bookingData.players as string[]) || [],
        playerPhones: (bookingData.playerPhones as string[]) || [],
        contact: bookingData.contact as string,
        phone: bookingData.phone as string,
        price: bookingData.price as number,
        status: bookingData.status as 'confirmed' | 'pending' | 'cancelled',
        paymentStatus: bookingData.paymentStatus as
          | 'pending'
          | 'paid'
          | 'refunded',
      })
    }

    clearSelection()
    await refreshCalendarData()
    alert(
      `${bookingData.type === 'blocked' ? 'Block' : 'Booking'} updated successfully!`
    )

    return { success: true }
  } catch (error) {
    console.error('Error updating booking/block:', error)
    alert(
      `Failed to update ${bookingData.type === 'blocked' ? 'block' : 'booking'}: ${(error as Error).message}`
    )
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

    // Try to delete as booking first, then as blocked slot using BookingService
    try {
      await BookingService.deleteBooking(bookingId)
    } catch {
      // If not found as booking, try as blocked slot
      await BookingService.deleteBlockedSlot(bookingId)
    }

    clearSelection()
    await refreshCalendarData()
    alert('Booking deleted successfully!')

    return { success: true }
  } catch (error) {
    console.error('Error deleting booking/block:', error)
    alert(`Failed to delete: ${(error as Error).message}`)
    return { success: false, error: (error as Error).message }
  } finally {
    isSubmitting.value = false
  }
}

const clearSelection = () => {
  selectedSlots.value = []
  showBookingForm.value = false
  isEditMode.value = false
  editingBooking.value = null
  showQuickCreate.value = false
  showMultiCourtPanel.value = false
  multiSelectMode.value = false
  isSubmitting.value = false
}

const refreshCalendarData = async () => {
  await refreshData()
}

const openManualBookingForm = () => {
  clearSelection()
  showBookingForm.value = true
}

const handleFABClick = () => {
  showQuickCreate.value = !showQuickCreate.value
  showMultiCourtPanel.value = false

  if (showQuickCreate.value) {
    // Reset quick create form with smart defaults
    quickCreateData.value = {
      court: '',
      title: '',
      duration: 90,
      startHour: new Date().getHours() + 1,
    }
  }
}

const getSelectedCourts = () => {
  const courts = new Set()
  selectedSlots.value.forEach(() => {
    // Extract court from slot if available, otherwise use default
    courts.add('Court 1') // This would be dynamic based on actual slot data
  })
  return Array.from(courts)
}

const createBatchBooking = () => {
  showMultiCourtPanel.value = false
  showBookingForm.value = true
  multiSelectMode.value = true
}

// Removed unused function toggleMultiSelectMode

const handleQuickCreate = async () => {
  if (!quickCreateData.value.court || !quickCreateData.value.title) {
    return
  }

  // Create booking with selected time or smart default
  const today = new Date()
  today.setHours(quickCreateData.value.startHour, 0, 0, 0)
  const startTime = today
  const endTime = new Date(
    startTime.getTime() + quickCreateData.value.duration * 60 * 1000
  )

  const bookingData = {
    type: 'booking',
    title: quickCreateData.value.title,
    start: startTime.toISOString(),
    end: endTime.toISOString(),
    court: quickCreateData.value.court,
    players: [],
    contact: user?.email || '',
    phone: '',
    price: 150000,
    status: 'confirmed',
    paymentStatus: 'pending',
  }

  const result = await createBooking(bookingData)
  if (result.success) {
    showQuickCreate.value = false
    await refreshData() // Refresh calendar
  }
}

const openFullForm = () => {
  showQuickCreate.value = false
  showMultiCourtPanel.value = false
  openManualBookingForm()
}

const closeBookingDetails = () => {
  showBookingDetails.value = false
  selectedBookingForDetails.value = null
}

const editBookingFromDetails = () => {
  if (selectedBookingForDetails.value) {
    editingBooking.value = {
      id: selectedBookingForDetails.value.id,
      title: selectedBookingForDetails.value.title,
      start: selectedBookingForDetails.value.start,
      end: selectedBookingForDetails.value.end,
      type: 'booking',
      ...selectedBookingForDetails.value.extendedProps,
    }
    isEditMode.value = true
    showBookingDetails.value = false
    showBookingForm.value = true
  }
}

const deleteBookingFromDetails = async () => {
  if (selectedBookingForDetails.value) {
    await deleteBooking(selectedBookingForDetails.value.id)
    closeBookingDetails()
  }
}

const onCalendarMounted = () => {
  console.log('📅 FullCalendar mounted successfully')
}

// LiveQuery management is now handled by the useCalendarData composable

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

/* Safe area for mobile devices */
@supports (padding: max(0px)) {
  .venue-calendar {
    padding-bottom: max(1rem, env(safe-area-inset-bottom)) !important;
  }
}

/* FAB positioning - ensure it's always visible */
.fab-container {
  position: fixed !important;
  z-index: 9999 !important;
}
</style>
