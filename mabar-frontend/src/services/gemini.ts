import Parse from 'parse'

export interface UserProfile {
  skillLevel?: string
  preferredTime?: string
  location?: string
  playingStyle?: string
  ageRange?: string
}

export interface MatchmakingRecommendation {
  type: string
  message: string
  confidence: number
}

export interface GeminiResponse {
  success: boolean
  data?: {
    recommendations: MatchmakingRecommendation[]
    reasoning: string
    confidence_score: number
  }
  error?: string
  timestamp: string
  language?: string
}

export class GeminiService {
  static async getMatchmakingRecommendations(
    query: string,
    userProfile: UserProfile,
    language: 'en' | 'id' = 'en'
  ): Promise<GeminiResponse> {
    try {
      const result = await Parse.Cloud.run('getMatchmakingRecommendations', {
        query,
        userProfile,
        language,
      })

      return result as GeminiResponse
    } catch (error) {
      console.error('Gemini Service Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }
    }
  }

  static async healthCheck(): Promise<{
    status: string
    timestamp: string
    version: string
  }> {
    try {
      const result = await Parse.Cloud.run('healthCheck')
      return result
    } catch (error) {
      console.error('Health Check Error:', error)
      throw error
    }
  }
}
