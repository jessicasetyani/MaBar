// Comprehensive test script for AI logic
import { AIMatchmakingService } from './mabar-frontend/src/services/aiMatchmakingService.js'

async function testAILogic() {
  console.log('🧪 Testing Complete AI Matchmaking Logic\n')
  
  // Test scenarios covering all discussed cases
  const scenarios = [
    // === GREETING TESTS ===
    {
      category: 'Greeting Generation',
      name: 'AI Greeting - Morning',
      input: 'GENERATE_GREETING',
      expected: 'Natural greeting with time context'
    },
    {
      category: 'Greeting Generation', 
      name: 'Natural user greeting',
      input: 'Hello',
      expected: 'AI responds naturally as Session Scout'
    },
    
    // === FIRST MESSAGE CONTEXT TESTS ===
    {
      category: 'First Message Context',
      name: 'First message - unclear',
      input: 'tonight',
      expected: 'needMoreInfo (no conversation history)'
    },
    {
      category: 'First Message Context',
      name: 'First message - clear intent', 
      input: 'I want to play padel at 8 PM in Senayan',
      expected: 'findMatch (clear location and time)'
    },
    {
      category: 'First Message Context',
      name: 'First message - typo/unclear',
      input: 'asdf',
      expected: 'needMoreInfo (gibberish input)'
    },
    {
      category: 'First Message Context',
      name: 'First message - generic greeting',
      input: 'hi',
      expected: 'needMoreInfo (too vague)'
    },
    
    // === FOLLOW-UP MESSAGE TESTS ===
    {
      category: 'Follow-up Context',
      name: 'Follow-up after conversation',
      input: 'Senayan area',
      expected: 'getAvailableVenues (with conversation history)',
      setupHistory: [{ role: 'user', parts: [{ text: 'I want to play padel' }] }]
    },
    {
      category: 'Follow-up Context',
      name: 'Follow-up with time',
      input: 'Tonight at 7 PM',
      expected: 'findMatch (time specified with history)',
      setupHistory: [{ role: 'user', parts: [{ text: 'Show me options' }] }]
    },
    
    // === SPECIFIC ACTION TESTS ===
    {
      category: 'Venue Actions',
      name: 'Get available venues',
      input: 'Show me courts in Senayan tomorrow',
      expected: 'getAvailableVenues'
    },
    {
      category: 'Venue Actions',
      name: 'Check venue availability',
      input: 'Is Senayan Padel Club available at 8 PM?',
      expected: 'checkVenueAvailability'
    },
    {
      category: 'Venue Actions',
      name: 'Get venue details',
      input: 'Tell me about Senayan Padel Club',
      expected: 'getVenueDetails'
    },
    
    {
      category: 'Player Actions',
      name: 'Find available players',
      input: 'Find me intermediate players for tonight',
      expected: 'getAvailablePlayers'
    },
    {
      category: 'Player Actions',
      name: 'Find open sessions',
      input: 'Show me games I can join',
      expected: 'findOpenSessions'
    },
    
    {
      category: 'Session Actions',
      name: 'Create new session',
      input: 'Start a new game for 4 players',
      expected: 'createNewSession'
    },
    {
      category: 'Session Actions',
      name: 'Comprehensive match finding',
      input: 'Find me a padel match for tomorrow evening',
      expected: 'findMatch'
    },
    
    {
      category: 'Personalized Actions',
      name: 'Get recommendations',
      input: 'What do you recommend for me?',
      expected: 'getPersonalizedRecommendations'
    },
    
    // === SMART DEFAULTS TESTS ===
    {
      category: 'Smart Defaults',
      name: 'Location defaults to Jakarta',
      input: 'Find courts for tonight',
      expected: 'getAvailableVenues (location: Jakarta)'
    },
    {
      category: 'Smart Defaults',
      name: 'Activity defaults to padel',
      input: 'Book a court',
      expected: 'getAvailableVenues (activity: padel)'
    },
    {
      category: 'Smart Defaults',
      name: 'Time defaults to flexible',
      input: 'Find players in Kemang',
      expected: 'getAvailablePlayers (time: flexible)'
    },
    
    // === ERROR HANDLING TESTS ===
    {
      category: 'Error Handling',
      name: 'Invalid JSON response',
      input: 'Complex ambiguous request that might break parsing',
      expected: 'Fallback to needMoreInfo or getPersonalizedRecommendations'
    },
    {
      category: 'Error Handling',
      name: 'Network/API error simulation',
      input: 'Normal request',
      expected: 'Graceful error handling with fallback response'
    }
  ]
  
  let categoryCount = {}
  
  for (const scenario of scenarios) {
    // Count tests per category
    categoryCount[scenario.category] = (categoryCount[scenario.category] || 0) + 1
    
    console.log(`\n📋 [${scenario.category}] ${scenario.name}`)
    console.log(`Input: "${scenario.input}"`)
    console.log(`Expected: ${scenario.expected}`)
    console.log('---')
    
    try {
      // Setup conversation history if needed
      if (scenario.setupHistory) {
        AIMatchmakingService.conversationHistory = scenario.setupHistory
        console.log('📝 Setup conversation history')
      }
      
      // Special handling for greeting generation
      let response
      if (scenario.input === 'GENERATE_GREETING') {
        response = await AIMatchmakingService.generateAIGreeting()
      } else {
        response = await AIMatchmakingService.processMatchmakingRequest(scenario.input)
      }
      
      console.log(`✅ Response: "${response.text?.substring(0, 100)}${response.text?.length > 100 ? '...' : ''}"`) 
      if (response.sessionCards?.length > 0) {
        console.log(`🎴 Session cards: ${response.sessionCards.length} cards`)
      }
      
    } catch (error) {
      console.error(`❌ Test failed:`, error.message)
    }
    
    // Reset conversation history for next test
    AIMatchmakingService.conversationHistory = []
  }
  
  // Summary
  console.log('\n\n📊 TEST SUMMARY')
  console.log('==================')
  Object.entries(categoryCount).forEach(([category, count]) => {
    console.log(`${category}: ${count} tests`)
  })
  console.log(`\nTotal: ${scenarios.length} test scenarios`)
}

// Run tests
testAILogic().catch(console.error)