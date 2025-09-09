import { AIMatchmakingService } from './aiMatchmakingService'
import { AIPresenterService } from './aiPresenterService'
import type { PresenterRequest } from './aiPresenterService'

export interface ConversationContext {
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    type: 'text' | 'card-interaction'
    metadata?: any
  }>
  lastToolboxAction?: string
  lastSearchCriteria?: any
  userPreferences?: any
}

export interface AIResponse {
  text: string
  sessionCards?: Array<{
    type: 'existing-session' | 'create-new' | 'no-availability'
    data: any
  }>
  needsMoreInfo?: boolean
}

export class AICoordinatorService {
  private static conversationContext: ConversationContext = { messages: [] }

  /**
   * Main entry point - handles all user interactions with unified "MaBar AI Assistant"
   */
  static async processUserInput(userInput: string, interactionType: 'text' | 'card-interaction' = 'text'): Promise<AIResponse> {
    try {
      // Add user message to conversation context
      this.addToConversation('user', userInput, interactionType)

      let response: AIResponse

      if (interactionType === 'text') {
        // Text input → Logic AI handles navigation and toolbox
        response = await this.handleTextInput(userInput)
      } else {
        // Card interaction → Presenter AI handles response
        response = await this.handleCardInteraction(userInput)
      }

      // Add assistant response to conversation context
      this.addToConversation('assistant', response.text, 'text', {
        sessionCards: response.sessionCards,
        needsMoreInfo: response.needsMoreInfo
      })

      return response

    } catch (error) {
      console.error('❌ AI Coordinator Error:', error)
      return {
        text: 'Sorry, I encountered an issue. Please try again.',
        sessionCards: [{
          type: 'no-availability',
          data: { message: 'Service temporarily unavailable' }
        }]
      }
    }
  }

  /**
   * Handle text input - Logic AI determines action, executes toolbox, Presenter formats response
   */
  private static async handleTextInput(userInput: string): Promise<AIResponse> {
    // Step 1: Logic AI analyzes input and executes toolbox
    const logicResponse = await AIMatchmakingService.processMatchmakingRequest(userInput)
    
    // Store toolbox action for context
    this.conversationContext.lastToolboxAction = 'findMatch' // This should come from logic AI
    this.conversationContext.lastSearchCriteria = {} // This should come from logic AI

    // Step 2: If toolbox returns raw data, use Presenter AI to format it
    if (logicResponse.sessionCards && logicResponse.sessionCards.length > 0) {
      const presenterRequest: PresenterRequest = {
        userOriginalRequest: userInput,
        toolboxAction: this.conversationContext.lastToolboxAction || 'findMatch',
        rawData: logicResponse,
        searchCriteria: this.conversationContext.lastSearchCriteria
      }

      const presentedResponse = await AIPresenterService.presentResults(presenterRequest)
      
      return {
        text: presentedResponse.text,
        sessionCards: presentedResponse.sessionCards,
        needsMoreInfo: presentedResponse.needsMoreInfo
      }
    }

    // Return logic response if no formatting needed
    return logicResponse
  }

  /**
   * Handle card interactions - Presenter AI provides contextual responses
   */
  private static async handleCardInteraction(interactionData: string): Promise<AIResponse> {
    // Parse interaction data (e.g., "join_session:venue_id" or "create_session:venue_name")
    const [action, data] = interactionData.split(':')

    const presenterRequest: PresenterRequest = {
      userOriginalRequest: `User ${action} with ${data}`,
      toolboxAction: 'cardInteraction',
      rawData: {
        action,
        data,
        conversationHistory: this.getRecentMessages(3)
      },
      searchCriteria: this.conversationContext.lastSearchCriteria
    }

    return await AIPresenterService.presentResults(presenterRequest)
  }

  /**
   * Add message to conversation context
   */
  private static addToConversation(
    role: 'user' | 'assistant', 
    content: string, 
    type: 'text' | 'card-interaction',
    metadata?: any
  ): void {
    this.conversationContext.messages.push({
      role,
      content,
      timestamp: new Date(),
      type,
      metadata
    })

    // Keep only last 10 messages for performance
    if (this.conversationContext.messages.length > 10) {
      this.conversationContext.messages = this.conversationContext.messages.slice(-10)
    }
  }

  /**
   * Get recent messages for context
   */
  private static getRecentMessages(count: number = 5): Array<{role: string, content: string}> {
    return this.conversationContext.messages
      .slice(-count)
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }))
  }

  /**
   * Get conversation context for debugging
   */
  static getConversationContext(): ConversationContext {
    return this.conversationContext
  }

  /**
   * Reset conversation (for new chat sessions)
   */
  static resetConversation(): void {
    this.conversationContext = { messages: [] }
  }
}