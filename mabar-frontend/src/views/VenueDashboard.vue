<template>
  <div class="min-h-screen bg-lime-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-slate-900">
              Venue Dashboard
            </h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-slate-600">{{ user?.email }}</span>
            <button
              @click="logout"
              class="text-sm text-slate-600 hover:text-slate-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Status Card -->
      <div class="mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div
                class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center"
              >
                <span class="text-yellow-600">⏳</span>
              </div>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-slate-900">
                Application Status: {{ applicationStatus }}
              </h3>
              <p class="text-sm text-slate-600">
                Your venue registration is currently under review
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Application Details -->
      <div v-if="venueOwnerData" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Personal Information -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-slate-900 mb-4">
            Personal Information
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
          </dl>
        </div>

        <!-- Venue Details -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-slate-900 mb-4">Venue Details</h3>
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

        <!-- Legal Documents -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-slate-900 mb-4">
            Legal Documents
          </h3>
          <dl class="space-y-3">
            <div>
              <dt class="text-sm font-medium text-slate-500">NIK</dt>
              <dd class="text-sm text-slate-900">
                {{ maskNIK(venueOwnerData.legalDocs?.nik) }}
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-slate-500">SIUP</dt>
              <dd class="text-sm text-slate-900">
                {{ venueOwnerData.legalDocs?.siup }}
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

        <!-- Submitted Documents -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-slate-900 mb-4">
            Submitted Documents
          </h3>
          <div v-if="venueOwnerData.documents?.length" class="space-y-2">
            <div
              v-for="(doc, index) in venueOwnerData.documents"
              :key="index"
              class="flex items-center justify-between p-2 bg-slate-50 rounded"
            >
              <span class="text-sm text-slate-700">{{
                doc.name || `Document ${index + 1}`
              }}</span>
              <a
                :href="doc.url"
                target="_blank"
                class="text-sm text-lime-600 hover:text-lime-700"
              >
                View
              </a>
            </div>
          </div>
          <p v-else class="text-sm text-slate-500">No documents uploaded</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else class="text-center py-12">
        <div class="text-slate-500">Loading application details...</div>
      </div>
    </main>
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

const logout = async () => {
  await authStore.logout()
  router.push('/')
}

const maskNIK = (nik: string) => {
  if (!nik) return ''
  return nik.substring(0, 4) + '****' + nik.substring(12)
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
          break
        case 'rejected':
          applicationStatus.value = 'Rejected'
          break
        default:
          applicationStatus.value = 'Unknown'
      }
    } else {
      // No application found, redirect to onboarding
      router.push('/onboarding/venue-owner')
    }
  } catch (error) {
    console.error('Error loading venue owner data:', error)
  }
})
</script>
