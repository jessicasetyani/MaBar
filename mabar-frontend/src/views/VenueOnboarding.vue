<template>
  <div class="min-h-screen bg-lime-50 py-8">
    <div class="max-w-2xl mx-auto px-4">
      <!-- Progress Indicator -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-2xl font-bold text-slate-700">
            Venue Owner Onboarding
          </h1>
          <span class="text-sm text-slate-500"
            >Step {{ currentStep }} of 5</span
          >
        </div>
        <div class="w-full bg-slate-200 rounded-full h-2">
          <div
            class="bg-lime-500 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${(currentStep / 5) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Form Container -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <form @submit.prevent="handleSubmit">
          <!-- Step 1: Personal Information -->
          <div v-if="currentStep === 1" class="space-y-6">
            <h2 class="text-xl font-semibold text-slate-700 mb-4">
              Personal Information
            </h2>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2"
                >Full Name *</label
              >
              <input
                v-model="formData.personalInfo.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2"
                >Email Address *</label
              >
              <input
                v-model="formData.personalInfo.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
                placeholder="Enter your email address"
              />
              <p v-if="emailError" class="text-red-500 text-sm mt-1">
                {{ emailError }}
              </p>
            </div>
          </div>

          <!-- Step 2: Venue Details -->
          <div v-if="currentStep === 2" class="space-y-6">
            <h2 class="text-xl font-semibold text-slate-700 mb-4">
              Venue Details
            </h2>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2"
                >Venue Name *</label
              >
              <input
                v-model="formData.venueDetails.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
                placeholder="Enter venue name"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2"
                >Address *</label
              >
              <textarea
                v-model="formData.venueDetails.address"
                required
                rows="3"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
                placeholder="Enter complete venue address"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2"
                >Facilities</label
              >
              <div class="space-y-2">
                <label
                  v-for="facility in facilities"
                  :key="facility"
                  class="flex items-center"
                >
                  <input
                    v-model="formData.venueDetails.facilities"
                    type="checkbox"
                    :value="facility"
                    class="mr-2 text-lime-500 focus:ring-lime-500"
                  />
                  <span class="text-sm text-slate-700">{{ facility }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Step 3: Legal Documents -->
          <div v-if="currentStep === 3" class="space-y-6">
            <h2 class="text-xl font-semibold text-slate-700 mb-4">
              Legal Documents
            </h2>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2"
                >NIK Number *</label
              >
              <input
                v-model="formData.legalDocs.nik"
                type="text"
                required
                pattern="[0-9]{16}"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
                placeholder="16-digit NIK number"
              />
              <p class="text-xs text-slate-500 mt-1">Must be 16 digits</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2"
                >SIUP Number *</label
              >
              <input
                v-model="formData.legalDocs.siup"
                type="text"
                required
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
                placeholder="SIUP registration number"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2"
                >Contact Number *</label
              >
              <input
                v-model="formData.legalDocs.phone"
                type="tel"
                required
                pattern="[0-9+\-\s()]+"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
                placeholder="Phone number"
              />
            </div>
          </div>

          <!-- Step 4: Document Upload -->
          <div v-if="currentStep === 4" class="space-y-6">
            <h2 class="text-xl font-semibold text-slate-700 mb-4">
              Document Upload
            </h2>

            <div
              class="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center"
            >
              <input
                ref="fileInput"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                @change="handleFileUpload"
                class="hidden"
              />
              <div @click="fileInput?.click()" class="cursor-pointer">
                <div class="text-4xl text-slate-400 mb-2">📁</div>
                <p class="text-slate-600 mb-2">Click to upload documents</p>
                <p class="text-xs text-slate-500">
                  PDF, JPEG, PNG only. Max 5MB each. Up to 5 files.
                </p>
              </div>
            </div>

            <div v-if="uploadedFiles.length > 0" class="space-y-2">
              <h3 class="font-medium text-slate-700">Uploaded Files:</h3>
              <div
                v-for="(file, index) in uploadedFiles"
                :key="index"
                class="flex items-center justify-between bg-slate-50 p-2 rounded"
              >
                <span class="text-sm text-slate-700">{{ file.name }}</span>
                <button
                  @click="removeFile(index)"
                  type="button"
                  class="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          <!-- Step 5: Pending Verification -->
          <div v-if="currentStep === 5" class="text-center space-y-6">
            <div class="text-6xl mb-4">⏳</div>
            <h2 class="text-xl font-semibold text-slate-700">
              Verification Pending
            </h2>
            <p class="text-slate-600">
              Your application has been submitted successfully!
            </p>
            <div class="bg-lime-50 border border-lime-200 rounded-lg p-4">
              <h3 class="font-medium text-lime-800 mb-2">Next Steps:</h3>
              <ul class="text-sm text-lime-700 space-y-1 text-left">
                <li>
                  • Our team will review your documents within 2-3 business days
                </li>
                <li>
                  • You'll receive an email notification once verification is
                  complete
                </li>
                <li>• After approval, you can start managing your venue</li>
              </ul>
            </div>

            <!-- Show error if any -->
            <div
              v-if="error"
              class="bg-red-50 border border-red-200 rounded-lg p-4"
            >
              <p class="text-red-700 text-sm">{{ error }}</p>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-between mt-8">
            <button
              v-if="currentStep > 1 && currentStep < 5"
              @click="previousStep"
              type="button"
              class="px-6 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50"
            >
              Previous
            </button>
            <div v-else></div>

            <button
              v-if="currentStep < 4"
              @click="nextStep"
              type="button"
              class="px-6 py-2 bg-lime-500 text-white rounded-md hover:bg-lime-600"
              :disabled="!isStepValid"
            >
              Next
            </button>
            <button
              v-else-if="currentStep === 4"
              type="submit"
              class="px-6 py-2 bg-lime-500 text-white rounded-md hover:bg-lime-600"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Submitting...' : 'Submit Application' }}
            </button>
            <button
              v-else-if="currentStep === 5"
              @click="goToDashboard"
              type="button"
              class="px-6 py-2 bg-lime-500 text-white rounded-md hover:bg-lime-600"
            >
              Go to Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import {
  VenueOwnerService,
  type VenueOwnerData,
} from '../services/venueOwnerService'

const router = useRouter()
const authStore = useAuthStore()

const currentStep = ref(1)
const isSubmitting = ref(false)
const uploadedFiles = ref<File[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const applicationSubmitted = ref(false)
const error = ref<string | null>(null)

const formData = ref({
  personalInfo: {
    name: '',
    email: '',
  },
  venueDetails: {
    name: '',
    address: '',
    facilities: [] as string[],
  },
  legalDocs: {
    nik: '',
    siup: '',
    phone: '',
  },
})

const facilities = [
  'Indoor Courts',
  'Outdoor Courts',
  'Parking',
  'Changing Rooms',
  'Equipment Rental',
  'Cafeteria',
  'Pro Shop',
  'Air Conditioning',
]

const emailError = computed(() => {
  const email = formData.value.personalInfo.email
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Please enter a valid email address'
  }
  return ''
})

const isStepValid = computed(() => {
  switch (currentStep.value) {
    case 1:
      return (
        formData.value.personalInfo.name.trim() &&
        formData.value.personalInfo.email.trim() &&
        !emailError.value
      )
    case 2:
      return (
        formData.value.venueDetails.name.trim() &&
        formData.value.venueDetails.address.trim()
      )
    case 3:
      return (
        formData.value.legalDocs.nik.length === 16 &&
        formData.value.legalDocs.siup.trim() &&
        formData.value.legalDocs.phone.trim()
      )
    default:
      return true
  }
})

const nextStep = () => {
  if (isStepValid.value && currentStep.value < 5) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])

  // Validate files
  const validFiles = files.filter((file) => {
    const validTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ]
    const maxSize = 5 * 1024 * 1024 // 5MB

    return validTypes.includes(file.type) && file.size <= maxSize
  })

  // Limit to 5 files total
  const totalFiles = uploadedFiles.value.length + validFiles.length
  if (totalFiles > 5) {
    alert('Maximum 5 files allowed')
    return
  }

  uploadedFiles.value.push(...validFiles)
}

const removeFile = (index: number) => {
  uploadedFiles.value.splice(index, 1)
}

const handleSubmit = async () => {
  if (currentStep.value !== 4) return

  isSubmitting.value = true
  error.value = null

  try {
    await VenueOwnerService.saveVenueOwnerApplication(
      formData.value as VenueOwnerData,
      uploadedFiles.value
    )

    // Update auth store
    await authStore.updateOnboardingStatus('completed')

    applicationSubmitted.value = true
    currentStep.value = 5
  } catch (err: any) {
    console.error('Error submitting application:', err)
    error.value =
      err.message || 'Error submitting application. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

const goToDashboard = () => {
  router.push('/venue-dashboard')
}

// Check if application already exists on mount
onMounted(async () => {
  try {
    const status = await VenueOwnerService.checkApplicationStatus()
    if (status.exists) {
      if (status.status === 'pending_verification') {
        applicationSubmitted.value = true
        currentStep.value = 5
      } else if (status.status === 'approved') {
        // Redirect to dashboard if already approved
        router.push('/venue-dashboard')
      }
    }
  } catch (err) {
    console.error('Error checking application status:', err)
  }
})
</script>
