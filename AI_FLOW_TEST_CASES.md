# MaBar AI Flow Test Cases

## 🔄 AI Flow Process

**Entry Point:** `AICoordinatorService.processUserInput()`
**Core Flow:** `AISimpleFlow.processUserInput()`

### Function Call Chain:
1. `aiThinks()` - AI analyzes user input
2. `toolboxGetData()` - Gets database data if needed
3. `aiPresents()` - AI creates response with UI cards

## 📋 Test Case Scenarios

### **Test Case 1: Greeting**
```
Input: "hello"
```

**Function Calls:**
1. `AICoordinatorService.processUserInput("hello")`
2. `AISimpleFlow.processUserInput("hello")`
3. `aiThinks("hello")`
   - Calls Google Gemini API
   - AI Decision: `{ reasoning: "User is greeting", needsData: false }`
4. `toolboxGetData()` - **SKIPPED** (needsData = false)
5. `aiPresents("hello", aiDecision, null)`
   - Calls Google Gemini API
   - Returns: `{ text: "Hi! How can I help with padel?", sessionCards: [] }`

**Expected Output:**
```
👤 [USER] hello
🧠 [AI THINKS] User is greeting
🎯 [AI RESPONSE] Hi! How can I help with padel?
```

---

### **Test Case 2: Incomplete Request**
```
Input: "tomorrow morning"
```

**Function Calls:**
1. `AICoordinatorService.processUserInput("tomorrow morning")`
2. `AISimpleFlow.processUserInput("tomorrow morning")`
3. `aiThinks("tomorrow morning")`
   - AI Decision: `{ reasoning: "User wants to play, needs location", needsData: false }`
4. `toolboxGetData()` - **SKIPPED** (needsData = false)
5. `aiPresents("tomorrow morning", aiDecision, null)`
   - Returns: `{ text: "Great! Which area in Jakarta?", sessionCards: [] }`

**Expected Output:**
```
👤 [USER] tomorrow morning
🧠 [AI THINKS] User wants to play, needs location
🎯 [AI RESPONSE] Great! Which area in Jakarta?
```

---

### **Test Case 3: Complete Venue Search**
```
Input: "find courts tomorrow morning kedoya"
```

**Function Calls:**
1. `AICoordinatorService.processUserInput("find courts tomorrow morning kedoya")`
2. `AISimpleFlow.processUserInput("find courts tomorrow morning kedoya")`
3. `aiThinks("find courts tomorrow morning kedoya")`
   - AI Decision: 
   ```json
   {
     "reasoning": "User wants venues in Kedoya tomorrow morning",
     "needsData": true,
     "dataRequest": {
       "type": "venues",
       "params": { "area": "kedoya", "date": "tomorrow", "time": "morning" }
     }
   }
   ```
4. `toolboxGetData(dataRequest)`
   - Calls `VenueService.searchVenues({ area: "kedoya", date: "tomorrow", time: "morning" })`
   - Returns: `[venue1, venue2, venue3, ...]` (8 venues)
5. `aiPresents("find courts tomorrow morning kedoya", aiDecision, venueData)`
   - AI analyzes 8 venues
   - Returns: 
   ```json
   {
     "text": "Found 8 great courts in Kedoya for tomorrow morning!",
     "sessionCards": [
       { "type": "create-new", "data": { "venue": "Court A", ... } },
       { "type": "create-new", "data": { "venue": "Court B", ... } },
       { "type": "create-new", "data": { "venue": "Court C", ... } }
     ]
   }
   ```

**Expected Output:**
```
👤 [USER] find courts tomorrow morning kedoya
🧠 [AI THINKS] User wants venues in Kedoya tomorrow morning
🔧 [TOOLBOX] Got 8 results
🎯 [AI RESPONSE] Found 8 great courts in Kedoya for tomorrow morning!
```

---

### **Test Case 4: Player Search**
```
Input: "find players intermediate level tonight"
```

**Function Calls:**
1. `AICoordinatorService.processUserInput("find players intermediate level tonight")`
2. `AISimpleFlow.processUserInput("find players intermediate level tonight")`
3. `aiThinks("find players intermediate level tonight")`
   - AI Decision:
   ```json
   {
     "reasoning": "User wants to find intermediate players for tonight",
     "needsData": true,
     "dataRequest": {
       "type": "players",
       "params": { "skillLevel": "intermediate", "time": "tonight" }
     }
   }
   ```
4. `toolboxGetData(dataRequest)`
   - Calls `PlayerService.searchPlayers({ skillLevel: "intermediate", time: "tonight" })`
   - Returns: `[player1, player2, player3]` (3 players)
5. `aiPresents("find players intermediate level tonight", aiDecision, playerData)`
   - Returns:
   ```json
   {
     "text": "Found 3 intermediate players available tonight!",
     "sessionCards": [
       { "type": "existing-session", "data": { "players": [...], ... } }
     ]
   }
   ```

**Expected Output:**
```
👤 [USER] find players intermediate level tonight
🧠 [AI THINKS] User wants to find intermediate players for tonight
🔧 [TOOLBOX] Got 3 results
🎯 [AI RESPONSE] Found 3 intermediate players available tonight!
```

---

### **Test Case 5: No Results Found**
```
Input: "find courts 3am sunday expensive area"
```

**Function Calls:**
1. `AICoordinatorService.processUserInput("find courts 3am sunday expensive area")`
2. `AISimpleFlow.processUserInput("find courts 3am sunday expensive area")`
3. `aiThinks("find courts 3am sunday expensive area")`
   - AI Decision:
   ```json
   {
     "reasoning": "User wants courts at unusual time",
     "needsData": true,
     "dataRequest": {
       "type": "venues",
       "params": { "time": "3am", "day": "sunday" }
     }
   }
   ```
4. `toolboxGetData(dataRequest)`
   - Calls `VenueService.searchVenues({ time: "3am", day: "sunday" })`
   - Returns: `[]` (no venues)
5. `aiPresents("find courts 3am sunday expensive area", aiDecision, [])`
   - Returns:
   ```json
   {
     "text": "No courts are available at 3am on Sunday. Most courts open at 6am. Would you like to see morning options?",
     "sessionCards": [
       { "type": "no-availability", "data": { "message": "No courts open at 3am" } }
     ]
   }
   ```

**Expected Output:**
```
👤 [USER] find courts 3am sunday expensive area
🧠 [AI THINKS] User wants courts at unusual time
🔧 [TOOLBOX] Got 0 results
🎯 [AI RESPONSE] No courts are available at 3am on Sunday...
```

---

### **Test Case 6: Card Interaction**
```
Input: "join_session:venue_123" (card click)
```

**Function Calls:**
1. `AICoordinatorService.processUserInput("join_session:venue_123", "card-interaction")`
   - Converts to: `"User wants to join session for venue_123"`
2. `AISimpleFlow.processUserInput("User wants to join session for venue_123")`
3. `aiThinks("User wants to join session for venue_123")`
   - AI Decision: `{ reasoning: "User wants to join a session", needsData: false }`
4. `toolboxGetData()` - **SKIPPED**
5. `aiPresents("User wants to join session for venue_123", aiDecision, null)`
   - Returns:
   ```json
   {
     "text": "Great! I'm processing your request to join the session...",
     "sessionCards": [
       { "type": "join-confirmation", "data": { "venue": "venue_123", "status": "joining" } }
     ]
   }
   ```

**Expected Output:**
```
👤 [USER] User wants to join session for venue_123
🧠 [AI THINKS] User wants to join a session
🎯 [AI RESPONSE] Great! I'm processing your request to join...
```

## 🔧 Function Details

### `aiThinks(userInput)`
- **Purpose**: AI analyzes what user wants
- **API Call**: Google Gemini API
- **Returns**: `{ reasoning, needsData, dataRequest? }`

### `toolboxGetData(dataRequest)`
- **Purpose**: Get database data if AI needs it
- **Calls**: `VenueService` | `PlayerService` | `SessionService`
- **Returns**: Raw database results or `null`

### `aiPresents(userInput, aiDecision, data)`
- **Purpose**: AI creates final response with UI cards
- **API Call**: Google Gemini API
- **Returns**: `{ text, sessionCards }`

## 🎯 Key Points

1. **AI Always Thinks First** - Every request goes through AI analysis
2. **Toolbox Only When Needed** - Data fetching only if AI decides it's necessary
3. **AI Presents Everything** - Final formatting and UI cards decided by AI
4. **Conversation Memory** - Last 6 messages maintained for context
5. **Dynamic Responses** - No hardcoded rules, AI adapts to each situation