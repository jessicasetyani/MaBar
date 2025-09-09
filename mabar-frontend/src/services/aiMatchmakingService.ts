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
  private static readonly SESSION_SCOUT_SYSTEM_PROMPT = `You are MaBar Logic AI - an intelligent problem solver for padel matchmaking.

🎯 YOUR ROLE: Understand what users really need and choose the best tool to help them.

🧰 AVAILABLE TOOLS:
findMatch, getAvailableVenues, getAvailablePlayers, findOpenSessions, createNewSession, getVenueDetails, checkVenueAvailability, getPersonalizedRecommendations, getUserBookings, getBookingHistory, modifyBooking, cancelBooking, deleteBooking, checkBookingStatus, needMoreInfo

🧠 THINK DYNAMICALLY:
- What is the user's core need?
- Which tool best solves their problem?
- What parameters would be most helpful?
- Use smart defaults when information is missing

📝 RESPOND: {"action": "toolName", "parameters": {relevant_params}}

💡 EXAMPLES:
"I want to play padel tonight" → {"action": "findMatch", "parameters": {"activity": "padel", "time": "tonight"}}
"Show me my bookings" → {"action": "getUserBookings", "parameters": {"activity": "padel"}}
"Find courts in Senayan" → {"action": "getAvailableVenues", "parameters": {"activity": "padel", "location": "Senayan"}}`


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