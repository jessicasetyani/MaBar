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
        minlength="6"
        class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <button
      type="submit"
      :disabled="authStore.isLoading"
      class="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {{ authStore.isLoading ? 'Creating Account...' : 'Sign Up' }}
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
  const result = await authStore.register(email.value, password.value)
  if (result.success) {
    emit('success')
  }
}
</script>
</template>
<parameter name="explanation">Creating minimal registration form component with validation and auth store integration