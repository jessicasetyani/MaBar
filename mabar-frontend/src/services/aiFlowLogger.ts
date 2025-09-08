/**
 * AI Flow Logger - Comprehensive logging system for tracking AI matchmaking logic
 * This service provides detailed logging for Step 1: Gathering information from user
 */

export interface LogEntry {
  timestamp: string
  step: string
  type: 'input' | 'processing' | 'output' | 'error' | 'decision'
  data: any
  metadata?: {
    duration?: number
    success?: boolean
    errorDetails?: string
  }
}

export interface AIFlowLog {
  sessionId: string
  userInput: string
  startTime: string
  endTime?: string
  totalDuration?: number
  steps: LogEntry[]
  finalResult?: any
  success: boolean
}

export class AIFlowLogger {
  private static currentLog: AIFlowLog | null = null
  private static stepStartTime: number = 0

  /**
   * Start a new AI flow logging session
   */
  static startSession(userInput: string): string {
    const sessionId = `ai-flow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    this.currentLog = {
      sessionId,
      userInput,
      startTime: new Date().toISOString(),
      steps: [],
      success: false
    }

    this.logStep('session-start', 'input', {
      userInput,
      sessionId,
      message: '🚀 Starting AI matchmaking flow session'
    })

    console.log(`🚀 === AI FLOW SESSION STARTED ===`)
    console.log(`📋 Session ID: ${sessionId}`)
    console.log(`📝 User Input: "${userInput}"`)
    console.log(`⏰ Start Time: ${this.currentLog.startTime}`)
    
    return sessionId
  }

  /**
   * Log a step in the AI flow
   */
  static logStep(step: string, type: LogEntry['type'], data: any, metadata?: LogEntry['metadata']): void {
    if (!this.currentLog) {
      console.warn('⚠️ No active logging session')
      return
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      step,
      type,
      data,
      metadata
    }

    this.currentLog.steps.push(logEntry)

    // Console logging with emojis for better visibility
    const emoji = this.getStepEmoji(step, type)
    console.log(`${emoji} [${step.toUpperCase()}] ${type.toUpperCase()}:`, data)
    
    if (metadata) {
      console.log(`   📊 Metadata:`, metadata)
    }
  }

  /**
   * Start timing a step
   */
  static startStepTimer(): void {
    this.stepStartTime = performance.now()
  }

  /**
   * End timing a step and return duration
   */
  static endStepTimer(): number {
    return performance.now() - this.stepStartTime
  }

  /**
   * Log AI thinking process
   */
  static logAIThinking(thinking: {
    userIntent?: string
    extractedParameters?: any
    missingInfo?: string[]
    confidence?: number
    reasoning?: string
  }): void {
    this.logStep('ai-thinking', 'processing', {
      thinking,
      message: '🧠 AI analyzing user input and determining intent'
    })

    console.log(`🧠 === AI THINKING PROCESS ===`)
    if (thinking.userIntent) {
      console.log(`🎯 Detected Intent: ${thinking.userIntent}`)
    }
    if (thinking.extractedParameters) {
      console.log(`📊 Extracted Parameters:`, thinking.extractedParameters)
    }
    if (thinking.missingInfo && thinking.missingInfo.length > 0) {
      console.log(`❓ Missing Information:`, thinking.missingInfo)
    }
    if (thinking.confidence !== undefined) {
      console.log(`📈 Confidence Level: ${thinking.confidence}%`)
    }
    if (thinking.reasoning) {
      console.log(`💭 AI Reasoning: ${thinking.reasoning}`)
    }
  }

  /**
   * Log AI decision making
   */
  static logAIDecision(decision: {
    action: string
    parameters: any
    reasoning: string
    alternatives?: string[]
  }): void {
    this.logStep('ai-decision', 'decision', {
      decision,
      message: '🎯 AI made decision on action to take'
    })

    console.log(`🎯 === AI DECISION ===`)
    console.log(`⚡ Chosen Action: ${decision.action}`)
    console.log(`📋 Parameters:`, decision.parameters)
    console.log(`💭 Reasoning: ${decision.reasoning}`)
    if (decision.alternatives && decision.alternatives.length > 0) {
      console.log(`🔄 Alternatives Considered:`, decision.alternatives)
    }
  }

  /**
   * Log user preferences loading
   */
  static logUserPreferences(preferences: any, source: 'profile' | 'none' | 'error'): void {
    this.logStep('user-preferences', 'processing', {
      preferences,
      source,
      message: `👤 Loading user preferences from ${source}`
    })

    console.log(`👤 === USER PREFERENCES ===`)
    console.log(`📍 Source: ${source}`)
    if (preferences) {
      console.log(`📊 Preferences:`, preferences)
    } else {
      console.log(`❌ No preferences available`)
    }
  }

  /**
   * Log raw AI response
   */
  static logRawAIResponse(response: string, processingTime: number): void {
    this.logStep('ai-raw-response', 'output', {
      rawResponse: response,
      processingTime,
      message: '🤖 Raw AI response received'
    }, {
      duration: processingTime,
      success: true
    })

    console.log(`🤖 === RAW AI RESPONSE ===`)
    console.log(`⏱️ Processing Time: ${processingTime.toFixed(2)}ms`)
    console.log(`📝 Raw Response:`)
    console.log(response)
  }

  /**
   * Log parsed AI request
   */
  static logParsedAIRequest(aiRequest: any, parseSuccess: boolean, parseError?: string): void {
    this.logStep('ai-request-parsing', 'processing', {
      aiRequest,
      parseSuccess,
      parseError,
      message: '🔧 Parsing AI response into structured request'
    }, {
      success: parseSuccess,
      errorDetails: parseError
    })

    console.log(`🔧 === AI REQUEST PARSING ===`)
    if (parseSuccess) {
      console.log(`✅ Parse Success`)
      console.log(`📊 Parsed Request:`, aiRequest)
    } else {
      console.log(`❌ Parse Failed: ${parseError}`)
    }
  }

  /**
   * Log toolbox action execution
   */
  static logToolboxExecution(action: string, parameters: any, startTime: number): void {
    const duration = performance.now() - startTime
    
    this.logStep('toolbox-execution', 'processing', {
      action,
      parameters,
      duration,
      message: `🔧 Executing toolbox action: ${action}`
    }, {
      duration,
      success: true
    })

    console.log(`🔧 === TOOLBOX EXECUTION ===`)
    console.log(`⚡ Action: ${action}`)
    console.log(`📋 Parameters:`, parameters)
    console.log(`⏱️ Execution Time: ${duration.toFixed(2)}ms`)
  }

  /**
   * Log database query
   */
  static logDatabaseQuery(queryType: string, filters: any, results: any, queryTime: number): void {
    this.logStep('database-query', 'processing', {
      queryType,
      filters,
      resultCount: Array.isArray(results) ? results.length : 1,
      queryTime,
      message: `🗄️ Database query: ${queryType}`
    }, {
      duration: queryTime,
      success: true
    })

    console.log(`🗄️ === DATABASE QUERY ===`)
    console.log(`📊 Query Type: ${queryType}`)
    console.log(`🔍 Filters:`, filters)
    console.log(`📈 Results Count: ${Array.isArray(results) ? results.length : 1}`)
    console.log(`⏱️ Query Time: ${queryTime.toFixed(2)}ms`)
  }

  /**
   * Log final response generation
   */
  static logFinalResponse(response: any, sessionSuccess: boolean): void {
    if (!this.currentLog) return

    this.currentLog.endTime = new Date().toISOString()
    this.currentLog.totalDuration = new Date(this.currentLog.endTime).getTime() - new Date(this.currentLog.startTime).getTime()
    this.currentLog.finalResult = response
    this.currentLog.success = sessionSuccess

    this.logStep('final-response', 'output', {
      response,
      sessionSuccess,
      totalDuration: this.currentLog.totalDuration,
      message: '🏁 Final response generated'
    }, {
      duration: this.currentLog.totalDuration,
      success: sessionSuccess
    })

    console.log(`🏁 === FINAL RESPONSE ===`)
    console.log(`✅ Session Success: ${sessionSuccess}`)
    console.log(`⏱️ Total Duration: ${this.currentLog.totalDuration}ms`)
    console.log(`📝 Response Text: "${response.text}"`)
    console.log(`🎴 Session Cards: ${response.sessionCards?.length || 0}`)
    console.log(`❓ Needs More Info: ${response.needsMoreInfo || false}`)
  }

  /**
   * Log error
   */
  static logError(step: string, error: any, context?: any): void {
    this.logStep(step, 'error', {
      error: error.message || error,
      stack: error.stack,
      context,
      message: `❌ Error in ${step}`
    }, {
      success: false,
      errorDetails: error.message || String(error)
    })

    console.error(`❌ === ERROR IN ${step.toUpperCase()} ===`)
    console.error(`💥 Error:`, error)
    if (context) {
      console.error(`📋 Context:`, context)
    }
  }

  /**
   * End the current session and return the complete log
   */
  static endSession(): AIFlowLog | null {
    if (!this.currentLog) {
      console.warn('⚠️ No active session to end')
      return null
    }

    const completedLog = { ...this.currentLog }
    
    console.log(`🏁 === AI FLOW SESSION ENDED ===`)
    console.log(`📋 Session ID: ${completedLog.sessionId}`)
    console.log(`⏱️ Total Duration: ${completedLog.totalDuration}ms`)
    console.log(`✅ Success: ${completedLog.success}`)
    console.log(`📊 Total Steps: ${completedLog.steps.length}`)
    
    // Reset current log
    this.currentLog = null
    
    return completedLog
  }

  /**
   * Get the current session log (for debugging)
   */
  static getCurrentLog(): AIFlowLog | null {
    return this.currentLog
  }

  /**
   * Export log as JSON for analysis
   */
  static exportLog(log?: AIFlowLog): string {
    const logToExport = log || this.currentLog
    if (!logToExport) {
      return JSON.stringify({ error: 'No log available' }, null, 2)
    }
    
    return JSON.stringify(logToExport, null, 2)
  }

  /**
   * Get emoji for step visualization
   */
  private static getStepEmoji(step: string, type: LogEntry['type']): string {
    const stepEmojis: Record<string, string> = {
      'session-start': '🚀',
      'user-preferences': '👤',
      'ai-thinking': '🧠',
      'ai-decision': '🎯',
      'ai-raw-response': '🤖',
      'ai-request-parsing': '🔧',
      'toolbox-execution': '⚡',
      'database-query': '🗄️',
      'final-response': '🏁'
    }

    const typeEmojis: Record<LogEntry['type'], string> = {
      'input': '📝',
      'processing': '⚙️',
      'output': '📤',
      'error': '❌',
      'decision': '🎯'
    }

    return stepEmojis[step] || typeEmojis[type] || '📋'
  }

  /**
   * Print a summary of the current session
   */
  static printSessionSummary(): void {
    if (!this.currentLog) {
      console.log('⚠️ No active session')
      return
    }

    console.log(`\n📊 === SESSION SUMMARY ===`)
    console.log(`📋 Session ID: ${this.currentLog.sessionId}`)
    console.log(`📝 User Input: "${this.currentLog.userInput}"`)
    console.log(`⏰ Start Time: ${this.currentLog.startTime}`)
    console.log(`📈 Steps Completed: ${this.currentLog.steps.length}`)
    
    const stepTypes = this.currentLog.steps.reduce((acc, step) => {
      acc[step.type] = (acc[step.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.log(`📊 Step Types:`, stepTypes)
    
    const errors = this.currentLog.steps.filter(step => step.type === 'error')
    if (errors.length > 0) {
      console.log(`❌ Errors: ${errors.length}`)
    }
  }
}