# Complete AI Test Cases - Simple to Complex

## 🟢 **Level 1: Simple (Quick Consensus)**

### **Basic Venue Search**
```javascript
"Find court in Kedoya tomorrow 7pm"
"Show me courts in Senayan"
"I want to book Plaza Indonesia Padel tomorrow"
```

### **Basic Player Search**
```javascript
"Find intermediate players"
"Show me advanced players in Jakarta"
"Looking for beginner players to play with"
```

### **Basic Greetings**
```javascript
"Hello"
"Hi there"
"Good morning"
```

### **Simple Questions**
```javascript
"What is padel?"
"How much does it cost to play?"
"What are your operating hours?"
```

## 🟡 **Level 2: Medium (1-2 Negotiation Rounds)**

### **Incomplete Information**
```javascript
"I want to play padel tomorrow"
"Find me a court this weekend"
"Looking for players tonight"
"Show me available sessions"
```

### **Preference-Based Search**
```javascript
"Find me a cheap court"
"I want a premium venue"
"Show me courts with parking"
"Find courts near my location"
```

### **Time Flexibility**
```javascript
"Find me a court tomorrow evening"
"I'm flexible on time this weekend"
"Show me morning sessions"
"Any courts available tonight?"
```

### **Skill Level Matching**
```javascript
"Find players at my skill level"
"I'm a beginner, find suitable players"
"Looking for competitive advanced players"
"Match me with similar skill players"
```

## 🟠 **Level 3: Complex (2-3 Negotiation Rounds)**

### **Multi-Step Bookings**
```javascript
"Find me a court tomorrow, then help me invite players"
"Book Kedoya Padel Club for 7pm, then find 3 intermediate players"
"I need to organize a session for 4 people tomorrow"
"Help me plan a padel session from start to finish"
```

### **Context Switching**
```javascript
// Start: "Find me a court tomorrow at 7pm"
// Switch: "Actually, change that to next week"
// Or: "Never mind, show me my booking history instead"
// Or: "I prefer South Jakarta instead of Kedoya"
```

### **Ambiguous Requests**
```javascript
"Find me something good for padel"
"I want to play padel soon"
"Help me with padel stuff"
"Show me the best options"
```

### **Constraint-Heavy Searches**
```javascript
"Find me a court under 200k with parking in South Jakarta tomorrow evening"
"I need 2 courts side by side for 8 people, intermediate level, weekend morning"
"Find the cheapest court with equipment rental near Senayan"
```

### **Error Recovery**
```javascript
"Book me a court at 25:00 tomorrow"
"Find me a court in Bali tomorrow"
"I want to play at 3am"
"Book me 10 courts for tomorrow"
```

## 🔴 **Level 4: Very Complex (3+ Negotiation Rounds)**

### **Booking History Integration**
```javascript
"Show me my past bookings"
"Book the same court as last week"
"Cancel my booking tomorrow and reschedule"
"Find players I've played with before"
```

### **Group Coordination**
```javascript
"I have 6 friends with different skill levels, help organize sessions"
"Plan a tournament for 16 people next weekend"
"Find multiple courts for a company event"
"Coordinate sessions for beginners and advanced players separately"
```

### **Conditional Bookings**
```javascript
"If Kedoya is full, try Senayan, if that's full try anywhere in Jakarta"
"Book me a court only if Carlos Rodriguez can join"
"Find me a backup court in case my regular booking gets cancelled"
```

### **Complex Modifications**
```javascript
"Change my booking from singles to doubles and add 2 more players"
"Move my session to a different venue but keep the same players"
"Split my 4-person session into two 2-person sessions"
```

### **Business Logic Scenarios**
```javascript
"What's the cheapest way to play 3 hours of padel this week?"
"Find me the best value courts considering travel time from Kemang"
"I have a 500k budget for padel this month, optimize my bookings"
```

## 🧪 **Test Commands**

### **Run by Level**
```javascript
// Level 1: Simple
SimpleAITest.runLevel1()

// Level 2: Medium  
SimpleAITest.runLevel2()

// Level 3: Complex
SimpleAITest.runLevel3()

// Level 4: Very Complex
SimpleAITest.runLevel4()
```

### **Individual Tests**
```javascript
// Test specific scenario
await AICoordinatorService.processUserInput("Find court in Kedoya tomorrow 7pm")

// Monitor negotiation
EnhancedAICommunication.getNegotiationHistory()
AIFlowLogger.printFlowSummary()
```

### **Progressive Testing**
```javascript
// Start simple, increase complexity
ProgressiveAITest.runFromSimpleToComplex()
```

## 📊 **Expected Negotiation Patterns**

### **Level 1 (0 rounds)**
- Immediate response
- No AI negotiation needed
- Quick consensus

### **Level 2 (1-2 rounds)**
- Missing info identification
- Clarification questions
- Simple presentation decisions

### **Level 3 (2-3 rounds)**
- Multi-step planning
- Context management
- Error handling
- Alternative suggestions

### **Level 4 (3+ rounds)**
- Complex business logic
- Multiple constraint handling
- Advanced error recovery
- Multi-session coordination

## 🎯 **Success Criteria by Level**

### **Level 1**
- ✅ Response time < 2 seconds
- ✅ 0 negotiation rounds
- ✅ Direct, accurate answers

### **Level 2**
- ✅ Response time < 4 seconds
- ✅ 1-2 negotiation rounds
- ✅ Appropriate clarifying questions

### **Level 3**
- ✅ Response time < 6 seconds
- ✅ 2-3 negotiation rounds
- ✅ Context switching handled
- ✅ Error recovery working

### **Level 4**
- ✅ Response time < 10 seconds
- ✅ 3+ negotiation rounds
- ✅ Complex logic handled
- ✅ Multi-step coordination

## 🚀 **Testing Strategy**

1. **Start with Level 1** - Ensure basic functionality works
2. **Progress to Level 2** - Test information gathering
3. **Move to Level 3** - Validate complex scenarios
4. **Challenge with Level 4** - Test advanced capabilities

Each level builds on the previous, ensuring comprehensive AI system validation.