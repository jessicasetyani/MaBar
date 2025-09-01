import Parse from './back4app'
import { ValidationUtils } from '../utils/validation'

export interface BookingData {
  id?: string
  venueId: string
  title: string
  startTime: Date
  endTime: Date
  court: string
  players: string[]
  playerPhones: string[]
  contact: string
  phone: string
  price: number
  status: 'confirmed' | 'pending' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'refunded'
  type?: 'booking' | 'blocked'
  reason?: string
}

export interface BlockedSlotData {
  id?: string
  venueId: string
  startTime: Date
  endTime: Date
  court: string
  reason: string
}

export class BookingService {
  static async getBookings(
    venueId: string,
    limit: number = 100,
    skip: number = 0
  ): Promise<BookingData[]> {
    try {
      console.log('🔍 BookingService.getBookings called with:', {
        venueId,
        limit,
        skip,
      })

      if (!ValidationUtils.isValidVenueId(venueId)) {
        console.error('❌ Invalid venue ID:', venueId)
        throw new Error('Invalid venue ID')
      }

      const BookingClass = Parse.Object.extend('Booking')
      const query = new Parse.Query(BookingClass)
      query.equalTo('venueId', venueId)
      query.descending('createdAt')
      query.limit(Math.min(limit, 100))
      query.skip(skip)

      console.log('📡 Executing Parse query for bookings...')
      const results = await query.find()
      console.log('📊 Raw booking results from Parse:', results.length, results)

      const mappedResults = results.map((booking) => {
        const bookingData = {
          id: booking.id,
          venueId: booking.get('venueId'),
          title: booking.get('title'),
          startTime: booking.get('startTime'),
          endTime: booking.get('endTime'),
          court: booking.get('court'),
          players: booking.get('players') || [],
          playerPhones: booking.get('playerPhones') || [],
          contact: booking.get('contact'),
          phone: booking.get('phone'),
          price: booking.get('price'),
          status: booking.get('status'),
          paymentStatus: booking.get('paymentStatus'),
        }
        console.log('📋 Mapped booking:', bookingData)
        return bookingData
      })

      console.log(
        '✅ BookingService.getBookings returning:',
        mappedResults.length,
        'bookings'
      )
      return mappedResults
    } catch (error) {
      console.error('❌ Error fetching bookings:', error)
      throw new Error(`Failed to fetch bookings: ${(error as Error).message}`)
    }
  }

  static async getBlockedSlots(
    venueId: string,
    limit: number = 100,
    skip: number = 0
  ): Promise<BlockedSlotData[]> {
    try {
      if (!ValidationUtils.isValidVenueId(venueId)) {
        throw new Error('Invalid venue ID')
      }

      const BlockedSlotClass = Parse.Object.extend('BlockedSlot')
      const query = new Parse.Query(BlockedSlotClass)
      query.equalTo('venueId', venueId)
      query.descending('createdAt')
      query.limit(Math.min(limit, 100))
      query.skip(skip)

      const results = await query.find()

      return results.map((blocked) => ({
        id: blocked.id,
        venueId: blocked.get('venueId'),
        startTime: blocked.get('startTime'),
        endTime: blocked.get('endTime'),
        court: blocked.get('court'),
        reason: blocked.get('reason'),
      }))
    } catch (error) {
      console.error('Error fetching blocked slots:', error)
      throw new Error(
        `Failed to fetch blocked slots: ${(error as Error).message}`
      )
    }
  }

  static async createBooking(
    bookingData: Omit<BookingData, 'id'>
  ): Promise<string> {
    try {
      BookingService.validateBookingData(bookingData)

      // Check for conflicts with existing bookings on the same court
      await BookingService.checkBookingConflicts(bookingData)

      const BookingClass = Parse.Object.extend('Booking')
      const booking = new BookingClass()

      booking.set('venueId', bookingData.venueId)
      booking.set('title', bookingData.title)
      booking.set('startTime', bookingData.startTime)
      booking.set('endTime', bookingData.endTime)
      booking.set('court', bookingData.court)
      booking.set('players', bookingData.players)
      booking.set('playerPhones', bookingData.playerPhones)
      booking.set('contact', bookingData.contact)
      booking.set('phone', bookingData.phone)
      booking.set('price', bookingData.price)
      booking.set('status', bookingData.status)
      booking.set('paymentStatus', bookingData.paymentStatus)
      booking.set('createdBy', Parse.User.current())

      const result = await booking.save()
      return result.id
    } catch (error) {
      console.error('Error creating booking:', error)
      throw new Error(`Failed to create booking: ${(error as Error).message}`)
    }
  }

  static async checkBookingConflicts(
    bookingData: Omit<BookingData, 'id'>,
    excludeBookingId?: string
  ): Promise<void> {
    try {
      const BookingClass = Parse.Object.extend('Booking')
      const query = new Parse.Query(BookingClass)

      query.equalTo('venueId', bookingData.venueId)
      query.equalTo('court', bookingData.court)
      query.notEqualTo('status', 'cancelled')

      if (excludeBookingId) {
        query.notEqualTo('objectId', excludeBookingId)
      }

      // Check for time overlap
      const startTime = bookingData.startTime
      const endTime = bookingData.endTime

      // Find bookings that overlap with the requested time slot
      const orQuery1 = new Parse.Query(BookingClass)
      orQuery1.lessThan('startTime', endTime)
      orQuery1.greaterThan('endTime', startTime)

      const combinedQuery = Parse.Query.and(query, orQuery1)
      const conflictingBookings = await combinedQuery.find()

      if (conflictingBookings.length > 0) {
        const conflictDetails = conflictingBookings
          .map(
            (booking) =>
              `${booking.get('title')} (${booking.get('startTime').toLocaleString()} - ${booking.get('endTime').toLocaleString()})`
          )
          .join(', ')

        throw new Error(
          `Court ${bookingData.court} is already booked during this time. Conflicting bookings: ${conflictDetails}`
        )
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('already booked')) {
        throw error
      }
      console.error('Error checking booking conflicts:', error)
      throw new Error('Failed to check booking conflicts')
    }
  }

  static async createBlockedSlot(
    slotData: Omit<BlockedSlotData, 'id'>
  ): Promise<string> {
    try {
      BookingService.validateBlockedSlotData(slotData)

      const BlockedSlotClass = Parse.Object.extend('BlockedSlot')
      const blockedSlot = new BlockedSlotClass()

      blockedSlot.set('venueId', slotData.venueId)
      blockedSlot.set('startTime', slotData.startTime)
      blockedSlot.set('endTime', slotData.endTime)
      blockedSlot.set('court', slotData.court)
      blockedSlot.set('reason', slotData.reason)
      blockedSlot.set('createdBy', Parse.User.current())

      const result = await blockedSlot.save()
      return result.id
    } catch (error) {
      console.error('Error creating blocked slot:', error)
      throw new Error(
        `Failed to create blocked slot: ${(error as Error).message}`
      )
    }
  }

  static async updateBooking(
    bookingId: string,
    bookingData: Partial<BookingData>
  ): Promise<void> {
    try {
      if (!ValidationUtils.isValidBookingId(bookingId)) {
        throw new Error('Invalid booking ID')
      }

      const BookingClass = Parse.Object.extend('Booking')
      const query = new Parse.Query(BookingClass)
      const booking = await query.get(bookingId)

      // If updating time or court, check for conflicts
      if (bookingData.startTime || bookingData.endTime || bookingData.court) {
        const currentData = {
          venueId: booking.get('venueId'),
          startTime: bookingData.startTime || booking.get('startTime'),
          endTime: bookingData.endTime || booking.get('endTime'),
          court: bookingData.court || booking.get('court'),
        } as Omit<BookingData, 'id'>

        // Validate 24-hour duration if times are being updated
        if (bookingData.startTime || bookingData.endTime) {
          const duration =
            currentData.endTime.getTime() - currentData.startTime.getTime()
          const expectedDuration = 24 * 60 * 60 * 1000
          if (Math.abs(duration - expectedDuration) > 60000) {
            throw new Error('Booking must be exactly 24 hours duration')
          }
        }

        await BookingService.checkBookingConflicts(currentData, bookingId)
      }

      const allowedFields = [
        'title',
        'startTime',
        'endTime',
        'court',
        'players',
        'playerPhones',
        'contact',
        'phone',
        'price',
        'status',
        'paymentStatus',
      ]

      Object.entries(bookingData).forEach(([key, value]) => {
        if (value !== undefined && allowedFields.includes(key)) {
          booking.set(key, value)
        }
      })

      booking.set('updatedBy', Parse.User.current())
      await booking.save()
    } catch (error) {
      console.error('Error updating booking:', error)
      throw new Error(`Failed to update booking: ${(error as Error).message}`)
    }
  }

  static async updateBlockedSlot(
    slotId: string,
    slotData: Partial<BlockedSlotData>
  ): Promise<void> {
    try {
      if (!ValidationUtils.isValidBookingId(slotId)) {
        throw new Error('Invalid slot ID')
      }

      const BlockedSlotClass = Parse.Object.extend('BlockedSlot')
      const query = new Parse.Query(BlockedSlotClass)
      const blockedSlot = await query.get(slotId)

      const allowedFields = ['startTime', 'endTime', 'court', 'reason']

      Object.entries(slotData).forEach(([key, value]) => {
        if (value !== undefined && allowedFields.includes(key)) {
          blockedSlot.set(key, value)
        }
      })

      blockedSlot.set('updatedBy', Parse.User.current())
      await blockedSlot.save()
    } catch (error) {
      console.error('Error updating blocked slot:', error)
      throw new Error(
        `Failed to update blocked slot: ${(error as Error).message}`
      )
    }
  }

  static async deleteBooking(bookingId: string): Promise<void> {
    try {
      if (!ValidationUtils.isValidBookingId(bookingId)) {
        throw new Error('Invalid booking ID')
      }

      const BookingClass = Parse.Object.extend('Booking')
      const query = new Parse.Query(BookingClass)
      const booking = await query.get(bookingId)
      await booking.destroy()
    } catch (error) {
      console.error('Error deleting booking:', error)
      throw new Error(`Failed to delete booking: ${(error as Error).message}`)
    }
  }

  static async deleteBlockedSlot(slotId: string): Promise<void> {
    try {
      if (!ValidationUtils.isValidBookingId(slotId)) {
        throw new Error('Invalid slot ID')
      }

      const BlockedSlotClass = Parse.Object.extend('BlockedSlot')
      const query = new Parse.Query(BlockedSlotClass)
      const blockedSlot = await query.get(slotId)
      await blockedSlot.destroy()
    } catch (error) {
      console.error('Error deleting blocked slot:', error)
      throw new Error(
        `Failed to delete blocked slot: ${(error as Error).message}`
      )
    }
  }

  static validateBookingData(data: Omit<BookingData, 'id'>): void {
    if (!ValidationUtils.isValidVenueId(data.venueId)) {
      throw new Error('Invalid venue ID')
    }
    if (!data.title?.trim()) {
      throw new Error('Booking title is required')
    }
    if (!ValidationUtils.isValidTimeRange(data.startTime, data.endTime)) {
      throw new Error('Invalid time range')
    }

    // Validate 24-hour duration
    const duration = data.endTime.getTime() - data.startTime.getTime()
    const expectedDuration = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    if (Math.abs(duration - expectedDuration) > 60000) {
      // Allow 1 minute tolerance
      throw new Error('Booking must be exactly 24 hours duration')
    }

    if (!ValidationUtils.isValidCourt(data.court)) {
      throw new Error('Invalid court selection')
    }
    if (!ValidationUtils.isValidEmail(data.contact)) {
      throw new Error('Invalid email format')
    }
    if (!ValidationUtils.isValidPhoneNumber(data.phone)) {
      throw new Error('Invalid phone number format')
    }
    if (!ValidationUtils.isValidPrice(data.price)) {
      throw new Error('Invalid price')
    }
    const playerValidation = ValidationUtils.validatePlayers(data.players)
    if (!playerValidation.isValid) {
      throw new Error(playerValidation.error!)
    }
  }

  static validateBlockedSlotData(data: Omit<BlockedSlotData, 'id'>): void {
    if (!ValidationUtils.isValidVenueId(data.venueId)) {
      throw new Error('Invalid venue ID')
    }
    if (!ValidationUtils.isValidTimeRange(data.startTime, data.endTime)) {
      throw new Error('Invalid time range')
    }
    if (!ValidationUtils.isValidCourt(data.court)) {
      throw new Error('Invalid court selection')
    }
    if (!data.reason?.trim()) {
      throw new Error('Block reason is required')
    }
  }

  static formatBookingForCalendar(booking: BookingData) {
    console.log('🎨 Formatting booking for calendar:', booking)

    // Ensure exact time synchronization
    const startTime = new Date(booking.startTime)
    const endTime = new Date(booking.endTime)

    // Validate 24-hour duration for display consistency
    const duration = endTime.getTime() - startTime.getTime()
    const is24Hour = Math.abs(duration - 24 * 60 * 60 * 1000) < 60000

    console.log('⏰ Time sync check:', {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: duration / (1000 * 60 * 60),
      is24Hour,
    })

    const players = booking.players || []

    // Enhanced title format with court and player info
    let displayTitle = `${booking.court}`

    if (players.length > 0) {
      if (players.length <= 2) {
        displayTitle += ` - ${players.join(' & ')}`
      } else if (players.length === 3) {
        displayTitle += ` - ${players[0]} & ${players[1]} +1`
      } else {
        displayTitle += ` - ${players[0]} & ${players[1]} +${players.length - 2}`
      }
    } else if (booking.title) {
      displayTitle += ` - ${booking.title}`
    } else {
      displayTitle += ' - Booking'
    }

    // Add 24h indicator and status
    const statusIcon =
      booking.status === 'confirmed'
        ? '✓'
        : booking.status === 'pending'
          ? '⏳'
          : '❌'
    displayTitle = `${statusIcon} ${displayTitle}${is24Hour ? ' (24h)' : ''}`

    // Different colors for different courts to make them easier to distinguish
    const getCourtColor = (court: string) => {
      const courtColors = {
        'Court 1': { confirmed: '#3B82F6', pending: '#93C5FD' }, // Blue
        'Court 2': { confirmed: '#10B981', pending: '#6EE7B7' }, // Green
        'Court 3': { confirmed: '#F59E0B', pending: '#FCD34D' }, // Orange
        'Court 4': { confirmed: '#EF4444', pending: '#FCA5A5' }, // Red
      }

      const defaultColors = { confirmed: '#84CC16', pending: '#FDE047' }
      return courtColors[court as keyof typeof courtColors] || defaultColors
    }

    const colors = getCourtColor(booking.court)
    const bgColor =
      colors[booking.status as keyof typeof colors] || colors.confirmed

    const calendarEvent = {
      id: booking.id!,
      title: displayTitle,
      start: startTime, // Use validated Date objects
      end: endTime, // Use validated Date objects
      backgroundColor: bgColor,
      borderColor: bgColor,
      textColor: '#ffffff',
      resourceId: booking.court,
      extendedProps: {
        type: 'booking',
        status: booking.status,
        court: booking.court,
        players: players,
        playerPhones: booking.playerPhones,
        contact: booking.contact,
        phone: booking.phone,
        price: booking.price,
        paymentStatus: booking.paymentStatus,
        is24Hour,
        duration: Math.round(duration / (1000 * 60 * 60)),
        // Exact time display for verification
        timeSlot: `${startTime.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })} - ${endTime.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })}`,
        playerCount: players.length,
        formattedPrice: new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
        }).format(booking.price),
      },
    }

    console.log('📅 Calendar event created with exact times:', {
      id: calendarEvent.id,
      start: calendarEvent.start,
      end: calendarEvent.end,
      duration: is24Hour
        ? '24h'
        : `${Math.round(duration / (1000 * 60 * 60))}h`,
    })
    return calendarEvent
  }

  static formatBlockedSlotForCalendar(blockedSlot: BlockedSlotData) {
    console.log('🚫 Formatting blocked slot for calendar:', blockedSlot)

    const duration =
      blockedSlot.endTime.getTime() - blockedSlot.startTime.getTime()
    const hours = Math.round(duration / (1000 * 60 * 60))

    let displayTitle = `🚫 ${blockedSlot.court} - BLOCKED`

    if (blockedSlot.reason) {
      displayTitle += ` (${blockedSlot.reason})`
    }

    if (hours === 24) {
      displayTitle += ' (24h)'
    } else {
      displayTitle += ` (${hours}h)`
    }

    const calendarEvent = {
      id: blockedSlot.id!,
      title: displayTitle,
      start: blockedSlot.startTime,
      end: blockedSlot.endTime,
      backgroundColor: '#EF4444',
      borderColor: '#DC2626',
      textColor: '#ffffff',
      resourceId: blockedSlot.court,
      extendedProps: {
        type: 'blocked',
        court: blockedSlot.court,
        reason: blockedSlot.reason,
        duration: hours,
        is24Hour: hours === 24,
        timeSlot: `${blockedSlot.startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${blockedSlot.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${blockedSlot.endTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${blockedSlot.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
      },
    }

    console.log('📅 Blocked slot calendar event created:', calendarEvent)
    return calendarEvent
  }
}
