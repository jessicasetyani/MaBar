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

          <!-- Calendar Container -->
          <div
            class="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
          >
            <div id="calendar-container" class="min-h-[600px]">
              <!-- Calendar will be rendered here -->
              <div class="flex items-center justify-center h-96 text-slate-500">
                📅 Calendar will be integrated in the next step
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { VenueOwnerService } from '../services/venueOwnerService'

const router = useRouter()
const authStore = useAuthStore()
const { user } = authStore

const venueOwnerData = ref<any>(null)
const applicationStatus = ref('Pending Verification')
const activeTab = ref('calendar')

const logout = async () => {
  await authStore.logout()
  router.push('/')
}

onMounted(async () => {
  try {
    const profile = await VenueOwnerService.getVenueOwnerProfile()
    if (profile) {
      venueOwnerData.value = {
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
          // Default to calendar tab for approved venues
          activeTab.value = 'calendar'
          break
        case 'rejected':
          applicationStatus.value = 'Rejected'
          // Default to profile tab for rejected venues
          activeTab.value = 'profile'
          break
        default:
          applicationStatus.value = 'Unknown'
          activeTab.value = 'profile'
      }
    } else {
      // No application found, redirect to onboarding
      router.push('/onboarding/venue-owner')
    }
  } catch (error) {
    console.error('Error loading venue owner data:', error)
    // Default to profile tab on error
    activeTab.value = 'profile'
  }
})
</script>
