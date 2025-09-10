import { GoogleGenAI } from '@google/genai'
import { env } from '../config/env'
import { AIFlowLogger } from './aiFlowLogger'

export interface ConversationMessage {
  role: 'user' | 'model'
  parts: Array<{ text: string }>
  timestamp?: Date
}

export interface UserContext {
  accumulatedInfo: {
    date?: string
    time?: string
    location?: string
    skillLevel?: string
    gameType?: string
    budget?: string
    players?: number
  }
  preferences?: {
    skillLevel?: string
    preferredAreas?: string[]
    playingTimes?: string[]
    budgetRange?: { min: number; max: number }
  }
}

export interface AIDecision {
  needsMoreInfo: boolean
  hasEnoughInfo: boolean
  missingInfo: string[]
  toolboxAction?: string
  parameters?: any
  responseType: 'question' | 'search' | 'presentation'
}

export class AIConversationManager {
  private static ai = new GoogleGenAI({ apiKey: env.GOOGLE_API_KEY })
  private static conversation: ConversationMessage[] = []
  private static userContext: UserContext = { accumulatedInfo: {} }

  // Single system prompt that handles both logic and presentation
  private static readonly MABAR_SYSTEM_PROMPT = `You are MaBar AI Assistant - a smart padel matchmaking assistant for Jakarta players.

🎯 YOUR MISSION: Help users find and book padel sessions by gathering information intelligently and providing data-driven recommendations.

🧠 THINKING PROCESS:
1. ANALYZE user input and extract any session-related information (date, time, location, skill level, etc.)
2. ACCUMULATE information across multiple messages - build complete picture
3. DECIDE if you have enough information to search database or need more details
4. EXECUTE appropriate action: ask questions, search database, or present results

📊 INFORMATION REQUIREMENTS for session matching:
MINIMUM needed: date/time + location OR skill level
OPTIMAL: date + time + location + skill level + budget + player count

🔧 AVAILABLE TOOLBOX ACTIONS:
- findVenues: Search available courts (needs: location, date/time)
- findPlayers: Search available players (needs: skill level, date/time)  
- findSessions: Search existing sessions to join (needs: date/time, location)
- createSession: Help create new session (needs: venue, date/time)

🎨 RESPONSE MODES:
1. INFORMATION_GATHERING: Ask smart follow-up questions
2. DATABASE_SEARCH: Execute toolbox action with accumulated parameters
3. RESULT_PRESENTATION: Present search results with appropriate UI cards

💭 DECISION LOGIC:
- If user says "hello" → Welcome + ask what they want to do
- If user says "tomorrow morning" → Ask for location or skill level preference
- If user says "kedoya" → Now have time+location, can search venues
- If 100 venues found → Ask if they want to filter by price/rating/distance
- Always think: "Do I have enough to give useful results?"

🎯 RESPONSE FORMAT:
{
  "mode": "information_gathering" | "database_search" | "result_presentation",
  "needsMoreInfo": boolean,
  "missingInfo": ["location", "time"] (if applicable),
  "accumulatedInfo": {extracted_info_object},
  "toolboxAction": "findVenues" (if searching),
  "parameters": {search_parameters} (if searching),
  "message": "conversational response to user",
  "uiCards": [] (if presenting results)
}

🌟 BE SMART & DYNAMIC:
- Don't ask for everything at once - gather info naturally
- Use context from previous messages
- Adapt to user's communication style
- Provide helpful suggestions when stuck
- Always explain your reasoning briefly`

  /**
   * Process user input with multi-turn conversation context
   */
  static async processUserInput(userInput: string): Promise<any> {
    const sessionId = AIFlowLogger.startSession(userInput)
    
    try {
      // Add user message to conversation
      this.addMessage('user', userInput)

      // Build conversation context with accumulated information
      const contextualPrompt = this.buildContextualPrompt(userInput)

      // Generate AI response using multi-turn conversation
      const conversationContents = [
        {
          role: 'user',
          parts: [{ text: 'You are MaBar AI Assistant. Respond only with JSON following the specified format.' }]
        },
        {
          role: 'model', 
          parts: [{ text: this.MABAR_SYSTEM_PROMPT }]
        },
        // Include conversation history for context
        ...this.conversation.slice(-6), // Last 6 messages for context
        {
          role: 'user',
          parts: [{ text: contextualPrompt }]
        }
      ]

      const result = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: conversationContents
      })

      const responseText = result.text || ''

      // Parse AI decision
      const aiDecision = this.parseAIResponse(responseText)
      
      // Log AI thinking process
      AIFlowLogger.logAIThinking(aiDecision, {
        userInput,
        contextualPrompt,
        conversationLength: this.conversation.length
      })

      // Add AI response to conversation
      this.addMessage('model', aiDecision.message || responseText)

      // Update user context with accumulated information
      if (aiDecision.accumulatedInfo) {
        this.updateUserContext(aiDecision.accumulatedInfo)
      }

      // Execute based on AI decision
      const finalResponse = await this.executeAIDecision(aiDecision, userInput)
      
      // Log final response
      AIFlowLogger.logFinalResponse(finalResponse)
      AIFlowLogger.endSession()
      
      return finalResponse

    } catch (error) {
      AIFlowLogger.logError('conversation-manager', error, { userInput })
      AIFlowLogger.endSession()
      
      return {
        text: 'Sorry, I encountered an issue. Please try again.',
        sessionCards: []
      }
    }
  }

  /**
   * Build contextual prompt with accumulated information
   */
  private static buildContextualPrompt(userInput: string): string {
    const context = this.userContext.accumulatedInfo
    const hasContext = Object.keys(context).length > 0

    let prompt = `Current user message: "${userInput}"\n\n`

    if (hasContext) {
      prompt += `Previously gathered information:\n`
      prompt += `${JSON.stringify(context, null, 2)}\n\n`
    }

    if (this.userContext.preferences) {
      prompt += `User preferences from profile:\n`
      prompt += `${JSON.stringify(this.userContext.preferences, null, 2)}\n\n`
    }

    prompt += `Analyze this input, extract any new information, and decide your next action.`

    return prompt
  }

  /**
   * Parse AI response and extract decision
   */
  private static parseAIResponse(responseText: string): any {
    try {
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim()
      return JSON.parse(cleanJson)
    } catch (error) {
      // Fallback parsing for non-JSON responses
      return {
        mode: 'information_gathering',
        needsMoreInfo: true,
        message: responseText || 'I need more information to help you.',
        accumulatedInfo: {}
      }
    }
  }

  /**
   * Execute AI decision dynamically based on AI's reasoning
   */
  private static async executeAIDecision(decision: any, originalInput: string): Promise<any> {
    switch (decision.mode) {
      case 'conversation':
        return {
          text: decision.message,
          sessionCards: [],
          needsMoreInfo: decision.needsMoreInfo !== false
        }

      case 'search':
        // Execute toolbox action with AI-determined parameters
        const searchResults = await this.executeToolboxAction(decision.toolboxAction, decision.parameters)
        
        // Let AI decide how to present results
        return await this.presentSearchResults(originalInput, decision.toolboxAction, searchResults, decision.parameters)

      case 'presentation':
        return {
          text: decision.message,
          sessionCards: decision.uiCards || [],
          needsMoreInfo: false
        }

      default:
        // Fallback to conversation mode
        return {
          text: decision.message || 'How can I help you with padel today?',
          sessionCards: []
        }
    }
  }

  /**
   * Execute toolbox action - integrate with existing services
   */
  private static async executeToolboxAction(action: string, parameters: any): Promise<any> {
    AIFlowLogger.logToolboxRequest(action, parameters)
    
    try {
      // Import services dynamically to avoid circular dependencies
      const { VenueService } = await import('./venueService')
      const { PlayerService } = await import('./playerService')
      const { SessionService } = await import('./sessionService')
      
      let response: any
      
      switch (action) {
        case 'findVenues':
          const venues = await VenueService.searchVenues(parameters)
          response = { venues, totalResults: venues?.length || 0 }
          break
          
        case 'findPlayers':
          const players = await PlayerService.searchPlayers(parameters)
          response = { players, totalResults: players?.length || 0 }
          break
          
        case 'findSessions':
          const sessions = await SessionService.searchSessions(parameters)
          response = { sessions, totalResults: sessions?.length || 0 }
          break
          
        case 'createSession':
          response = { 
            action: 'createSession',
            parameters,
            needsUserInput: true,
            message: 'Ready to create session with provided details'
          }
          break
          
        default:
          response = { error: `Unknown toolbox action: ${action}` }
      }
      
      AIFlowLogger.logToolboxResponse(action, response)
      return response
      
    } catch (error) {
      const errorResponse = { 
        error: `Failed to execute ${action}`,
        details: error.message 
      }
      AIFlowLogger.logToolboxResponse(action, errorResponse)
      return errorResponse
    }
  }

  /**
   * Let AI decide how to present search results
   */
  private static async presentSearchResults(originalRequest: string, action: string, results: any, searchParams: any): Promise<any> {
    const presentationPrompt = `
Original user request: "${originalRequest}"
Search action performed: ${action}
Search parameters: ${JSON.stringify(searchParams)}
Raw results: ${JSON.stringify(results)}

Analyze these results and decide:
1. Are there too many results (>5)? Should we filter or group them?
2. Are there no results? What alternatives can we suggest?
3. How should we present this data (cards vs text)?
4. What follow-up questions might be helpful?

Respond with presentation decision and formatted response.`

    try {
      const result = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: [
          ...this.conversation.slice(-4), // Recent context
          {
            role: 'user',
            parts: [{ text: presentationPrompt }]
          }
        ]
      })

      const presentationDecision = this.parseAIResponse(result.text || '')
      
      const finalResponse = {
        text: presentationDecision.message,
        sessionCards: presentationDecision.uiCards || [],
        needsMoreInfo: presentationDecision.needsMoreInfo || false
      }
      
      AIFlowLogger.logAIPresentation(presentationDecision, finalResponse)
      
      return finalResponse

    } catch (error) {
      AIFlowLogger.logError('presentation', error, { originalRequest, action, results })
      return {
        text: 'Found some results, but having trouble displaying them. Please try again.',
        sessionCards: []
      }
    }
  }

  /**
   * Add message to conversation history
   */
  private static addMessage(role: 'user' | 'model', content: string): void {
    this.conversation.push({
      role,
      parts: [{ text: content }],
      timestamp: new Date()
    })

    // Keep conversation manageable (last 20 messages)
    if (this.conversation.length > 20) {
      this.conversation = this.conversation.slice(-20)
    }
  }

  /**
   * Update user context with new information
   */
  private static updateUserContext(newInfo: any): void {
    this.userContext.accumulatedInfo = {
      ...this.userContext.accumulatedInfo,
      ...newInfo
    }
    console.log('📝 [CONTEXT] Updated user context:', this.userContext.accumulatedInfo)
  }

  /**
   * Set user preferences from profile
   */
  static setUserPreferences(preferences: any): void {
    this.userContext.preferences = preferences
  }

  /**
   * Get current conversation context
   */
  static getConversationContext(): { messages: ConversationMessage[], userContext: UserContext } {
    return {
      messages: this.conversation,
      userContext: this.userContext
    }
  }

  /**
   * Reset conversation for new session
   */
  static resetConversation(): void {
    this.conversation = []
    this.userContext = { accumulatedInfo: {} }
  }
}