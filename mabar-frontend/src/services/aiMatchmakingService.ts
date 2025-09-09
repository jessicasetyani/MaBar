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
  | 'joinSession'            // → Join existing session
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
    type: 'existing-session' | 'create-new' | 'no-availability' | 'user-booking' | 'join-confirmation'
    data: any
  }>
  needsMoreInfo?: boolean
  // Add context for coordinator
  _aiAction?: string
  _searchCriteria?: any
}

// Enhanced conversation context management
export interface UserRequirements {
  activity?: string
  time?: string
  location?: string
  playerCount?: number
  skillLevel?: string
  venueType?: string
  priceRange?: string
  date?: string
  duration?: string
}

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  extractedInfo?: Partial<UserRequirements>
}

export interface ConversationContext {
  userRequirements: UserRequirements
  messages: ConversationMessage[]
  lastAction?: string
  isComplete: boolean
}

export class AIMatchmakingService {
  private static ai = new GoogleGenAI({ apiKey: env.GOOGLE_API_KEY })
  private static conversationContext: ConversationContext = {
    userRequirements: {},
    messages: [],
    lastAction: undefined,
    isComplete: false
  }
  private static isInitialized = false

  // System instruction for the Logic AI (appears as MaBar AI Assistant)
  private static readonly SESSION_SCOUT_SYSTEM_PROMPT = `You are MaBar Logic AI - an intelligent problem solver for padel matchmaking with CONVERSATION CONTEXT AWARENESS.

🎯 YOUR ROLE: Understand what users really need and choose the best tool to help them, considering ALL previously provided information.

🧰 AVAILABLE TOOLS:
findMatch, getAvailableVenues, getAvailablePlayers, findOpenSessions, createNewSession, getVenueDetails, checkVenueAvailability, getPersonalizedRecommendations, getUserBookings, getBookingHistory, modifyBooking, cancelBooking, deleteBooking, checkBookingStatus, joinSession, needMoreInfo

🧠 CONTEXT-AWARE THINKING:
- ALWAYS check the CONVERSATION CONTEXT section for previously provided information
- DO NOT ask for information that was already provided (time, location, activity, etc.)
- If user provided "tonight" earlier, DO NOT ask "when would you like to play?"
- If user provided "jakarta barat" earlier, DO NOT ask "where would you like to play?"
- Use accumulated information to make informed decisions
- Only use needMoreInfo if truly essential information is missing
- Combine all available context to choose the best action

🔄 CONVERSATION FLOW LOGIC:
1. FIRST: Check if CONVERSATION CONTEXT contains sufficient information
2. If user asks "show courts/venues/available" + activity known → use getAvailableVenues
3. If activity + (time OR location) are known → use findMatch or getAvailableVenues
4. If only greeting/unclear → use needMoreInfo
5. If specific request (bookings, venues) → use specific tool
6. NEVER re-ask for information already in context
7. ACCUMULATE context across messages - don't reset!

📝 RESPOND: {"action": "toolName", "parameters": {relevant_params_including_context}}

💡 CONTEXT-AWARE EXAMPLES:
Context: activity=padel, time=tonight + "jakarta barat" → {"action": "findMatch", "parameters": {"activity": "padel", "time": "tonight", "location": "jakarta barat"}}
Context: activity=padel, time=7PM + "kedoya" → {"action": "findMatch", "parameters": {"activity": "padel", "time": "7PM", "location": "kedoya"}}
Context: activity=padel + "show courts" → {"action": "getAvailableVenues", "parameters": {"activity": "padel"}}
Context: activity=padel + "show available courts" → {"action": "getAvailableVenues", "parameters": {"activity": "padel"}}
Context: activity=padel, location=senayan + "what time?" → {"action": "needMoreInfo", "parameters": {"missing": "time"}}
No context + "hi" → {"action": "needMoreInfo", "parameters": {}}

🚨 CRITICAL: If conversation context shows user already provided time/location/activity, USE that information instead of asking again!`


  /**
   * Initialize AI conversation (call once when chat opens)
   */
  static async initializeConversation(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Initialize conversation context
      this.conversationContext = {
        userRequirements: {},
        messages: [],
        lastAction: undefined,
        isComplete: false
      }
      this.isInitialized = true

    } catch (error) {
      AIFlowLogger.logError('conversation-init', error)
      throw error
    }
  }

  /**
   * Extract user requirements from a message
   */
  private static extractUserRequirements(message: string): Partial<UserRequirements> {
    const extracted: Partial<UserRequirements> = {}
    const lowerMessage = message.toLowerCase()

    // Extract activity
    if (lowerMessage.includes('padel') || lowerMessage.includes('play')) {
      extracted.activity = 'padel'
    }

    // Extract time information (enhanced to capture specific times like "7PM")
    const timePatterns = [
      { pattern: /(\d{1,2})\s*(pm|am)/i, value: 'specific_time' },
      { pattern: /tonight|this evening|malam ini/i, value: 'tonight' },
      { pattern: /tomorrow|besok/i, value: 'tomorrow' },
      { pattern: /morning|pagi/i, value: 'morning' },
      { pattern: /afternoon|siang/i, value: 'afternoon' },
      { pattern: /evening|sore/i, value: 'evening' },
      { pattern: /weekend|akhir pekan/i, value: 'weekend' },
      { pattern: /(\d{1,2}):(\d{2})/i, value: 'specific_time' }, // Handle 7:00 format
      { pattern: /at\s+(\d{1,2})/i, value: 'specific_time' } // Handle "at 7" format
    ]

    for (const { pattern, value } of timePatterns) {
      if (pattern.test(message)) {
        if (value === 'specific_time') {
          const match = pattern.exec(message)
          extracted.time = match?.[0] || value
        } else {
          extracted.time = value
        }
        break
      }
    }

    // Extract location information
    const locationPatterns = [
      /jakarta\s*(barat|timur|selatan|utara|pusat)?/i,
      /senayan/i,
      /kemang/i,
      /sudirman/i,
      /menteng/i,
      /kelapa gading/i,
      /pondok indah/i,
      /bsd/i,
      /tangerang/i
    ]

    for (const pattern of locationPatterns) {
      const match = pattern.exec(message)
      if (match) {
        extracted.location = match[0]
        break
      }
    }

    // Extract player count
    const playerRegex = /(\d+)\s*(player|orang|people)/i
    const playerMatch = playerRegex.exec(message)
    if (playerMatch) {
      extracted.playerCount = parseInt(playerMatch[1])
    }

    // Extract skill level
    const skillPatterns = [
      { pattern: /beginner|pemula|newbie/i, value: 'beginner' },
      { pattern: /intermediate|menengah/i, value: 'intermediate' },
      { pattern: /advanced|mahir|expert/i, value: 'advanced' }
    ]

    for (const { pattern, value } of skillPatterns) {
      if (pattern.test(message)) {
        extracted.skillLevel = value
        break
      }
    }

    return extracted
  }

  /**
   * Update conversation context with new user message and extracted information
   */
  private static updateConversationContext(userMessage: string, aiResponse?: string): void {
    const extractedInfo = this.extractUserRequirements(userMessage)

    // Add user message to conversation
    this.conversationContext.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
      extractedInfo
    })

    // Merge extracted information with existing requirements
    this.conversationContext.userRequirements = {
      ...this.conversationContext.userRequirements,
      ...extractedInfo
    }

    // Add AI response if provided
    if (aiResponse) {
      this.conversationContext.messages.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      })
    }

    console.log('📝 [CONTEXT] Updated user requirements:', this.conversationContext.userRequirements)
  }

  /**
   * Build context summary for AI analysis
   */
  private static buildContextSummary(): string {
    const reqs = this.conversationContext.userRequirements
    const parts: string[] = []

    if (Object.keys(reqs).length === 0) {
      return ''
    }

    parts.push('🔍 CONVERSATION CONTEXT - Information already provided by user:')

    if (reqs.activity) parts.push(`✅ Activity: ${reqs.activity}`)
    if (reqs.time) parts.push(`✅ Time: ${reqs.time}`)
    if (reqs.location) parts.push(`✅ Location: ${reqs.location}`)
    if (reqs.playerCount) parts.push(`✅ Player count: ${reqs.playerCount}`)
    if (reqs.skillLevel) parts.push(`✅ Skill level: ${reqs.skillLevel}`)
    if (reqs.venueType) parts.push(`✅ Venue type: ${reqs.venueType}`)
    if (reqs.priceRange) parts.push(`✅ Price range: ${reqs.priceRange}`)
    if (reqs.date) parts.push(`✅ Date: ${reqs.date}`)
    if (reqs.duration) parts.push(`✅ Duration: ${reqs.duration}`)

    parts.push('')
    parts.push('🚨 CRITICAL INSTRUCTION: Do NOT ask for information marked with ✅ above!')
    parts.push('🎯 USE the provided context to make informed decisions!')

    // Add decision guidance
    const hasActivity = !!reqs.activity
    const hasTime = !!reqs.time
    const hasLocation = !!reqs.location

    if (hasActivity && (hasTime || hasLocation)) {
      parts.push('💡 SUFFICIENT INFO: You have enough context to proceed with findMatch or getAvailableVenues!')
    } else if (hasActivity && !hasTime && !hasLocation) {
      parts.push('💡 MISSING: Need either time OR location to proceed')
    }

    return parts.join('\n')
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
        }],
        _aiAction: 'needMoreInfo',
        _searchCriteria: {}
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
      // Update conversation context with new user message
      this.updateConversationContext(userInput)

      // Build context summary from accumulated information
      const contextSummary = this.buildContextSummary()

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

${contextSummary}

Current User Message: ${userInput}`
        contextualInput = preferencesContext
      } else if (contextSummary) {
        contextualInput = `${contextSummary}

Current User Message: ${userInput}`
      }

      // Build conversation history for AI context
      const conversationHistory = this.conversationContext.messages
        .slice(-6) // Keep last 6 messages for context
        .map(msg => ({
          role: msg.role === 'assistant' ? 'model' : msg.role, // Fix: Convert 'assistant' to 'model' for Gemini API
          parts: [{ text: msg.content }]
        }))

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
        ...conversationHistory,
        // Add current user input with context
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

      // Store AI response in conversation context (don't extract info from AI response)
      if (responseText) {
        this.conversationContext.messages.push({
          role: 'assistant',
          content: responseText,
          timestamp: new Date()
        })
      }

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
        // Always fallback to needMoreInfo for parsing errors
        aiRequest = {
          action: 'needMoreInfo',
          parameters: {}
        }
      }

      return aiRequest

    } catch (error) {
      AIFlowLogger.logError('ai-analysis', error, { userInput, userPreferences })
      
      // Always fallback to needMoreInfo for errors
      const fallbackRequest = {
        action: 'needMoreInfo' as const,
        parameters: {}
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
    toolboxResponse: AIResponse & { _toolboxData?: any; _isEmpty?: boolean; _error?: string },
    searchCriteria: any
  ): Promise<AIResponse> {
    try {
      // Extract raw data from the toolbox response
      const userPreferences = await this.getUserPreferences()
      const presenterRequest: PresenterRequest = {
        userOriginalRequest,
        toolboxAction,
        rawData: {
          data: toolboxResponse._toolboxData,
          isEmpty: toolboxResponse._isEmpty,
          error: toolboxResponse._error,
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

      // Return the enhanced response from Presenter Assistant with AI context
      return {
        text: presentedResponse.text,
        sessionCards: presentedResponse.sessionCards,
        needsMoreInfo: presentedResponse.needsMoreInfo,
        _aiAction: toolboxAction,
        _searchCriteria: searchCriteria
      }

    } catch (error) {
      AIFlowLogger.logError('presenter-service', error, { userOriginalRequest, toolboxAction })

      // Fallback response if presenter fails
      return {
        text: 'Sorry, I encountered an issue processing your request. Please try again.',
        sessionCards: [{
          type: 'no-availability',
          data: { message: 'Presenter service error' }
        }],
        _aiAction: toolboxAction,
        _searchCriteria: searchCriteria
      }
    }
  }

  /**
   * Execute the toolbox action based on AI request
   * Now all toolbox methods return ToolboxResponse, so we convert to AIResponse format
   */
  private static async executeToolboxAction(aiRequest: AIRequest): Promise<AIResponse> {
    const { action, parameters } = aiRequest

    try {
      let toolboxResult: any

      switch (action) {
        case 'getAvailableVenues':
          toolboxResult = await MatchmakingToolboxService.getAvailableVenues(parameters)
          break

        case 'getAvailablePlayers':
          toolboxResult = await MatchmakingToolboxService.getAvailablePlayers(parameters)
          break

        case 'findOpenSessions':
          toolboxResult = await MatchmakingToolboxService.findOpenSessions(parameters)
          break

        case 'createNewSession':
          toolboxResult = await MatchmakingToolboxService.createNewSession(parameters)
          break

        case 'findMatch':
          toolboxResult = await MatchmakingToolboxService.findMatch(parameters)
          break

        case 'getUserBookings':
          toolboxResult = await MatchmakingToolboxService.getUserBookings(parameters)
          break

        case 'getBookingHistory':
          toolboxResult = await MatchmakingToolboxService.getBookingHistory(parameters)
          break

        case 'getPersonalizedRecommendations':
          toolboxResult = await MatchmakingToolboxService.getPersonalizedRecommendations(parameters)
          break

        case 'getVenueDetails':
          toolboxResult = await MatchmakingToolboxService.getVenueDetails(parameters)
          break

        case 'checkVenueAvailability':
          toolboxResult = await MatchmakingToolboxService.checkVenueAvailability(parameters)
          break

        case 'modifyBooking':
          toolboxResult = await MatchmakingToolboxService.modifyBooking(parameters)
          break

        case 'cancelBooking':
          toolboxResult = await MatchmakingToolboxService.cancelBooking(parameters)
          break

        case 'deleteBooking':
          toolboxResult = await MatchmakingToolboxService.deleteBooking(parameters)
          break

        case 'checkBookingStatus':
          toolboxResult = await MatchmakingToolboxService.checkBookingStatus(parameters)
          break

        case 'joinSession':
          toolboxResult = await MatchmakingToolboxService.joinSession(parameters)
          break

        case 'needMoreInfo':
          toolboxResult = MatchmakingToolboxService.needMoreInfo(parameters)
          break

        default:
          // Return a ToolboxResponse-like structure for unknown actions
          toolboxResult = {
            data: { message: 'Unknown request type' },
            error: 'Unknown action',
            isEmpty: true
          }
      }

      // Convert ToolboxResponse to AIResponse format for the presenter
      // We'll pass the raw data through a special property that the presenter can access
      const response: AIResponse & { _toolboxData?: any; _isEmpty?: boolean; _error?: string } = {
        text: '',
        _toolboxData: toolboxResult.data,
        _isEmpty: toolboxResult.isEmpty,
        _error: toolboxResult.error
      }

      return response

    } catch (error) {
      AIFlowLogger.logError('toolbox-execution', error, { action, parameters })

      return {
        text: '',
        _toolboxData: { message: 'Toolbox execution error' },
        _error: (error as Error).message,
        _isEmpty: true
      } as AIResponse & { _toolboxData?: any; _isEmpty?: boolean; _error?: string }
    }
  }
}