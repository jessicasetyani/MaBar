/**
 * Core types and interfaces for AI services
 */

// Base configuration for all AI services
export interface AIServiceConfig {
  provider: string
  apiKey: string
  model?: string
  temperature?: number
  maxTokens?: number
  timeout?: number
  baseUrl?: string
  additionalHeaders?: Record<string, string>
}

// User profile information
export interface UserProfile {
  userId?: string
  skillLevel?: 'beginner' | 'intermediate' | 'advanced'
  preferredTime?: string
  location?: string
  playingStyle?: 'casual' | 'competitive' | 'training'
  ageRange?: string
  language?: 'en' | 'id'
}

// Intent analysis result
export interface IntentAnalysis {
  type: 'matchmaking' | 'casual' | 'help' | 'greeting' | 'booking' | 'information'
  subtype?: string
  confidence: number
  extractedData: {
    timePreferences?: {
      preferred?: string
      flexible: string[]
      timeOfDay?: 'morning' | 'afternoon' | 'evening'
    }
    locationPreferences?: {
      primary?: string
      radius: number
      alternatives: string[]
    }
    skillRequirements?: {
      level?: 'beginner' | 'intermediate' | 'advanced'
      flexibility: 'strict' | 'moderate' | 'flexible'
    }
    sessionType: 'casual' | 'competitive' | 'training'
    groupSize: 'singles' | 'doubles'
    additionalRequirements?: string[]
  }
  functionCalls: FunctionCall[]
}

// Function call definition
export interface FunctionCall {
  name: string
  parameters: Record<string, any>
  description: string
  priority?: number
}

// AI service response
export interface AIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  metadata?: {
    provider: string
    model: string
    tokensUsed?: number
    processingTime?: number
    confidence?: number
  }
  timestamp: string
}

// Natural language generation request
export interface NLGRequest {
  data: any
  context: {
    originalMessage: string
    userProfile: UserProfile
    language: string
    conversationHistory?: ConversationMessage[]
  }
  options?: {
    tone?: 'friendly' | 'professional' | 'casual'
    length?: 'short' | 'medium' | 'long'
    includeEmojis?: boolean
  }
}

// Conversation message
export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  metadata?: Record<string, any>
}

// Health check result
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  provider: string
  details?: {
    latency?: number
    errorRate?: number
    lastError?: string
  }
}

// Logging levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

// Logger interface
export interface ILogger {
  debug(message: string, data?: any): void
  info(message: string, data?: any): void
  warn(message: string, data?: any): void
  error(message: string, error?: any): void
}

// Performance metrics
export interface PerformanceMetrics {
  operation: string
  duration: number
  timestamp: string
  success: boolean
  metadata?: Record<string, any>
}

// Base AI service interface
export interface IAIService {
  /**
   * Get service configuration
   */
  getConfig(): AIServiceConfig

  /**
   * Analyze user intent and extract structured data
   */
  analyzeIntent(
    message: string,
    userProfile?: UserProfile,
    language?: string
  ): Promise<IntentAnalysis>

  /**
   * Generate natural language response from structured data
   */
  generateResponse(request: NLGRequest): Promise<string>

  /**
   * Health check for the AI service
   */
  healthCheck(): Promise<HealthCheckResult>

  /**
   * Set logger instance
   */
  setLogger(logger: ILogger): void

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics[]

  /**
   * Clear performance metrics
   */
  clearMetrics(): void
}

// Service factory interface
export interface IAIServiceFactory {
  /**
   * Create AI service instance
   */
  createService(config: AIServiceConfig): IAIService

  /**
   * Get available providers
   */
  getAvailableProviders(): string[]

  /**
   * Validate service configuration
   */
  validateConfig(config: AIServiceConfig): boolean
}

// Configuration manager interface
export interface IConfigManager {
  /**
   * Get configuration for a provider
   */
  getConfig(provider: string): AIServiceConfig | null

  /**
   * Set configuration for a provider
   */
  setConfig(provider: string, config: AIServiceConfig): void

  /**
   * Get default configuration
   */
  getDefaultConfig(provider: string): Partial<AIServiceConfig>

  /**
   * Load configuration from environment
   */
  loadFromEnvironment(): Record<string, AIServiceConfig>
}

// Error types
export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'AIServiceError'
  }
}

export class ConfigurationError extends AIServiceError {
  constructor(message: string, provider?: string, details?: any) {
    super(message, 'CONFIGURATION_ERROR', provider, details)
    this.name = 'ConfigurationError'
  }
}

export class APIError extends AIServiceError {
  constructor(message: string, provider?: string, details?: any) {
    super(message, 'API_ERROR', provider, details)
    this.name = 'APIError'
  }
}

export class TimeoutError extends AIServiceError {
  constructor(message: string, provider?: string, details?: any) {
    super(message, 'TIMEOUT_ERROR', provider, details)
    this.name = 'TimeoutError'
  }
}

export class ValidationError extends AIServiceError {
  constructor(message: string, provider?: string, details?: any) {
    super(message, 'VALIDATION_ERROR', provider, details)
    this.name = 'ValidationError'
  }
}

// Re-export Gemini types
export type {
  GeminiConfig,
  GeminiSafetySetting,
  GeminiGenerationConfig,
  GeminiRequest,
  GeminiContent,
  GeminiPart,
  GeminiResponse,
  GeminiCandidate,
  GeminiSafetyRating,
  GeminiPromptFeedback,
  GeminiUsageMetadata,
  GeminiErrorResponse,
  GeminiModelName
} from './gemini'

export { DEFAULT_GEMINI_CONFIG, GEMINI_MODELS } from './gemini'
