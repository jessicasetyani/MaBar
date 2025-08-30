<template>
  <div class="min-h-screen flex items-center justify-center p-4" style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%);">
    <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
      <!-- Role Selection for users without role -->
      <RoleSelection 
        v-if="authStore.user && !authStore.user.role"
        @role-selected="handleRoleSelected"
      />
      
      <!-- Auth Forms for non-authenticated users -->
      <div v-else-if="!authStore.user">
        <div class="text-center mb-8">
          <div class="mb-4">
            <div class="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style="background: linear-gradient(45deg, #10b981, #14b8a6);">
              <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
              </svg>
            </div>
          </div>
          <h1 class="text-4xl font-bold mb-2" style="background: linear-gradient(45deg, #059669, #0d9488); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">MaBar</h1>
          <p class="text-gray-600 text-lg">Badminton Match & Venue Booking</p>
        </div>
        
        <div class="bg-gray-100 rounded-xl p-1 mb-8">
          <div class="flex">
            <button
              @click="isLogin = true"
              :class="isLogin ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600 hover:text-emerald-600'"
              class="flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200"
            >
              Login
            </button>
            <button
              @click="isLogin = false"
              :class="!isLogin ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600 hover:text-emerald-600'"
              class="flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200"
            >
              Register
            </button>
          </div>
        </div>
        
        <LoginForm v-if="isLogin" @success="handleAuthSuccess" />
        <RegisterForm v-else @success="handleAuthSuccess" />
      </div>
      
      <!-- Authenticated user dashboard -->
      <div v-else class="text-center">
        <div class="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6" style="background: linear-gradient(45deg, #10b981, #14b8a6);">
          <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Welcome back!</h2>
        <p class="text-gray-600 mb-2">{{ authStore.user.email }}</p>
        <p class="text-emerald-600 font-medium mb-6 capitalize">{{ authStore.user.role?.replace('_', ' ') }}</p>
        <button
          @click="authStore.logout"
          class="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Sign Out
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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
</script>