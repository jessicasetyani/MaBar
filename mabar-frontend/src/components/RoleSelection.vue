<template>
  <div class="max-w-md mx-auto space-y-6">
    <h1 class="md-headline-large text-center">Choose Your Role</h1>
    <p class="md-body-large text-center text-muted-foreground">
      Select how you'll use MaBar
    </p>

    <div
      class="space-y-4"
      role="radiogroup"
      aria-labelledby="role-selection-heading"
    >
      <button
        @click="selectRole('player')"
        :disabled="authStore.isLoading"
        class="w-full md-card md-card-outlined p-6 hover:md-elevation-2 focus:outline-2 focus:outline-primary transition-all"
        role="radio"
        :aria-checked="false"
        aria-describedby="player-description"
      >
        <div class="flex items-center space-x-4">
          <div class="text-4xl" aria-hidden="true">🏓</div>
          <div class="text-left flex-1">
            <div class="md-title-large">Player</div>
            <div
              id="player-description"
              class="md-body-large text-muted-foreground"
            >
              Find matches and play padel
            </div>
          </div>
        </div>
      </button>

      <button
        @click="selectRole('venue_owner')"
        :disabled="authStore.isLoading"
        class="w-full md-card md-card-outlined p-6 hover:md-elevation-2 focus:outline-2 focus:outline-primary transition-all"
        role="radio"
        :aria-checked="false"
        aria-describedby="venue-description"
      >
        <div class="flex items-center space-x-4">
          <div class="text-4xl" aria-hidden="true">🏢</div>
          <div class="text-left flex-1">
            <div class="md-title-large">Venue Owner</div>
            <div
              id="venue-description"
              class="md-body-large text-muted-foreground"
            >
              Manage courts and bookings
            </div>
          </div>
        </div>
      </button>
    </div>

    <div v-if="authStore.isLoading" class="text-center" aria-live="polite">
      <div class="flex items-center justify-center space-x-2">
        <div
          class="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"
        ></div>
        <span class="md-body-large">Saving role...</span>
      </div>
    </div>

    <div
      v-if="authStore.error"
      class="md-card md-card-filled p-4 border-l-4 border-red-500"
      role="alert"
      aria-live="polite"
    >
      <p class="md-body-large text-red-700">{{ authStore.error }}</p>
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
