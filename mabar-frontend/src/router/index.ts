import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('../App.vue') },
  { path: '/onboarding/player', component: () => import('../views/PlayerOnboarding.vue') },
  { path: '/onboarding/venue-owner', component: () => import('../views/VenueOnboarding.vue') }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})