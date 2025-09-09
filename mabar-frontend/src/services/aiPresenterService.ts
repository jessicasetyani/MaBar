import { GoogleGenAI } from '@google/genai'
import { env } from '../config/env'

export interface PresenterRequest {
  userOriginalRequest: string
  toolboxAction: string
  rawData: any
  searchCriteria?: any
}

export interface PresenterResponse {
  text: string
  sessionCards?: Array<{
    type: 'existing-session' | 'create-new' | 'no-availability'
    data: any
  }>
  needsMoreInfo?: boolean
}

export class AIPresenterService {
  private static ai = new GoogleGenAI({ apiKey: env.GOOGLE_API_KEY })

  // System instruction for the Presenter AI (appears as MaBar AI Assistant)
  private static readonly PRESENTER_SYSTEM_PROMPT = `You are MaBar Presenter AI - the expert UI/UX designer that transforms raw data into beautiful, organized, and easily digestible user interfaces.

🎨 YOUR MISSION: Create the BEST possible user experience by organizing complex data into clear, scannable, and actionable UI components.

📱 UI/UX DESIGN PRINCIPLES:

1. **INFORMATION HIERARCHY** - Most important info first
2. **SCANNABLE LAYOUT** - Users should understand in 3 seconds
3. **PROGRESSIVE DISCLOSURE** - Show essentials, hide complexity
4. **VISUAL GROUPING** - Related items together
5. **CLEAR ACTIONS** - Obvious next steps
6. **CONTEXTUAL RELEVANCE** - Show what matters to THIS user

🧠 DATA ORGANIZATION INTELLIGENCE:

**PRIORITIZATION LOGIC:**
- **Primary Info**: Venue name, time, price, availability
- **Secondary Info**: Address, facilities, skill level
- **Tertiary Info**: Additional details, descriptions

**GROUPING STRATEGIES:**
- **By Location**: Group nearby venues together
- **By Time**: Group by time slots (morning, afternoon, evening)
- **By Price**: Group budget/standard/premium options
- **By Availability**: Available first, then waitlist options
- **By Skill Level**: Match user's skill level first

**VISUAL ORGANIZATION PATTERNS:**

1. **VENUE LISTINGS** - Organize by relevance:
   ```
   Priority 1: Perfect matches (location + time + price)
   Priority 2: Close matches (2/3 criteria met)
   Priority 3: Alternative options (1/3 criteria met)
   ```

2. **PLAYER LISTINGS** - Organize by compatibility:
   ```
   Priority 1: Same skill level + available now
   Priority 2: Similar skill level + flexible time
   Priority 3: Different skill but good reviews
   ```

3. **SESSION LISTINGS** - Organize by urgency:
   ```
   Priority 1: Starting soon + open slots
   Priority 2: Today/tomorrow + open slots
   Priority 3: Future sessions + waitlist
   ```

4. **BOOKING MANAGEMENT** - Organize by timeline:
   ```
   Priority 1: Today's bookings (urgent)
   Priority 2: This week's bookings
   Priority 3: Future bookings
   ```

🎯 SMART UI PRESENTATION RULES:

**CARD LIMIT & QUALITY:**
- **Maximum 3-4 cards** per response (avoid overwhelming)
- **Quality over quantity** - show best matches first
- **Progressive loading** - "Show more" if needed

**INFORMATION DENSITY:**
- **Essential info only** in card preview
- **Details on demand** - expandable sections
- **Visual hierarchy** - size, color, positioning

**CONTEXTUAL ADAPTATION:**
- **Beginner users**: More explanation, simpler choices
- **Advanced users**: Dense info, quick actions
- **Mobile users**: Thumb-friendly buttons, minimal text
- **Urgent requests**: Immediate actions prominent

**SMART DEFAULTS & SUGGESTIONS:**
- **Auto-fill** obvious choices (today, user's area)
- **Intelligent suggestions** based on patterns
- **Proactive alternatives** when primary fails

📋 RESPONSE FORMAT (JSON only):
{
  "text": "Contextual summary with clear next steps",
  "sessionCards": [
    {
      "type": "card_type",
      "data": {
        // Organized data with clear hierarchy
        "priority": "high|medium|low",
        "category": "perfect_match|good_option|alternative",
        // ... other organized data
      }
    }
  ]
}

🎨 CARD DESIGN PATTERNS:

**VENUE CARDS (create-new type):**
```json
{
  "type": "create-new",
  "data": {
    "venue": "Primary: Venue Name",
    "address": "Secondary: Area, Distance",
    "cost": "Primary: Rp 175,000/hour",
    "availability": "Primary: Available now",
    "timeSlots": ["7 PM", "8 PM", "9 PM"],
    "facilities": ["Indoor", "Parking", "Showers"],
    "rating": 4.5,
    "priority": "high",
    "category": "perfect_match",
    "urgency": "book_soon",
    "matchReason": "Matches your location and time preference"
  }
}
```

**SESSION CARDS (existing-session type):**
```json
{
  "type": "existing-session",
  "data": {
    "venue": "Primary: Venue Name",
    "time": "Primary: Today 7 PM",
    "players": [
      {"name": "Ahmad", "skillLevel": "Intermediate", "rating": 4.2},
      {"name": "Sarah", "skillLevel": "Intermediate", "rating": 4.5}
    ],
    "openSlots": "Primary: 2 spots left",
    "cost": "Primary: Rp 43,750 per person",
    "skillLevel": "Secondary: Intermediate level",
    "gameType": "Secondary: Casual doubles",
    "priority": "high",
    "category": "perfect_match",
    "urgency": "join_now",
    "compatibility": "95% match with your profile"
  }
}
```

**NO AVAILABILITY CARDS (no-availability type):**
```json
{
  "type": "no-availability",
  "data": {
    "message": "Primary: No courts available at 3 AM",
    "searchedCriteria": "Secondary: Searched Senayan area, 3 AM tonight",
    "alternatives": [
      {"suggestion": "Evening slots (6-9 PM)", "availability": "3 courts available"},
      {"suggestion": "Nearby areas (Kemang)", "availability": "2 courts available"},
      {"suggestion": "Tomorrow same time", "availability": "1 court available"}
    ],
    "nextBestOption": "Tonight 8 PM at Jakarta Padel Center",
    "waitlistOption": "Join waitlist for 3 AM slots",
    "priority": "medium",
    "category": "alternative",
    "helpfulness": "Show multiple solution paths"
  }
}
```

**BOOKING MANAGEMENT CARDS:**
```json
{
  "type": "user-booking",
  "data": {
    "venue": "Primary: Jakarta Padel Center",
    "datetime": "Primary: Tomorrow 7 PM",
    "status": "Primary: Confirmed ✅",
    "cost": "Secondary: Rp 175,000 (paid)",
    "players": "Secondary: You + 3 others",
    "courtNumber": "Secondary: Court 2",
    "actions": ["Modify", "Cancel", "Add to Calendar"],
    "reminder": "2 hours before game",
    "priority": "high",
    "urgency": "upcoming",
    "category": "confirmed_booking"
  }
}
```

**RECOMMENDATION CARDS:**
```json
{
  "type": "personalized-recommendation",
  "data": {
    "venue": "Primary: Elite Padel Kemang",
    "reason": "Primary: 92% match with your preferences",
    "datetime": "Secondary: Saturday 9 AM",
    "cost": "Secondary: Rp 200,000/hour",
    "matchFactors": ["Your skill level", "Preferred area", "Usual playing time"],
    "players": "Similar skill players available",
    "confidence": "high",
    "priority": "high",
    "category": "ai_recommendation",
    "personalizedReason": "Based on your 15 games in Kemang area"
  }
}
```

💬 CONVERSATIONAL INTELLIGENCE:

**TONE ADAPTATION:**
- **Beginner**: "Great choice! Here are beginner-friendly options..."
- **Intermediate**: "Found some perfect matches for your skill level:"
- **Advanced**: "Premium courts matching your requirements:"

**CONTEXTUAL MESSAGING:**
- **Peak times**: "⏰ Popular time slot - book quickly!"
- **Weather**: "☀️ Perfect weather for outdoor courts!"
- **Budget**: "💰 Great value options within your budget:"
- **Skill match**: "🎯 Perfect skill level matches found:"

**PROACTIVE GUIDANCE:**
- **Next steps**: "Ready to book? Click 'Reserve Court'"
- **Alternatives**: "Not quite right? Try these alternatives:"
- **Optimization**: "💡 Save 30% by playing 1 hour earlier"

🎯 REMEMBER: Your job is to be the expert UI/UX designer that makes complex data feel simple, organized, and actionable. Every card should feel like it was custom-designed for this specific user and their specific need.`

  /**
   * Main presentation method - transforms raw toolbox results into friendly responses
   */
  static async presentResults(request: PresenterRequest): Promise<PresenterResponse> {
    try {
      const prompt = this.buildPresenterPrompt(request)
      
      const result = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: [
          { 
            role: 'user', 
            parts: [{ text: 'You are MaBar AI Assistant. Transform raw data into friendly responses. Respond only with JSON.' }] 
          },
          { 
            role: 'model', 
            parts: [{ text: this.PRESENTER_SYSTEM_PROMPT }] 
          },
          { 
            role: 'user', 
            parts: [{ text: prompt }] 
          }
        ]
      })

      const responseText = result.text || ''
      console.log('🎨 [PRESENTER AI] Raw API Response:', responseText)
      
      const jsonText = responseText.replace(/```json\n?|\n?```/g, '').trim()
      console.log('🎨 [PRESENTER AI] Cleaned JSON:', jsonText)
      
      try {
        const presenterResponse = JSON.parse(jsonText) as PresenterResponse
        console.log('🎨 [PRESENTER AI] Final Response:', presenterResponse)
        return presenterResponse
      } catch (parseError) {
        console.log('❌ [PRESENTER AI] JSON Parse Error:', parseError)
        // Fallback response if JSON parsing fails
        return this.createFallbackResponse(request)
      }

    } catch (error) {
      console.error('❌ Error in AI Presenter:', error)
      return this.createFallbackResponse(request)
    }
  }

  /**
   * Build the prompt for the presenter based on the toolbox results
   */
  private static buildPresenterPrompt(request: PresenterRequest): string {
    const { userOriginalRequest, toolboxAction, rawData, searchCriteria } = request
    
    // Extract user skill level for tone adaptation
    const userSkillLevel = searchCriteria?.skillLevel || rawData?.userSkillLevel || 'not specified'

    return `
**User's Original Request:** "${userOriginalRequest}"

**User Skill Level:** ${userSkillLevel} (Adapt tone accordingly: beginner=encouraging, intermediate=balanced, advanced=direct)

**Toolbox Action Performed:** ${toolboxAction}

**Raw Database Results:**
${JSON.stringify(rawData, null, 2)}

**Search Criteria Used:**
${searchCriteria ? JSON.stringify(searchCriteria, null, 2) : 'Not specified'}

**Your Task:** Transform this raw data into a friendly, conversational response with appropriate session cards. Consider:
- What the user was looking for
- What results were found (or not found)
- How to present this in the most helpful way
- What actions the user can take next
- IMPORTANT: Adapt your tone based on the user's skill level (see tone guidelines)

Remember to use the exact JSON format specified in your system prompt.`
  }

  /**
   * Create a fallback response when AI processing fails
   */
  private static createFallbackResponse(request: PresenterRequest): PresenterResponse {
    const { rawData, toolboxAction } = request

    // Handle needMoreInfo - no session cards needed
    if (toolboxAction === 'needMoreInfo' || (rawData && rawData.needsMoreInfo)) {
      // Adapt greeting based on user skill level
      const userSkillLevel = request.searchCriteria?.skillLevel || rawData?.userSkillLevel
      let greetingText = ""
      
      switch (userSkillLevel) {
        case 'beginner':
          greetingText = "Hey! 🏓 I'm here to help you find great padel games. What's up?"
          break
        case 'intermediate':
          greetingText = "Hi there! Looking for courts or players today?"
          break
        case 'advanced':
          greetingText = "Hello! What can I find for you?"
          break
        default:
          greetingText = "Hi! What brings you here today?"
      }
      
      return {
        text: greetingText,
        sessionCards: [] // No cards for needMoreInfo
      }
    }

    // Determine response based on raw data structure
    if (!rawData || (Array.isArray(rawData) && rawData.length === 0)) {
      return {
        text: "Sorry, I couldn't find any matches for your request. Would you like to try different criteria?",
        sessionCards: [{
          type: 'no-availability',
          data: { message: 'No results found' }
        }]
      }
    }

    if (Array.isArray(rawData) && rawData.length > 0) {
      // Handle venues
      if (toolboxAction.includes('Venue') || rawData[0].pricing) {
        return {
          text: `I found ${rawData.length} venue${rawData.length > 1 ? 's' : ''} for you:`,
          sessionCards: rawData.slice(0, 3).map(venue => ({
            type: 'create-new' as const,
            data: {
              venue: venue.name || 'Padel Court',
              address: venue.address ? `${venue.address.area}, ${venue.address.city}` : 'Jakarta',
              cost: venue.pricing ? `Rp ${venue.pricing.hourlyRate?.toLocaleString()}/hour` : 'Price available on booking'
            }
          }))
        }
      }

      // Handle players
      if (toolboxAction.includes('Player') || rawData[0].skillLevel) {
        return {
          text: `Great! I found ${rawData.length} available player${rawData.length > 1 ? 's' : ''}:`,
          sessionCards: [{
            type: 'existing-session' as const,
            data: {
              venue: 'Available Players',
              players: rawData.slice(0, 4).map(player => ({
                name: player.name || 'Player',
                skillLevel: player.skillLevel || 'Intermediate'
              })),
              openSlots: Math.max(0, 4 - rawData.length),
              time: 'Flexible',
              cost: 'To be shared'
            }
          }]
        }
      }
    }

    // Generic fallback
    return {
      text: "I found some results for you. Let me know if you'd like more details!",
      sessionCards: [{
        type: 'create-new' as const,
        data: {
          venue: 'Search Results',
          message: 'Results available - please specify what you need'
        }
      }]
    }
  }
}