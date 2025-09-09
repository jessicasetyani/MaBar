const Parse = require('parse/node');
require('dotenv').config();

// Initialize Parse
Parse.initialize(
  process.env.VITE_BACK4APP_APP_ID,
  process.env.VITE_BACK4APP_JAVASCRIPT_KEY,
  process.env.VITE_BACK4APP_MASTER_KEY
);
Parse.serverURL = 'https://parseapi.back4app.com';

// Test scenarios from the documentation
const testScenarios = [
  // 1. SUCCESSFUL MATCH SCENARIOS
  {
    category: 'Successful Match',
    input: 'I want to play padel tonight at 7 PM in Senayan',
    expectedType: 'existing-session',
    expectedCount: '2-3 sessions',
    description: 'Should find existing sessions with available slots'
  },
  {
    category: 'Successful Match',
    input: 'Find me a game tomorrow morning',
    expectedType: 'multiple-options',
    expectedCount: '3+ options',
    description: 'Should show multiple time slots and venues'
  },
  {
    category: 'Successful Match',
    input: 'Looking for intermediate players this weekend',
    expectedType: 'skill-filtered',
    expectedCount: '2+ sessions',
    description: 'Should filter by skill level'
  },

  // 2. NO MATCH SCENARIOS
  {
    category: 'No Match',
    input: 'I want to play at 3 AM tonight',
    expectedType: 'no-availability',
    expectedCount: '0 sessions',
    description: 'Should suggest alternative times'
  },
  {
    category: 'No Match',
    input: 'Book court at Jakarta Padel Center tomorrow 6 PM',
    expectedType: 'fully-booked',
    expectedCount: 'alternatives',
    description: 'Should suggest nearby venues or different times'
  },
  {
    category: 'No Match',
    input: 'Find players in Bogor tonight',
    expectedType: 'no-players-area',
    expectedCount: 'area-suggestions',
    description: 'Should suggest expanding search area'
  },
  {
    category: 'Nearby Alternatives',
    input: 'Play padel tonight 7 PM at Senayan',
    expectedType: 'nearby-venues',
    expectedCount: '2-3 alternatives',
    description: 'Should suggest nearby venues when preferred location is booked'
  },

  // 3. VENUE LISTING SCENARIOS
  {
    category: 'Venue Listing',
    input: 'Show me all padel courts in Jakarta',
    expectedType: 'venue-list',
    expectedCount: '5-8 venues',
    description: 'Should display venue cards with details'
  },
  {
    category: 'Venue Listing',
    input: 'What courts are available in Kemang?',
    expectedType: 'area-filtered-venues',
    expectedCount: '2-3 venues',
    description: 'Should filter venues by area'
  },
  {
    category: 'Venue Listing',
    input: 'Show me cheap courts under 150k per hour',
    expectedType: 'price-filtered-venues',
    expectedCount: '1-2 venues',
    description: 'Should filter by price range'
  },

  // 4. PLAYER LISTING SCENARIOS
  {
    category: 'Player Listing',
    input: "Who's looking to play tonight?",
    expectedType: 'player-list',
    expectedCount: '4-6 players',
    description: 'Should show available player profiles'
  },
  {
    category: 'Player Listing',
    input: 'Find advanced players for doubles',
    expectedType: 'skill-filtered-players',
    expectedCount: '2-4 players',
    description: 'Should filter players by skill level'
  },
  {
    category: 'Player Listing',
    input: 'Any beginners want to play at midnight?',
    expectedType: 'no-players-time',
    expectedCount: 'time-suggestions',
    description: 'Should suggest better times for beginners'
  },

  // 5. EDGE CASES & ERROR HANDLING
  {
    category: 'Edge Cases',
    input: 'Find crts in snayan tmrw',
    expectedType: 'typo-interpretation',
    expectedCount: 'interpreted-results',
    description: 'Should interpret typos correctly'
  },
  {
    category: 'Edge Cases',
    input: 'a',
    expectedType: 'insufficient-input',
    expectedCount: 'clarification',
    description: 'Should ask for more details'
  },
  {
    category: 'Edge Cases',
    input: 'play',
    expectedType: 'ambiguous-request',
    expectedCount: 'guided-questions',
    description: 'Should provide guided questions'
  },
  {
    category: 'Edge Cases',
    input: 'Book something',
    expectedType: 'clarification-needed',
    expectedCount: 'options',
    description: 'Should ask clarifying questions'
  },
  {
    category: 'Edge Cases',
    input: 'Find courts in New York',
    expectedType: 'invalid-location',
    expectedCount: 'jakarta-alternatives',
    description: 'Should explain service area limitation'
  },
  {
    category: 'Edge Cases',
    input: 'Book court for yesterday',
    expectedType: 'invalid-time',
    expectedCount: 'future-suggestions',
    description: 'Should suggest valid dates'
  },
  {
    category: 'Edge Cases',
    input: 'Purple elephant dancing salsa',
    expectedType: 'nonsensical',
    expectedCount: 'help-guidance',
    description: 'Should provide help and examples'
  },

  // 6. LANGUAGE VARIATIONS
  {
    category: 'Language',
    input: 'Cari lapangan padel di Jakarta Selatan',
    expectedType: 'bahasa-indonesia',
    expectedCount: 'south-jakarta-venues',
    description: 'Should respond in Bahasa Indonesia'
  },
  {
    category: 'Language',
    input: 'Find court di Senayan untuk besok',
    expectedType: 'mixed-language',
    expectedCount: 'senayan-results',
    description: 'Should understand mixed language'
  },

  // 7. ADVANCED SMART AI SCENARIOS
  {
    category: 'Smart AI',
    input: 'I am a beginner, can I join the advanced game at Elite Club?',
    expectedType: 'skill-mismatch-warning',
    expectedCount: 'warning-with-alternatives',
    description: 'Should warn about skill mismatch and suggest alternatives'
  },
  {
    category: 'Smart AI',
    input: 'Play outdoor courts today',
    expectedType: 'weather-intelligence',
    expectedCount: 'weather-based-recommendations',
    description: 'Should consider weather in recommendations'
  },
  {
    category: 'Smart AI',
    input: 'Need courts for 8 people',
    expectedType: 'group-size-intelligence',
    expectedCount: 'multi-court-solutions',
    description: 'Should handle group size requirements intelligently'
  },
  {
    category: 'Smart AI',
    input: 'Play now',
    expectedType: 'immediate-availability',
    expectedCount: 'urgent-booking-options',
    description: 'Should prioritize immediate availability and closest venues'
  },
  {
    category: 'Smart AI',
    input: 'Need equipment rental and showers',
    expectedType: 'facility-filtering',
    expectedCount: 'facility-matched-venues',
    description: 'Should filter venues by required facilities'
  },

  // 8. PERSONAL BOOKING MANAGEMENT
  {
    category: 'Booking Management',
    input: 'What are my upcoming bookings?',
    expectedType: 'user-bookings',
    expectedCount: 'booking-list',
    description: 'Should show user upcoming bookings with details'
  },
  {
    category: 'Booking Management',
    input: 'Show my past games',
    expectedType: 'booking-history',
    expectedCount: 'historical-sessions',
    description: 'Should display completed sessions and statistics'
  },
  {
    category: 'Booking Management',
    input: 'Is my booking for tomorrow confirmed?',
    expectedType: 'booking-status',
    expectedCount: 'status-details',
    description: 'Should check and confirm specific booking status'
  },

  // 9. AI PERSONALIZED RECOMMENDATIONS
  {
    category: 'AI Recommendations',
    input: 'Recommend me a game',
    expectedType: 'personalized-recommendations',
    expectedCount: '2-3 suggestions',
    description: 'Should provide personalized game recommendations based on user profile'
  },
  {
    category: 'AI Recommendations',
    input: 'I am free this weekend, any suggestions?',
    expectedType: 'time-based-recommendations',
    expectedCount: 'weekend-options',
    description: 'Should suggest weekend sessions based on user patterns'
  },
  {
    category: 'AI Recommendations',
    input: 'Find me regular playing partners',
    expectedType: 'social-matching',
    expectedCount: 'compatible-players',
    description: 'Should match users with compatible regular partners'
  }
];

// Mock AI service for testing (replace with actual AI service)
class MockAIService {
  static async processUserInput(input) {
    // This would normally call your actual AI service
    // For testing, we'll simulate responses based on input patterns
    
    const response = {
      text: '',
      sessionCards: [],
      needsMoreInfo: false
    };

    // Simulate different response types based on input
    if (input.includes('3 AM') || input.includes('midnight')) {
      response.text = 'No sessions found for your requested time. Here are popular evening alternatives:';
      response.sessionCards = [{
        type: 'no-availability',
        data: { 
          message: 'No sessions available at this time',
          suggestions: ['6 PM - 8 PM', '7 PM - 9 PM', '8 PM - 10 PM']
        }
      }];
    } else if (input.includes('all padel courts') || input.includes('show me')) {
      response.text = 'Here are the available padel courts in Jakarta:';
      response.sessionCards = [
        { type: 'venue-info', data: { name: 'Jakarta Padel Center', area: 'Senayan', price: '175k/hour' }},
        { type: 'venue-info', data: { name: 'Elite Padel Club', area: 'Kemang', price: '200k/hour' }},
        { type: 'venue-info', data: { name: 'Gading Padel Court', area: 'Kelapa Gading', price: '150k/hour' }}
      ];
    } else if (input.length <= 2) {
      response.text = 'I need more details to help you. What would you like to do?';
      response.needsMoreInfo = true;
    } else if (input.includes('New York') || input.includes('Bogor')) {
      response.text = 'MaBar currently serves Jakarta area only. Here are popular Jakarta locations:';
      response.sessionCards = [{
        type: 'area-suggestions',
        data: { areas: ['Senayan', 'Kemang', 'PIK', 'BSD'] }
      }];
    } else if (input.includes('yesterday') || input.includes('past')) {
      response.text = "I can't book courts for past dates. Here are available future slots:";
      response.sessionCards = [{
        type: 'future-availability',
        data: { dates: ['Today', 'Tomorrow', 'This Weekend'] }
      }];
    } else if (input.includes('elephant') || input.includes('nonsense')) {
      response.text = "I didn't understand that request. I help with padel court bookings and player matching. Try asking about courts, players, or games.";
    } else if (input.includes('Cari') || input.includes('lapangan')) {
      response.text = 'Berikut adalah lapangan padel yang tersedia di Jakarta Selatan:';
      response.sessionCards = [{
        type: 'venue-list-id',
        data: { venues: ['Elite Padel Club Kemang', 'Pondok Indah Padel'] }
      }];
    } else if (input.includes('Play padel') && input.includes('Senayan')) {
      response.text = 'Senayan venues are fully booked at 7 PM tonight. I found available courts nearby:';
      response.sessionCards = [
        { 
          type: 'nearby-venue', 
          data: { 
            venue: 'Menteng Padel Center', 
            distance: '5 min from Senayan',
            time: '7:00 PM', 
            cost: '190k/hour',
            available: true
          }
        },
        { 
          type: 'nearby-venue', 
          data: { 
            venue: 'Elite Padel Club Kemang', 
            distance: '10 min from Senayan',
            time: '7:00 PM', 
            cost: '200k/hour',
            available: true
          }
        }
      ];
    } else if (input.includes('beginner') && input.includes('advanced')) {
      response.text = '⚠️ Skill level mismatch detected. Here are better options for beginners:';
      response.sessionCards = [
        { type: 'skill-warning', data: { message: 'Advanced session may be too challenging' }},
        { type: 'beginner-session', data: { venue: 'Gading Padel Court', skill: 'beginner-friendly' }}
      ];
    } else if (input.includes('outdoor') && input.includes('today')) {
      response.text = 'Weather shows rain today, recommending indoor venues:';
      response.sessionCards = [
        { type: 'weather-recommendation', data: { reason: 'rain_forecast', venues: ['Indoor courts only'] }}
      ];
    } else if (input.includes('8 people')) {
      response.text = 'For 8 people, you need 2 courts. Here are venues with multiple courts available:';
      response.sessionCards = [
        { type: 'multi-court', data: { venue: 'Elite Padel Club', courts: 2, total_cost: '400k/hour' }}
      ];
    } else if (input.includes('Play now')) {
      response.text = '⚡ Immediate availability found. Book quickly:';
      response.sessionCards = [
        { type: 'urgent-booking', data: { venue: 'Jakarta Padel Center', distance: '5 min away', urgency: 'high' }}
      ];
    } else if (input.includes('equipment') && input.includes('shower')) {
      response.text = 'Venues with equipment rental and shower facilities:';
      response.sessionCards = [
        { type: 'facility-match', data: { venue: 'Elite Padel Club', facilities: ['equipment', 'showers', 'lockers'] }}
      ];
    } else if (input.includes('my') && (input.includes('booking') || input.includes('upcoming'))) {
      response.text = 'Here are your upcoming bookings:';
      response.sessionCards = [
        { type: 'user-booking', data: { venue: 'Jakarta Padel Center', date: 'Tomorrow', time: '7 PM', status: 'confirmed' }},
        { type: 'user-booking', data: { venue: 'Elite Padel Club', date: 'Saturday', time: '9 AM', status: 'confirmed' }}
      ];
    } else if (input.includes('past games') || input.includes('history')) {
      response.text = 'Your recent playing history:';
      response.sessionCards = [
        { type: 'booking-history', data: { venue: 'Gading Padel', date: 'Last week', partners: ['Ahmad', 'Sarah'], rating: 4.5 }}
      ];
    } else if (input.includes('confirmed') || input.includes('booking for tomorrow')) {
      response.text = 'Your tomorrow booking status:';
      response.sessionCards = [
        { type: 'booking-status', data: { venue: 'Jakarta Padel Center', status: 'confirmed', payment: 'paid', reminder: '2 hours before' }}
      ];
    } else if (input.includes('recommend') || input.includes('suggestions')) {
      response.text = 'Based on your intermediate level and Kemang preference, here are my recommendations:';
      response.sessionCards = [
        { type: 'personalized-recommendation', data: { venue: 'Elite Padel Kemang', compatibility: '92%', reason: 'matches your skill and location' }},
        { type: 'personalized-recommendation', data: { venue: 'Pondok Indah Padel', compatibility: '87%', reason: 'similar players, premium facilities' }}
      ];
    } else if (input.includes('weekend') && input.includes('free')) {
      response.text = 'You usually play Saturday mornings. Here are great weekend options:';
      response.sessionCards = [
        { type: 'weekend-recommendation', data: { day: 'Saturday', time: '9 AM', venue: 'PIK Padel Arena', reason: 'matches your usual pattern' }}
      ];
    } else if (input.includes('playing partners') || input.includes('regular')) {
      response.text = 'Found compatible players for regular games:';
      response.sessionCards = [
        { type: 'partner-match', data: { name: 'Lisa Chen', compatibility: '95%', schedule_overlap: '80%', skill_match: 'perfect' }}
      ];
    } else {
      // Default successful match
      response.text = 'I found some great options for you:';
      response.sessionCards = [
        { 
          type: 'existing-session', 
          data: { 
            venue: 'Jakarta Padel Center', 
            time: '7:00 PM', 
            players: 2, 
            openSlots: 2,
            cost: '175k/hour'
          }
        },
        { 
          type: 'create-new', 
          data: { 
            venue: 'Elite Padel Club', 
            suggestedTime: '8:00 PM',
            estimatedCost: '200k/hour'
          }
        }
      ];
    }

    return response;
  }
}

const runTestScenarios = async () => {
  console.log('🧪 Running AI Chat Test Scenarios...\n');
  
  let passedTests = 0;
  let totalTests = testScenarios.length;
  const results = [];

  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    console.log(`\n📝 Test ${i + 1}/${totalTests}: ${scenario.category}`);
    console.log(`Input: "${scenario.input}"`);
    console.log(`Expected: ${scenario.description}`);
    
    try {
      // Call the AI service (using mock for now)
      const response = await MockAIService.processUserInput(scenario.input);
      
      // Analyze response
      const analysis = analyzeResponse(response, scenario);
      
      console.log(`Response: "${response.text}"`);
      console.log(`Cards: ${response.sessionCards?.length || 0} items`);
      console.log(`Status: ${analysis.passed ? '✅ PASS' : '❌ FAIL'}`);
      
      if (!analysis.passed) {
        console.log(`Reason: ${analysis.reason}`);
      }
      
      results.push({
        scenario,
        response,
        analysis
      });
      
      if (analysis.passed) passedTests++;
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      results.push({
        scenario,
        response: null,
        analysis: { passed: false, reason: `Error: ${error.message}` }
      });
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} (${Math.round(passedTests/totalTests*100)}%)`);
  console.log(`Failed: ${totalTests - passedTests} (${Math.round((totalTests-passedTests)/totalTests*100)}%)`);
  
  // Print failed tests
  const failedTests = results.filter(r => !r.analysis.passed);
  if (failedTests.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    failedTests.forEach((test, index) => {
      console.log(`${index + 1}. ${test.scenario.category}: ${test.scenario.input}`);
      console.log(`   Reason: ${test.analysis.reason}`);
    });
  }

  // Generate detailed report
  generateDetailedReport(results);
};

const analyzeResponse = (response, scenario) => {
  if (!response) {
    return { passed: false, reason: 'No response received' };
  }

  // Check if response has required fields
  if (!response.text && (!response.sessionCards || response.sessionCards.length === 0)) {
    return { passed: false, reason: 'Response missing both text and session cards' };
  }

  // Scenario-specific validation
  switch (scenario.expectedType) {
    case 'no-availability':
      if (!response.text.toLowerCase().includes('no') && !response.text.toLowerCase().includes('not found')) {
        return { passed: false, reason: 'Should indicate no availability' };
      }
      break;
      
    case 'venue-list':
      if (!response.sessionCards || response.sessionCards.length < 3) {
        return { passed: false, reason: 'Should show multiple venues' };
      }
      break;
      
    case 'insufficient-input':
      if (!response.needsMoreInfo && !response.text.toLowerCase().includes('more')) {
        return { passed: false, reason: 'Should ask for more information' };
      }
      break;
      
    case 'invalid-location':
      if (!response.text.toLowerCase().includes('jakarta')) {
        return { passed: false, reason: 'Should mention Jakarta service area' };
      }
      break;
      
    case 'invalid-time':
      if (!response.text.toLowerCase().includes('past') && !response.text.toLowerCase().includes('future')) {
        return { passed: false, reason: 'Should address past date issue' };
      }
      break;
      
    case 'bahasa-indonesia':
      if (!response.text.includes('lapangan') && !response.text.includes('tersedia')) {
        return { passed: false, reason: 'Should respond in Bahasa Indonesia' };
      }
      break;
      
    case 'nearby-venues':
      if (!response.text.toLowerCase().includes('nearby') && !response.text.toLowerCase().includes('booked')) {
        return { passed: false, reason: 'Should mention nearby alternatives when location is booked' };
      }
      if (!response.sessionCards || response.sessionCards.length < 2) {
        return { passed: false, reason: 'Should show multiple nearby venue options' };
      }
      break;
      
    default:
      // For successful matches, check if we have session cards
      if (scenario.category === 'Successful Match' && (!response.sessionCards || response.sessionCards.length === 0)) {
        return { passed: false, reason: 'Successful match should include session cards' };
      }
  }

  return { passed: true, reason: 'Response meets expectations' };
};

const generateDetailedReport = (results) => {
  console.log('\n📋 DETAILED REPORT');
  console.log('='.repeat(60));
  
  const categories = {};
  results.forEach(result => {
    const category = result.scenario.category;
    if (!categories[category]) {
      categories[category] = { total: 0, passed: 0 };
    }
    categories[category].total++;
    if (result.analysis.passed) {
      categories[category].passed++;
    }
  });

  Object.keys(categories).forEach(category => {
    const stats = categories[category];
    const percentage = Math.round(stats.passed / stats.total * 100);
    console.log(`${category}: ${stats.passed}/${stats.total} (${percentage}%)`);
  });

  console.log('\n💡 RECOMMENDATIONS:');
  console.log('1. Implement proper typo correction for user inputs');
  console.log('2. Add comprehensive error handling for edge cases');
  console.log('3. Improve language detection and multi-language support');
  console.log('4. Add more contextual responses for ambiguous requests');
  console.log('5. Implement better validation for time and location inputs');
};

// Run the tests
runTestScenarios().catch(console.error);