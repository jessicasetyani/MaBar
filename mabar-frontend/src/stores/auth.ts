import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Parse from '../services/back4app'

export interface User {
  id: string
  email: string
  role?: 'player' | 'venue_owner' | null
  onboardingStatus?: 'pending' | 'completed' | null
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const register = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      const parseUser = new Parse.User()
      parseUser.set('username', email)
      parseUser.set('email', email)
      parseUser.set('password', password)

      const result = await parseUser.signUp()
      user.value = {
        id: result.id || '',
        email: result.get('email'),
        role: result.get('role') || null,
        onboardingStatus: result.get('onboardingStatus') || null,
      }
      return { success: true }
    } catch (err: any) {
      // Fallback for development when Back4App is not available
      if (err.message.includes('unauthorized') || err.message.includes('403')) {
        console.warn(
          'Back4App unavailable, using mock registration for development'
        )
        const mockUser = {
          id: 'mock-' + Date.now(),
          email: email,
          role: null,
          onboardingStatus: null,
        }
        user.value = mockUser
        localStorage.setItem('mabar_mock_user', JSON.stringify(mockUser))
        return { success: true }
      }
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  const login = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await Parse.User.logIn(email, password)
      user.value = {
        id: result.id || '',
        email: result.get('email'),
        role: result.get('role') || null,
        onboardingStatus: result.get('onboardingStatus') || null,
      }
      return { success: true }
    } catch (err: any) {
      // Fallback for development when Back4App is not available
      if (err.message.includes('unauthorized') || err.message.includes('403')) {
        console.warn('Back4App unavailable, using mock login for development')
        const mockUser = {
          id: 'mock-' + Date.now(),
          email: email,
          role: null,
          onboardingStatus: null,
        }
        user.value = mockUser
        localStorage.setItem('mabar_mock_user', JSON.stringify(mockUser))
        return { success: true }
      }
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await Parse.User.logOut()
      user.value = null
      error.value = null
      localStorage.removeItem('mabar_mock_user')
      localStorage.removeItem('mabar_onboarding_status')
    } catch {
      // Clear mock data even if Parse logout fails
      user.value = null
      error.value = null
      localStorage.removeItem('mabar_mock_user')
      localStorage.removeItem('mabar_onboarding_status')
    }
  }

  const setUserRole = async (role: 'player' | 'venue_owner') => {
    if (!user.value) return { success: false, error: 'No user logged in' }

    isLoading.value = true
    error.value = null

    try {
      const currentUser = Parse.User.current()

      if (currentUser) {
        // Real Parse user - save to backend
        currentUser.set('role', role)
        currentUser.set('onboardingStatus', 'pending')
        await currentUser.save()
      } else {
        // Mock user - just update local state
        console.log('🔧 Mock mode: Setting role locally')
      }

      // Update local state in both cases
      user.value.role = role
      user.value.onboardingStatus = 'pending'

      // Persist mock user data if no Parse user
      if (!currentUser) {
        localStorage.setItem('mabar_mock_user', JSON.stringify(user.value))
      }

      return { success: true }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  const checkSession = () => {
    const currentUser = Parse.User.current()
    if (currentUser) {
      // Get onboarding status from user or localStorage backup
      const onboardingStatus =
        currentUser.get('onboardingStatus') ||
        localStorage.getItem('mabar_onboarding_status') ||
        null

      user.value = {
        id: currentUser.id || '',
        email: currentUser.get('email'),
        role: currentUser.get('role') || null,
        onboardingStatus: onboardingStatus as 'pending' | 'completed' | null,
      }
    } else {
      // Check for mock user in localStorage
      const mockUser = localStorage.getItem('mabar_mock_user')
      if (mockUser) {
        user.value = JSON.parse(mockUser)
      }
    }
  }

  const updateOnboardingStatus = async (status: 'pending' | 'completed') => {
    if (!user.value) return { success: false, error: 'No user logged in' }

    try {
      const currentUser = Parse.User.current()

      if (currentUser) {
        // Real Parse user - save to backend
        currentUser.set('onboardingStatus', status)
        await currentUser.save()
      } else {
        // Mock user - just update local state
        console.log('🔧 Mock mode: Setting onboarding status locally')
      }

      // Update local state in both cases
      user.value.onboardingStatus = status

      // Store in localStorage as backup
      localStorage.setItem('mabar_onboarding_status', status)

      // Persist mock user data if no Parse user
      if (!currentUser) {
        localStorage.setItem('mabar_mock_user', JSON.stringify(user.value))
      }

      return { success: true }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  const isAuthenticated = computed(() => !!user.value)
  const hasCompletedOnboarding = computed(() => {
    return user.value?.onboardingStatus === 'completed'
  })

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    hasCompletedOnboarding,
    register,
    login,
    logout,
    setUserRole,
    updateOnboardingStatus,
    checkSession,
  }
})
