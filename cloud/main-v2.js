// Back4App Cloud Function with New AI Architecture
const axios = require('axios');
const { CloudAIServiceFactory, CloudDataAccessLayer } = require('./aiService');

// Rate limiting storage (in-memory for simplicity)
const rateLimitStore = new Map();

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60000, // 1 minute
};

// Helper function to check rate limit
function checkRateLimit(userId) {
  const now = Date.now();
  const userRequests = rateLimitStore.get(userId) || [];
  
  // Remove old requests outside the window
  const validRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT.windowMs);
  
  if (validRequests.length >= RATE_LIMIT.maxRequests) {
    return false;
  }
  
  validRequests.push(now);
  rateLimitStore.set(userId, validRequests);
  return true;
}

/**
 * AI Processing Pipeline for Cloud Functions
 */
class CloudAIProcessor {
  constructor() {
    this.aiService = CloudAIServiceFactory.createAIService('gemini');
    this.dataLayer = new CloudDataAccessLayer();
  }

  async processQuery(message, userProfile = {}, language = 'en', sessionId = null) {
    const startTime = Date.now();
    
    try {
      console.log('🤖 Starting AI processing pipeline:', { message, language, sessionId });

      // Step 1: Analyze user intent using AI
      console.log('📝 Step 1: Analyzing user intent...');
      const intentAnalysis = await this.aiService.analyzeIntent(message, userProfile, language);
      console.log('✅ Intent analysis complete:', intentAnalysis.intent);

      // Step 2: Handle casual messages early
      if (intentAnalysis.intent.type !== 'matchmaking') {
        console.log('💬 Handling casual message');
        return this.handleCasualMessage(intentAnalysis, message, language, sessionId);
      }

      // Step 3: Execute function calls to gather data
      console.log('🔍 Step 3: Executing function calls...');
      const processedData = await this.executeFunctionCalls(
        intentAnalysis.functionCalls,
        intentAnalysis.extractedData,
        userProfile
      );
      console.log('✅ Data gathering complete:', {
        courts: processedData.courts.length,
        players: processedData.players.length
      });

      // Step 4: Generate natural language response using AI
      console.log('💭 Step 4: Generating AI response...');
      const naturalLanguageResponse = await this.aiService.generateResponse(
        processedData,
        message,
        userProfile,
        language
      );
      console.log('✅ Response generation complete');

      // Step 5: Build final response
      const response = {
        naturalLanguage: naturalLanguageResponse,
        structuredData: processedData,
        reasoning: {
          why: this.generateReasoningExplanation(intentAnalysis, processedData),
          confidence: intentAnalysis.intent.confidence,
          factors: this.extractReasoningFactors(intentAnalysis, processedData)
        },
        actionable: {
          canBookNow: processedData.courts.length > 0,
          needsMoreInfo: this.determineNeededInfo(intentAnalysis, processedData),
          suggestedQuestions: this.generateSuggestedQuestions(processedData, language)
        }
      };

      const processingTime = Date.now() - startTime;
      console.log(`🎉 AI processing pipeline complete in ${processingTime}ms`);

      return response;
    } catch (error) {
      console.error('❌ AI processing pipeline error:', error);
      return this.handleProcessingError(error, message, language);
    }
  }

  async executeFunctionCalls(functionCalls, extractedData, userProfile) {
    const processedData = {
      courts: [],
      players: [],
      alternatives: {
        timeAlternatives: [],
        locationAlternatives: [],
        skillAlternatives: []
      }
    };

    // Execute each function call
    for (const functionCall of functionCalls) {
      try {
        console.log(`🔧 Executing function: ${functionCall.name}`);
        
        switch (functionCall.name) {
          case 'findCourts':
            processedData.courts = await this.executeFindCourts(functionCall.parameters, extractedData);
            break;
          
          case 'findPlayers':
            processedData.players = await this.executeFindPlayers(functionCall.parameters, extractedData);
            break;
          
          default:
            console.warn(`⚠️ Unknown function call: ${functionCall.name}`);
        }
      } catch (error) {
        console.error(`❌ Error executing function ${functionCall.name}:`, error);
      }
    }

    // Generate alternatives if no direct matches found
    if (processedData.courts.length === 0 && processedData.players.length === 0) {
      processedData.alternatives = this.generateAlternatives(extractedData);
    }

    return processedData;
  }

  async executeFindCourts(parameters, extractedData) {
    const criteria = {
      location: extractedData.locationPreferences?.primary || parameters.location || 'Jakarta',
      timeSlot: extractedData.timePreferences?.preferred || parameters.timeSlot,
      date: parameters.date,
      facilities: parameters.facilities || [],
      priceRange: parameters.priceRange
    };

    return await this.dataLayer.findCourts(criteria);
  }

  async executeFindPlayers(parameters, extractedData) {
    const criteria = {
      skillLevel: extractedData.skillRequirements?.level || parameters.skillLevel || 'intermediate',
      location: extractedData.locationPreferences?.primary || parameters.location || 'Jakarta',
      preferredTimes: extractedData.timePreferences?.flexible || parameters.preferredTimes,
      playingStyle: extractedData.sessionType || parameters.playingStyle || 'casual'
    };

    return await this.dataLayer.findPlayers(criteria);
  }

  generateAlternatives(extractedData) {
    return {
      timeAlternatives: [
        { suggestion: 'Try different time slots', reason: 'More availability at off-peak hours' }
      ],
      locationAlternatives: [
        { suggestion: 'Expand search radius', reason: 'More options in nearby areas' }
      ],
      skillAlternatives: [
        { suggestion: 'Consider mixed skill levels', reason: 'More players available' }
      ]
    };
  }

  handleCasualMessage(intentAnalysis, message, language, sessionId) {
    const responses = {
      id: {
        greeting: 'Halo! Saya MaBar AI, asisten untuk mencari lapangan padel dan partner main. Ada yang bisa saya bantu hari ini?',
        help: 'Saya MaBar AI! Saya bisa membantu Anda:\n• Mencari lapangan padel yang tersedia\n• Menemukan partner main yang cocok\n• Memberikan rekomendasi berdasarkan skill level dan lokasi',
        general: 'Halo! Saya MaBar AI untuk padel matchmaking. Saya bisa bantu cari lapangan dan partner main. Ada yang bisa dibantu?'
      },
      en: {
        greeting: 'Hello! I\'m MaBar AI, your padel matchmaking assistant. How can I help you find courts or playing partners today?',
        help: 'I\'m MaBar AI! I can help you:\n• Find available padel courts\n• Match you with compatible players\n• Provide recommendations based on skill level and location',
        general: 'Hello! I\'m MaBar AI for padel matchmaking. I can help you find courts and playing partners. What can I do for you?'
      }
    };

    const langResponses = responses[language] || responses.en;
    const responseText = langResponses[intentAnalysis.intent.subtype] || langResponses.general;

    return {
      naturalLanguage: responseText,
      structuredData: {
        courts: [],
        players: [],
        alternatives: {
          timeAlternatives: [],
          locationAlternatives: [],
          skillAlternatives: []
        }
      },
      reasoning: {
        why: 'Casual conversation or help request',
        confidence: intentAnalysis.intent.confidence,
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
    };
  }

  generateReasoningExplanation(intentAnalysis, processedData) {
    const parts = [];
    
    if (processedData.courts.length > 0) {
      parts.push(`Found ${processedData.courts.length} matching courts`);
    }
    
    if (processedData.players.length > 0) {
      parts.push(`Found ${processedData.players.length} compatible players`);
    }
    
    if (parts.length === 0) {
      parts.push('No direct matches found, providing alternatives');
    }
    
    return parts.join(', ');
  }

  extractReasoningFactors(intentAnalysis, processedData) {
    const factors = ['AI-powered intent analysis', 'Database query optimization'];
    
    if (processedData.courts.length > 0) {
      factors.push('Court availability matching');
    }
    
    if (processedData.players.length > 0) {
      factors.push('Player compatibility analysis');
    }
    
    return factors;
  }

  determineNeededInfo(intentAnalysis, processedData) {
    const needed = [];
    
    if (intentAnalysis.intent.confidence < 0.7) {
      needed.push('more specific request');
    }
    
    if (!intentAnalysis.extractedData.timePreferences?.preferred) {
      needed.push('preferred time');
    }
    
    if (!intentAnalysis.extractedData.locationPreferences?.primary) {
      needed.push('location preference');
    }
    
    return needed;
  }

  generateSuggestedQuestions(processedData, language) {
    const suggestions = [];
    
    if (processedData.courts.length > 0) {
      suggestions.push(language === 'id' ? 
        'Mau lihat detail lapangan yang tersedia?' : 
        'Would you like to see court details?');
    }
    
    if (processedData.players.length > 0) {
      suggestions.push(language === 'id' ? 
        'Mau saya carikan partner main?' : 
        'Should I find you a playing partner?');
    }
    
    if (suggestions.length === 0) {
      suggestions.push(language === 'id' ? 
        'Coba dengan kriteria yang lebih spesifik?' : 
        'Try with more specific criteria?');
    }
    
    return suggestions;
  }

  handleProcessingError(error, message, language) {
    console.error('Processing error details:', error);
    
    return {
      naturalLanguage: language === 'id' ? 
        'Maaf, terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi.' :
        'Sorry, there was an error processing your request. Please try again.',
      structuredData: {
        courts: [],
        players: [],
        alternatives: {
          timeAlternatives: [],
          locationAlternatives: [],
          skillAlternatives: []
        }
      },
      reasoning: {
        why: 'Processing error occurred',
        confidence: 0,
        factors: ['Error handling']
      },
      actionable: {
        canBookNow: false,
        needsMoreInfo: [],
        suggestedQuestions: []
      }
    };
  }
}

// Create processor instance
const aiProcessor = new CloudAIProcessor();

// Enhanced Cloud Function with New AI Architecture
Parse.Cloud.define("getMatchmakingRecommendations", async (request) => {
  const startTime = Date.now();
  const TIMEOUT_MS = 25000; // 25 second timeout
  
  try {
    const { message, userProfile = {}, language = 'en', sessionId } = request.params;
    const userId = request.user ? request.user.id : 'anonymous';
    
    console.log('Processing message with new AI architecture:', { message, userId, language });
    
    // Validate required parameters
    if (!message || typeof message !== 'string') {
      throw new Error('Missing required parameter: message');
    }
    
    // Check timeout
    if (Date.now() - startTime > TIMEOUT_MS) {
      throw new Error('Request timeout');
    }
    
    // Check rate limiting
    if (!checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    // Get Google API key from environment
    const geminiApiKey = process.env.GOOGLE_API_KEY;
    if (!geminiApiKey) {
      throw new Error('Google API key not configured');
    }
    
    // Process query through the new AI pipeline with timeout
    const processingPromise = aiProcessor.processQuery(message, userProfile, language, sessionId);
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('AI processing timeout')), TIMEOUT_MS - (Date.now() - startTime));
    });
    
    const response = await Promise.race([processingPromise, timeoutPromise]);
    
    // Return enhanced structured response
    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Error in getMatchmakingRecommendations:', error);
    return {
      success: false,
      error: error.message,
      data: {
        naturalLanguage: 'Sorry, there was an error processing your request. Please try again.',
        structuredData: {
          courts: [],
          players: [],
          alternatives: {
            timeAlternatives: [],
            locationAlternatives: [],
            skillAlternatives: []
          }
        },
        reasoning: {
          why: 'Error occurred during processing',
          confidence: 0,
          factors: ['Error handling']
        },
        actionable: {
          canBookNow: false,
          needsMoreInfo: [],
          suggestedQuestions: []
        }
      }
    };
  }
});

// Health check endpoint
Parse.Cloud.define("healthCheck", async (request) => {
  try {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "2.0.0",
      architecture: "modular-ai-service"
    };
  } catch (error) {
    return {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
});
