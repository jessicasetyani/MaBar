<template>
  <div class="max-w-md mx-auto space-y-6">
    <h2 class="text-2xl font-bold text-center text-foreground">Choose Your Role</h2>
    <div class="space-y-4">
      <button
        @click="selectRole('player')"
        :disabled="authStore.isLoading"
        class="w-full p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-accent disabled:opacity-50 transition-all card-enhanced"
      >
        <div class="text-lg font-semibold text-foreground">🏓 Player</div>
        <div class="text-sm text-muted-foreground">Find matches and play badminton</div>
      </button>
      <button
        @click="selectRole('venue_owner')"
        :disabled="authStore.isLoading"
        class="w-full p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-accent disabled:opacity-50 transition-all card-enhanced"
      >
        <div class="text-lg font-semibold text-foreground">🏢 Venue Owner</div>
        <div class="text-sm text-muted-foreground">Manage courts and bookings</div>
      </button>
    </div>
    <div v-if="authStore.isLoading" class="text-center">
      <div
        class="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"
      ></div>
      <p class="text-sm text-muted-foreground mt-2">Saving role...</p>
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
