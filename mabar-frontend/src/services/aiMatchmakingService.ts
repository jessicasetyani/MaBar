import { GoogleGenAI } from '@google/genai'
import { env } from '../config/env'
import { InputAnalysisService } from './inputAnalysisService'
import { MatchmakingQueryService, type QueryFilters } from './matchmakingQueryService'

export interface MatchmakingQuery {
  skillLevel?: string
  timeSlot?: string
  date?: string
  location?: string
  venue?: string
  playerCount?: number
  gender?: string
  priceRange?: { min: number; max: number }
}

export interface MatchmakingResult {
  type: 'existing-session' | 'create-new' | 'no-availability'
  data: {
    venue?: string
    time?: string
    date?: string
    cost?: string
    players?: Array<{ name: string; skillLevel: string }>
    openSlots?: number
    suggestedTime?: string
    suggestedDate?: string
    estimatedCost?: string
    message?: string
  }
}

export interface AIResponse {
  text: string
  sessionCards?: MatchmakingResult[]
  needsMoreInfo?: boolean
  clarifyingQuestions?: string[]
}

export class AIMatchmakingService {
  private static ai = new GoogleGenAI({ apiKey: env.GOOGLE_API_KEY })

  /**
   * Main AI matchmaking entry point
   */
  static async processMatchmakingRequest(userInput: string): Promise<AIResponse> {
    console.log('🚀 === AI MATCHMAKING FLOW START ===');
    console.log('📝 User Input:', userInput);
    
    try {
      console.log('🤖 Processing matchmaking request:', userInput)

      // Step 1: Analyze user input to extract parameters
      console.log('🔍 Step 1: Extracting query parameters...');
      const extractedParams = await this.extractQueryParameters(userInput)
      console.log('📊 Extracted parameters:', JSON.stringify(extractedParams, null, 2));

      // Step 2: Check if we have sufficient information
      console.log('✅ Step 2: Validating parameters...');
      const validationResult = this.validateQueryParameters(extractedParams)
      console.log('🎯 Validation result:', validationResult);
      
      if (!validationResult.isValid) {
        console.log('❌ Insufficient parameters - returning clarifying response');
        const clarifyingResponse = this.generateClarifyingResponse(userInput, validationResult.missingParams!);
        console.log('💬 Clarifying Response:', clarifyingResponse);
        console.log('🏁 === AI MATCHMAKING FLOW END (CLARIFYING) ===');
        return clarifyingResponse;
      }

      // Step 3: Execute database queries
      console.log('🗄️ Step 3: Executing database queries...');
      const matchingResults = await this.executeMatchmakingQueries(extractedParams)
      console.log('📋 Database Query Results:', JSON.stringify(matchingResults, null, 2));
      
      // Step 4: Generate AI response with results
      console.log('🤖 Step 4: Generating AI response...');
      const aiResponse = await this.generateMatchmakingResponse(userInput, extractedParams, matchingResults);
      console.log('💭 Final AI Response:', JSON.stringify(aiResponse, null, 2));
      console.log('🏁 === AI MATCHMAKING FLOW END (SUCCESS) ===');
      
      return aiResponse;

    } catch (error) {
      console.error('💥 Error in AI matchmaking:', error)
      console.log('🏁 === AI MATCHMAKING FLOW END (ERROR) ===');
      return {
        text: 'Sorry, I encountered an issue processing your request. Please try again with more specific details.',
        sessionCards: [{
          type: 'no-availability',
          data: { message: 'Service temporarily unavailable' }
        }]
      }
    }
  }

  /**
   * Extract queryable parameters from user input using hybrid AI + rule-based approach
   */
  private static async extractQueryParameters(userInput: string): Promise<MatchmakingQuery> {
    console.log('🔍 Extracting parameters from input...');
    
    try {
      // Use rule-based analysis for reliable parameter extraction
      console.log('📊 Running input analysis...');
      const analysis = InputAnalysisService.analyzeInput(userInput)
      console.log('📊 Input analysis result:', JSON.stringify(analysis, null, 2));

      // Convert analysis to MatchmakingQuery format
      const params: MatchmakingQuery = {}
      
      console.log('🔍 Confidence thresholds check:', {
        timeConfidence: analysis.time.confidence,
        locationConfidence: analysis.location.confidence, 
        skillConfidence: analysis.skillLevel.confidence
      })

      // Time slot extraction - Accept smart ranges with good confidence
      if (analysis.time.confidence > 0.6) {
        params.timeSlot = analysis.time.timeSlot
        console.log('⏰ Time parameter extracted:', params.timeSlot, 'confidence:', analysis.time.confidence);
      } else {
        console.log('❌ Time parameter not extracted - confidence too low:', analysis.time.confidence);
      }

      // Location extraction - Accept reasonable confidence
      if (analysis.location.confidence > 0.5) {
        params.location = analysis.location.location
        console.log('📍 Location parameter extracted:', params.location, 'confidence:', analysis.location.confidence);
      } else {
        console.log('❌ Location parameter not extracted - confidence too low:', analysis.location.confidence);
      }

      // Skill level extraction - Accept good confidence
      if (analysis.skillLevel.confidence > 0.7) {
        params.skillLevel = analysis.skillLevel.skillLevel
        console.log('🎯 Skill parameter extracted:', params.skillLevel, 'confidence:', analysis.skillLevel.confidence);
      } else {
        console.log('❌ Skill parameter not extracted - confidence too low:', analysis.skillLevel.confidence);
      }

      // Player count
      if (analysis.playerCount) {
        params.playerCount = analysis.playerCount
        console.log('👥 Player count extracted:', params.playerCount);
      }

      // Price range
      if (analysis.pricing.priceRange) {
        params.priceRange = analysis.pricing.priceRange
        console.log('💰 Price range extracted:', params.priceRange);
      }

      console.log('📏 Parameters extracted so far:', Object.keys(params).length);

      // Use AI for complex extraction if rule-based analysis is insufficient
      if (Object.keys(params).length < 1) {
        console.log('🤖 Using AI fallback for parameter extraction')
        const aiParams = await this.extractParametersWithAI(userInput)
        console.log('🤖 AI extracted parameters:', aiParams);
        Object.assign(params, aiParams)
      }
      
      // Always add default location if none specified
      if (!params.location && !params.venue) {
        params.location = 'jakarta_area'
        console.log('📍 Added default location: jakarta_area')
      }

      console.log('✅ Final extracted parameters:', JSON.stringify(params, null, 2));
      return params

    } catch (error) {
      console.error('💥 Error extracting parameters:', error)
      return {}
    }
  }

  /**
   * Fallback AI-based parameter extraction
   */
  private static async extractParametersWithAI(userInput: string): Promise<MatchmakingQuery> {
    const prompt = `
    Analyze this padel matchmaking request and extract structured parameters. Return ONLY a JSON object:
    
    {
      "skillLevel": "beginner|intermediate|advanced|null",
      "timeSlot": "morning|afternoon|evening|night|null",
      "date": "today|tomorrow|weekend|null", 
      "location": "jakarta_area|specific_area|null",
      "venue": "venue_name|null",
      "playerCount": number_or_null,
      "priceRange": {"min": number, "max": number} or null
    }

    User input: "${userInput}"
    Return only valid JSON, no other text.`

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      })

      const jsonText = (response.text || '').replace(/```json\n?|\n?```/g, '').trim()
      return JSON.parse(jsonText)
    } catch (error) {
      console.error('❌ Error in AI parameter extraction:', error)
      return {}
    }
  }

  /**
   * Validate if we have enough parameters for meaningful queries
   */
  private static validateQueryParameters(params: MatchmakingQuery): { 
    isValid: boolean; 
    missingParams?: string[] 
  } {
    console.log('✅ Validating query parameters...');
    console.log('📊 Parameters to validate:', JSON.stringify(params, null, 2));
    
    const missingParams: string[] = []

    // Check for basic greeting/unclear input
    const paramCount = Object.keys(params).length;
    const hasValues = Object.values(params).some(v => v !== null && v !== undefined);
    
    console.log('📏 Parameter count:', paramCount);
    console.log('✅ Has meaningful values:', hasValues);
    
    if (paramCount === 0 || !hasValues) {
      console.log('❌ No meaningful parameters found - basic info needed');
      return { isValid: false, missingParams: ['basic_info'] }
    }

    // Only require clarification for truly vague inputs (not smart ranges)
    const needsClarification = ['', null, undefined]
    if (!params.timeSlot || needsClarification.includes(params.timeSlot)) {
      console.log('⏰ No time information detected');
      missingParams.push('time_info')
    } else {
      console.log('⏰ Time information accepted:', params.timeSlot);
    }

    // Require at least 2 meaningful parameters for effective matching
    const meaningfulParams = Object.entries(params).filter(([_, value]) => 
      value !== null && value !== undefined
    )
    
    console.log('🎯 Meaningful parameters:', meaningfulParams.length, meaningfulParams.map(([key, value]) => `${key}: ${value}`));

    if (meaningfulParams.length < 2) {
      console.log('❌ Insufficient meaningful parameters (need 2+)');
      if (!params.timeSlot && !params.date) {
        missingParams.push('time_info')
        console.log('⏰ Missing time information');
      }
      if (!params.location && !params.venue) {
        missingParams.push('location_info')
        console.log('📍 Missing location information');
      }
      if (!params.skillLevel) {
        missingParams.push('skill_level')
        console.log('🎯 Missing skill level');
      }
    }

    const isValid = missingParams.length === 0;
    console.log('✅ Validation result:', { isValid, missingParams });

    return { 
      isValid,
      missingParams: missingParams.length > 0 ? missingParams : undefined
    }
  }

  /**
   * Generate clarifying questions when insufficient info provided
   */
  private static async generateClarifyingResponse(
    userInput: string, 
    missingParams: string[]
  ): Promise<AIResponse> {
    const clarifyingQuestions: string[] = []

    if (missingParams.includes('basic_info')) {
      return {
        text: `Hi! I'd be happy to help you find a padel match. To give you the best recommendations, could you tell me:<br><br>
        • Are you looking for <strong>players</strong> to join you, or <strong>available courts</strong> to book?<br>
        • What <strong>time</strong> works for you? (e.g., "tonight at 7 PM", "Saturday morning", "anytime this weekend")<br>
        • Which <strong>area</strong> do you prefer? (e.g., "Senayan", "Kemang", "anywhere in Jakarta")`,
        needsMoreInfo: true,
        sessionCards: [{
          type: 'no-availability',
          data: { message: 'Need more details to help you find the perfect match!' }
        }]
      }
    }

    // Check if user mentioned truly vague time terms that need clarification
    const vagueTimes = ['tonight', 'this weekend']
    const hasVagueTime = vagueTimes.some(term => userInput.toLowerCase().includes(term))
    
    if (missingParams.includes('time_info') || hasVagueTime) {
      if (hasVagueTime) {
        const detectedTerm = vagueTimes.find(term => userInput.toLowerCase().includes(term))
        if (detectedTerm === 'this weekend') {
          clarifyingQuestions.push(`Which day this weekend? Saturday, Sunday, or are you flexible for both days?`)
        } else if (detectedTerm === 'tonight') {
          clarifyingQuestions.push(`What time tonight works for you? (e.g., "6 PM", "8 PM", "after 7 PM")`)
        }
      } else {
        clarifyingQuestions.push('What time works for you? (e.g., "tonight at 7 PM", "Saturday morning", "anytime this weekend")')
      }
    }

    if (missingParams.includes('location_info')) {
      clarifyingQuestions.push('Which area do you prefer? (e.g., "Senayan", "Kemang", "anywhere in Jakarta")')
    }

    if (missingParams.includes('skill_level')) {
      clarifyingQuestions.push('What skill level are you looking for? (beginner, intermediate, or advanced)')
    }

    const questionsText = clarifyingQuestions.map(q => `• ${q}`).join('<br>')

    return {
      text: `I can help you find a great match! To give you the best options, could you tell me:<br><br>${questionsText}`,
      needsMoreInfo: true,
      clarifyingQuestions,
      sessionCards: [{
        type: 'no-availability',
        data: { message: 'Let me help you find the perfect match with a bit more info!' }
      }]
    }
  }

  /**
   * Execute database queries based on extracted parameters
   */
  private static async executeMatchmakingQueries(params: MatchmakingQuery) {
    try {
      // Convert MatchmakingQuery to QueryFilters
      const filters: QueryFilters = {
        skillLevel: params.skillLevel,
        location: params.location,
        venue: params.venue,
        timeSlot: params.timeSlot,
        date: params.date,
        priceRange: params.priceRange,
        playerCount: params.playerCount
      }

      // Execute comprehensive query using the new service
      const results = await MatchmakingQueryService.executeComprehensiveQuery(filters)
      
      console.log('📊 Matchmaking query results:', {
        venues: results.venues.length,
        players: results.players.length,
        sessions: results.sessions.length,
        total: results.totalResults,
        venueDetails: results.venues.map(v => ({ name: v.name, id: v.id })),
        playerDetails: results.players.map(p => ({ name: p.name, skill: p.skillLevel }))
      })
      
      // Log if we got no results to help debug
      if (results.totalResults === 0) {
        console.warn('⚠️ No results found with filters:', filters)
      }

      return results

    } catch (error) {
      console.error('❌ Error in matchmaking queries:', error)
      return {
        venues: [],
        players: [],
        sessions: [],
        totalResults: 0
      }
    }
  }

  /**
   * Generate final AI response with matching results
   */
  private static async generateMatchmakingResponse(
    userInput: string,
    params: MatchmakingQuery,
    results: { venues: any[]; players: any[]; sessions: any[]; totalResults: number }
  ): Promise<AIResponse> {
    // Use enhanced session card creation
    const sessionCards = this.createEnhancedSessionCards(results.venues, params, results.players)

    // Add existing open sessions if available
    if (results.sessions.length > 0) {
      results.sessions.slice(0, 2).forEach(session => {
        // Find venue info for location data
        const venue = results.venues.find(v => v.name === session.venue)
        const address = venue?.address ? `${venue.address.area}, ${venue.address.city}` : 'Jakarta'
        
        sessionCards.push({
          type: 'existing-session',
          data: {
            venue: session.venue,
            time: session.time,
            date: session.date,
            cost: session.cost,
            players: session.players,
            openSlots: session.openSlots
          }
        })
      })
    }

    // Generate AI response text
    const responseText = await this.generateResponseText(userInput, params, results, sessionCards)

    // Handle no results case with better alternatives
    if (sessionCards.length === 0) {
      return {
        text: responseText,
        sessionCards: [{
          type: 'create-new',
          data: {
            venue: 'Create Your Own Session',
            suggestedTime: params.timeSlot ? this.formatTimeSlot(params.timeSlot).time : '8-9 PM',
            suggestedDate: params.timeSlot ? this.formatTimeSlot(params.timeSlot).date : 'Today',
            estimatedCost: 'Rp 175,000 per hour',
            message: 'No existing sessions found - but you can start a new one and invite others to join!'
          }
        }]
      }
    }

    return {
      text: responseText,
      sessionCards
    }
  }

  /**
   * Generate contextual response text using AI
   */
  private static async generateResponseText(
    userInput: string,
    params: MatchmakingQuery,
    results: any,
    sessionCards: MatchmakingResult[]
  ): Promise<string> {
    const prompt = `
    Generate a helpful, conversational response for a padel matchmaking request.
    
    User asked: "${userInput}"
    
    We found:
    - ${results.venues.length} venues
    - ${results.players.length} players
    - ${results.sessions.length} open sessions
    - ${sessionCards.length} total options
    
    Parameters: ${JSON.stringify(params)}
    
    Write a brief, friendly response (2-3 sentences max) that:
    1. Acknowledges their request
    2. Mentions what we found
    3. Encourages them to check the options below
    
    Keep it conversational and helpful. Don't repeat the session details (they're shown in cards).`

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      })

      return response.text || 'Great! I found some options for you:'
    } catch (error) {
      console.error('❌ Error generating response text:', error)
      
      // Enhanced fallback responses based on results
      if (results.totalResults > 0) {
        const resultTypes = []
        if (results.venues.length > 0) resultTypes.push(`${results.venues.length} venue${results.venues.length > 1 ? 's' : ''}`)
        if (results.players.length > 0) resultTypes.push(`${results.players.length} player${results.players.length > 1 ? 's' : ''}`)
        if (results.sessions.length > 0) resultTypes.push(`${results.sessions.length} open session${results.sessions.length > 1 ? 's' : ''}`)
        
        return `Perfect! I found ${resultTypes.join(' and ')} that match your request:`
      } else {
        return "I couldn't find exact matches for your request, but here are some alternatives:"
      }
    }
  }

  /**
   * Format time slot for display using smart ranges
   */
  private static formatTimeSlot(timeSlot?: string, date?: string): { time: string; date: string } {
    // Use InputAnalysisService to get proper time range
    if (timeSlot) {
      const timeRange = InputAnalysisService.getTimeRange(timeSlot)
      const formattedDate = this.formatDate(timeSlot, date)
      
      return {
        time: timeRange.display,
        date: formattedDate
      }
    }

    return {
      time: '8-9 PM',
      date: 'Today'
    }
  }

  /**
   * Format date based on time slot context with specific dates
   */
  private static formatDate(timeSlot?: string, date?: string): string {
    const today = new Date()
    
    // Extract date from complex time expressions
    if (timeSlot?.includes('weekend_anytime') || timeSlot?.includes('weekend')) {
      const saturday = new Date(today)
      saturday.setDate(today.getDate() + (6 - today.getDay()))
      const sunday = new Date(saturday)
      sunday.setDate(saturday.getDate() + 1)
      
      const satDate = saturday.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      const sunDate = sunday.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      
      return `${satDate} or ${sunDate}`
    }
    
    if (timeSlot?.includes('tomorrow')) {
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      const tomorrowDate = tomorrow.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      return `Tomorrow (${tomorrowDate})`
    }
    
    if (timeSlot?.includes('tonight')) {
      const todayDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      return `Tonight (${todayDate})`
    }
    
    // Use provided date or default
    const dateMap: { [key: string]: string } = {
      'today': `Today (${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
      'tomorrow': `Tomorrow (${new Date(today.getTime() + 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
    }

    return date && dateMap[date] ? dateMap[date] : `Today (${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
  }

  /**
   * Group venues with multiple courts for better organization
   * @deprecated Currently unused but kept for future enhancement
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static groupVenuesByLocation(venues: any[]): any[] {
    const venueGroups = new Map<string, any[]>()
    
    venues.forEach(venue => {
      const key = `${venue.name}-${venue.address?.area || 'Jakarta'}`
      if (!venueGroups.has(key)) {
        venueGroups.set(key, [])
      }
      venueGroups.get(key)!.push(venue)
    })

    // Convert grouped venues to enhanced format
    const enhancedVenues: any[] = []
    venueGroups.forEach((venueList, _key) => {
      const mainVenue = venueList[0]
      
      if (venueList.length > 1) {
        // Multiple courts at same venue
        const courts = venueList.map((venue, index) => ({
          name: `Court ${index + 1}`,
          available: true,
          cost: `Rp ${venue.pricing.hourlyRate?.toLocaleString() || '175,000'} each`
        }))
        
        enhancedVenues.push({
          ...mainVenue,
          courts
        })
      } else {
        // Single court venue
        enhancedVenues.push(mainVenue)
      }
    })

    return enhancedVenues
  }

  /**
   * Create enhanced session cards with smart consolidation
   */
  private static createEnhancedSessionCards(
    venues: any[], 
    params: MatchmakingQuery, 
    players: any[]
  ): MatchmakingResult[] {
    const sessionCards: MatchmakingResult[] = []
    const consolidatedSessions = this.consolidateIdenticalSessions(venues, params, players)
    
    consolidatedSessions.forEach(session => {
      // Remove hasPlayers property before adding to card data
      const { hasPlayers, venues, ...cardData } = session
      sessionCards.push({
        type: hasPlayers ? 'existing-session' : 'create-new',
        data: cardData
      })
    })
    
    return sessionCards
  }

  /**
   * Consolidate sessions with identical parameters
   */
  private static consolidateIdenticalSessions(venues: any[], params: MatchmakingQuery, players: any[]): any[] {
    const sessionMap = new Map<string, any>()
    const timeSlot = this.formatTimeSlot(params.timeSlot, params.date)
    
    venues.forEach(venue => {
      const address = venue.address?.area || 'Jakarta'
      const cost = venue.pricing.hourlyRate || 175000
      
      // Create unique key for identical sessions
      const sessionKey = `${address}-${timeSlot.time}-${timeSlot.date}-${cost}`
      
      if (sessionMap.has(sessionKey)) {
        // Consolidate with existing session
        const existing = sessionMap.get(sessionKey)!
        existing.venues.push(venue)
        existing.totalCourts += 1
      } else {
        // Create new consolidated session
        sessionMap.set(sessionKey, {
          sessionId: sessionKey,
          venue: venue.name,
          time: timeSlot.time,
          date: timeSlot.date,
          cost: `Rp ${cost.toLocaleString()}/hour`,
          venues: [venue],
          totalCourts: 1,
          players: [],
          openSlots: 4,
          hasPlayers: false
        })
      }
    })
    
    // Add players to consolidated sessions
    if (players.length > 0) {
      const playersData = players.slice(0, 3).map(player => ({
        name: player.name,
        skillLevel: player.skillLevel
      }))
      
      // Add players to all sessions to show join opportunities
      Array.from(sessionMap.values()).forEach(session => {
        session.players = playersData
        session.openSlots = Math.max(1, 4 - playersData.length)
        session.hasPlayers = true
      })
    }
    
    return Array.from(sessionMap.values()).slice(0, 3)
  }

  /**
   * Handle insufficient input with smart suggestions
   */
  static handleInsufficientInput(userInput: string): AIResponse {
    // Use input analysis to provide more intelligent responses
    const analysis = InputAnalysisService.analyzeInput(userInput)
    
    // Handle greetings
    if (analysis.isGreeting) {
      return {
        text: `Hello! I'm your AI padel assistant. I can help you:<br><br>
        • Find available courts and venues<br>
        • Match you with compatible players<br>
        • Organize games and sessions<br><br>
        What would you like to do today?`,
        needsMoreInfo: true,
        sessionCards: [{
          type: 'no-availability',
          data: { message: 'Ready to play some padel?' }
        }]
      }
    }

    // Handle help requests
    if (analysis.isHelp) {
      return {
        text: `I'm MaBar AI! Here's how I can help you:<br><br>
        🏟️ <strong>Find Courts:</strong> "Show courts tomorrow evening"<br>
        👥 <strong>Find Partners:</strong> "Find intermediate players"<br>
        📅 <strong>Book Sessions:</strong> "Book a court this weekend"<br>
        🎯 <strong>Match Making:</strong> "Find me a game tonight"<br><br>
        Just tell me what you're looking for!`,
        needsMoreInfo: true,
        sessionCards: [{
          type: 'no-availability',
          data: { message: 'Ready to get started?' }
        }]
      }
    }

    // Handle very short inputs
    if (analysis.inputLength <= 2) {
      return {
        text: `Hi there! Your message seems quite short. I'm here to help you with padel-related queries.<br><br>
        Try asking something like:<br>
        • "Find me a partner for tonight"<br>
        • "Show available courts tomorrow"<br>
        • "Book a court this weekend"`,
        needsMoreInfo: true,
        sessionCards: [{
          type: 'no-availability',
          data: { message: 'Need help getting started?' }
        }]
      }
    }

    // Provide specific guidance based on what we could detect
    const suggestions = []
    if (!analysis.time.timeSlot || analysis.time.confidence < 0.5) {
      suggestions.push('When would you like to play? (e.g., "tonight", "tomorrow morning", "this weekend")')
    }
    if (!analysis.location.location || analysis.location.confidence < 0.5) {
      suggestions.push('Which area do you prefer? (e.g., "Senayan", "Kemang", "anywhere in Jakarta")')
    }
    if (analysis.intent === 'unclear') {
      suggestions.push('Are you looking for players to join you, or available courts to book?')
    }

    const suggestionText = suggestions.length > 0 
      ? suggestions.map(s => `• ${s}`).join('<br>')
      : '• "Find courts in Jakarta tomorrow"<br>• "Looking for intermediate players"<br>• "Want to play this evening"'

    return {
      text: `I'd love to help you with padel! To give you the best recommendations, could you tell me:<br><br>${suggestionText}`,
      needsMoreInfo: true,
      sessionCards: [{
        type: 'no-availability',
        data: { message: 'Need help finding the right match?' }
      }]
    }
  }
}

/**
 * Enhanced error handling and recovery
 */
export class MatchmakingErrorHandler {
  static handleQueryError(error: any, context: string): AIResponse {
    console.error(`❌ Matchmaking error in ${context}:`, error)
    
    return {
      text: `I encountered an issue while ${context}. Let me try a different approach or you can try rephrasing your request.`,
      sessionCards: [{
        type: 'no-availability',
        data: { message: 'Service temporarily unavailable - please try again' }
      }]
    }
  }

  static handleNoResults(params: MatchmakingQuery): AIResponse {
    const suggestions = []
    
    if (params.skillLevel) {
      suggestions.push(`Try searching for "${params.skillLevel === 'advanced' ? 'intermediate' : 'any skill level'}" players`)
    }
    
    if (params.location && params.location !== 'jakarta_area') {
      suggestions.push('Try expanding to "anywhere in Jakarta"')
    }
    
    if (params.timeSlot) {
      const altTimes = {
        'morning': 'afternoon or evening',
        'afternoon': 'morning or evening', 
        'evening': 'afternoon or morning',
        'night': 'evening'
      }
      suggestions.push(`Try "${altTimes[params.timeSlot as keyof typeof altTimes]}" instead`)
    }

    const suggestionText = suggestions.length > 0
      ? `<br><br>Try these alternatives:<br>• ${suggestions.join('<br>• ')}`
      : ''

    return {
      text: `I couldn't find exact matches for your request.${suggestionText}<br><br>Or I can help you create a new session!`,
      sessionCards: [{
        type: 'no-availability',
        data: { message: 'No exact matches - but we can create something new!' }
      }]
    }
  }
}