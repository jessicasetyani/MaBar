/**
 * Base AI Service Abstract Class
 * Provides common functionality for all AI service implementations
 */

import {
  IAIService,
  AIServiceConfig,
  UserProfile,
  IntentAnalysis,
  NLGRequest,
  HealthCheckResult,
  ILogger,
  PerformanceMetrics,
  AIServiceError
} from '../types'
import { ConsoleLogger } from '../utils/logger'
import { PerformanceMonitor } from '../utils/performance'

export abstract class BaseAIService implements IAIService {
  protected config: AIServiceConfig
  protected logger: ILogger
  protected performanceMonitor: PerformanceMonitor

  constructor(config: AIServiceConfig) {
    this.config = config
    this.logger = new ConsoleLogger()
    this.performanceMonitor = new PerformanceMonitor()
    
    this.validateConfig(config)
  }

  /**
   * Get service configuration
   */
  getConfig(): AIServiceConfig {
    return { ...this.config }
  }

  /**
   * Set logger instance
   */
  setLogger(logger: ILogger): void {
    this.logger = logger
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return this.performanceMonitor.getMetrics()
  }

  /**
   * Clear performance metrics
   */
  clearMetrics(): void {
    this.performanceMonitor.clearMetrics()
  }

  /**
   * Abstract methods that must be implemented by concrete services
   */
  abstract analyzeIntent(
    message: string,
    userProfile?: UserProfile,
    language?: string
  ): Promise<IntentAnalysis>

  abstract generateResponse(request: NLGRequest): Promise<string>

  abstract healthCheck(): Promise<HealthCheckResult>

  /**
   * Validate service configuration
   */
  protected validateConfig(config: AIServiceConfig): void {
    if (!config.provider) {
      throw new AIServiceError('Provider is required', 'CONFIGURATION_ERROR')
    }

    if (!config.apiKey) {
      throw new AIServiceError('API key is required', 'CONFIGURATION_ERROR')
    }

    if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 1)) {
      throw new AIServiceError('Temperature must be between 0 and 1', 'CONFIGURATION_ERROR')
    }

    if (config.maxTokens !== undefined && config.maxTokens <= 0) {
      throw new AIServiceError('Max tokens must be positive', 'CONFIGURATION_ERROR')
    }

    if (config.timeout !== undefined && config.timeout <= 0) {
      throw new AIServiceError('Timeout must be positive', 'CONFIGURATION_ERROR')
    }
  }

  /**
   * Execute operation with performance monitoring
   */
  protected async executeWithMonitoring<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now()
    let success = false
    let error: Error | undefined

    try {
      this.logger.debug(`Starting ${operation}`, { provider: this.config.provider })
      
      const result = await fn()
      success = true
      
      this.logger.debug(`Completed ${operation}`, { 
        provider: this.config.provider,
        duration: Date.now() - startTime
      })
      
      return result
    } catch (err) {
      error = err as Error
      this.logger.error(`Failed ${operation}`, err)
      throw err
    } finally {
      // Record performance metrics
      this.performanceMonitor.recordMetric({
        operation,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        success,
        metadata: {
          provider: this.config.provider,
          error: error?.message
        }
      })
    }
  }

  /**
   * Build system prompt for intent analysis
   */
  protected buildIntentAnalysisPrompt(
    message: string,
    userProfile?: UserProfile,
    language: string = 'en'
  ): string {
    const systemPrompt = `
You are MaBar AI, a padel matchmaking assistant. Analyze user messages and extract structured information.

Your task is to analyze the user's message and return a JSON response with this exact structure:

{
  "type": "matchmaking|casual|help|greeting|booking|information",
  "subtype": "specific subtype if applicable",
  "confidence": 0.0-1.0,
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
    "groupSize": "singles|doubles",
    "additionalRequirements": ["any other specific requirements"]
  },
  "functionCalls": [
    {
      "name": "function_name",
      "parameters": {},
      "description": "what this function does",
      "priority": 1
    }
  ]
}

Available function calls:
- "findCourts": Find available padel courts
- "findPlayers": Find compatible players
- "getUserContext": Get user's playing history and preferences
- "getAvailability": Check court and player availability
- "bookCourt": Book a specific court
- "sendNotification": Send notifications to users

User Profile: ${JSON.stringify(userProfile || {})}
Language: ${language}
User Message: "${message}"

Return only valid JSON, no additional text.
    `.trim()

    return systemPrompt
  }

  /**
   * Build system prompt for response generation
   */
  protected buildResponseGenerationPrompt(request: NLGRequest): string {
    const { data, context, options = {} } = request
    const { originalMessage, userProfile, language, conversationHistory = [] } = context
    const { tone = 'friendly', length = 'medium', includeEmojis = true } = options

    const systemPrompt = `
You are MaBar AI, a ${tone} padel matchmaking assistant. Generate a natural, helpful response based on the provided data.

Context:
- Original Message: "${originalMessage}"
- User Profile: ${JSON.stringify(userProfile)}
- Language: ${language === 'id' ? 'Indonesian' : 'English'}
- Response Length: ${length}
- Include Emojis: ${includeEmojis}
- Tone: ${tone}

Available Data:
${JSON.stringify(data, null, 2)}

Conversation History:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Guidelines:
1. Acknowledge the user's request naturally
2. Present findings in a conversational way
3. Provide actionable next steps when appropriate
4. Maintain a ${tone} and helpful tone
5. Use ${language === 'id' ? 'Indonesian' : 'English'} language
6. ${includeEmojis ? 'Use emojis sparingly and appropriately' : 'Do not use emojis'}
7. Keep response ${length === 'short' ? 'concise (1-2 sentences)' : length === 'long' ? 'detailed and comprehensive' : 'informative but not too long'}

Generate a natural language response that helps the user with their padel-related needs.
    `.trim()

    return systemPrompt
  }

  /**
   * Parse intent analysis response
   */
  protected parseIntentAnalysisResponse(response: string, originalMessage: string): IntentAnalysis {
    try {
      const parsed = JSON.parse(response)
      
      // Validate required fields
      if (!parsed.type || !parsed.extractedData) {
        throw new Error('Invalid response structure')
      }

      return {
        type: parsed.type || 'casual',
        subtype: parsed.subtype,
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
        extractedData: {
          timePreferences: parsed.extractedData.timePreferences || { flexible: [] },
          locationPreferences: parsed.extractedData.locationPreferences || { 
            radius: 10, 
            alternatives: [] 
          },
          skillRequirements: parsed.extractedData.skillRequirements || { 
            flexibility: 'moderate' 
          },
          sessionType: parsed.extractedData.sessionType || 'casual',
          groupSize: parsed.extractedData.groupSize || 'doubles',
          additionalRequirements: parsed.extractedData.additionalRequirements || []
        },
        functionCalls: (parsed.functionCalls || []).map((fc: any) => ({
          name: fc.name,
          parameters: fc.parameters || {},
          description: fc.description || '',
          priority: fc.priority || 1
        }))
      }
    } catch (error) {
      this.logger.warn('Failed to parse intent analysis response, using fallback', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        response: response.substring(0, 200) 
      })
      
      return this.getFallbackIntentAnalysis(originalMessage)
    }
  }

  /**
   * Get fallback intent analysis when parsing fails
   */
  protected getFallbackIntentAnalysis(message: string): IntentAnalysis {
    const cleanMessage = message.toLowerCase().trim()
    
    let type: IntentAnalysis['type'] = 'casual'
    let subtype: string | undefined
    let confidence = 0.3
    const functionCalls: IntentAnalysis['functionCalls'] = []

    // Simple pattern matching for fallback
    if (cleanMessage.includes('court') || cleanMessage.includes('lapangan')) {
      type = 'matchmaking'
      subtype = 'court_search'
      confidence = 0.7
      functionCalls.push({
        name: 'findCourts',
        parameters: { location: 'Jakarta' },
        description: 'Find available courts',
        priority: 1
      })
    } else if (cleanMessage.includes('partner') || cleanMessage.includes('player') || cleanMessage.includes('main')) {
      type = 'matchmaking'
      subtype = 'player_search'
      confidence = 0.7
      functionCalls.push({
        name: 'findPlayers',
        parameters: { skillLevel: 'intermediate' },
        description: 'Find compatible players',
        priority: 1
      })
    } else if (cleanMessage.includes('book') || cleanMessage.includes('reserve')) {
      type = 'booking'
      confidence = 0.8
      functionCalls.push({
        name: 'findCourts',
        parameters: {},
        description: 'Find courts for booking',
        priority: 1
      })
    } else if (cleanMessage.includes('hello') || cleanMessage.includes('hi') || cleanMessage.includes('halo')) {
      type = 'greeting'
      confidence = 0.9
    } else if (cleanMessage.includes('help') || cleanMessage.includes('bantuan')) {
      type = 'help'
      confidence = 0.8
    }

    return {
      type,
      subtype,
      confidence,
      extractedData: {
        timePreferences: { flexible: [] },
        locationPreferences: { radius: 10, alternatives: [] },
        skillRequirements: { flexibility: 'moderate' },
        sessionType: 'casual',
        groupSize: 'doubles',
        additionalRequirements: []
      },
      functionCalls
    }
  }

  /**
   * Clean and validate response text
   */
  protected cleanResponse(response: string): string {
    return response
      .replace(/```json|```/g, '')
      .trim()
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
  }
}
