import { useAuthStore } from '../stores/auth'

export async function testAuthFlow() {
  const authStore = useAuthStore()
  
  console.log('🧪 Testing Authentication Flow...')
  
  // Test 1: Check initial state
  console.log('Initial user state:', authStore.user)
  
  // Test 2: Check session restoration
  authStore.checkSession()
  console.log('After session check:', authStore.user)
  
  return {
    initialState: authStore.user,
    isLoading: authStore.isLoading,
    error: authStore.error
  }
}