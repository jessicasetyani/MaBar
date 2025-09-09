import { PlayerService } from './playerService'
import { SessionService } from './sessionService'
import Parse from './back4app'

// Raw data interface - no formatting, just data
export interface ToolboxResponse {
  data: any
  error?: string
  isEmpty?: boolean
}

// Keep AIResponse for presenter
export interface AIResponse {
  text: string
  sessionCards?: Array<{
    type: 'existing-session' | 'create-new' | 'no-availability' | 'user-booking'
    data: any
  }>
  needsMoreInfo?: boolean
}

export class MatchmakingToolboxService {

  /**
   * Toolbox: Get available venues/courts - Returns raw data only
   */
  static async getAvailableVenues(params: any): Promise<ToolboxResponse> {
    console.log('🔧 [TOOLBOX] getAvailableVenues called with params:', params)
    
    try {
      const venues = await this.queryVenues(params)
      console.log('📊 [TOOLBOX] queryVenues returned:', venues.length, 'venues')
      
      return {
        data: venues,
        isEmpty: venues.length === 0
      }
    } catch (error) {
      console.error('❌ [TOOLBOX] Error in getAvailableVenues:', error)
      return {
        data: [],
        error: (error as Error).message,
        isEmpty: true
      }
    }
  }

  /**
   * Toolbox: Get available players - Returns raw data only
   */
  static async getAvailablePlayers(params: any): Promise<ToolboxResponse> {
    console.log('🔧 [TOOLBOX] getAvailablePlayers called with params:', params)
    
    try {
      const players = await this.queryPlayers(params)
      console.log('📊 [TOOLBOX] queryPlayers returned:', players.length, 'players')
      
      return {
        data: players,
        isEmpty: players.length === 0
      }
    } catch (error) {
      console.error('❌ [TOOLBOX] Error in getAvailablePlayers:', error)
      return {
        data: [],
        error: (error as Error).message,
        isEmpty: true
      }
    }
  }

  /**
   * Toolbox: Find open sessions to join - Returns raw data only
   */
  static async findOpenSessions(params: any): Promise<ToolboxResponse> {
    console.log('🔧 [TOOLBOX] findOpenSessions called with params:', params)

    try {
      const filters = {
        skillLevel: params.skillLevel,
        location: params.location,
        timeSlot: params.time,
        date: params.date
      }

      const sessions = await SessionService.queryOpenSessions(filters)
      console.log('📊 [TOOLBOX] queryOpenSessions returned:', sessions.length, 'sessions')
      console.log('📋 [TOOLBOX] Session details from DB:', sessions)

      return {
        data: {
          sessions,
          searchParams: params,
          totalCount: sessions.length
        },
        isEmpty: sessions.length === 0
      }
    } catch (error) {
      console.error('❌ [TOOLBOX] Error in findOpenSessions:', error)
      return {
        data: {
          sessions: [],
          searchParams: params,
          totalCount: 0
        },
        error: (error as Error).message,
        isEmpty: true
      }
    }
  }

  /**
   * Toolbox: Create new session - Returns raw data only
   */
  static async createNewSession(params: any): Promise<ToolboxResponse> {
    console.log('🔧 [TOOLBOX] createNewSession called with params:', params)

    try {
      const currentUser = Parse.User.current()
      if (!currentUser) {
        return {
          data: {
            requiresAuth: true,
            venues: [],
            searchParams: params
          },
          error: 'Authentication required',
          isEmpty: true
        }
      }

      const venues = await this.queryVenues({
        location: params.location,
        priceRange: params.priceRange
      })
      console.log('📊 [TOOLBOX] queryVenues for createNewSession returned:', venues.length, 'venues')
      console.log('📋 [TOOLBOX] Venue details for createNewSession:', venues)

      return {
        data: {
          venues,
          searchParams: params,
          user: {
            id: currentUser.id,
            username: currentUser.get('username')
          },
          totalCount: venues.length
        },
        isEmpty: venues.length === 0
      }
    } catch (error) {
      console.error('❌ [TOOLBOX] Error in createNewSession:', error)
      return {
        data: {
          venues: [],
          searchParams: params,
          totalCount: 0
        },
        error: (error as Error).message,
        isEmpty: true
      }
    }
  }

  /**
   * Toolbox: Find match (comprehensive search) - Returns raw data only
   */
  static async findMatch(params: any): Promise<ToolboxResponse> {
    console.log('🔧 [TOOLBOX] findMatch called with params:', params)
    
    try {
      const results = await this.executeComprehensiveQuery(params)
      console.log('📊 [TOOLBOX] executeComprehensiveQuery returned:', {
        venuesCount: results.venues.length,
        playersCount: results.players.length, 
        sessionsCount: results.sessions.length,
        totalResults: results.totalResults
      })
      
      return {
        data: results,
        isEmpty: results.totalResults === 0
      }
    } catch (error) {
      console.error('❌ [TOOLBOX] Error in findMatch:', error)
      return {
        data: { venues: [], players: [], sessions: [], totalResults: 0 },
        error: (error as Error).message,
        isEmpty: true
      }
    }
  }

  /**
   * Toolbox: Get venue details - Returns raw data only
   */
  static async getVenueDetails(params: any): Promise<ToolboxResponse> {
    console.log('🔧 [TOOLBOX] getVenueDetails called with params:', params)

    try {
      if (!params.venueId && !params.venueName) {
        return {
          data: {
            venue: null,
            searchParams: params
          },
          error: 'Venue not specified',
          isEmpty: true
        }
      }

      const Venue = Parse.Object.extend('Venue')
      const query = new Parse.Query(Venue)

      if (params.venueId) {
        query.equalTo('objectId', params.venueId)
      } else {
        query.matches('name', new RegExp(params.venueName, 'i'))
      }

      const venue = await query.first()
      console.log('📊 [TOOLBOX] venue query returned:', venue ? 'found' : 'not found')

      if (!venue) {
        return {
          data: {
            venue: null,
            searchParams: params
          },
          error: 'Venue not found',
          isEmpty: true
        }
      }

      const venueData = {
        id: venue.id,
        name: venue.get('name'),
        address: venue.get('address'),
        pricing: venue.get('pricing'),
        rating: venue.get('rating'),
        facilities: venue.get('facilities'),
        description: venue.get('description'),
        courtCount: venue.get('courtCount'),
        isActive: venue.get('isActive')
      }

      console.log('📋 [TOOLBOX] Venue details from DB:', venueData)

      return {
        data: {
          venue: venueData,
          searchParams: params
        },
        isEmpty: false
      }
    } catch (error) {
      console.error('❌ [TOOLBOX] Error in getVenueDetails:', error)
      return {
        data: {
          venue: null,
          searchParams: params
        },
        error: (error as Error).message,
        isEmpty: true
      }
    }
  }

  /**
   * Toolbox: Check venue availability - Returns raw data only
   */
  static async checkVenueAvailability(params: any): Promise<ToolboxResponse> {
    console.log('🔧 [TOOLBOX] checkVenueAvailability called with params:', params)

    try {
      if (!params.venueId || !params.date || !params.time) {
        return {
          data: {
            isAvailable: false,
            searchParams: params,
            missingInfo: true
          },
          error: 'Missing venue, date, or time information',
          isEmpty: true
        }
      }

      const requestDate = new Date(params.date)
      const timeSlot = params.time

      const Booking = Parse.Object.extend('Booking')
      const query = new Parse.Query(Booking)
      query.equalTo('venueId', params.venueId)
      query.equalTo('status', 'confirmed')

      const startOfDay = new Date(requestDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(requestDate)
      endOfDay.setHours(23, 59, 59, 999)

      query.greaterThanOrEqualTo('startTime', startOfDay)
      query.lessThanOrEqualTo('startTime', endOfDay)

      const bookings = await query.find()
      const isAvailable = bookings.length === 0
      console.log('📊 [TOOLBOX] availability check returned:', bookings.length, 'bookings, available:', isAvailable)

      return {
        data: {
          isAvailable,
          venueId: params.venueId,
          date: params.date,
          time: timeSlot,
          conflictingBookings: bookings.map(booking => ({
            id: booking.id,
            title: booking.get('title'),
            startTime: booking.get('startTime'),
            endTime: booking.get('endTime')
          })),
          searchParams: params
        },
        isEmpty: false
      }
    } catch (error) {
      console.error('❌ [TOOLBOX] Error in checkVenueAvailability:', error)
      return {
        data: {
          isAvailable: false,
          searchParams: params
        },
        error: (error as Error).message,
        isEmpty: true
      }
    }
  }

  /**
   * Toolbox: Get personalized recommendations - Returns raw data only
   */
  static async getPersonalizedRecommendations(params: any): Promise<ToolboxResponse> {
    console.log('🔧 [TOOLBOX] getPersonalizedRecommendations called with params:', params)

    try {
      const currentUser = Parse.User.current()
      if (!currentUser) {
        return {
          data: {
            requiresAuth: true,
            recommendations: null,
            searchParams: params
          },
          error: 'Authentication required',
          isEmpty: true
        }
      }

      const playerProfile = await PlayerService.getPlayerProfile()
      if (!playerProfile) {
        console.log('📊 [TOOLBOX] No player profile found, falling back to findMatch')
        return this.findMatch(params)
      }

      const preferences = playerProfile.get('preferences') || {}
      const personalInfo = playerProfile.get('personalInfo') || {}
      const personalizedFilters = {
        ...params,
        skillLevel: preferences.skillLevel || params.skillLevel,
        location: preferences.preferredAreas?.[0] || params.location,
        priceRange: preferences.budgetRange || params.priceRange
      }
      console.log('📊 [TOOLBOX] Using personalized filters:', personalizedFilters)

      const results = await this.executeComprehensiveQuery(personalizedFilters)
      console.log('📊 [TOOLBOX] Personalized query returned:', {
        venuesCount: results.venues.length,
        playersCount: results.players.length,
        sessionsCount: results.sessions.length,
        totalResults: results.totalResults
      })
      console.log('📋 [TOOLBOX] Personalized venues from DB:', results.venues)

      return {
        data: {
          recommendations: results,
          userProfile: {
            preferences,
            personalInfo
          },
          personalizedFilters,
          searchParams: params
        },
        isEmpty: results.totalResults === 0
      }
    } catch (error) {
      console.error('❌ [TOOLBOX] Error in getPersonalizedRecommendations:', error)
      return {
        data: {
          recommendations: null,
          searchParams: params
        },
        error: (error as Error).message,
        isEmpty: true
      }
    }
  }

  /**
   * Toolbox: Get user bookings - Returns raw data only
   */
  static async getUserBookings(params: any): Promise<ToolboxResponse> {
    console.log('🔧 [TOOLBOX] getUserBookings called with params:', params)

    try {
      const currentUser = Parse.User.current()
      if (!currentUser) {
        return {
          data: {
            requiresAuth: true,
            bookings: [],
            searchParams: params
          },
          error: 'Authentication required',
          isEmpty: true
        }
      }

      const Booking = Parse.Object.extend('Booking')
      const query = new Parse.Query(Booking)
      // Use players array to find user's bookings since createdBy might not exist on all records
      query.containsAll('players', [currentUser.get('username') || currentUser.get('email')])
      query.equalTo('status', 'confirmed')
      query.greaterThan('startTime', new Date())
      query.ascending('startTime')
      query.limit(10)

      const bookings = await query.find()
      console.log('📊 [TOOLBOX] getUserBookings returned:', bookings.length, 'bookings')

      const bookingData = bookings.map(booking => ({
        id: booking.id,
        title: booking.get('title'),
        venueId: booking.get('venueId'),
        startTime: booking.get('startTime'),
        endTime: booking.get('endTime'),
        court: booking.get('court'),
        players: booking.get('players'),
        status: booking.get('status'),
        price: booking.get('price'),
        paymentStatus: booking.get('paymentStatus')
      }))

      return {
        data: {
          bookings: bookingData,
          totalCount: bookings.length,
          user: {
            id: currentUser.id,
            username: currentUser.get('username'),
            email: currentUser.get('email')
          },
          searchParams: params
        },
        isEmpty: bookings.length === 0
      }
    } catch (error) {
      console.error('❌ [TOOLBOX] Error in getUserBookings:', error)
      return {
        data: {
          bookings: [],
          searchParams: params
        },
        error: (error as Error).message,
        isEmpty: true
      }
    }
  }

  /**
   * Toolbox: Get booking history - Returns raw data only
   */
  static async getBookingHistory(params: any): Promise<ToolboxResponse> {
    console.log('🔧 [TOOLBOX] getBookingHistory called with params:', params)

    try {
      const currentUser = Parse.User.current()
      if (!currentUser) {
        return {
          data: {
            requiresAuth: true,
            bookings: [],
            searchParams: params
          },
          error: 'Authentication required',
          isEmpty: true
        }
      }

      const Booking = Parse.Object.extend('Booking')
      const query = new Parse.Query(Booking)
      // Use players array to find user's bookings since createdBy might not exist on all records
      query.containsAll('players', [currentUser.get('username') || currentUser.get('email')])
      query.lessThan('startTime', new Date())
      query.descending('startTime')
      query.limit(10)

      const bookings = await query.find()
      console.log('📊 [TOOLBOX] getBookingHistory returned:', bookings.length, 'bookings')

      const bookingData = bookings.map(booking => ({
        id: booking.id,
        title: booking.get('title'),
        venueName: booking.get('venueName'),
        venueId: booking.get('venueId'),
        startTime: booking.get('startTime'),
        endTime: booking.get('endTime'),
        timeSlot: booking.get('timeSlot'),
        date: booking.get('date'),
        court: booking.get('court'),
        players: booking.get('players'),
        status: booking.get('status'),
        price: booking.get('price'),
        totalCost: booking.get('totalCost'),
        paymentStatus: booking.get('paymentStatus')
      }))

      return {
        data: {
          bookings: bookingData,
          totalCount: bookings.length,
          user: {
            id: currentUser.id,
            username: currentUser.get('username'),
            email: currentUser.get('email')
          },
          searchParams: params
        },
        isEmpty: bookings.length === 0
      }
    } catch (error) {
      console.error('❌ [TOOLBOX] Error in getBookingHistory:', error)
      return {
        data: {
          bookings: [],
          searchParams: params
        },
        error: (error as Error).message,
        isEmpty: true
      }
    }
  }

  /**
   * Toolbox: Modify booking - Returns raw data only
   */
  static async modifyBooking(params: any): Promise<ToolboxResponse> {
    console.log('🔧 [TOOLBOX] modifyBooking called with params:', params)

    return {
      data: {
        available: false,
        feature: 'modifyBooking',
        message: 'Booking modifications are not yet available through chat',
        searchParams: params
      },
      error: 'Feature not implemented',
      isEmpty: true
    }
  }

  /**
   * Toolbox: Cancel booking - Returns raw data only
   */
  static async cancelBooking(params: any): Promise<ToolboxResponse> {
    console.log('🔧 [TOOLBOX] cancelBooking called with params:', params)

    return {
      data: {
        available: false,
        feature: 'cancelBooking',
        message: 'Booking cancellations are not yet available through chat',
        searchParams: params
      },
      error: 'Feature not implemented',
      isEmpty: true
    }
  }

  /**
   * Toolbox: Delete booking - Returns raw data only
   */
  static async deleteBooking(params: any): Promise<ToolboxResponse> {
    console.log('🔧 [TOOLBOX] deleteBooking called with params:', params)

    return {
      data: {
        available: false,
        feature: 'deleteBooking',
        message: 'Booking deletion requires admin privileges',
        searchParams: params
      },
      error: 'Feature not implemented',
      isEmpty: true
    }
  }

  /**
   * Toolbox: Check booking status - Returns raw data only
   */
  static async checkBookingStatus(params: any): Promise<ToolboxResponse> {
    console.log('🔧 [TOOLBOX] checkBookingStatus called with params:', params)

    try {
      if (!params.bookingId) {
        return {
          data: {
            booking: null,
            searchParams: params
          },
          error: 'Booking ID required',
          isEmpty: true
        }
      }

      const Booking = Parse.Object.extend('Booking')
      const query = new Parse.Query(Booking)
      query.equalTo('objectId', params.bookingId)

      const booking = await query.first()
      console.log('📊 [TOOLBOX] checkBookingStatus returned:', booking ? 'found' : 'not found')

      if (!booking) {
        return {
          data: {
            booking: null,
            bookingId: params.bookingId,
            searchParams: params
          },
          error: 'Booking not found',
          isEmpty: true
        }
      }

      const bookingData = {
        id: booking.id,
        title: booking.get('title'),
        venueName: booking.get('venueName'),
        venueId: booking.get('venueId'),
        startTime: booking.get('startTime'),
        endTime: booking.get('endTime'),
        timeSlot: booking.get('timeSlot'),
        date: booking.get('date'),
        court: booking.get('court'),
        players: booking.get('players'),
        status: booking.get('status'),
        price: booking.get('price'),
        totalCost: booking.get('totalCost'),
        paymentStatus: booking.get('paymentStatus')
      }

      return {
        data: {
          booking: bookingData,
          searchParams: params
        },
        isEmpty: false
      }
    } catch (error) {
      console.error('❌ [TOOLBOX] Error in checkBookingStatus:', error)
      return {
        data: {
          booking: null,
          searchParams: params
        },
        error: (error as Error).message,
        isEmpty: true
      }
    }
  }

  /**
   * Toolbox: Join session confirmation - Returns raw data only
   */
  static async joinSession(params: any): Promise<ToolboxResponse> {
    console.log('🔧 [TOOLBOX] joinSession called with params:', params)

    try {
      const currentUser = Parse.User.current()
      if (!currentUser) {
        return {
          data: {
            requiresAuth: true,
            sessionJoined: false,
            searchParams: params
          },
          error: 'Authentication required',
          isEmpty: true
        }
      }

      const sessionId = params.sessionId || params.id
      if (!sessionId) {
        return {
          data: {
            sessionJoined: false,
            missingSessionId: true,
            searchParams: params
          },
          error: 'Session ID required',
          isEmpty: true
        }
      }

      // Here you would implement actual join logic
      // For now, return confirmation data
      return {
        data: {
          sessionJoined: true,
          sessionId: sessionId,
          venue: params.venue,
          time: params.time,
          date: params.date,
          status: 'joining',
          user: {
            id: currentUser.id,
            username: currentUser.get('username')
          },
          searchParams: params
        },
        isEmpty: false
      }
    } catch (error) {
      console.error('❌ [TOOLBOX] Error in joinSession:', error)
      return {
        data: {
          sessionJoined: false,
          searchParams: params
        },
        error: (error as Error).message,
        isEmpty: true
      }
    }
  }

  /**
   * Toolbox: Need more information - Returns raw data only
   */
  static needMoreInfo(params: any): ToolboxResponse {
    console.log('🔧 [TOOLBOX] needMoreInfo called with params:', params)

    const defaultMessage = `Hello there! I'm MaBar, your AI assistant for all things padel. Whether you're looking to find a court, team up with other players, or set up a new game, I'm here to help.<br><br>To get started, could you tell me a bit more about what you have in mind?<br><br>• Are you searching for <strong>players</strong> to join you, or do you need to <strong>book a court</strong>?<br>• What <strong>time</strong> are you thinking of playing? (e.g., "this evening at 7 PM", "Saturday morning")<br>• Is there a specific <strong>area</strong> you'd prefer? (e.g., "Senayan", "Kemang", "anywhere in Jakarta")`

    const response = {
      data: {
        needsMoreInfo: true,
        message: params.message || defaultMessage,
        searchParams: params
      },
      isEmpty: false
    }
    console.log('📤 [TOOLBOX] needMoreInfo response:', response)
    return response
  }

  // =============================================================================
  // PRIVATE QUERY METHODS
  // =============================================================================

  private static async queryVenues(filters: any) {
    try {
      const Venue = Parse.Object.extend('Venue')
      let query = new Parse.Query(Venue)
      query.equalTo('isActive', true)

      if (filters.location && filters.location !== 'Jakarta') {
        const locationQuery = Parse.Query.or(
          new Parse.Query(Venue).matches('address.area', new RegExp(filters.location, 'i')),
          new Parse.Query(Venue).matches('address.city', new RegExp(filters.location, 'i')),
          new Parse.Query(Venue).matches('name', new RegExp(filters.location, 'i'))
        )
        query = Parse.Query.and(query, locationQuery)
      }
      
      if (filters.priceRange) {
        if (filters.priceRange.min) {
          query.greaterThanOrEqualTo('pricing.hourlyRate', filters.priceRange.min)
        }
        if (filters.priceRange.max) {
          query.lessThanOrEqualTo('pricing.hourlyRate', filters.priceRange.max)
        }
      }
      
      if (filters.facilities && filters.facilities.length > 0) {
        query.containsAll('facilities', filters.facilities)
      }
      
      if (filters.minRating) {
        query.greaterThanOrEqualTo('rating', filters.minRating)
      }
      
      if (filters.minCourts) {
        query.greaterThanOrEqualTo('courtCount', filters.minCourts)
      }
      
      query.ascending('pricing.hourlyRate')
      query.limit(20)
      
      const results = await query.find()
      console.log('📊 [DB] Raw Parse venue objects from database:', results.length)
      
      // Log each venue's raw data
      results.forEach((venue, index) => {
        console.log(`🏟️ [DB] Venue ${index + 1}:`, {
          id: venue.id,
          objectId: venue.get('objectId'),
          name: venue.get('name'),
          address: venue.get('address'),
          pricing: venue.get('pricing'),
          facilities: venue.get('facilities'),
          rating: venue.get('rating'),
          isActive: venue.get('isActive'),
          courtCount: venue.get('courtCount'),
          description: venue.get('description')
        })
      })
      
      const mappedVenues = results.map(venue => ({
        id: venue.id,
        name: venue.get('name') || 'Padel Court',
        pricing: venue.get('pricing') || { hourlyRate: 175000 },
        address: venue.get('address') || { city: 'Jakarta', area: 'Central' },
        facilities: venue.get('facilities') || [],
        rating: venue.get('rating') || 4.0
      }))
      
      console.log('🔄 [DB] Mapped venue objects:', mappedVenues)
      return mappedVenues
    } catch (error) {
      console.error('❌ Error querying venues:', error)
      return []
    }
  }

  private static async queryPlayers(filters: any) {
    try {
      const searchCriteria: any = {}
      
      if (filters.skillLevel) {
        searchCriteria.skillLevel = filters.skillLevel
      }
      
      if (filters.location && filters.location !== 'Jakarta') {
        searchCriteria.preferredAreas = [filters.location]
      }
      
      if (filters.time) {
        const timeMapping = {
          'morning': ['Morning (6 AM-12 PM)'],
          'afternoon': ['Afternoon (12-6 PM)'],
          'evening': ['Evening (6-10 PM)'],
          'night': ['Night (10 PM-12 AM)']
        }
        
        const timeKey = Object.keys(timeMapping).find(key => 
          filters.time.toLowerCase().includes(key)
        )
        
        if (timeKey) {
          searchCriteria.playingTimes = timeMapping[timeKey as keyof typeof timeMapping]
        }
      }
      
      if (filters.gender && filters.gender !== 'mixed') {
        searchCriteria.gender = filters.gender
      }
      
      if (filters.age) {
        if (typeof filters.age === 'number') {
          searchCriteria.age = filters.age
        } else if (filters.age.min || filters.age.max) {
          searchCriteria.ageRange = filters.age
        }
      }
      
      if (filters.gameType) {
        searchCriteria.gameType = filters.gameType
      }
      
      const playerProfiles = await PlayerService.searchPlayers(searchCriteria)
      console.log('📊 [DB] Raw Parse player objects from database:', playerProfiles.length)
      
      // Log each player's raw data
      playerProfiles.forEach((profile, index) => {
        console.log(`👥 [DB] Player ${index + 1}:`, {
          id: profile.id,
          objectId: profile.get('objectId'),
          personalInfo: profile.get('personalInfo'),
          preferences: profile.get('preferences'),
          status: profile.get('status')
        })
      })
      
      const mappedPlayers = playerProfiles.map(profile => {
        const personalInfo = profile.get('personalInfo') || {}
        const preferences = profile.get('preferences') || {}
        return {
          id: profile.id,
          name: personalInfo.name || 'Player',
          skillLevel: preferences.skillLevel || 'Intermediate',
          preferredAreas: preferences.preferredAreas || [],
          playingTimes: preferences.playingTimes || []
        }
      })
      
      console.log('🔄 [DB] Mapped player objects:', mappedPlayers)
      return mappedPlayers
    } catch (error) {
      console.error('❌ Error querying players:', error)
      return []
    }
  }

  private static async executeComprehensiveQuery(filters: any) {
    try {
      const [venues, players, openSessions] = await Promise.all([
        this.queryVenues(filters),
        this.queryPlayers(filters),
        SessionService.queryOpenSessions({
          skillLevel: filters.skillLevel,
          location: filters.location,
          timeSlot: filters.time,
          date: filters.date
        })
      ])
      
      return {
        venues,
        players,
        sessions: openSessions,
        totalResults: venues.length + players.length + openSessions.length
      }
    } catch (error) {
      console.error('❌ Error in comprehensive query:', error)
      return { venues: [], players: [], sessions: [], totalResults: 0 }
    }
  }
}