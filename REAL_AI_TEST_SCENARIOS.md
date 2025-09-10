# Real AI Test Scenarios - Back4App Database

## 🎯 **Complex Scenario Handling Tests**

### **Multi-Step Bookings**
```javascript
// Test 1: Sequential booking process
"Find me a court tomorrow, then help me invite players"
// Expected: AI Logic finds court → AI Presenter asks to confirm → Then switches to player invitation

// Test 2: Venue selection then player matching
"Book Kedoya Padel Club for tomorrow 7pm, then find intermediate players"
// Expected: Books venue → Searches for matching players → Presents invitation options

// Test 3: Group coordination
"I need to organize a session for 4 people tomorrow evening"
// Expected: Finds suitable venues → Asks about skill levels → Suggests player matching
```

### **Context Switching**
```javascript
// Test 4: Time change mid-conversation
"Find me a court tomorrow at 7pm"
"Actually, change that to next week"
// Expected: AI Logic updates context → AI Presenter confirms new timeframe

// Test 5: Location change
"Show me courts in Kedoya"
"Actually, I prefer South Jakarta instead"
// Expected: Context switch detected → New search with updated location

// Test 6: Complete intent change
"Find me a court in Kedoya"
"Never mind, I want to see my booking history instead"
// Expected: AI Logic detects intent change → Switches to booking history retrieval
```

### **Ambiguous Requests**
```javascript
// Test 7: Vague location
"Find me something good for padel"
// Expected: AI Logic asks for clarification → AI Presenter suggests popular venues

// Test 8: Unclear timing
"I want to play padel soon"
// Expected: Multi-turn negotiation about specific timing preferences

// Test 9: Skill level ambiguity
"Find me players to play with"
// Expected: AI Logic asks about skill level → AI Presenter suggests skill assessment
```

### **Error Recovery**
```javascript
// Test 10: AI Logic misunderstanding
"Book me a court at Plaza Indonesia tomorrow"
// If AI Logic misses that it's a venue name
// Expected: AI Presenter catches error → Asks AI Logic to search by venue name

// Test 11: Invalid time handling
"Find me a court at 25:00 tomorrow"
// Expected: AI Logic processes invalid time → AI Presenter suggests valid alternatives

// Test 12: Impossible requests
"Find me a free court at Senayan Padel Center"
// Expected: AI Logic finds no free courts → AI Presenter negotiates paid alternatives
```

## 🧪 **Real Database Test Commands**

### **Setup**
```bash
# Use existing Back4App data + seed realistic venues/players
node scripts/seedDatabaseForAITesting.js
```

### **Test Individual Scenarios**
```javascript
// Open MaBar app → AI Chat → Console

// Multi-step booking
await AICoordinatorService.processUserInput("Find me a court tomorrow, then help me invite players")

// Context switching  
await AICoordinatorService.processUserInput("Find me a court tomorrow at 7pm")
await AICoordinatorService.processUserInput("Actually, change that to next week")

// Ambiguous request
await AICoordinatorService.processUserInput("Find me something good for padel")

// Error recovery
await AICoordinatorService.processUserInput("Book me a court at 25:00 tomorrow")
```

### **Monitor AI Negotiations**
```javascript
// After each test, check negotiation
EnhancedAICommunication.getNegotiationHistory()
AIFlowLogger.printFlowSummary()
```

## 📊 **Expected AI Behavior**

### **Multi-Step Bookings**
- **Round 1**: AI Logic finds venues → AI Presenter confirms selection
- **Round 2**: AI Logic switches to player search → AI Presenter formats invitations
- **Consensus**: Step-by-step guidance through complete booking process

### **Context Switching**
- **Detection**: AI Logic recognizes context change in conversation history
- **Negotiation**: AI Presenter confirms user wants to change previous request
- **Update**: Both AIs update accumulated information with new context

### **Ambiguous Requests**
- **Round 1**: AI Logic identifies missing information → AI Presenter asks clarifying questions
- **Round 2**: AI Logic processes clarification → AI Presenter suggests popular options
- **Fallback**: If still unclear, show popular venues/players as starting point

### **Error Recovery**
- **Detection**: AI Presenter catches AI Logic processing errors
- **Correction**: AI Presenter asks AI Logic to reprocess with corrected understanding
- **Validation**: Both AIs confirm corrected interpretation before proceeding

## 🎯 **Success Criteria**

### **Multi-Step Handling**
- ✅ Maintains context across booking steps
- ✅ Smooth transition from venue to player search
- ✅ Clear guidance through complete process

### **Context Switching**
- ✅ Detects when user changes requirements
- ✅ Updates conversation context appropriately
- ✅ Confirms changes before proceeding

### **Ambiguity Resolution**
- ✅ Identifies unclear requests
- ✅ Asks appropriate clarifying questions
- ✅ Provides helpful suggestions when unclear

### **Error Recovery**
- ✅ AI Presenter catches AI Logic errors
- ✅ Graceful handling of invalid inputs
- ✅ Suggests valid alternatives

## 🚀 **One-by-One Testing Process**

### **Test 1: Multi-Step Booking**
```javascript
AICoordinatorService.resetConversation()
await AICoordinatorService.processUserInput("Find me a court tomorrow, then help me invite players")
// Check: Does it handle venue search first, then switch to player invitation?
```

### **Test 2: Context Switch**
```javascript
AICoordinatorService.resetConversation()
await AICoordinatorService.processUserInput("Find me a court tomorrow at 7pm")
await AICoordinatorService.processUserInput("Actually, change that to next week")
// Check: Does it update the timeframe and search again?
```

### **Test 3: Ambiguous Request**
```javascript
AICoordinatorService.resetConversation()
await AICoordinatorService.processUserInput("Find me something good for padel")
// Check: Does it ask for clarification or suggest popular options?
```

### **Test 4: Error Recovery**
```javascript
AICoordinatorService.resetConversation()
await AICoordinatorService.processUserInput("Book me a court at 25:00 tomorrow")
// Check: Does AI Presenter catch the invalid time and suggest alternatives?
```

Each test should show detailed AI negotiation logs and demonstrate the enhanced communication capabilities.