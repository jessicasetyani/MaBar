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
        error: error.message,
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
        error: error.message,
        isEmpty: true
      }
    }
  }

  /**
   * Toolbox: Find open sessions to join
   */
  static async findOpenSessions(params: any): Promise<AIResponse> {
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
      
      if (sessions.length === 0) {
        const response = {
          text: 'No open sessions found. Would you like me to help you create a new game?',
          sessionCards: [{
            type: 'create-new' as const,
            data: {
              venue: 'Start New Game',
              ...(params.time && { suggestedTime: params.time }),
              ...(params.date && { suggestedDate: params.date }),
              message: 'Create a session and invite others to join!'
            }
          }]
        }
        console.log('📤 [TOOLBOX] findOpenSessions response (no sessions):', response)
        return response
      }

      const sessionCards = sessions.slice(0, 3).map(session => ({
        type: 'existing-session' as const,
        data: {
          sessionId: session.id,
          venue: `Session at ${session.timeSlot}`,
          time: session.timeSlot,
          date: session.date,
          players: session.currentPlayers.map(name => ({ name, skillLevel: session.skillLevel || 'Unknown' })),
          openSlots: session.openSlots,
          cost: `Rp ${session.pricePerPlayer.toLocaleString()}/player`
        }
      }))

      const response = {
        text: `Found ${sessions.length} open sessions you can join:`,
        sessionCards
      }
      console.log('📤 [TOOLBOX] findOpenSessions response:', response)
      return response
    } catch (error) {
      console.error('❌ [TOOLBOX] Error in findOpenSessions:', error)
      const errorResponse = {
        text: 'Sorry, I couldn\'t find open sessions right now.',
        sessionCards: [{
          type: 'no-availability' as const,
          data: { message: 'Service error' }
        }]
      }
      console.log('📤 [TOOLBOX] findOpenSessions error response:', errorResponse)
      return errorResponse
    }
  }

  /**
   * Toolbox: Create new session
   */
  static async createNewSession(params: any): Promise<AIResponse> {
    console.log('🔧 [TOOLBOX] createNewSession called with params:', params)
    
    try {
      const currentUser = Parse.User.current()
      if (!currentUser) {
        const response = {
          text: 'You need to be logged in to create a session.',
          sessionCards: [{
            type: 'no-availability' as const,
            data: { message: 'Authentication required' }
          }]
        }
        console.log('📤 [TOOLBOX] createNewSession response (no auth):', response)
        return response
      }

      const venues = await this.queryVenues({
        location: params.location,
        priceRange: params.priceRange
      })
      console.log('📊 [TOOLBOX] queryVenues for createNewSession returned:', venues.length, 'venues')
      console.log('📋 [TOOLBOX] Venue details for createNewSession:', venues)

      if (venues.length === 0) {
        const response = {
          text: 'No venues available for your criteria.',
          sessionCards: [{
            type: 'no-availability' as const,
            data: { message: 'No venues found' }
          }]
        }
        console.log('📤 [TOOLBOX] createNewSession response (no venues):', response)
        return response
      }

      const selectedVenue = venues[0]
      const pricePerPlayer = Math.round(selectedVenue.pricing.hourlyRate / 4)

      const response = {
        text: `Ready to create your session at ${selectedVenue.name}:`,
        sessionCards: [{
          type: 'create-new' as const,
          data: {
            venue: selectedVenue.name,
            address: `${selectedVenue.address.area}, ${selectedVenue.address.city}`,
            ...(params.time && { suggestedTime: params.time }),
            ...(params.date && { suggestedDate: params.date }),
            estimatedCost: `Rp ${pricePerPlayer.toLocaleString()}/player`,
            message: 'Create session and find 3 more players!'
          }
        }]
      }
      console.log('📤 [TOOLBOX] createNewSession response:', response)
      return response
    } catch (error) {
      console.error('❌ [TOOLBOX] Error in createNewSession:', error)
      const errorResponse = {
        text: 'Sorry, I couldn\'t create a new session right now.',
        sessionCards: [{
          type: 'no-availability' as const,
          data: { message: 'Service error' }
        }]
      }
      console.log('📤 [TOOLBOX] createNewSession error response:', errorResponse)
      return errorResponse
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
      console.log('📋 [TOOLBOX] Detailed results from executeComprehensiveQuery:')
      console.log('  🏟️ Venues:', results.venues)
      console.log('  👥 Players:', results.players)
      console.log('  🎮 Sessions:', results.sessions)
      
      if (results.totalResults === 0) {
        const response = {
          text: 'No matches found for your criteria. Would you like me to help you create a new session?',
          sessionCards: [{
            type: 'no-availability' as const,
            data: { message: 'No matches found for your search criteria' }
          }]
        }
        console.log('📤 [TOOLBOX] findMatch response (no results):', response)
        return response
      }

      const sessionCards = []

      if (results.venues.length > 0) {
        sessionCards.push({
          type: 'create-new' as const,
          data: {
            venue: results.venues[0].name,
            address: `${results.venues[0].address.area}, ${results.venues[0].address.city}`,
            cost: `Rp ${results.venues[0].pricing.hourlyRate.toLocaleString()}/hour`,
            ...(params.time && { suggestedTime: params.time }),
            ...(params.date && { suggestedDate: params.date })
          }
        })
      }

      if (results.sessions && results.sessions.length > 0) {
        sessionCards.push({
          type: 'existing-session' as const,
          data: {
            sessionId: results.sessions[0].id,
            venue: `Open Session - ${results.sessions[0].timeSlot}`,
            time: results.sessions[0].timeSlot,
            date: results.sessions[0].date,
            players: results.sessions[0].currentPlayers.map(name => ({ name, skillLevel: results.sessions[0].skillLevel || 'Unknown' })),
            openSlots: results.sessions[0].openSlots,
            cost: `Rp ${results.sessions[0].pricePerPlayer.toLocaleString()}/player`
          }
        })
      } else if (results.players.length > 0) {
        sessionCards.push({
          type: 'existing-session' as const,
          data: {
            venue: 'Available Players',
            players: results.players.slice(0, 3).map(player => ({
              name: player.name,
              skillLevel: player.skillLevel
            })),
            openSlots: Math.max(1, 4 - results.players.length),
            time: params.time || 'Flexible',
            date: params.date || 'Flexible',
            cost: 'To be shared'
          }
        })
      }

      const resultText = results.sessions?.length > 0 
        ? `Great! I found ${results.totalResults} options including ${results.sessions.length} open sessions:`
        : `Great! I found ${results.totalResults} options for your padel match:`
      
      const response = {
        text: resultText,
        sessionCards: sessionCards.slice(0, 3)
      }
      console.log('📤 [TOOLBOX] findMatch response:', response)
      return response
    } catch (error) {
      console.error('❌ [TOOLBOX] Error in findMatch:', error)
      const errorResponse = {
        text: 'Sorry, I encountered an issue finding matches. Please try again.',
        sessionCards: [{
          type: 'no-availability' as const,
          data: { message: 'Search error' }
        }]
      }
      console.log('📤 [TOOLBOX] findMatch error response:', errorResponse)
      return errorResponse
    }
  }

  /**
   * Toolbox: Get venue details
   */
  static async getVenueDetails(params: any): Promise<AIResponse> {
    console.log('🔧 [TOOLBOX] getVenueDetails called with params:', params)
    
    try {
      if (!params.venueId && !params.venueName) {
        const response = {
          text: 'Please specify which venue you want details for.',
          sessionCards: [{ type: 'no-availability' as const, data: { message: 'Venue not specified' } }]
        }
        console.log('📤 [TOOLBOX] getVenueDetails response (no venue specified):', response)
        return response
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
      if (venue) {
        console.log('📋 [TOOLBOX] Venue details from DB:', {
          id: venue.id,
          name: venue.get('name'),
          address: venue.get('address'),
          pricing: venue.get('pricing'),
          rating: venue.get('rating'),
          facilities: venue.get('facilities')
        })
      }
      
      if (!venue) {
        const response = {
          text: 'Venue not found.',
          sessionCards: [{ type: 'no-availability' as const, data: { message: 'Venue not found' } }]
        }
        console.log('📤 [TOOLBOX] getVenueDetails response (venue not found):', response)
        return response
      }

      const response = {
        text: `Here are the details for ${venue.get('name')}:`,
        sessionCards: [{
          type: 'create-new' as const,
          data: {
            venue: venue.get('name'),
            address: `${venue.get('address')?.area}, ${venue.get('address')?.city}`,
            cost: `Rp ${venue.get('pricing')?.hourlyRate?.toLocaleString()}/hour`,
            rating: venue.get('rating') || 4.0,
            facilities: venue.get('facilities') || [],
            description: venue.get('description') || 'Professional padel court'
          }
        }]
      }
      console.log('📤 [TOOLBOX] getVenueDetails response:', response)
      return response
    } catch (error) {
      console.error('❌ [TOOLBOX] Error in getVenueDetails:', error)
      const errorResponse = {
        text: 'Sorry, I couldn\'t get venue details right now.',
        sessionCards: [{ type: 'no-availability' as const, data: { message: 'Service error' } }]
      }
      console.log('📤 [TOOLBOX] getVenueDetails error response:', errorResponse)
      return errorResponse
    }
  }

  /**
   * Toolbox: Check venue availability
   */
  static async checkVenueAvailability(params: any): Promise<AIResponse> {
    console.log('🔧 [TOOLBOX] checkVenueAvailability called with params:', params)
    
    try {
      if (!params.venueId || !params.date || !params.time) {
        const response = {
          text: 'Please specify venue, date, and time to check availability.',
          sessionCards: [{ type: 'no-availability' as const, data: { message: 'Missing information' } }]
        }
        console.log('📤 [TOOLBOX] checkVenueAvailability response (missing info):', response)
        return response
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

      const response = {
        text: isAvailable ? 
          `Great! The venue is available for ${timeSlot} on ${params.date}.` :
          `Sorry, the venue is not available for ${timeSlot} on ${params.date}.`,
        sessionCards: [{
          type: isAvailable ? 'create-new' as const : 'no-availability' as const,
          data: {
            venue: 'Availability Check',
            time: timeSlot,
            date: params.date,
            available: isAvailable,
            message: isAvailable ? 'Available for booking!' : 'Try a different time'
          }
        }]
      }
      console.log('📤 [TOOLBOX] checkVenueAvailability response:', response)
      return response
    } catch (error) {
      console.error('❌ [TOOLBOX] Error in checkVenueAvailability:', error)
      const errorResponse = {
        text: 'Sorry, I couldn\'t check availability right now.',
        sessionCards: [{ type: 'no-availability' as const, data: { message: 'Service error' } }]
      }
      console.log('📤 [TOOLBOX] checkVenueAvailability error response:', errorResponse)
      return errorResponse
    }
  }

  /**
   * Toolbox: Get personalized recommendations
   */
  static async getPersonalizedRecommendations(params: any): Promise<AIResponse> {
    console.log('🔧 [TOOLBOX] getPersonalizedRecommendations called with params:', params)
    
    try {
      const currentUser = Parse.User.current()
      if (!currentUser) {
        const response = {
          text: 'Please log in to get personalized recommendations.',
          sessionCards: [{ type: 'no-availability' as const, data: { message: 'Authentication required' } }]
        }
        console.log('📤 [TOOLBOX] getPersonalizedRecommendations response (no auth):', response)
        return response
      }

      const playerProfile = await PlayerService.getPlayerProfile()
      if (!playerProfile) {
        console.log('📊 [TOOLBOX] No player profile found, falling back to findMatch')
        return this.findMatch(params)
      }

      const preferences = playerProfile.get('preferences') || {}
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
      
      if (results.totalResults === 0) {
        const response = {
          text: 'No personalized matches found. Try expanding your preferences.',
          sessionCards: [{ type: 'no-availability' as const, data: { message: 'No matches' } }]
        }
        console.log('📤 [TOOLBOX] getPersonalizedRecommendations response (no results):', response)
        return response
      }

      const response = {
        text: `Based on your profile, here are ${results.totalResults} personalized recommendations:`,
        sessionCards: results.venues.slice(0, 2).map(venue => ({
          type: 'create-new' as const,
          data: {
            venue: venue.name,
            address: `${venue.address.area}, ${venue.address.city}`,
            cost: `Rp ${venue.pricing.hourlyRate.toLocaleString()}/hour`,
            reason: `Matches your ${preferences.skillLevel} skill level and ${preferences.preferredAreas?.[0]} area preference`
          }
        }))
      }
      console.log('📤 [TOOLBOX] getPersonalizedRecommendations response:', response)
      return response
    } catch (error) {
      console.error('❌ [TOOLBOX] Error in getPersonalizedRecommendations:', error)
      const errorResponse = {
        text: 'Sorry, I couldn\'t get personalized recommendations right now.',
        sessionCards: [{ type: 'no-availability' as const, data: { message: 'Service error' } }]
      }
      console.log('📤 [TOOLBOX] getPersonalizedRecommendations error response:', errorResponse)
      return errorResponse
    }
  }

  /**
   * Toolbox: Get user bookings
   */
  static async getUserBookings(params: any): Promise<AIResponse> {
    console.log('🔧 [TOOLBOX] getUserBookings called with params:', params)
    
    try {
      const currentUser = Parse.User.current()
      if (!currentUser) {
        const response = {
          text: 'Please log in to view your bookings.',
          sessionCards: [{ type: 'no-availability' as const, data: { message: 'Authentication required' } }]
        }
        console.log('📤 [TOOLBOX] getUserBookings response (no auth):', response)
        return response
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
      
      if (bookings.length === 0) {
        const response = {
          text: 'You have no upcoming bookings. Ready to book your next game?'
        }
        console.log('📤 [TOOLBOX] getUserBookings response (no bookings):', response)
        return response
      }

      const sessionCards = bookings.slice(0, 3).map(booking => ({
        type: 'user-booking' as const,
        data: {
          bookingId: booking.id,
          venue: booking.get('title') || 'Padel Court',
          time: booking.get('startTime')?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          date: booking.get('startTime')?.toLocaleDateString(),
          status: booking.get('status'),
          cost: `Rp ${booking.get('price')?.toLocaleString()}`
        }
      }))

      const response = {
        text: `You have ${bookings.length} upcoming booking${bookings.length > 1 ? 's' : ''}:`,
        sessionCards
      }
      console.log('📤 [TOOLBOX] getUserBookings response:', response)
      return response
    } catch (error) {
      console.error('❌ [TOOLBOX] Error in getUserBookings:', error)
      const errorResponse = {
        text: 'Sorry, I couldn\'t fetch your bookings right now.',
        sessionCards: [{ type: 'no-availability' as const, data: { message: 'Service error' } }]
      }
      console.log('📤 [TOOLBOX] getUserBookings error response:', errorResponse)
      return errorResponse
    }
  }

  /**
   * Toolbox: Get booking history
   */
  static async getBookingHistory(params: any): Promise<AIResponse> {
    console.log('🔧 [TOOLBOX] getBookingHistory called with params:', params)
    
    try {
      const currentUser = Parse.User.current()
      if (!currentUser) {
        const response = {
          text: 'Please log in to view your booking history.',
          sessionCards: [{ type: 'no-availability' as const, data: { message: 'Authentication required' } }]
        }
        console.log('📤 [TOOLBOX] getBookingHistory response (no auth):', response)
        return response
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
      
      if (bookings.length === 0) {
        const response = {
          text: 'No booking history found. Start playing to build your game history!'
        }
        console.log('📤 [TOOLBOX] getBookingHistory response (no history):', response)
        return response
      }

      const response = {
        text: `Here are your ${bookings.length} recent games:`,
        sessionCards: bookings.slice(0, 3).map(booking => ({
          type: 'user-booking' as const,
          data: {
            bookingId: booking.id,
            venue: booking.get('venueName') || 'Padel Court',
            time: booking.get('timeSlot'),
            date: booking.get('date'),
            status: 'completed',
            cost: `Rp ${booking.get('totalCost')?.toLocaleString()}`
          }
        }))
      }
      console.log('📤 [TOOLBOX] getBookingHistory response:', response)
      return response
    } catch (error) {
      console.error('❌ [TOOLBOX] Error in getBookingHistory:', error)
      const errorResponse = {
        text: 'Sorry, I couldn\'t fetch your booking history right now.',
        sessionCards: [{ type: 'no-availability' as const, data: { message: 'Service error' } }]
      }
      console.log('📤 [TOOLBOX] getBookingHistory error response:', errorResponse)
      return errorResponse
    }
  }

  /**
   * Toolbox: Modify booking
   */
  static async modifyBooking(params: any): Promise<AIResponse> {
    console.log('🔧 [TOOLBOX] modifyBooking called with params:', params)
    
    const response = {
      text: 'Booking modifications are not yet available through chat. Please contact the venue directly or use the booking management page.'
    }
    console.log('📤 [TOOLBOX] modifyBooking response:', response)
    return response
  }

  /**
   * Toolbox: Cancel booking
   */
  static async cancelBooking(params: any): Promise<AIResponse> {
    console.log('🔧 [TOOLBOX] cancelBooking called with params:', params)
    
    const response = {
      text: 'Booking cancellations are not yet available through chat. Please contact the venue directly or use the booking management page.'
    }
    console.log('📤 [TOOLBOX] cancelBooking response:', response)
    return response
  }

  /**
   * Toolbox: Delete booking
   */
  static async deleteBooking(params: any): Promise<AIResponse> {
    console.log('🔧 [TOOLBOX] deleteBooking called with params:', params)
    
    const response = {
      text: 'Booking deletion requires admin privileges and is not available through chat.'
    }
    console.log('📤 [TOOLBOX] deleteBooking response:', response)
    return response
  }

  /**
   * Toolbox: Check booking status
   */
  static async checkBookingStatus(params: any): Promise<AIResponse> {
    console.log('🔧 [TOOLBOX] checkBookingStatus called with params:', params)
    
    try {
      if (!params.bookingId) {
        const response = {
          text: 'Please provide a booking ID to check status.',
          sessionCards: [{ type: 'no-availability' as const, data: { message: 'Booking ID required' } }]
        }
        console.log('📤 [TOOLBOX] checkBookingStatus response (no ID):', response)
        return response
      }

      const Booking = Parse.Object.extend('Booking')
      const query = new Parse.Query(Booking)
      query.equalTo('objectId', params.bookingId)
      
      const booking = await query.first()
      console.log('📊 [TOOLBOX] checkBookingStatus returned:', booking ? 'found' : 'not found')
      
      if (!booking) {
        const response = {
          text: 'Booking not found. Please check your booking ID.',
          sessionCards: [{ type: 'no-availability' as const, data: { message: 'Booking not found' } }]
        }
        console.log('📤 [TOOLBOX] checkBookingStatus response (not found):', response)
        return response
      }

      const response = {
        text: `Your booking status: ${booking.get('status')}`,
        sessionCards: [{
          type: 'user-booking' as const,
          data: {
            bookingId: booking.id,
            venue: booking.get('venueName') || 'Padel Court',
            time: booking.get('timeSlot'),
            date: booking.get('date'),
            status: booking.get('status'),
            cost: `Rp ${booking.get('totalCost')?.toLocaleString()}`
          }
        }]
      }
      console.log('📤 [TOOLBOX] checkBookingStatus response:', response)
      return response
    } catch (error) {
      console.error('❌ [TOOLBOX] Error in checkBookingStatus:', error)
      const errorResponse = {
        text: 'Sorry, I couldn\'t check the booking status right now.',
        sessionCards: [{ type: 'no-availability' as const, data: { message: 'Service error' } }]
      }
      console.log('📤 [TOOLBOX] checkBookingStatus error response:', errorResponse)
      return errorResponse
    }
  }

  /**
   * Toolbox: Join session confirmation
   */
  static async joinSession(params: any): Promise<AIResponse> {
    console.log('🔧 [TOOLBOX] joinSession called with params:', params)
    
    try {
      const currentUser = Parse.User.current()
      if (!currentUser) {
        return {
          text: 'Please log in to join sessions.'
        }
      }

      const sessionId = params.sessionId || params.id
      if (!sessionId) {
        return {
          text: 'Session information is missing. Please try selecting the session again.'
        }
      }

      // Here you would implement actual join logic
      // For now, return confirmation card
      const response = {
        text: 'Great! I\'m processing your request to join this session.',
        sessionCards: [{
          type: 'join-confirmation' as const,
          data: {
            sessionId: sessionId,
            venue: params.venue || 'Padel Session',
            time: params.time,
            date: params.date,
            status: 'joining',
            message: 'Joining session... You\'ll receive confirmation shortly.'
          }
        }]
      }
      console.log('📤 [TOOLBOX] joinSession response:', response)
      return response
    } catch (error) {
      console.error('❌ [TOOLBOX] Error in joinSession:', error)
      return {
        text: 'Sorry, I couldn\'t process your join request right now. Please try again.'
      }
    }
  }

  /**
   * Toolbox: Need more information
   */
  static needMoreInfo(params: any): AIResponse {
    console.log('🔧 [TOOLBOX] needMoreInfo called with params:', params)
    
    const message = params.message || `Hello there! I'm MaBar, your AI assistant for all things padel. Whether you're looking to find a court, team up with other players, or set up a new game, I'm here to help.<br><br>To get started, could you tell me a bit more about what you have in mind?<br><br>• Are you searching for <strong>players</strong> to join you, or do you need to <strong>book a court</strong>?<br>• What <strong>time</strong> are you thinking of playing? (e.g., "this evening at 7 PM", "Saturday morning")<br>• Is there a specific <strong>area</strong> you'd prefer? (e.g., "Senayan", "Kemang", "anywhere in Jakarta")`

    const response = {
      text: message,
      needsMoreInfo: true
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
      const query = new Parse.Query(Venue)
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
        data: {
          venues,
          players,
          sessions: openSessions,
          totalResults: venues.length + players.length + openSessions.length
        },
        isEmpty: venues.length + players.length + openSessions.length === 0
      }
    } catch (error) {
      console.error('❌ Error in comprehensive query:', error)
      return { venues: [], players: [], sessions: [], totalResults: 0 }
    }
  }
}