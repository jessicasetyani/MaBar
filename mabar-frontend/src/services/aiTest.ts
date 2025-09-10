/**
 * Single AI Test Suite
 */

import { AICoordinatorService } from './aiCoordinatorService'
import { EnhancedAICommunication } from './enhancedAICommunication'
import { AIFlowLogger } from './aiFlowLogger'

export class AITest {

  static async runTest(input: string): Promise<void> {
    console.clear()
    console.log(`🧪 Testing: "${input}"`)
    console.log('=' .repeat(50))
    
    AICoordinatorService.resetConversation()
    const startTime = Date.now()
    
    const response = await AICoordinatorService.processUserInput(input)
    const duration = Date.now() - startTime
    
    const stats = EnhancedAICommunication.getNegotiationStats()
    
    console.log(`Response: "${response.text}"`)
    console.log(`Duration: ${duration}ms`)
    console.log(`Negotiation rounds: ${stats.totalRounds}`)
    console.log(`Cards: ${response.sessionCards?.length || 0}`)
    
    AIFlowLogger.printFlowSummary()
  }

  static async runAllTests(): Promise<void> {
    const tests = [
      "Find court in Kedoya tomorrow 7pm",
      "I want to play padel tomorrow", 
      "Find me a court tomorrow, then help me invite players",
      "Show me my past bookings"
    ]

    for (const test of tests) {
      await this.runTest(test)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  static showMenu(): void {
    console.clear()
    console.log('🧪 AI Test Menu')
    console.log('=' .repeat(30))
    console.log('AITest.runTest("Find court in Kedoya tomorrow 7pm")')
    console.log('AITest.runAllTests()')
  }
}

(window as any).AITest = AITest
AITest.showMenu()