import { AILogicService } from './aiLogicService'
import { AIPresenterService } from './aiPresenterService'
import { AIFlowLogger } from './aiFlowLogger'
import type { AIResponse } from './aiInterfaces'

export class AICoordinatorService {
  /**
   * Main entry point - coordinates AI Logic and AI Presenter
   */
  static async processUserInput(userInput: string, interactionType: 'text' | 'card-interaction' = 'text'): Promise<AIResponse> {
    AIFlowLogger.startSession(userInput)
    
    try {
      if (interactionType === 'card-interaction') {
        const [action, data] = userInput.split(':')
        userInput = `User wants to ${action.replace('_', ' ')} for ${data}`
      }

      const response = await this.processWithAIs(userInput)
      
      AIFlowLogger.logFinalResponse(response)
      AIFlowLogger.endSession()
      
      return response
      
    } catch (error) {
      AIFlowLogger.logError('ai-coordinator', error, { userInput })
      AIFlowLogger.endSession()
      
      return {
        text: 'I encountered an issue. Could you try rephrasing your request?',
        sessionCards: []
      }
    }
  }

  /**
   * Process message using AI Logic and AI Presenter
   */
  private static async processWithAIs(message: string): Promise<AIResponse> {
    try {
      // Step 1: AI Logic analyzes intent and gathers information
      const infoResult = await AILogicService.gatherRequiredInfo(message)
      
      if (infoResult.needsMoreInfo) {
        // Need more information from user
        return {
          text: infoResult.nextQuestion,
          sessionCards: [],
          needsMoreInfo: true
        }
      }
      
      if (infoResult.readyForToolbox && infoResult.toolboxAction) {
        // Step 2: Execute toolbox action
        const findings = await AILogicService.executeToolboxAction(
          infoResult.toolboxAction,
          infoResult.toolboxParams
        )
        
        // Step 3: AI Logic discusses with AI Presenter (simplified for now)
        const presentationStrategy = await AILogicService.discussWithPresenter(findings)
        
        // Step 4: Present results (AI Presenter logic will be implemented later)
        return await this.presentResults(presentationStrategy)
      }
      
      // Fallback conversation
      return {
        text: infoResult.nextQuestion,
        sessionCards: [],
        needsMoreInfo: true
      }
      
    } catch (error) {
      AIFlowLogger.logError('three-ai-system', error, { message })
      return {
        text: 'I encountered an issue. Could you try rephrasing your request?',
        sessionCards: []
      }
    }
  }

  /**
   * Present results using full AI Presenter Service with Gemini
   */
  private static async presentResults(strategy: any): Promise<AIResponse> {
    const { findings, recommendedPresentation, reasoning, userContext } = strategy
    
    try {
      // Use full AI Presenter Service with Gemini integration
      const userResponse = await AIPresenterService.formatResponse(
        findings,
        userContext || {},
        recommendedPresentation
      )

      AIFlowLogger.logFinalResponse(userResponse)
      return userResponse

    } catch (error) {
      AIFlowLogger.logError('presentation-error', error as Error, { strategy })
      
      // Fallback to simple presentation
      const fallbackResponse = AIPresenterService.formatSimpleResponse(
        findings,
        recommendedPresentation,
        reasoning
      )
      
      return fallbackResponse
    }
  }



  static resetConversation(): void {
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