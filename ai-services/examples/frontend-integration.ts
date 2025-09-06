/**
 * Frontend Integration Example
 * Shows how to use @mabar/ai-services in a Vue.js frontend
 */

import { createGeminiService, AIServices, type UserProfile, type IntentAnalysis } from '@mabar/ai-services'

// Example Vue.js component integration
export class AIServiceIntegration {
  private aiService: any
  private userProfile: UserProfile

  constructor() {
    this.userProfile = {
      skillLevel: 'intermediate',
      location: 'Jakarta',
      language: 'en'
    }
    
    this.initializeAIService()
  }

  /**
   * Initialize AI service with environment configuration
   */
  private initializeAIService() {
    try {
      // Option 1: Use environment configuration
      const aiServices = AIServices.getInstance()
      if (aiServices.isProviderReady('gemini')) {
        this.aiService = aiServices.createService('gemini')
      } else {
        // Option 2: Create with explicit API key
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY
        if (apiKey) {
          this.aiService = createGeminiService(apiKey, {
            model: 'gemini-pro',
            temperature: 0.7
          })
        } else {
          throw new Error('No Gemini API key found in environment')
        }
      }
      
      console.log('✅ AI Service initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize AI service:', error)
      throw error
    }
  }

  /**
   * Process user message through AI pipeline
   */
  async processUserMessage(message: string): Promise<{
    intent: IntentAnalysis
    response: string
  }> {
    try {
      console.log('🤖 Processing user message:', message)

      // Step 1: Analyze user intent
      const intent = await this.aiService.analyzeIntent(
        message,
        this.userProfile,
        this.userProfile.language
      )

      console.log('📝 Intent analysis:', intent)

      // Step 2: Handle based on intent type
      let response: string

      if (intent.type === 'matchmaking') {
        response = await this.handleMatchmakingIntent(intent, message)
      } else if (intent.type === 'greeting') {
        response = await this.handleGreeting(message)
      } else if (intent.type === 'help') {
        response = await this.handleHelp(message)
      } else {
        response = await this.handleCasualMessage(message)
      }

      return { intent, response }
    } catch (error) {
      console.error('❌ Error processing message:', error)
      throw error
    }
  }

  /**
   * Handle matchmaking intent
   */
  private async handleMatchmakingIntent(intent: IntentAnalysis, originalMessage: string): Promise<string> {
    // In a real application, you would:
    // 1. Execute the function calls from intent.functionCalls
    // 2. Query your database for courts/players
    // 3. Process the results
    
    // For this example, we'll simulate some data
    const mockData = {
      courts: [
        { name: 'Jakarta Padel Center', rating: 4.5, available: true },
        { name: 'Elite Padel Club', rating: 4.7, available: true }
      ],
      players: [
        { name: 'Ahmad Rizki', skillLevel: 'intermediate', available: true },
        { name: 'Sari Dewi', skillLevel: 'intermediate', available: true }
      ]
    }

    // Generate natural language response
    const response = await this.aiService.generateResponse({
      data: mockData,
      context: {
        originalMessage,
        userProfile: this.userProfile,
        language: this.userProfile.language || 'en'
      },
      options: {
        tone: 'friendly',
        length: 'medium',
        includeEmojis: true
      }
    })

    return response
  }

  /**
   * Handle greeting
   */
  private async handleGreeting(originalMessage: string): Promise<string> {
    const response = await this.aiService.generateResponse({
      data: { type: 'greeting' },
      context: {
        originalMessage,
        userProfile: this.userProfile,
        language: this.userProfile.language || 'en'
      },
      options: {
        tone: 'friendly',
        length: 'short',
        includeEmojis: true
      }
    })

    return response
  }

  /**
   * Handle help request
   */
  private async handleHelp(originalMessage: string): Promise<string> {
    const helpData = {
      features: [
        'Find padel courts',
        'Match with players',
        'Book sessions',
        'Get recommendations'
      ]
    }

    const response = await this.aiService.generateResponse({
      data: helpData,
      context: {
        originalMessage,
        userProfile: this.userProfile,
        language: this.userProfile.language || 'en'
      },
      options: {
        tone: 'helpful',
        length: 'medium',
        includeEmojis: true
      }
    })

    return response
  }

  /**
   * Handle casual message
   */
  private async handleCasualMessage(originalMessage: string): Promise<string> {
    const response = await this.aiService.generateResponse({
      data: { type: 'casual' },
      context: {
        originalMessage,
        userProfile: this.userProfile,
        language: this.userProfile.language || 'en'
      },
      options: {
        tone: 'friendly',
        length: 'short',
        includeEmojis: false
      }
    })

    return response
  }

  /**
   * Get service health status
   */
  async getHealthStatus() {
    try {
      const health = await this.aiService.healthCheck()
      console.log('🏥 AI Service health:', health)
      return health
    } catch (error) {
      console.error('❌ Health check failed:', error)
      return { status: 'unhealthy', error: error.message }
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const metrics = this.aiService.getMetrics()
    console.log('📊 Performance metrics:', metrics)
    return metrics
  }

  /**
   * Update user profile
   */
  updateUserProfile(updates: Partial<UserProfile>) {
    this.userProfile = { ...this.userProfile, ...updates }
    console.log('👤 User profile updated:', this.userProfile)
  }
}

// Example usage in Vue.js component
export const useAIService = () => {
  const aiIntegration = new AIServiceIntegration()

  return {
    processMessage: (message: string) => aiIntegration.processUserMessage(message),
    getHealth: () => aiIntegration.getHealthStatus(),
    getMetrics: () => aiIntegration.getPerformanceMetrics(),
    updateProfile: (profile: Partial<UserProfile>) => aiIntegration.updateUserProfile(profile)
  }
}

// Example Vue.js composable
export function useAIChat() {
  const aiService = new AIServiceIntegration()
  
  const processMessage = async (message: string) => {
    try {
      const result = await aiService.processUserMessage(message)
      return {
        success: true,
        data: result
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  return {
    processMessage,
    getHealth: () => aiService.getHealthStatus(),
    updateProfile: (profile: Partial<UserProfile>) => aiService.updateUserProfile(profile)
  }
}
