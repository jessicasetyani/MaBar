<template>
  <form @submit.prevent="handleSubmit" class="form-composition" novalidate>
    <div class="space-y-4">
      <!-- Email Field -->
      <div class="form-group">
        <label
          for="email"
          class="md-label-large text-md-sys-color-on-surface mb-1 block"
        >
          Email Address
        </label>
        <div class="md-text-field md-text-field-outlined">
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter your email address"
            required
            class="md-text-field-input"
            :class="{ 'border-red-500': emailError }"
            aria-describedby="email-error"
            @blur="validateEmail"
            @input="clearEmailError"
          />
        </div>
        <div
          v-if="emailError"
          id="email-error"
          class="feedback-error p-2 mt-1 rounded"
          role="alert"
        >
          <p class="md-body-large text-red-700">{{ emailError }}</p>
        </div>
      </div>

      <!-- Password Field -->
      <div class="form-group">
        <label
          for="password"
          class="md-label-large text-md-sys-color-on-surface mb-1 block"
        >
          Password
        </label>
        <div class="md-text-field md-text-field-outlined">
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Create a secure password"
            required
            minlength="6"
            class="md-text-field-input"
            :class="{ 'border-red-500': passwordError }"
            aria-describedby="password-help password-error"
            @blur="validatePassword"
            @input="clearPasswordError"
          />
        </div>
        <div
          id="password-help"
          class="md-label-large text-md-sys-color-on-surface-variant mt-1"
        >
          Must be at least 6 characters long
        </div>
        <div
          v-if="passwordError"
          id="password-error"
          class="feedback-error p-2 mt-1 rounded"
          role="alert"
        >
          <p class="md-body-large text-red-700">{{ passwordError }}</p>
        </div>
      </div>

      <!-- Confirm Password Field -->
      <div class="form-group">
        <label
          for="confirmPassword"
          class="md-label-large text-md-sys-color-on-surface mb-1 block"
        >
          Confirm Password
        </label>
        <div class="md-text-field md-text-field-outlined">
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            required
            class="md-text-field-input"
            :class="{ 'border-red-500': confirmPasswordError }"
            aria-describedby="confirm-password-error"
            @blur="validateConfirmPassword"
            @input="clearConfirmPasswordError"
          />
        </div>
        <div
          v-if="confirmPasswordError"
          id="confirm-password-error"
          class="feedback-error p-2 mt-1 rounded"
          role="alert"
        >
          <p class="md-body-large text-red-700">{{ confirmPasswordError }}</p>
        </div>
      </div>
    </div>

    <!-- Terms and Privacy -->
    <div class="flex items-start gap-3 p-4 md-surface-variant rounded-lg">
      <input
        id="terms"
        v-model="acceptTerms"
        type="checkbox"
        required
        class="mt-1 h-4 w-4 text-md-sys-color-primary focus:ring-md-sys-color-primary border-md-sys-color-outline rounded"
        aria-describedby="terms-error"
      />
      <label
        for="terms"
        class="md-body-large text-md-sys-color-on-surface-variant"
      >
        I agree to the
        <a href="#" class="text-md-sys-color-primary hover:underline"
          >Terms of Service</a
        >
        and
        <a href="#" class="text-md-sys-color-primary hover:underline"
          >Privacy Policy</a
        >
      </label>
    </div>
    <div
      v-if="termsError"
      id="terms-error"
      class="feedback-error p-2 rounded"
      role="alert"
    >
      <p class="md-body-large text-red-700">{{ termsError }}</p>
    </div>

    <!-- Submit Button -->
    <button
      type="submit"
      :disabled="authStore.isLoading || !isFormValid"
      class="w-full md-button md-button-filled mobile-large-touch"
      :aria-busy="authStore.isLoading"
    >
      <LoadingSpinner v-if="authStore.isLoading" size="sm" class="mr-2" />
      {{ authStore.isLoading ? 'Creating Account...' : 'Create Account' }}
    </button>

    <!-- Global Error -->
    <FeedbackAlert
      v-if="authStore.error"
      type="error"
      :message="authStore.error"
      :dismissible="false"
    />

    <!-- Success State -->
    <FeedbackAlert
      v-if="showSuccess"
      type="success"
      title="Account Created!"
      message="Welcome to MaBar. Please check your email to verify your account."
      :dismissible="false"
    />
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import LoadingSpinner from './ui/LoadingSpinner.vue'
import FeedbackAlert from './ui/FeedbackAlert.vue'

const emit = defineEmits<{
  success: []
}>()

const authStore = useAuthStore()

// Form fields
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const acceptTerms = ref(false)

// Validation errors
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const termsError = ref('')

// UI state
const showSuccess = ref(false)

// Validation functions
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value) {
    emailError.value = 'Email is required'
  } else if (!emailRegex.test(email.value)) {
    emailError.value = 'Please enter a valid email address'
  } else {
    emailError.value = ''
  }
}

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = 'Password is required'
  } else if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters long'
  } else {
    passwordError.value = ''
  }
}

const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Please confirm your password'
  } else if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Passwords do not match'
  } else {
    confirmPasswordError.value = ''
  }
}

const validateTerms = () => {
  if (!acceptTerms.value) {
    termsError.value = 'You must accept the terms and conditions'
  } else {
    termsError.value = ''
  }
}

// Clear error functions
const clearEmailError = () => {
  emailError.value = ''
}
const clearPasswordError = () => {
  passwordError.value = ''
}
const clearConfirmPasswordError = () => {
  confirmPasswordError.value = ''
}

// Form validation
const isFormValid = computed(() => {
  return (
    email.value &&
    password.value &&
    confirmPassword.value &&
    acceptTerms.value &&
    !emailError.value &&
    !passwordError.value &&
    !confirmPasswordError.value
  )
})

const handleSubmit = async () => {
  // Validate all fields
  validateEmail()
  validatePassword()
  validateConfirmPassword()
  validateTerms()

  if (!isFormValid.value) {
    return
  }

  const result = await authStore.register(email.value, password.value)
  if (result.success) {
    showSuccess.value = true
    setTimeout(() => {
      emit('success')
    }, 2000)
  }
}
</script>
