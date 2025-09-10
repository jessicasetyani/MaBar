# Complete AI Test Scenarios for Real Database Testing

## 🎯 **Database Preparation**

### **Option 1: Keep Booking History (Recommended)**
```bash
# Don't clean database - keep existing bookings for realistic scenarios
# Add comprehensive seed data
node scripts/seedDatabaseForAITesting.js
```

### **Option 2: Fresh Start**
```bash
# Clean database first, then seed
# (Only if you want completely fresh data)
```

## 📊 **Seed Data Coverage**

### **Venues (6 locations)**
- **Kedoya Area**: Kedoya Padel Club, Padel Arena Kedoya
- **South Jakarta**: Senayan Padel Center, Pondok Indah Padel  
- **Central Jakarta**: Plaza Indonesia Padel (premium)
- **Budget Option**: Cengkareng Sports Center

### **Players (10 profiles)**
- **Beginners**: 3 players (various time preferences)
- **Intermediate**: 4 players (different locations)
- **Advanced**: 3 players (premium venues)

### **Booking History**
- Past completed bookings
- Upcoming reservations
- Different venues and player combinations

### **Open Sessions**
- Tomorrow evening sessions
- Weekend morning sessions
- Various skill levels

## 🧪 **Complete Test Scenarios**

### **1. Simple Scenarios (Quick Consensus)**

```javascript
// Test: Basic venue search with complete info
"I want to find a padel court in Kedoya tomorrow at 7pm"
// Expected: Quick consensus, show available venues with cards

// Test: Player search with skill level
"Looking for intermediate players to play with tomorrow at 8pm"
// Expected: Quick consensus, show matching players

// Test: Join existing session
"I want to join a session tomorrow evening"
// Expected: Quick consensus, show open sessions
```

### **2. Multi-Turn Negotiations (Medium Complexity)**

```javascript
// Test: Incomplete information requiring negotiation
"I want to play padel tomorrow"
// AI Logic: Need time and location
// AI Presenter: Ask for time first, then location
// Negotiation: Which question to ask first?

// Test: Flexible preferences
"Find me a court this weekend, I'm flexible on time and location"
// AI Logic: Show all weekend options
// AI Presenter: Too many options, filter by popularity
// Negotiation: How to present choices?

// Test: Budget constraints
"Find me a court under 150k per hour"
// AI Logic: Filter by price, show budget venues
// AI Presenter: Explain why limited options
// Negotiation: How to handle limited results?
```

### **3. Complex Scenarios (Multi-Round Negotiations)**

```javascript
// Test: No availability scenario
"I need a court tonight at 8pm in Kedoya"
// Round 1 - AI Logic: No availability found
// Round 1 - AI Presenter: Suggest alternatives (different time/location)
// Round 2 - AI Logic: Show nearby venues or different times
// Round 2 - AI Presenter: Present as "closest matches"
// Consensus: Alternative suggestions with explanations

// Test: Conflicting user history
"Book the same court as last week but with different players"
// Round 1 - AI Logic: Found previous booking, need player preferences
// Round 1 - AI Presenter: Too complex, break into steps
// Round 2 - AI Logic: Show venue first, then ask about players
// Round 2 - AI Presenter: Good approach, confirm venue then players
// Consensus: Step-by-step booking process

// Test: Skill level mismatch
"I'm a beginner but want to play with advanced players"
// Round 1 - AI Logic: Show advanced players
// Round 1 - AI Presenter: Warn about skill gap
// Round 2 - AI Logic: Suggest intermediate players as bridge
// Round 2 - AI Presenter: Agree, but also show coaching options
// Consensus: Mixed approach with skill development path
```

### **4. Booking History Scenarios**

```javascript
// Test: Show booking history
"Show me my past bookings"
// Expected: Quick consensus, display booking history with details

// Test: Repeat previous booking
"Book the same court as my last session"
// Expected: Medium complexity, confirm details before booking

// Test: Modify upcoming booking
"Change my booking tomorrow to a different time"
// Expected: Complex negotiation about availability and policies
```

### **5. Edge Cases with Enhanced Communication**

```javascript
// Test: Ambiguous location
"Find me a court somewhere in Jakarta"
// Negotiation: How specific to get with location questions?

// Test: Peak time booking
"I want to play during rush hour"
// Negotiation: Show limited options vs suggest better times?

// Test: Group size uncertainty
"Find players for my group"
// Negotiation: Ask group size first vs show various options?

// Test: Mixed skill levels
"Find players for beginners and intermediates"
// Negotiation: Separate sessions vs mixed skill session?
```

## 🚀 **Running Enhanced AI Tests**

### **Basic Enhanced Communication Test**
```javascript
// Test multi-turn negotiation
EnhancedAITest.testMultiTurnNegotiation()

// Test quick consensus
EnhancedAITest.testQuickConsensus()

// Test complex scenario handling
EnhancedAITest.testComplexScenarios()
```

### **Real Database Integration Tests**
```javascript
// Test with real venue data
RealDatabaseTest.testVenueSearch()

// Test with real player profiles
RealDatabaseTest.testPlayerMatching()

// Test booking history scenarios
RealDatabaseTest.testBookingHistory()

// Test session joining
RealDatabaseTest.testSessionJoining()
```

### **Complete Flow Tests**
```javascript
// Test entire conversation flows
CompleteFlowTest.testSimpleToComplex()

// Test negotiation audit trail
CompleteFlowTest.testNegotiationLogging()

// Test performance with real data
CompleteFlowTest.testRealDataPerformance()
```

## 📋 **Expected AI Negotiation Patterns**

### **Simple Scenarios (0 rounds)**
- Clear user intent + available data = immediate response
- Example: "Court in Kedoya tomorrow 7pm" → Show available courts

### **Medium Scenarios (1-2 rounds)**
- Missing info or presentation choice needed
- Round 1: AI Logic proposes approach, AI Presenter suggests refinement
- Round 2: Agreement reached

### **Complex Scenarios (2-3 rounds)**
- Ambiguous intent, no availability, or conflicting requirements
- Multiple rounds of negotiation to find best approach
- Fallback decision if no consensus

## 🔍 **Monitoring Enhanced Communication**

### **Negotiation Logs**
```javascript
// View negotiation history
EnhancedAICommunication.getNegotiationHistory()

// Get negotiation statistics
EnhancedAICommunication.getNegotiationStats()

// Export audit trail
EnhancedAICommunication.exportNegotiationLog()
```

### **Performance Metrics**
- Negotiation rounds per scenario type
- Consensus success rate
- Time to resolution
- User satisfaction indicators

## 🎯 **Success Criteria**

### **Enhanced Communication**
- ✅ Multi-turn negotiations working
- ✅ Quick consensus for simple cases
- ✅ Complex scenario handling
- ✅ Complete audit trail
- ✅ Fallback mechanisms

### **Real Database Integration**
- ✅ Realistic venue searches
- ✅ Player matching with profiles
- ✅ Booking history retrieval
- ✅ Session joining functionality
- ✅ No availability handling

### **User Experience**
- ✅ Natural conversation flow
- ✅ Appropriate response complexity
- ✅ Clear explanations for decisions
- ✅ Helpful alternatives when needed

This comprehensive testing setup provides realistic scenarios with enhanced AI communication capabilities, using real database data for authentic user experiences.