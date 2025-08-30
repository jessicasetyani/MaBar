import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import type { Component } from 'vue'

// Mock router for testing
export const createMockRouter = () => {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/login', component: { template: '<div>Login</div>' } },
      { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
    ],
  })
}

// Helper to mount components with common dependencies
export const mountComponent = (
  component: Component,
  options: Record<string, unknown> = {}
) => {
  const pinia = createPinia()
  const router = createMockRouter()

  return mount(component, {
    global: {
      plugins: [pinia, router],
      ...options.global,
    },
    ...options,
  })
}

// Wait for next tick helper
export const nextTick = () => new Promise((resolve) => setTimeout(resolve, 0))

// Mock Parse user
export const mockUser = {
  id: 'test-user-id',
  get: (key: string) => {
    const data: Record<string, unknown> = {
      username: 'testuser',
      email: 'test@example.com',
      role: 'player',
    }
    return data[key]
  },
  set: vi.fn(),
  save: vi.fn().mockResolvedValue({}),
  destroy: vi.fn().mockResolvedValue({}),
}
