// Back4App Cloud Function for Gemini API Integration
const axios = require('axios');

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

// Main Cloud Function for Gemini API matchmaking
Parse.Cloud.define("getMatchmakingRecommendations", async (request) => {
  try {
    const { query, userProfile, language = 'en' } = request.params;
    const userId = request.user ? request.user.id : 'anonymous';
    
    // Validate required parameters
    if (!query || !userProfile) {
      throw new Error('Missing required parameters: query and userProfile');
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
    
    // Prepare the prompt for Gemini
    const systemPrompt = language === 'id' ? 
      `Anda adalah asisten matchmaking padel yang cerdas. Berikan rekomendasi berdasarkan profil pengguna dan permintaan mereka.` :
      `You are a smart padel matchmaking assistant. Provide recommendations based on user profile and their query.`;
    
    const userPromptData = {
      query,
      userProfile: {
        skill_level: userProfile.skillLevel || 'beginner',
        preferred_time: userProfile.preferredTime || 'any',
        location: userProfile.location || 'any',
        playing_style: userProfile.playingStyle || 'casual',
        age_range: userProfile.ageRange || 'any'
      }
    };
    
    const fullPrompt = `${systemPrompt}\n\nUser Query: ${query}\nUser Profile: ${JSON.stringify(userPromptData.userProfile)}\n\nProvide matchmaking recommendations in JSON format with fields: recommendations (array), reasoning (string), confidence_score (0-1).`;
    
    // Call Gemini API
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    // Parse Gemini response
    const geminiText = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!geminiText) {
      throw new Error('Invalid response from Gemini API');
    }
    
    // Try to parse JSON response
    let recommendations;
    try {
      recommendations = JSON.parse(geminiText);
    } catch (parseError) {
      // If JSON parsing fails, create a structured response
      recommendations = {
        recommendations: [{
          type: 'general',
          message: geminiText,
          confidence: 0.7
        }],
        reasoning: 'AI-generated recommendation',
        confidence_score: 0.7
      };
    }
    
    // Return structured response
    return {
      success: true,
      data: recommendations,
      timestamp: new Date().toISOString(),
      language: language
    };
    
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Return error response
    return {
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
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