<template>
  <div class="max-w-md mx-auto space-y-6">
    <h2 class="text-2xl font-bold text-center">Choose Your Role</h2>
    <div class="space-y-4">
      <button
        @click="selectRole('player')"
        :disabled="authStore.isLoading"
        class="w-full p-4 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50"
      >
        <div class="text-lg font-semibold">🏓 Player</div>
        <div class="text-sm text-gray-600">Find matches and play badminton</div>
      </button>
      <button
        @click="selectRole('venue_owner')"
        :disabled="authStore.isLoading"
        class="w-full p-4 border-2 border-green-200 rounded-lg hover:border-green-500 hover:bg-green-50 disabled:opacity-50"
      >
        <div class="text-lg font-semibold">🏢 Venue Owner</div>
        <div class="text-sm text-gray-600">Manage courts and bookings</div>
      </button>
    </div>
    <div v-if="authStore.error" class="text-red-600 text-sm text-center">
      {{ authStore.error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'

const emit = defineEmits<{
  roleSelected: [role: 'player' | 'venue_owner']
}>()

const authStore = useAuthStore()

const selectRole = async (role: 'player' | 'venue_owner') => {
  const result = await authStore.setUserRole(role)
  if (result.success) {
    emit('roleSelected', role)
  }
}
</script>