<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="space-y-5">
      <div>
        <input
          v-model="email"
          type="email"
          placeholder="Email address"
          required
          class="w-full px-4 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-500"
        />
      </div>
      <div>
        <input
          v-model="password"
          type="password"
          placeholder="Password (min. 6 characters)"
          required
          minlength="6"
          class="w-full px-4 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-500"
        />
      </div>
    </div>

    <button
      type="submit"
      :disabled="authStore.isLoading"
      class="w-full text-white py-4 px-6 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg"
      :class="
        authStore.isLoading
          ? 'bg-slate-400'
          : 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700'
      "
    >
      {{ authStore.isLoading ? 'Creating Account...' : 'Get Started' }}
    </button>

    <div
      v-if="authStore.error"
      class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm"
    >
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
