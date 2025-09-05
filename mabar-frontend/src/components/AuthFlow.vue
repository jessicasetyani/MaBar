<template>
  <div class="min-h-screen md-surface flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Role Selection for users without role -->
      <RoleSelection
        v-if="authStore.user && !authStore.user.role"
        @role-selected="handleRoleSelected"
      />

      <!-- Auth Forms for non-authenticated users -->
      <div
        v-else-if="!authStore.user"
        class="md-card md-elevation-3 overflow-hidden"
      >
        <!-- Header -->
        <div class="md-primary p-6 text-center">
          <div class="w-10 h-10 mx-auto mb-4 flex items-center justify-center">
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1
            class="md-headline-medium font-medium text-md-sys-color-on-primary mb-1"
          >
            MaBar
          </h1>
          <p class="md-body-medium text-md-sys-color-on-primary opacity-80">
            Smart Padel Matchmaking
          </p>
        </div>

        <!-- Form Content -->
        <div class="p-6">
          <!-- Tab Toggle -->
          <div
            class="flex bg-slate-100 rounded-lg p-1 mb-6"
            role="tablist"
            aria-label="Authentication options"
          >
            <button
              @click="isLogin = true"
              :class="[
                'flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2',
                isLogin
                  ? 'bg-white text-slate-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              ]"
              role="tab"
              :aria-selected="isLogin"
              :tabindex="isLogin ? 0 : -1"
              id="signin-tab"
            >
              Sign In
            </button>
            <button
              @click="isLogin = false"
              :class="[
                'flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2',
                !isLogin
                  ? 'bg-white text-slate-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              ]"
              role="tab"
              :aria-selected="!isLogin"
              :tabindex="!isLogin ? 0 : -1"
              id="signup-tab"
            >
              Sign Up
            </button>
          </div>

          <!-- Form Section -->
          <div
            role="tabpanel"
            :aria-labelledby="isLogin ? 'signin-tab' : 'signup-tab'"
          >
            <LoginForm v-if="isLogin" @success="handleAuthSuccess" />
            <RegisterForm v-else @success="handleAuthSuccess" />
          </div>
        </div>
      </div>

      <!-- Authenticated user with completed onboarding -->
      <div
        v-else-if="authStore.user && authStore.hasCompletedOnboarding"
        class="md-card md-elevation-2 p-xl text-center"
      >
        <div
          class="w-16 h-16 mx-auto md-secondary rounded-full flex items-center justify-center mb-6"
        >
          <svg
            class="w-8 h-8 text-md-sys-color-on-secondary"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            />
          </svg>
        </div>
        <h2 class="md-headline-large mb-2">Welcome back!</h2>
        <p class="md-body-large text-md-sys-color-on-surface-variant mb-2">
          {{ authStore.user.email }}
        </p>
        <p class="md-label-large text-md-sys-color-secondary mb-6 capitalize">
          {{ authStore.user.role?.replace('_', ' ') }}
        </p>
        <button
          @click="authStore.logout"
          class="md-button md-button-outlined"
          type="button"
        >
          Sign Out
        </button>
      </div>

      <!-- User with role but pending onboarding - redirect to onboarding -->
      <div
        v-else-if="
          authStore.user &&
          authStore.user.role &&
          !authStore.hasCompletedOnboarding
        "
        class="md-card md-elevation-2 p-xl text-center"
      >
        <div class="text-4xl mb-4" aria-hidden="true">⏳</div>
        <h2 class="md-title-large mb-4">Redirecting to Onboarding...</h2>
        <p class="md-body-large text-md-sys-color-on-surface-variant mb-6">
          Please complete your
          {{ authStore.user.role?.replace('_', ' ') }} profile setup.
        </p>
        <LoadingSpinner size="md" :show-text="false" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'
import RoleSelection from './RoleSelection.vue'
import LoadingSpinner from './ui/LoadingSpinner.vue'

const authStore = useAuthStore()
const router = useRouter()
const isLogin = ref(true)

const handleAuthSuccess = () => {
  // Auth success handled by store reactivity
}

const handleRoleSelected = (role: 'player' | 'venue_owner') => {
  if (role === 'player') {
    router.push('/onboarding/player')
  } else {
    router.push('/onboarding/venue-owner')
  }
}

// Watch for users who have a role but haven't completed onboarding
watch(
  () => authStore.user,
  (user) => {
    if (user && user.role && !authStore.hasCompletedOnboarding) {
      console.log('🔄 Auto-redirecting to onboarding for role:', user.role)
      if (user.role === 'player') {
        router.push('/onboarding/player')
      } else if (user.role === 'venue_owner') {
        router.push('/onboarding/venue-owner')
      }
    }
  },
  { immediate: true }
)

// Watch for users who have completed onboarding and should go to dashboard
watch(
  () => [authStore.user, authStore.hasCompletedOnboarding],
  ([user, hasCompletedOnboarding]) => {
    if (user && user.role && hasCompletedOnboarding) {
      console.log('🎯 Auto-redirecting completed user to dashboard for role:', user.role)
      if (user.role === 'player') {
        router.push('/dashboard')
      } else if (user.role === 'venue_owner') {
        router.push('/venue-dashboard')
      }
    }
  },
  { immediate: true }
)
</script>
