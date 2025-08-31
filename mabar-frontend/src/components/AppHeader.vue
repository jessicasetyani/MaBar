<template>
  <header
    class="md-surface md-elevation-1 border-b border-outline-variant"
    role="banner"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <router-link
            to="/"
            class="md-headline-large font-bold text-primary focus:outline-2 focus:outline-primary rounded"
            aria-label="MaBar home"
          >
            MaBar
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <nav
          class="hidden md:flex"
          role="navigation"
          aria-label="Main navigation"
        >
          <ul class="flex space-x-2">
            <li v-if="user?.role === 'player'">
              <router-link
                to="/dashboard"
                class="md-navigation-item"
                :class="{ active: $route.path === '/dashboard' }"
                aria-current="page"
              >
                Dashboard
              </router-link>
            </li>
            <li v-if="user?.role === 'venue_owner'">
              <router-link
                to="/venue-dashboard"
                class="md-navigation-item"
                :class="{ active: $route.path === '/venue-dashboard' }"
              >
                Dashboard
              </router-link>
            </li>
            <li v-if="user?.role === 'player'">
              <router-link
                to="/profile"
                class="md-navigation-item"
                :class="{ active: $route.path === '/profile' }"
              >
                Profile
              </router-link>
            </li>
          </ul>
        </nav>

        <!-- User Menu -->
        <div class="flex items-center space-x-4">
          <!-- Theme Switcher -->
          <ThemeSwitcher />

          <span
            v-if="user"
            class="md-body-large text-muted-foreground hidden sm:block"
          >
            {{ user.email }}
          </span>
          <button
            v-if="user"
            @click="handleLogout"
            class="md-button md-button-filled"
            type="button"
          >
            Logout
          </button>

          <!-- Mobile menu button -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden md-button md-button-text p-2"
            type="button"
            :aria-expanded="mobileMenuOpen"
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
          >
            <svg
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
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
    <div
      v-if="mobileMenuOpen"
      id="mobile-menu"
      class="md:hidden md-navigation-bar"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <router-link
          v-if="user?.role === 'player'"
          to="/dashboard"
          @click="mobileMenuOpen = false"
          class="md-navigation-item block w-full text-left"
          :class="{ active: $route.path === '/dashboard' }"
        >
          Dashboard
        </router-link>
        <router-link
          v-if="user?.role === 'venue_owner'"
          to="/venue-dashboard"
          @click="mobileMenuOpen = false"
          class="md-navigation-item block w-full text-left"
          :class="{ active: $route.path === '/venue-dashboard' }"
        >
          Dashboard
        </router-link>
        <router-link
          v-if="user?.role === 'player'"
          to="/profile"
          @click="mobileMenuOpen = false"
          class="md-navigation-item block w-full text-left"
          :class="{ active: $route.path === '/profile' }"
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
