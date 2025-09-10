import { AILogicService } from './aiLogicService'
import { AIPresenterService } from './aiPresenterService'
import { AIFlowLogger } from './aiFlowLogger'
import type { AIResponse } from './aiInterfaces'

export class AICoordinatorService {
  /**
   * Main entry point - coordinates AI Logic and AI Presenter
   * CONSISTENCY: Relies on smart intent detection rather than time-based caching
   */
  static async processUserInput(userInput: string, interactionType: 'text' | 'card-interaction' = 'text'): Promise<AIResponse> {
    const startTime = Date.now()
    AIFlowLogger.logUserInput(userInput)

    try {
      if (interactionType === 'card-interaction') {
        const [action, data] = userInput.split(':')
        userInput = `User wants to ${action.replace('_', ' ')} for ${data}`
      }

      // SMART CONSISTENCY: Let AI Logic handle consistency through intent detection
      // This is more user-centric than arbitrary time-based caching
      const response = await this.processWithAIs(userInput)

      const totalDuration = Date.now() - startTime
      AIFlowLogger.logFinalResponse(response, totalDuration)

      return response

    } catch (error) {
      console.error('❌ Coordinator Error:', error)
      return {
        text: 'I encountered an issue. Could you try rephrasing your request?',
        sessionCards: []
      }
    }
  }

  /**
   * Process message using AI Logic (Sales Agent) and AI Presenter (Tour Guide)
   * TWO-STAGE SALES PROCESS: Sales Agent → Tour Guide
   */
  private static async processWithAIs(message: string): Promise<AIResponse> {
    try {
      // STAGE 1: AI LOGIC (ENTHUSIASTIC SALES AGENT)
      // Gathers customer preferences and gets excited about showing options
      const infoResult = await AILogicService.gatherRequiredInfo(message)

      // SALES AGENT APPROACH: Rarely ask for more info, prefer showing options
      if (infoResult.needsMoreInfo && !infoResult.readyForToolbox) {
        return {
          text: infoResult.nextQuestion || "Let me show you some fantastic padel options available right now!",
          sessionCards: [],
          needsMoreInfo: false // Sales agents show options, don't ask endless questions
        }
      }

      // STAGE 2: EXECUTE SEARCH (FIND THE "HOUSES" TO SHOW)
      if (infoResult.readyForToolbox && infoResult.toolboxAction) {
        console.log('🏆 Sales Agent found customer preferences, searching for great options...')

        const findings = await AILogicService.executeToolboxAction(
          infoResult.toolboxAction,
          infoResult.toolboxParams
        )

        // STAGE 3: AI LOGIC & AI PRESENTER COLLABORATION
        // Sales Agent discusses with Tour Guide about how to present the "houses"
        const presentationStrategy = await AILogicService.discussWithPresenter(findings)

        // STAGE 4: AI PRESENTER (TOUR GUIDE) SHOWS THE OPTIONS
        // Tour Guide provides detailed information and encourages booking
        return await this.presentResults(presentationStrategy)
      }

      // ENTHUSIASTIC FALLBACK: Always ready to show something!
      return {
        text: "🎾 I'm excited to help you find amazing padel sessions! Let me show you what's available right now...",
        sessionCards: [],
        needsMoreInfo: false
      }

    } catch (error) {
      AIFlowLogger.logError('sales-process-error', error as Error, { message })
      return {
        text: '🎾 No worries! Let me help you find some great padel options. What kind of session interests you?',
        sessionCards: []
      }
    }
  }

  /**
   * Present results using AI Presenter (Tour Guide) with sales focus
   * TOUR GUIDE STAGE: Show the "houses" with enthusiasm and encourage booking
   */
  private static async presentResults(strategy: any): Promise<AIResponse> {
    const { findings, recommendedPresentation, userContext } = strategy

    try {
      console.log('🏠 Tour Guide presenting options with sales enthusiasm...')

      // AI PRESENTER (TOUR GUIDE) shows options like a property agent
      const userResponse = await AIPresenterService.formatResponse(
        findings,
        userContext || {},
        recommendedPresentation || 'cards' // Default to visual cards (like house photos)
      )

      AIFlowLogger.logFinalResponse(userResponse)
      return userResponse

    } catch (error) {
      AIFlowLogger.logError('tour-guide-error', error as Error, { strategy })

      // ENTHUSIASTIC FALLBACK: Even errors should be positive!
      const fallbackResponse = AIPresenterService.formatSimpleResponse(
        findings,
        'cards', // Always prefer visual presentation
        'Showing you great options with enthusiasm!'
      )

      return fallbackResponse
    }
  }



  static resetConversation(): void {
    // Reset handled by smart intent detection in AILogicService
    AIFlowLogger.clearLogs()
    AILogicService.resetConversation()
    AIPresenterService.resetConversation()
  }

  /**
   * Get conversation info for debugging
   */
  static getConversationInfo(): any {
    const logicState = AILogicService.getConversationState()
    
    return {
      logicMessages: logicState.history.length,
      accumulatedInfo: logicState.accumulated,
      totalInteractions: logicState.history.length
    }
  }
}