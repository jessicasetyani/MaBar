<template>
  <form @submit.prevent="handleSubmit" class="space-y-4 max-w-md mx-auto">
    <div>
      <input
        v-model="email"
        type="email"
        placeholder="Email"
        required
        class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div>
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        required
        class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <button
      type="submit"
      :disabled="authStore.isLoading"
      class="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
    >
      {{ authStore.isLoading ? 'Signing In...' : 'Sign In' }}
    </button>
    <div v-if="authStore.error" class="text-red-600 text-sm">
      {{ authStore.error }}
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