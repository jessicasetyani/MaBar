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

    // Handle needMoreInfo - let AI generate dynamic response based on persona
    if (toolboxAction === 'needMoreInfo' || (rawData && rawData.needsMoreInfo)) {
      // Let the AI Presenter generate dynamic greeting - no static fallback
      // This allows for varied, contextual responses based on user profile
      return {
        text: "Hey! Let's find you an awesome padel game!", // Simple fallback only if AI fails
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