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

      // Extract raw database results for AI analysis
      const venues = findings.data || findings.venues || []
      const players = findings.players || []
      const sessions = findings.sessions || []
      const totalResults = venues.length + players.length + sessions.length

      // Handle empty results
      if (totalResults === 0) {
        return this.handleNoResults()
      }

      // AI Presenter acts as intelligent curator and presentation director
      const prompt = this.buildIntelligentCurationPrompt(findings, userContext, logicRecommendation)

      const result = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: [{
          role: 'user',
          parts: [{ text: this.PRESENTER_SYSTEM_PROMPT + '\n\n' + prompt }]
        }]
      })

      const aiResponse = this.parseResponse(result.text || '')

      AIFlowLogger.logAIThinking(aiResponse, {
        service: 'AIPresenterService',
        method: 'formatResponse',
        uxDecision: aiResponse.format
      })

      // Convert AI-curated response to SessionCards with preserved database integrity
      const sessionCards = this.convertAICuratedResponseToCards(aiResponse, venues, players, sessions)

      return {
        text: aiResponse.message || this.generateDefaultMessage(totalResults),
        sessionCards: sessionCards,
        needsMoreInfo: false,
        conversationComplete: true
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
  private static buildIntelligentCurationPrompt(
    findings: any,
    userContext: any,
    logicRecommendation: string
  ): string {
    const venues = findings.data || findings.venues || []
    const players = findings.players || []
    const sessions = findings.sessions || []
    const totalResults = venues.length + players.length + sessions.length

    return `Act as an intelligent curator and presentation director for padel matchmaking results.

ANALYSIS DATA:
- Raw Venues Found: ${venues.length}
- Raw Players Found: ${players.length}
- Raw Sessions Found: ${sessions.length}
- Total Raw Results: ${totalResults}

USER CONTEXT: ${JSON.stringify(userContext, null, 2)}
LOGIC RECOMMENDATION: ${logicRecommendation}

RAW DATABASE RESULTS: ${JSON.stringify(venues, null, 2)}

CURATION INSTRUCTIONS:
1. Analyze the raw database results intelligently
2. Group similar venues/sessions to avoid overwhelming the user
3. Prioritize results based on user context and preferences
4. Decide optimal presentation format (cards, text, or mixed)
5. Create curated cards with enhanced presentation data
6. Add intelligent insights and recommendations

Your response should include:
- Intelligent curation decisions
- Enhanced presentation with sales insights
- Prioritized and organized results
- Value-added context and recommendations

Follow the JSON template from your system prompt exactly.`
  }

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

  /**
   * Handle case when no results are found
   */
  private static handleNoResults(): UserResponse {
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

  /**
   * Generate default message based on result count
   */
  private static generateDefaultMessage(totalResults: number): string {
    if (totalResults === 1) {
      return 'Perfect! I found an excellent option for you:'
    } else if (totalResults <= 3) {
      return `Great news! I found ${totalResults} fantastic options for you:`
    } else {
      return `Excellent! I found ${totalResults} amazing padel options for you:`
    }
  }

  /**
   * Convert AI-curated response to SessionCards while preserving database integrity
   * This method bridges AI intelligence with raw database accuracy
   */
  private static convertAICuratedResponseToCards(
    aiResponse: any,
    venues: any[],
    players: any[],
    sessions: any[]
  ): any[] {
    const cards: any[] = []

    // Handle different AI response formats
    if (aiResponse.format === 'text') {
      // For text format, create simple cards from raw database results
      return this.createSimpleCardsFromDatabase(venues, players, sessions)
    }

    // For cards format, use AI curation but preserve database integrity
    if (aiResponse.cards && Array.isArray(aiResponse.cards)) {
      aiResponse.cards.forEach((aiCard: any) => {
        // Find matching venue from raw database results to preserve data integrity
        const matchingVenue = this.findMatchingVenue(aiCard, venues)

        if (matchingVenue) {
          // Use AI curation decisions but database facts
          const enhancedCard = this.createEnhancedCard(aiCard, matchingVenue)
          cards.push(enhancedCard)
        } else {
          // Fallback: create card from AI data but log the issue
          console.warn('⚠️ AI card has no matching database venue:', aiCard)
          const fallbackCard = this.createFallbackCard(aiCard, venues[0])
          if (fallbackCard) cards.push(fallbackCard)
        }
      })
    }

    // If AI didn't provide cards or cards are empty, fall back to database results
    if (cards.length === 0) {
      console.log('🔄 AI provided no valid cards, using database results directly')
      return this.createSimpleCardsFromDatabase(venues, players, sessions)
    }

    return this.deduplicateCards(cards)
  }

  /**
   * Find matching venue from database results based on AI card information
   */
  private static findMatchingVenue(aiCard: any, venues: any[]): any | null {
    if (!aiCard.venueName && !aiCard.sessionId) return null

    // Try to match by venue name first
    if (aiCard.venueName) {
      const match = venues.find(venue =>
        venue.name && venue.name.toLowerCase().includes(aiCard.venueName.toLowerCase())
      )
      if (match) return match
    }

    // If no name match, return first venue as fallback (AI might have grouped/renamed)
    return venues.length > 0 ? venues[0] : null
  }

  /**
   * Create enhanced card combining AI curation with database integrity
   */
  private static createEnhancedCard(aiCard: any, dbVenue: any): any {
    // Use database facts, AI presentation enhancements
    const venueName = dbVenue.name || aiCard.venueName || 'Padel Court'
    const venueAddress = dbVenue.address ?
      (typeof dbVenue.address === 'string' ? dbVenue.address : `${dbVenue.address.area}, ${dbVenue.address.city}`) :
      undefined
    const venueCost = dbVenue.pricing?.hourlyRate ?
      `IDR ${dbVenue.pricing.hourlyRate.toLocaleString()}/hour` :
      undefined

    return {
      type: 'create-new',
      data: {
        venue: venueName,                    // ← Database fact
        address: venueAddress,               // ← Database fact
        area: dbVenue.address?.area,         // ← Database fact
        cost: venueCost,                     // ← Database fact
        suggestedTime: aiCard.time || 'Flexible timing',     // ← AI enhancement
        suggestedDate: 'Today or tomorrow',
        estimatedCost: venueCost,            // ← Database fact
        description: aiCard.salesPitch || dbVenue.description, // ← AI enhancement + DB fallback
        rating: dbVenue.rating?.toString(),  // ← Database fact
        // AI enhancements
        aiInsights: aiCard.salesPitch,
        aiRecommendation: true
      }
    }
  }

  /**
   * Create fallback card when AI card has no database match
   */
  private static createFallbackCard(aiCard: any, fallbackVenue: any): any | null {
    if (!fallbackVenue) return null

    return {
      type: 'create-new',
      data: {
        venue: fallbackVenue.name || 'Padel Court',
        address: fallbackVenue.address ?
          (typeof fallbackVenue.address === 'string' ? fallbackVenue.address : `${fallbackVenue.address.area}, ${fallbackVenue.address.city}`) :
          undefined,
        area: fallbackVenue.address?.area,
        cost: fallbackVenue.pricing?.hourlyRate ?
          `IDR ${fallbackVenue.pricing.hourlyRate.toLocaleString()}/hour` :
          undefined,
        suggestedTime: 'Flexible timing',
        suggestedDate: 'Today or tomorrow',
        estimatedCost: fallbackVenue.pricing?.hourlyRate ?
          `IDR ${fallbackVenue.pricing.hourlyRate.toLocaleString()}/hour` :
          undefined,
        description: fallbackVenue.description,
        rating: fallbackVenue.rating?.toString()
      }
    }
  }

  /**
   * Create simple cards directly from database when AI processing fails
   */
  private static createSimpleCardsFromDatabase(venues: any[], players: any[], sessions: any[]): any[] {
    const cards: any[] = []

    venues.forEach(venue => {
      const venueName = venue.name || 'Padel Court'
      const venueAddress = venue.address ?
        (typeof venue.address === 'string' ? venue.address : `${venue.address.area}, ${venue.address.city}`) :
        undefined
      const venueCost = venue.pricing?.hourlyRate ?
        `IDR ${venue.pricing.hourlyRate.toLocaleString()}/hour` :
        undefined

      cards.push({
        type: 'create-new',
        data: {
          venue: venueName,
          address: venueAddress,
          area: venue.address?.area,
          cost: venueCost,
          suggestedTime: 'Flexible timing',
          suggestedDate: 'Today or tomorrow',
          estimatedCost: venueCost,
          description: venue.description,
          rating: venue.rating?.toString()
        }
      })
    })

    return this.deduplicateCards(cards)
  }

  private static createCards(venues: any[], players: any[], sessions: any[]): any[] {
    const cards: any[] = []

    // Convert venues to SessionCard format
    venues.forEach(venue => {
      // Handle venue data structure from database
      const venueName = venue.name || venue.venue || 'Padel Court'
      const venueAddress = venue.address ?
        (typeof venue.address === 'string' ? venue.address : `${venue.address.area}, ${venue.address.city}`) :
        undefined
      const venueCost = venue.pricing?.hourlyRate ?
        `IDR ${venue.pricing.hourlyRate.toLocaleString()}/hour` :
        (venue.cost || venue.price)

      cards.push({
        type: 'create-new', // Venues typically allow creating new sessions
        data: {
          venue: venueName,
          address: venueAddress,
          area: venue.address?.area || venue.area,
          cost: venueCost,
          suggestedTime: 'Flexible timing',
          suggestedDate: 'Today or tomorrow',
          estimatedCost: venueCost,
          description: venue.description,
          rating: venue.rating?.toString()
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