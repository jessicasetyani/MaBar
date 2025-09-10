import { GoogleGenAI } from '@google/genai'
import { env } from '../config/env'
import { AIFlowLogger } from './aiFlowLogger'
import { MatchmakingToolboxService } from './matchmakingToolboxService'

export interface IntentAnalysis {
  intent: 'find_venue' | 'find_players' | 'join_session' | 'create_session' | 'general_inquiry'
  confidence: number
  extractedInfo: Record<string, any>
  missingInfo: string[]
  isComplete: boolean
}

export interface InfoGatheringResult {
  needsMoreInfo: boolean
  nextQuestion: string
  accumulatedInfo: Record<string, any>
  readyForToolbox: boolean
  toolboxAction?: string
  toolboxParams?: any
}

export interface PresentationStrategy {
  findings: any
  recommendedPresentation: 'cards' | 'text' | 'mixed'
  reasoning: string
  userContext: Record<string, any>
}

export class AILogicService {
  private static ai = new GoogleGenAI({ apiKey: env.GOOGLE_API_KEY })
  private static conversationHistory: Array<{ role: 'user' | 'model', content: string }> = []
  private static accumulatedInfo: Record<string, any> = {}

  private static readonly LOGIC_SYSTEM_PROMPT = `You are AI Logic - the intent understanding specialist in MaBar's 3-AI system.

🎯 YOUR ROLE: Understand user intent and gather complete information for padel matchmaking.

🧠 CORE RESPONSIBILITIES:
1. ANALYZE user messages to understand what they want
2. EXTRACT any session-related information (date, time, location, skill, budget, players)
3. ACCUMULATE information across conversation turns
4. DECIDE when you have enough info to query database
5. ASK smart follow-up questions when needed

📊 INFORMATION REQUIREMENTS:
- find_venue: date/time + location (minimum)
- find_players: skill level + date/time (minimum)  
- join_session: date/time + location OR skill level
- create_session: venue + date/time + organizer info

🎯 RESPONSE FORMAT (JSON only):
{
  "intent": "find_venue|find_players|join_session|create_session|general_inquiry",
  "confidence": 0.8,
  "extractedInfo": {"date": "tomorrow", "location": "kedoya"},
  "accumulatedInfo": {all_info_gathered_so_far},
  "missingInfo": ["time", "skill_level"],
  "isComplete": false,
  "needsMoreInfo": true,
  "nextQuestion": "What time would you like to play?",
  "readyForToolbox": false,
  "toolboxAction": "findVenues" (if ready),
  "toolboxParams": {search_parameters} (if ready)
}

🌟 BE INTELLIGENT:
- Don't ask for everything at once
- Use conversation context
- Recognize when user changes intent
- Validate information completeness before toolbox`

  /**
   * Analyze user intent and extract information
   */
  static async analyzeUserIntent(message: string): Promise<IntentAnalysis> {
    AIFlowLogger.startSession(message)
    
    try {
      const prompt = this.buildIntentAnalysisPrompt(message)
      
      const result = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: [{
          role: 'user',
          parts: [{ text: this.LOGIC_SYSTEM_PROMPT + '\n\n' + prompt }]
        }]
      })

      const response = this.parseResponse(result.text || '')
      
      AIFlowLogger.logAIThinking(response, { 
        service: 'AILogicService',
        method: 'analyzeUserIntent',
        userInput: message 
      })

      return {
        intent: response.intent || 'general_inquiry',
        confidence: response.confidence || 0.5,
        extractedInfo: response.extractedInfo || {},
        missingInfo: response.missingInfo || [],
        isComplete: response.isComplete || false
      }

    } catch (error) {
      AIFlowLogger.logError('ai-logic-service', error, { message })
      return {
        intent: 'general_inquiry',
        confidence: 0.1,
        extractedInfo: {},
        missingInfo: ['intent'],
        isComplete: false
      }
    }
  }

  /**
   * Gather required information through conversation
   */
  static async gatherRequiredInfo(message: string): Promise<InfoGatheringResult> {
    try {
      // Update accumulated info with new message
      this.conversationHistory.push({ role: 'user', content: message })
      
      const prompt = this.buildInfoGatheringPrompt(message)
      
      const result = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: [{
          role: 'user',
          parts: [{ text: this.LOGIC_SYSTEM_PROMPT + '\n\n' + prompt }]
        }]
      })

      const response = this.parseResponse(result.text || '')
      
      // Update accumulated information
      if (response.accumulatedInfo) {
        this.accumulatedInfo = { ...this.accumulatedInfo, ...response.accumulatedInfo }
      }

      AIFlowLogger.logAIThinking(response, {
        service: 'AILogicService', 
        method: 'gatherRequiredInfo',
        accumulatedInfo: this.accumulatedInfo
      })

      return {
        needsMoreInfo: response.needsMoreInfo !== false,
        nextQuestion: response.nextQuestion || 'How can I help you with padel?',
        accumulatedInfo: this.accumulatedInfo,
        readyForToolbox: response.readyForToolbox === true,
        toolboxAction: response.toolboxAction,
        toolboxParams: response.toolboxParams
      }

    } catch (error) {
      AIFlowLogger.logError('ai-logic-service', error, { message })
      return {
        needsMoreInfo: true,
        nextQuestion: 'Could you tell me more about what you\'re looking for?',
        accumulatedInfo: this.accumulatedInfo,
        readyForToolbox: false
      }
    }
  }

  /**
   * Discuss with AI Presenter about how to present findings
   */
  static async discussWithPresenter(findings: any): Promise<PresentationStrategy> {
    try {
      // Import AIPresenterService dynamically to avoid circular dependencies
      const { AIPresenterService } = await import('./aiPresenterService')
      
      // Create analysis for AI Presenter
      const logicAnalysis = {
        confidence: this.calculateConfidence(findings),
        hasResults: this.hasValidResults(findings),
        userContext: this.accumulatedInfo,
        conversationTurns: this.conversationHistory.length
      }

      // AI Presenter makes UX decision
      const presenterResponse = await AIPresenterService.discussWithLogic(findings, logicAnalysis)

      // Log inter-AI discussion
      AIFlowLogger.logAIThinking({
        logicAnalysis,
        presenterResponse,
        interAIDiscussion: true
      }, {
        service: 'AILogicService',
        method: 'discussWithPresenter'
      })

      return {
        findings,
        recommendedPresentation: presenterResponse.format,
        reasoning: presenterResponse.reasoning,
        userContext: this.accumulatedInfo
      }

    } catch (error) {
      AIFlowLogger.logError('ai-logic-presenter-discussion', error as Error, { findings })
      return this.fallbackPresentationStrategy(findings)
    }
  }

  /**
   * Execute toolbox action when ready
   */
  static async executeToolboxAction(action: string, params: any): Promise<any> {
    AIFlowLogger.logToolboxRequest(action, params)
    
    try {
      let results: any
      
      switch (action) {
        case 'findVenues':
          results = await MatchmakingToolboxService.searchVenues(params)
          break
        case 'findPlayers':
          results = await MatchmakingToolboxService.searchPlayers(params)
          break
        case 'findSessions':
          results = await MatchmakingToolboxService.findOpenSessions(params)
          break
        default:
          results = { error: 'Unknown toolbox action' }
      }

      AIFlowLogger.logToolboxResponse(results)
      return results

    } catch (error) {
      AIFlowLogger.logError('ai-logic-toolbox', error as Error, { action, params })
      return { error: 'Toolbox execution failed' }
    }
  }

  /**
   * Reset conversation state
   */
  static resetConversation(): void {
    this.conversationHistory = []
    this.accumulatedInfo = {}
    
    // Reset AI Presenter context too
    import('./aiPresenterService').then(({ AIPresenterService }) => {
      AIPresenterService.resetConversation()
    })
  }

  // Private helper methods for AI Presenter discussion
  private static calculateConfidence(findings: any): number {
    if (!findings || findings.error) return 0.1
    
    const totalResults = (findings.venues?.length || 0) + 
                        (findings.players?.length || 0) + 
                        (findings.sessions?.length || 0)
    
    if (totalResults === 0) return 0.2
    if (totalResults >= 1 && totalResults <= 10) return 0.9
    if (totalResults > 10) return 0.7
    
    return 0.5
  }

  private static hasValidResults(findings: any): boolean {
    if (!findings || findings.error) return false
    
    const totalResults = (findings.venues?.length || 0) + 
                        (findings.players?.length || 0) + 
                        (findings.sessions?.length || 0)
    
    return totalResults > 0
  }



  private static fallbackPresentationStrategy(findings: any): PresentationStrategy {
    return {
      findings,
      recommendedPresentation: 'mixed',
      reasoning: 'Fallback strategy due to communication error',
      userContext: this.accumulatedInfo
    }
  }

  /**
   * Get current conversation state
   */
  static getConversationState(): { history: any[], accumulated: any } {
    return {
      history: this.conversationHistory,
      accumulated: this.accumulatedInfo
    }
  }

  // Private helper methods
  private static buildIntentAnalysisPrompt(message: string): string {
    return `Analyze this user message for padel matchmaking intent:

USER MESSAGE: "${message}"

CONVERSATION HISTORY: ${JSON.stringify(this.conversationHistory.slice(-3), null, 2)}
ACCUMULATED INFO: ${JSON.stringify(this.accumulatedInfo, null, 2)}

Respond with JSON analysis.`
  }

  private static buildInfoGatheringPrompt(message: string): string {
    return `Continue information gathering for padel matchmaking:

CURRENT MESSAGE: "${message}"
ACCUMULATED INFO: ${JSON.stringify(this.accumulatedInfo, null, 2)}
CONVERSATION HISTORY: ${JSON.stringify(this.conversationHistory.slice(-4), null, 2)}

Determine if you need more info or ready for toolbox action. Respond with JSON.`
  }

  private static parseResponse(responseText: string): any {
    try {
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim()
      return JSON.parse(cleanJson)
    } catch (error) {
      return {
        needsMoreInfo: true,
        nextQuestion: responseText || 'Could you provide more details?'
      }
    }
  }
}