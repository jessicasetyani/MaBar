import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import VenueDashboard from '../views/VenueDashboard.vue'
import { useAuthStore } from '../stores/auth'

// Mock Parse
vi.mock('../services/back4app', () => ({
  default: {
    Object: {
      extend: vi.fn(() => ({
        save: vi.fn().mockResolvedValue({ id: 'test-id' }),
        destroy: vi.fn().mockResolvedValue({}),
      })),
    },
    Query: vi.fn(() => ({
      equalTo: vi.fn().mockReturnThis(),
      find: vi.fn().mockResolvedValue([]),
      get: vi.fn().mockResolvedValue({
        destroy: vi.fn().mockResolvedValue({}),
      }),
      subscribe: vi.fn().mockResolvedValue({
        on: vi.fn(),
        unsubscribe: vi.fn(),
      }),
    })),
  },
}))

// Mock VenueOwnerService
vi.mock('../services/venueOwnerService', () => ({
  VenueOwnerService: {
    getVenueOwnerProfile: vi.fn().mockResolvedValue({
      id: 'test-venue-id',
      get: vi.fn((key) => {
        const mockData = {
          personalInfo: { name: 'Test Owner', email: 'test@example.com' },
          venueDetails: { name: 'Test Venue', address: 'Test Address' },
          legalDocs: { phone: '+62123456789' },
          status: 'approved',
        }
        return mockData[key]
      }),
    }),
  },
}))

// Mock router
const mockRouter = {
  push: vi.fn(),
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}))

describe('VenueDashboard', () => {
  let wrapper: any
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()

    // Setup auth store
    const authStore = useAuthStore(pinia)
    authStore.user = { email: 'test@example.com' }
    authStore.logout = vi.fn()

    wrapper = mount(VenueDashboard, {
      global: {
        plugins: [pinia],
        stubs: {
          FullCalendar: {
            template: '<div class="mock-calendar">Calendar</div>',
            props: ['options'],
          },
        },
      },
    })
  })

  describe('Layout and Navigation', () => {
    it('renders header with venue name', () => {
      expect(wrapper.find('header').exists()).toBe(true)
      expect(wrapper.text()).toContain('Test Venue')
    })

    it('shows desktop sidebar navigation', () => {
      const sidebar = wrapper.find('aside')
      expect(sidebar.exists()).toBe(true)
      expect(sidebar.classes()).toContain('hidden')
      expect(sidebar.classes()).toContain('lg:block')
    })

    it('shows mobile bottom navigation', () => {
      const mobileNav = wrapper.find('.lg\\:hidden.fixed.bottom-0')
      expect(mobileNav.exists()).toBe(true)
    })

    it('has three navigation tabs', () => {
      const tabs = wrapper
        .findAll('button')
        .filter(
          (btn: any) =>
            btn.text().includes('Calendar') ||
            btn.text().includes('Profile') ||
            btn.text().includes('Analytics')
        )
      expect(tabs.length).toBeGreaterThanOrEqual(6) // 3 desktop + 3 mobile
    })
  })

  describe('Calendar Tab', () => {
    it('renders calendar component', () => {
      // Check if the calendar container exists since FullCalendar is stubbed
      const calendarContainer = wrapper.find('.venue-calendar')
      expect(calendarContainer.exists()).toBe(true)
    })

    it('shows booking instructions', () => {
      expect(wrapper.text()).toContain('Click and drag on empty time slots')
    })

    it('has calendar container with proper styling', () => {
      const calendarContainer = wrapper.find('.bg-white.rounded-lg.shadow-sm')
      expect(calendarContainer.exists()).toBe(true)
    })
  })

  describe('Profile Tab', () => {
    it('switches to profile tab', async () => {
      const profileBtn = wrapper
        .findAll('button')
        .find((btn: any) => btn.text().includes('Profile'))
      await profileBtn.trigger('click')

      expect(wrapper.vm.activeTab).toBe('profile')
    })

    it('shows venue information when profile tab is active', async () => {
      wrapper.vm.activeTab = 'profile'
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Venue Profile')
      expect(wrapper.text()).toContain('Venue Information')
    })
  })

  describe('Analytics Tab', () => {
    it('switches to analytics tab', async () => {
      const analyticsBtn = wrapper
        .findAll('button')
        .find((btn: any) => btn.text().includes('Analytics'))
      await analyticsBtn.trigger('click')

      expect(wrapper.vm.activeTab).toBe('analytics')
    })

    it('shows analytics placeholder', async () => {
      wrapper.vm.activeTab = 'analytics'
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Analytics dashboard coming soon')
    })
  })

  describe('Responsive Design', () => {
    it('has responsive classes for mobile', () => {
      expect(wrapper.find('.min-h-screen').exists()).toBe(true)
      expect(wrapper.find('.lg\\:hidden').exists()).toBe(true)
      expect(wrapper.find('.hidden.lg\\:block').exists()).toBe(true)
    })

    it('has proper spacing for mobile bottom nav', () => {
      const main = wrapper.find('main')
      expect(main.classes()).toContain('pb-16')
      expect(main.classes()).toContain('lg:pb-0')
    })
  })

  describe('Booking Modal', () => {
    it('opens booking modal when showBookingModal is true', async () => {
      wrapper.vm.showBookingModal = true
      wrapper.vm.selectedBooking = {
        status: 'confirmed',
        paymentStatus: 'paid',
        start: new Date(),
        end: new Date(),
        court: 'Court 1',
        players: ['Player 1'],
        contact: 'test@example.com',
        phone: '+62123456789',
        price: 150000,
      }
      await wrapper.vm.$nextTick()

      expect(
        wrapper.find('.fixed.inset-0.bg-black.bg-opacity-50').exists()
      ).toBe(true)
      expect(wrapper.text()).toContain('Booking Details')
    })

    it('closes modal when close button is clicked', async () => {
      wrapper.vm.showBookingModal = true
      await wrapper.vm.$nextTick()

      const closeButtons = wrapper.findAll('button')
      const closeBtn = closeButtons.find((btn: any) => btn.text().includes('✕'))
      expect(closeBtn).toBeDefined()
      await closeBtn.trigger('click')

      expect(wrapper.vm.showBookingModal).toBe(false)
    })
  })

  describe('Data Loading', () => {
    it('handles loading state', async () => {
      wrapper.vm.venueOwnerData = null
      wrapper.vm.activeTab = 'profile'
      await wrapper.vm.$nextTick()

      // Check if profile tab shows loading text
      expect(wrapper.text()).toContain('Loading venue information')
    })

    it('loads bookings and blocked slots for approved venues', async () => {
      wrapper.vm.applicationStatus = 'Approved'
      await wrapper.vm.loadBookings()
      await wrapper.vm.loadBlockedSlots()

      expect(wrapper.vm.bookings).toBeDefined()
      expect(wrapper.vm.blockedSlots).toBeDefined()
    })
  })

  describe('Utility Functions', () => {
    it('formats time correctly', () => {
      const testDate = new Date('2024-01-01T10:30:00')
      const formatted = wrapper.vm.formatTime(testDate)
      expect(formatted).toBe('10:30')
    })

    it('formats price in Indonesian Rupiah', () => {
      const price = 150000
      const formatted = wrapper.vm.formatPrice(price)
      expect(formatted).toContain('Rp')
      expect(formatted).toContain('150.000')
    })
  })
})
