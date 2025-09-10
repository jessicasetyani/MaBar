/**
 * AI Flow Demo - Complete demonstration of AI processing with detailed logging
 */

import { AICoordinatorService } from './aiCoordinatorService'
import { AIFlowLogger } from './aiFlowLogger'

export class AIFlowDemo {
  
  /**
   * Demo 1: Simple venue search - complete flow
   */
  static async demoSimpleVenueSearch(): Promise<void> {
    console.log('\n🎯 DEMO 1: Simple Venue Search')
    console.log('=' .repeat(60))
    
    AICoordinatorService.resetConversation()
    
    const userInput = 'I want to find a padel court in Kedoya tomorrow at 7pm'
    const response = await AICoordinatorService.processUserInput(userInput)
    
    AIFlowLogger.printFlowSummary()
  }

  /**
   * Demo 2: Multi-turn conversation - information gathering
   */
  static async demoMultiTurnConversation(): Promise<void> {
    console.log('\n🔄 DEMO 2: Multi-turn Conversation')
    console.log('=' .repeat(60))
    
    AICoordinatorService.resetConversation()
    
    const conversation = [
      'I want to play padel',
      'Tomorrow evening',
      'Around Kedoya area', 
      '7pm would be perfect'
    ]

    for (let i = 0; i < conversation.length; i++) {
      console.log(`\n--- TURN ${i + 1} ---`)
      const response = await AICoordinatorService.processUserInput(conversation[i])
      
      if (i === conversation.length - 1) {
        AIFlowLogger.printFlowSummary()
      }
    }
  }

  /**
   * Demo 3: Player search with skill level
   */
  static async demoPlayerSearch(): Promise<void> {
    console.log('\n👥 DEMO 3: Player Search')
    console.log('=' .repeat(60))
    
    AICoordinatorService.resetConversation()
    
    const conversation = [
      'Looking for players to play with',
      'Intermediate level',
      'Tomorrow at 8pm',
      'In South Jakarta'
    ]

    for (let i = 0; i < conversation.length; i++) {
      console.log(`\n--- TURN ${i + 1} ---`)
      await AICoordinatorService.processUserInput(conversation[i])
    }
    
    AIFlowLogger.printFlowSummary()
  }

  /**
   * Demo 4: Intent change during conversation
   */
  static async demoIntentChange(): Promise<void> {
    console.log('\n🔄 DEMO 4: Intent Change')
    console.log('=' .repeat(60))
    
    AICoordinatorService.resetConversation()
    
    const conversation = [
      'I want to find a padel court',
      'Actually, I want to find players instead',
      'Intermediate level players',
      'For tomorrow at 8pm'
    ]

    for (let i = 0; i < conversation.length; i++) {
      console.log(`\n--- TURN ${i + 1} ---`)
      await AICoordinatorService.processUserInput(conversation[i])
    }
    
    AIFlowLogger.printFlowSummary()
  }

  /**
   * Demo 5: Complex scenario with refinement
   */
  static async demoComplexScenario(): Promise<void> {
    console.log('\n🎯 DEMO 5: Complex Scenario with Refinement')
    console.log('=' .repeat(60))
    
    AICoordinatorService.resetConversation()
    
    const conversation = [
      'Find me a court',
      'Tomorrow',
      'Actually make that this weekend',
      'Saturday morning around 9am',
      'In South Jakarta',
      'Budget around 200k per hour'
    ]

    for (let i = 0; i < conversation.length; i++) {
      console.log(`\n--- TURN ${i + 1} ---`)
      await AICoordinatorService.processUserInput(conversation[i])
    }
    
    AIFlowLogger.printFlowSummary()
  }

  /**
   * Run all demos sequentially
   */
  static async runAllDemos(): Promise<void> {
    console.log('\n🚀 STARTING AI FLOW DEMONSTRATIONS')
    console.log('=' .repeat(80))
    
    await this.demoSimpleVenueSearch()
    await this.demoMultiTurnConversation()
    await this.demoPlayerSearch()
    await this.demoIntentChange()
    await this.demoComplexScenario()
    
    console.log('\n✅ ALL DEMOS COMPLETED')
    console.log('=' .repeat(80))
  }

  /**
   * Quick validation test
   */
  static async quickValidation(): Promise<void> {
    console.log('\n⚡ QUICK VALIDATION TEST')
    console.log('=' .repeat(50))
    
    AICoordinatorService.resetConversation()
    
    const testCases = [
      'Hello',
      'Find court in Kedoya tomorrow 7pm',
      'Looking for intermediate players',
      'Book session at venue X'
    ]

    for (const testCase of testCases) {
      console.log(`\n🧪 Testing: "${testCase}"`)
      const startTime = Date.now()
      
      try {
        const response = await AICoordinatorService.processUserInput(testCase)
        const duration = Date.now() - startTime
        
        console.log(`   ✅ Response: "${response.text.substring(0, 80)}..."`)
        console.log(`   📊 Cards: ${response.sessionCards?.length || 0}`)
        console.log(`   ⏱️  Duration: ${duration}ms`)
        console.log(`   🔄 Needs more info: ${response.needsMoreInfo}`)
        
      } catch (error) {
        console.log(`   ❌ Error: ${error}`)
      }
    }
    
    console.log('\n✅ QUICK VALIDATION COMPLETED')
  }

  /**
   * Test AI communication specifically
   */
  static async testAICommunication(): Promise<void> {
    console.log('\n🤖 AI COMMUNICATION TEST')
    console.log('=' .repeat(50))
    
    // This will be logged automatically when AIs communicate
    await AICoordinatorService.processUserInput('Find me a court in Kedoya tomorrow at 7pm')
    
    console.log('\n✅ AI COMMUNICATION TEST COMPLETED')
  }

  /**
   * Performance benchmark
   */
  static async performanceBenchmark(): Promise<void> {
    console.log('\n⚡ PERFORMANCE BENCHMARK')
    console.log('=' .repeat(50))
    
    const testInputs = [
      'Find court',
      'Tomorrow 7pm', 
      'Kedoya area',
      'Budget 200k'
    ]

    const times: number[] = []
    
    for (const input of testInputs) {
      const startTime = Date.now()
      await AICoordinatorService.processUserInput(input)
      const duration = Date.now() - startTime
      times.push(duration)
      
      console.log(`   "${input}" - ${duration}ms`)
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length
    const totalTime = times.reduce((a, b) => a + b, 0)
    
    console.log(`\n📊 BENCHMARK RESULTS:`)
    console.log(`   Total time: ${totalTime}ms`)
    console.log(`   Average time: ${Math.round(avgTime)}ms`)
    console.log(`   Fastest: ${Math.min(...times)}ms`)
    console.log(`   Slowest: ${Math.max(...times)}ms`)
  }
}

// Export for easy testing in console
(window as any).AIFlowDemo = AIFlowDemo