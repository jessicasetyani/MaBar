/**
 * AI Service Factory
 * Creates and manages AI service instances
 */

import {
  IAIService,
  IAIServiceFactory,
  AIServiceConfig,
  ConfigurationError
} from '../types'
import { GeminiConfig } from '../types/gemini'
import { GeminiService } from '../services/GeminiService'

export class AIServiceFactory implements IAIServiceFactory {
  private static instance: AIServiceFactory
  private serviceCache: Map<string, IAIService> = new Map()

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): AIServiceFactory {
    if (!AIServiceFactory.instance) {
      AIServiceFactory.instance = new AIServiceFactory()
    }
    return AIServiceFactory.instance
  }

  /**
   * Create AI service instance
   */
  createService(config: AIServiceConfig): IAIService {
    if (!this.validateConfig(config)) {
      throw new ConfigurationError('Invalid AI service configuration', config.provider)
    }

    const cacheKey = this.generateCacheKey(config)
    
    // Return cached instance if available
    if (this.serviceCache.has(cacheKey)) {
      return this.serviceCache.get(cacheKey)!
    }

    let service: IAIService

    switch (config.provider.toLowerCase()) {
      case 'gemini':
        service = new GeminiService(config as GeminiConfig)
        break
      
      // Future providers can be added here
      case 'openai':
        throw new ConfigurationError('OpenAI service not yet implemented', 'openai')
      
      case 'claude':
      case 'anthropic':
        throw new ConfigurationError('Claude service not yet implemented', 'claude')
      
      default:
        throw new ConfigurationError(`Unsupported AI provider: ${config.provider}`, config.provider)
    }

    // Cache the service instance
    this.serviceCache.set(cacheKey, service)
    return service
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): string[] {
    return [
      'gemini'
      // Future providers will be added here
      // 'openai',
      // 'claude',
      // 'anthropic'
    ]
  }

  /**
   * Validate service configuration
   */
  validateConfig(config: AIServiceConfig): boolean {
    if (!config) {
      return false
    }

    if (!config.provider || typeof config.provider !== 'string') {
      return false
    }

    if (!config.apiKey || typeof config.apiKey !== 'string') {
      return false
    }

    // Provider-specific validation
    switch (config.provider.toLowerCase()) {
      case 'gemini':
        return this.validateGeminiConfig(config as GeminiConfig)
      
      default:
        return this.getAvailableProviders().includes(config.provider.toLowerCase())
    }
  }

  /**
   * Validate Gemini-specific configuration
   */
  private validateGeminiConfig(config: GeminiConfig): boolean {
    // Basic validation - more detailed validation is done in GeminiService
    if (config.model && typeof config.model !== 'string') {
      return false
    }

    if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 1)) {
      return false
    }

    if (config.maxTokens !== undefined && config.maxTokens <= 0) {
      return false
    }

    return true
  }

  /**
   * Generate cache key for service instance
   */
  private generateCacheKey(config: AIServiceConfig): string {
    const keyParts = [
      config.provider,
      config.model || 'default',
      config.temperature || 0.7,
      config.maxTokens || 2048
    ]
    
    return keyParts.join('-')
  }

  /**
   * Clear service cache
   */
  clearCache(): void {
    this.serviceCache.clear()
  }

  /**
   * Remove specific service from cache
   */
  removeCachedService(config: AIServiceConfig): boolean {
    const cacheKey = this.generateCacheKey(config)
    return this.serviceCache.delete(cacheKey)
  }

  /**
   * Get cached service if available
   */
  getCachedService(config: AIServiceConfig): IAIService | null {
    const cacheKey = this.generateCacheKey(config)
    return this.serviceCache.get(cacheKey) || null
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number
    keys: string[]
  } {
    return {
      size: this.serviceCache.size,
      keys: Array.from(this.serviceCache.keys())
    }
  }
}

/**
 * Convenience function to create AI service
 */
export function createAIService(config: AIServiceConfig): IAIService {
  const factory = AIServiceFactory.getInstance()
  return factory.createService(config)
}

/**
 * Convenience function to create Gemini service
 */
export function createGeminiService(config: Omit<GeminiConfig, 'provider'>): IAIService {
  return createAIService({
    provider: 'gemini',
    ...config
  } as GeminiConfig)
}
