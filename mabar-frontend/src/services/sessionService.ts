import Parse from './back4app'
import { BookingService } from './bookingService'

export interface SessionData {
  id?: string
  organizerId: string
  venueId: string
  court?: string // Assigned when session becomes full
  timeSlot: string
  date: string
  startTime: Date
  endTime: Date
  currentPlayers: string[]
  maxPlayers: number
  openSlots: number
  skillLevel?: string
  gameType?: 'casual' | 'competitive' | 'training'
  status: 'open' | 'full' | 'expired' | 'cancelled'
  pricePerPlayer: number
  expiresAt: Date
}

export class SessionService {
  
  /**
   * Create new session (no court assigned yet)
   */
  static async createSession(sessionData: Omit<SessionData, 'id' | 'openSlots' | 'status'>): Promise<string> {
    try {
      const Session = Parse.Object.extend('Session')
      const session = new Session()

      session.set('organizerId', sessionData.organizerId)
      session.set('venueId', sessionData.venueId)
      session.set('court', sessionData.court || null) // No court assigned initially
      session.set('timeSlot', sessionData.timeSlot)
      session.set('date', sessionData.date)
      session.set('startTime', sessionData.startTime)
      session.set('endTime', sessionData.endTime)
      session.set('currentPlayers', sessionData.currentPlayers)
      session.set('maxPlayers', sessionData.maxPlayers)
      session.set('openSlots', sessionData.maxPlayers - sessionData.currentPlayers.length)
      session.set('skillLevel', sessionData.skillLevel)
      session.set('gameType', sessionData.gameType)
      session.set('status', 'open')
      session.set('pricePerPlayer', sessionData.pricePerPlayer)
      session.set('expiresAt', sessionData.expiresAt)
      session.set('createdBy', Parse.User.current())

      const result = await session.save()
      console.log('✅ Session created:', result.id)
      return result.id

    } catch (error) {
      console.error('❌ Error creating session:', error)
      throw error
    }
  }

  /**
   * Join existing session
   */
  static async joinSession(sessionId: string, playerId: string, playerName: string): Promise<boolean> {
    try {
      const Session = Parse.Object.extend('Session')
      const query = new Parse.Query(Session)
      const session = await query.get(sessionId)

      const currentPlayers = session.get('currentPlayers') || []
      const maxPlayers = session.get('maxPlayers')

      // Check if session is still open
      if (currentPlayers.length >= maxPlayers) {
        throw new Error('Session is already full')
      }

      // Check if player already joined
      if (currentPlayers.includes(playerName)) {
        throw new Error('Player already in this session')
      }

      // Add player to session
      const updatedPlayers = [...currentPlayers, playerName]
      session.set('currentPlayers', updatedPlayers)
      session.set('openSlots', maxPlayers - updatedPlayers.length)

      // If session becomes full, convert to booking
      if (updatedPlayers.length === maxPlayers) {
        await this.convertSessionToBooking(session)
      } else {
        await session.save()
      }

      console.log('✅ Player joined session:', sessionId)
      return true

    } catch (error) {
      console.error('❌ Error joining session:', error)
      throw error
    }
  }

  /**
   * Convert full session to confirmed booking
   */
  private static async convertSessionToBooking(session: Parse.Object): Promise<void> {
    try {
      // Find available court
      const availableCourt = await this.findAvailableCourt(
        session.get('venueId'),
        session.get('startTime'),
        session.get('endTime')
      )

      if (!availableCourt) {
        throw new Error('No available courts for this time slot')
      }

      // Create confirmed booking
      const bookingData = {
        venueId: session.get('venueId'),
        title: `${session.get('currentPlayers')[0]}'s Game`,
        startTime: session.get('startTime'),
        endTime: session.get('endTime'),
        court: availableCourt,
        players: session.get('currentPlayers'),
        playerPhones: [], // Would need to collect during join
        price: session.get('pricePerPlayer') * session.get('maxPlayers'),
        status: 'confirmed' as const,
        paymentStatus: 'pending' as const
      }

      await BookingService.createBooking(bookingData)

      // Update session status and assign court
      session.set('status', 'full')
      session.set('court', availableCourt)
      await session.save()

      console.log('✅ Session converted to booking with court:', availableCourt)

    } catch (error) {
      console.error('❌ Error converting session to booking:', error)
      throw error
    }
  }

  /**
   * Find available court for the time slot
   */
  private static async findAvailableCourt(
    venueId: string, 
    startTime: Date, 
    endTime: Date
  ): Promise<string | null> {
    try {
      // Get venue info to know total courts
      const Venue = Parse.Object.extend('Venue')
      const venueQuery = new Parse.Query(Venue)
      const venue = await venueQuery.get(venueId)
      const courtCount = venue.get('courtCount') || 4

      // Check which courts are already booked
      const bookedCourts = await this.getBookedCourts(venueId, startTime, endTime)
      
      // Find first available court
      for (let i = 1; i <= courtCount; i++) {
        const courtName = `Court ${i}`
        if (!bookedCourts.includes(courtName)) {
          return courtName
        }
      }

      return null // No available courts

    } catch (error) {
      console.error('❌ Error finding available court:', error)
      return null
    }
  }

  /**
   * Get list of booked courts for time slot
   */
  private static async getBookedCourts(
    venueId: string, 
    startTime: Date, 
    endTime: Date
  ): Promise<string[]> {
    try {
      const Booking = Parse.Object.extend('Booking')
      const query = new Parse.Query(Booking)
      
      query.equalTo('venueId', venueId)
      query.notEqualTo('status', 'cancelled')
      
      // Check for time overlap
      query.lessThan('startTime', endTime)
      query.greaterThan('endTime', startTime)
      
      const bookings = await query.find()
      return bookings.map(booking => booking.get('court')).filter(Boolean)

    } catch (error) {
      console.error('❌ Error getting booked courts:', error)
      return []
    }
  }

  /**
   * Query open sessions with lazy cleanup
   */
  static async queryOpenSessions(filters: {
    venueId?: string
    skillLevel?: string
    location?: string
    timeSlot?: string
    date?: string
  }): Promise<SessionData[]> {
    try {
      // Clean expired sessions first (lazy cleanup)
      await this.cleanupExpiredSessions(filters.venueId, filters.timeSlot)

      const Session = Parse.Object.extend('Session')
      const query = new Parse.Query(Session)
      
      query.equalTo('status', 'open')
      query.greaterThan('openSlots', 0)
      
      if (filters.venueId) {
        query.equalTo('venueId', filters.venueId)
      }
      
      if (filters.skillLevel) {
        query.equalTo('skillLevel', filters.skillLevel)
      }
      
      if (filters.timeSlot) {
        query.equalTo('timeSlot', filters.timeSlot)
      }
      
      if (filters.date) {
        query.equalTo('date', filters.date)
      }
      
      query.ascending('startTime')
      query.limit(20)
      
      const results = await query.find()
      
      return results.map(session => ({
        id: session.id,
        organizerId: session.get('organizerId'),
        venueId: session.get('venueId'),
        court: session.get('court'),
        timeSlot: session.get('timeSlot'),
        date: session.get('date'),
        startTime: session.get('startTime'),
        endTime: session.get('endTime'),
        currentPlayers: session.get('currentPlayers') || [],
        maxPlayers: session.get('maxPlayers'),
        openSlots: session.get('openSlots'),
        skillLevel: session.get('skillLevel'),
        gameType: session.get('gameType'),
        status: session.get('status'),
        pricePerPlayer: session.get('pricePerPlayer'),
        expiresAt: session.get('expiresAt')
      }))

    } catch (error) {
      console.error('❌ Error querying open sessions:', error)
      return []
    }
  }

  /**
   * Lazy cleanup of expired sessions (on-demand)
   */
  static async cleanupExpiredSessions(venueId?: string, timeSlot?: string): Promise<number> {
    try {
      const Session = Parse.Object.extend('Session')
      const query = new Parse.Query(Session)
      
      query.equalTo('status', 'open')
      query.lessThan('expiresAt', new Date())
      
      if (venueId) {
        query.equalTo('venueId', venueId)
      }
      
      if (timeSlot) {
        query.equalTo('timeSlot', timeSlot)
      }
      
      const expiredSessions = await query.find()
      
      // Delete expired sessions
      for (const session of expiredSessions) {
        session.set('status', 'expired')
        await session.save()
      }
      
      console.log(`🧹 Cleaned up ${expiredSessions.length} expired sessions`)
      return expiredSessions.length

    } catch (error) {
      console.error('❌ Error cleaning up expired sessions:', error)
      return 0
    }
  }

  /**
   * Cancel session
   */
  static async cancelSession(sessionId: string, userId: string): Promise<void> {
    try {
      const Session = Parse.Object.extend('Session')
      const query = new Parse.Query(Session)
      const session = await query.get(sessionId)

      // Check if user is organizer
      if (session.get('organizerId') !== userId) {
        throw new Error('Only session organizer can cancel')
      }

      session.set('status', 'cancelled')
      await session.save()

      console.log('✅ Session cancelled:', sessionId)

    } catch (error) {
      console.error('❌ Error cancelling session:', error)
      throw error
    }
  }
}