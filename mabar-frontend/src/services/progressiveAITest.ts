/**
 * Progressive AI Test - Simple to Complex Test Cases
 */

import { AICoordinatorService } from './aiCoordinatorService'
import { EnhancedAICommunication } from './enhancedAICommunication'
import { AIFlowLogger } from './aiFlowLogger'

export class ProgressiveAITest {

  /**
   * Level 1: Simple Tests (Quick Consensus)
   */
  static async runLevel1(): Promise<void> {
    console.clear()
    console.log('🟢 Level 1: Simple Tests')
    console.log('=' .repeat(50))

    const level1Tests = [
      "Find court in Kedoya tomorrow 7pm",
      "Show me courts in Senayan", 
      "Find intermediate players",
      "Hello",
      "What is padel?"
    ]

    for (const test of level1Tests) {
      await this.runSingleTest(test, 1)
    }
  }

  /**
   * Level 2: Medium Tests (1-2 Negotiation Rounds)
   */
  static async runLevel2(): Promise<void> {
    console.clear()
    console.log('🟡 Level 2: Medium Tests')
    console.log('=' .repeat(50))

    const level2Tests = [
      "I want to play padel tomorrow",
      "Find me a cheap court",
      "Looking for players tonight",
      "Show me morning sessions",
      "Find players at my skill level"
    ]

    for (const test of level2Tests) {
      await this.runSingleTest(test, 2)
    }
  }

  /**
   * Level 3: Complex Tests (2-3 Negotiation Rounds)
   */
  static async runLevel3(): Promise<void> {
    console.clear()
    console.log('🟠 Level 3: Complex Tests')
    console.log('=' .repeat(50))

    const level3Tests = [
      "Find me a court tomorrow, then help me invite players",
      "Find me something good for padel",
      "Book me a court at 25:00 tomorrow",
      "Find me a court under 200k with parking in South Jakarta tomorrow evening"
    ]

    for (const test of level3Tests) {
      await this.runSingleTest(test, 3)
    }

    // Context switching test
    await this.testContextSwitching()
  }

  /**
   * Level 4: Very Complex Tests (3+ Negotiation Rounds)
   */
  static async runLevel4(): Promise<void> {
    console.clear()
    console.log('🔴 Level 4: Very Complex Tests')
    console.log('=' .repeat(50))

    const level4Tests = [
      "Show me my past bookings",
      "I have 6 friends with different skill levels, help organize sessions",
      "If Kedoya is full, try Senayan, if that's full try anywhere in Jakarta",
      "What's the cheapest way to play 3 hours of padel this week?"
    ]

    for (const test of level4Tests) {
      await this.runSingleTest(test, 4)
    }

    // Complex multi-step test
    await this.testComplexMultiStep()
  }

  /**
   * Run single test with level validation
   */
  static async runSingleTest(input: string, expectedLevel: number): Promise<void> {
    console.log(`\n🧪 Testing: "${input}"`)
    
    AICoordinatorService.resetConversation()
    const startTime = Date.now()
    
    const response = await AICoordinatorService.processUserInput(input)
    const duration = Date.now() - startTime
    
    const stats = EnhancedAICommunication.getNegotiationStats()
    const rounds = stats.totalRounds
    
    // Validate level expectations
    let levelMet = false
    switch (expectedLevel) {
      case 1: levelMet = rounds === 0 && duration < 2000; break
      case 2: levelMet = rounds <= 2 && duration < 4000; break
      case 3: levelMet = rounds <= 3 && duration < 6000; break
      case 4: levelMet = rounds >= 0 && duration < 10000; break
    }
    
    console.log(`   Response: "${response.text?.substring(0, 60)}..."`)
    console.log(`   Duration: ${duration}ms`)
    console.log(`   Negotiation rounds: ${rounds}`)
    console.log(`   Level ${expectedLevel} criteria: ${levelMet ? '✅' : '❌'}`)
    console.log(`   Cards: ${response.sessionCards?.length || 0}`)
  }

  /**
   * Test context switching (Level 3)
   */
  static async testContextSwitching(): Promise<void> {
    console.log(`\n🔄 Context Switching Test`)
    
    AICoordinatorService.resetConversation()
    
    // Initial request
    await AICoordinatorService.processUserInput("Find me a court tomorrow at 7pm")
    
    // Context switch
    const response = await AICoordinatorService.processUserInput("Actually, change that to next week")
    
    const stats = EnhancedAICommunication.getNegotiationStats()
    console.log(`   Context switch handled: ${response.text?.includes('next week') ? '✅' : '❌'}`)
    console.log(`   Negotiation rounds: ${stats.totalRounds}`)
  }

  /**
   * Test complex multi-step (Level 4)
   */
  static async testComplexMultiStep(): Promise<void> {
    console.log(`\n🎯 Complex Multi-Step Test`)
    
    AICoordinatorService.resetConversation()
    
    const steps = [
      "I need to organize a tournament",
      "For 8 people, mixed skill levels",
      "Next weekend, Saturday morning",
      "Need 2 courts side by side"
    ]
    
    for (let i = 0; i < steps.length; i++) {
      const response = await AICoordinatorService.processUserInput(steps[i])
      console.log(`   Step ${i + 1}: "${steps[i]}"`)
      console.log(`   Response: "${response.text?.substring(0, 50)}..."`)
    }
    
    const stats = EnhancedAICommunication.getNegotiationStats()
    console.log(`   Multi-step coordination: ${stats.totalRounds >= 2 ? '✅' : '❌'}`)
  }

  /**
   * Run all levels progressively
   */
  static async runFromSimpleToComplex(): Promise<void> {
    console.clear()
    console.log('🚀 Progressive AI Testing: Simple → Complex')
    console.log('=' .repeat(80))
    
    await this.runLevel1()
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    await this.runLevel2()
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    await this.runLevel3()
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    await this.runLevel4()
    
    console.log('\n✅ Progressive Testing Complete')
    this.showSummary()
  }

  /**
   * Quick validation across all levels
   */
  static async quickValidation(): Promise<void> {
    console.clear()
    console.log('⚡ Quick Validation Across All Levels')
    console.log('=' .repeat(60))
    
    const quickTests = [
      { input: "Find court in Kedoya tomorrow 7pm", level: 1 },
      { input: "I want to play padel tomorrow", level: 2 },
      { input: "Find me something good for padel", level: 3 },
      { input: "Show me my past bookings", level: 4 }
    ]
    
    for (const test of quickTests) {
      await this.runSingleTest(test.input, test.level)
    }
  }

  /**
   * Performance benchmark across levels
   */
  static async performanceBenchmark(): Promise<void> {
    console.clear()
    console.log('📊 Performance Benchmark by Level')
    console.log('=' .repeat(60))
    
    const benchmarks = [
      { input: "Hello", level: 1, expectedTime: 1000 },
      { input: "Find me a court tomorrow", level: 2, expectedTime: 3000 },
      { input: "Find me something good", level: 3, expectedTime: 5000 },
      { input: "Organize tournament for 8 people", level: 4, expectedTime: 8000 }
    ]
    
    const results: any[] = []
    
    for (const benchmark of benchmarks) {
      AICoordinatorService.resetConversation()
      const startTime = Date.now()
      
      await AICoordinatorService.processUserInput(benchmark.input)
      const duration = Date.now() - startTime
      
      const stats = EnhancedAICommunication.getNegotiationStats()
      
      results.push({
        level: benchmark.level,
        duration,
        expected: benchmark.expectedTime,
        rounds: stats.totalRounds,
        performance: duration <= benchmark.expectedTime ? '✅' : '❌'
      })
      
      console.log(`Level ${benchmark.level}: ${duration}ms (expected: ${benchmark.expectedTime}ms) ${duration <= benchmark.expectedTime ? '✅' : '❌'}`)
    }
    
    const avgTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length
    console.log(`\nAverage response time: ${Math.round(avgTime)}ms`)
  }

  /**
   * Show testing summary
   */
  static showSummary(): void {
    console.log('\n📋 Testing Summary')
    console.log('=' .repeat(40))
    console.log('Level 1 (Simple): Quick consensus, <2s response')
    console.log('Level 2 (Medium): 1-2 rounds, <4s response')
    console.log('Level 3 (Complex): 2-3 rounds, <6s response')
    console.log('Level 4 (Very Complex): 3+ rounds, <10s response')
  }

  /**
   * Show test menu
   */
  static showTestMenu(): void {
    console.clear()
    console.log('🧪 Progressive AI Test Menu')
    console.log('=' .repeat(50))
    console.log('')
    console.log('By Level:')
    console.log('ProgressiveAITest.runLevel1() - Simple tests')
    console.log('ProgressiveAITest.runLevel2() - Medium tests')
    console.log('ProgressiveAITest.runLevel3() - Complex tests')
    console.log('ProgressiveAITest.runLevel4() - Very complex tests')
    console.log('')
    console.log('Complete Testing:')
    console.log('ProgressiveAITest.runFromSimpleToComplex() - All levels')
    console.log('ProgressiveAITest.quickValidation() - Quick check')
    console.log('ProgressiveAITest.performanceBenchmark() - Performance test')
    console.log('')
    console.log('Copy and paste any command to run!')
  }
}

// Make available globally
(window as any).ProgressiveAITest = ProgressiveAITest

// Auto-show menu
ProgressiveAITest.showTestMenu()