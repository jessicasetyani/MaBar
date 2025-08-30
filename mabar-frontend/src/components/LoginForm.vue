<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="space-y-4">
      <div>
        <input
          v-model="email"
          type="email"
          placeholder="Email address"
          required
          class="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50 focus:bg-white"
        />
      </div>
      <div>
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          required
          class="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50 focus:bg-white"
        />
      </div>
    </div>
    
    <button
      type="submit"
      :disabled="authStore.isLoading"
      class="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
    >
      {{ authStore.isLoading ? 'Logging in...' : 'Login' }}
    </button>
    
    <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
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