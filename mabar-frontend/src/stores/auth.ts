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

  const checkSession = async () => {
    console.log('🔍 [AUTH] Checking session...')
    const currentUser = Parse.User.current()
    if (currentUser) {
      console.log('✅ [AUTH] Current user found:', currentUser.get('email'))
      try {
        // Fetch fresh user data from server to get latest onboardingStatus
        console.log('🔄 [AUTH] Fetching fresh user data...')
        await currentUser.fetch()
        
        const userData = {
          id: currentUser.id || '',
          email: currentUser.get('email'),
          role: currentUser.get('role') || null,
          onboardingStatus: currentUser.get('onboardingStatus') || null,
        }
        
        console.log('✅ [AUTH] Fresh user data:', userData)
        user.value = userData
      } catch (error) {
        console.warn('⚠️ [AUTH] Failed to fetch fresh user data, using cached data:', error)
        // Fallback to cached data with localStorage backup
        const onboardingStatus =
          currentUser.get('onboardingStatus') ||
          localStorage.getItem('mabar_onboarding_status') ||
          null

        const userData = {
          id: currentUser.id || '',
          email: currentUser.get('email'),
          role: currentUser.get('role') || null,
          onboardingStatus: onboardingStatus as 'pending' | 'completed' | null,
        }
        
        console.log('📦 [AUTH] Using cached user data:', userData)
        user.value = userData
      }
    } else {
      console.log('❌ [AUTH] No current user, checking localStorage...')
      // Check for mock user in localStorage
      const mockUser = localStorage.getItem('mabar_mock_user')
      if (mockUser) {
        console.log('📱 [AUTH] Found mock user in localStorage')
        user.value = JSON.parse(mockUser)
      } else {
        console.log('🚫 [AUTH] No user found')
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
    const result = user.value?.onboardingStatus === 'completed'
    console.log('🧐 [AUTH] hasCompletedOnboarding check:', {
      userExists: !!user.value,
      onboardingStatus: user.value?.onboardingStatus,
      result
    })
    return result
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
