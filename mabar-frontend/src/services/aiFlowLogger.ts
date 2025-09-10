export interface AIFlowLog {
  sessionId: string
  timestamp: Date
  type: 'user-input' | 'ai-thinking' | 'toolbox-request' | 'toolbox-response' | 'ai-presentation' | 'final-response'
  data: any
  metadata?: any
}

export class AIFlowLogger {
  private static logs: AIFlowLog[] = []
  private static currentSessionId: string | null = null

  static startSession(userInput: string): string {
    this.currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    this.log('user-input', {
      message: userInput,
      sessionStart: true
    })

    console.log(`🚀 [AI FLOW] Starting session: ${this.currentSessionId}`)
    console.log(`👤 [USER → AI] "${userInput}"`)
    
    return this.currentSessionId
  }

  static logAIThinking(decision: any, context: any): void {
    this.log('ai-thinking', {
      decision,
      context,
      reasoning: decision.reasoning || 'AI processing user request'
    })

    console.log(`🧠 [AI THINKING] Mode: ${decision.mode || 'processing'}`)
    console.log(`🧠 [AI THINKING] Reasoning: ${decision.reasoning || 'Analyzing user input'}`)
    if (decision.accumulatedInfo && Object.keys(decision.accumulatedInfo).length > 0) {
      console.log(`🧠 [AI THINKING] Extracted info: ${JSON.stringify(decision.accumulatedInfo)}`)
    }
    if (decision.toolboxAction) {
      console.log(`🧠 [AI THINKING] Will search: ${decision.toolboxAction}`)
    } else {
      console.log(`🧠 [AI THINKING] Will respond conversationally`)
    }
  }

  static logToolboxRequest(action: string, parameters: any): void {
    this.log('toolbox-request', {
      action,
      parameters
    })

    console.log(`🔧 [AI → TOOLBOX] Requesting: ${action}`)
    console.log(`🔧 [AI → TOOLBOX] Parameters: ${JSON.stringify(parameters)}`)
  }

  static logToolboxResponse(action: string, response: any): void {
    this.log('toolbox-response', {
      action,
      response,
      resultCount: response.totalResults || response.venues?.length || response.players?.length || 0
    })

    const resultCount = response.totalResults || response.venues?.length || response.players?.length || 0
    console.log(`🔧 [TOOLBOX → AI] ${action} completed: ${resultCount} results`)
    if (response.error) {
      console.log(`🔧 [TOOLBOX → AI] Error: ${response.error}`)
    }
  }

  static logAIPresentation(presentationDecision: any, finalResponse: any): void {
    this.log('ai-presentation', {
      presentationDecision,
      finalResponse,
      cardCount: finalResponse.sessionCards?.length || 0
    })

    console.log(`🎨 [AI PRESENTATION] Decision: ${presentationDecision.mode || 'format_response'}`)
    console.log(`🎨 [AI PRESENTATION] Cards generated: ${finalResponse.sessionCards?.length || 0}`)
    console.log(`🎨 [AI PRESENTATION] Message: "${finalResponse.text?.substring(0, 100)}..."`)
  }

  static logFinalResponse(response: any): void {
    this.log('final-response', {
      response,
      hasText: !!response.text,
      hasCards: !!(response.sessionCards && response.sessionCards.length > 0),
      needsMoreInfo: response.needsMoreInfo
    })

    console.log(`🎯 [AI → USER] Response ready`)
    console.log(`🎯 [AI → USER] Text: ${response.text ? 'Yes' : 'No'}`)
    console.log(`🎯 [AI → USER] Cards: ${response.sessionCards?.length || 0}`)
    console.log(`🎯 [AI → USER] Needs more info: ${response.needsMoreInfo || false}`)
  }

  static endSession(): void {
    if (this.currentSessionId) {
      console.log(`✅ [AI FLOW] Session completed: ${this.currentSessionId}`)
      console.log(`📊 [AI FLOW] Total logs: ${this.logs.filter(l => l.sessionId === this.currentSessionId).length}`)
      this.currentSessionId = null
    }
  }

  static logError(phase: string, error: any, context?: any): void {
    this.log('ai-thinking', {
      error: true,
      phase,
      errorMessage: error.message,
      context
    })

    console.error(`❌ [AI ERROR] Phase: ${phase}`)
    console.error(`❌ [AI ERROR] Message: ${error.message}`)
  }

  private static log(type: AIFlowLog['type'], data: any, metadata?: any): void {
    if (!this.currentSessionId) return

    this.logs.push({
      sessionId: this.currentSessionId,
      timestamp: new Date(),
      type,
      data,
      metadata
    })

    // Keep only last 100 logs for performance
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100)
    }
  }

  static getSessionLogs(sessionId?: string): AIFlowLog[] {
    const targetSession = sessionId || this.currentSessionId
    if (!targetSession) return []
    
    return this.logs.filter(log => log.sessionId === targetSession)
  }

  static getAllLogs(): AIFlowLog[] {
    return [...this.logs]
  }

  static clearLogs(): void {
    this.logs = []
    console.log('🧹 [AI FLOW] Logs cleared')
  }
}