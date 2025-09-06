/**
 * MaBar AI Services Package
 * Main entry point for the AI services library
 */

// Export all types
export * from './types'

// Export services
export { BaseAIService } from './services/BaseAIService'
export { GeminiService } from './services/GeminiService'

// Export factory
export { AIServiceFactory, createAIService } from './factory/AIServiceFactory'
export { createGeminiService as factoryCreateGeminiService } from './factory/AIServiceFactory'

// Export configuration
export { ConfigManager, getConfigManager, createConfigFromEnv, createGeminiConfigFromEnv } from './config/ConfigManager'

// Export utilities
export { ConsoleLogger, SilentLogger, StructuredLogger, createLogger, getLogLevelFromEnv } from './utils/logger'
export { PerformanceMonitor, Timer, withMonitoring } from './utils/performance'

// Convenience functions and main API
import { AIServiceFactory } from './factory/AIServiceFactory'
import { ConfigManager } from './config/ConfigManager'
import { createLogger, getLogLevelFromEnv } from './utils/logger'
import { AIServiceConfig, IAIService, GeminiConfig } from './types'

/**
 * Main AI Services class - provides a high-level API
 */
export class AIServices {
  private static instance: AIServices
  private factory: AIServiceFactory
  private configManager: ConfigManager

  private constructor() {
    this.factory = AIServiceFactory.getInstance()
    this.configManager = ConfigManager.getInstance()
    
    // Load configurations from environment on initialization
    this.configManager.loadFromEnvironment()
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AIServices {
    if (!AIServices.instance) {
      AIServices.instance = new AIServices()
    }
    return AIServices.instance
  }

  /**
   * Create AI service with automatic configuration
   */
  createService(provider: string, apiKey?: string, overrides?: Partial<AIServiceConfig>): IAIService {
    let config = this.configManager.getConfig(provider)
    
    if (!config && apiKey) {
      // Create new configuration
      config = this.configManager.createConfig(provider, apiKey, overrides)
    } else if (config && overrides) {
      // Merge with existing configuration
      config = { ...config, ...overrides }
    }
    
    if (!config) {
      throw new Error(`No configuration found for provider: ${provider}. Please provide an API key or set environment variables.`)
    }
    
    return this.factory.createService(config)
  }

  /**
   * Create Gemini service with simplified API
   */
  createGeminiService(apiKey?: string, options?: Partial<Omit<GeminiConfig, 'provider' | 'apiKey'>>): IAIService {
    const config: GeminiConfig = {
      provider: 'gemini',
      apiKey: apiKey || this.getApiKeyFromEnv('gemini') || '',
      model: 'gemini-pro',
      temperature: 0.7,
      maxTokens: 2048,
      timeout: 30000,
      ...options
    }
    
    if (!config.apiKey) {
      throw new Error('Gemini API key is required. Provide it as parameter or set GEMINI_API_KEY/GOOGLE_API_KEY environment variable.')
    }
    
    return this.factory.createService(config)
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): string[] {
    return this.factory.getAvailableProviders()
  }

  /**
   * Get configured providers
   */
  getConfiguredProviders(): string[] {
    return this.configManager.getConfiguredProviders()
  }

  /**
   * Check if provider is available and configured
   */
  isProviderReady(provider: string): boolean {
    return this.factory.getAvailableProviders().includes(provider) &&
           this.configManager.isProviderConfigured(provider)
  }

  /**
   * Get service health status for all configured providers
   */
  async getHealthStatus(): Promise<Record<string, any>> {
    const status: Record<string, any> = {}
    const configuredProviders = this.configManager.getConfiguredProviders()
    
    for (const provider of configuredProviders) {
      try {
        const service = this.createService(provider)
        status[provider] = await service.healthCheck()
      } catch (error) {
        status[provider] = {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }
    }
    
    return status
  }

  /**
   * Clear all caches and reset
   */
  reset(): void {
    this.factory.clearCache()
    this.configManager.clearConfigs()
  }

  /**
   * Get API key from environment for a provider
   */
  private getApiKeyFromEnv(provider: string): string | undefined {
    const envVars = {
      gemini: ['GEMINI_API_KEY', 'GOOGLE_API_KEY'],
      openai: ['OPENAI_API_KEY'],
      claude: ['ANTHROPIC_API_KEY', 'CLAUDE_API_KEY']
    }
    
    const vars = envVars[provider as keyof typeof envVars] || []
    
    for (const varName of vars) {
      const value = this.getEnvVar(varName)
      if (value) return value
    }
    
    return undefined
  }

  /**
   * Get environment variable (cross-platform)
   */
  private getEnvVar(name: string): string | undefined {
    // Node.js environment
    if (typeof process !== 'undefined' && process.env) {
      return process.env[name]
    }

    // Browser environment (fallback to global if available)
    if (typeof window !== 'undefined' && (window as any).env) {
      return (window as any).env[name]
    }

    return undefined
  }
}

/**
 * Default instance for convenience
 */
const aiServices = AIServices.getInstance()

/**
 * Convenience functions using the default instance
 */
export function createService(provider: string, apiKey?: string, overrides?: Partial<AIServiceConfig>): IAIService {
  return aiServices.createService(provider, apiKey, overrides)
}

export function createGeminiService(apiKey?: string, options?: Partial<Omit<GeminiConfig, 'provider' | 'apiKey'>>): IAIService {
  return aiServices.createGeminiService(apiKey, options)
}

export function getAvailableProviders(): string[] {
  return aiServices.getAvailableProviders()
}

export function getConfiguredProviders(): string[] {
  return aiServices.getConfiguredProviders()
}

export function isProviderReady(provider: string): boolean {
  return aiServices.isProviderReady(provider)
}

export async function getHealthStatus(): Promise<Record<string, any>> {
  return aiServices.getHealthStatus()
}

/**
 * Initialize AI services with environment configuration
 */
export function initializeAIServices(): AIServices {
  const instance = AIServices.getInstance()
  
  // Set up logging
  const logger = createLogger('console', getLogLevelFromEnv())
  logger.info('AI Services initialized', {
    availableProviders: instance.getAvailableProviders(),
    configuredProviders: instance.getConfiguredProviders()
  })
  
  return instance
}

// Export default instance
export default aiServices

/**
 * Package information
 */
export const packageInfo = {
  name: '@mabar/ai-services',
  version: '1.0.0',
  description: 'Modular AI services package for MaBar application',
  supportedProviders: ['gemini'],
  plannedProviders: ['openai', 'claude', 'anthropic']
}
