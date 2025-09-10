/**
 * Comprehensive AI System Test
 * Single test file for all scenarios - simple to complex
 */

import { AICoordinatorService } from './aiCoordinatorService'
import { AILogicService } from './aiLogicService'
import { AIPresenterService } from './aiPresenterService'

export interface TestScenario {
  name: string
  userInput: string
  expectedIntent?: string
  expectedNeedsMoreInfo?: boolean
  description: string
}

export class ComprehensiveAITest {
  
  /**
   * Run all test scenarios
   */
  static async runAllTests(): Promise<void> {
    console.log('🧪 Starting Comprehensive AI System Tests')
    
    // Simple tests
    await this.runSimpleTests()
    
    // Complex conversation tests
    await this.runComplexTests()
    
    // Edge case tests
    await this.runEdgeCaseTests()
    
    console.log('✅ All tests completed')
  }

  /**
   * Simple validation tests
   */
  static async runSimpleTests(): Promise<void> {
    console.log('\n📝 Simple Tests')
    
    const simpleScenarios: TestScenario[] = [
      {
        name: 'Basic venue search',
        userInput: 'I want to find a padel court in Kedoya tomorrow at 7pm',
        expectedIntent: 'find_venue',
        expectedNeedsMoreInfo: false,
        description: 'Complete venue search request'
      },
      {
        name: 'Player search',
        userInput: 'Looking for intermediate players to play with',
        expectedIntent: 'find_players',
        expectedNeedsMoreInfo: true,
        description: 'Player search missing date/time'
      },
      {
        name: 'Greeting',
        userInput: 'Hello',
        expectedIntent: 'general_inquiry',
        expectedNeedsMoreInfo: true,
        description: 'Basic greeting'
      }
    ]

    for (const scenario of simpleScenarios) {
      await this.runSingleTest(scenario)
    }
  }

  /**
   * Complex multi-turn conversation tests
   */
  static async runComplexTests(): Promise<void> {
    console.log('\n🔄 Complex Conversation Tests')
    
    // Test 1: Multi-turn venue search
    await this.testMultiTurnVenueSearch()
    
    // Test 2: Intent change mid-conversation
    await this.testIntentChange()
    
    // Test 3: Information refinement
    await this.testInformationRefinement()
  }

  /**
   * Edge case and error handling tests
   */
  static async runEdgeCaseTests(): Promise<void> {
    console.log('\n⚠️ Edge Case Tests')
    
    const edgeCases: TestScenario[] = [
      {
        name: 'Empty input',
        userInput: '',
        description: 'Empty string handling'
      },
      {
        name: 'Very long input',
        userInput: 'I want to find a padel court but I have very specific requirements and need to explain everything in detail about my preferences and schedule and budget and location preferences and skill level and playing style and equipment needs and timing flexibility and group size preferences and court surface preferences and lighting requirements and parking availability and changing room facilities and shower facilities and equipment rental options and coaching availability and tournament opportunities and social events and membership options and pricing structures and booking policies and cancellation policies and weather contingencies and accessibility features and safety measures and hygiene protocols and customer service quality and overall experience expectations',
        description: 'Very long input handling'
      },
      {
        name: 'Mixed languages',
        userInput: 'I want to find lapangan padel di Jakarta tomorrow',
        description: 'Mixed English-Indonesian'
      }
    ]

    for (const scenario of edgeCases) {
      await this.runSingleTest(scenario)
    }
  }

  /**
   * Test multi-turn venue search conversation
   */
  static async testMultiTurnVenueSearch(): Promise<void> {
    console.log('  🎯 Multi-turn venue search')
    
    AICoordinatorService.resetConversation()
    
    const conversation = [
      'I want to play padel',
      'Tomorrow evening',
      'Around Kedoya area',
      '7pm would be perfect'
    ]

    for (let i = 0; i < conversation.length; i++) {
      const response = await AICoordinatorService.processUserInput(conversation[i])
      console.log(`    Turn ${i + 1}: "${conversation[i]}"`)
      console.log(`    Response: ${response.text.substring(0, 100)}...`)
      console.log(`    Needs more info: ${response.needsMoreInfo}`)
      
      if (i === conversation.length - 1) {
        console.log(`    Final cards: ${response.sessionCards?.length || 0}`)
      }
    }
  }

  /**
   * Test intent change during conversation
   */
  static async testIntentChange(): Promise<void> {
    console.log('  🔄 Intent change test')
    
    AICoordinatorService.resetConversation()
    
    const conversation = [
      'I want to find a padel court',
      'Actually, I want to find players instead',
      'Intermediate level players',
      'For tomorrow at 8pm'
    ]

    for (let i = 0; i < conversation.length; i++) {
      const response = await AICoordinatorService.processUserInput(conversation[i])
      console.log(`    Turn ${i + 1}: "${conversation[i]}"`)
      console.log(`    Response: ${response.text.substring(0, 80)}...`)
    }
  }

  /**
   * Test information refinement
   */
  static async testInformationRefinement(): Promise<void> {
    console.log('  🎯 Information refinement test')
    
    AICoordinatorService.resetConversation()
    
    const conversation = [
      'Find me a court',
      'Tomorrow',
      'Actually make that this weekend',
      'Saturday morning around 9am',
      'In South Jakarta'
    ]

    for (let i = 0; i < conversation.length; i++) {
      const response = await AICoordinatorService.processUserInput(conversation[i])
      console.log(`    Turn ${i + 1}: "${conversation[i]}"`)
      console.log(`    Response: ${response.text.substring(0, 80)}...`)
    }
  }

  /**
   * Run a single test scenario
   */
  static async runSingleTest(scenario: TestScenario): Promise<void> {
    console.log(`  🧪 ${scenario.name}`)
    
    try {
      AICoordinatorService.resetConversation()
      
      const response = await AICoordinatorService.processUserInput(scenario.userInput)
      
      console.log(`    Input: "${scenario.userInput}"`)
      console.log(`    Response: ${response.text.substring(0, 100)}...`)
      console.log(`    Needs more info: ${response.needsMoreInfo}`)
      console.log(`    Cards: ${response.sessionCards?.length || 0}`)
      
      // Validate expectations if provided
      if (scenario.expectedNeedsMoreInfo !== undefined) {
        const matches = response.needsMoreInfo === scenario.expectedNeedsMoreInfo
        console.log(`    Expected needsMoreInfo: ${scenario.expectedNeedsMoreInfo} - ${matches ? '✅' : '❌'}`)
      }
      
    } catch (error) {
      console.log(`    ❌ Error: ${error}`)
    }
  }

  /**
   * Test AI communication between Logic and Presenter
   */
  static async testAICommunication(): Promise<void> {
    console.log('\n🤖 AI Communication Test')
    
    // Test direct method calls (current architecture)
    const mockFindings = {
      venues: [
        { name: 'Test Venue 1', location: 'Kedoya' },
        { name: 'Test Venue 2', location: 'Senayan' }
      ],
      players: [],
      sessions: []
    }

    try {
      // Test AI Logic → AI Presenter communication
      const strategy = await AILogicService.discussWithPresenter(mockFindings)
      console.log('  ✅ AI Logic → AI Presenter communication working')
      console.log(`    Recommended format: ${strategy.recommendedPresentation}`)
      console.log(`    Reasoning: ${strategy.reasoning}`)

      // Test AI Presenter response formatting
      const userResponse = await AIPresenterService.formatResponse(
        mockFindings,
        { location: 'kedoya', date: 'tomorrow' },
        strategy.recommendedPresentation
      )
      console.log('  ✅ AI Presenter response formatting working')
      console.log(`    Response text: ${userResponse.text.substring(0, 80)}...`)
      console.log(`    Cards generated: ${userResponse.sessionCards?.length || 0}`)

    } catch (error) {
      console.log(`  ❌ AI Communication error: ${error}`)
    }
  }

  /**
   * Test system performance with rapid requests
   */
  static async testPerformance(): Promise<void> {
    console.log('\n⚡ Performance Test')
    
    const testInputs = [
      'Find court in Kedoya',
      'Tomorrow at 7pm',
      'Looking for players',
      'Intermediate level'
    ]

    const startTime = Date.now()
    
    for (const input of testInputs) {
      await AICoordinatorService.processUserInput(input)
    }
    
    const endTime = Date.now()
    const totalTime = endTime - startTime
    
    console.log(`  ⏱️ ${testInputs.length} requests completed in ${totalTime}ms`)
    console.log(`  📊 Average: ${Math.round(totalTime / testInputs.length)}ms per request`)
  }

  /**
   * Get conversation state for debugging
   */
  static getConversationInfo(): any {
    return AICoordinatorService.getConversationInfo()
  }

  /**
   * Quick system validation
   */
  static async quickValidation(): Promise<boolean> {
    try {
      const response = await AICoordinatorService.processUserInput('Hello')
      return response.text.length > 0
    } catch (error) {
      console.error('Quick validation failed:', error)
      return false
    }
  }
}

// Export test functions for individual use
export const testAISystem = ComprehensiveAITest.runAllTests
export const testAICommunication = ComprehensiveAITest.testAICommunication
export const quickValidation = ComprehensiveAITest.quickValidation