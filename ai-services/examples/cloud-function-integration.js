/**
 * Cloud Function Integration Example
 * Shows how to use @mabar/ai-services in Back4App cloud functions
 */

const { createGeminiService, AIServices } = require('@mabar/ai-services')

/**
 * Cloud AI Service Manager
 * Manages AI service instances for cloud functions
 */
class CloudAIServiceManager {
  constructor() {
    this.aiService = null
    this.initialized = false
  }

  /**
   * Initialize AI service
   */
  initialize() {
    if (this.initialized) return

    try {
      // Get API key from environment
      const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY
      
      if (!apiKey) {
        throw new Error('No Gemini API key found in environment variables')
      }

      // Create Gemini service
      this.aiService = createGeminiService(apiKey, {
        model: 'gemini-pro',
        temperature: 0.7,
        maxTokens: 2048,
        timeout: 25000 // Shorter timeout for cloud functions
      })

      this.initialized = true
      console.log('✅ Cloud AI Service initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Cloud AI Service:', error)
      throw error
    }
  }

  /**
   * Get AI service instance
   */
  getService() {
    if (!this.initialized) {
      this.initialize()
    }
    return this.aiService
  }

  /**
   * Process matchmaking request
   */
  async processMatchmakingRequest(message, userProfile = {}, language = 'en') {
    const service = this.getService()
    
    try {
      console.log('🤖 Processing matchmaking request:', { message, language })

      // Step 1: Analyze intent
      const intent = await service.analyzeIntent(message, userProfile, language)
      console.log('📝 Intent analysis:', intent)

      // Step 2: Handle based on intent type
      if (intent.type !== 'matchmaking') {
        return this.handleCasualMessage(intent, message, userProfile, language)
      }

      // Step 3: Execute function calls (simulate database queries)
      const processedData = await this.executeFunctionCalls(intent.functionCalls, intent.extractedData)
      console.log('🔍 Processed data:', processedData)

      // Step 4: Generate natural language response
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
      })

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
      }
    } catch (error) {
      console.error('❌ Error processing matchmaking request:', error)
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
      }
    }
  }

  /**
   * Handle casual messages
   */
  async handleCasualMessage(intent, message, userProfile, language) {
    const service = this.getService()

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
    }

    const langResponses = responses[language] || responses.en
    let responseText = langResponses.general

    if (intent.type === 'greeting') {
      responseText = langResponses.greeting
    } else if (intent.type === 'help') {
      responseText = langResponses.help
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
    }
  }

  /**
   * Execute function calls (simulate database operations)
   */
  async executeFunctionCalls(functionCalls, extractedData) {
    const processedData = {
      courts: [],
      players: []
    }

    for (const functionCall of functionCalls) {
      try {
        console.log(`🔧 Executing function: ${functionCall.name}`)
        
        switch (functionCall.name) {
          case 'findCourts':
            processedData.courts = await this.findCourts(functionCall.parameters, extractedData)
            break
          
          case 'findPlayers':
            processedData.players = await this.findPlayers(functionCall.parameters, extractedData)
            break
          
          default:
            console.warn(`⚠️ Unknown function call: ${functionCall.name}`)
        }
      } catch (error) {
        console.error(`❌ Error executing function ${functionCall.name}:`, error)
      }
    }

    return processedData
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
    ]
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
    ]
  }

  /**
   * Generate reasoning explanation
   */
  generateReasoningExplanation(intent, processedData) {
    const parts = []
    
    if (processedData.courts && processedData.courts.length > 0) {
      parts.push(`Found ${processedData.courts.length} matching courts`)
    }
    
    if (processedData.players && processedData.players.length > 0) {
      parts.push(`Found ${processedData.players.length} compatible players`)
    }
    
    if (parts.length === 0) {
      parts.push('No direct matches found')
    }
    
    return parts.join(', ')
  }

  /**
   * Determine needed information
   */
  determineNeededInfo(intent) {
    const needed = []
    
    if (intent.confidence < 0.7) {
      needed.push('more specific request')
    }
    
    return needed
  }

  /**
   * Generate suggested questions
   */
  generateSuggestedQuestions(processedData, language) {
    const suggestions = []
    
    if (processedData.courts && processedData.courts.length > 0) {
      suggestions.push(language === 'id' ? 
        'Mau lihat detail lapangan yang tersedia?' : 
        'Would you like to see court details?')
    }
    
    if (processedData.players && processedData.players.length > 0) {
      suggestions.push(language === 'id' ? 
        'Mau saya carikan partner main?' : 
        'Should I find you a playing partner?')
    }
    
    return suggestions
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const service = this.getService()
      const health = await service.healthCheck()
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        aiService: health
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      }
    }
  }
}

// Create singleton instance
const cloudAIService = new CloudAIServiceManager()

// Parse Cloud Functions
Parse.Cloud.define('getMatchmakingRecommendations', async (request) => {
  const { message, userProfile = {}, language = 'en' } = request.params
  
  try {
    console.log('Processing matchmaking request:', { message, language })
    
    const response = await cloudAIService.processMatchmakingRequest(message, userProfile, language)
    console.log('Generated response:', response)
    
    return response
  } catch (error) {
    console.error('Error in getMatchmakingRecommendations:', error)
    return {
      success: false,
      error: error.message
    }
  }
})

Parse.Cloud.define('healthCheck', async (request) => {
  try {
    return await cloudAIService.healthCheck()
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }
  }
})

module.exports = {
  CloudAIServiceManager,
  cloudAIService
}
