import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../components/AuthFlow.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/onboarding/player',
    name: 'PlayerOnboarding',
    component: () => import('../views/PlayerOnboarding.vue'),
    meta: { requiresAuth: true, requiresRole: 'player' },
  },
  {
    path: '/onboarding/venue-owner',
    name: 'VenueOnboarding',
    component: () => import('../views/VenueOnboarding.vue'),
    meta: { requiresAuth: true, requiresRole: 'venue_owner' },
  },
  {
    path: '/dashboard',
    name: 'PlayerDashboard',
    component: () => import('../views/PlayerDashboard.vue'),
    meta: { requiresAuth: true, requiresRole: 'player' },
  },
  {
    path: '/venue-dashboard',
    name: 'VenueDashboard',
    component: () => import('../views/VenueDashboard.vue'),
    meta: { requiresAuth: true, requiresRole: 'venue_owner' },
  },
  {
    path: '/profile',
    name: 'PlayerProfile',
    component: () => import('../views/PlayerOnboarding.vue'), // Placeholder for now
    meta: { requiresAuth: true, requiresRole: 'player' },
  },
  {
    path: '/ai-chat',
    name: 'PlayerMatching',
    component: () => import('../views/AIChat.vue'),
    meta: { requiresAuth: true, requiresRole: 'player' },
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guards for role-based routing
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // Wait for session check to complete if it's still loading
  if (authStore.isLoading) {
    try {
      await authStore.checkSession()
    } catch (error) {
      console.warn('Session check failed during navigation:', error)
    }
  }

  const { user, isAuthenticated, hasCompletedOnboarding } = authStore

  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/')
    return
  }

  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && isAuthenticated) {
    // If user has completed onboarding, redirect to dashboard
    if (hasCompletedOnboarding) {
      if (user?.role === 'player') {
        next('/dashboard')
      } else if (user?.role === 'venue_owner') {
        next('/venue-dashboard')
      } else {
        next('/')
      }
    } else {
      // If user hasn't completed onboarding, allow them to stay on auth flow
      next()
    }
    return
  }

  // Allow access to onboarding routes if user has role but hasn't completed onboarding
  const isOnboardingRoute = to.path.startsWith('/onboarding/')
  if (isOnboardingRoute && user?.role && !hasCompletedOnboarding) {
    // Check if the onboarding route matches the user's role
    const expectedRoute =
      user.role === 'player' ? '/onboarding/player' : '/onboarding/venue-owner'
    if (to.path === expectedRoute) {
      next()
      return
    }
  }

  // Check role-based access for completed users
  if (to.meta.requiresRole && user?.role !== to.meta.requiresRole) {
    // Redirect to appropriate dashboard based on actual role
    if (user?.role === 'player') {
      next('/dashboard')
    } else if (user?.role === 'venue_owner') {
      next('/venue-dashboard')
    } else {
      next('/')
    }
    return
  }

  // Redirect completed users away from onboarding routes
  if (isOnboardingRoute && hasCompletedOnboarding) {
    if (user?.role === 'player') {
      next('/dashboard')
    } else if (user?.role === 'venue_owner') {
      next('/venue-dashboard')
    } else {
      next('/')
    }
    return
  }

  next()
})
