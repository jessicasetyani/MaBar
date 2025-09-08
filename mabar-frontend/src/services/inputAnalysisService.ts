/**
 * Input Analysis Service for AI Matchmaking
 * Handles natural language processing and parameter extraction
 */

export interface TimeSlotAnalysis {
  timeSlot: string
  confidence: number
  clarification?: string
}

export interface LocationAnalysis {
  location: string
  confidence: number
  clarification?: string
}

export interface SkillLevelAnalysis {
  skillLevel: string
  confidence: number
}

export class InputAnalysisService {
  
  /**
   * Analyze time-related input with clarification for ambiguous terms
   */
  static analyzeTimeInput(input: string): TimeSlotAnalysis {
    const normalizedInput = input.toLowerCase()

    // Complex time expressions (high confidence - no clarification needed)
    const complexTimePatterns = {
      'weekend_morning': /\b(weekend\s*morning|saturday\s*morning|sunday\s*morning|weekend.*morning|morning.*weekend)\b/,
      'weekend_afternoon': /\b(weekend\s*afternoon|saturday\s*afternoon|sunday\s*afternoon|weekend.*afternoon|afternoon.*weekend)\b/,
      'weekend_evening': /\b(weekend\s*evening|saturday\s*evening|sunday\s*evening|weekend.*evening|evening.*weekend)\b/,
      'weekend_anytime': /\b(weekend|this\s*weekend|saturday|sunday)(?!\s*(morning|afternoon|evening))\b/,
      'weekday_anytime': /\b(weekday|weekdays|monday|tuesday|wednesday|thursday|friday)(?!\s*(morning|afternoon|evening))\b/,
      'tomorrow_morning': /\b(tomorrow\s*morning|morning.*tomorrow)\b/,
      'tomorrow_afternoon': /\b(tomorrow\s*afternoon|afternoon.*tomorrow)\b/,
      'tomorrow_evening': /\b(tomorrow\s*evening|evening.*tomorrow)\b/,
      'tonight_early': /\b(tonight.*early|early.*tonight|tonight.*6|tonight.*7)\b/,
      'tonight_prime': /\b(tonight|this\s*evening)\b/,
      'after_work': /\b(after\s*work|setelah\s*kerja|pulang\s*kerja)\b/,
      'lunch_time': /\b(lunch\s*time|makan\s*siang|siang\s*hari)\b/
    }

    // Check for complex patterns first (highest confidence)
    for (const [timeSlot, pattern] of Object.entries(complexTimePatterns)) {
      if (pattern.test(normalizedInput)) {
        return {
          timeSlot,
          confidence: 0.9 // High confidence - proceed without clarification
        }
      }
    }

    // Smart time range patterns (good confidence)
    const smartTimePatterns = {
      'morning_early': /\b(early\s*morning|6\s*am|7\s*am|8\s*am)\b/,
      'morning_late': /\b(late\s*morning|9\s*am|10\s*am|11\s*am)\b/,
      'afternoon_early': /\b(12\s*pm|1\s*pm|2\s*pm)\b/,
      'afternoon_late': /\b(3\s*pm|4\s*pm|5\s*pm)\b/,
      'evening_early': /\b(6\s*pm|7\s*pm)\b/,
      'evening_prime': /\b(8\s*pm|9\s*pm)\b/,
      'night': /\b(10\s*pm|11\s*pm|late)\b/
    }

    // Check for smart time patterns (good confidence)
    for (const [timeSlot, pattern] of Object.entries(smartTimePatterns)) {
      if (pattern.test(normalizedInput)) {
        return {
          timeSlot,
          confidence: 0.8 // Good confidence for smart ranges
        }
      }
    }

    // General time periods (medium confidence - use smart defaults)
    const generalTimePatterns = {
      'morning_general': /\b(morning|pagi)\b/,
      'afternoon_general': /\b(afternoon|siang)\b/,
      'evening_general': /\b(evening|sore|malam)\b/
    }

    // Check for general patterns (use smart defaults)
    for (const [timeSlot, pattern] of Object.entries(generalTimePatterns)) {
      if (pattern.test(normalizedInput)) {
        return {
          timeSlot,
          confidence: 0.7 // Medium confidence - proceed with smart default
        }
      }
    }

    return {
      timeSlot: '',
      confidence: 0.1 // Very low confidence
    }
  }

  /**
   * Generate smart time suggestions based on vague input
   * @deprecated Currently unused but kept for future enhancement
   */
  private static getSmartTimeSuggestions(timeSlot: string): string {
    const suggestions = {
      morning: 'Would you prefer early morning (7-9 AM) or late morning (9-11 AM)?',
      afternoon: 'Would you prefer lunch time (12-2 PM) or afternoon (3-5 PM)?',
      evening: 'Would you prefer after work (6-7 PM) or prime evening (8-9 PM)?',
      tonight: 'What time tonight works for you: early evening (6-7 PM) or prime time (8-9 PM)?'
    }
    
    return suggestions[timeSlot as keyof typeof suggestions] || 'What time range works best for you?'
  }

  /**
   * Convert smart time slots to display ranges
   */
  static getTimeRange(timeSlot: string): { display: string; range: string; duration: string } {
    const timeRanges = {
      // Complex expressions
      'weekend_morning': { display: '9-11 AM', range: '09:00-11:00', duration: '2h' },
      'weekend_afternoon': { display: '2-4 PM', range: '14:00-16:00', duration: '2h' },
      'weekend_evening': { display: '7-9 PM', range: '19:00-21:00', duration: '2h' },
      'weekend_anytime': { display: 'Anytime (Sat-Sun)', range: '08:00-22:00', duration: 'flexible' },
      'weekday_anytime': { display: 'Anytime (Mon-Fri)', range: '06:00-23:00', duration: 'flexible' },
      'tomorrow_morning': { display: '9-11 AM', range: '09:00-11:00', duration: '2h' },
      'tomorrow_afternoon': { display: '2-4 PM', range: '14:00-16:00', duration: '2h' },
      'tomorrow_evening': { display: '7-9 PM', range: '19:00-21:00', duration: '2h' },
      'tonight_early': { display: '6-7 PM', range: '18:00-19:00', duration: '1h' },
      'tonight_prime': { display: '8-9 PM', range: '20:00-21:00', duration: '1h' },
      'after_work': { display: '6-7 PM', range: '18:00-19:00', duration: '1h' },
      'lunch_time': { display: '12-1 PM', range: '12:00-13:00', duration: '1h' },
      
      // Smart ranges
      'morning_early': { display: '7-9 AM', range: '07:00-09:00', duration: '2h' },
      'morning_late': { display: '9-11 AM', range: '09:00-11:00', duration: '2h' },
      'afternoon_early': { display: '12-2 PM', range: '12:00-14:00', duration: '2h' },
      'afternoon_late': { display: '3-5 PM', range: '15:00-17:00', duration: '2h' },
      'evening_early': { display: '6-7 PM', range: '18:00-19:00', duration: '1h' },
      'evening_prime': { display: '8-9 PM', range: '20:00-21:00', duration: '1h' },
      'night': { display: '9-11 PM', range: '21:00-23:00', duration: '2h' },
      
      // General patterns with smart defaults
      'morning_general': { display: '9-11 AM', range: '09:00-11:00', duration: '2h' },
      'afternoon_general': { display: '2-4 PM', range: '14:00-16:00', duration: '2h' },
      'evening_general': { display: '7-9 PM', range: '19:00-21:00', duration: '2h' }
    }
    
    return timeRanges[timeSlot as keyof typeof timeRanges] || { display: 'Flexible', range: 'flexible', duration: '2h' }
  }

  /**
   * Analyze location input with Jakarta area specificity
   */
  static analyzeLocationInput(input: string): LocationAnalysis {
    const normalizedInput = input.toLowerCase()

    // Specific Jakarta areas
    const areaPatterns = {
      'Jakarta Barat': /\b(jakarta barat|west jakarta|kebon jeruk|grogol|cengkareng)\b/,
      'Jakarta Selatan': /\b(jakarta selatan|south jakarta|kemang|senayan|pondok indah|kebayoran)\b/,
      'Jakarta Pusat': /\b(jakarta pusat|central jakarta|menteng|tanah abang|gambir)\b/,
      'Jakarta Timur': /\b(jakarta timur|east jakarta|kelapa gading|rawamangun|cakung)\b/,
      'Jakarta Utara': /\b(jakarta utara|north jakarta|ancol|sunter|pluit)\b/,
      'Senayan': /\b(senayan|gelora|sudirman)\b/,
      'Kemang': /\b(kemang|radio dalam|ampera)\b/,
      'Kelapa Gading': /\b(kelapa gading|gading|mall of indonesia)\b/,
      'Pondok Indah': /\b(pondok indah|pim|lebak bulus)\b/
    }

    // Check for specific areas
    for (const [area, pattern] of Object.entries(areaPatterns)) {
      if (pattern.test(normalizedInput)) {
        return {
          location: area,
          confidence: 0.9
        }
      }
    }

    // General Jakarta
    if (/\b(jakarta|jkt)\b/.test(normalizedInput)) {
      return {
        location: 'jakarta_area',
        confidence: 0.7,
        clarification: 'Which area of Jakarta do you prefer? (e.g., Senayan, Kemang, Kelapa Gading)'
      }
    }

    // Anywhere/no preference
    if (/\b(anywhere|any|wherever|doesn't matter)\b/.test(normalizedInput)) {
      return {
        location: 'jakarta_area',
        confidence: 0.8
      }
    }

    return {
      location: 'jakarta_area',
      confidence: 0.5,
      clarification: 'Which area would you prefer?'
    }
  }

  /**
   * Analyze skill level mentions
   */
  static analyzeSkillLevel(input: string): SkillLevelAnalysis {
    const normalizedInput = input.toLowerCase()

    const skillPatterns = {
      beginner: /\b(beginner|pemula|newbie|new|basic|learning|starter)\b/,
      intermediate: /\b(intermediate|menengah|medium|average|decent|okay|ok)\b/,
      advanced: /\b(advanced|expert|pro|professional|mahir|skilled|experienced)\b/
    }

    for (const [skill, pattern] of Object.entries(skillPatterns)) {
      if (pattern.test(normalizedInput)) {
        return {
          skillLevel: skill,
          confidence: 0.9
        }
      }
    }

    return {
      skillLevel: 'intermediate', // Default assumption
      confidence: 0.3
    }
  }

  /**
   * Detect if input is asking for players vs courts
   */
  static detectSearchIntent(input: string): 'players' | 'courts' | 'both' | 'unclear' {
    const normalizedInput = input.toLowerCase()

    const playerKeywords = /\b(player|partner|teammate|friend|people|person|join|match me|find me a)\b/
    const courtKeywords = /\b(court|venue|book|reserve|available|facility|place to play)\b/

    const hasPlayerKeywords = playerKeywords.test(normalizedInput)
    const hasCourtsKeywords = courtKeywords.test(normalizedInput)

    if (hasPlayerKeywords && hasCourtsKeywords) return 'both'
    if (hasPlayerKeywords) return 'players'
    if (hasCourtsKeywords) return 'courts'
    
    return 'unclear'
  }

  /**
   * Extract player count from input
   */
  static extractPlayerCount(input: string): number | null {
    const normalizedInput = input.toLowerCase()

    // Look for explicit numbers
    const numberPatterns = [
      { pattern: /\b(one|1)\s+(player|person|partner)\b/, count: 1 },
      { pattern: /\b(two|2)\s+(players|people|partners)\b/, count: 2 },
      { pattern: /\b(three|3)\s+(players|people|partners)\b/, count: 3 },
      { pattern: /\b(four|4)\s+(players|people|partners)\b/, count: 4 },
      { pattern: /\bfull\s+(game|match|court)\b/, count: 4 },
      { pattern: /\bdoubles?\b/, count: 4 }
    ]

    for (const { pattern, count } of numberPatterns) {
      if (pattern.test(normalizedInput)) {
        return count
      }
    }

    return null
  }

  /**
   * Detect urgency/timing preferences
   */
  static detectUrgency(input: string): 'immediate' | 'flexible' | 'scheduled' {
    const normalizedInput = input.toLowerCase()

    if (/\b(now|asap|immediately|urgent|right now|today)\b/.test(normalizedInput)) {
      return 'immediate'
    }

    if (/\b(whenever|flexible|any time|doesn't matter when)\b/.test(normalizedInput)) {
      return 'flexible'
    }

    return 'scheduled'
  }

  /**
   * Extract price sensitivity
   */
  static analyzePriceSensitivity(input: string): {
    priceRange?: { min: number; max: number }
    sensitivity: 'budget' | 'premium' | 'any'
  } {
    const normalizedInput = input.toLowerCase()

    // Budget indicators
    if (/\b(cheap|budget|affordable|murah|hemat|economical)\b/.test(normalizedInput)) {
      return {
        priceRange: { min: 0, max: 150000 },
        sensitivity: 'budget'
      }
    }

    // Premium indicators
    if (/\b(premium|expensive|luxury|high-end|best|top)\b/.test(normalizedInput)) {
      return {
        priceRange: { min: 200000, max: 500000 },
        sensitivity: 'premium'
      }
    }

    // Specific price mentions (in Rupiah)
    const priceMatch = normalizedInput.match(/\b(\d+)k?\s*(rupiah|rp|ribu)?\b/)
    if (priceMatch) {
      const amount = parseInt(priceMatch[1]) * (priceMatch[0].includes('k') ? 1000 : 1)
      return {
        priceRange: { min: amount * 0.8, max: amount * 1.2 },
        sensitivity: 'any'
      }
    }

    return { sensitivity: 'any' }
  }

  /**
   * Comprehensive input analysis combining all methods
   */
  static analyzeInput(input: string) {
    const timeAnalysis = this.analyzeTimeInput(input)
    
    return {
      time: timeAnalysis,
      timeRange: timeAnalysis.timeSlot ? this.getTimeRange(timeAnalysis.timeSlot) : null,
      location: this.analyzeLocationInput(input),
      skillLevel: this.analyzeSkillLevel(input),
      intent: this.detectSearchIntent(input),
      playerCount: this.extractPlayerCount(input),
      urgency: this.detectUrgency(input),
      pricing: this.analyzePriceSensitivity(input),
      originalInput: input,
      inputLength: input.trim().length,
      isGreeting: /\b(hi|hello|hey|halo|hai)\b/i.test(input),
      isHelp: /\b(help|bantuan|what can you do)\b/i.test(input)
    }
  }
}