import Parse from './back4app'

export class SeedDataService {
  /**
   * Create sample bookings for testing
   */
  static async createSampleBookings(venueId: string) {
    try {
      const BookingClass = Parse.Object.extend('Booking')

      const sampleBookings = [
        {
          title: 'John vs Mike - Training',
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // +90 min
          court: 'Court 1',
          players: ['John Doe', 'Mike Smith'],
          contact: 'john@example.com',
          phone: '+6281234567890',
          price: 150000,
          status: 'confirmed',
          paymentStatus: 'paid',
        },
        {
          title: 'Sarah vs Lisa - Match',
          startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
          endTime: new Date(
            Date.now() + 2 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000
          ), // +120 min
          court: 'Court 2',
          players: ['Sarah Johnson', 'Lisa Wong'],
          contact: 'sarah@example.com',
          phone: '+6281234567891',
          price: 200000,
          status: 'pending',
          paymentStatus: 'pending',
        },
      ]

      for (const bookingData of sampleBookings) {
        const booking = new BookingClass()
        booking.set('venueId', venueId)
        Object.entries(bookingData).forEach(([key, value]) => {
          booking.set(key, value)
        })
        booking.set('createdBy', Parse.User.current())
        await booking.save()
      }

      console.log('✅ Sample bookings created successfully')
    } catch (error) {
      console.error('❌ Error creating sample bookings:', error)
    }
  }

  /**
   * Check if venue has any bookings
   */
  static async hasBookings(venueId: string): Promise<boolean> {
    try {
      const BookingClass = Parse.Object.extend('Booking')
      const query = new Parse.Query(BookingClass)
      query.equalTo('venueId', venueId)
      query.limit(1)
      const results = await query.find()
      return results.length > 0
    } catch (error) {
      console.error('Error checking bookings:', error)
      return false
    }
  }
}
