/**
 * Enhanced AI Test Suite with Real Database Integration
 */

import { AICoordinatorService } from './aiCoordinatorService'
import { EnhancedAICommunication } from './enhancedAICommunication'
import { AIFlowLogger } from './aiFlowLogger'

export class EnhancedAITest {

  /**
   * Test multi-turn AI negotiations
   */
  static async testMultiTurnNegotiation(): Promise<void> {
    console.clear()
    console.log('🤝 Testing Multi-Turn AI Negotiations')
    console.log('=' .repeat(60))

    const scenarios = [
      {
        name: 'Flexible Weekend Request',
        input: 'Find me a court this weekend, I\'m flexible on time and location',
        expectedRounds: 2,
        expectedComplexity: 'medium'
      },
      {
        name: 'No Availability Tonight',
        input: 'I need a court tonight at 8pm in Kedoya',
        expectedRounds: 3,
        expectedComplexity: 'complex'
      },
      {
        name: 'Skill Level Mismatch',
        input: 'I\'m a beginner but want to play with advanced players',
        expectedRounds: 2,
        expectedComplexity: 'complex'
      }
    ]

    for (const scenario of scenarios) {
      console.log(`\n🧪 Testing: ${scenario.name}`)
      AICoordinatorService.resetConversation()
      
      await AICoordinatorService.processUserInput(scenario.input)
      
      const stats = EnhancedAICommunication.getNegotiationStats()
      console.log(`   Negotiation rounds: ${stats.totalRounds}`)
      console.log(`   Consensus reached: ${stats.consensusReached ? '✅' : '❌'}`)
      
      // Show negotiation history
      const history = EnhancedAICommunication.getNegotiationHistory()
      history.forEach((round, index) => {
        console.log(`   Round ${round.round}: ${round.from} → ${round.to}`)
        console.log(`     ${round.message.reasoning}`)
        console.log(`     Response: ${round.response.reasoning}`)
      })
    }
  }

  /**
   * Test quick consensus for simple scenarios
   */
  static async testQuickConsensus(): Promise<void> {
    console.clear()
    console.log('⚡ Testing Quick Consensus')
    console.log('=' .repeat(50))

    const simpleScenarios = [
      'I want to find a padel court in Kedoya tomorrow at 7pm',
      'Show me intermediate players available tonight',
      'I want to join a session tomorrow evening'
    ]

    for (const scenario of simpleScenarios) {
      console.log(`\n🧪 Testing: "${scenario}"`)
      AICoordinatorService.resetConversation()
      
      const startTime = Date.now()
      await AICoordinatorService.processUserInput(scenario)
      const duration = Date.now() - startTime
      
      const stats = EnhancedAICommunication.getNegotiationStats()
      console.log(`   Duration: ${duration}ms`)
      console.log(`   Negotiation rounds: ${stats.totalRounds}`)
      console.log(`   Quick consensus: ${stats.totalRounds === 0 ? '✅' : '❌'}`)
    }
  }

  /**
   * Test complex scenario handling
   */
  static async testComplexScenarios(): Promise<void> {
    console.clear()
    console.log('🎯 Testing Complex Scenario Handling')
    console.log('=' .repeat(60))

    const complexScenarios = [
      {
        name: 'Booking History Integration',
        conversation: [
          'Show me my past bookings',
          'Book the same court as my last session',
          'But with different players this time'
        ]
      },
      {
        name: 'Multi-Constraint Search',
        conversation: [
          'Find me a court under 150k per hour',
          'In South Jakarta',
          'For tomorrow evening',
          'With parking available'
        ]
      },
      {
        name: 'Group Coordination',
        conversation: [
          'I need to organize a session for 6 people',
          'Mixed skill levels - 2 beginners, 4 intermediates',
          'Weekend morning preferred'
        ]
      }
    ]

    for (const scenario of complexScenarios) {
      console.log(`\n🧪 Testing: ${scenario.name}`)
      AICoordinatorService.resetConversation()
      
      for (let i = 0; i < scenario.conversation.length; i++) {
        console.log(`   Turn ${i + 1}: "${scenario.conversation[i]}"`)
        await AICoordinatorService.processUserInput(scenario.conversation[i])
        
        if (i === scenario.conversation.length - 1) {
          const stats = EnhancedAICommunication.getNegotiationStats()
          console.log(`   Final negotiation rounds: ${stats.totalRounds}`)
          console.log(`   Consensus: ${stats.consensusReached ? '✅' : '❌'}`)
        }
      }
    }
  }

  /**
   * Test real database integration
   */
  static async testRealDatabaseIntegration(): Promise<void> {
    console.clear()
    console.log('💾 Testing Real Database Integration')
    console.log('=' .repeat(60))

    const databaseScenarios = [
      {
        name: 'Venue Search with Real Data',
        input: 'Find courts in Kedoya with parking',
        expectsResults: true
      },
      {
        name: 'Player Matching',
        input: 'Find intermediate players in South Jakarta',
        expectsResults: true
      },
      {
        name: 'Session Joining',
        input: 'Show me open sessions tomorrow',
        expectsResults: true
      },
      {
        name: 'No Results Scenario',
        input: 'Find courts in Bali tomorrow',
        expectsResults: false
      }
    ]

    for (const scenario of databaseScenarios) {
      console.log(`\n🧪 Testing: ${scenario.name}`)
      AICoordinatorService.resetConversation()
      
      const response = await AICoordinatorService.processUserInput(scenario.input)
      
      const hasResults = (response.sessionCards?.length || 0) > 0
      const expectationMet = hasResults === scenario.expectsResults
      
      console.log(`   Input: "${scenario.input}"`)
      console.log(`   Results found: ${hasResults ? '✅' : '❌'}`)
      console.log(`   Expected results: ${scenario.expectsResults ? '✅' : '❌'}`)
      console.log(`   Expectation met: ${expectationMet ? '✅' : '❌'}`)
      console.log(`   Response cards: ${response.sessionCards?.length || 0}`)
    }
  }

  /**
   * Test negotiation audit trail
   */
  static async testNegotiationAuditTrail(): Promise<void> {
    console.clear()
    console.log('📋 Testing Negotiation Audit Trail')
    console.log('=' .repeat(60))

    AICoordinatorService.resetConversation()
    
    // Trigger complex negotiation
    await AICoordinatorService.processUserInput('Find me a court but I have very specific requirements')
    
    const history = EnhancedAICommunication.getNegotiationHistory()
    const stats = EnhancedAICommunication.getNegotiationStats()
    
    console.log('\n📊 Negotiation Statistics:')
    console.log(`   Total rounds: ${stats.totalRounds}`)
    console.log(`   Consensus reached: ${stats.consensusReached}`)
    console.log(`   Average rounds: ${stats.averageRounds}`)
    
    console.log('\n📋 Detailed Audit Trail:')
    history.forEach((round, index) => {
      console.log(`\n   Round ${round.round} (${round.timestamp})`)
      console.log(`   ${round.from} → ${round.to}`)
      console.log(`   Message: ${JSON.stringify(round.message, null, 2)}`)
      console.log(`   Response: ${JSON.stringify(round.response, null, 2)}`)
      console.log(`   Consensus: ${round.consensusReached ? '✅' : '❌'}`)
    })
  }

  /**
   * Performance benchmark with enhanced communication
   */
  static async testEnhancedPerformance(): Promise<void> {
    console.clear()
    console.log('⚡ Enhanced AI Performance Benchmark')
    console.log('=' .repeat(60))

    const testCases = [
      { type: 'Simple', input: 'Find court in Kedoya tomorrow 7pm', expectedTime: 2000 },
      { type: 'Medium', input: 'Find me a court this weekend', expectedTime: 4000 },
      { type: 'Complex', input: 'I need help organizing a tournament', expectedTime: 6000 }
    ]

    const results: any[] = []

    for (const testCase of testCases) {
      console.log(`\n🧪 Testing ${testCase.type} Scenario`)
      AICoordinatorService.resetConversation()
      
      const startTime = Date.now()
      await AICoordinatorService.processUserInput(testCase.input)
      const duration = Date.now() - startTime
      
      const stats = EnhancedAICommunication.getNegotiationStats()
      
      results.push({
        type: testCase.type,
        duration,
        expectedTime: testCase.expectedTime,
        negotiationRounds: stats.totalRounds,
        consensus: stats.consensusReached
      })
      
      console.log(`   Duration: ${duration}ms (expected: ${testCase.expectedTime}ms)`)
      console.log(`   Performance: ${duration <= testCase.expectedTime ? '✅' : '❌'}`)
      console.log(`   Negotiation rounds: ${stats.totalRounds}`)
    }

    console.log('\n📊 Performance Summary:')
    results.forEach(result => {
      console.log(`   ${result.type}: ${result.duration}ms (${result.negotiationRounds} rounds)`)
    })
    
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length
    console.log(`   Average duration: ${Math.round(avgDuration)}ms`)
  }

  /**
   * Run all enhanced AI tests
   */
  static async runAllEnhancedTests(): Promise<void> {
    console.clear()
    console.log('🚀 Running All Enhanced AI Tests')
    console.log('=' .repeat(80))

    await this.testQuickConsensus()
    await this.testMultiTurnNegotiation()
    await this.testComplexScenarios()
    await this.testRealDatabaseIntegration()
    await this.testNegotiationAuditTrail()
    await this.testEnhancedPerformance()

    console.log('\n✅ All Enhanced AI Tests Completed')
    console.log('=' .repeat(80))
  }
}

// Make available globally
(window as any).EnhancedAITest = EnhancedAITest