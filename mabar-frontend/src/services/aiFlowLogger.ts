/**
 * Simplified AI Flow Logger - Only logs essential AI interaction
 */

export class AIFlowLogger {
  private static sessionActive = false

  /**
   * Start a new AI flow logging session
   */
  static startSession(userInput: string): string {
    const sessionId = `ai-${Date.now()}`
    this.sessionActive = true
    
    console.log(`\n🔵 USER INPUT: ${userInput}`)
    
    return sessionId
  }

  /**
   * Log AI API call with message contents and URL
   */
  static logAICall(conversationContents: any[], model: string): void {
    if (!this.sessionActive) return
    console.log(`🤖 CALLING AI API:`) 
    console.log(`  URL: https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`)
    console.log(`  Messages (${conversationContents.length}):`) 
    conversationContents.forEach((msg, index) => {
      const text = msg.parts?.[0]?.text || 'No text content'
      const truncatedText = text.length > 100 ? text.substring(0, 100) + '...' : text
      console.log(`    ${index + 1}. [${msg.role}]: ${truncatedText}`)
    })
  }

  /**
   * Log AI response
   */
  static logAIResponse(response: string): void {
    if (!this.sessionActive) return
    console.log(`✅ AI RESPONSE: ${response}`)
  }

  /**
   * End session
   */
  static endSession(): null {
    if (!this.sessionActive) return null
    this.sessionActive = false
    console.log(`\n`)
    return null
  }

  /**
   * Log error
   */
  static logError(step: string, error: any, context?: any): void {
    if (!this.sessionActive) return
    console.error(`❌ ERROR in ${step}:`, error.message || error)
  }

  // Stub methods for compatibility
  static logStep(): void {}
  static startStepTimer(): void {}
  static endStepTimer(): number { return 0 }
  static logUserPreferences(): void {}
  static logAIThinking(): void {}
  static logParsedAIRequest(): void {}
  static logAIDecision(): void {}
  static logToolboxExecution(): void {}
  static logFinalResponse(): void {}
}