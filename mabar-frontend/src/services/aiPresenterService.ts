import { GoogleGenAI } from '@google/genai'
import { env } from '../config/env'
import { AIFlowLogger } from './aiFlowLogger'
import type { PresentationPlan, UserResponse } from './aiInterfaces'

export class AIPresenterService {
  private static ai = new GoogleGenAI({ apiKey: env.GOOGLE_API_KEY })
  private static conversationContext: any[] = []

  private static readonly PRESENTER_SYSTEM_PROMPT = `You are AI Presenter - the UX specialist in MaBar's 3-AI system.

🎯 YOUR ROLE: Make optimal UX decisions and format responses for padel matchmaking.

🎨 CORE RESPONSIBILITIES:
1. ANALYZE findings from AI Logic and decide best presentation
2. OPTIMIZE user experience based on result type and quantity
3. CREATE engaging, helpful responses with proper tone
4. HANDLE edge cases gracefully with alternatives

📊 UX DECISION FRAMEWORK:
- 1-3 results: Cards for detailed visual presentation
- 4-8 results: Mixed format (summary + featured cards)
- 9+ results: Text summary with filtering suggestions
- No results: Encouraging text with specific alternatives
- Errors: Helpful guidance with retry options

🎯 RESPONSE FORMAT (JSON only):
{
  "format": "cards|text|mixed",
  "message": "engaging conversational response",
  "cards": [detailed_card_objects] (if using cards),
  "reasoning": "UX decision rationale",
  "suggestions": ["alternative_action_1"] (if no results)
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
      return {
        text: 'No matches found. Would you like to try different criteria or create a new session?',
        sessionCards: [],
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

    venues.forEach(venue => cards.push({ type: 'venue', data: venue }))
    players.forEach(player => cards.push({ type: 'player', data: player }))
    sessions.forEach(session => cards.push({ type: 'session', data: session }))

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
    
    // Use AI-generated cards if available
    if (responseCards && Array.isArray(responseCards) && responseCards.length > 0) {
      return responseCards
    }

    // Create optimized cards based on format
    const venues = findings.venues || []
    const players = findings.players || []
    const sessions = findings.sessions || []
    
    const cards: any[] = []
    
    if (format === 'cards') {
      // Show all results as cards
      venues.forEach(venue => cards.push({ type: 'venue', data: venue }))
      players.forEach(player => cards.push({ type: 'player', data: player }))
      sessions.forEach(session => cards.push({ type: 'session', data: session }))
    } else if (format === 'mixed') {
      // Show top results as cards
      venues.slice(0, 3).forEach(venue => cards.push({ type: 'venue', data: venue }))
      players.slice(0, 2).forEach(player => cards.push({ type: 'player', data: player }))
      sessions.slice(0, 2).forEach(session => cards.push({ type: 'session', data: session }))
    }
    
    return cards
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