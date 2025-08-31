<template>
  <div class="md-card md-elevation-3 overflow-hidden max-w-md mx-auto">
    <!-- Header Section -->
    <div class="md-primary p-xl text-center">
      <div class="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
        <svg
          class="w-12 h-12 text-md-sys-color-on-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>
      <h1
        class="md-headline-large font-medium text-md-sys-color-on-primary mb-2"
      >
        Choose Your Role
      </h1>
      <p class="md-body-large text-md-sys-color-on-primary opacity-80">
        Select how you'll use MaBar
      </p>
    </div>

    <!-- Role Selection Content -->
    <div class="p-xl">
      <div
        class="space-y-4"
        role="radiogroup"
        aria-labelledby="role-selection-heading"
      >
        <!-- Player Role Card -->
        <div class="role-card-wrapper">
          <button
            @click="selectRole('player')"
            :disabled="authStore.isLoading"
            class="role-card role-card-player"
            role="radio"
            :aria-checked="false"
            aria-describedby="player-description"
          >
            <div class="role-card-content">
              <div class="role-icon-container role-icon-player">
                <svg
                  class="w-8 h-8 text-md-sys-color-on-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div class="role-text-content">
                <div class="md-title-large text-md-sys-color-on-surface mb-1">
                  Player
                </div>
                <div
                  id="player-description"
                  class="md-body-large text-md-sys-color-on-surface-variant"
                >
                  Find matches and play padel
                </div>
                <div class="role-features">
                  <span class="role-feature-tag">Match Finding</span>
                  <span class="role-feature-tag">Court Booking</span>
                </div>
              </div>
            </div>
            <div class="role-card-arrow">
              <svg
                class="w-5 h-5 text-md-sys-color-on-surface-variant"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
            <div class="ripple-overlay"></div>
          </button>
        </div>

        <!-- Venue Owner Role Card -->
        <div class="role-card-wrapper">
          <button
            @click="selectRole('venue_owner')"
            :disabled="authStore.isLoading"
            class="role-card role-card-venue"
            role="radio"
            :aria-checked="false"
            aria-describedby="venue-description"
          >
            <div class="role-card-content">
              <div class="role-icon-container role-icon-venue">
                <svg
                  class="w-8 h-8 text-md-sys-color-on-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div class="role-text-content">
                <div class="md-title-large text-md-sys-color-on-surface mb-1">
                  Venue Owner
                </div>
                <div
                  id="venue-description"
                  class="md-body-large text-md-sys-color-on-surface-variant"
                >
                  Manage courts and bookings
                </div>
                <div class="role-features">
                  <span class="role-feature-tag">Court Management</span>
                  <span class="role-feature-tag">Analytics</span>
                </div>
              </div>
            </div>
            <div class="role-card-arrow">
              <svg
                class="w-5 h-5 text-md-sys-color-on-surface-variant"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
            <div class="ripple-overlay"></div>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="authStore.isLoading"
        class="text-center mt-6"
        aria-live="polite"
      >
        <LoadingSpinner size="md" />
        <p class="md-body-large text-md-sys-color-on-surface-variant mt-2">
          Setting up your account...
        </p>
      </div>

      <!-- Error State -->
      <FeedbackAlert
        v-if="authStore.error"
        type="error"
        :message="authStore.error"
        :dismissible="false"
        class="mt-6"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import LoadingSpinner from './ui/LoadingSpinner.vue'
import FeedbackAlert from './ui/FeedbackAlert.vue'

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

<style scoped>
/* Material Design 3 Role Selection Cards */
.role-card-wrapper {
  position: relative;
}

.role-card {
  @apply w-full relative overflow-hidden;
  background-color: var(--md-sys-color-surface);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-large);
  padding: 24px;
  transition: all var(--md-sys-motion-duration-short4)
    var(--md-sys-motion-easing-standard);
  cursor: pointer;
  outline: none;
  min-height: 88px;
}

.role-card:hover {
  border-color: var(--md-sys-color-outline);
  box-shadow: var(--md-sys-elevation-level2);
  transform: translateY(-2px);
}

.role-card:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.role-card:active {
  transform: translateY(0);
  box-shadow: var(--md-sys-elevation-level1);
}

.role-card:disabled {
  opacity: 0.38;
  pointer-events: none;
  transform: none;
}

.role-card-content {
  @apply flex items-start space-x-4 relative z-10;
}

.role-text-content {
  @apply flex-1 text-left;
}

.role-card-arrow {
  @apply absolute top-6 right-6 opacity-60;
  transition: all var(--md-sys-motion-duration-short2)
    var(--md-sys-motion-easing-standard);
}

.role-card:hover .role-card-arrow {
  opacity: 100;
  transform: translateX(4px);
}

/* Role Icon Containers */
.role-icon-container {
  @apply w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0;
  transition: all var(--md-sys-motion-duration-short4)
    var(--md-sys-motion-easing-standard);
}

.role-icon-player {
  background-color: var(--md-sys-color-secondary);
}

.role-icon-venue {
  background-color: var(--md-sys-color-primary);
}

.role-card:hover .role-icon-container {
  transform: scale(1.05);
  box-shadow: var(--md-sys-elevation-level2);
}

/* Role Feature Tags */
.role-features {
  @apply flex flex-wrap gap-2 mt-3;
}

.role-feature-tag {
  @apply px-3 py-1 rounded-full text-xs font-medium;
  background-color: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
  border: 1px solid var(--md-sys-color-outline-variant);
  transition: all var(--md-sys-motion-duration-short2)
    var(--md-sys-motion-easing-standard);
}

.role-card:hover .role-feature-tag {
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  border-color: var(--md-sys-color-secondary);
}

/* Material Design 3 Ripple Effect */
.ripple-overlay {
  @apply absolute inset-0 pointer-events-none overflow-hidden;
  border-radius: inherit;
}

.role-card:active .ripple-overlay::before {
  content: '';
  @apply absolute inset-0;
  background: radial-gradient(
    circle,
    var(--md-sys-color-primary) 0%,
    transparent 70%
  );
  opacity: 0.12;
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 0.12;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}

/* Role-specific hover states */
.role-card-player:hover {
  border-color: var(--md-sys-color-secondary);
  background: linear-gradient(
    135deg,
    var(--md-sys-color-surface) 0%,
    var(--md-sys-color-secondary-container) 100%
  );
}

.role-card-venue:hover {
  border-color: var(--md-sys-color-primary);
  background: linear-gradient(
    135deg,
    var(--md-sys-color-surface) 0%,
    var(--md-sys-color-primary-container) 100%
  );
}

/* Mobile Responsive Adjustments */
@media (max-width: 768px) {
  .role-card {
    padding: 20px;
    min-height: 80px;
  }

  .role-icon-container {
    @apply w-14 h-14;
  }

  .role-card-content {
    @apply space-x-3;
  }

  .role-feature-tag {
    @apply px-2 py-1 text-xs;
  }
}

/* Accessibility Enhancements */
@media (prefers-reduced-motion: reduce) {
  .role-card,
  .role-icon-container,
  .role-card-arrow,
  .role-feature-tag {
    transition: none;
  }

  .role-card:hover {
    transform: none;
  }

  .role-card:hover .role-icon-container {
    transform: none;
  }

  .role-card:hover .role-card-arrow {
    transform: none;
  }
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  .role-card {
    border-width: 2px;
  }

  .role-feature-tag {
    border-width: 2px;
  }
}
</style>
