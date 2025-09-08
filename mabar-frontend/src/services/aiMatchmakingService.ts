import { GoogleGenAI } from '@google/genai'
import { env } from '../config/env'
import { PlayerService } from './playerService'
import { MatchmakingToolboxService } from './matchmakingToolboxService'
import Parse from './back4app'
import { AIFlowLogger } from './aiFlowLogger'

// AI Action Types - Complete toolbox aligned with database
export type AIAction = 
  | 'getAvailableVenues'     // → Venue table
  | 'getAvailablePlayers'    // → PlayerProfile table 
  | 'findOpenSessions'       // → Session table (games needing players)
  | 'findMatch'              // → Venue + PlayerProfile + Session tables
  | 'getVenueDetails'        // → Venue table (by ID)
  | 'checkVenueAvailability' // → Booking table (conflicts check)
  | 'createNewSession'       // → Session table (start new game)
  | 'getPersonalizedRecommendations' // → Multiple tables with user context
  | 'needMoreInfo'           // → No database needed

export interface AIRequest {
  action: AIAction
  parameters: {
    activity?: string
    location?: string
    time?: string
    date?: string
    skillLevel?: string
    playerCount?: number
    priceRange?: { min: number; max: number }
    gender?: string
    age?: number | { min: number; max: number }
    facilities?: string[]
    gameType?: 'casual' | 'competitive' | 'training'
    [key: string]: any
  }
}

export interface UserPreferences {
  age?: number
  gender?: string
  skillLevel?: string
  preferredAreas?: string[]
  playingTimes?: string[]
  budgetRange?: { min: number; max: number }
  language?: string
  gameType?: string
}

export interface AIResponse {
  text: string
  sessionCards?: Array<{
    type: 'existing-session' | 'create-new' | 'no-availability'
    data: any
  }>
  needsMoreInfo?: boolean
}

export class AIMatchmakingService {
  private static ai = new GoogleGenAI({ apiKey: env.GOOGLE_API_KEY })
  private static conversationHistory: any[] = []
  private static isInitialized = false



  // System instruction for the AI Assistant (internal Session Scout logic)
  private static readonly SYSTEM_INSTRUCTION = `You are Matchmaking AI assistant, an intelligent padel matchmaking assistant for MaBar platform in Jakarta.

Your task: Analyze user requests and respond with structured JSON to help them find padel courts, players, or organize games.

Available actions:
- findMatch: Comprehensive search (venues + players + sessions)
- getAvailableVenues: Show available courts/venues
- getAvailablePlayers: Show available players
- findOpenSessions: Find games needing more players
- createNewSession: Start new game and find players
- getVenueDetails: Get specific venue information
- checkVenueAvailability: Check venue availability
- getPersonalizedRecommendations: Profile-based suggestions
- needMoreInfo: Request missing information

Response format (JSON only):
{
  "action": "actionName",
  "parameters": {
    "activity": "padel",
    "location": "extracted_location",
    "time": "extracted_time",
    "date": "extracted_date",
    "skillLevel": "beginner|intermediate|advanced",
    "playerCount": number,
    "priceRange": {"min": number, "max": number},
    "gender": "male|female|mixed"
  }
}

IMPORTANT: Consider conversation context. If this is the FIRST message and unclear, ask for clarification. If there's conversation history or clear intent, proceed with smart defaults.

First message examples (no conversation history):
"Play padel at 8 PM in Senayan" → {"action": "findMatch", "parameters": {"activity": "padel", "location": "Senayan", "time": "8 PM"}}
"Show courts tomorrow" → {"action": "getAvailableVenues", "parameters": {"activity": "padel", "date": "tomorrow"}}
"I want to play padel" → {"action": "getPersonalizedRecommendations", "parameters": {"activity": "padel"}}
"Tonight" → {"action": "needMoreInfo", "parameters": {"message": "What would you like to do tonight? Find courts, players, or organize a game?"}}
"Hi" → {"action": "needMoreInfo", "parameters": {"message": "What would you like to do? Find courts, players, or organize a game?"}}
"asdf" → {"action": "needMoreInfo", "parameters": {"message": "I didn't understand that. What would you like to do?"}}

Follow-up message examples (with conversation history):
Previous: "I want to play padel" → Current: "Tonight" → {"action": "findMatch", "parameters": {"activity": "padel", "time": "tonight"}}
Previous: "Show me options" → Current: "Senayan area" → {"action": "getAvailableVenues", "parameters": {"activity": "padel", "location": "Senayan"}}`



  /**
   * Initialize AI conversation (call once when chat opens)
   */
  static async initializeConversation(): Promise<void> {
    if (this.isInitialized) return
    
    try {
      // Initialize empty conversation history - we'll use the 3-message pattern for each request
      this.conversationHistory = []
      this.isInitialized = true
      
    } catch (error) {
      AIFlowLogger.logError('conversation-init', error)
      throw error
    }
  }

  /**
   * Main AI processing entry point with comprehensive logging
   */
  static async processMatchmakingRequest(userInput: string): Promise<AIResponse> {
    // Start logging session
    const sessionId = AIFlowLogger.startSession(userInput)
    
    try {
      // Step 1: Get user preferences (optional context)
      AIFlowLogger.logStep('step-1-start', 'processing', {
        message: '👤 Step 1: Getting user preferences and context'
      })
      
      AIFlowLogger.startStepTimer()
      const userPreferences = await this.getUserPreferences()
      const step1Duration = AIFlowLogger.endStepTimer()
      
      AIFlowLogger.logUserPreferences(
        userPreferences, 
        userPreferences ? 'profile' : 'none'
      )

      // Step 2: Get AI analysis with system instruction and user context
      AIFlowLogger.logStep('step-2-start', 'processing', {
        message: '🤖 Step 2: AI analyzing user input and generating request'
      })
      
      AIFlowLogger.startStepTimer()
      const aiRequest = await this.getAIAnalysis(userInput, userPreferences)
      const step2Duration = AIFlowLogger.endStepTimer()
      
      AIFlowLogger.logStep('step-2-complete', 'output', {
        aiRequest,
        processingTime: step2Duration,
        message: '✅ AI analysis completed successfully'
      }, {
        duration: step2Duration,
        success: true
      })

      // Step 3: Execute the requested action using our toolbox
      AIFlowLogger.logStep('step-3-start', 'processing', {
        message: '🔧 Step 3: Executing toolbox action based on AI request'
      })
      
      AIFlowLogger.startStepTimer()
      const response = await this.executeToolboxAction(aiRequest)
      const step3Duration = AIFlowLogger.endStepTimer()
      
      AIFlowLogger.logFinalResponse(response, true)
      
      // End logging session
      const completedLog = AIFlowLogger.endSession()
      
      // Add session log to response for debugging (optional)
      if (env.NODE_ENV === 'development') {
        (response as any)._debugLog = completedLog
      }
      
      return response

    } catch (error) {
      AIFlowLogger.logError('main-process', error, { userInput })
      AIFlowLogger.logFinalResponse({
        text: 'Sorry, I encountered an issue processing your request. Please try again with more specific details.',
        sessionCards: [{
          type: 'no-availability',
          data: { message: 'Service temporarily unavailable' }
        }]
      }, false)
      
      // End logging session with error
      const completedLog = AIFlowLogger.endSession()
      
      const errorResponse = {
        text: 'Sorry, I encountered an issue processing your request. Please try again with more specific details.',
        sessionCards: [{
          type: 'no-availability',
          data: { message: 'Service temporarily unavailable' }
        }]
      }
      
      // Add session log to error response for debugging
      if (env.NODE_ENV === 'development') {
        (errorResponse as any)._debugLog = completedLog
      }
      
      return errorResponse
    }
  }

  /**
   * Get user preferences from their profile (optional)
   */
  private static async getUserPreferences(): Promise<UserPreferences | null> {
    try {
      const currentUser = Parse.User.current()
      if (!currentUser) {
        AIFlowLogger.logStep('user-auth-check', 'processing', {
          authenticated: false,
          message: '👤 No authenticated user - no preferences available'
        })
        return null
      }

      AIFlowLogger.logStep('user-auth-check', 'processing', {
        authenticated: true,
        userId: currentUser.id,
        message: '👤 Authenticated user found, fetching profile'
      })

      const playerProfile = await PlayerService.getPlayerProfile()
      if (!playerProfile) {
        AIFlowLogger.logStep('profile-fetch', 'processing', {
          profileFound: false,
          message: '👤 No player profile found - no preferences available'
        })
        return null
      }

      const personalInfo = playerProfile.get('personalInfo') || {}
      const preferences = playerProfile.get('preferences') || {}

      const userPreferences: UserPreferences = {
        age: personalInfo.age,
        gender: personalInfo.gender,
        skillLevel: preferences.skillLevel,
        preferredAreas: preferences.preferredAreas,
        playingTimes: preferences.playingTimes,
        budgetRange: preferences.budgetRange,
        language: preferences.language,
        gameType: preferences.gameType
      }

      AIFlowLogger.logStep('profile-fetch', 'processing', {
        profileFound: true,
        preferencesCount: Object.keys(userPreferences).filter(key => userPreferences[key as keyof UserPreferences] !== undefined).length,
        message: '✅ User preferences loaded successfully'
      })
      
      return userPreferences

    } catch (error) {
      AIFlowLogger.logError('user-preferences', error)
      return null
    }
  }

  /**
   * Get AI analysis using system instruction with user context
   */
  private static async getAIAnalysis(userInput: string, userPreferences?: UserPreferences | null): Promise<AIRequest> {
    try {
      // Build context with user preferences if available
      let contextualInput = userInput
      if (userPreferences) {
        const preferencesContext = `
User Profile Context (use if relevant):
- Age: ${userPreferences.age || 'not specified'}
- Gender: ${userPreferences.gender || 'not specified'}
- Skill Level: ${userPreferences.skillLevel || 'not specified'}
- Preferred Areas: ${userPreferences.preferredAreas?.join(', ') || 'not specified'}
- Playing Times: ${userPreferences.playingTimes?.join(', ') || 'not specified'}
- Budget Range: ${userPreferences.budgetRange ? `Rp ${userPreferences.budgetRange.min}-${userPreferences.budgetRange.max}` : 'not specified'}
- Game Type: ${userPreferences.gameType || 'not specified'}

User Request: ${userInput}`
        contextualInput = preferencesContext
      }

      // Always use the 3-message pattern to maintain AI identity and context
      const conversationContents = [
        { 
          role: 'user', 
          parts: [{ text: 'You are Session Scout, an intelligent padel matchmaking assistant for MaBar platform in Jakarta. Please respond only with JSON.' }] 
        },
        { 
          role: 'model', 
          parts: [{ text: this.SYSTEM_INSTRUCTION }] 
        },
        // Add conversation history if exists
        ...this.conversationHistory,
        // Add current user input
        { 
          role: 'user', 
          parts: [{ text: contextualInput }] 
        }
      ]

      // Log AI interaction with message contents and API URL
      AIFlowLogger.logAICall(conversationContents, 'gemini-2.0-flash-exp')
      
      const result = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: conversationContents
      })
      
      const responseText = result.text || ''
      AIFlowLogger.logAIResponse(responseText)

      // Store this interaction in conversation history for next request
      this.conversationHistory.push(
        { role: 'user', parts: [{ text: contextualInput }] },
        { role: 'model', parts: [{ text: responseText }] }
      )

      // Clean and parse JSON response
      const jsonText = responseText.replace(/```json\n?|\n?```/g, '').trim()
      
      let aiRequest: AIRequest
      let parseSuccess = true
      let parseError: string | undefined
      
      try {
        aiRequest = JSON.parse(jsonText) as AIRequest
        
        // Validate the response structure
        if (!aiRequest.action || !aiRequest.parameters) {
          throw new Error('Invalid AI response structure: missing action or parameters')
        }

        
      } catch (parseErr) {
        parseSuccess = false
        parseError = parseErr instanceof Error ? parseErr.message : String(parseErr)
        
        // Fallback based on conversation context
        aiRequest = this.conversationHistory.length === 0 ? {
          action: 'needMoreInfo',
          parameters: {
            message: 'What would you like to do? Find courts, players, or organize a game?'
          }
        } : {
          action: 'getPersonalizedRecommendations',
          parameters: {
            activity: 'padel'
          }
        }

      }

      return aiRequest

    } catch (error) {
      AIFlowLogger.logError('ai-analysis', error, { userInput, userPreferences })
      
      // Fallback based on conversation context
      const fallbackRequest = this.conversationHistory.length === 0 ? {
        action: 'needMoreInfo' as const,
        parameters: {
          message: 'What would you like to do? Find courts, players, or organize a game?'
        }
      } : {
        action: 'getPersonalizedRecommendations' as const,
        parameters: {
          activity: 'padel'
        }
      }

      
      return fallbackRequest
    }
  }

  /**
   * Execute the toolbox action based on AI request
   */
  private static async executeToolboxAction(aiRequest: AIRequest): Promise<AIResponse> {
    const { action, parameters } = aiRequest
    
    AIFlowLogger.logStep('toolbox-action-start', 'processing', {
      action,
      parameters,
      message: `🔧 Starting toolbox action: ${action}`
    })
    
    const startTime = performance.now()

    try {
      let response: AIResponse
      
      switch (action) {
        case 'getAvailableVenues':
          response = await MatchmakingToolboxService.getAvailableVenues(parameters)
          break
        
        case 'getAvailablePlayers':
          response = await MatchmakingToolboxService.getAvailablePlayers(parameters)
          break
        
        case 'findOpenSessions':
          response = await MatchmakingToolboxService.findOpenSessions(parameters)
          break
        
        case 'createNewSession':
          response = await MatchmakingToolboxService.createNewSession(parameters)
          break
        
        case 'getVenueDetails':
          response = await MatchmakingToolboxService.getVenueDetails(parameters)
          break
        
        case 'checkVenueAvailability':
          response = await MatchmakingToolboxService.checkVenueAvailability(parameters)
          break
        
        case 'getPersonalizedRecommendations':
          response = await MatchmakingToolboxService.getPersonalizedRecommendations(parameters)
          break
        
        case 'findMatch':
          response = await MatchmakingToolboxService.findMatch(parameters)
          break
        
        case 'needMoreInfo':
          response = MatchmakingToolboxService.needMoreInfo(parameters)
          break
        
        default:
          response = {
            text: 'I\'m not sure how to help with that. Could you try asking differently?',
            sessionCards: [{
              type: 'no-availability',
              data: { message: 'Unknown request type' }
            }]
          }
      }
      
      AIFlowLogger.logToolboxExecution(action, parameters, startTime)
      
      AIFlowLogger.logStep('toolbox-action-complete', 'output', {
        action,
        response,
        success: true,
        message: `✅ Toolbox action completed: ${action}`
      })
      
      return response
      
    } catch (error) {
      AIFlowLogger.logError('toolbox-execution', error, { action, parameters })
      
      return {
        text: `Sorry, I encountered an issue while ${action}. Please try again.`,
        sessionCards: [{
          type: 'no-availability',
          data: { message: 'Toolbox execution error' }
        }]
      }
    }
  }

  // =============================================================================
  // TOOLBOX FUNCTIONS - These are the functions AI can call
  // =============================================================================

  /**
   * Toolbox: Get available venues/courts
   */
  private static async toolbox_getAvailableVenues(params: any): Promise<AIResponse> {
    try {
      console.log('🏟️ Toolbox: Getting available venues with params:', params)

      const filters = {
        location: params.location,
        priceRange: params.priceRange,
        timeSlot: params.time,
        date: params.date
      }

      const venues = await this.queryVenues(filters)
      
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
      console.error('❌ Error in toolbox_getAvailableVenues:', error)
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
  private static async toolbox_getAvailablePlayers(params: any): Promise<AIResponse> {
    try {
      console.log('👥 Toolbox: Getting available players with params:', params)

      const filters = {
        skillLevel: params.skillLevel,
        location: params.location,
        timeSlot: params.time
      }

      const players = await this.queryPlayers(filters)
      
      if (players.length === 0) {
        return {
          text: 'No players found matching your criteria. Try expanding your skill level or location preferences.',
          sessionCards: [{
            type: 'no-availability',
            data: { message: 'No players available' }
          }]
        }
      }

      // Create session cards showing available players
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
      console.error('❌ Error in toolbox_getAvailablePlayers:', error)
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
   * Toolbox: Get last booking history
   */
  private static async toolbox_getLastBookingHistory(params: any): Promise<AIResponse> {
    try {
      console.log('📚 Toolbox: Getting last booking history with params:', params)

      // This would get user's booking history from BookingService
      // For now, return a placeholder response
      
      return {
        text: 'Here are your recent bookings:',
        sessionCards: [{
          type: 'existing-session',
          data: {
            venue: 'Last Session Info',
            message: 'Booking history feature coming soon!'
          }
        }]
      }

    } catch (error) {
      console.error('❌ Error in toolbox_getLastBookingHistory:', error)
      return {
        text: 'Sorry, I couldn\'t fetch your booking history right now.',
        sessionCards: [{
          type: 'no-availability',
          data: { message: 'Service error' }
        }]
      }
    }
  }

  /**
   * Toolbox: Rebook last session
   */
  private static async toolbox_rebookLastSession(params: any): Promise<AIResponse> {
    try {
      console.log('🔄 Toolbox: Rebooking last session with params:', params)

      // This would get user's last booking and recreate it
      // For now, return a placeholder response
      
      return {
        text: 'I\'ll help you rebook your last session:',
        sessionCards: [{
          type: 'create-new',
          data: {
            venue: 'Previous Venue',
            message: 'Rebook feature coming soon!'
          }
        }]
      }

    } catch (error) {
      console.error('❌ Error in toolbox_rebookLastSession:', error)
      return {
        text: 'Sorry, I couldn\'t rebook your last session right now.',
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
  private static async toolbox_findMatch(params: any): Promise<AIResponse> {
    try {
      console.log('🎯 Toolbox: Finding match with params:', params)

      const filters = {
        skillLevel: params.skillLevel,
        location: params.location,
        timeSlot: params.time,
        date: params.date,
        priceRange: params.priceRange,
        playerCount: params.playerCount
      }

      // Execute comprehensive search
      const results = await this.executeComprehensiveQuery(filters)
      
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

      // Create session cards from results
      const sessionCards = []

      // Add venue options
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

      // Add player matches if available
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
      console.error('❌ Error in toolbox_findMatch:', error)
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
   * Toolbox: Find open sessions to join
   */
  private static async toolbox_findOpenSessions(params: any): Promise<AIResponse> {
    try {
      console.log('🎯 Toolbox: Finding open sessions with params:', params)

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
      console.error('❌ Error in toolbox_findOpenSessions:', error)
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
  private static async toolbox_createNewSession(params: any): Promise<AIResponse> {
    try {
      console.log('🎮 Toolbox: Creating new session with params:', params)

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

      // Find suitable venue first
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
      console.error('❌ Error in toolbox_createNewSession:', error)
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
   * Toolbox: Get specific venue details
   */
  private static async toolbox_getVenueDetails(params: any): Promise<AIResponse> {
    try {
      console.log('🏢 Toolbox: Getting venue details with params:', params)

      // This would query specific venue by ID or name
      // For now, return placeholder
      return {
        text: 'Here are the venue details:',
        sessionCards: [{
          type: 'create-new',
          data: {
            venue: params.venueName || 'Venue Details',
            message: 'Venue details feature coming soon!'
          }
        }]
      }

    } catch (error) {
      console.error('❌ Error in toolbox_getVenueDetails:', error)
      return {
        text: 'Sorry, I couldn\'t get venue details right now.',
        sessionCards: [{
          type: 'no-availability',
          data: { message: 'Service error' }
        }]
      }
    }
  }

  /**
   * Toolbox: Check venue availability
   */
  private static async toolbox_checkVenueAvailability(params: any): Promise<AIResponse> {
    try {
      console.log('📅 Toolbox: Checking venue availability with params:', params)

      // This would check real-time availability
      // For now, return placeholder
      return {
        text: 'Checking venue availability...',
        sessionCards: [{
          type: 'create-new',
          data: {
            venue: params.venueName || 'Venue Availability',
            message: 'Availability check feature coming soon!'
          }
        }]
      }

    } catch (error) {
      console.error('❌ Error in toolbox_checkVenueAvailability:', error)
      return {
        text: 'Sorry, I couldn\'t check availability right now.',
        sessionCards: [{
          type: 'no-availability',
          data: { message: 'Service error' }
        }]
      }
    }
  }

  /**
   * Toolbox: Get personalized recommendations
   */
  private static async toolbox_getPersonalizedRecommendations(params: any): Promise<AIResponse> {
    try {
      console.log('🎯 Toolbox: Getting personalized recommendations with params:', params)

      // This would use user profile data for personalized suggestions
      // For now, return placeholder
      return {
        text: 'Here are personalized recommendations based on your profile:',
        sessionCards: [{
          type: 'create-new',
          data: {
            venue: 'Personalized Suggestions',
            message: 'Personalized recommendations feature coming soon!'
          }
        }]
      }

    } catch (error) {
      console.error('❌ Error in toolbox_getPersonalizedRecommendations:', error)
      return {
        text: 'Sorry, I couldn\'t get personalized recommendations right now.',
        sessionCards: [{
          type: 'no-availability',
          data: { message: 'Service error' }
        }]
      }
    }
  }

  /**
   * Toolbox: Need more information
   */
  private static toolbox_needMoreInfo(params: any): AIResponse {
    const message = params.message || `Hi! I'd be happy to help you with padel. To give you the best recommendations, could you tell me:

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
  // DIRECT DATABASE QUERY METHODS
  // =============================================================================

  private static async queryVenues(filters: any) {
    try {
      const Venue = Parse.Object.extend('Venue')
      const query = new Parse.Query(Venue)
      query.equalTo('isActive', true)
      
      if (filters.location) {
        query.matches('address.area', new RegExp(filters.location, 'i'))
      }
      
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
      if (filters.skillLevel) searchCriteria.skillLevel = filters.skillLevel
      if (filters.location) searchCriteria.preferredAreas = [filters.location]
      
      const playerProfiles = await PlayerService.searchPlayers(searchCriteria)
      return playerProfiles.map(profile => {
        const personalInfo = profile.get('personalInfo') || {}
        const preferences = profile.get('preferences') || {}
        return {
          id: profile.id,
          name: personalInfo.name || 'Player',
          skillLevel: preferences.skillLevel || 'Intermediate'
        }
      })
    } catch (error) {
      console.error('❌ Error querying players:', error)
      return []
    }
  }

  private static async executeComprehensiveQuery(filters: any) {
    try {
      const [venues, players] = await Promise.all([
        this.queryVenues(filters),
        this.queryPlayers(filters)
      ])
      
      return {
        venues,
        players,
        totalResults: venues.length + players.length
      }
    } catch (error) {
      console.error('❌ Error in comprehensive query:', error)
      return { venues: [], players: [], totalResults: 0 }
    }
  }
}