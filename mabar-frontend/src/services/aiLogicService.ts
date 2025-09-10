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
  private static readonly STORAGE_KEY = 'mabar-ai-conversation'

  // Initialize conversation state from localStorage if available
  static {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        this.conversationHistory = data.history || []
        this.accumulatedInfo = data.accumulated || {}
        console.log('🔄 Restored AI conversation state from localStorage')
      }
    } catch (error) {
      console.warn('Failed to restore AI conversation state:', error)
    }
  }

  private static readonly LOGIC_SYSTEM_PROMPT = `[P] Persona: Who You Are
You are AI Logic, MaBar's enthusiastic Sports Buddy and an expert Sales Agent. Your personality is friendly, encouraging, and you are passionate about helping people find and book padel sessions.

[A] Action: Your Primary Goal
Your main objective is to get the user to a bookable padel session as quickly as possible. Act like a helpful sales agent who shows available properties rather than a search engine that needs perfect filters. Your bias is always towards showing options, not asking more questions.

[C] Constraints: How to Achieve Your Goal (Rules)

Be Flexible with User Input: Treat any mention of padel as a signal to search. Accept vague details for dates ("tomorrow"), times ("evening"), and locations ("nearby"). Do not ask for more information if you have even a slight clue.

Prioritize Searching Over Questioning: Your default action is to search for sessions. Avoid asking clarifying questions. For example, if a user says "I want to play padel in Kedoya," immediately prepare to search for venues in Kedoya. Do not ask "What time?"

Promote What's Available: If the user's request doesn't have an exact match, enthusiastically present the closest available options. Highlight the benefits of what you find, just like a sales agent would.

Assume Readiness: Set "isComplete": true and "readyForToolbox": true in your output if the user expresses any interest in playing. Your goal is to move the process forward to the search step.

Output Format: You MUST respond ONLY with a JSON object. Do not include any text before or after the JSON.

[T] Template: Your JSON Output Structure
Provide your response in this exact JSON format. The toolboxParams should be filled with any information you've gathered, however minimal.
JSON:
{
  "intent": "find_venue|find_players|join_session|create_session|general_inquiry",
  "confidence": 0.8,
  "extractedInfo": {"date": "tomorrow", "location": "kedoya", "time": "flexible"},
  "accumulatedInfo": {},
  "missingInfo": [],
  "isComplete": true,
  "needsMoreInfo": false,
  "nextQuestion": "",
  "readyForToolbox": true,
  "toolboxAction": "findVenues",
  "toolboxParams": {"date": "tomorrow", "location": "kedoya"}
}`

  /**
   * Analyze user intent and extract information
   */
  static async analyzeUserIntent(message: string): Promise<IntentAnalysis> {
    const startTime = Date.now()
    
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
      const duration = Date.now() - startTime
      
      AIFlowLogger.logLogicProcessing('INTENT_ANALYSIS', { message }, response, duration)

      return {
        intent: response.intent || 'general_inquiry',
        confidence: response.confidence || 0.5,
        extractedInfo: response.extractedInfo || {},
        missingInfo: response.missingInfo || [],
        isComplete: response.isComplete || false
      }

    } catch (error) {
      console.error('❌ AI Logic Intent Analysis Error:', error)
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
    const startTime = Date.now()

    try {
      // Check if this is a completely new intent/question
      const isNewIntent = this.detectNewIntent(message)
      if (isNewIntent) {
        console.log('🔄 Detected new intent, resetting conversation context')
        this.accumulatedInfo = {} // Reset accumulated info for new conversation
        this.conversationHistory = [] // Reset history for fresh start
      }

      // Update accumulated info with new message
      this.conversationHistory.push({ role: 'user', content: message })

      AIFlowLogger.logConversationContext({
        conversationTurns: this.conversationHistory,
        currentIntent: 'gathering_info',
        gatheredInfo: this.accumulatedInfo,
        missingInfo: []
      })
      
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

      // Save conversation state to localStorage
      this.saveConversationState()

      const duration = Date.now() - startTime
      AIFlowLogger.logLogicProcessing('INFO_GATHERING', { message, previousInfo: this.accumulatedInfo }, {
        gatheredInfo: this.accumulatedInfo,
        missingInfo: response.missingInfo || [],
        needsMoreInfo: response.needsMoreInfo,
        readyForToolbox: response.readyForToolbox
      }, duration)

      // SALES AGENT LOGIC: Always eager to show options!
      const hasMinimumInfo = this.hasMinimumRequiredInfo(response.intent || 'find_venue', this.accumulatedInfo)

      // SALES APPROACH: Prefer showing options over asking questions
      const shouldProceedToToolbox = response.readyForToolbox !== false && (hasMinimumInfo || response.readyForToolbox === true)
      const needsMoreInfo = response.needsMoreInfo === true && !shouldProceedToToolbox && response.readyForToolbox !== true

      // ENTHUSIASTIC SALES AGENT: Almost always ready to show great options!
      return {
        needsMoreInfo: false, // Prefer showing options over asking questions
        nextQuestion: needsMoreInfo ? (response.nextQuestion || 'Let me show you some great padel options!') : '',
        accumulatedInfo: this.accumulatedInfo,
        readyForToolbox: true, // Almost always ready to search and show options
        toolboxAction: response.toolboxAction || this.getDefaultToolboxAction(response.intent || 'find_venue'),
        toolboxParams: response.toolboxParams || this.buildToolboxParams(this.accumulatedInfo)
      }

    } catch (error) {
      console.error('❌ AI Logic Info Gathering Error:', error)
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
      AIFlowLogger.logAICommunication('Logic', 'Presenter', logicAnalysis, presenterResponse)

      return {
        findings,
        recommendedPresentation: (presenterResponse.format as 'text' | 'mixed' | 'cards') || 'mixed',
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
    const startTime = Date.now()
    
    try {
      let results: any
      
      switch (action) {
        case 'findVenues':
          results = await MatchmakingToolboxService.getAvailableVenues(params)
          break
        case 'findPlayers':
          results = await MatchmakingToolboxService.getAvailablePlayers(params)
          break
        case 'findSessions':
          results = await MatchmakingToolboxService.findOpenSessions(params)
          break
        default:
          results = { error: 'Unknown toolbox action' }
      }

      const duration = Date.now() - startTime
      AIFlowLogger.logLogicProcessing('TOOLBOX_EXECUTION', { action, params }, {
        toolUsed: action,
        query: params,
        results: results
      }, duration)
      
      AIFlowLogger.logDatabaseQuery(params, results, duration)
      return results

    } catch (error) {
      console.error('❌ AI Logic Toolbox Error:', error)
      return { error: 'Toolbox execution failed' }
    }
  }

  /**
   * Reset conversation state
   */
  static resetConversation(): void {
    this.conversationHistory = []
    this.accumulatedInfo = {}

    // Clear localStorage
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear conversation state from localStorage:', error)
    }

    // Reset AI Presenter context too
    import('./aiPresenterService').then(({ AIPresenterService }) => {
      AIPresenterService.resetConversation()
    })
  }

  /**
   * Save conversation state to localStorage
   */
  private static saveConversationState(): void {
    try {
      const data = {
        history: this.conversationHistory,
        accumulated: this.accumulatedInfo,
        timestamp: Date.now()
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save conversation state to localStorage:', error)
    }
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

  /**
   * Check if we have minimum required information for a given intent
   * SALES AGENT APPROACH: Be very flexible and ready to show options!
   */
  private static hasMinimumRequiredInfo(intent: string, info: Record<string, any>): boolean {
    // SALES AGENT RULE: If user shows ANY interest in padel, we're ready to show options!

    // Check if user has expressed any padel-related interest
    const hasAnyPadelInterest = !!(
      info.date || info.day || info.time || info.timePreference ||
      info.location || info.area || info.city ||
      info.morning || info.evening || info.afternoon ||
      info.skill || info.skillLevel || info.players ||
      intent !== 'general_inquiry'
    )

    // FLEXIBLE APPROACH: Almost always ready to search and show options
    switch (intent) {
      case 'find_venue':
        // Show venues if we have ANY preference - date, location, or time
        return hasAnyPadelInterest

      case 'find_players':
        // Show players if user wants to play - very flexible
        return hasAnyPadelInterest

      case 'join_session':
        // Show sessions if user wants to join - be encouraging
        return hasAnyPadelInterest

      case 'create_session':
        // Show venues where they can create sessions
        return hasAnyPadelInterest

      case 'general_inquiry':
        // Even general inquiries can show popular sessions
        return true

      default:
        // When in doubt, show options!
        return true
    }
  }

  /**
   * Get default toolbox action for intent
   */
  private static getDefaultToolboxAction(intent: string): string {
    switch (intent) {
      case 'find_venue':
        return 'findVenues'
      case 'find_players':
        return 'findPlayers'
      case 'join_session':
        return 'findSessions'
      case 'create_session':
        return 'findVenues' // Find venues where they can create sessions
      default:
        return 'findVenues'
    }
  }

  /**
   * Build toolbox parameters from accumulated info
   * CONSISTENCY APPROACH: Ensure consistent parameters for identical queries
   */
  private static buildToolboxParams(info: Record<string, any>): any {
    // CONSISTENCY FIX: Always provide consistent default parameters
    const consistentParams = {
      // Date: Consistent default
      date: info.date || info.day || 'today',

      // Time: Consistent time handling
      time: info.time || info.timePreference || info.morning || info.evening || info.afternoon || 'any',

      // Location: Consistent location defaults (avoid "nearby" without context)
      location: info.location || info.area || info.city || 'jakarta',

      // Skill: Consistent skill level
      skillLevel: info.skillLevel || info.skill || 'all_levels',

      // Players: Consistent player count
      players: info.players || info.playerCount || 'any',

      // CONSISTENCY RULE: Always include these for predictable results
      includeAlternatives: true,
      strictMatching: false
    }

    console.log('🔧 Building consistent toolbox params:', JSON.stringify(consistentParams))
    return consistentParams
  }

  /**
   * Detect if user is asking a completely new question/intent or updating preferences
   * SMART INTENT APPROACH: User-centric conversation flow management
   */
  private static detectNewIntent(message: string): boolean {
    const lowerMessage = message.toLowerCase()

    // If conversation history is empty, it's always a new intent
    if (this.conversationHistory.length === 0) {
      return true
    }

    // CONSISTENCY: Don't reset context for repeated identical questions
    const lastUserMessage = this.conversationHistory
      .filter(msg => msg.role === 'user')
      .pop()?.content?.toLowerCase()

    if (lastUserMessage && lastUserMessage === lowerMessage) {
      console.log('🔄 Identical question detected, maintaining context for consistency')
      return false // Keep existing context for consistent responses
    }

    // EXPLICIT RESET: Only for clear conversation restart signals
    const explicitResetKeywords = [
      'never mind', 'forget that', 'start over', 'new search',
      'different sport', 'not padel', 'cancel',
      'let me try again'
    ]

    const isExplicitReset = explicitResetKeywords.some(keyword =>
      lowerMessage.includes(keyword)
    )

    // PARAMETER REFINEMENT: Natural conversation flow with parameter updates
    const refinementKeywords = [
      'what about', 'how about', 'show me', 'try', 'maybe',
      'but', 'however', 'or', 'alternatively', 'actually', 'instead',
      'different location', 'different time', 'another area', 'another location',
      'closer', 'further', 'earlier', 'later', 'in kemang', 'in jakarta',
      'give me another', 'show me something else'
    ]

    const isRefinement = refinementKeywords.some(keyword =>
      lowerMessage.includes(keyword)
    )

    if (isRefinement) {
      console.log('🔄 Parameter refinement detected, updating search criteria without full reset')
      return false // Keep context but allow preference updates
    }

    // SMART RULE: Only reset for explicit restart signals
    return isExplicitReset
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