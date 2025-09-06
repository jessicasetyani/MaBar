// Back4App Cloud Function for AI Services Integration
const { cloudAIService } = require('./aiService');

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

// Enhanced Cloud Function for Smart AI Matchmaking
Parse.Cloud.define("getMatchmakingRecommendations", async (request) => {

  
  try {
    const { message, userProfile, language = 'en', sessionId } = request.params;
    const userId = request.user ? request.user.id : 'anonymous';
    
    console.log('Processing message:', { message, userId, language });
    
    // Validate required parameters
    if (!message || typeof message !== 'string') {
      throw new Error('Missing required parameter: message');
    }
    
    // Check rate limiting
    if (!checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Process request using the new AI service
    const response = await cloudAIService.processMatchmakingRequest(
      message,
      userProfile || {},
      language
    );

    // Return the response from the AI service with additional metadata
    return {
      ...response,
      timestamp: new Date().toISOString(),
      language: language,
      sessionId: sessionId
    };
    
  } catch (error) {
    // Log sanitized error for debugging
    const sanitizedError = {
      status: error.response?.status,
      code: error.code,
      message: error.message,
      stack: error.stack
    };
    console.error('Smart Matchmaking Error:', sanitizedError);
    
    // Return enhanced error response
    return {
      success: false,
      error: 'ERR_SMART_MATCHMAKING',
      message: 'Unable to generate recommendations at this time',
      data: {
        naturalLanguage: language === 'id' ? 
          'Maaf, saya tidak bisa memberikan rekomendasi saat ini. Silakan coba lagi nanti.' :
          'Sorry, I cannot provide recommendations right now. Please try again later.',
        structuredData: { courts: [], players: [], alternatives: {} },
        reasoning: { why: 'Service temporarily unavailable', confidence: 0, factors: [] },
        actionable: { canBookNow: false, needsMoreInfo: [], suggestedQuestions: [] }
      },
      timestamp: new Date().toISOString()
    };
  }
});

// AI Service Health Check
Parse.Cloud.define("aiHealthCheck", async (request) => {
  try {
    const health = await cloudAIService.healthCheck();
    return health;
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
});




// Health check function
Parse.Cloud.define("healthCheck", async (request) => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };
});