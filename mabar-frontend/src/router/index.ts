import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    component: () => import('../components/AuthFlow.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/onboarding/player',
    component: () => import('../views/PlayerOnboarding.vue'),
    meta: { requiresAuth: true, requiresRole: 'player' },
  },
  {
    path: '/onboarding/venue-owner',
    component: () => import('../views/VenueOnboarding.vue'),
    meta: { requiresAuth: true, requiresRole: 'venue_owner' },
  },
  {
    path: '/dashboard',
    component: () => import('../views/PlayerDashboard.vue'),
    meta: { requiresAuth: true, requiresRole: 'player' },
  },
  {
    path: '/venue-dashboard',
    component: () => import('../views/VenueDashboard.vue'),
    meta: { requiresAuth: true, requiresRole: 'venue_owner' },
  },
  {
    path: '/profile',
    component: () => import('../views/PlayerOnboarding.vue'), // Placeholder for now
    meta: { requiresAuth: true, requiresRole: 'player' },
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guards for role-based routing
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const { user, isAuthenticated } = authStore

  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/')
    return
  }

  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'player') {
      next('/dashboard')
    } else if (user?.role === 'venue_owner') {
      next('/venue-dashboard')
    } else {
      next('/')
    }
    return
  }

  // Check role-based access
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

  next()
})
