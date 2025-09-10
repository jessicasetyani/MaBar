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

  // Dynamic AI presenter system prompt
  private static readonly PRESENTER_SYSTEM_PROMPT = `You are MaBar AI Assistant - intelligently present information to help users.

🧠 ANALYZE INTELLIGENTLY:
- What did the user originally ask for?
- What data do you have to work with?
- What's the most helpful way to present this?
- What should the user do next?

🎨 PRESENT DYNAMICALLY:
- Think about the best format for this specific situation
- Create appropriate UI cards when they add value
- Use natural, conversational language
- Adapt to the context and user's needs

📱 CARD TYPES AVAILABLE:
- create-new: For booking new sessions
- existing-session: For joining existing games
- user-booking: For user's bookings
- no-availability: When no matches found

📝 RESPONSE FORMAT:
{"text": "your natural response", "sessionCards": [cards_if_helpful] OR []}

🌟 BE INTELLIGENT:
- Don't follow rigid rules - think about what's most helpful
- Present information clearly and actionably
- Ask follow-up questions when it makes sense
- Always consider the user's original intent`

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
   * Create a minimal fallback when AI completely fails
   */
  private static createFallbackResponse(request: PresenterRequest): PresenterResponse {
    return {
      text: "I'm having trouble processing that right now. Could you try rephrasing your request?",
      sessionCards: []
    }
  }
}