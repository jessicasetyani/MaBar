# MaBar Smart AI Presenter Guide

## Overview
The Smart AI Presenter intelligently analyzes raw data from toolbox services and creates optimal user experiences by deciding when to show text-only responses vs session cards.

## Architecture

```
Raw Data → Smart Analysis → Dynamic Presentation → User Interface
```

## Core Principles

### 1. **Raw Data Only from Toolbox**
```typescript
// ❌ OLD: Hardcoded responses
return {
  text: "Found 3 venues for you:",
  sessionCards: [...]
}

// ✅ NEW: Raw data only
return {
  data: venues,
  isEmpty: venues.length === 0
}
```

### 2. **Smart Presentation Decisions**
The AI Presenter analyzes data and decides optimal format:

| Scenario | Data | Decision | Output |
|----------|------|----------|---------|
| Greeting | `null` | Text-only | "Hi! How can I help?" |
| 1 venue | `[venue]` | Text + Card | "Perfect match!" + venue card |
| 6 venues | `[venues]` | Text + Grouped Cards | "Great options!" + top 3 by area |
| No results | `[]` | Text-only | "No matches, try different criteria" |
| Join request | `sessionId` | Text + Confirmation | "Joining..." + confirmation card |

### 3. **Intelligent Grouping**
When multiple results exist, the presenter organizes them:

```typescript
// Example: 6 venues found
const venues = [venue1, venue2, venue3, venue4, venue5, venue6]

// AI Presenter groups by area and shows top 3
const groupedCards = [
  { venue: "Senayan Padel", reason: "Closest to you" },
  { venue: "Kemang Club", reason: "Best rating (4.8)" },
  { venue: "PIK Arena", reason: "Most affordable" }
]
```

## Implementation

### Toolbox Service (Raw Data)
```typescript
export interface ToolboxResponse {
  data: any           // Raw database results
  error?: string      // Error message if failed
  isEmpty?: boolean   // Quick empty check
}

static async getAvailableVenues(params: any): Promise<ToolboxResponse> {
  try {
    const venues = await this.queryVenues(params)
    return {
      data: venues,
      isEmpty: venues.length === 0
    }
  } catch (error) {
    return {
      data: [],
      error: error.message,
      isEmpty: true
    }
  }
}
```

### AI Presenter Service (Smart Formatting)
```typescript
static async presentResults(request: PresenterRequest): Promise<PresenterResponse> {
  // 1. Analyze raw data
  const analysis = this.analyzeRawData(rawData, toolboxAction)
  
  // 2. Build smart prompt for AI
  const prompt = this.buildPresenterPrompt(request)
  
  // 3. Get AI-generated response
  const aiResponse = await this.ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: [
      { role: 'user', parts: [{ text: 'Transform raw data into optimal UI response' }] },
      { role: 'model', parts: [{ text: SMART_PRESENTER_SYSTEM_PROMPT }] },
      { role: 'user', parts: [{ text: prompt }] }
    ]
  })
  
  return JSON.parse(aiResponse.text)
}
```

### Data Analysis Logic
```typescript
private static analyzeRawData(rawData: any, toolboxAction: string) {
  const quantity = Array.isArray(rawData) ? rawData.length : 0
  
  let recommendedFormat = 'text-only'
  
  if (toolboxAction.includes('needMoreInfo')) {
    recommendedFormat = 'text-only'
  } else if (quantity === 1) {
    recommendedFormat = 'cards'
  } else if (quantity > 1 && quantity <= 4) {
    recommendedFormat = 'cards'
  } else if (quantity > 4) {
    recommendedFormat = 'grouped-cards'
  }
  
  return {
    type: this.determineDataType(toolboxAction),
    quantity,
    recommendedFormat
  }
}
```

## Smart Presenter System Prompt

The AI uses this instruction to make intelligent presentation decisions:

```
You are MaBar Smart Presenter AI - intelligently analyze raw data and create optimal user experience.

🧠 SMART ANALYSIS:
- Analyze data quantity, quality, and user intent
- Decide: text-only vs cards vs combined response
- Organize multiple results logically (group by area, time, skill level)
- Prioritize most relevant options (max 4 cards)

🎯 DYNAMIC DECISION MAKING:
- Single result: Show as card with details
- 2-4 results: Show individual cards
- 5+ results: Group/combine + show top options
- No results: Text-only with suggestions
- Greetings/questions: Text-only response

📱 SMART CARD LOGIC:
- create-new: When user needs to book/create
- existing-session: When user can join existing games
- user-booking: For user's personal bookings
- NO cards for: greetings, clarifications, simple confirmations
```

## Response Examples

### Greeting
```json
{
  "text": "Hi! I'm MaBar AI Assistant. I can help you find padel courts, players, or organize games. What would you like to do?",
  "sessionCards": []
}
```

### Single Venue Found
```json
{
  "text": "Perfect! I found exactly what you're looking for:",
  "sessionCards": [{
    "type": "create-new",
    "data": {
      "venue": "Jakarta Padel Center",
      "address": "Senayan, Jakarta",
      "cost": "Rp 175,000/hour",
      "rating": 4.5
    }
  }]
}
```

### Multiple Venues (Grouped)
```json
{
  "text": "Great! I found 6 venues. Here are the top 3 by location and rating:",
  "sessionCards": [
    {
      "type": "create-new",
      "data": {
        "venue": "Elite Padel Kemang",
        "address": "Kemang, Jakarta",
        "cost": "Rp 200,000/hour",
        "reason": "Highest rated (4.8 stars)"
      }
    },
    {
      "type": "create-new", 
      "data": {
        "venue": "Jakarta Padel Center",
        "address": "Senayan, Jakarta", 
        "cost": "Rp 175,000/hour",
        "reason": "Most popular location"
      }
    },
    {
      "type": "create-new",
      "data": {
        "venue": "BSD Padel Club",
        "address": "BSD, Tangerang",
        "cost": "Rp 160,000/hour", 
        "reason": "Best value for money"
      }
    }
  ]
}
```

### No Results
```json
{
  "text": "I couldn't find any venues matching your exact criteria. Try expanding your search area or being flexible with timing. Would you like me to show popular options instead?"
}
```

## Benefits

1. **Dynamic Intelligence**: AI decides optimal presentation format
2. **No Hardcoded Responses**: All formatting is contextual and adaptive
3. **Smart Organization**: Multiple results are grouped logically
4. **User-Centric**: Adapts to user skill level and intent
5. **Efficient UI**: Only shows cards when they add value

This approach ensures every user interaction feels natural and provides the most helpful response format for their specific situation.