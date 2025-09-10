# MaBar AI Architecture & Flow

## 🏗️ Class Structure & Functions

### 1. **AICoordinatorService** (Entry Point)
**Purpose**: Main interface for all AI interactions
**Functions**:
- `processUserInput()` - Routes text/card interactions to appropriate handlers
- `initializeUserPreferences()` - Loads user profile data for context
- `handleCardInteraction()` - Processes UI card clicks (join/create session)

### 2. **AIConversationManager** (Core AI Logic)
**Purpose**: Handles multi-turn conversations with Google Gemini API
**Functions**:
- `processUserInput()` - Main conversation processing with logging
- `buildContextualPrompt()` - Combines user input with accumulated context
- `parseAIResponse()` - Converts AI JSON response to structured data
- `executeAIDecision()` - Routes to information gathering, search, or presentation
- `executeToolboxAction()` - Calls database services (venues, players, sessions)
- `presentSearchResults()` - AI decides how to format and present results
- `addMessage()` - Maintains conversation history for context
- `updateUserContext()` - Accumulates user information across messages

### 3. **AIFlowLogger** (Logging System)
**Purpose**: Tracks complete AI conversation flow for debugging
**Functions**:
- `startSession()` - Begins new conversation session
- `logAIThinking()` - Records AI decision-making process
- `logToolboxRequest/Response()` - Tracks database queries and results
- `logAIPresentation()` - Records how AI formats final response
- `logFinalResponse()` - Logs complete response sent to user

## 🔄 Complete AI Flow with Logging

```
👤 USER: "hello"
🚀 [AI FLOW] Starting session: session_1704123456_abc123def
👤 [USER → AI] "hello"

🧠 [AI THINKING] Mode: information_gathering
🧠 [AI THINKING] Needs more info: true
🧠 [AI THINKING] Accumulated: {}

🎯 [AI → USER] Response ready
🎯 [AI → USER] Text: Yes
🎯 [AI → USER] Cards: 0
✅ [AI FLOW] Session completed

---

👤 USER: "tomorrow morning"
🚀 [AI FLOW] Starting session: session_1704123457_def456ghi
👤 [USER → AI] "tomorrow morning"

🧠 [AI THINKING] Mode: information_gathering
🧠 [AI THINKING] Needs more info: true
🧠 [AI THINKING] Accumulated: {"date": "tomorrow", "time": "morning"}

🎯 [AI → USER] Response ready
🎯 [AI → USER] Text: Yes
🎯 [AI → USER] Cards: 0
✅ [AI FLOW] Session completed

---

👤 USER: "kedoya area"
🚀 [AI FLOW] Starting session: session_1704123458_ghi789jkl
👤 [USER → AI] "kedoya area"

🧠 [AI THINKING] Mode: database_search
🧠 [AI THINKING] Needs more info: false
🧠 [AI THINKING] Accumulated: {"date": "tomorrow", "time": "morning", "location": "kedoya"}
🧠 [AI THINKING] Will execute: findVenues

🔧 [AI → TOOLBOX] Requesting: findVenues
🔧 [AI → TOOLBOX] Parameters: {"area": "kedoya", "date": "tomorrow", "timeSlot": "morning"}
🔧 [TOOLBOX → AI] findVenues completed: 8 results

🎨 [AI PRESENTATION] Decision: format_response
🎨 [AI PRESENTATION] Cards generated: 4
🎨 [AI PRESENTATION] Message: "Found 8 great courts in Kedoya for tomorrow morning!..."

🎯 [AI → USER] Response ready
🎯 [AI → USER] Text: Yes
🎯 [AI → USER] Cards: 4
✅ [AI FLOW] Session completed
```

## 🧠 AI Decision Logic

### Dynamic AI Thinking
```typescript
// AI analyzes user intent and context
{
  "mode": "conversation" | "search" | "presentation",
  "reasoning": "why AI chose this action",
  "accumulatedInfo": {extracted_information},
  "toolboxAction": "action_if_searching",
  "parameters": {search_params_if_needed},
  "message": "natural_response_to_user"
}
```

### Intelligent Context Analysis
```typescript
// AI thinks about what user really wants
// No hardcoded rules - pure AI reasoning
// Adapts to conversation flow naturally
// Makes decisions based on accumulated context
```

### Smart Presentation
```typescript
// AI analyzes results and user intent
// Decides best presentation format dynamically
// Creates appropriate UI cards when helpful
// Provides natural, contextual responses
```

## 🔧 Toolbox Actions

### Available Actions:
- **findVenues**: Search courts by location, date, time
- **findPlayers**: Search available players by skill level, time
- **findSessions**: Search existing sessions to join
- **createSession**: Guide user through session creation

### Parameter Building:
AI accumulates information across multiple user messages:
```typescript
// Message 1: "tomorrow morning"
accumulatedInfo: { date: "tomorrow", time: "morning" }

// Message 2: "kedoya"  
accumulatedInfo: { date: "tomorrow", time: "morning", location: "kedoya" }

// Converts to toolbox parameters:
parameters: {
  area: "kedoya",
  date: "2024-01-15",
  timeSlot: "08:00-12:00"
}
```

## 🎨 Smart Presentation Logic

### Result Analysis:
1. **Quantity**: How many results found?
2. **Quality**: Are results relevant to user request?
3. **Context**: What was user really asking for?
4. **Next Steps**: What actions can user take?

### UI Card Generation:
```typescript
// AI decides card types dynamically:
if (userWantsToJoin && existingSessions.length > 0) {
  cardType = 'existing-session'
} else if (userWantsToCreate || noExistingSessions) {
  cardType = 'create-new'
} else if (noResults) {
  cardType = 'no-availability'
}
```

## 📊 Context Accumulation

### Multi-Turn Memory:
- **Conversation History**: Last 6 messages for context
- **User Preferences**: Profile data (skill level, preferred areas, budget)
- **Accumulated Info**: Extracted data across multiple inputs
- **Search Context**: Previous search results for refinement

### Example Context Building:
```typescript
// Turn 1: User says "hello"
context: { messages: [], accumulatedInfo: {} }

// Turn 2: User says "tomorrow morning"  
context: { 
  messages: [user_hello, ai_welcome, user_tomorrow],
  accumulatedInfo: { date: "tomorrow", time: "morning" }
}

// Turn 3: User says "kedoya"
context: {
  messages: [ai_welcome, user_tomorrow, ai_ask_location, user_kedoya],
  accumulatedInfo: { date: "tomorrow", time: "morning", location: "kedoya" }
}
```

This architecture ensures intelligent, contextual conversations while maintaining proper logging for debugging and optimization.