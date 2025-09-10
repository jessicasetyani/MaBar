/**
 * Test Runner - Execute AI flow tests with clean logging
 */

import { AIFlowDemo } from './aiFlowDemo'
import { ComprehensiveAITest } from './comprehensiveAITest'

export class TestRunner {
  
  /**
   * Run basic flow demonstration
   */
  static async runBasicDemo(): Promise<void> {
    console.clear()
    console.log('🚀 MaBar AI System - Basic Flow Demo')
    console.log('=' .repeat(80))
    
    await AIFlowDemo.demoSimpleVenueSearch()
  }

  /**
   * Run multi-turn conversation demo
   */
  static async runConversationDemo(): Promise<void> {
    console.clear()
    console.log('🚀 MaBar AI System - Conversation Demo')
    console.log('=' .repeat(80))
    
    await AIFlowDemo.demoMultiTurnConversation()
  }

  /**
   * Run all comprehensive tests
   */
  static async runAllTests(): Promise<void> {
    console.clear()
    console.log('🚀 MaBar AI System - Comprehensive Tests')
    console.log('=' .repeat(80))
    
    await ComprehensiveAITest.runAllTests()
  }

  /**
   * Run quick validation
   */
  static async runQuickValidation(): Promise<void> {
    console.clear()
    console.log('🚀 MaBar AI System - Quick Validation')
    console.log('=' .repeat(80))
    
    await AIFlowDemo.quickValidation()
  }

  /**
   * Run performance benchmark
   */
  static async runPerformanceBenchmark(): Promise<void> {
    console.clear()
    console.log('🚀 MaBar AI System - Performance Benchmark')
    console.log('=' .repeat(80))
    
    await AIFlowDemo.performanceBenchmark()
  }

  /**
   * Interactive test menu
   */
  static showTestMenu(): void {
    console.clear()
    console.log('🚀 MaBar AI System - Test Menu')
    console.log('=' .repeat(50))
    console.log('')
    console.log('Available tests:')
    console.log('1. TestRunner.runBasicDemo() - Simple venue search')
    console.log('2. TestRunner.runConversationDemo() - Multi-turn conversation')
    console.log('3. TestRunner.runQuickValidation() - Quick validation')
    console.log('4. TestRunner.runPerformanceBenchmark() - Performance test')
    console.log('5. TestRunner.runAllTests() - Comprehensive tests')
    console.log('')
    console.log('Individual demos:')
    console.log('- AIFlowDemo.demoSimpleVenueSearch()')
    console.log('- AIFlowDemo.demoMultiTurnConversation()')
    console.log('- AIFlowDemo.demoPlayerSearch()')
    console.log('- AIFlowDemo.demoIntentChange()')
    console.log('- AIFlowDemo.demoComplexScenario()')
    console.log('')
    console.log('Copy and paste any command above to run the test!')
  }
}

// Make available globally for easy console access
(window as any).TestRunner = TestRunner
(window as any).showTestMenu = () => TestRunner.showTestMenu()

// Auto-show menu when loaded
TestRunner.showTestMenu()