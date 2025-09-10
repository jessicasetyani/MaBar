import { GoogleGenAI } from '@google/genai'
import { env } from '../config/env'
import { AIFlowLogger } from './aiFlowLogger'
import type { PresentationPlan, UserResponse } from './aiInterfaces'

export class AIPresenterService {
  private static ai = new GoogleGenAI({ apiKey: env.GOOGLE_API_KEY })
  private static conversationContext: any[] = []

  private static readonly PRESENTER_SYSTEM_PROMPT = `You are AI Presenter, MaBar's enthusiastic Tour Guide and expert Sales Closer. Your role is to present available padel sessions to the user as if you were a real estate agent showing them their dream home. Your tone is always exciting, positive, and persuasive.

[A] Action: Your Primary Goal
Your main objective is to convert user interest into bookings. To do this, you will take a list of available padel sessions, intelligently curate the best options, and then decide on the most exciting and effective format to present them in your JSON output. Your success is measured by how effectively your presentation generates excitement and persuades the user to book immediately.

Be Enthusiastic, BUT Concise: This is your most important communication rule. Use energetic and persuasive language in your message. Focus on one of these; the benefits of playing, the quality of the venue, or the great timing of the session, but also short and direct. Aim for 1-3 powerful sentences that get straight to the point and create excitement. Think "exciting headline," not "long story."
Be an Intelligent Curator, Not a List: Your most important job is to make smart decisions about what to show.

Group Duplicates: If there are multiple identical or very similar sessions (e.g., same time, same venue), present them as a single option. For example, create one card for a venue and mention "several courts are available."

Prioritize Variety: If the results include different venues, times, or skill levels, try to showcase this variety to give the user interesting choices.

Summarize Effectively: From a large list of results, select a handful of the best examples to feature. Your goal is to create a clean presentation that fits well on a user's screen, not to overwhelm them.

Never Say "No Results": If you receive an empty list of sessions, your job is to be a creative problem-solver. Your message should pivot to suggesting exciting alternatives like nearby venues or different times.

Output Format: You MUST respond ONLY with a JSON object. Do not include any text, greetings, or explanations before or after the JSON.

[T] Template: Your JSON Output Structure
Provide your response in this exact JSON format. Note the flexibility in the "format" field.
JSON
{
  "format": "paragraph",
  "message": "You're in luck! There's a fantastic, high-energy session tonight at Cilandak Padel that looks like a perfect fit for you. It's one of our most popular courts, and the evening slot at 8 PM still has a couple of spots open. It's the perfect way to end your day with a great game. I'd grab one before they're gone!",
  "cards": [],
  "reasoning": "Chose a 'paragraph' format because there is one standout, perfect match. This allows for a more personal, direct, and compelling sales pitch to drive an immediate booking, rather than distracting with other options.",
  "alternatives": [],
  "salesPoints": ["Perfect skill-level match", "Popular prime-time slot", "High user ratings"]
}`

  /**
   * Format final response for user using AI-powered UX decisions
   */
  static async formatResponse(
    findings: any,
    userContext: Record<string, any>,
    logicRecommendation: string
  ): Promise<UserResponse> {
    try {
      // Add to conversation context
      this.conversationContext.push({ findings, userContext, logicRecommendation })
      
      const prompt = this.buildUXDecisionPrompt(findings, userContext, logicRecommendation)
      
      const result = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: [{
          role: 'user',
          parts: [{ text: this.PRESENTER_SYSTEM_PROMPT + '\n\n' + prompt }]
        }]
      })

      const response = this.parseResponse(result.text || '')
      
      AIFlowLogger.logAIThinking(response, {
        service: 'AIPresenterService',
        method: 'formatResponse',
        uxDecision: response.format
      })
      
      return {
        text: response.message || 'Here are your results:',
        sessionCards: this.createOptimizedCards(response.cards, findings, response.format),
        needsMoreInfo: false,
        conversationComplete: !response.suggestions?.length
      }

    } catch (error) {
      AIFlowLogger.logError('ai-presenter-service', error as Error, { findings })
      return this.fallbackResponse(findings)
    }
  }

  /**
   * Discuss presentation strategy with AI Logic
   */
  static async discussWithLogic(
    findings: any,
    logicAnalysis: any
  ): Promise<{ format: string, reasoning: string, needsMoreInfo?: boolean }> {
    try {
      const discussionPrompt = `AI Logic found these results and wants presentation advice:

FINDINGS: ${JSON.stringify(findings, null, 2)}
LOGIC ANALYSIS: ${JSON.stringify(logicAnalysis, null, 2)}
CONVERSATION CONTEXT: ${JSON.stringify(this.conversationContext.slice(-2), null, 2)}

As AI Presenter, recommend optimal UX approach:
{
  "format": "cards|text|mixed",
  "reasoning": "detailed UX rationale",
  "needsMoreInfo": boolean,
  "suggestedQuestion": "if more info needed"
}`

      const result = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: [{
          role: 'user',
          parts: [{ text: discussionPrompt }]
        }]
      })

      const response = this.parseResponse(result.text || '')
      
      return {
        format: response.format || 'mixed',
        reasoning: response.reasoning || 'Default mixed presentation',
        needsMoreInfo: response.needsMoreInfo || false
      }

    } catch (error) {
      AIFlowLogger.logError('ai-presenter-discussion', error as Error, { findings })
      return {
        format: 'mixed',
        reasoning: 'Fallback due to discussion error'
      }
    }
  }

  /**
   * Simple presentation without AI (for communication protocol)
   */
  static formatSimpleResponse(
    findings: any,
    format: 'cards' | 'text' | 'mixed',
    reasoning: string
  ): UserResponse {
    if (findings.error) {
      return {
        text: 'I couldn\'t find what you\'re looking for. Could you try different criteria?',
        sessionCards: [],
        needsMoreInfo: false,
        conversationComplete: false
      }
    }

    const venues = findings.venues || []
    const players = findings.players || []
    const sessions = findings.sessions || []
    const totalResults = venues.length + players.length + sessions.length

    if (totalResults === 0) {
      // SALES AGENT APPROACH: Never just say "no results" - always offer alternatives!
      return {
        text: '🎾 Great news! While I didn\'t find exact matches, I have some fantastic alternatives for you! Let me show you nearby venues, different time slots, or popular sessions that might be even better. Sometimes the best padel experiences come from trying something new!',
        sessionCards: [
          {
            type: 'no-availability',
            data: {
              message: 'No exact matches, but I found great alternatives!',
              alternatives: [
                'Try nearby venues with amazing courts',
                'Check different time slots today',
                'Join popular sessions in your area',
                'Create your own session and invite players'
              ],
              encouragement: 'Let\'s find you the perfect padel experience!'
            }
          }
        ],
        needsMoreInfo: false,
        conversationComplete: false
      }
    }

    switch (format) {
      case 'cards':
        return {
          text: `I found ${totalResults} result${totalResults > 1 ? 's' : ''} for you:`,
          sessionCards: this.createCards(venues, players, sessions),
          needsMoreInfo: false,
          conversationComplete: true
        }

      case 'text':
        return {
          text: this.createTextSummary(venues, players, sessions),
          sessionCards: [],
          needsMoreInfo: false,
          conversationComplete: true
        }

      case 'mixed':
        return {
          text: this.createTextSummary(venues, players, sessions),
          sessionCards: this.createCards(venues.slice(0, 3), players.slice(0, 2), sessions.slice(0, 2)),
          needsMoreInfo: false,
          conversationComplete: true
        }

      default:
        return this.fallbackResponse(findings)
    }
  }

  /**
   * Reset conversation context
   */
  static resetConversation(): void {
    this.conversationContext = []
  }



  private static hasResults(findings: any): boolean {
    return this.getTotalResults(findings) > 0
  }

  private static getTotalResults(findings: any): number {
    return (findings.venues?.length || 0) + 
           (findings.players?.length || 0) + 
           (findings.sessions?.length || 0)
  }

  private static getResultTypes(findings: any): number {
    return [findings.venues?.length > 0, findings.players?.length > 0, findings.sessions?.length > 0]
      .filter(Boolean).length
  }

  // Private helper methods
  private static buildUXDecisionPrompt(
    findings: any,
    userContext: any,
    logicRecommendation: string
  ): string {
    const venues = findings.venues || []
    const players = findings.players || []
    const sessions = findings.sessions || []
    const totalResults = venues.length + players.length + sessions.length
    
    return `Make UX decision for padel matchmaking results:

FINDINGS SUMMARY:
- Venues: ${venues.length}
- Players: ${players.length} 
- Sessions: ${sessions.length}
- Total Results: ${totalResults}
- Has Error: ${!!findings.error}

USER CONTEXT: ${JSON.stringify(userContext, null, 2)}
LOGIC RECOMMENDATION: ${logicRecommendation}
CONVERSATION HISTORY: ${this.conversationContext.length} previous interactions

DETAILED FINDINGS: ${JSON.stringify(findings, null, 2)}

Decide optimal presentation format and create engaging response.`
  }

  private static parseResponse(responseText: string): any {
    try {
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim()
      return JSON.parse(cleanJson)
    } catch (error) {
      return {
        format: 'text',
        message: responseText || 'Here are your results:'
      }
    }
  }

  private static createCards(venues: any[], players: any[], sessions: any[]): any[] {
    const cards: any[] = []

    // Convert venues to SessionCard format
    venues.forEach(venue => {
      cards.push({
        type: 'create-new', // Venues typically allow creating new sessions
        data: {
          venue: venue.name || venue.venue,
          address: venue.address,
          area: venue.area,
          cost: venue.cost || venue.price,
          suggestedTime: 'Flexible timing',
          suggestedDate: 'Today or tomorrow',
          estimatedCost: venue.cost || venue.price
        }
      })
    })

    // Convert sessions to SessionCard format
    sessions.forEach(session => {
      const hasPlayers = session.players && session.players.length > 0
      const hasOpenSlots = session.openSlots && session.openSlots > 0

      cards.push({
        type: hasPlayers && hasOpenSlots ? 'existing-session' : 'create-new',
        data: {
          venue: session.venue || session.name,
          address: session.address,
          area: session.area,
          time: session.time,
          date: session.date,
          cost: session.cost || session.price,
          players: session.players || [],
          openSlots: session.openSlots || 4,
          status: hasPlayers && hasOpenSlots ? 'joining' : 'available'
        }
      })
    })

    return cards
  }

  private static createTextSummary(venues: any[], players: any[], sessions: any[]): string {
    const parts: string[] = []

    if (venues.length > 0) {
      const venueNames = venues.slice(0, 3).map(v => v.name).join(', ')
      parts.push(`${venues.length} venue${venues.length > 1 ? 's' : ''}: ${venueNames}${venues.length > 3 ? '...' : ''}`)
    }

    if (players.length > 0) {
      parts.push(`${players.length} available player${players.length > 1 ? 's' : ''}`)
    }

    if (sessions.length > 0) {
      parts.push(`${sessions.length} open session${sessions.length > 1 ? 's' : ''}`)
    }

    return `I found ${parts.join(', ')}.`
  }

  private static createOptimizedCards(responseCards: any[], findings: any, format: string): any[] {
    if (format === 'text') return []

    // Convert AI-generated cards to proper SessionCard format
    if (responseCards && Array.isArray(responseCards) && responseCards.length > 0) {
      const convertedCards = responseCards.map(card => {
        // If card already has proper SessionCard format, use it
        if (card.type && ['existing-session', 'create-new', 'no-availability', 'user-booking', 'join-confirmation'].includes(card.type) && card.data) {
          return card
        }

        // Convert AI-generated card format to SessionCard format
        return {
          type: 'create-new', // Default to create-new for AI-generated cards
          data: {
            venue: card.name || card.venue || 'Unknown Venue',
            address: card.address || card.location,
            area: card.area,
            cost: card.price || card.cost,
            suggestedTime: 'Flexible timing',
            suggestedDate: 'Today or tomorrow',
            estimatedCost: card.price || card.cost,
            // Additional fields from AI response
            description: card.description,
            rating: card.rating,
            features: card.features
          }
        }
      })

      // Deduplicate cards by venue name and location
      return this.deduplicateCards(convertedCards)
    }

    // Create optimized cards based on format using proper SessionCard types
    const venues = findings.venues || []
    const players = findings.players || []
    const sessions = findings.sessions || []

    if (format === 'cards') {
      // Show all results as properly formatted SessionCards
      return this.deduplicateCards(this.createCards(venues, players, sessions))
    } else if (format === 'mixed') {
      // Show top results as properly formatted SessionCards
      return this.deduplicateCards(this.createCards(venues.slice(0, 3), players.slice(0, 2), sessions.slice(0, 2)))
    }

    return []
  }

  /**
   * Deduplicate cards by venue name and location to avoid showing identical venues
   */
  private static deduplicateCards(cards: any[]): any[] {
    const seen = new Set<string>()
    const uniqueCards: any[] = []

    for (const card of cards) {
      const venue = card.data?.venue || ''
      const address = card.data?.address || ''
      const cost = card.data?.cost || card.data?.estimatedCost || ''

      // Create unique key based on venue name, location, and cost
      const uniqueKey = `${venue.toLowerCase()}-${address.toLowerCase()}-${cost}`.replace(/\s+/g, '-')

      if (!seen.has(uniqueKey)) {
        seen.add(uniqueKey)
        uniqueCards.push(card)
      } else {
        console.log(`🔄 Deduplicated duplicate venue: ${venue}`)
      }
    }

    return uniqueCards
  }

  private static fallbackResponse(findings: any): UserResponse {
    return {
      text: 'I found some results for you. Let me know if you need more details.',
      sessionCards: [],
      needsMoreInfo: false,
      conversationComplete: true
    }
  }
}