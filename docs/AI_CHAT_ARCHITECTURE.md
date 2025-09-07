# MaBar AI Chat Architecture

## Overview
MaBar uses a **Frontend-First AI Architecture** where AI processing happens client-side, and Back4App serves purely as Database-as-a-Service (DBaaS).

## Architecture Flow

```
User Query → Frontend (Gemini AI) → Back4App Database → Session Cards
```

### 1. User Input
- User types query in AI chat interface
- Examples: "Find me a partner for tonight", "Show available courts"

### 2. AI Processing (Client-Side)
- **Google Gemini 2.5 Flash Lite** processes query directly in browser
- Uses `@google/genai` SDK with API key from environment
- Generates natural language response

### 3. Database Query (Direct)
- Frontend queries Back4App Parse database directly
- Searches `Venue` collection for active courts
- No cloud functions needed

### 4. Response Generation
- AI response displayed to user
- Session cards generated from database results
- Cards show venue names, pricing, and booking options

## Key Components

### Frontend (`mabar-frontend/src/views/AIChat.vue`)
```typescript
// AI Processing
const ai = new GoogleGenAI({ apiKey: env.GOOGLE_API_KEY })
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash-lite',
  contents: [{ role: 'user', parts: [{ text: prompt }] }]
})

// Database Query
const Venue = Parse.Object.extend('Venue')
const query = new Parse.Query(Venue)
query.equalTo('isActive', true)
const venues = await query.find()
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
- **No Cloud Functions**: Simpler deployment and maintenance
- **Direct Database Access**: Faster queries, no API overhead
- **Client-Side AI**: Reduced server costs, better scalability
- **Real-Time Data**: Direct Parse queries ensure fresh data
- **Simplified Stack**: Frontend + Database only

### ⚠️ Considerations
- **API Key Exposure**: Gemini key visible in frontend (use rate limiting)
- **Client Dependencies**: Requires internet for AI processing
- **Database Security**: Relies on Parse ACL for data protection

## Data Flow Example

1. **User**: "Find me a partner for tonight"
2. **Gemini AI**: Generates helpful response about finding partners
3. **Database Query**: `Parse.Query(Venue).equalTo('isActive', true).find()`
4. **Results**: Returns 3 active venues
5. **UI Update**: Displays AI response + 3 session cards with venue details

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
├── views/AIChat.vue           # Main AI chat interface
├── config/env.ts              # Environment configuration
├── services/back4app.ts       # Parse SDK initialization
└── components/SessionCard.vue # Session card component

scripts/
└── add-test-venues.js         # Database seeding script

docs/
├── AI_CHAT_ARCHITECTURE.md    # Architecture documentation
└── CLEANUP_SUMMARY.md         # Project cleanup details
```

This architecture provides a clean separation between AI processing (frontend) and data storage (Back4App), making the system both scalable and maintainable.