<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
      <!-- Role Selection for users without role -->
      <RoleSelection 
        v-if="authStore.user && !authStore.user.role"
        @role-selected="handleRoleSelected"
      />
      
      <!-- Auth Forms for non-authenticated users -->
      <div v-else-if="!authStore.user">
        <div class="text-center mb-6">
          <h1 class="text-3xl font-bold text-gray-900">MaBar</h1>
          <p class="text-gray-600">Badminton Match & Venue Booking</p>
        </div>
        
        <div class="flex space-x-2 mb-6">
          <button
            @click="isLogin = true"
            :class="isLogin ? 'bg-blue-600 text-white' : 'bg-gray-200'"
            class="flex-1 py-2 px-4 rounded-lg"
          >
            Sign In
          </button>
          <button
            @click="isLogin = false"
            :class="!isLogin ? 'bg-blue-600 text-white' : 'bg-gray-200'"
            class="flex-1 py-2 px-4 rounded-lg"
          >
            Sign Up
          </button>
        </div>
        
        <LoginForm v-if="isLogin" @success="handleAuthSuccess" />
        <RegisterForm v-else @success="handleAuthSuccess" />
      </div>
      
      <!-- Authenticated user dashboard -->
      <div v-else class="text-center">
        <h2 class="text-xl font-semibold mb-4">Welcome, {{ authStore.user.email }}!</h2>
        <p class="text-gray-600 mb-4">Role: {{ authStore.user.role }}</p>
        <button
          @click="authStore.logout"
          class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'
import RoleSelection from './RoleSelection.vue'

const authStore = useAuthStore()
const isLogin = ref(true)

const handleAuthSuccess = () => {
  // Auth success handled by store reactivity
}

const handleRoleSelected = (role: 'player' | 'venue_owner') => {
  console.log('Role selected:', role)
}
</script>