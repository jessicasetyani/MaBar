# MaBar AI Chat Architecture

## Overview
MaBar uses a **Frontend-First AI Architecture** where AI processing happens client-side, and Back4App serves purely as Database-as-a-Service (DBaaS).

## Architecture Flow

```
User Query → AI Logic → Toolbox (Raw Data) → AI Presenter → UI Response
```

### 1. User Input
- User types query in AI chat interface
- Examples: "Find me a partner for tonight", "Show available courts"

### 2. AI Logic (Action Selection)
- **Google Gemini 2.5 Flash Lite** analyzes user intent
- Selects appropriate toolbox action (findMatch, getAvailableVenues, etc.)
- Returns structured JSON: `{"action": "findMatch", "parameters": {...}}`

### 3. Toolbox Execution (Raw Data Only)
- Executes selected action against Back4App database
- Returns **raw data only** - no formatting or UI decisions
- Example: `{"data": [venue1, venue2], "isEmpty": false}`

### 4. AI Presenter (Smart Formatting)
- **Smart AI Presenter** analyzes raw data quantity and quality
- Decides optimal presentation: text-only vs cards vs combined
- Groups/organizes multiple results intelligently
- Adapts tone based on user skill level

### 5. UI Response
- Displays AI-generated text response
- Shows session cards only when they add value
- Cards show venue names, pricing, and booking options

## Key Components

### AI Logic Service (`aiMatchmakingService.ts`)
```typescript
// 1. AI Logic - Determines action
const aiRequest = await this.getAIAnalysis(userInput, userPreferences)
// Returns: {"action": "findMatch", "parameters": {"location": "Senayan"}}

// 2. Toolbox - Raw data only
const toolboxResponse = await this.executeToolboxAction(aiRequest)
// Returns: {"data": [venues], "isEmpty": false}

// 3. AI Presenter - Smart formatting
const response = await this.presentResults(userInput, aiRequest.action, toolboxResponse)
// Returns: {"text": "Found 3 venues!", "sessionCards": [...]}
```

### Toolbox Service (`matchmakingToolboxService.ts`)
```typescript
// Raw data interface - no formatting
export interface ToolboxResponse {
  data: any
  error?: string
  isEmpty?: boolean
}

// Example toolbox method
static async getAvailableVenues(params: any): Promise<ToolboxResponse> {
  const venues = await this.queryVenues(params)
  return {
    data: venues,
    isEmpty: venues.length === 0
  }
}
```

### AI Presenter Service (`aiPresenterService.ts`)
```typescript
// Smart presenter analyzes data and creates optimal response
static async presentResults(request: PresenterRequest): Promise<PresenterResponse> {
  const dataAnalysis = this.analyzeRawData(rawData, toolboxAction)
  
  // Decides: text-only vs cards based on data quantity/quality
  if (dataAnalysis.recommendedFormat === 'text-only') {
    return { text: "Smart contextual message" }
  }
  
  // Creates organized session cards when beneficial
  return {
    text: "Found great options!",
    sessionCards: this.createSmartCards(rawData)
  }
}
```

### Environment Configuration
```env
# .env (project root)
VITE_BACK4APP_APP_ID="your_app_id"
VITE_BACK4APP_JAVASCRIPT_KEY="your_js_key"
VITE_BACK4APP_MASTER_KEY="your_master_key"
VITE_GOOGLE_API_KEY="your_gemini_key"  # For MaBar frontend
GOOGLE_API_KEY="your_gemini_key"       # For Taskmaster
OPENROUTER_API_KEY="your_openrouter_key"  # For Taskmaster
```

### Database Schema (Back4App)
```javascript
// Venue Collection
{
  name: String,           // "Jakarta Padel Center"
  isActive: Boolean,      // true
  pricing: Object,        // { hourlyRate: 175000 }
  address: Object,        // { city: "Jakarta", area: "Senayan" }
  facilities: Array,      // ["Indoor Courts", "Parking"]
  rating: Number          // 4.5
}
```

## Benefits of This Architecture

### ✅ Advantages
- **Separation of Concerns**: Logic, Data, and Presentation are separate
- **Smart AI Presenter**: Dynamically decides optimal UI format
- **Raw Data Toolbox**: Pure data retrieval without hardcoded responses
- **Intelligent Grouping**: AI organizes multiple results logically
- **Adaptive Responses**: Tone adjusts to user skill level
- **No Cloud Functions**: Simpler deployment and maintenance
- **Direct Database Access**: Faster queries, no API overhead

### ⚠️ Considerations
- **API Key Exposure**: Gemini key visible in frontend (use rate limiting)
- **Client Dependencies**: Requires internet for AI processing
- **Database Security**: Relies on Parse ACL for data protection

## Data Flow Example

1. **User**: "Find me a partner for tonight"
2. **AI Logic**: `{"action": "findMatch", "parameters": {"time": "tonight"}}`
3. **Toolbox**: `{"data": {"venues": [3], "players": [2], "sessions": [1]}, "isEmpty": false}`
4. **AI Presenter**: Analyzes 6 total results → decides to show cards
5. **UI Response**: "Great! Found 6 options:" + 3 organized session cards

## Smart Presenter Decision Examples

- **"Hi"** → Text-only greeting (no cards)
- **1 venue found** → Text + 1 card with details
- **6 venues found** → Text + 3 best venues grouped by area
- **No results** → Text-only with suggestions (no cards)
- **Join session** → Text + confirmation card

## Setup Instructions

### 1. Install Dependencies
```bash
npm install @google/genai parse
```

### 2. Configure Environment
```bash
# Add to .env (project root)
VITE_GOOGLE_API_KEY="your_gemini_api_key"
```

### 3. Add Test Data
```bash
node scripts/add-test-venues.js
```

### 4. Test Integration
- Navigate to `/ai-chat`
- Type: "Find me a partner for tonight"
- Verify: AI response + session cards appear

## File Structure
```
mabar-frontend/src/
├── views/AIChat.vue                    # Main AI chat interface
├── services/
│   ├── aiMatchmakingService.ts         # AI Logic (action selection)
│   ├── matchmakingToolboxService.ts    # Raw data retrieval
│   └── aiPresenterService.ts           # Smart formatting & UI decisions
├── config/env.ts                       # Environment configuration
├── services/back4app.ts                # Parse SDK initialization
└── components/SessionCard.vue          # Session card component

scripts/
└── add-test-venues.js         # Database seeding script

docs/
├── AI_CHAT_ARCHITECTURE.md    # Architecture documentation
└── CLEANUP_SUMMARY.md         # Project cleanup details
```

This architecture provides a clean separation between AI processing (frontend) and data storage (Back4App), making the system both scalable and maintainable.