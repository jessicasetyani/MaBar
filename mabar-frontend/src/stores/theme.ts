import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  type ThemeType, 
  getCurrentTheme, 
  applyTheme, 
  getAvailableThemes,
  isDarkTheme,
  getThemeInfo
} from '../utils/theme'

export const useThemeStore = defineStore('theme', () => {
  // State
  const currentTheme = ref<ThemeType>(getCurrentTheme())
  
  // Getters
  const theme = computed(() => currentTheme.value)
  const themeInfo = computed(() => getThemeInfo(currentTheme.value))
  const availableThemes = computed(() => getAvailableThemes())
  const isCurrentlyDark = computed(() => isDarkTheme())
  
  // Actions
  function setTheme(newTheme: ThemeType) {
    currentTheme.value = newTheme
    applyTheme(newTheme)
  }
  
  function toggleDarkMode() {
    const newTheme = currentTheme.value === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }
  
  function initTheme() {
    const theme = getCurrentTheme()
    currentTheme.value = theme
    applyTheme(theme)
  }
  
  // Listen for theme changes from other sources
  if (typeof window !== 'undefined') {
    window.addEventListener('theme-changed', (event: any) => {
      currentTheme.value = event.detail.theme
    })
  }
  
  return {
    // State
    currentTheme: theme,
    themeInfo,
    availableThemes,
    isCurrentlyDark,
    
    // Actions
    setTheme,
    toggleDarkMode,
    initTheme
  }
})
