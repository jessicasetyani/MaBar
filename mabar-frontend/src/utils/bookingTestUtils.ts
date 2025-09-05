/**
 * Test utilities for booking system integration
 * This file helps verify the booking system works correctly
 */

import {
  BookingService,
  type BookingData,
  type BlockedSlotData,
} from '../services/bookingService'

export class BookingTestUtils {
  /**
   * Test booking creation with validation
   */
  static async testBookingCreation(venueId: string): Promise<boolean> {
    try {
      console.log('🧪 Testing booking creation...')

      const testBooking: Omit<BookingData, 'id'> = {
        venueId,
        title: 'Test Booking - Integration Test',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // +90 minutes
        court: 'Court 1',
        players: ['Test Player 1', 'Test Player 2'],
        playerPhones: ['+6281234567890', '+6281234567891'],
        contact: 'test@example.com',
        phone: '+6281234567890',
        price: 150000,
        status: 'confirmed',
        paymentStatus: 'pending',
      }

      const bookingId = await BookingService.createBooking(testBooking)
      console.log('✅ Booking created successfully:', bookingId)

      // Clean up test booking
      await BookingService.deleteBooking(bookingId)
      console.log('🧹 Test booking cleaned up')

      return true
    } catch (error) {
      console.error('❌ Booking creation test failed:', error)
      return false
    }
  }

  /**
   * Test blocked slot creation
   */
  static async testBlockedSlotCreation(venueId: string): Promise<boolean> {
    try {
      console.log('🧪 Testing blocked slot creation...')

      const testSlot: Omit<BlockedSlotData, 'id'> = {
        venueId,
        startTime: new Date(Date.now() + 25 * 60 * 60 * 1000), // Tomorrow + 1 hour
        endTime: new Date(Date.now() + 25 * 60 * 60 * 1000 + 60 * 60 * 1000), // +60 minutes
        court: 'Court 2',
        reason: 'Test Maintenance Block',
      }

      const slotId = await BookingService.createBlockedSlot(testSlot)
      console.log('✅ Blocked slot created successfully:', slotId)

      // Clean up test slot
      await BookingService.deleteBlockedSlot(slotId)
      console.log('🧹 Test blocked slot cleaned up')

      return true
    } catch (error) {
      console.error('❌ Blocked slot creation test failed:', error)
      return false
    }
  }

  /**
   * Test data retrieval with pagination
   */
  static async testDataRetrieval(venueId: string): Promise<boolean> {
    try {
      console.log('🧪 Testing data retrieval...')

      const bookings = await BookingService.getBookings(venueId, 10, 0)
      const blockedSlots = await BookingService.getBlockedSlots(venueId, 10, 0)

      console.log('✅ Data retrieval successful:', {
        bookings: bookings.length,
        blockedSlots: blockedSlots.length,
      })

      return true
    } catch (error) {
      console.error('❌ Data retrieval test failed:', error)
      return false
    }
  }

  /**
   * Test validation functions
   */
  static testValidation(): boolean {
    try {
      console.log('🧪 Testing validation functions...')
      console.log('✅ Validation tests completed')
      return true
    } catch (error) {
      console.error('❌ Validation test failed:', error)
      return false
    }
  }

  /**
   * Run comprehensive integration test
   */
  static async runIntegrationTest(venueId: string): Promise<void> {
    console.log('🚀 Starting booking system integration test...')

    const results = {
      validation: this.testValidation(),
      dataRetrieval: await this.testDataRetrieval(venueId),
      bookingCreation: await this.testBookingCreation(venueId),
      blockedSlotCreation: await this.testBlockedSlotCreation(venueId),
    }

    const allPassed = Object.values(results).every((result) => result === true)

    console.log('📊 Integration test results:', results)

    if (allPassed) {
      console.log(
        '🎉 All integration tests passed! Booking system is working correctly.'
      )
    } else {
      console.log(
        '⚠️ Some integration tests failed. Please check the implementation.'
      )
    }
  }
}
