/**
 * Simple Flow Example - Shows complete AI processing with clean logs
 * 
 * This demonstrates:
 * 1. User input
 * 2. AI Logic processing (intent, info gathering, toolbox)
 * 3. AI Presenter formatting
 * 4. Final response to user
 */

import { AICoordinatorService } from './aiCoordinatorService'
import { AIFlowLogger } from './aiFlowLogger'

export class SimpleFlowExample {
  
  /**
   * Example 1: Complete venue search flow
   */
  static async exampleVenueSearch(): Promise<void> {
    console.clear()
    console.log('🎯 EXAMPLE: Complete Venue Search Flow')
    console.log('=' .repeat(60))
    console.log('')
    
    // Reset for clean start
    AICoordinatorService.resetConversation()
    
    // User input
    const userInput = 'I want to find a padel court in Kedoya tomorrow at 7pm'
    
    console.log('👤 USER INPUT:')
    console.log(`   "${userInput}"`)
    console.log('')
    
    // Process through AI system
    const response = await AICoordinatorService.processUserInput(userInput)
    
    console.log('🎯 FINAL RESULT:')
    console.log(`   Response: "${response.text}"`)
    console.log(`   Cards generated: ${response.sessionCards?.length || 0}`)
    console.log(`   Needs more info: ${response.needsMoreInfo}`)
    console.log('')
    
    // Show flow summary
    AIFlowLogger.printFlowSummary()
  }

  /**
   * Example 2: Multi-turn conversation
   */
  static async exampleMultiTurn(): Promise<void> {
    console.clear()
    console.log('🔄 EXAMPLE: Multi-turn Conversation')
    console.log('=' .repeat(60))
    console.log('')
    
    AICoordinatorService.resetConversation()
    
    const conversation = [
      'I want to play padel',
      'Tomorrow evening', 
      'Around Kedoya',
      '7pm sounds good'
    ]

    for (let i = 0; i < conversation.length; i++) {
      console.log(`--- TURN ${i + 1} ---`)
      console.log(`👤 USER: "${conversation[i]}"`)
      
      const response = await AICoordinatorService.processUserInput(conversation[i])
      
      console.log(`🤖 AI: "${response.text.substring(0, 100)}${response.text.length > 100 ? '...' : ''}"`)
      console.log(`   Cards: ${response.sessionCards?.length || 0} | More info needed: ${response.needsMoreInfo}`)
      console.log('')
    }
    
    AIFlowLogger.printFlowSummary()
  }

  /**
   * Example 3: Show what happens when AI Logic finds venues
   */
  static async exampleWithMockData(): Promise<void> {
    console.clear()
    console.log('🏟️ EXAMPLE: AI Processing with Mock Venue Data')
    console.log('=' .repeat(60))
    console.log('')
    
    AICoordinatorService.resetConversation()
    
    // This will trigger the full AI flow including database search
    const userInput = 'Find me a padel court in Kedoya tomorrow at 7pm'
    
    console.log('👤 USER INPUT:')
    console.log(`   "${userInput}"`)
    console.log('')
    console.log('🔄 AI PROCESSING...')
    console.log('')
    
    const response = await AICoordinatorService.processUserInput(userInput)
    
    console.log('✅ PROCESSING COMPLETE')
    console.log('')
    console.log('🎯 FINAL RESPONSE:')
    console.log(`   Text: "${response.text}"`)
    console.log(`   Session cards: ${response.sessionCards?.length || 0}`)
    console.log(`   Needs more info: ${response.needsMoreInfo}`)
    console.log('')
    
    if (response.sessionCards && response.sessionCards.length > 0) {
      console.log('📋 GENERATED CARDS:')
      response.sessionCards.forEach((card, index) => {
        console.log(`   Card ${index + 1}: ${card.venueName} - ${card.timeSlot}`)
      })
      console.log('')
    }
    
    AIFlowLogger.printFlowSummary()
  }

  /**
   * Show step-by-step AI decision making
   */
  static async showAIDecisionProcess(): Promise<void> {
    console.clear()
    console.log('🧠 EXAMPLE: AI Decision Making Process')
    console.log('=' .repeat(60))
    console.log('')
    
    AICoordinatorService.resetConversation()
    
    console.log('This example shows how the AI makes decisions:')
    console.log('1. 🧠 AI Logic analyzes user intent')
    console.log('2. 📊 AI Logic gathers required information')
    console.log('3. 🔍 AI Logic executes database search when ready')
    console.log('4. 🤝 AI Logic discusses results with AI Presenter')
    console.log('5. 🎨 AI Presenter formats the response')
    console.log('6. ✅ Final response delivered to user')
    console.log('')
    console.log('Watch the logs below to see each step:')
    console.log('')
    
    await AICoordinatorService.processUserInput('Find me a court in Kedoya tomorrow at 7pm')
    
    console.log('')
    console.log('💡 Notice how each AI service has a specific role:')
    console.log('   - AI Logic: Understanding and information gathering')
    console.log('   - AI Presenter: UX decisions and response formatting')
    console.log('   - Coordinator: Orchestrating the flow')
  }
}

// Make available globally
(window as any).SimpleFlowExample = SimpleFlowExample

// Show available examples
console.log('🚀 Simple Flow Examples Available:')
console.log('- SimpleFlowExample.exampleVenueSearch()')
console.log('- SimpleFlowExample.exampleMultiTurn()')
console.log('- SimpleFlowExample.exampleWithMockData()')
console.log('- SimpleFlowExample.showAIDecisionProcess()')
console.log('')
console.log('Copy and paste any command to see the AI flow!')