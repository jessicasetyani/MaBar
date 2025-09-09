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
    type: 'existing-session' | 'create-new' | 'no-availability' | 'user-booking' | 'join-confirmation'
    data: any
  }>
  needsMoreInfo?: boolean
}

export class AIPresenterService {
  private static ai = new GoogleGenAI({ apiKey: env.GOOGLE_API_KEY })

  // System instruction for the Presenter AI (appears as MaBar AI Assistant)
  private static readonly PRESENTER_SYSTEM_PROMPT = `You are MaBar Smart Presenter AI - intelligently analyze raw data and create the optimal user experience.

🧠 SMART ANALYSIS:
- Analyze data quantity, quality, and user intent
- Decide: text-only vs cards vs combined response
- Organize multiple results logically (group by area, time, skill level)
- Prioritize most relevant options (max 4 cards)
- Combine similar options when beneficial

🎯 DYNAMIC DECISION MAKING:
- Single result: Show as card with details
- 2-4 results: Show individual cards
- 5+ results: Group/combine + show top options
- No results: Text-only with suggestions
- Greetings/questions: Text-only response
- Join requests: Show confirmation card

📱 SMART CARD LOGIC:
- create-new: When user needs to book/create
- existing-session: When user can join existing games
- user-booking: For user's personal bookings
- NO cards for: greetings, clarifications, simple confirmations

🎨 PRESENTATION INTELLIGENCE:
- Group venues by area if 3+ in same location
- Combine time slots if same venue has multiple
- Show skill level matches prominently
- Highlight cost-effective options
- Present alternatives when exact match unavailable

🗣️ ADAPTIVE COMMUNICATION:
- Beginner: Encouraging, explanatory
- Intermediate: Balanced, informative  
- Advanced: Direct, efficient
- Professional: Detailed, technical

📝 RESPOND: {"text": "Smart contextual message", "sessionCards": [optimally_organized_cards] OR []}

💡 SMART EXAMPLES:
- "Hi" → {"text": "Welcome message", "sessionCards": []}
- 1 venue found → {"text": "Perfect match!", "sessionCards": [venue_card]}
- 6 venues found → {"text": "Great options! Here are the top 3 by location:", "sessionCards": [grouped_cards]}
- Join request → {"text": "Joining session...", "sessionCards": [confirmation_card]}`

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

    // Handle needMoreInfo
    if (toolboxAction === 'needMoreInfo' || (rawData && rawData.needsMoreInfo)) {
      return {
        text: "Hey! Let's find you an awesome padel game!",
        sessionCards: []
      }
    }

    // Handle comprehensive findMatch data
    if (rawData && rawData.venues && rawData.players && rawData.sessions) {
      const { venues, players, sessions, totalResults } = rawData
      
      if (totalResults === 0) {
        return {
          text: "No matches found. Would you like to try different criteria?",
          sessionCards: [{
            type: 'no-availability',
            data: { message: 'No results found' }
          }]
        }
      }

      const sessionCards = []
      
      // Add venue cards
      if (venues && venues.length > 0) {
        sessionCards.push(...venues.slice(0, 2).map(venue => ({
          type: 'create-new' as const,
          data: {
            venue: venue.name || 'Padel Court',
            address: venue.address ? `${venue.address.area}, ${venue.address.city}` : 'Jakarta',
            cost: venue.pricing ? `Rp ${venue.pricing.hourlyRate?.toLocaleString()}/hour` : 'Price on booking'
          }
        })))
      }
      
      // Add session cards
      if (sessions && sessions.length > 0) {
        sessionCards.push(...sessions.slice(0, 2).map(session => ({
          type: 'existing-session' as const,
          data: {
            sessionId: session.id,
            venue: `Session - ${session.timeSlot}`,
            time: session.timeSlot,
            date: session.date,
            openSlots: session.openSlots,
            cost: `Rp ${session.pricePerPlayer?.toLocaleString()}/player`
          }
        })))
      }
      
      return {
        text: `Found ${totalResults} options for you:`,
        sessionCards: sessionCards.slice(0, 3)
      }
    }

    // Handle array data (venues or players)
    if (Array.isArray(rawData) && rawData.length > 0) {
      // Handle venues
      if (rawData[0].pricing || toolboxAction.includes('Venue')) {
        return {
          text: `Found ${rawData.length} venue${rawData.length > 1 ? 's' : ''}:`,
          sessionCards: rawData.slice(0, 3).map(venue => ({
            type: 'create-new' as const,
            data: {
              venue: venue.name || 'Padel Court',
              address: venue.address ? `${venue.address.area}, ${venue.address.city}` : 'Jakarta',
              cost: venue.pricing ? `Rp ${venue.pricing.hourlyRate?.toLocaleString()}/hour` : 'Price on booking'
            }
          }))
        }
      }

      // Handle players
      if (rawData[0].skillLevel || toolboxAction.includes('Player')) {
        return {
          text: `Found ${rawData.length} available player${rawData.length > 1 ? 's' : ''}:`,
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

    // No data fallback
    return {
      text: "Sorry, I couldn't find any matches. Would you like to try different criteria?",
      sessionCards: [{
        type: 'no-availability',
        data: { message: 'No results found' }
      }]
    }
  }
}