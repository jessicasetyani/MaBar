<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <router-link to="/" class="text-2xl font-bold text-text">
            MaBar
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex space-x-8">
          <router-link
            v-if="user?.role === 'player'"
            to="/dashboard"
            class="text-subtle hover:text-text px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="{ 'text-text bg-background': $route.path === '/dashboard' }"
          >
            Dashboard
          </router-link>
          <router-link
            v-if="user?.role === 'venue_owner'"
            to="/venue-dashboard"
            class="text-subtle hover:text-text px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="{
              'text-text bg-background': $route.path === '/venue-dashboard',
            }"
          >
            Dashboard
          </router-link>
          <router-link
            v-if="user?.role === 'player'"
            to="/profile"
            class="text-subtle hover:text-text px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="{ 'text-text bg-background': $route.path === '/profile' }"
          >
            Profile
          </router-link>
        </nav>

        <!-- User Menu -->
        <div class="flex items-center space-x-4">
          <span v-if="user" class="text-sm text-subtle">
            {{ user.email }}
          </span>
          <button
            v-if="user"
            @click="handleLogout"
            class="bg-text text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Logout
          </button>

          <!-- Mobile menu button -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-subtle hover:text-text hover:bg-background"
          >
            <svg
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                v-if="!mobileMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <div v-if="mobileMenuOpen" class="md:hidden">
      <div
        class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-gray-200"
      >
        <router-link
          v-if="user?.role === 'player'"
          to="/dashboard"
          @click="mobileMenuOpen = false"
          class="text-subtle hover:text-text block px-3 py-2 rounded-md text-base font-medium transition-colors"
          :class="{ 'text-text bg-surface': $route.path === '/dashboard' }"
        >
          Dashboard
        </router-link>
        <router-link
          v-if="user?.role === 'venue_owner'"
          to="/venue-dashboard"
          @click="mobileMenuOpen = false"
          class="text-subtle hover:text-text block px-3 py-2 rounded-md text-base font-medium transition-colors"
          :class="{
            'text-text bg-surface': $route.path === '/venue-dashboard',
          }"
        >
          Dashboard
        </router-link>
        <router-link
          v-if="user?.role === 'player'"
          to="/profile"
          @click="mobileMenuOpen = false"
          class="text-subtle hover:text-text block px-3 py-2 rounded-md text-base font-medium transition-colors"
          :class="{ 'text-text bg-surface': $route.path === '/profile' }"
        >
          > Profile
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const mobileMenuOpen = ref(false)

const { user } = storeToRefs(authStore)

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>
