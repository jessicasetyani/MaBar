<template>
  <div class="min-h-screen md-surface-container-lowest p-4 md:p-8">
    <div class="max-w-2xl mx-auto">
      <!-- Progress Indicator -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-8">
          <h1 class="md-headline-large text-md-sys-color-on-surface font-medium">
            Player Onboarding
          </h1>
          <span class="md-label-large text-md-sys-color-on-surface-variant">
            Step {{ currentStep }} of 3
          </span>
        </div>
        <!-- Material Design 3 Progress Indicator -->
        <progress
          class="w-full h-1 rounded-full bg-md-sys-color-surface-variant progress-bar"
          :value="currentStep"
          max="3"
          :aria-label="`Step ${currentStep} of 3`"
        >
          {{ Math.round((currentStep / 3) * 100) }}%
        </progress>
      </div>

      <!-- Form Container -->
      <div class="md-card md-elevation-1 overflow-hidden">
        <div class="p-6 md:p-8">
          <form @submit.prevent="handleSubmit">
            <!-- Step 1: Personal Information -->
            <div v-if="currentStep === 1" class="space-y-8">
              <h2 class="md-headline-small text-md-sys-color-on-surface font-medium mb-8">
                Personal Information
              </h2>

              <!-- Full Name Field -->
              <div class="form-group">
                <label
                  for="player-name"
                  class="md-label-large text-md-sys-color-on-surface mb-2 block"
                >
                  Full Name *
                </label>
                <div class="md-text-field md-text-field-outlined" :class="{ 'md-text-field-error': !formData.personalInfo.name.trim() && error }">
                  <input
                    id="player-name"
                    v-model="formData.personalInfo.name"
                    type="text"
                    required
                    class="md-text-field-input"
                    :class="{ 'md-text-field-input-error': !formData.personalInfo.name.trim() && error }"
                    placeholder="Enter your full name"
                    aria-describedby="name-helper"
                    @input="clearGeneralError"
                  />
                </div>
                <div id="name-helper" class="md-body-small text-md-sys-color-on-surface-variant mt-2">
                  Enter your full name as it will appear on your player profile
                </div>
              </div>

              <!-- Phone Number Field -->
              <div class="form-group">
                <label
                  for="player-phone"
                  class="md-label-large text-md-sys-color-on-surface mb-2 block"
                >
                  Phone Number *
                </label>
                <div class="md-text-field md-text-field-outlined" :class="{ 'md-text-field-error': phoneError }">
                  <input
                    id="player-phone"
                    v-model="formData.personalInfo.phone"
                    type="tel"
                    required
                    class="md-text-field-input"
                    :class="{ 'md-text-field-input-error': phoneError }"
                    placeholder="Enter your phone number"
                    aria-describedby="phone-helper phone-error"
                    @blur="validatePhone"
                    @input="handlePhoneInput"
                    @keypress="restrictToNumbers"
                  />
                </div>

                <!-- Helper Text -->
                <div id="phone-helper" class="md-body-small text-md-sys-color-on-surface-variant mt-2">
                  Use Indonesian format: +62 812 3456 7890 or 0812 3456 7890
                </div>

                <!-- Error Message -->
                <div
                  v-if="phoneError"
                  id="phone-error"
                  class="error-message mt-2"
                  role="alert"
                >
                  <div class="flex items-start">
                    <svg
                      class="error-icon mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="error-text">{{ phoneError }}</span>
                  </div>
                </div>
              </div>

              <!-- Date of Birth Field -->
              <div class="form-group">
                <label
                  for="player-dob"
                  class="md-label-large text-md-sys-color-on-surface mb-2 block"
                >
                  Date of Birth *
                </label>
                <div class="md-text-field md-text-field-outlined" :class="{ 'md-text-field-error': ageError || (!formData.personalInfo.dateOfBirth && error) }">
                  <input
                    id="player-dob"
                    v-model="formData.personalInfo.dateOfBirth"
                    type="date"
                    required
                    class="md-text-field-input date-input"
                    :class="{ 'md-text-field-input-error': ageError || (!formData.personalInfo.dateOfBirth && error) }"
                    aria-describedby="dob-helper dob-error"
                    @blur="validateAge"
                    @input="clearAgeError"
                    @change="clearGeneralError"
                  />
                </div>

                <!-- Helper Text -->
                <div id="dob-helper" class="md-body-small text-md-sys-color-on-surface-variant mt-2">
                  You must be at least 13 years old to create an account. This helps us match you with players in similar age groups.
                </div>

                <!-- Error Message -->
                <div
                  v-if="ageError"
                  id="dob-error"
                  class="error-message mt-2"
                  role="alert"
                >
                  <div class="flex items-start">
                    <svg
                      class="error-icon mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="error-text">{{ ageError }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Playing Preferences -->
            <div v-if="currentStep === 2" class="space-y-8">
              <h2 class="md-headline-small text-md-sys-color-on-surface font-medium mb-8">
                Playing Preferences
              </h2>

              <!-- Skill Level Field -->
              <div class="form-group">
                <label
                  for="skill-level"
                  class="md-label-large text-md-sys-color-on-surface mb-2 block"
                >
                  Skill Level *
                </label>
                <div class="md-text-field md-text-field-outlined" :class="{ 'md-text-field-error': !formData.preferences.skillLevel && error }">
                  <select
                    id="skill-level"
                    v-model="formData.preferences.skillLevel"
                    required
                    class="md-text-field-input"
                    :class="{ 'md-text-field-input-error': !formData.preferences.skillLevel && error }"
                    aria-describedby="skill-helper"
                    @change="clearGeneralError"
                  >
                    <option value="">Select your skill level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>
                <div id="skill-helper" class="md-body-small text-md-sys-color-on-surface-variant mt-1">
                  This helps us match you with players of similar skill levels
                </div>
              </div>

              <!-- Preferred Playing Times -->
              <div class="form-group">
                <fieldset>
                  <legend class="md-label-large text-md-sys-color-on-surface mb-4">
                    Preferred Playing Times
                  </legend>
                  <div class="space-y-3" aria-describedby="times-helper">
                    <label class="md-checkbox-container flex items-center cursor-pointer">
                      <div class="relative">
                        <input
                          v-model="formData.preferences.playingTimes"
                          type="checkbox"
                          value="morning"
                          class="md-checkbox"
                          id="time-morning"
                        />
                        <span class="md-checkbox-checkmark"></span>
                      </div>
                      <span class="md-body-large text-md-sys-color-on-surface ml-4">
                        Morning (6:00 AM - 12:00 PM)
                      </span>
                    </label>
                    <label class="md-checkbox-container flex items-center cursor-pointer">
                      <div class="relative">
                        <input
                          v-model="formData.preferences.playingTimes"
                          type="checkbox"
                          value="afternoon"
                          class="md-checkbox"
                          id="time-afternoon"
                        />
                        <span class="md-checkbox-checkmark"></span>
                      </div>
                      <span class="md-body-large text-md-sys-color-on-surface ml-4">
                        Afternoon (12:00 PM - 6:00 PM)
                      </span>
                    </label>
                    <label class="md-checkbox-container flex items-center cursor-pointer">
                      <div class="relative">
                        <input
                          v-model="formData.preferences.playingTimes"
                          type="checkbox"
                          value="evening"
                          class="md-checkbox"
                          id="time-evening"
                        />
                        <span class="md-checkbox-checkmark"></span>
                      </div>
                      <span class="md-body-large text-md-sys-color-on-surface ml-4">
                        Evening (6:00 PM - 10:00 PM)
                      </span>
                    </label>
                  </div>
                  <div id="times-helper" class="md-body-small text-md-sys-color-on-surface-variant mt-2">
                    Select all times when you're typically available to play
                  </div>
                </fieldset>
              </div>

              <!-- Preferred Areas -->
              <div class="form-group">
                <fieldset>
                  <legend class="md-label-large text-md-sys-color-on-surface mb-4">
                    Preferred Areas in Jakarta
                  </legend>
                  <div class="space-y-3" aria-describedby="areas-helper">
                    <label class="md-checkbox-container flex items-center cursor-pointer">
                      <div class="relative">
                        <input
                          v-model="formData.preferences.preferredAreas"
                          type="checkbox"
                          value="central"
                          class="md-checkbox"
                          id="area-central"
                        />
                        <span class="md-checkbox-checkmark"></span>
                      </div>
                      <span class="md-body-large text-md-sys-color-on-surface ml-4">
                        Central Jakarta
                      </span>
                    </label>
                    <label class="md-checkbox-container flex items-center cursor-pointer">
                      <div class="relative">
                        <input
                          v-model="formData.preferences.preferredAreas"
                          type="checkbox"
                          value="south"
                          class="md-checkbox"
                          id="area-south"
                        />
                        <span class="md-checkbox-checkmark"></span>
                      </div>
                      <span class="md-body-large text-md-sys-color-on-surface ml-4">
                        South Jakarta
                      </span>
                    </label>
                    <label class="md-checkbox-container flex items-center cursor-pointer">
                      <div class="relative">
                        <input
                          v-model="formData.preferences.preferredAreas"
                          type="checkbox"
                          value="north"
                          class="md-checkbox"
                          id="area-north"
                        />
                        <span class="md-checkbox-checkmark"></span>
                      </div>
                      <span class="md-body-large text-md-sys-color-on-surface ml-4">
                        North Jakarta
                      </span>
                    </label>
                    <label class="md-checkbox-container flex items-center cursor-pointer">
                      <div class="relative">
                        <input
                          v-model="formData.preferences.preferredAreas"
                          type="checkbox"
                          value="east"
                          class="md-checkbox"
                          id="area-east"
                        />
                        <span class="md-checkbox-checkmark"></span>
                      </div>
                      <span class="md-body-large text-md-sys-color-on-surface ml-4">
                        East Jakarta
                      </span>
                    </label>
                    <label class="md-checkbox-container flex items-center cursor-pointer">
                      <div class="relative">
                        <input
                          v-model="formData.preferences.preferredAreas"
                          type="checkbox"
                          value="west"
                          class="md-checkbox"
                          id="area-west"
                        />
                        <span class="md-checkbox-checkmark"></span>
                      </div>
                      <span class="md-body-large text-md-sys-color-on-surface ml-4">
                        West Jakarta
                      </span>
                    </label>
                  </div>
                  <div id="areas-helper" class="md-body-small text-md-sys-color-on-surface-variant mt-2">
                    Choose areas where you prefer to play matches
                  </div>
                </fieldset>
              </div>
            </div>

            <!-- Step 3: Completion -->
            <div v-if="currentStep === 3" class="text-center space-y-8">
              <div class="flex justify-center mb-8">
                <div class="w-16 h-16 bg-md-sys-color-primary rounded-full flex items-center justify-center">
                  <svg
                    class="w-8 h-8 text-md-sys-color-on-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h2 class="md-headline-medium text-md-sys-color-on-surface font-medium">
                Welcome to MaBar!
              </h2>
              <p class="md-body-large text-md-sys-color-on-surface-variant mb-4">
                Your player profile has been set up successfully!
              </p>
              <p class="md-body-medium text-md-sys-color-on-surface-variant">
                Taking you to your dashboard...
              </p>
              <div class="md-card md-elevation-0 bg-md-sys-color-secondary-container p-6 md:p-8 rounded-xl">
                <h3 class="md-title-medium text-md-sys-color-on-secondary-container font-medium mb-4">
                  What's Next:
                </h3>
                <ul class="md-body-medium text-md-sys-color-on-secondary-container space-y-2 text-left">
                  <li class="flex items-start">
                    <span class="text-md-sys-color-secondary mr-2">•</span>
                    Find and connect with other players
                  </li>
                  <li class="flex items-start">
                    <span class="text-md-sys-color-secondary mr-2">•</span>
                    Book courts at verified venues
                  </li>
                  <li class="flex items-start">
                    <span class="text-md-sys-color-secondary mr-2">•</span>
                    Join matches based on your skill level
                  </li>
                  <li class="flex items-start">
                    <span class="text-md-sys-color-secondary mr-2">•</span>
                    Track your playing history and progress
                  </li>
                </ul>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="mt-8">
              <div class="error-alert-mabar" role="alert">
                <div class="flex items-start">
                  <svg
                    class="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <div class="flex-1">
                    <h4 class="md-label-large font-semibold text-red-800 mb-1">
                      Setup Error
                    </h4>
                    <p class="md-body-large text-red-700 leading-relaxed">{{ error }}</p>
                    <p class="md-body-small text-red-600 mt-2">
                      If this problem persists, please try refreshing the page or contact support.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex justify-between items-center mt-8 pt-8 border-t border-md-sys-color-outline-variant">
              <!-- Previous Button -->
              <button
                v-if="currentStep > 1 && currentStep < 3"
                @click="previousStep"
                type="button"
                class="md-button md-button-outlined mobile-large-touch"
              >
                <svg
                  class="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </button>
              <div v-else></div>

              <!-- Next/Submit/Dashboard Button -->
              <button
                v-if="currentStep < 2"
                @click="nextStep"
                type="button"
                class="md-button md-button-filled mobile-large-touch"
                :disabled="!isStepValid"
                :aria-disabled="!isStepValid"
              >
                Next
                <svg
                  class="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              <button
                v-else-if="currentStep === 2"
                type="submit"
                class="md-button md-button-filled mobile-large-touch"
                :disabled="isSubmitting || !isStepValid"
                :aria-disabled="isSubmitting || !isStepValid"
                :aria-busy="isSubmitting"
              >
                <svg
                  v-if="isSubmitting"
                  class="w-4 h-4 mr-2 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {{ isSubmitting ? 'Completing...' : 'Complete Setup' }}
              </button>
              <button
                v-else-if="currentStep === 3"
                @click="goToDashboard"
                type="button"
                class="md-button md-button-filled mobile-large-touch"
              >
                Go to Dashboard
                <svg
                  class="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { PlayerService } from '../services/playerService'

const router = useRouter()
const authStore = useAuthStore()

const currentStep = ref(1)
const isSubmitting = ref(false)
const error = ref<string | null>(null)

// Validation errors
const phoneError = ref<string | null>(null)
const ageError = ref<string | null>(null)

const formData = ref({
  personalInfo: {
    name: '',
    phone: '',
    dateOfBirth: '',
  },
  preferences: {
    skillLevel: '',
    playingTimes: [] as string[],
    preferredAreas: [] as string[],
  },
})

// Phone number validation functions
const validatePhoneNumber = (phone: string): boolean => {
  // Remove all spaces, dashes, and parentheses for validation
  const cleanPhone = phone.replace(/[\s\-()]/g, '')

  // Indonesian phone number patterns:
  // +62 followed by 8-12 digits (mobile: +62 8xx-xxxx-xxxx)
  // 08 followed by 8-11 digits (local mobile: 08xx-xxxx-xxxx)
  // 021, 022, etc. followed by 7-8 digits (landline)
  const indonesianPatterns = [
    /^\+628\d{8,11}$/, // +62 8xx-xxxx-xxxx (mobile)
    /^08\d{8,11}$/, // 08xx-xxxx-xxxx (local mobile)
    /^\+6221\d{7,8}$/, // +62 21 xxxx-xxxx (Jakarta landline)
    /^\+6222\d{7,8}$/, // +62 22 xxxx-xxxx (Bandung landline)
    /^\+6224\d{7,8}$/, // +62 24 xxxx-xxxx (Semarang landline)
    /^\+6231\d{7,8}$/, // +62 31 xxxx-xxxx (Surabaya landline)
    /^021\d{7,8}$/, // 021 xxxx-xxxx (Jakarta landline local)
    /^022\d{7,8}$/, // 022 xxxx-xxxx (Bandung landline local)
    /^024\d{7,8}$/, // 024 xxxx-xxxx (Semarang landline local)
    /^031\d{7,8}$/, // 031 xxxx-xxxx (Surabaya landline local)
  ]

  return indonesianPatterns.some(pattern => pattern.test(cleanPhone))
}

const validatePhone = () => {
  const phone = formData.value.personalInfo.phone.trim()

  if (!phone) {
    phoneError.value = 'Phone number is required to continue'
    return false
  }

  if (!validatePhoneNumber(phone)) {
    phoneError.value = 'Enter a valid Indonesian phone number (e.g., +62 812 3456 7890 or 0812 3456 7890)'
    return false
  }

  phoneError.value = null
  return true
}

const clearPhoneError = () => {
  if (phoneError.value) {
    phoneError.value = null
  }
}

// Phone input restrictions
const restrictToNumbers = (event: KeyboardEvent) => {
  const char = String.fromCharCode(event.which || event.keyCode)

  // Allow control keys (backspace, delete, tab, escape, enter, arrows, etc.)
  if (event.ctrlKey || event.metaKey || event.altKey ||
      [8, 9, 13, 27, 35, 36, 37, 38, 39, 40, 46].includes(event.keyCode)) {
    return true
  }

  // Allow numeric characters (0-9)
  if (/\d/.test(char)) {
    return true
  }

  // Allow phone formatting characters: +, -, (, ), space
  if (/[+\-() ]/.test(char)) {
    return true
  }

  // Prevent all other characters
  event.preventDefault()
  return false
}

const handlePhoneInput = (event: Event) => {
  clearPhoneError()

  // Clean up the input to remove any invalid characters that might have been pasted
  const target = event.target as HTMLInputElement
  const cleanValue = target.value.replace(/[^0-9+\-() ]/g, '')

  if (target.value !== cleanValue) {
    target.value = cleanValue
    formData.value.personalInfo.phone = cleanValue
  }
}

// Age validation functions
const calculateAge = (dateOfBirth: string): number => {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

// Pure validation function for computed properties (no side effects)
const isValidAge = (dateOfBirth: string): boolean => {
  if (!dateOfBirth) return false

  const age = calculateAge(dateOfBirth)
  if (age < 13) return false

  // Check if date is in the future
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  if (birthDate > today) return false

  return true
}

// Validation function with side effects for event handlers
const validateAge = () => {
  const dateOfBirth = formData.value.personalInfo.dateOfBirth

  if (!dateOfBirth) {
    ageError.value = 'Please select your date of birth to continue'
    return false
  }

  const age = calculateAge(dateOfBirth)

  if (age < 13) {
    ageError.value = 'You must be at least 13 years old to create an account. Please ask a parent or guardian to help you create an account.'
    return false
  }

  // Check if date is in the future
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  if (birthDate > today) {
    ageError.value = 'Please select a valid date of birth. The date cannot be in the future.'
    return false
  }

  ageError.value = null
  return true
}

const clearAgeError = () => {
  if (ageError.value) {
    ageError.value = null
  }
}

const clearGeneralError = () => {
  if (error.value) {
    error.value = null
  }
}

const isStepValid = computed(() => {
  switch (currentStep.value) {
    case 1:
      return (
        formData.value.personalInfo.name.trim() &&
        formData.value.personalInfo.phone.trim() &&
        !phoneError.value &&
        validatePhoneNumber(formData.value.personalInfo.phone) &&
        formData.value.personalInfo.dateOfBirth &&
        !ageError.value &&
        isValidAge(formData.value.personalInfo.dateOfBirth)
      )
    case 2:
      return formData.value.preferences.skillLevel.trim()
    default:
      return true
  }
})

const nextStep = () => {
  if (isStepValid.value) {
    error.value = null
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const handleSubmit = async () => {
  if (currentStep.value !== 2) return

  isSubmitting.value = true
  error.value = null

  try {
    console.log('🚀 Starting player onboarding submission...')
    console.log('📋 Form data:', formData.value)

    // Save player profile data
    console.log('💾 Saving player profile...')
    await PlayerService.savePlayerProfile(formData.value)
    console.log('✅ Player profile saved successfully')

    // Update auth store onboarding status
    console.log('🔄 Updating onboarding status...')
    const result = await authStore.updateOnboardingStatus('completed')
    console.log('✅ Onboarding status updated:', result)

    console.log('🎉 Onboarding completed successfully!')

    // Redirect immediately to dashboard
    console.log('🎯 Redirecting to dashboard...')
    router.push('/dashboard')
  } catch (err: any) {
    console.error('❌ Error completing player onboarding:', err)

    // Provide more specific error messages based on error type
    if (err.message && err.message.includes('Permission denied')) {
      error.value = 'There was a technical issue saving your profile. Our team has been notified and this should be resolved shortly. Please try again in a few minutes.'
    } else if (err.message && err.message.includes('Network')) {
      error.value = 'Please check your internet connection and try again.'
    } else if (err.message && err.message.includes('skill level')) {
      error.value = 'Please select your skill level to continue.'
    } else {
      error.value = err.message || 'Unable to complete setup at this time. Please try again or contact support if the issue persists.'
    }
  } finally {
    isSubmitting.value = false
  }
}

const goToDashboard = () => {
  router.push('/dashboard')
}




</script>

<style scoped>
/* Material Design 3 Color System - MaBar Theme */
:root {
  --md-sys-color-primary: #FDE047; /* MaBar Yellow */
  --md-sys-color-on-primary: #334155; /* Charcoal */
  --md-sys-color-secondary: #84CC16; /* Padel Green */
  --md-sys-color-on-secondary: #FFFFFF; /* White */
  --md-sys-color-surface: #FFFFFF; /* White */
  --md-sys-color-on-surface: #334155; /* Charcoal */
  --md-sys-color-on-surface-variant: #64748B; /* Subtle Slate Gray */
  --md-sys-color-surface-container-lowest: #FEFCE8; /* Light Cream */
  --md-sys-color-surface-variant: #F1F5F9; /* Light variant */
  --md-sys-color-outline: #CBD5E1; /* Border color */
  --md-sys-color-outline-variant: #E2E8F0; /* Light border */
  --md-sys-color-secondary-container: #F0FDF4; /* Light green container */
  --md-sys-color-on-secondary-container: #166534; /* Dark green text */
  --md-sys-color-error-container: #FEF2F2; /* Light red container */
  --md-sys-color-on-error-container: #991B1B; /* Dark red text */
  --md-sys-color-error: #DC2626; /* Error red */
  --md-sys-color-on-error: #FFFFFF; /* White on error */
}

/* Material Design 3 Surface and Layout */
.md-surface-container-lowest {
  background-color: var(--md-sys-color-surface-container-lowest);
}

.md-card {
  background-color: var(--md-sys-color-surface);
  border-radius: 12px;
  border: 1px solid var(--md-sys-color-outline-variant);
}

.md-elevation-1 {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.md-elevation-0 {
  box-shadow: none;
}

/* Material Design 3 Typography Scale */
.md-headline-large {
  font-size: 2rem;
  line-height: 2.5rem;
  font-weight: 400;
  letter-spacing: 0;
}

.md-headline-medium {
  font-size: 1.75rem;
  line-height: 2.25rem;
  font-weight: 400;
  letter-spacing: 0;
}

.md-headline-small {
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 400;
  letter-spacing: 0;
}

.md-title-medium {
  font-size: 1.125rem;
  line-height: 1.5rem;
  font-weight: 500;
  letter-spacing: 0.009375rem;
}

.md-label-large {
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  letter-spacing: 0.00625rem;
}

.md-body-large {
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 400;
  letter-spacing: 0.03125rem;
}

.md-body-medium {
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 400;
  letter-spacing: 0.015625rem;
}

.md-body-small {
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 400;
  letter-spacing: 0.025rem;
}

/* Material Design 3 Text Fields */
.form-group {
  margin-bottom: 2rem; /* 32px - follows 8dp grid system */
  position: relative;
}

.md-text-field {
  position: relative;
  width: 100%;
}

.md-text-field-outlined {
  border-radius: 4px;
}

.md-text-field-input {
  width: 100%;
  padding: 16px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 4px;
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  font-size: 1rem;
  line-height: 1.5rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  outline: none;
}

.md-text-field-input::placeholder {
  color: var(--md-sys-color-on-surface-variant);
}

.md-text-field-input:focus {
  border-color: var(--md-sys-color-primary);
  box-shadow: 0 0 0 2px rgba(253, 224, 71, 0.2);
}

.md-text-field-input:hover:not(:focus) {
  border-color: var(--md-sys-color-on-surface);
}

/* Material Design 3 Error States - Improved */
.md-text-field-error .md-text-field-input,
.md-text-field-input-error {
  border-color: var(--md-sys-color-error);
  border-width: 1px;
  background-color: var(--md-sys-color-surface);
}

.md-text-field-error .md-text-field-input:focus,
.md-text-field-input-error:focus {
  border-color: var(--md-sys-color-error);
  border-width: 2px;
  box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.08);
  outline: none;
}

.md-text-field-error .md-text-field-input:hover:not(:focus),
.md-text-field-input-error:hover:not(:focus) {
  border-color: var(--md-sys-color-error);
  border-width: 1px;
}

/* Error Message Styling - Material Design 3 Compliant */
.error-message {
  color: var(--md-sys-color-error);
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1rem;
  letter-spacing: 0.025rem;
  display: block;
}

.error-message .error-text {
  font-weight: 400;
  color: var(--md-sys-color-error);
  line-height: 1.2;
}

/* Error Icon Styling - Smaller and Less Intrusive */
.error-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--md-sys-color-error);
  opacity: 0.8;
}

/* Legacy Error Styling Support */
.text-md-sys-color-error svg {
  color: var(--md-sys-color-error);
}

/* Improved Error Container */
.error-container {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 6px;
}

/* Helper Text Styling */
.md-body-small.text-md-sys-color-on-surface-variant {
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 400;
  opacity: 0.8;
}

/* Form Field States */
.form-group .md-text-field-input {
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

/* Enhanced Error State Visual Feedback */
.md-text-field-error {
  position: relative;
}

.md-text-field-error .md-text-field-input {
  transition: all 0.2s ease;
}

/* Phone Input Error State Improvements */
input[type="tel"].md-text-field-input-error {
  padding: 12px 16px;
  font-size: 1rem;
  line-height: 1.5;
  background-color: var(--md-sys-color-surface);
}

/* Ensure consistent padding for date inputs */
.date-input.md-text-field-input-error {
  padding-right: 16px;
}

/* Date Input Specific Styling */
.date-input {
  cursor: pointer;
  position: relative;
}

.date-input::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  right: 0;
  top: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

/* Material Design 3 Buttons */
.md-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
  letter-spacing: 0.00625rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;
  min-height: 40px;
}

.md-button:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.md-button-filled {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.md-button-filled:hover:not(:disabled) {
  background-color: #FACC15;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.md-button-filled:active:not(:disabled) {
  background-color: #EAB308;
}

.md-button-filled:disabled {
  background-color: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
  cursor: not-allowed;
}

.md-button-outlined {
  background-color: transparent;
  color: var(--md-sys-color-primary);
  border: 1px solid var(--md-sys-color-outline);
}

.md-button-outlined:hover:not(:disabled) {
  background-color: rgba(253, 224, 71, 0.08);
  border-color: var(--md-sys-color-primary);
}

.md-button-outlined:active:not(:disabled) {
  background-color: rgba(253, 224, 71, 0.12);
}

/* Mobile Touch Targets */
.mobile-large-touch {
  min-height: 48px;
  min-width: 48px;
}

@media (max-width: 768px) {
  .mobile-large-touch {
    min-height: 56px;
    padding: 14px 24px;
  }
}

/* Material Design 3 Checkboxes */
.md-checkbox-container {
  position: relative;
  padding: 12px 16px;
  transition: background-color 0.2s ease;
  border-radius: 8px;
  gap: 16px;
}

.md-checkbox-container:hover {
  background-color: rgba(253, 224, 71, 0.04);
}

.md-checkbox {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid var(--md-sys-color-outline);
  border-radius: 2px;
  background-color: transparent;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.md-checkbox:hover {
  border-color: var(--md-sys-color-primary);
}

.md-checkbox:focus {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.md-checkbox:checked {
  background-color: var(--md-sys-color-primary);
  border-color: var(--md-sys-color-primary);
}

.md-checkbox-checkmark {
  position: absolute;
  left: 0;
  top: 0;
  width: 18px;
  height: 18px;
  pointer-events: none;
  z-index: 1;
}

.md-checkbox:checked + .md-checkbox-checkmark::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 1px;
  width: 5px;
  height: 9px;
  border: solid var(--md-sys-color-on-primary);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* MaBar Error Alert Styling */
.error-alert-mabar {
  background-color: #FFFFFF; /* Surface White */
  border: 2px solid #DC2626; /* Red border for error indication */
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.error-alert-mabar:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Color System Classes */
.text-md-sys-color-primary {
  color: var(--md-sys-color-primary);
}

.text-md-sys-color-on-primary {
  color: var(--md-sys-color-on-primary);
}

.text-md-sys-color-secondary {
  color: var(--md-sys-color-secondary);
}

.text-md-sys-color-on-secondary {
  color: var(--md-sys-color-on-secondary);
}

.text-md-sys-color-surface {
  color: var(--md-sys-color-surface);
}

.text-md-sys-color-on-surface {
  color: var(--md-sys-color-on-surface);
}

.text-md-sys-color-on-surface-variant {
  color: var(--md-sys-color-on-surface-variant);
}

.text-md-sys-color-on-secondary-container {
  color: var(--md-sys-color-on-secondary-container);
}

.text-md-sys-color-on-error-container {
  color: var(--md-sys-color-on-error-container);
}

.text-md-sys-color-error {
  color: var(--md-sys-color-error);
}

.bg-md-sys-color-primary {
  background-color: var(--md-sys-color-primary);
}

.bg-md-sys-color-secondary-container {
  background-color: var(--md-sys-color-secondary-container);
}

.bg-md-sys-color-error-container {
  background-color: var(--md-sys-color-error-container);
}

.bg-md-sys-color-surface-variant {
  background-color: var(--md-sys-color-surface-variant);
}

.border-md-sys-color-outline-variant {
  border-color: var(--md-sys-color-outline-variant);
}

/* Responsive Design */
@media (max-width: 640px) {
  .md-card {
    margin: 0 -1rem;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }

  .form-group {
    margin-bottom: 1.5rem; /* 24px - maintains 8dp grid on mobile */
  }

  .md-text-field-input {
    padding: 16px; /* Maintains consistent padding */
  }

  /* Adjust container padding for mobile */
  .md-card .p-6 {
    padding: 1rem; /* 16px on mobile */
  }

  /* Adjust spacing for mobile */
  .space-y-8 > * + * {
    margin-top: 1.5rem; /* 24px spacing on mobile */
  }
}

/* Animation Classes */
.ease-md-sys-motion-easing-standard {
  transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
}

/* Focus and State Management */
.md-text-field-input:invalid:not(:focus):not(:placeholder-shown) {
  border-color: #DC2626;
}

.md-text-field-input:invalid:not(:focus):not(:placeholder-shown) + .md-body-small {
  color: #DC2626;
}

/* Material Design 3 Progress Bar */
.progress-bar {
  appearance: none;
  border: none;
  background-color: var(--md-sys-color-surface-variant);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar::-webkit-progress-bar {
  background-color: var(--md-sys-color-surface-variant);
  border-radius: 2px;
}

.progress-bar::-webkit-progress-value {
  background-color: var(--md-sys-color-primary);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-bar::-moz-progress-bar {
  background-color: var(--md-sys-color-primary);
  border-radius: 2px;
}
</style>
