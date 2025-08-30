import { describe, it, expect, vi } from 'vitest'
import { mountComponent } from '../../tests/utils/test-utils'
import LoginForm from '../LoginForm.vue'
import { useAuthStore } from '../../stores/auth'

vi.mock('../../stores/auth')

describe('LoginForm', () => {
  it('renders form elements', () => {
    const mockAuthStore = {
      isLoading: false,
      error: null,
      login: vi.fn(),
    }
    vi.mocked(useAuthStore).mockReturnValue(
      mockAuthStore as ReturnType<typeof useAuthStore>
    )

    const wrapper = mountComponent(LoginForm)

    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('shows loading state', () => {
    const mockAuthStore = {
      isLoading: true,
      error: null,
      login: vi.fn(),
    }
    vi.mocked(useAuthStore).mockReturnValue(
      mockAuthStore as ReturnType<typeof useAuthStore>
    )

    const wrapper = mountComponent(LoginForm)
    const button = wrapper.find('button[type="submit"]')

    expect(button.text()).toContain('Signing in...')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('displays error message', () => {
    const mockAuthStore = {
      isLoading: false,
      error: 'Invalid credentials',
      login: vi.fn(),
    }
    vi.mocked(useAuthStore).mockReturnValue(
      mockAuthStore as ReturnType<typeof useAuthStore>
    )

    const wrapper = mountComponent(LoginForm)

    expect(wrapper.text()).toContain('Invalid credentials')
  })
})
