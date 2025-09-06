// AI Service for Back4App Cloud Functions
// Uses the new @mabar/ai-services package

const { createGeminiService } = require('@mabar/ai-services');

/**
 * Cloud AI Service Manager
 * Manages AI service instances for cloud functions using the new package
 */
class CloudAIServiceManager {
  constructor() {
    this.aiService = null;
    this.initialized = false;
  }

  /**
   * Initialize AI service
   */
  initialize() {
    if (this.initialized) return;

    try {
      // Get API key from environment
      const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error('No Gemini API key found in environment variables');
      }

      // Create Gemini service using the new package
      this.aiService = createGeminiService(apiKey, {
        model: 'gemini-pro',
        temperature: 0.7,
        maxTokens: 2048,
        timeout: 25000 // Shorter timeout for cloud functions
      });

      this.initialized = true;
      console.log('✅ Cloud AI Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Cloud AI Service:', error);
      throw error;
    }
  }

  /**
   * Get AI service instance
   */
  getService() {
    if (!this.initialized) {
      this.initialize();
    }
    return this.aiService;
  }

  /**
   * Process matchmaking request using the new AI service
   */
  async processMatchmakingRequest(message, userProfile = {}, language = 'en') {
    const service = this.getService();

    try {
      console.log('🤖 Processing matchmaking request:', { message, language });

      // Step 1: Analyze intent using the new package
      const intent = await service.analyzeIntent(message, userProfile, language);
      console.log('📝 Intent analysis:', intent);

      // Step 2: Handle based on intent type
      if (intent.type !== 'matchmaking') {
        return this.handleCasualMessage(intent, message, userProfile, language);
      }

      // Step 3: Execute function calls (simulate database queries)
      const processedData = await this.executeFunctionCalls(intent.functionCalls, intent.extractedData);
      console.log('🔍 Processed data:', processedData);

      // Step 4: Generate natural language response using the new package
      const naturalLanguageResponse = await service.generateResponse({
        data: processedData,
        context: {
          originalMessage: message,
          userProfile,
          language
        },
        options: {
          tone: 'friendly',
          length: 'medium',
          includeEmojis: true
        }
      });

      return {
        success: true,
        data: {
          naturalLanguage: naturalLanguageResponse,
          structuredData: processedData,
          reasoning: {
            why: this.generateReasoningExplanation(intent, processedData),
            confidence: intent.confidence,
            factors: ['AI-powered intent analysis', 'Database query optimization']
          },
          actionable: {
            canBookNow: processedData.courts && processedData.courts.length > 0,
            needsMoreInfo: this.determineNeededInfo(intent),
            suggestedQuestions: this.generateSuggestedQuestions(processedData, language)
          }
        }
      };
    } catch (error) {
      console.error('❌ Error processing matchmaking request:', error);
      return {
        success: false,
        error: error.message,
        data: {
          naturalLanguage: language === 'id'
            ? 'Maaf, terjadi kesalahan saat memproses permintaan Anda.'
            : 'Sorry, there was an error processing your request.',
          structuredData: { courts: [], players: [] },
          reasoning: { why: 'Error occurred', confidence: 0, factors: ['Error handling'] },
          actionable: { canBookNow: false, needsMoreInfo: [], suggestedQuestions: [] }
        }
      };
    }
  }

  /**
   * Handle casual messages using the new AI service
   */
  async handleCasualMessage(intent, message, userProfile, language) {

    const responses = {
      id: {
        greeting: 'Halo! Saya MaBar AI, asisten untuk mencari lapangan padel dan partner main. Ada yang bisa saya bantu hari ini?',
        help: 'Saya MaBar AI! Saya bisa membantu Anda mencari lapangan padel, menemukan partner main, dan memberikan rekomendasi.',
        general: 'Halo! Saya MaBar AI untuk padel matchmaking. Ada yang bisa dibantu?'
      },
      en: {
        greeting: 'Hello! I\'m MaBar AI, your padel matchmaking assistant. How can I help you today?',
        help: 'I\'m MaBar AI! I can help you find padel courts, match with players, and provide recommendations.',
        general: 'Hello! I\'m MaBar AI for padel matchmaking. What can I do for you?'
      }
    };

    const langResponses = responses[language] || responses.en;
    let responseText = langResponses.general;

    if (intent.type === 'greeting') {
      responseText = langResponses.greeting;
    } else if (intent.type === 'help') {
      responseText = langResponses.help;
    }

    return {
      success: true,
      data: {
        naturalLanguage: responseText,
        structuredData: { courts: [], players: [] },
        reasoning: {
          why: 'Casual conversation or help request',
          confidence: intent.confidence,
          factors: ['Intent detection', 'Conversational AI']
        },
        actionable: {
          canBookNow: false,
          needsMoreInfo: [],
          suggestedQuestions: language === 'id' ? [
            'Cari lapangan padel besok sore',
            'Mau main padel di Jakarta',
            'Carikan partner main skill intermediate'
          ] : [
            'Find padel courts tomorrow evening',
            'Want to play padel in Jakarta',
            'Find me an intermediate skill partner'
          ]
        }
      }
    };
  }

  /**
   * Execute function calls (simulate database operations)
   */
  async executeFunctionCalls(functionCalls, extractedData) {
    const processedData = {
      courts: [],
      players: []
    };

    for (const functionCall of functionCalls) {
      try {
        console.log(`🔧 Executing function: ${functionCall.name}`);

        switch (functionCall.name) {
          case 'findCourts':
            processedData.courts = await this.findCourts(functionCall.parameters, extractedData);
            break;

          case 'findPlayers':
            processedData.players = await this.findPlayers(functionCall.parameters, extractedData);
            break;

          default:
            console.warn(`⚠️ Unknown function call: ${functionCall.name}`);
        }
      } catch (error) {
        console.error(`❌ Error executing function ${functionCall.name}:`, error);
      }
    }

    return processedData;
  }

  /**
   * Find courts (simulate database query)
   */
  async findCourts(parameters, extractedData) {
    // In a real implementation, this would query Parse database
    // For now, return mock data
    return [
      {
        id: 'court-1',
        name: 'Jakarta Padel Center',
        address: { city: 'Jakarta', area: 'Senayan' },
        rating: 4.5,
        pricing: { hourlyRate: 175000, currency: 'IDR' },
        reasoning: 'Popular venue with good facilities'
      },
      {
        id: 'court-2',
        name: 'Elite Padel Club',
        address: { city: 'Jakarta', area: 'Kemang' },
        rating: 4.7,
        pricing: { hourlyRate: 200000, currency: 'IDR' },
        reasoning: 'Premium facilities and location'
      }
    ];
  }

  /**
   * Find players (simulate database query)
   */
  async findPlayers(parameters, extractedData) {
    // In a real implementation, this would query Parse database
    return [
      {
        id: 'player-1',
        name: 'Ahmad Rizki',
        skillLevel: 'intermediate',
        playingStyle: 'competitive',
        reasoning: 'Similar skill level and playing style'
      },
      {
        id: 'player-2',
        name: 'Sari Dewi',
        skillLevel: 'intermediate',
        playingStyle: 'casual',
        reasoning: 'Compatible skill level'
      }
    ];
  }

  /**
   * Generate reasoning explanation
   */
  generateReasoningExplanation(intent, processedData) {
    const parts = [];

    if (processedData.courts && processedData.courts.length > 0) {
      parts.push(`Found ${processedData.courts.length} matching courts`);
    }

    if (processedData.players && processedData.players.length > 0) {
      parts.push(`Found ${processedData.players.length} compatible players`);
    }

    if (parts.length === 0) {
      parts.push('No direct matches found');
    }

    return parts.join(', ');
  }

  /**
   * Determine needed information
   */
  determineNeededInfo(intent) {
    const needed = [];

    if (intent.confidence < 0.7) {
      needed.push('more specific request');
    }

    return needed;
  }

  /**
   * Generate suggested questions
   */
  generateSuggestedQuestions(processedData, language) {
    const suggestions = [];

    if (processedData.courts && processedData.courts.length > 0) {
      suggestions.push(language === 'id' ?
        'Mau lihat detail lapangan yang tersedia?' :
        'Would you like to see court details?');
    }

    if (processedData.players && processedData.players.length > 0) {
      suggestions.push(language === 'id' ?
        'Mau saya carikan partner main?' :
        'Should I find you a playing partner?');
    }

    return suggestions;
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const service = this.getService();
      const health = await service.healthCheck();
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        aiService: health
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }
}

// Create singleton instance
const cloudAIService = new CloudAIServiceManager();

// Export for use in cloud functions
module.exports = {
  CloudAIServiceManager,
  cloudAIService
};
    try {
      const prompt = this.buildIntentAnalysisPrompt(message, userProfile, language);
      const response = await this.callGeminiAPI(prompt);
      
      return this.parseIntentAnalysisResponse(response, message);
    } catch (error) {
      console.error('Gemini intent analysis error:', error);
      return this.getFallbackIntentAnalysis(message);
    }
  }

  async generateResponse(processedData, originalMessage, userProfile = {}, language = 'en') {
    try {
      const prompt = this.buildResponseGenerationPrompt(
        processedData, 
        originalMessage, 
        userProfile, 
        language
      );
      
      const response = await this.callGeminiAPI(prompt);
      return this.cleanResponse(response);
    } catch (error) {
      console.error('Gemini response generation error:', error);
      return this.getFallbackResponse(processedData, language);
    }
  }

  buildIntentAnalysisPrompt(message, userProfile, language) {
    return `
You are MaBar AI, a padel matchmaking assistant. Analyze this user message and extract structured information.

User Message: "${message}"
User Profile: ${JSON.stringify(userProfile)}
Language: ${language}

Analyze the message and return a JSON response with this exact structure:
{
  "intent": {
    "type": "matchmaking|casual|help|greeting",
    "subtype": "specific subtype if applicable",
    "confidence": 0.0-1.0
  },
  "extractedData": {
    "timePreferences": {
      "preferred": "exact time if specified or null",
      "flexible": ["alternative time slots"],
      "timeOfDay": "morning|afternoon|evening or null"
    },
    "locationPreferences": {
      "primary": "specific location if mentioned or null",
      "radius": 10,
      "alternatives": ["nearby areas"]
    },
    "skillRequirements": {
      "level": "beginner|intermediate|advanced or null",
      "flexibility": "strict|moderate|flexible"
    },
    "sessionType": "casual|competitive|training",
    "groupSize": "singles|doubles"
  },
  "functionCalls": [
    {
      "name": "function_name",
      "parameters": {},
      "description": "what this function does"
    }
  ]
}

Based on the intent, suggest appropriate function calls:
- For court finding: "findCourts"
- For player matching: "findPlayers" 
- For user context: "getUserContext"
- For availability: "getAvailabilityMatrix"

Return only valid JSON, no additional text.
    `.trim();
  }

  buildResponseGenerationPrompt(processedData, originalMessage, userProfile, language) {
    const { courts, players, alternatives } = processedData;
    
    return `
You are MaBar AI, a friendly padel matchmaking assistant. Generate a natural, helpful response.

Original User Message: "${originalMessage}"
User Profile: ${JSON.stringify(userProfile)}
Language: ${language}

Available Data:
- Courts Found: ${courts.length}
- Players Found: ${players.length}
- Alternatives Available: ${Object.keys(alternatives).length > 0}

Courts: ${JSON.stringify(courts.slice(0, 3))}
Players: ${JSON.stringify(players.slice(0, 3))}
Alternatives: ${JSON.stringify(alternatives)}

Generate a conversational response that:
1. Acknowledges the user's request
2. Presents the findings in a natural way
3. Provides actionable next steps
4. Maintains a friendly, helpful tone
5. Uses ${language === 'id' ? 'Indonesian' : 'English'} language

Keep the response concise but informative. Use emojis sparingly and appropriately.
    `.trim();
  }

  async callGeminiAPI(prompt) {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: this.config.temperature,
          maxOutputTokens: this.config.maxTokens
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: this.config.timeout
      }
    );

    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  parseIntentAnalysisResponse(response, originalMessage) {
    try {
      const parsed = JSON.parse(response);
      
      if (!parsed.intent || !parsed.extractedData) {
        throw new Error('Invalid response structure');
      }

      return {
        intent: {
          type: parsed.intent.type || 'casual',
          subtype: parsed.intent.subtype,
          confidence: parsed.intent.confidence || 0.5
        },
        extractedData: {
          timePreferences: parsed.extractedData.timePreferences || {},
          locationPreferences: parsed.extractedData.locationPreferences || { radius: 10, alternatives: [] },
          skillRequirements: parsed.extractedData.skillRequirements || { flexibility: 'moderate' },
          sessionType: parsed.extractedData.sessionType || 'casual',
          groupSize: parsed.extractedData.groupSize || 'doubles'
        },
        functionCalls: parsed.functionCalls || []
      };
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      return this.getFallbackIntentAnalysis(originalMessage);
    }
  }

  getFallbackIntentAnalysis(message) {
    const cleanMessage = message.toLowerCase().trim();
    
    let intent = { type: 'casual', confidence: 0.3 };
    let functionCalls = [];

    if (cleanMessage.includes('court') || cleanMessage.includes('lapangan')) {
      intent = { type: 'matchmaking', subtype: 'court_search', confidence: 0.7 };
      functionCalls.push({
        name: 'findCourts',
        parameters: { location: 'Jakarta' },
        description: 'Find available courts'
      });
    } else if (cleanMessage.includes('partner') || cleanMessage.includes('player')) {
      intent = { type: 'matchmaking', subtype: 'player_search', confidence: 0.7 };
      functionCalls.push({
        name: 'findPlayers',
        parameters: { skillLevel: 'intermediate' },
        description: 'Find compatible players'
      });
    } else if (cleanMessage.includes('hello') || cleanMessage.includes('hi')) {
      intent = { type: 'greeting', confidence: 0.9 };
    } else if (cleanMessage.includes('help')) {
      intent = { type: 'help', confidence: 0.8 };
    }

    return {
      intent,
      extractedData: {
        sessionType: 'casual',
        groupSize: 'doubles'
      },
      functionCalls
    };
  }

  getFallbackResponse(processedData, language) {
    const { courts, players } = processedData;
    
    if (language === 'id') {
      if (courts.length > 0) {
        return `Saya menemukan ${courts.length} lapangan yang tersedia untuk Anda.`;
      } else if (players.length > 0) {
        return `Saya menemukan ${players.length} pemain yang cocok dengan preferensi Anda.`;
      } else {
        return 'Maaf, saya tidak menemukan hasil yang sesuai. Coba dengan kriteria yang berbeda.';
      }
    } else {
      if (courts.length > 0) {
        return `I found ${courts.length} available courts for you.`;
      } else if (players.length > 0) {
        return `I found ${players.length} players that match your preferences.`;
      } else {
        return 'Sorry, I couldn\'t find any matches. Try different criteria.';
      }
    }
  }

  cleanResponse(response) {
    return response.replace(/```json|```/g, '').trim();
  }
}

/**
 * Data Access Layer for Cloud Functions
 */
class CloudDataAccessLayer {
  async findCourts(criteria) {
    try {
      const VenueQuery = new Parse.Query('Venue');
      
      if (criteria.location) {
        VenueQuery.contains('address', criteria.location);
      }

      if (criteria.facilities && criteria.facilities.length > 0) {
        VenueQuery.containsAll('facilities', criteria.facilities);
      }

      if (criteria.priceRange) {
        VenueQuery.greaterThanOrEqualTo('hourlyRate', criteria.priceRange.min);
        VenueQuery.lessThanOrEqualTo('hourlyRate', criteria.priceRange.max);
      }

      VenueQuery.equalTo('status', 'approved');
      VenueQuery.limit(10);

      const venues = await VenueQuery.find({ useMasterKey: true });

      return venues.map(venue => this.mapVenueToCourtRecommendation(venue, criteria));
    } catch (error) {
      console.error('Error finding courts:', error);
      return this.getMockCourts(criteria);
    }
  }

  async findPlayers(criteria) {
    try {
      const PlayerQuery = new Parse.Query('PlayerProfile');
      
      if (criteria.skillLevel) {
        PlayerQuery.equalTo('skillLevel', criteria.skillLevel);
      }

      if (criteria.location) {
        PlayerQuery.contains('location', criteria.location);
      }

      if (criteria.playingStyle) {
        PlayerQuery.equalTo('playingStyle', criteria.playingStyle);
      }

      PlayerQuery.limit(10);
      PlayerQuery.include('user');

      const players = await PlayerQuery.find({ useMasterKey: true });

      return players.map(player => this.mapPlayerToRecommendation(player, criteria));
    } catch (error) {
      console.error('Error finding players:', error);
      return this.getMockPlayers(criteria);
    }
  }

  mapVenueToCourtRecommendation(venue, criteria) {
    const matchScore = this.calculateCourtMatchScore(venue, criteria);
    
    return {
      id: venue.id,
      name: venue.get('name') || 'Unknown Venue',
      address: venue.get('address') || {},
      facilities: venue.get('facilities') || [],
      pricing: {
        hourlyRate: venue.get('hourlyRate') || 0,
        currency: 'IDR'
      },
      rating: venue.get('rating') || 4.0,
      matchScore,
      reasoning: this.generateCourtReasoning(venue, criteria, matchScore)
    };
  }

  mapPlayerToRecommendation(player, criteria) {
    const matchScore = this.calculatePlayerMatchScore(player, criteria);
    const user = player.get('user');
    
    return {
      id: player.id,
      name: user?.get('firstName') || 'Anonymous Player',
      skillLevel: player.get('skillLevel') || 'intermediate',
      playingStyle: player.get('playingStyle') || 'casual',
      preferredTimes: player.get('preferredTimes') || ['evening'],
      matchScore,
      reasoning: this.generatePlayerReasoning(player, criteria, matchScore)
    };
  }

  calculateCourtMatchScore(venue, criteria) {
    let score = 0.5;

    if (criteria.location && venue.get('address')) {
      const address = JSON.stringify(venue.get('address')).toLowerCase();
      if (address.includes(criteria.location.toLowerCase())) {
        score += 0.3;
      }
    }

    if (criteria.facilities) {
      const venueFacilities = venue.get('facilities') || [];
      const matchingFacilities = criteria.facilities.filter(f => 
        venueFacilities.includes(f)
      );
      score += (matchingFacilities.length / criteria.facilities.length) * 0.2;
    }

    return Math.min(score, 1.0);
  }

  calculatePlayerMatchScore(player, criteria) {
    let score = 0.5;

    if (criteria.skillLevel && player.get('skillLevel') === criteria.skillLevel) {
      score += 0.3;
    }

    if (criteria.playingStyle && player.get('playingStyle') === criteria.playingStyle) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  generateCourtReasoning(venue, criteria, matchScore) {
    const reasons = [];

    if (matchScore > 0.8) {
      reasons.push('Perfect match for your criteria');
    } else if (matchScore > 0.6) {
      reasons.push('Good match for your preferences');
    } else {
      reasons.push('Available option');
    }

    if (venue.get('rating') > 4.5) {
      reasons.push('highly rated');
    }

    return reasons.join(', ');
  }

  generatePlayerReasoning(player, criteria, matchScore) {
    const reasons = [];

    if (criteria.skillLevel && player.get('skillLevel') === criteria.skillLevel) {
      reasons.push('matching skill level');
    }

    if (criteria.playingStyle && player.get('playingStyle') === criteria.playingStyle) {
      reasons.push('similar playing style');
    }

    return reasons.length > 0 ? reasons.join(', ') : 'compatible player';
  }

  getMockCourts(criteria) {
    return [
      {
        id: 'mock-court-1',
        name: 'Jakarta Padel Center',
        address: { city: 'Jakarta', area: 'Senayan' },
        facilities: ['parking', 'shower', 'equipment_rental'],
        pricing: { hourlyRate: 175000, currency: 'IDR' },
        rating: 4.5,
        matchScore: 0.8,
        reasoning: 'Popular venue with good facilities'
      },
      {
        id: 'mock-court-2',
        name: 'Elite Padel Club',
        address: { city: 'Jakarta', area: 'Kemang' },
        facilities: ['parking', 'shower', 'cafe'],
        pricing: { hourlyRate: 200000, currency: 'IDR' },
        rating: 4.7,
        matchScore: 0.7,
        reasoning: 'Premium facilities and location'
      }
    ];
  }

  getMockPlayers(criteria) {
    return [
      {
        id: 'mock-player-1',
        name: 'Ahmad Rizki',
        skillLevel: 'intermediate',
        playingStyle: 'competitive',
        preferredTimes: ['evening'],
        matchScore: 0.9,
        reasoning: 'Similar skill level and playing style'
      },
      {
        id: 'mock-player-2',
        name: 'Sari Dewi',
        skillLevel: 'intermediate',
        playingStyle: 'casual',
        preferredTimes: ['afternoon', 'evening'],
        matchScore: 0.7,
        reasoning: 'Compatible skill level'
      }
    ];
  }
}

module.exports = {
  CloudAIServiceFactory,
  GeminiCloudService,
  CloudDataAccessLayer
};
