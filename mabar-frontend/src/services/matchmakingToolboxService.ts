import { PlayerService } from './playerService'
import { SessionService } from './sessionService'
import Parse from './back4app'

export interface AIResponse {
  text: string
  sessionCards?: Array<{
    type: 'existing-session' | 'create-new' | 'no-availability'
    data: any
  }>
  needsMoreInfo?: boolean
}

export class MatchmakingToolboxService {

  /**
   * Toolbox: Get available venues/courts
   */
  static async getAvailableVenues(params: any): Promise<AIResponse> {
    try {
      const venues = await this.queryVenues(params)
      
      if (venues.length === 0) {
        return {
          text: 'No venues found matching your criteria. Try expanding your search area or time.',
          sessionCards: [{
            type: 'no-availability',
            data: { message: 'No venues available' }
          }]
        }
      }

      const sessionCards = venues.slice(0, 3).map(venue => ({
        type: 'create-new' as const,
        data: {
          venue: venue.name,
          address: `${venue.address.area}, ${venue.address.city}`,
          cost: `Rp ${venue.pricing.hourlyRate.toLocaleString()}/hour`,
          rating: venue.rating,
          facilities: venue.facilities,
          suggestedTime: params.time || '8-9 PM',
          suggestedDate: params.date || 'Today'
        }
      }))

      return {
        text: `Found ${venues.length} available venues in ${params.location || 'Jakarta'}:`,
        sessionCards
      }
    } catch (error) {
      console.error('❌ Error in getAvailableVenues:', error)
      return {
        text: 'Sorry, I couldn\'t fetch venue information right now.',
        sessionCards: [{
          type: 'no-availability',
          data: { message: 'Service error' }
        }]
      }
    }
  }

  /**
   * Toolbox: Get available players
   */
  static async getAvailablePlayers(params: any): Promise<AIResponse> {
    try {
      const players = await this.queryPlayers(params)
      
      if (players.length === 0) {
        return {
          text: 'No players found matching your criteria. Try expanding your skill level or location preferences.',
          sessionCards: [{
            type: 'no-availability',
            data: { message: 'No players available' }
          }]
        }
      }

      const sessionCards = [{
        type: 'existing-session' as const,
        data: {
          venue: 'Available Players',
          players: players.slice(0, 4).map(player => ({
            name: player.name,
            skillLevel: player.skillLevel
          })),
          openSlots: Math.max(0, 4 - players.length),
          time: params.time || 'Flexible',
          date: params.date || 'Flexible',
          cost: 'To be determined'
        }
      }]

      return {
        text: `Found ${players.length} available players matching your criteria:`,
        sessionCards
      }
    } catch (error) {
      console.error('❌ Error in getAvailablePlayers:', error)
      return {
        text: 'Sorry, I couldn\'t fetch player information right now.',
        sessionCards: [{
          type: 'no-availability',
          data: { message: 'Service error' }
        }]
      }
    }
  }

  /**
   * Toolbox: Find open sessions to join
   */
  static async findOpenSessions(params: any): Promise<AIResponse> {
    try {
      const filters = {
        skillLevel: params.skillLevel,
        location: params.location,
        timeSlot: params.time,
        date: params.date
      }

      const sessions = await SessionService.queryOpenSessions(filters)
      
      if (sessions.length === 0) {
        return {
          text: 'No open sessions found. Would you like me to help you create a new game?',
          sessionCards: [{
            type: 'create-new',
            data: {
              venue: 'Start New Game',
              suggestedTime: params.time || '8-9 PM',
              suggestedDate: params.date || 'Today',
              message: 'Create a session and invite others to join!'
            }
          }]
        }
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

      return {
        text: `Found ${sessions.length} open sessions you can join:`,
        sessionCards
      }
    } catch (error) {
      console.error('❌ Error in findOpenSessions:', error)
      return {
        text: 'Sorry, I couldn\'t find open sessions right now.',
        sessionCards: [{
          type: 'no-availability',
          data: { message: 'Service error' }
        }]
      }
    }
  }

  /**
   * Toolbox: Create new session
   */
  static async createNewSession(params: any): Promise<AIResponse> {
    try {
      const currentUser = Parse.User.current()
      if (!currentUser) {
        return {
          text: 'You need to be logged in to create a session.',
          sessionCards: [{
            type: 'no-availability',
            data: { message: 'Authentication required' }
          }]
        }
      }

      const venues = await this.queryVenues({
        location: params.location,
        priceRange: params.priceRange
      })

      if (venues.length === 0) {
        return {
          text: 'No venues available for your criteria.',
          sessionCards: [{
            type: 'no-availability',
            data: { message: 'No venues found' }
          }]
        }
      }

      const selectedVenue = venues[0]
      const pricePerPlayer = Math.round(selectedVenue.pricing.hourlyRate / 4)

      return {
        text: `Ready to create your session at ${selectedVenue.name}:`,
        sessionCards: [{
          type: 'create-new',
          data: {
            venue: selectedVenue.name,
            address: `${selectedVenue.address.area}, ${selectedVenue.address.city}`,
            suggestedTime: params.time || '8-9 PM',
            suggestedDate: params.date || 'Today',
            estimatedCost: `Rp ${pricePerPlayer.toLocaleString()}/player`,
            message: 'Create session and find 3 more players!'
          }
        }]
      }
    } catch (error) {
      console.error('❌ Error in createNewSession:', error)
      return {
        text: 'Sorry, I couldn\'t create a new session right now.',
        sessionCards: [{
          type: 'no-availability',
          data: { message: 'Service error' }
        }]
      }
    }
  }

  /**
   * Toolbox: Find match (comprehensive search)
   */
  static async findMatch(params: any): Promise<AIResponse> {
    try {
      const results = await this.executeComprehensiveQuery(params)
      
      if (results.totalResults === 0) {
        return {
          text: 'No matches found for your criteria. Would you like me to help you create a new session?',
          sessionCards: [{
            type: 'create-new',
            data: {
              venue: 'Create New Session',
              suggestedTime: params.time || '8-9 PM',
              suggestedDate: params.date || 'Today',
              estimatedCost: 'Rp 175,000/hour',
              message: 'Start a new game and invite others to join!'
            }
          }]
        }
      }

      const sessionCards = []

      if (results.venues.length > 0) {
        sessionCards.push({
          type: 'create-new' as const,
          data: {
            venue: results.venues[0].name,
            address: `${results.venues[0].address.area}, ${results.venues[0].address.city}`,
            cost: `Rp ${results.venues[0].pricing.hourlyRate.toLocaleString()}/hour`,
            suggestedTime: params.time || '8-9 PM',
            suggestedDate: params.date || 'Today'
          }
        })
      }

      if (results.players.length > 0) {
        sessionCards.push({
          type: 'existing-session' as const,
          data: {
            venue: 'Join Players',
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

      return {
        text: `Great! I found ${results.totalResults} options for your padel match:`,
        sessionCards: sessionCards.slice(0, 3)
      }
    } catch (error) {
      console.error('❌ Error in findMatch:', error)
      return {
        text: 'Sorry, I encountered an issue finding matches. Please try again.',
        sessionCards: [{
          type: 'no-availability',
          data: { message: 'Search error' }
        }]
      }
    }
  }

  /**
   * Toolbox: Get venue details
   */
  static async getVenueDetails(params: any): Promise<AIResponse> {
    try {
      if (!params.venueId && !params.venueName) {
        return {
          text: 'Please specify which venue you want details for.',
          sessionCards: [{ type: 'no-availability', data: { message: 'Venue not specified' } }]
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
      if (!venue) {
        return {
          text: 'Venue not found.',
          sessionCards: [{ type: 'no-availability', data: { message: 'Venue not found' } }]
        }
      }

      return {
        text: `Here are the details for ${venue.get('name')}:`,
        sessionCards: [{
          type: 'create-new',
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
    } catch (error) {
      console.error('❌ Error in getVenueDetails:', error)
      return {
        text: 'Sorry, I couldn\'t get venue details right now.',
        sessionCards: [{ type: 'no-availability', data: { message: 'Service error' } }]
      }
    }
  }

  /**
   * Toolbox: Check venue availability
   */
  static async checkVenueAvailability(params: any): Promise<AIResponse> {
    try {
      if (!params.venueId || !params.date || !params.time) {
        return {
          text: 'Please specify venue, date, and time to check availability.',
          sessionCards: [{ type: 'no-availability', data: { message: 'Missing information' } }]
        }
      }

      // Parse date and time
      const requestDate = new Date(params.date)
      const timeSlot = params.time

      // Check existing bookings
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
      const isAvailable = bookings.length === 0 // Simplified check

      return {
        text: isAvailable ? 
          `Great! The venue is available for ${timeSlot} on ${params.date}.` :
          `Sorry, the venue is not available for ${timeSlot} on ${params.date}.`,
        sessionCards: [{
          type: isAvailable ? 'create-new' : 'no-availability',
          data: {
            venue: 'Availability Check',
            time: timeSlot,
            date: params.date,
            available: isAvailable,
            message: isAvailable ? 'Available for booking!' : 'Try a different time'
          }
        }]
      }
    } catch (error) {
      console.error('❌ Error in checkVenueAvailability:', error)
      return {
        text: 'Sorry, I couldn\'t check availability right now.',
        sessionCards: [{ type: 'no-availability', data: { message: 'Service error' } }]
      }
    }
  }

  /**
   * Toolbox: Get personalized recommendations
   */
  static async getPersonalizedRecommendations(params: any): Promise<AIResponse> {
    try {
      const currentUser = Parse.User.current()
      if (!currentUser) {
        return {
          text: 'Please log in to get personalized recommendations.',
          sessionCards: [{ type: 'no-availability', data: { message: 'Authentication required' } }]
        }
      }

      // Get user profile for personalization
      const playerProfile = await PlayerService.getPlayerProfile()
      if (!playerProfile) {
        return this.findMatch(params) // Fallback to general search
      }

      const preferences = playerProfile.get('preferences') || {}
      const personalizedFilters = {
        ...params,
        skillLevel: preferences.skillLevel || params.skillLevel,
        location: preferences.preferredAreas?.[0] || params.location,
        priceRange: preferences.budgetRange || params.priceRange
      }

      const results = await this.executeComprehensiveQuery(personalizedFilters)
      
      if (results.totalResults === 0) {
        return {
          text: 'No personalized matches found. Try expanding your preferences.',
          sessionCards: [{ type: 'no-availability', data: { message: 'No matches' } }]
        }
      }

      return {
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
    } catch (error) {
      console.error('❌ Error in getPersonalizedRecommendations:', error)
      return {
        text: 'Sorry, I couldn\'t get personalized recommendations right now.',
        sessionCards: [{ type: 'no-availability', data: { message: 'Service error' } }]
      }
    }
  }

  /**
   * Toolbox: Need more information
   */
  static needMoreInfo(params: any): AIResponse {
    const message = params.message || `Hi! I'm Session Scout. I can help you find padel courts, players, or organize games. What would you like to do?

• Are you looking for **players** to join you, or **available courts** to book?
• What **time** works for you? (e.g., "tonight at 7 PM", "Saturday morning")  
• Which **area** do you prefer? (e.g., "Senayan", "Kemang", "anywhere in Jakarta")`

    return {
      text: message,
      needsMoreInfo: true,
      sessionCards: [{
        type: 'no-availability',
        data: { message: 'Need more details to help you find the perfect match!' }
      }]
    }
  }





  // =============================================================================
  // PRIVATE QUERY METHODS
  // =============================================================================

  private static async queryVenues(filters: any) {
    try {
      const Venue = Parse.Object.extend('Venue')
      const query = new Parse.Query(Venue)
      query.equalTo('isActive', true)
      
      // Location filtering
      if (filters.location && filters.location !== 'Jakarta') {
        const locationQuery = Parse.Query.or(
          new Parse.Query(Venue).matches('address.area', new RegExp(filters.location, 'i')),
          new Parse.Query(Venue).matches('address.city', new RegExp(filters.location, 'i')),
          new Parse.Query(Venue).matches('name', new RegExp(filters.location, 'i'))
        )
        query = Parse.Query.and(query, locationQuery)
      }
      
      // Price range filtering
      if (filters.priceRange) {
        if (filters.priceRange.min) {
          query.greaterThanOrEqualTo('pricing.hourlyRate', filters.priceRange.min)
        }
        if (filters.priceRange.max) {
          query.lessThanOrEqualTo('pricing.hourlyRate', filters.priceRange.max)
        }
      }
      
      // Facilities filtering
      if (filters.facilities && filters.facilities.length > 0) {
        query.containsAll('facilities', filters.facilities)
      }
      
      // Rating filtering (optional)
      if (filters.minRating) {
        query.greaterThanOrEqualTo('rating', filters.minRating)
      }
      
      // Court count filtering (optional)
      if (filters.minCourts) {
        query.greaterThanOrEqualTo('courtCount', filters.minCourts)
      }
      
      query.ascending('pricing.hourlyRate')
      query.limit(20)
      
      const results = await query.find()
      return results.map(venue => ({
        id: venue.id,
        name: venue.get('name') || 'Padel Court',
        pricing: venue.get('pricing') || { hourlyRate: 175000 },
        address: venue.get('address') || { city: 'Jakarta', area: 'Central' },
        facilities: venue.get('facilities') || [],
        rating: venue.get('rating') || 4.0
      }))
    } catch (error) {
      console.error('❌ Error querying venues:', error)
      return []
    }
  }

  private static async queryPlayers(filters: any) {
    try {
      const searchCriteria: any = {}
      
      // Skill level filtering
      if (filters.skillLevel) {
        searchCriteria.skillLevel = filters.skillLevel
      }
      
      // Location filtering
      if (filters.location && filters.location !== 'Jakarta') {
        searchCriteria.preferredAreas = [filters.location]
      }
      
      // Playing times filtering
      if (filters.time) {
        const timeMapping = {
          'morning': ['Morning (6-12 PM)'],
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
      
      // Gender filtering
      if (filters.gender && filters.gender !== 'mixed') {
        searchCriteria.gender = filters.gender
      }
      
      // Age filtering
      if (filters.age) {
        if (typeof filters.age === 'number') {
          searchCriteria.age = filters.age
        } else if (filters.age.min || filters.age.max) {
          searchCriteria.ageRange = filters.age
        }
      }
      
      // Game type filtering
      if (filters.gameType) {
        searchCriteria.gameType = filters.gameType
      }
      
      const playerProfiles = await PlayerService.searchPlayers(searchCriteria)
      return playerProfiles.map(profile => {
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
    } catch (error) {
      console.error('❌ Error querying players:', error)
      return []
    }
  }

  private static async executeComprehensiveQuery(filters: any) {
    try {
      // Execute parallel queries for better performance
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