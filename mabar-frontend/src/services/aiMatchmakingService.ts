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

  // System instruction for the AI Assistant (MaBar AI logic)
  private static readonly SYSTEM_INSTRUCTION = `You are MaBar AI, an intelligent padel matchmaking assistant for MaBar platform in Jakarta.

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

CRITICAL RULES:
1. NEVER use needMoreInfo if the user mentions courts, venues, booking, or playing
2. ALWAYS use getAvailableVenues for court/venue requests
3. ALWAYS use getAvailablePlayers for player requests
4. ALWAYS apply smart defaults: location="Jakarta", activity="padel"
5. Only use needMoreInfo for greetings (hi, hello) or gibberish (asdf, xyz)

First message examples (no conversation history):
"Play padel at 8 PM in Senayan" → {"action": "findMatch", "parameters": {"activity": "padel", "location": "Senayan", "time": "8 PM"}}
"Show courts tomorrow" → {"action": "getAvailableVenues", "parameters": {"activity": "padel", "date": "tomorrow"}}
"Book court tomorrow evening" → {"action": "getAvailableVenues", "parameters": {"activity": "padel", "date": "tomorrow", "time": "evening", "location": "Jakarta"}}
"Find courts for weekend" → {"action": "getAvailableVenues", "parameters": {"activity": "padel", "date": "weekend", "location": "Jakarta"}}
"Show me venues" → {"action": "getAvailableVenues", "parameters": {"activity": "padel", "location": "Jakarta"}}
"Find players for weekend" → {"action": "getAvailablePlayers", "parameters": {"activity": "padel", "date": "weekend"}}
"I want to play padel" → {"action": "getPersonalizedRecommendations", "parameters": {"activity": "padel"}}
"Tonight" → {"action": "needMoreInfo", "parameters": {"message": "What would you like to do tonight? Find courts, players, or organize a game?"}}
"Hi" → {"action": "needMoreInfo", "parameters": {"message": "What would you like to do? Find courts, players, or organize a game?"}}

Smart defaults to use:
- location: "Jakarta" (if not specified)
- activity: "padel" (always)
- time: "flexible" (if not specified)

Follow-up message examples (with conversation history):
Previous: "I want to play padel" → Current: "Tonight" → {"action": "findMatch", "parameters": {"activity": "padel", "time": "tonight", "location": "Jakarta"}}
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
      // Ensure conversation is initialized
      await this.initializeConversation()

      // Get user preferences and process AI request
      const userPreferences = await this.getUserPreferences()
      const aiRequest = await this.getAIAnalysis(userInput, userPreferences)
      const response = await this.executeToolboxAction(aiRequest)
      
      // End logging session
      const completedLog = AIFlowLogger.endSession()
      
      // Add session log to response for debugging (optional)
      // if (env.NODE_ENV === 'development') {
      //   (response as any)._debugLog = completedLog
      // }
      
      return response

    } catch (error) {
      AIFlowLogger.logError('main-process', error, { userInput })
      
      // End logging session with error
      const completedLog = AIFlowLogger.endSession()
      
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
          parts: [{ text: 'You are MaBar AI, an intelligent padel matchmaking assistant for MaBar platform in Jakarta. Please respond only with JSON.' }] 
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
      
      try {
        aiRequest = JSON.parse(jsonText) as AIRequest
        
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