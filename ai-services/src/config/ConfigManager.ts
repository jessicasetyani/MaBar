/**
 * Configuration Manager for AI Services
 */

import {
  IConfigManager,
  AIServiceConfig,
  ConfigurationError
} from '../types'
import { GeminiConfig, DEFAULT_GEMINI_CONFIG } from '../types/gemini'

export class ConfigManager implements IConfigManager {
  private static instance: ConfigManager
  private configs: Map<string, AIServiceConfig> = new Map()

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }

  /**
   * Get configuration for a provider
   */
  getConfig(provider: string): AIServiceConfig | null {
    return this.configs.get(provider.toLowerCase()) || null
  }

  /**
   * Set configuration for a provider
   */
  setConfig(provider: string, config: AIServiceConfig): void {
    if (!this.validateConfig(config)) {
      throw new ConfigurationError(`Invalid configuration for provider: ${provider}`, provider)
    }

    this.configs.set(provider.toLowerCase(), { ...config })
  }

  /**
   * Get default configuration for a provider
   */
  getDefaultConfig(provider: string): Partial<AIServiceConfig> {
    switch (provider.toLowerCase()) {
      case 'gemini':
        return DEFAULT_GEMINI_CONFIG
      
      // Future providers will be added here
      case 'openai':
        return {
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2048,
          timeout: 30000,
          baseUrl: 'https://api.openai.com/v1'
        }
      
      case 'claude':
      case 'anthropic':
        return {
          model: 'claude-3-sonnet-20240229',
          temperature: 0.7,
          maxTokens: 2048,
          timeout: 30000,
          baseUrl: 'https://api.anthropic.com/v1'
        }
      
      default:
        return {
          temperature: 0.7,
          maxTokens: 2048,
          timeout: 30000
        }
    }
  }

  /**
   * Load configuration from environment variables
   */
  loadFromEnvironment(): Record<string, AIServiceConfig> {
    const configs: Record<string, AIServiceConfig> = {}

    // Load Gemini configuration
    const geminiApiKey = this.getEnvVar('GEMINI_API_KEY') || this.getEnvVar('GOOGLE_API_KEY')
    if (geminiApiKey) {
      const geminiConfig: GeminiConfig = {
        provider: 'gemini',
        apiKey: geminiApiKey,
        model: (this.getEnvVar('GEMINI_MODEL') as any) || 'gemini-pro',
        temperature: this.getEnvNumber('GEMINI_TEMPERATURE') || 0.7,
        maxTokens: this.getEnvNumber('GEMINI_MAX_TOKENS') || 2048,
        timeout: this.getEnvNumber('GEMINI_TIMEOUT') || 30000,
        ...DEFAULT_GEMINI_CONFIG
      }
      
      configs.gemini = geminiConfig
      this.setConfig('gemini', geminiConfig)
    }

    // Load OpenAI configuration (for future use)
    const openaiApiKey = this.getEnvVar('OPENAI_API_KEY')
    if (openaiApiKey) {
      const openaiConfig: AIServiceConfig = {
        provider: 'openai',
        apiKey: openaiApiKey,
        model: this.getEnvVar('OPENAI_MODEL') || 'gpt-4',
        temperature: this.getEnvNumber('OPENAI_TEMPERATURE') || 0.7,
        maxTokens: this.getEnvNumber('OPENAI_MAX_TOKENS') || 2048,
        timeout: this.getEnvNumber('OPENAI_TIMEOUT') || 30000,
        baseUrl: this.getEnvVar('OPENAI_BASE_URL') || 'https://api.openai.com/v1'
      }
      
      configs.openai = openaiConfig
      this.setConfig('openai', openaiConfig)
    }

    // Load Claude configuration (for future use)
    const claudeApiKey = this.getEnvVar('ANTHROPIC_API_KEY') || this.getEnvVar('CLAUDE_API_KEY')
    if (claudeApiKey) {
      const claudeConfig: AIServiceConfig = {
        provider: 'claude',
        apiKey: claudeApiKey,
        model: this.getEnvVar('CLAUDE_MODEL') || 'claude-3-sonnet-20240229',
        temperature: this.getEnvNumber('CLAUDE_TEMPERATURE') || 0.7,
        maxTokens: this.getEnvNumber('CLAUDE_MAX_TOKENS') || 2048,
        timeout: this.getEnvNumber('CLAUDE_TIMEOUT') || 30000,
        baseUrl: this.getEnvVar('CLAUDE_BASE_URL') || 'https://api.anthropic.com/v1'
      }
      
      configs.claude = claudeConfig
      this.setConfig('claude', claudeConfig)
    }

    return configs
  }

  /**
   * Create configuration with defaults
   */
  createConfig(
    provider: string,
    apiKey: string,
    overrides: Partial<AIServiceConfig> = {}
  ): AIServiceConfig {
    const defaults = this.getDefaultConfig(provider)
    
    return {
      provider,
      apiKey,
      ...defaults,
      ...overrides
    } as AIServiceConfig
  }

  /**
   * Get all configured providers
   */
  getConfiguredProviders(): string[] {
    return Array.from(this.configs.keys())
  }

  /**
   * Check if provider is configured
   */
  isProviderConfigured(provider: string): boolean {
    return this.configs.has(provider.toLowerCase())
  }

  /**
   * Remove configuration for a provider
   */
  removeConfig(provider: string): boolean {
    return this.configs.delete(provider.toLowerCase())
  }

  /**
   * Clear all configurations
   */
  clearConfigs(): void {
    this.configs.clear()
  }

  /**
   * Export configurations (without API keys for security)
   */
  exportConfigs(): Record<string, Omit<AIServiceConfig, 'apiKey'>> {
    const exported: Record<string, Omit<AIServiceConfig, 'apiKey'>> = {}
    
    for (const [provider, config] of this.configs) {
      const { apiKey, ...configWithoutKey } = config
      exported[provider] = configWithoutKey
    }
    
    return exported
  }

  /**
   * Validate configuration
   */
  private validateConfig(config: AIServiceConfig): boolean {
    if (!config.provider || !config.apiKey) {
      return false
    }

    if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 1)) {
      return false
    }

    if (config.maxTokens !== undefined && config.maxTokens <= 0) {
      return false
    }

    if (config.timeout !== undefined && config.timeout <= 0) {
      return false
    }

    return true
  }

  /**
   * Get environment variable
   */
  private getEnvVar(name: string): string | undefined {
    // Support both Node.js and browser environments
    if (typeof process !== 'undefined' && process.env) {
      return process.env[name]
    }

    // Browser environment fallback
    if (typeof window !== 'undefined' && (window as any).env) {
      return (window as any).env[`VITE_${name}`] || (window as any).env[name]
    }

    return undefined
  }

  /**
   * Get environment variable as number
   */
  private getEnvNumber(name: string): number | undefined {
    const value = this.getEnvVar(name)
    if (value === undefined) return undefined

    const parsed = parseFloat(value)
    return isNaN(parsed) ? undefined : parsed
  }
}

/**
 * Convenience functions
 */
export function getConfigManager(): ConfigManager {
  return ConfigManager.getInstance()
}

export function createConfigFromEnv(provider: string): AIServiceConfig | null {
  const manager = getConfigManager()
  const configs = manager.loadFromEnvironment()
  return configs[provider] || null
}

export function createGeminiConfigFromEnv(): GeminiConfig | null {
  const config = createConfigFromEnv('gemini')
  return config as GeminiConfig | null
}
