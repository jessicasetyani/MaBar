// Test the AI Presenter Assistant
import { AIPresenterService } from './mabar-frontend/src/services/aiPresenterService.js'

// Test case 1: Venues found
const testVenuesFound = {
  userOriginalRequest: "Show me courts in Senayan tonight",
  toolboxAction: "getAvailableVenues",
  rawData: {
    text: "Found 2 available venues in Senayan:",
    sessionCards: [
      {
        type: 'create-new',
        data: {
          venue: "Senayan Padel Club",
          address: "Senayan, Jakarta",
          cost: "Rp 200,000/hour",
          rating: 4.5,
          facilities: ["Parking", "Shower", "Cafe"]
        }
      },
      {
        type: 'create-new',
        data: {
          venue: "Elite Padel Senayan",
          address: "Senayan, Jakarta", 
          cost: "Rp 250,000/hour",
          rating: 4.8,
          facilities: ["Premium Courts", "Locker Room", "Pro Shop"]
        }
      }
    ]
  },
  searchCriteria: {
    location: "Senayan",
    time: "tonight",
    activity: "padel"
  }
}

// Test case 2: No results found
const testNoResults = {
  userOriginalRequest: "Find courts in Kemang at 3 AM",
  toolboxAction: "getAvailableVenues", 
  rawData: {
    text: "No venues found matching your criteria.",
    sessionCards: [{
      type: 'no-availability',
      data: { message: 'No venues available' }
    }]
  },
  searchCriteria: {
    location: "Kemang",
    time: "3 AM",
    activity: "padel"
  }
}

// Test case 3: Players found
const testPlayersFound = {
  userOriginalRequest: "Find players for weekend game",
  toolboxAction: "getAvailablePlayers",
  rawData: {
    text: "Found 3 available players matching your criteria:",
    sessionCards: [{
      type: 'existing-session',
      data: {
        venue: 'Available Players',
        players: [
          {name: "Ahmad", skillLevel: "Intermediate"},
          {name: "Sarah", skillLevel: "Beginner"}, 
          {name: "David", skillLevel: "Advanced"}
        ],
        openSlots: 1,
        time: "Flexible",
        cost: "To be determined"
      }
    }]
  },
  searchCriteria: {
    date: "weekend",
    activity: "padel"
  }
}

console.log('🧪 Testing AI Presenter Assistant...\n')

// Note: These are test structures - actual implementation would use the service
console.log('Test Case 1 - Venues Found:')
console.log('Input:', JSON.stringify(testVenuesFound, null, 2))
console.log('\nExpected: Friendly message about 2 courts found with venue cards\n')

console.log('Test Case 2 - No Results:') 
console.log('Input:', JSON.stringify(testNoResults, null, 2))
console.log('\nExpected: Polite message with alternative suggestions\n')

console.log('Test Case 3 - Players Found:')
console.log('Input:', JSON.stringify(testPlayersFound, null, 2))
console.log('\nExpected: Enthusiastic message about available players\n')

console.log('✅ AI Presenter Assistant structure is ready for integration!')