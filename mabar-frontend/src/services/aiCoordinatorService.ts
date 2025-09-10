import { AISimpleFlow } from './aiSimpleFlow'

export interface AIResponse {
  text: string
  sessionCards?: Array<{
    type: 'existing-session' | 'create-new' | 'no-availability' | 'user-booking' | 'join-confirmation'
    data: any
  }>
}

export class AICoordinatorService {
  /**
   * Simple AI flow: AI thinks → Toolbox gets data → AI presents
   */
  static async processUserInput(userInput: string, interactionType: 'text' | 'card-interaction' = 'text'): Promise<AIResponse> {
    try {
      if (interactionType === 'card-interaction') {
        const [action, data] = userInput.split(':')
        userInput = `User wants to ${action.replace('_', ' ')} for ${data}`
      }

      return await AISimpleFlow.processUserInput(userInput)

    } catch (error) {
      console.error('❌ AI Error:', error)
      return {
        text: 'Sorry, I encountered an issue. Please try again.',
        sessionCards: []
      }
    }
  }

  static resetConversation(): void {
    AISimpleFlow.resetConversation()
  }
}