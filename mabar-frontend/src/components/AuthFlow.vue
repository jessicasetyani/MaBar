<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Role Selection for users without role -->
      <RoleSelection
        v-if="authStore.user && !authStore.user.role"
        @role-selected="handleRoleSelected"
      />

      <!-- Auth Forms for non-authenticated users -->
      <div
        v-else-if="!authStore.user"
        class="bg-card rounded-3xl shadow-xl border border-border overflow-hidden card-enhanced"
      >
        <!-- Header -->
        <div class="bg-primary px-8 py-12 text-center">
          <div
            class="w-20 h-20 mx-auto bg-primary-foreground/20 rounded-full flex items-center justify-center mb-6"
          >
            <svg
              class="w-10 h-10 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-primary-foreground mb-2">MaBar</h1>
          <p class="text-primary-foreground/80">Badminton Match & Venue Booking</p>
        </div>

        <!-- Form Content -->
        <div class="p-8">
          <!-- Tab Toggle -->
          <div class="flex bg-slate-100 rounded-2xl p-1 mb-8">
            <button
              @click="isLogin = true"
              :class="
                isLogin ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600'
              "
              class="flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200"
            >
              Sign In
            </button>
            <button
              @click="isLogin = false"
              :class="
                !isLogin
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-600'
              "
              class="flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200"
            >
              Sign Up
            </button>
          </div>

          <LoginForm v-if="isLogin" @success="handleAuthSuccess" />
          <RegisterForm v-else @success="handleAuthSuccess" />
        </div>
      </div>

      <!-- Authenticated user with completed onboarding -->
      <div
        v-else-if="authStore.user && authStore.hasCompletedOnboarding"
        class="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center"
      >
        <div
          class="w-20 h-20 mx-auto bg-emerald-500 rounded-full flex items-center justify-center mb-6"
        >
          <svg
            class="w-10 h-10 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 mb-2">Welcome back!</h2>
        <p class="text-slate-600 mb-2">{{ authStore.user.email }}</p>
        <p class="text-emerald-600 font-medium mb-8 capitalize">
          {{ authStore.user.role?.replace('_', ' ') }}
        </p>
        <button
          @click="authStore.logout"
          class="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-2xl transition-all duration-200 font-medium"
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
        class="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center"
      >
        <div class="text-4xl mb-4">⏳</div>
        <h2 class="text-xl font-semibold text-slate-700 mb-4">
          Redirecting to Onboarding...
        </h2>
        <p class="text-slate-600 mb-4">
          Please complete your
          {{ authStore.user.role?.replace('_', ' ') }} profile setup.
        </p>
        <div
          class="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto"
        ></div>
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
</script>
