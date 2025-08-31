<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="space-y-4">
      <div class="md-text-field md-text-field-outlined">
        <input
          v-model="email"
          type="email"
          placeholder="Email address"
          required
          class="md-text-field-input"
          aria-label="Email address"
        />
      </div>
      <div class="md-text-field md-text-field-outlined">
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          required
          class="md-text-field-input"
          aria-label="Password"
        />
      </div>
    </div>

    <button
      type="submit"
      :disabled="authStore.isLoading"
      class="w-full md-button md-button-filled md-title-large"
      :aria-busy="authStore.isLoading"
    >
      {{ authStore.isLoading ? 'Signing in...' : 'Continue' }}
    </button>

    <div
      v-if="authStore.error"
      class="md-card md-card-filled p-4 border-l-4 border-red-500"
      role="alert"
      aria-live="polite"
    >
      <p class="md-body-large text-red-700">{{ authStore.error }}</p>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const emit = defineEmits<{
  success: []
}>()

const authStore = useAuthStore()
const email = ref('')
const password = ref('')

const handleSubmit = async () => {
  const result = await authStore.login(email.value, password.value)
  if (result.success) {
    emit('success')
  }
}
</script>
