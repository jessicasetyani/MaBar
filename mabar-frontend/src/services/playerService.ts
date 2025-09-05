import Parse from './back4app'

export interface PlayerData {
  personalInfo: {
    name: string
    phone: string
    dateOfBirth: string
  }
  preferences: {
    skillLevel: string
    playingTimes: string[]
    preferredAreas: string[]
  }
}

export class PlayerService {
  /**
   * Save player profile data to Back4App
   */
  static async savePlayerProfile(playerData: PlayerData): Promise<void> {
    try {
      const currentUser = Parse.User.current()
      
      if (!currentUser) {
        throw new Error('No authenticated user found')
      }

      // Create or update PlayerProfile object
      const PlayerProfile = Parse.Object.extend('PlayerProfile')
      
      // Check if profile already exists
      const query = new Parse.Query(PlayerProfile)
      query.equalTo('user', currentUser)
      
      let playerProfile = await query.first()
      
      if (!playerProfile) {
        // Create new profile
        playerProfile = new PlayerProfile()
        playerProfile.set('user', currentUser)
      }

      // Set profile data
      playerProfile.set('personalInfo', playerData.personalInfo)
      playerProfile.set('preferences', playerData.preferences)
      playerProfile.set('status', 'active')
      playerProfile.set('createdAt', new Date())

      // Save to Back4App
      await playerProfile.save()

      console.log('✅ Player profile saved successfully')
    } catch (error) {
      console.error('❌ Error saving player profile:', error)
      throw error
    }
  }

  /**
   * Get player profile for the current user
   */
  static async getPlayerProfile(): Promise<Parse.Object | null> {
    try {
      const currentUser = Parse.User.current()
      
      if (!currentUser) {
        throw new Error('No authenticated user found')
      }

      const PlayerProfile = Parse.Object.extend('PlayerProfile')
      const query = new Parse.Query(PlayerProfile)
      query.equalTo('user', currentUser)
      
      const playerProfile = await query.first()
      
      if (playerProfile) {
        console.log('✅ Player profile found:', playerProfile.id)
        return playerProfile
      } else {
        console.log('ℹ️ No player profile found for user')
        return null
      }
    } catch (error) {
      console.error('❌ Error fetching player profile:', error)
      throw error
    }
  }

  /**
   * Update player profile
   */
  static async updatePlayerProfile(updates: Partial<PlayerData>): Promise<void> {
    try {
      const currentUser = Parse.User.current()
      
      if (!currentUser) {
        throw new Error('No authenticated user found')
      }

      const PlayerProfile = Parse.Object.extend('PlayerProfile')
      const query = new Parse.Query(PlayerProfile)
      query.equalTo('user', currentUser)
      
      const playerProfile = await query.first()
      
      if (!playerProfile) {
        throw new Error('Player profile not found')
      }

      // Update fields
      if (updates.personalInfo) {
        playerProfile.set('personalInfo', updates.personalInfo)
      }
      
      if (updates.preferences) {
        playerProfile.set('preferences', updates.preferences)
      }

      playerProfile.set('updatedAt', new Date())

      // Save to Back4App
      await playerProfile.save()

      console.log('✅ Player profile updated successfully')
    } catch (error) {
      console.error('❌ Error updating player profile:', error)
      throw error
    }
  }

  /**
   * Check if player has completed their profile
   */
  static async hasCompletedProfile(): Promise<boolean> {
    try {
      const profile = await this.getPlayerProfile()
      
      if (!profile) {
        return false
      }

      const personalInfo = profile.get('personalInfo')
      const preferences = profile.get('preferences')

      // Check if required fields are filled
      const hasPersonalInfo = personalInfo && 
        personalInfo.name && 
        personalInfo.phone && 
        personalInfo.dateOfBirth

      const hasPreferences = preferences && 
        preferences.skillLevel

      return !!(hasPersonalInfo && hasPreferences)
    } catch (error) {
      console.error('❌ Error checking profile completion:', error)
      return false
    }
  }

  /**
   * Get players by skill level for matchmaking
   */
  static async getPlayersBySkillLevel(skillLevel: string): Promise<Parse.Object[]> {
    try {
      const PlayerProfile = Parse.Object.extend('PlayerProfile')
      const query = new Parse.Query(PlayerProfile)
      query.equalTo('preferences.skillLevel', skillLevel)
      query.equalTo('status', 'active')
      query.include('user')
      query.limit(50) // Limit results for performance
      
      const players = await query.find()
      
      console.log(`✅ Found ${players.length} players with skill level: ${skillLevel}`)
      return players
    } catch (error) {
      console.error('❌ Error fetching players by skill level:', error)
      throw error
    }
  }

  /**
   * Search players by preferences (areas, times, skill level)
   */
  static async searchPlayers(searchCriteria: {
    skillLevel?: string
    preferredAreas?: string[]
    playingTimes?: string[]
  }): Promise<Parse.Object[]> {
    try {
      const PlayerProfile = Parse.Object.extend('PlayerProfile')
      const query = new Parse.Query(PlayerProfile)
      
      // Filter by skill level
      if (searchCriteria.skillLevel) {
        query.equalTo('preferences.skillLevel', searchCriteria.skillLevel)
      }
      
      // Filter by preferred areas (if any match)
      if (searchCriteria.preferredAreas && searchCriteria.preferredAreas.length > 0) {
        query.containedIn('preferences.preferredAreas', searchCriteria.preferredAreas)
      }
      
      // Filter by playing times (if any match)
      if (searchCriteria.playingTimes && searchCriteria.playingTimes.length > 0) {
        query.containedIn('preferences.playingTimes', searchCriteria.playingTimes)
      }
      
      query.equalTo('status', 'active')
      query.include('user')
      query.limit(100) // Limit results for performance
      
      const players = await query.find()
      
      console.log(`✅ Found ${players.length} players matching search criteria`)
      return players
    } catch (error) {
      console.error('❌ Error searching players:', error)
      throw error
    }
  }
}
