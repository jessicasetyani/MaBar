/**
 * Real AI Test - Complex Scenario Handling with Back4App
 * One-by-one testing for real scenarios
 */

import { AICoordinatorService } from './aiCoordinatorService'
import { EnhancedAICommunication } from './enhancedAICommunication'
import { AIFlowLogger } from './aiFlowLogger'

export class RealAITest {

  /**
   * Test 1: Multi-step booking process
   */
  static async testMultiStepBooking(): Promise<void> {
    console.clear()
    console.log('🎯 Test 1: Multi-Step Booking')
    console.log('=' .repeat(50))
    
    AICoordinatorService.resetConversation()
    
    const input = "Find me a court tomorrow, then help me invite players"
    console.log(`Input: "${input}"`)
    
    const response = await AICoordinatorService.processUserInput(input)
    
    console.log(`Response: "${response.text}"`)
    console.log(`Cards: ${response.sessionCards?.length || 0}`)
    
    // Check AI negotiation
    const history = EnhancedAICommunication.getNegotiationHistory()
    console.log(`Negotiation rounds: ${history.length}`)
    
    AIFlowLogger.printFlowSummary()
  }

  /**
   * Test 2: Context switching mid-conversation
   */
  static async testContextSwitching(): Promise<void> {
    console.clear()
    console.log('🔄 Test 2: Context Switching')
    console.log('=' .repeat(50))
    
    AICoordinatorService.resetConversation()
    
    // First request
    console.log('Step 1: Initial request')
    const response1 = await AICoordinatorService.processUserInput("Find me a court tomorrow at 7pm")
    console.log(`Response 1: "${response1.text?.substring(0, 80)}..."`)
    
    // Context switch
    console.log('\nStep 2: Context switch')
    const response2 = await AICoordinatorService.processUserInput("Actually, change that to next week")
    console.log(`Response 2: "${response2.text?.substring(0, 80)}..."`)
    
    // Check if context was updated
    const conversationInfo = AICoordinatorService.getConversationInfo()
    console.log(`Conversation turns: ${conversationInfo.logicMessages}`)
    
    AIFlowLogger.printFlowSummary()
  }

  /**
   * Test 3: Ambiguous request handling
   */
  static async testAmbiguousRequest(): Promise<void> {
    console.clear()
    console.log('❓ Test 3: Ambiguous Request')
    console.log('=' .repeat(50))
    
    AICoordinatorService.resetConversation()
    
    const input = "Find me something good for padel"
    console.log(`Input: "${input}"`)
    
    const response = await AICoordinatorService.processUserInput(input)
    
    console.log(`Response: "${response.text}"`)
    console.log(`Needs more info: ${response.needsMoreInfo}`)
    
    // Check how AI handled ambiguity
    const history = EnhancedAICommunication.getNegotiationHistory()
    console.log(`AI negotiation rounds: ${history.length}`)
    
    if (history.length > 0) {
      console.log('AI Discussion:')
      history.forEach(round => {
        console.log(`  ${round.from}: ${round.message.reasoning}`)
        console.log(`  ${round.to}: ${round.response.reasoning}`)
      })
    }
    
    AIFlowLogger.printFlowSummary()
  }

  /**
   * Test 4: Error recovery - invalid time
   */
  static async testErrorRecovery(): Promise<void> {
    console.clear()
    console.log('🔧 Test 4: Error Recovery')
    console.log('=' .repeat(50))
    
    AICoordinatorService.resetConversation()
    
    const input = "Book me a court at 25:00 tomorrow"
    console.log(`Input: "${input}" (invalid time)`)
    
    const response = await AICoordinatorService.processUserInput(input)
    
    console.log(`Response: "${response.text}"`)
    
    // Check if AI Presenter caught the error
    const history = EnhancedAICommunication.getNegotiationHistory()
    console.log(`Error recovery negotiation: ${history.length > 0 ? 'Yes' : 'No'}`)
    
    if (history.length > 0) {
      console.log('Error Recovery Process:')
      history.forEach(round => {
        console.log(`  Round ${round.round}: ${round.from} → ${round.to}`)
        console.log(`    ${round.response.reasoning}`)
      })
    }
    
    AIFlowLogger.printFlowSummary()
  }

  /**
   * Test 5: Venue name recognition
   */
  static async testVenueNameRecognition(): Promise<void> {
    console.clear()
    console.log('🏟️ Test 5: Venue Name Recognition')
    console.log('=' .repeat(50))
    
    AICoordinatorService.resetConversation()
    
    const input = "Book me a court at Plaza Indonesia tomorrow"
    console.log(`Input: "${input}"`)
    
    const response = await AICoordinatorService.processUserInput(input)
    
    console.log(`Response: "${response.text}"`)
    console.log(`Found venue: ${response.sessionCards?.length > 0 ? 'Yes' : 'No'}`)
    
    AIFlowLogger.printFlowSummary()
  }

  /**
   * Test 6: Complete intent change
   */
  static async testIntentChange(): Promise<void> {
    console.clear()
    console.log('🔄 Test 6: Complete Intent Change')
    console.log('=' .repeat(50))
    
    AICoordinatorService.resetConversation()
    
    // Start with venue search
    console.log('Step 1: Venue search')
    const response1 = await AICoordinatorService.processUserInput("Find me a court in Kedoya")
    console.log(`Response 1: "${response1.text?.substring(0, 60)}..."`)
    
    // Change to booking history
    console.log('\nStep 2: Intent change to booking history')
    const response2 = await AICoordinatorService.processUserInput("Never mind, show me my booking history instead")
    console.log(`Response 2: "${response2.text?.substring(0, 60)}..."`)
    
    // Check if AI detected intent change
    const history = EnhancedAICommunication.getNegotiationHistory()
    console.log(`Intent change detected: ${history.length > 0 ? 'Yes' : 'No'}`)
    
    AIFlowLogger.printFlowSummary()
  }

  /**
   * Run all real AI tests sequentially
   */
  static async runAllRealTests(): Promise<void> {
    console.clear()
    console.log('🚀 Running All Real AI Tests')
    console.log('=' .repeat(80))
    
    await this.testMultiStepBooking()
    await new Promise(resolve => setTimeout(resolve, 2000)) // Pause between tests
    
    await this.testContextSwitching()
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    await this.testAmbiguousRequest()
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    await this.testErrorRecovery()
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    await this.testVenueNameRecognition()
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    await this.testIntentChange()
    
    console.log('\n✅ All Real AI Tests Completed')
  }

  /**
   * Quick test menu
   */
  static showTestMenu(): void {
    console.clear()
    console.log('🧪 Real AI Test Menu')
    console.log('=' .repeat(40))
    console.log('')
    console.log('Individual Tests:')
    console.log('1. RealAITest.testMultiStepBooking()')
    console.log('2. RealAITest.testContextSwitching()')
    console.log('3. RealAITest.testAmbiguousRequest()')
    console.log('4. RealAITest.testErrorRecovery()')
    console.log('5. RealAITest.testVenueNameRecognition()')
    console.log('6. RealAITest.testIntentChange()')
    console.log('')
    console.log('Run All:')
    console.log('RealAITest.runAllRealTests()')
    console.log('')
    console.log('Copy and paste any command to run!')
  }
}

// Make available globally
(window as any).RealAITest = RealAITest

// Auto-show menu
RealAITest.showTestMenu()