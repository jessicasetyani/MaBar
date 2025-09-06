// Smart Matchmaking Engine for MaBar
const axios = require('axios');

// Smart Data Access Layer Functions
const intelligentFunctions = {
  getMatchmakingRecommendations: {
    description: "Get intelligent court and player recommendations with fallback options",
    parameters: {
      userPreferences: { type: "object" },
      context: { type: "object" }
    },
    execute: async (params) => {
      return await generateSmartRecommendations(params);
    }
  },
  
  getUserContext: {
    description: "Get user's playing history, preferences, and patterns",
    parameters: {
      userId: { type: "string", required: true }
    },
    execute: async (params) => {
      return await analyzeUserContext(params.userId);
    }
  },
  
  getAvailabilityMatrix: {
    description: "Get comprehensive availability data with alternatives",
    parameters: {
      timeRange: { type: "object" },
      location: { type: "string" }
    },
    execute: async (params) => {
      return await buildAvailabilityMatrix(params);
    }
  }
};

// Analyze user intent with flexible criteria extraction
async function analyzeUserIntent(userMessage, geminiApiKey) {
  // Handle very basic or unclear messages
  const cleanMessage = userMessage.toLowerCase().trim();
  if (cleanMessage.length < 5 || !containsMatchmakingIntent(cleanMessage)) {
    return getDefaultPreferences();
  }
  
  try {
    const prompt = `
      Analyze this padel matchmaking request and extract flexible criteria:
      "${userMessage}"
      
      Return JSON with intelligent interpretation:
      {
        "extractedPreferences": {
          "timePreferences": {
            "preferred": "exact time if specified or null",
            "flexible": ["alternative time slots"],
            "timeOfDay": "morning/afternoon/evening preference or null"
          },
          "locationPreferences": {
            "primary": "specific location if mentioned or null",
            "radius": "acceptable distance in km (default 10)",
            "alternatives": ["nearby areas"]
          },
          "skillRequirements": {
            "level": "beginner/intermediate/advanced or null",
            "flexibility": "strict/moderate/flexible"
          },
          "sessionType": "casual/competitive/training or casual",
          "groupSize": "singles/doubles preference or doubles"
        },
        "flexibility": {
          "timeFlexible": true/false,
          "locationFlexible": true/false,
          "skillFlexible": true/false
        },
        "priority": "time/location/skill/price or time"
      }
    `;
    
    const response = await callGeminiAPI(prompt, geminiApiKey);
    return JSON.parse(response);
  } catch (error) {
    console.error('Error analyzing user intent:', error);
    return getDefaultPreferences();
  }
}

// Check if message contains matchmaking intent
function containsMatchmakingIntent(message) {
  const keywords = [
    'padel', 'main', 'book', 'lapangan', 'court', 'partner', 'player',
    'besok', 'today', 'tomorrow', 'jam', 'time', 'cari', 'find'
  ];
  return keywords.some(keyword => message.includes(keyword));
}

// Get default preferences for unclear requests
function getDefaultPreferences() {
  return {
    extractedPreferences: {
      timePreferences: {
        preferred: null,
        flexible: ['morning', 'afternoon', 'evening'],
        timeOfDay: null
      },
      locationPreferences: {
        primary: null,
        radius: 15,
        alternatives: ['Jakarta', 'Tangerang', 'Bekasi']
      },
      skillRequirements: {
        level: null,
        flexibility: 'flexible'
      },
      sessionType: 'casual',
      groupSize: 'doubles'
    },
    flexibility: {
      timeFlexible: true,
      locationFlexible: true,
      skillFlexible: true
    },
    priority: 'time'
  };
}

// Get user context and playing patterns
async function analyzeUserContext(userId) {
  try {
    const PlayerProfile = Parse.Object.extend('PlayerProfile');
    const query = new Parse.Query(PlayerProfile);
    query.equalTo('user', Parse.User.createWithoutData(userId));
    
    const profile = await query.first();
    
    if (!profile) {
      return {
        skillLevel: 'beginner',
        playingStyle: 'casual',
        preferredTimes: ['evening'],
        preferredLocations: ['Jakarta'],
        gamesPlayed: 0,
        rating: 0
      };
    }
    
    const preferences = profile.get('preferences') || {};
    return {
      skillLevel: preferences.skillLevel || 'beginner',
      playingStyle: preferences.playingStyle || 'casual',
      preferredTimes: preferences.playingTimes || ['evening'],
      preferredLocations: preferences.preferredAreas || ['Jakarta'],
      gamesPlayed: profile.get('gamesPlayed') || 0,
      rating: profile.get('rating') || 0
    };
  } catch (error) {
    console.error('Error analyzing user context:', error);
    return {
      skillLevel: 'beginner',
      playingStyle: 'casual',
      preferredTimes: ['evening'],
      preferredLocations: ['Jakarta'],
      gamesPlayed: 0,
      rating: 0
    };
  }
}

// Smart court matching with intelligent fallbacks
async function findBestCourts({ preferences, userHistory, fallbackOptions }) {
  try {
    console.log('Finding courts with preferences:', preferences);
    
    const Venue = Parse.Object.extend('Venue');
    let query = new Parse.Query(Venue);
    query.equalTo('isActive', true);
    query.limit(20); // Limit for performance
    
    // Primary matching with exact criteria
    if (preferences.locationPreferences?.primary) {
      console.log('Filtering by location:', preferences.locationPreferences.primary);
      query.contains('address.city', preferences.locationPreferences.primary);
    }
    
    let courts = await query.find();
    console.log('Found courts from query:', courts.length);
    
    // If no exact matches, apply intelligent fallbacks
    if (courts.length === 0 && fallbackOptions) {
      console.log('Applying fallback strategies');
      courts = await applyIntelligentFallbacks(preferences, userHistory);
    }
    
    // Score and rank courts
    const scoredCourts = courts.map(court => {
      const scored = {
        id: court.id,
        name: court.get('name') || 'Unknown Venue',
        address: court.get('address') || { city: 'Jakarta' },
        facilities: court.get('facilities') || [],
        pricing: court.get('pricing') || { hourly: 100000 },
        rating: court.get('rating') || 4.0,
        matchScore: calculateCourtScore(court, preferences, userHistory),
        reasoning: generateCourtReasoning(court, preferences)
      };
      console.log('Scored court:', scored.name, 'Score:', scored.matchScore);
      return scored;
    });
    
    return scoredCourts.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error('Error finding courts:', error);
    // Return mock data for testing if database fails
    return generateMockCourts(preferences);
  }
}

// Generate mock courts for testing when database is empty
function generateMockCourts(preferences) {
  console.log('Generating mock courts for testing');
  return [
    {
      id: 'mock-1',
      name: 'Jakarta Padel Center',
      address: { city: 'Jakarta', area: 'Senayan' },
      facilities: ['Indoor Courts', 'Parking', 'Cafeteria'],
      pricing: { hourly: 150000 },
      rating: 4.5,
      matchScore: 85,
      reasoning: 'Popular venue with good facilities'
    },
    {
      id: 'mock-2', 
      name: 'Kemang Sports Club',
      address: { city: 'Jakarta', area: 'Kemang' },
      facilities: ['Outdoor Courts', 'Parking'],
      pricing: { hourly: 120000 },
      rating: 4.2,
      matchScore: 75,
      reasoning: 'Affordable option in South Jakarta'
    }
  ];
}

// Apply intelligent fallback strategies
async function applyIntelligentFallbacks(preferences, userHistory) {
  const fallbackStrategies = [
    () => expandLocationRadius(preferences.locationPreferences),
    () => relaxSkillRequirements(preferences.skillRequirements),
    () => suggestAlternativeDays(preferences, userHistory)
  ];
  
  for (const strategy of fallbackStrategies) {
    try {
      const results = await strategy();
      if (results.length > 0) return results;
    } catch (error) {
      console.error('Fallback strategy error:', error);
    }
  }
  
  return [];
}

// Expand location search radius
async function expandLocationRadius(locationPrefs) {
  const Venue = Parse.Object.extend('Venue');
  const query = new Parse.Query(Venue);
  query.equalTo('isActive', true);
  query.limit(10);
  
  return await query.find();
}

// Find compatible players
async function findCompatiblePlayers({ skillLevel, playingStyle, availability, location }) {
  try {
    console.log('Finding players with criteria:', { skillLevel, playingStyle });
    
    const PlayerProfile = Parse.Object.extend('PlayerProfile');
    const query = new Parse.Query(PlayerProfile);
    
    // Match skill level with flexibility
    if (skillLevel) {
      const skillLevels = getCompatibleSkillLevels(skillLevel);
      console.log('Compatible skill levels:', skillLevels);
      query.containedIn('preferences.skillLevel', skillLevels);
    }
    
    query.equalTo('status', 'active');
    query.include('user');
    query.limit(20);
    
    const players = await query.find();
    console.log('Found players from query:', players.length);
    
    if (players.length === 0) {
      console.log('No players found, generating mock players');
      return generateMockPlayers(skillLevel);
    }
    
    return players.map(player => {
      const prefs = player.get('preferences') || {};
      const scored = {
        id: player.id,
        name: player.get('personalInfo')?.name || 'Player',
        skillLevel: prefs.skillLevel || 'beginner',
        playingStyle: prefs.playingStyle || 'casual',
        preferredTimes: prefs.playingTimes || ['evening'],
        matchScore: calculatePlayerScore(player, { skillLevel, playingStyle }),
        reasoning: generatePlayerReasoning(player, { skillLevel, playingStyle })
      };
      console.log('Scored player:', scored.name, 'Score:', scored.matchScore);
      return scored;
    }).sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error('Error finding players:', error);
    return generateMockPlayers(skillLevel);
  }
}

// Generate mock players for testing when database is empty
function generateMockPlayers(skillLevel) {
  console.log('Generating mock players for testing');
  return [
    {
      id: 'mock-player-1',
      name: 'Alex Rahman',
      skillLevel: skillLevel || 'intermediate',
      playingStyle: 'competitive',
      preferredTimes: ['evening', 'weekend'],
      matchScore: 90,
      reasoning: 'Active player with similar skill level'
    },
    {
      id: 'mock-player-2',
      name: 'Sarah Wijaya', 
      skillLevel: skillLevel || 'beginner',
      playingStyle: 'casual',
      preferredTimes: ['afternoon', 'weekend'],
      matchScore: 75,
      reasoning: 'Friendly player looking for regular games'
    }
  ];
}

// Get compatible skill levels
function getCompatibleSkillLevels(skillLevel) {
  const skillMap = {
    'beginner': ['beginner', 'intermediate'],
    'intermediate': ['beginner', 'intermediate', 'advanced'],
    'advanced': ['intermediate', 'advanced']
  };
  return skillMap[skillLevel] || ['beginner'];
}

// Calculate court matching score
function calculateCourtScore(court, preferences, userHistory) {
  let score = 0;
  
  // Base score
  score += court.get('rating') * 20;
  
  // Location preference
  if (preferences.locationPreferences?.primary) {
    const address = court.get('address') || {};
    if (address.city?.toLowerCase().includes(preferences.locationPreferences.primary.toLowerCase())) {
      score += 30;
    }
  }
  
  // User history preference
  if (userHistory.preferredLocations) {
    const address = court.get('address') || {};
    const hasPlayedHere = userHistory.preferredLocations.some(loc => 
      address.city?.toLowerCase().includes(loc.toLowerCase())
    );
    if (hasPlayedHere) score += 20;
  }
  
  // Facilities match
  const facilities = court.get('facilities') || [];
  if (facilities.includes('Indoor Courts')) score += 10;
  if (facilities.includes('Parking')) score += 5;
  
  return Math.min(score, 100);
}

// Calculate player matching score
function calculatePlayerScore(player, criteria) {
  let score = 0;
  const prefs = player.get('preferences') || {};
  
  // Skill level compatibility
  if (criteria.skillLevel === prefs.skillLevel) {
    score += 40;
  } else if (getCompatibleSkillLevels(criteria.skillLevel).includes(prefs.skillLevel)) {
    score += 25;
  }
  
  // Playing style match
  if (criteria.playingStyle === prefs.playingStyle) {
    score += 30;
  }
  
  // Activity level
  const gamesPlayed = player.get('gamesPlayed') || 0;
  if (gamesPlayed > 10) score += 20;
  else if (gamesPlayed > 5) score += 10;
  
  return Math.min(score, 100);
}

// Generate court reasoning
function generateCourtReasoning(court, preferences) {
  const reasons = [];
  
  if (court.get('rating') > 4) {
    reasons.push('Highly rated venue');
  }
  
  const facilities = court.get('facilities') || [];
  if (facilities.includes('Indoor Courts')) {
    reasons.push('Indoor courts available');
  }
  
  return reasons.join(', ') || 'Good match for your preferences';
}

// Generate player reasoning
function generatePlayerReasoning(player, criteria) {
  const prefs = player.get('preferences') || {};
  const reasons = [];
  
  if (criteria.skillLevel === prefs.skillLevel) {
    reasons.push('Same skill level');
  }
  
  if (criteria.playingStyle === prefs.playingStyle) {
    reasons.push('Similar playing style');
  }
  
  const gamesPlayed = player.get('gamesPlayed') || 0;
  if (gamesPlayed > 10) {
    reasons.push('Experienced player');
  }
  
  return reasons.join(', ') || 'Compatible player';
}

// Main smart recommendation engine
async function generateSmartRecommendations(params) {
  const { userPreferences, context } = params;
  
  console.log('generateSmartRecommendations called with:', { userPreferences, context });
  
  try {
    // 1. Analyze user intent
    const intent = await analyzeUserIntent(userPreferences.message, process.env.GOOGLE_API_KEY);
    console.log('User intent analyzed:', intent);
    
    // 2. Get user context
    const userContext = await analyzeUserContext(context.userId);
    console.log('User context:', userContext);
    
    // 3. Find best courts
    const courtRecommendations = await findBestCourts({
      preferences: intent.extractedPreferences,
      userHistory: userContext,
      fallbackOptions: true
    });
    console.log('Court recommendations:', courtRecommendations.length);
    
    // 4. Find compatible players
    const playerRecommendations = await findCompatiblePlayers({
      skillLevel: userContext.skillLevel,
      playingStyle: userContext.playingStyle,
      availability: intent.extractedPreferences.timePreferences,
      location: intent.extractedPreferences.locationPreferences
    });
    console.log('Player recommendations:', playerRecommendations.length);
    
    // 5. Generate alternatives
    const alternatives = await generateAlternatives({
      originalIntent: intent,
      availableOptions: { courts: courtRecommendations, players: playerRecommendations }
    });
    
    const result = {
      primary: {
        courts: courtRecommendations.slice(0, 3),
        players: playerRecommendations.slice(0, 5)
      },
      alternatives: alternatives,
      reasoning: generateReasoningExplanation(intent, userContext),
      confidence: calculateConfidenceScore(courtRecommendations, playerRecommendations)
    };
    
    console.log('Final recommendations result:', {
      courtsCount: result.primary.courts.length,
      playersCount: result.primary.players.length,
      confidence: result.confidence
    });
    
    return result;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return {
      primary: { courts: [], players: [] },
      alternatives: {},
      reasoning: 'Unable to generate recommendations at this time',
      confidence: 0
    };
  }
}

// Generate alternative suggestions
async function generateAlternatives({ originalIntent, availableOptions }) {
  return {
    timeAlternatives: await generateTimeAlternatives(originalIntent),
    locationAlternatives: await generateLocationAlternatives(originalIntent),
    skillAlternatives: await generateSkillAlternatives(originalIntent)
  };
}

async function generateTimeAlternatives(intent) {
  return [
    { suggestion: "Earlier in the day", reason: "More courts available" },
    { suggestion: "Weekend morning", reason: "Better player availability" }
  ];
}

async function generateLocationAlternatives(intent) {
  return [
    { suggestion: "Nearby areas", reason: "More venue options" },
    { suggestion: "Central Jakarta", reason: "Better accessibility" }
  ];
}

async function generateSkillAlternatives(intent) {
  return [
    { suggestion: "Mixed skill groups", reason: "Learning opportunity" },
    { suggestion: "Beginner-friendly sessions", reason: "More relaxed environment" }
  ];
}

// Generate reasoning explanation
function generateReasoningExplanation(intent, userContext) {
  const factors = [];
  
  if (userContext.gamesPlayed > 10) {
    factors.push("Based on your playing experience");
  }
  
  if (intent.extractedPreferences.locationPreferences?.primary) {
    factors.push(`Focused on ${intent.extractedPreferences.locationPreferences.primary} area`);
  }
  
  if (userContext.skillLevel) {
    factors.push(`Matched with ${userContext.skillLevel} level players`);
  }
  
  return factors.join(', ') || 'Recommendations based on your preferences';
}

// Calculate confidence score
function calculateConfidenceScore(courts, players) {
  let score = 0;
  
  if (courts.length > 0) score += 0.4;
  if (players.length > 0) score += 0.4;
  
  const avgCourtScore = courts.reduce((sum, court) => sum + court.matchScore, 0) / courts.length || 0;
  const avgPlayerScore = players.reduce((sum, player) => sum + player.matchScore, 0) / players.length || 0;
  
  score += (avgCourtScore + avgPlayerScore) / 200 * 0.2;
  
  return Math.min(score, 1);
}

// Helper function to call Gemini API
async function callGeminiAPI(prompt, apiKey) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );
    
    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

module.exports = {
  intelligentFunctions,
  generateSmartRecommendations,
  analyzeUserIntent,
  analyzeUserContext,
  findBestCourts,
  findCompatiblePlayers
};