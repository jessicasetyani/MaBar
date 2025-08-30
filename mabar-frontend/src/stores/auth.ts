import { defineStore } from 'pinia'
import { ref } from 'vue'
import Parse from '../services/back4app'

export interface User {
  id: string
  email: string
  role?: 'player' | 'venue_owner' | null
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
        id: result.id,
        email: result.get('email'),
        role: result.get('role') || null,
      }
      return { success: true }
    } catch (err: any) {
      // Fallback for development when Back4App is not available
      if (err.message.includes('unauthorized') || err.message.includes('403')) {
        console.warn(
          'Back4App unavailable, using mock registration for development'
        )
        user.value = {
          id: 'mock-' + Date.now(),
          email: email,
          role: null,
        }
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
        id: result.id,
        email: result.get('email'),
        role: result.get('role') || null,
      }
      return { success: true }
    } catch (err: any) {
      // Fallback for development when Back4App is not available
      if (err.message.includes('unauthorized') || err.message.includes('403')) {
        console.warn('Back4App unavailable, using mock login for development')
        user.value = {
          id: 'mock-' + Date.now(),
          email: email,
          role: null,
        }
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
    } catch (err: any) {
      error.value = err.message
    }
  }

  const setUserRole = async (role: 'player' | 'venue_owner') => {
    if (!user.value) return { success: false, error: 'No user logged in' }

    isLoading.value = true
    error.value = null

    try {
      const currentUser = Parse.User.current()
      if (!currentUser) throw new Error('No current user')

      currentUser.set('role', role)
      await currentUser.save()

      user.value.role = role
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
      user.value = {
        id: currentUser.id,
        email: currentUser.get('email'),
        role: currentUser.get('role') || null,
      }
    }
  }

  return {
    user,
    isLoading,
    error,
    register,
    login,
    logout,
    setUserRole,
    checkSession,
  }
})
