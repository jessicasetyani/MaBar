<template>
  <form @submit.prevent="handleSubmit" class="form-composition" novalidate>
    <div class="space-y-4">
      <!-- Email Field -->
      <div class="form-group">
        <label
          for="login-email"
          class="md-label-large text-md-sys-color-on-surface mb-1 block"
        >
          Email Address
        </label>
        <div class="md-text-field md-text-field-outlined">
          <input
            id="login-email"
            v-model="email"
            type="email"
            placeholder="Enter your email address"
            required
            class="md-text-field-input"
            :class="{ 'border-red-500': emailError }"
            aria-describedby="login-email-error"
            @blur="validateEmail"
            @input="clearEmailError"
          />
        </div>
        <div
          v-if="emailError"
          id="login-email-error"
          class="feedback-error p-2 mt-1 rounded"
          role="alert"
        >
          <p class="md-body-large text-red-700">{{ emailError }}</p>
        </div>
      </div>

      <!-- Password Field -->
      <div class="form-group">
        <label
          for="login-password"
          class="md-label-large text-md-sys-color-on-surface mb-1 block"
        >
          Password
        </label>
        <div class="md-text-field md-text-field-outlined">
          <input
            id="login-password"
            v-model="password"
            type="password"
            placeholder="Enter your password"
            required
            class="md-text-field-input"
            :class="{ 'border-red-500': passwordError }"
            aria-describedby="login-password-error"
            @blur="validatePassword"
            @input="clearPasswordError"
          />
        </div>
        <div
          v-if="passwordError"
          id="login-password-error"
          class="feedback-error p-2 mt-1 rounded"
          role="alert"
        >
          <p class="md-body-large text-red-700">{{ passwordError }}</p>
        </div>
      </div>
    </div>

    <!-- Forgot Password Link -->
    <div class="text-right">
      <a
        href="#"
        class="md-label-large text-md-sys-color-primary hover:underline focus-visible"
      >
        Forgot your password?
      </a>
    </div>

    <!-- Submit Button -->
    <button
      type="submit"
      :disabled="authStore.isLoading || !isFormValid"
      class="w-full md-button md-button-filled mobile-large-touch"
      :aria-busy="authStore.isLoading"
    >
      <LoadingSpinner v-if="authStore.isLoading" size="sm" class="mr-2" />
      {{ authStore.isLoading ? 'Signing in...' : 'Sign In' }}
    </button>

    <!-- Global Error -->
    <FeedbackAlert
      v-if="authStore.error"
      type="error"
      :message="authStore.error"
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

// Validation errors
const emailError = ref('')
const passwordError = ref('')

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
  } else {
    passwordError.value = ''
  }
}

// Clear error functions
const clearEmailError = () => {
  emailError.value = ''
}
const clearPasswordError = () => {
  passwordError.value = ''
}

// Form validation
const isFormValid = computed(() => {
  return (
    email.value && password.value && !emailError.value && !passwordError.value
  )
})

const handleSubmit = async () => {
  // Validate all fields
  validateEmail()
  validatePassword()

  if (!isFormValid.value) {
    return
  }

  const result = await authStore.login(email.value, password.value)
  if (result.success) {
    emit('success')
  }
}
</script>
