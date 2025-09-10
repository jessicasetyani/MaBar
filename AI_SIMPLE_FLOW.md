# MaBar AI Simple Flow

## 🎯 Core Concept

**AI thinks → Toolbox gets data → AI presents**

That's it. Simple.

## 🔄 Flow

```
👤 User: "hello"
🧠 AI thinks: "User is greeting, no data needed"
🎯 AI presents: "Hi! How can I help with padel?"

👤 User: "find courts tomorrow"
🧠 AI thinks: "User wants venues, need location data"
🔧 Toolbox: Gets venue data from database
🎯 AI presents: "Found 5 courts..." + venue cards
```

## 📁 Files

- `aiSimpleFlow.ts` - Core AI logic (3 functions)
- `aiCoordinatorService.ts` - Entry point (simplified)

## 🧠 AI Functions

### 1. aiThinks()
- AI analyzes what user wants
- Decides if database data is needed
- Returns reasoning + data request

### 2. toolboxGetData()
- Gets data from database if AI needs it
- Simple switch: venues/players/sessions
- Returns raw data

### 3. aiPresents()
- AI analyzes user request + data
- Creates response with UI cards
- Returns formatted response

## 🔧 Toolbox Role

**Only gets data from database. Nothing else.**

- venues: VenueService.searchVenues()
- players: PlayerService.searchPlayers()  
- sessions: SessionService.searchSessions()

## 🎨 Presenter Role

**AI analyzes data and creates response. Nothing else.**

- Looks at user request
- Looks at database data
- Creates appropriate text + UI cards
- Returns to user

## 💡 Key Points

- **AI does all thinking** - No hardcoded rules
- **Toolbox just gets data** - No logic, just database queries
- **AI presents results** - Analyzes and formats dynamically
- **Simple conversation memory** - Last 6 messages for context

This is clean, simple, and lets AI be truly intelligent.