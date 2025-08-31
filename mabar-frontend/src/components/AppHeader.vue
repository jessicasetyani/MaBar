<template>
  <header class="bg-card shadow-sm border-b border-border">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <router-link to="/" class="text-2xl font-bold text-foreground">
            MaBar
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex space-x-8">
          <router-link
            v-if="user?.role === 'player'"
            to="/dashboard"
            class="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="{ 'text-foreground bg-accent': $route.path === '/dashboard' }"
          >
            Dashboard
          </router-link>
          <router-link
            v-if="user?.role === 'venue_owner'"
            to="/venue-dashboard"
            class="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="{
              'text-foreground bg-accent': $route.path === '/venue-dashboard',
            }"
          >
            Dashboard
          </router-link>
          <router-link
            v-if="user?.role === 'player'"
            to="/profile"
            class="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="{ 'text-foreground bg-accent': $route.path === '/profile' }"
          >
            Profile
          </router-link>
        </nav>

        <!-- User Menu -->
        <div class="flex items-center space-x-4">
          <!-- Theme Switcher -->
          <ThemeSwitcher />

          <span v-if="user" class="text-sm text-muted-foreground">
            {{ user.email }}
          </span>
          <button
            v-if="user"
            @click="handleLogout"
            class="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all"
          >
            Logout
          </button>

          <!-- Mobile menu button -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
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
        class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card border-t border-border"
      >
        <router-link
          v-if="user?.role === 'player'"
          to="/dashboard"
          @click="mobileMenuOpen = false"
          class="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
          :class="{ 'text-foreground bg-accent': $route.path === '/dashboard' }"
        >
          Dashboard
        </router-link>
        <router-link
          v-if="user?.role === 'venue_owner'"
          to="/venue-dashboard"
          @click="mobileMenuOpen = false"
          class="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
          :class="{
            'text-foreground bg-accent': $route.path === '/venue-dashboard',
          }"
        >
          Dashboard
        </router-link>
        <router-link
          v-if="user?.role === 'player'"
          to="/profile"
          @click="mobileMenuOpen = false"
          class="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
          :class="{ 'text-foreground bg-accent': $route.path === '/profile' }"
        >
          Profile
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
import ThemeSwitcher from './ThemeSwitcher.vue'

const router = useRouter()
const authStore = useAuthStore()
const mobileMenuOpen = ref(false)

const { user } = storeToRefs(authStore)

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>
