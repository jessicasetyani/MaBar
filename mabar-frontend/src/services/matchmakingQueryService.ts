import Parse from './back4app'
import { PlayerService } from './playerService'

export interface QueryFilters {
  skillLevel?: string
  location?: string
  venue?: string
  timeSlot?: string
  date?: string
  priceRange?: { min: number; max: number }
  playerCount?: number
}

export interface VenueResult {
  id: string
  name: string
  pricing: { hourlyRate: number }
  address: { city: string; area: string }
  facilities: string[]
  rating: number
  isActive: boolean
}

export interface PlayerResult {
  id: string
  name: string
  skillLevel: string
  preferredAreas: string[]
  playingTimes: string[]
  isActive: boolean
}

export interface SessionResult {
  id: string
  venue: string
  time: string
  date: string
  players: Array<{ name: string; skillLevel: string }>
  openSlots: number
  cost: string
}

export class MatchmakingQueryService {
  
  /**
   * Query venues with comprehensive filtering
   */
  static async queryVenues(filters: QueryFilters): Promise<VenueResult[]> {
    try {
      console.log('🏟️ Querying venues with filters:', filters)
      
      const Venue = Parse.Object.extend('Venue')
      const query = new Parse.Query(Venue)
      
      // Base filter - only active venues
      query.equalTo('isActive', true)
      
      // Location filtering
      if (filters.location && filters.location !== 'jakarta_area') {
        // Try to match area in address
        query.matches('address.area', new RegExp(filters.location, 'i'))
      }
      
      // Venue name filtering
      if (filters.venue) {
        query.matches('name', new RegExp(filters.venue, 'i'))
      }
      
      // Price range filtering
      if (filters.priceRange) {
        if (filters.priceRange.min > 0) {
          query.greaterThanOrEqualTo('pricing.hourlyRate', filters.priceRange.min)
        }
        if (filters.priceRange.max > 0) {
          query.lessThanOrEqualTo('pricing.hourlyRate', filters.priceRange.max)
        }
      }
      
      // Sort by rating (best first)
      query.descending('rating')
      query.limit(10) // Reasonable limit for performance
      
      const results = await query.find()
      
      const venues: VenueResult[] = results.map(venue => ({
        id: venue.id || '',
        name: venue.get('name') || 'Padel Court',
        pricing: venue.get('pricing') || { hourlyRate: 175000 },
        address: venue.get('address') || { city: 'Jakarta', area: 'Central' },
        facilities: venue.get('facilities') || [],
        rating: venue.get('rating') || 4.0,
        isActive: venue.get('isActive') || true
      }))
      
      console.log(`✅ Found ${venues.length} venues`)
      return venues
      
    } catch (error) {
      console.error('❌ Error querying venues:', error)
      return []
    }
  }
  
  /**
   * Query players with skill and preference matching
   */
  static async queryPlayers(filters: QueryFilters): Promise<PlayerResult[]> {
    try {
      console.log('👥 Querying players with filters:', filters)
      
      const searchCriteria: any = {}
      
      // Skill level matching
      if (filters.skillLevel) {
        searchCriteria.skillLevel = filters.skillLevel
      }
      
      // Location preference matching
      if (filters.location && filters.location !== 'jakarta_area') {
        searchCriteria.preferredAreas = [filters.location]
      }
      
      // Time preference matching
      if (filters.timeSlot) {
        const timeMapping: { [key: string]: string[] } = {
          'morning': ['Morning (6-11 AM)', 'Early Morning'],
          'afternoon': ['Afternoon (12-5 PM)', 'Lunch Time'],
          'evening': ['Evening (6-10 PM)', 'After Work'],
          'night': ['Night (After 10 PM)', 'Late Night']
        }
        
        if (timeMapping[filters.timeSlot]) {
          searchCriteria.playingTimes = timeMapping[filters.timeSlot]
        }
      }
      
      const playerProfiles = await PlayerService.searchPlayers(searchCriteria)
      
      const players: PlayerResult[] = playerProfiles.map(profile => {
        const personalInfo = profile.get('personalInfo') || {}
        const preferences = profile.get('preferences') || {}
        
        return {
          id: profile.id || '',
          name: personalInfo.name || 'Player',
          skillLevel: preferences.skillLevel || 'Intermediate',
          preferredAreas: preferences.preferredAreas || ['Jakarta'],
          playingTimes: preferences.playingTimes || [],
          isActive: profile.get('status') === 'active'
        }
      })
      
      console.log(`✅ Found ${players.length} players`)
      return players
      
    } catch (error) {
      console.error('❌ Error querying players:', error)
      return []
    }
  }
  
  /**
   * Query existing open sessions that players can join
   */
  static async queryOpenSessions(filters: QueryFilters): Promise<SessionResult[]> {
    try {
      console.log('🎯 Querying open sessions with filters:', filters)
      
      // For now, we'll simulate this since we don't have a Session class yet
      // In a real implementation, this would query a Session/Game class
      
      const sessions: SessionResult[] = []
      
      // This would be replaced with actual Parse queries when Session class exists
      // const Session = Parse.Object.extend('Session')
      // const query = new Parse.Query(Session)
      // query.equalTo('status', 'open')
      // query.lessThan('currentPlayers', 4)
      // const results = await query.find()
      
      console.log(`✅ Found ${sessions.length} open sessions`)
      return sessions
      
    } catch (error) {
      console.error('❌ Error querying sessions:', error)
      return []
    }
  }
  
  /**
   * Check venue availability for specific time slots
   */
  static async checkVenueAvailability(
    venueId: string, 
    date: Date, 
    timeSlot: string
  ): Promise<{ available: boolean; conflictingBookings?: any[] }> {
    try {
      console.log('📅 Checking venue availability:', { venueId, date, timeSlot })
      
      const Booking = Parse.Object.extend('Booking')
      const query = new Parse.Query(Booking)
      
      query.equalTo('venueId', venueId)
      query.equalTo('status', 'confirmed')
      
      // Check for the specific date
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      query.greaterThanOrEqualTo('startTime', startOfDay)
      query.lessThanOrEqualTo('startTime', endOfDay)
      
      const existingBookings = await query.find()
      
      // For now, assume available if no bookings found
      // In a real implementation, we'd check specific time conflicts
      const available = existingBookings.length === 0
      
      console.log(`✅ Venue availability check: ${available ? 'Available' : 'Busy'}`)
      
      return {
        available,
        conflictingBookings: available ? undefined : existingBookings
      }
      
    } catch (error) {
      console.error('❌ Error checking venue availability:', error)
      return { available: true } // Assume available on error
    }
  }
  
  /**
   * Get venue recommendations based on user preferences
   */
  static async getVenueRecommendations(filters: QueryFilters): Promise<VenueResult[]> {
    try {
      console.log('🎯 Getting venue recommendations with filters:', filters)
      
      // Get all matching venues
      const venues = await this.queryVenues(filters)
      
      // Apply recommendation scoring
      const scoredVenues = venues.map(venue => {
        let score = venue.rating || 4.0 // Base score from rating
        
        // Boost score for price preferences
        if (filters.priceRange) {
          const price = venue.pricing.hourlyRate
          const midRange = (filters.priceRange.min + filters.priceRange.max) / 2
          const priceDiff = Math.abs(price - midRange)
          const maxDiff = (filters.priceRange.max - filters.priceRange.min) / 2
          const priceScore = Math.max(0, 1 - (priceDiff / maxDiff))
          score += priceScore * 0.5 // Price matching bonus
        }
        
        // Boost score for location match
        if (filters.location && filters.location !== 'jakarta_area') {
          const locationMatch = venue.address.area.toLowerCase()
            .includes(filters.location.toLowerCase())
          if (locationMatch) {
            score += 0.3 // Location bonus
          }
        }
        
        // Boost score for facilities
        const facilityCount = venue.facilities.length
        score += Math.min(facilityCount * 0.1, 0.5) // Facility bonus (max 0.5)
        
        return { ...venue, recommendationScore: score }
      })
      
      // Sort by recommendation score
      scoredVenues.sort((a, b) => b.recommendationScore - a.recommendationScore)
      
      console.log(`✅ Generated ${scoredVenues.length} venue recommendations`)
      return scoredVenues.slice(0, 5) // Return top 5 recommendations
      
    } catch (error) {
      console.error('❌ Error getting venue recommendations:', error)
      return []
    }
  }
  
  /**
   * Get player recommendations for matchmaking
   */
  static async getPlayerRecommendations(filters: QueryFilters): Promise<PlayerResult[]> {
    try {
      console.log('👥 Getting player recommendations with filters:', filters)
      
      const players = await this.queryPlayers(filters)
      
      // Apply matchmaking scoring
      const scoredPlayers = players.map(player => {
        let score = 5.0 // Base score
        
        // Skill level matching bonus
        if (filters.skillLevel && player.skillLevel === filters.skillLevel) {
          score += 2.0 // Perfect skill match
        } else if (filters.skillLevel) {
          // Partial match for adjacent skill levels
          const skillLevels = ['beginner', 'intermediate', 'advanced']
          const userSkillIndex = skillLevels.indexOf(filters.skillLevel)
          const playerSkillIndex = skillLevels.indexOf(player.skillLevel)
          const skillDiff = Math.abs(userSkillIndex - playerSkillIndex)
          
          if (skillDiff === 1) {
            score += 1.0 // Adjacent skill level
          }
        }
        
        // Location preference matching
        if (filters.location && filters.location !== 'jakarta_area') {
          const locationMatch = player.preferredAreas.some(area => 
            area.toLowerCase().includes(filters.location!.toLowerCase())
          )
          if (locationMatch) {
            score += 1.5 // Location preference match
          }
        }
        
        // Time preference matching
        if (filters.timeSlot) {
          const timeMatch = player.playingTimes.some(time => 
            time.toLowerCase().includes(filters.timeSlot!.toLowerCase())
          )
          if (timeMatch) {
            score += 1.0 // Time preference match
          }
        }
        
        return { ...player, matchScore: score }
      })
      
      // Sort by match score
      scoredPlayers.sort((a, b) => b.matchScore - a.matchScore)
      
      console.log(`✅ Generated ${scoredPlayers.length} player recommendations`)
      return scoredPlayers.slice(0, 8) // Return top 8 matches
      
    } catch (error) {
      console.error('❌ Error getting player recommendations:', error)
      return []
    }
  }
  
  /**
   * Comprehensive matchmaking query that combines all data sources
   */
  static async executeComprehensiveQuery(filters: QueryFilters) {
    try {
      console.log('🔍 Executing comprehensive matchmaking query:', filters)
      
      // Execute all queries in parallel for better performance
      const [venues, players, sessions] = await Promise.all([
        this.getVenueRecommendations(filters),
        this.getPlayerRecommendations(filters),
        this.queryOpenSessions(filters)
      ])
      
      const results = {
        venues,
        players,
        sessions,
        totalResults: venues.length + players.length + sessions.length
      }
      
      console.log('✅ Comprehensive query completed:', {
        venues: venues.length,
        players: players.length,
        sessions: sessions.length,
        total: results.totalResults
      })
      
      return results
      
    } catch (error) {
      console.error('❌ Error in comprehensive query:', error)
      return {
        venues: [],
        players: [],
        sessions: [],
        totalResults: 0
      }
    }
  }
}