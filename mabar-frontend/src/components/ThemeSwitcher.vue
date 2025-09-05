<template>
  <div class="relative">
    <button
      @click="showMenu = !showMenu"
      class="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      :title="`Current theme: ${themeStore.themeInfo.displayName}`"
    >
      <!-- Theme Icons -->
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <!-- Light theme icon -->
        <path 
          v-if="themeStore.currentTheme === 'light'" 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
        />
        <!-- Dark theme icon -->
        <path 
          v-else-if="themeStore.currentTheme === 'dark'" 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
        />
        <!-- Tennis theme icon -->
        <path 
          v-else 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" 
        />
      </svg>
    </button>
    
    <!-- Theme Menu Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div 
        v-if="showMenu" 
        class="absolute right-0 mt-2 w-56 bg-card border border-border rounded-md shadow-lg z-50"
        @click.stop
      >
        <div class="py-1">
          <div class="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Choose Theme
          </div>
          <button
            v-for="theme in themeStore.availableThemes"
            :key="theme.name"
            @click="selectTheme(theme.name)"
            class="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors flex items-center justify-between"
            :class="{ 'bg-accent': themeStore.currentTheme === theme.name }"
          >
            <div>
              <div class="font-medium">{{ theme.displayName }}</div>
              <div class="text-xs text-muted-foreground">{{ theme.description }}</div>
            </div>
            <div v-if="themeStore.currentTheme === theme.name" class="text-primary">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '../stores/theme'
import type { ThemeType } from '../utils/theme'

const themeStore = useThemeStore()
const showMenu = ref(false)

const selectTheme = (themeName: string) => {
  themeStore.setTheme(themeName as ThemeType)
  showMenu.value = false
}

// Close menu when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
