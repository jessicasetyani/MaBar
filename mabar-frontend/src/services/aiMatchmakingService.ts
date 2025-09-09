import { GoogleGenAI } from '@google/genai'
import { env } from '../config/env'
import { PlayerService } from './playerService'
import { MatchmakingToolboxService } from './matchmakingToolboxService'
import { AIPresenterService } from './aiPresenterService'
import type { PresenterRequest } from './aiPresenterService'
import Parse from './back4app'
import { AIFlowLogger } from './aiFlowLogger'

// AI Action Types - Complete toolbox aligned with database
export type AIAction = 
  | 'findMatch'              // → Complete search (venues + players + sessions)
  | 'getAvailableVenues'     // → Show courts/venues
  | 'getAvailablePlayers'    // → Show available players
  | 'findOpenSessions'       // → Games needing players
  | 'createNewSession'       // → Start new game
  | 'getVenueDetails'        // → Specific venue info
  | 'checkVenueAvailability' // → Real-time availability
  | 'getPersonalizedRecommendations' // → AI suggestions
  | 'getUserBookings'        // → User's bookings
  | 'getBookingHistory'      // → Past games
  | 'modifyBooking'          // → Change bookings
  | 'cancelBooking'          // → Cancel/unbook bookings (user)
  | 'deleteBooking'          // → Delete bookings (admin)
  | 'checkBookingStatus'     // → Booking confirmation
  | 'needMoreInfo'           // → Only for unclear requests

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

  // System instruction for the Logic AI (appears as MaBar AI Assistant)
  private static readonly SESSION_SCOUT_SYSTEM_PROMPT = `You are MaBar Logic AI - the intelligent problem-solving brain behind MaBar padel platform in Jakarta.

🎯 YOUR MISSION: Be a responsible AI that truly understands user problems and finds the best solutions through smart multi-level thinking.

🧠 PROBLEM-SOLVING APPROACH:
1. **Understand the REAL user need** (not just keywords)
2. **Think through multiple solution paths**
3. **Choose the most helpful action**
4. **Plan for fallbacks if primary solution fails**
5. **Consider user context and preferences**

📋 AVAILABLE TOOLBOX ACTIONS:
- **findMatch**: Comprehensive search (venues + players + sessions) - USE when user wants complete solution
- **getAvailableVenues**: Show courts/venues - USE for venue browsing or location-specific requests
- **getAvailablePlayers**: Show players - USE when user needs playing partners
- **findOpenSessions**: Find games needing players - USE when user wants to join existing games
- **createNewSession**: Start new game - USE when user wants to organize/host
- **getVenueDetails**: Specific venue info - USE for detailed venue questions
- **checkVenueAvailability**: Real-time availability - USE for booking confirmation
- **getPersonalizedRecommendations**: AI suggestions - USE for "recommend me" or profile-based requests
- **getUserBookings**: User's bookings - USE for "my bookings" or booking management
- **getBookingHistory**: Past games - USE for "my history" or statistics requests
- **modifyBooking**: Change bookings - USE for booking modifications
- **needMoreInfo**: Clarification needed - USE ONLY for unclear/ambiguous requests

🎯 SMART DECISION LOGIC:

**BOOKING MANAGEMENT REQUESTS:**
- "my bookings" / "upcoming games" → getUserBookings
- "booking history" / "past games" → getBookingHistory  
- "change my booking" / "modify reservation" → modifyBooking
- "is my booking confirmed" → checkBookingStatus

**RECOMMENDATION REQUESTS:**
- "recommend me" / "suggest" / "what should I play" → getPersonalizedRecommendations
- "I'm free [time]" / "any suggestions" → getPersonalizedRecommendations
- "help me find" (without specific criteria) → getPersonalizedRecommendations

**VENUE/COURT REQUESTS:**
- "show courts" / "available venues" → getAvailableVenues
- "courts in [area]" / "venues near [location]" → getAvailableVenues
- "cheap courts" / "premium venues" → getAvailableVenues (with price filter)

**PLAYER/PARTNER REQUESTS:**
- "find players" / "looking for partners" → getAvailablePlayers
- "who's available" / "players tonight" → getAvailablePlayers

**GAME/SESSION REQUESTS:**
- "join a game" / "existing sessions" → findOpenSessions
- "organize a game" / "create session" → createNewSession
- "play [time] at [venue]" → findMatch (comprehensive search)

**COMPLEX REQUESTS (use findMatch):**
- Multiple criteria: "play padel tonight in Senayan with intermediate players"
- Complete solutions: "I want to play padel tomorrow evening"
- When user needs venues + players + sessions

🔍 PARAMETER EXTRACTION INTELLIGENCE:

**Location Intelligence:**
- "Senayan" / "SCBD" / "Sudirman" → "Senayan"
- "Kemang" / "South Jakarta" → "Kemang"
- "PIK" / "Pantai Indah Kapuk" → "PIK"
- "Gading" / "Kelapa Gading" / "North Jakarta" → "Kelapa Gading"
- "BSD" / "Tangerang" → "BSD"
- "Jakarta" / "anywhere" / unspecified → "Jakarta"

**Time Intelligence:**
- "now" / "right now" → current time + "urgent: true"
- "tonight" → today + "evening"
- "tomorrow morning" → tomorrow + "morning"
- "weekend" → "Saturday" or "Sunday"
- "next week" → add 7 days

**Skill Level Intelligence:**
- "beginner" / "new" / "learning" → "beginner"
- "intermediate" / "decent" / "okay" → "intermediate"
- "advanced" / "good" / "experienced" → "advanced"
- "pro" / "professional" / "expert" → "professional"

**Price Intelligence:**
- "cheap" / "budget" → {"min": 100000, "max": 160000}
- "affordable" / "reasonable" → {"min": 150000, "max": 200000}
- "premium" / "luxury" → {"min": 200000, "max": 300000}

**Group Size Intelligence:**
- "doubles" / "4 people" → playerCount: 4
- "singles" / "1v1" → playerCount: 2
- "8 people" → playerCount: 8, multiCourt: true

🚨 CRITICAL RESPONSIBILITY RULES:

1. **NEVER use needMoreInfo** if user mentions: courts, venues, booking, playing, padel, game, session, players
2. **ALWAYS provide a solution** - think of alternatives if primary request seems impossible
3. **USE SMART DEFAULTS** - don't ask for obvious information:
   - location: "Jakarta" (if not specified)
   - activity: "padel" (always)
   - time: "flexible" (if not specified)
   - skillLevel: use user profile or "any"
4. **CONTEXT AWARENESS** - use conversation history and user profile
5. **FALLBACK PLANNING** - if specific request might fail, choose action that provides alternatives

📝 RESPONSE FORMAT (JSON only):
{
  "action": "actionName",
  "parameters": {
    "activity": "padel",
    "location": "extracted_location",
    "time": "extracted_time", 
    "date": "extracted_date",
    "skillLevel": "beginner|intermediate|advanced|professional|any",
    "playerCount": number,
    "priceRange": {"min": number, "max": number},
    "gender": "male|female|mixed|any",
    "urgent": boolean,
    "multiCourt": boolean,
    "facilities": ["equipment", "showers", "parking"],
    "gameType": "casual|competitive|training|social"
  }
}

💡 SMART EXAMPLES:

**RESPONSIBLE PROBLEM SOLVING:**
"Play padel tonight" → {"action": "findMatch", "parameters": {"activity": "padel", "time": "tonight", "location": "Jakarta"}} 
// Logic: User wants complete solution, use comprehensive search

"My bookings" → {"action": "getUserBookings", "parameters": {"activity": "padel"}}
// Logic: Clear booking management request

"Recommend me a game" → {"action": "getPersonalizedRecommendations", "parameters": {"activity": "padel"}}
// Logic: User wants AI suggestions based on profile

"Courts in Senayan" → {"action": "getAvailableVenues", "parameters": {"activity": "padel", "location": "Senayan"}}
// Logic: Specific venue browsing request

"Find players tonight" → {"action": "getAvailablePlayers", "parameters": {"activity": "padel", "time": "tonight"}}
// Logic: User needs playing partners

"Join a game" → {"action": "findOpenSessions", "parameters": {"activity": "padel", "location": "Jakarta"}}
// Logic: User wants to join existing sessions

**EDGE CASE HANDLING:**
"Play padel at 3 AM" → {"action": "getAvailableVenues", "parameters": {"activity": "padel", "time": "3 AM", "location": "Jakarta", "showAlternatives": true}}
// Logic: Unusual time, but still try to help with alternatives

"Expensive courts" → {"action": "getAvailableVenues", "parameters": {"activity": "padel", "priceRange": {"min": 200000, "max": 300000}, "location": "Jakarta"}}
// Logic: User wants premium venues

"Need 8 people" → {"action": "createNewSession", "parameters": {"activity": "padel", "playerCount": 8, "multiCourt": true, "location": "Jakarta"}}
// Logic: Large group needs special handling

🎯 REMEMBER: Your job is to be the intelligent problem-solver that understands what users REALLY need and finds the best path to help them, not just match keywords to actions.`


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
    AIFlowLogger.startSession(userInput)
    
    try {
      // Ensure conversation is initialized
      await this.initializeConversation()

      // Get user preferences and process AI request
      const userPreferences = await this.getUserPreferences()
      const aiRequest = await this.getAIAnalysis(userInput, userPreferences)
      const toolboxResponse = await this.executeToolboxAction(aiRequest)
      console.log('🔧 [TOOLBOX] Raw Response:', toolboxResponse)
      
      // Use Presenter Assistant to format the final response
      const response = await this.presentResults(userInput, aiRequest.action, toolboxResponse, aiRequest.parameters)
      console.log('🎨 [PRESENTER] Final UI Response:', response)
      
      // End logging session
      AIFlowLogger.endSession()
      
      // Add session log to response for debugging (optional)
      // if (env.NODE_ENV === 'development') {
      //   (response as any)._debugLog = completedLog
      // }
      
      return response

    } catch (error) {
      AIFlowLogger.logError('main-process', error, { userInput })
      
      // End logging session with error
      AIFlowLogger.endSession()
      
      const errorResponse: AIResponse = {
        text: 'Sorry, I encountered an issue processing your request. Please try again with more specific details.',
        sessionCards: [{
          type: 'no-availability' as const,
          data: { message: 'Service temporarily unavailable' }
        }]
      }
      
      // Add session log to error response for debugging
      // if (env.NODE_ENV === 'development') {
      //   (errorResponse as any)._debugLog = completedLog
      // }
      
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
        return null
      }

      const playerProfile = await PlayerService.getPlayerProfile()
      if (!playerProfile) {
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
          parts: [{ text: 'You are MaBar AI Assistant, helping users find padel courts and players in Jakarta. Please respond only with JSON.' }] 
        },
        { 
          role: 'model', 
          parts: [{ text: this.SESSION_SCOUT_SYSTEM_PROMPT }] 
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
        model: 'gemini-2.5-flash-lite',
        contents: conversationContents
      })
      
      const responseText = result.text || ''
      console.log('🧠 [LOGIC AI] Raw API Response:', responseText)
      AIFlowLogger.logAIResponse(responseText)

      // Store this interaction in conversation history for next request
      this.conversationHistory.push(
        { role: 'user', parts: [{ text: contextualInput }] },
        { role: 'model', parts: [{ text: responseText }] }
      )

      // Clean and parse JSON response
      const jsonText = responseText.replace(/```json\n?|\n?```/g, '').trim()
      console.log('🧠 [LOGIC AI] Cleaned JSON:', jsonText)
      
      let aiRequest: AIRequest
      
      try {
        aiRequest = JSON.parse(jsonText) as AIRequest
        console.log('🧠 [LOGIC AI] Parsed Request:', aiRequest)
        
        // Validate the response structure
        if (!aiRequest.action || !aiRequest.parameters) {
          throw new Error('Invalid AI response structure: missing action or parameters')
        }
        
      } catch (parseErr) {
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
   * Present results using the AI Presenter Assistant
   */
  private static async presentResults(
    userOriginalRequest: string, 
    toolboxAction: string, 
    toolboxResponse: AIResponse,
    searchCriteria: any
  ): Promise<AIResponse> {
    try {
      // If toolbox already has a well-formatted response, use Presenter to enhance it
      const userPreferences = await this.getUserPreferences()
      const presenterRequest: PresenterRequest = {
        userOriginalRequest,
        toolboxAction,
        rawData: {
          ...toolboxResponse,
          userSkillLevel: userPreferences?.skillLevel
        },
        searchCriteria: {
          ...searchCriteria,
          skillLevel: userPreferences?.skillLevel || searchCriteria?.skillLevel
        }
      }
      console.log('🎨 [PRESENTER] Input Request:', presenterRequest)

      const presentedResponse = await AIPresenterService.presentResults(presenterRequest)
      console.log('🎨 [PRESENTER] Output Response:', presentedResponse)
      
      // Return the enhanced response from Presenter Assistant
      return {
        text: presentedResponse.text,
        sessionCards: presentedResponse.sessionCards,
        needsMoreInfo: presentedResponse.needsMoreInfo
      }

    } catch (error) {
      AIFlowLogger.logError('presenter-service', error, { userOriginalRequest, toolboxAction })
      
      // Fallback to original toolbox response if presenter fails
      return toolboxResponse
    }
  }

  /**
   * Execute the toolbox action based on AI request
   */
  private static async executeToolboxAction(aiRequest: AIRequest): Promise<AIResponse> {
    const { action, parameters } = aiRequest

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
        
        case 'getUserBookings':
          response = await MatchmakingToolboxService.getUserBookings(parameters)
          break
        
        case 'getBookingHistory':
          response = await MatchmakingToolboxService.getBookingHistory(parameters)
          break
        
        case 'getPersonalizedRecommendations':
          response = await MatchmakingToolboxService.getPersonalizedRecommendations(parameters)
          break
        
        case 'modifyBooking':
          response = await MatchmakingToolboxService.modifyBooking(parameters)
          break
        
        case 'checkBookingStatus':
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
}