/**
 * Theme Management Utility
 * Handles switching between different design themes
 */

export type ThemeType = 'light' | 'dark' | 'tennis'

export interface Theme {
  name: string
  displayName: string
  description: string
}

export const themes: Record<ThemeType, Theme> = {
  light: {
    name: 'light',
    displayName: 'MaBar Light',
    description: 'Original MaBar yellow and green theme'
  },
  dark: {
    name: 'dark', 
    displayName: 'Dark Mode',
    description: 'Modern dark theme with high contrast'
  },
  tennis: {
    name: 'tennis',
    displayName: 'Tennis Green',
    description: 'Tennis-inspired green theme'
  }
}

/**
 * Get the current theme from localStorage or default to light
 */
export function getCurrentTheme(): ThemeType {
  if (typeof window === 'undefined') return 'light'
  
  const stored = localStorage.getItem('mabar-theme') as ThemeType
  return stored && stored in themes ? stored : 'light'
}

/**
 * Apply a theme to the document
 */
export function applyTheme(theme: ThemeType): void {
  if (typeof window === 'undefined') return
  
  const root = document.documentElement
  
  // Remove existing theme attributes
  root.removeAttribute('data-theme')
  
  // Apply new theme
  if (theme !== 'light') {
    root.setAttribute('data-theme', theme)
  }
  
  // Store preference
  localStorage.setItem('mabar-theme', theme)
  
  // Dispatch custom event for components that need to react
  window.dispatchEvent(new CustomEvent('theme-changed', { 
    detail: { theme } 
  }))
}

/**
 * Toggle between light and dark themes
 */
export function toggleDarkMode(): void {
  const current = getCurrentTheme()
  const newTheme = current === 'dark' ? 'light' : 'dark'
  applyTheme(newTheme)
}

/**
 * Initialize theme on app startup
 */
export function initializeTheme(): void {
  const theme = getCurrentTheme()
  applyTheme(theme)
}

/**
 * Get all available themes
 */
export function getAvailableThemes(): Theme[] {
  return Object.values(themes)
}

/**
 * Check if current theme is dark
 */
export function isDarkTheme(): boolean {
  return getCurrentTheme() === 'dark'
}

/**
 * Get theme display information
 */
export function getThemeInfo(theme: ThemeType): Theme {
  return themes[theme]
}
