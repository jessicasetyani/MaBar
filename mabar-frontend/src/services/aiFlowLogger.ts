/**
 * AI Flow Logger - Complete conversation and processing flow tracking
 */

export interface LogEntry {
  timestamp: string
  step: string
  service: 'Coordinator' | 'Logic' | 'Presenter' | 'Database'
  action: string
  input?: any
  output?: any
  duration?: number
}

export class AIFlowLogger {
  private static logs: LogEntry[] = []
  private static stepCounter = 0

  /**
   * Clear all logs for new conversation
   */
  static clearLogs(): void {
    this.logs = []
    this.stepCounter = 0
    console.log('\n🧹 === NEW CONVERSATION STARTED ===\n')
  }

  /**
   * Log user input
   */
  static logUserInput(input: string): void {
    this.stepCounter++
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      step: `${this.stepCounter}`,
      service: 'Coordinator',
      action: 'USER_INPUT',
      input: input
    }
    this.logs.push(entry)
    console.log(`📝 [${entry.step}] USER INPUT: "${input}"`)
  }

  /**
   * Log AI Logic processing
   */
  static logLogicProcessing(action: string, input: any, output: any, duration?: number): void {
    this.stepCounter++
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      step: `${this.stepCounter}`,
      service: 'Logic',
      action,
      input,
      output,
      duration
    }
    this.logs.push(entry)
    
    console.log(`🧠 [${entry.step}] AI LOGIC - ${action}`)
    if (action === 'INTENT_ANALYSIS') {
      console.log(`   Intent: ${output.intent}`)
      console.log(`   Confidence: ${output.confidence}`)
      console.log(`   Needs more info: ${output.needsMoreInfo}`)
    } else if (action === 'INFO_GATHERING') {
      console.log(`   Gathered info:`, JSON.stringify(output.gatheredInfo, null, 2))
      console.log(`   Missing info: ${output.missingInfo.join(', ')}`)
    } else if (action === 'TOOLBOX_EXECUTION') {
      console.log(`   Tool used: ${output.toolUsed}`)
      console.log(`   Query: ${JSON.stringify(output.query)}`)
      // Handle toolbox response structure: {data: [], isEmpty: boolean}
      const resultCount = output.results?.data?.length || output.results?.length || 0
      console.log(`   Results: ${resultCount} items`)
    }
    if (duration) console.log(`   Duration: ${duration}ms`)
  }

  /**
   * Log database queries
   */
  static logDatabaseQuery(query: any, results: any, duration?: number): void {
    this.stepCounter++
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      step: `${this.stepCounter}`,
      service: 'Database',
      action: 'QUERY',
      input: query,
      output: results,
      duration
    }
    this.logs.push(entry)
    
    console.log(`💾 [${entry.step}] DATABASE QUERY`)
    console.log(`   Query:`, JSON.stringify(query, null, 2))
    // Handle toolbox response structure: {data: [], isEmpty: boolean}
    const resultCount = results?.data?.length || results?.length || 0
    console.log(`   Results: ${resultCount} items found`)
    const dataArray = results?.data || results
    if (dataArray?.length > 0) {
      console.log(`   Sample result:`, JSON.stringify(dataArray[0], null, 2))
    }
    if (duration) console.log(`   Duration: ${duration}ms`)
  }

  /**
   * Log AI communication between Logic and Presenter
   */
  static logAICommunication(from: string, to: string, message: any, response: any): void {
    this.stepCounter++
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      step: `${this.stepCounter}`,
      service: from === 'Logic' ? 'Logic' : 'Presenter',
      action: `COMMUNICATE_WITH_${to.toUpperCase()}`,
      input: message,
      output: response
    }
    this.logs.push(entry)
    
    console.log(`🤝 [${entry.step}] AI COMMUNICATION: ${from} → ${to}`)
    console.log(`   Message:`, JSON.stringify(message, null, 2))
    console.log(`   Response:`, JSON.stringify(response, null, 2))
  }

  /**
   * Log AI Presenter processing
   */
  static logPresenterProcessing(action: string, input: any, output: any, duration?: number): void {
    this.stepCounter++
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      step: `${this.stepCounter}`,
      service: 'Presenter',
      action,
      input,
      output,
      duration
    }
    this.logs.push(entry)

    console.log(`🎨 [${entry.step}] AI PRESENTER - ${action}`)
    if (action === 'FORMAT_RESPONSE') {
      console.log(`   Response text: "${output.text?.substring(0, 100)}..."`)
      console.log(`   Cards generated: ${output.sessionCards?.length || 0}`)
      console.log(`   Needs more info: ${output.needsMoreInfo}`)
    } else if (action === 'UX_STRATEGY') {
      console.log(`   Recommended format: ${output.recommendedPresentation}`)
      console.log(`   Reasoning: ${output.reasoning}`)
    }
    if (duration) console.log(`   Duration: ${duration}ms`)
  }

  /**
   * Log errors with context
   */
  static logError(context: string, error: Error, additionalData?: any): void {
    this.stepCounter++
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      step: `${this.stepCounter}`,
      service: 'Coordinator',
      action: 'ERROR',
      input: { context, additionalData },
      output: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    }
    this.logs.push(entry)

    console.error(`❌ [${entry.step}] ERROR in ${context}:`, error.message)
    if (additionalData) {
      console.error(`   Additional data:`, JSON.stringify(additionalData, null, 2))
    }
    if (error.stack) {
      console.error(`   Stack trace:`, error.stack)
    }
  }

  /**
   * Log AI thinking processes and decisions
   */
  static logAIThinking(response: any, context?: any): void {
    this.stepCounter++
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      step: `${this.stepCounter}`,
      service: context?.service || 'Logic',
      action: 'AI_THINKING',
      input: context,
      output: response
    }
    this.logs.push(entry)

    console.log(`🤔 [${entry.step}] AI THINKING - ${context?.method || 'processing'}`)
    if (context?.uxDecision) {
      console.log(`   UX Decision: ${context.uxDecision}`)
    }
    if (response.reasoning) {
      console.log(`   Reasoning: ${response.reasoning}`)
    }
    if (response.confidence) {
      console.log(`   Confidence: ${response.confidence}`)
    }
  }

  /**
   * Log final response to user
   */
  static logFinalResponse(response: any, totalDuration?: number): void {
    this.stepCounter++
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      step: `${this.stepCounter}`,
      service: 'Coordinator',
      action: 'FINAL_RESPONSE',
      output: response,
      duration: totalDuration
    }
    this.logs.push(entry)
    
    console.log(`✅ [${entry.step}] FINAL RESPONSE TO USER`)
    console.log(`   Text: "${response.text}"`)
    console.log(`   Cards: ${response.sessionCards?.length || 0}`)
    console.log(`   Needs more info: ${response.needsMoreInfo}`)
    if (totalDuration) console.log(`   Total processing time: ${totalDuration}ms`)
    console.log('\n' + '='.repeat(80) + '\n')
  }

  /**
   * Log conversation context
   */
  static logConversationContext(context: any): void {
    console.log(`📚 CONVERSATION CONTEXT:`)
    console.log(`   Turn: ${context.conversationTurns?.length || 0}`)
    console.log(`   Current intent: ${context.currentIntent}`)
    console.log(`   Gathered info:`, JSON.stringify(context.gatheredInfo, null, 2))
    console.log(`   Missing info: ${context.missingInfo?.join(', ') || 'none'}`)
  }

  /**
   * Get all logs for debugging
   */
  static getAllLogs(): LogEntry[] {
    return [...this.logs]
  }

  /**
   * Print summary of conversation flow
   */
  static printFlowSummary(): void {
    console.log('\n📊 CONVERSATION FLOW SUMMARY')
    console.log('='.repeat(50))
    
    const serviceStats = this.logs.reduce((acc, log) => {
      acc[log.service] = (acc[log.service] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.log('Service usage:')
    Object.entries(serviceStats).forEach(([service, count]) => {
      console.log(`  ${service}: ${count} operations`)
    })
    
    const totalDuration = this.logs
      .filter(log => log.duration)
      .reduce((sum, log) => sum + (log.duration || 0), 0)
    
    console.log(`Total processing time: ${totalDuration}ms`)
    console.log(`Total steps: ${this.logs.length}`)
    console.log('='.repeat(50))
  }

  /**
   * Export logs as JSON for analysis
   */
  static exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}