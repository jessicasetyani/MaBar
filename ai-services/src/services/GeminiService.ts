/**
 * Gemini AI Service Implementation
 */

import axios, { AxiosResponse } from 'axios'
import {
  UserProfile,
  IntentAnalysis,
  NLGRequest,
  HealthCheckResult,
  APIError,
  TimeoutError,
  ValidationError
} from '../types'
import {
  GeminiConfig,
  GeminiRequest,
  GeminiResponse,
  GeminiErrorResponse,
  DEFAULT_GEMINI_CONFIG,
  GEMINI_MODELS
} from '../types/gemini'
import { BaseAIService } from './BaseAIService'

export class GeminiService extends BaseAIService {
  private geminiConfig: GeminiConfig

  constructor(config: GeminiConfig) {
    // Merge with default configuration
    const mergedConfig = {
      ...DEFAULT_GEMINI_CONFIG,
      ...config
    } as GeminiConfig

    super(mergedConfig)
    this.geminiConfig = mergedConfig
    
    this.validateGeminiConfig()
  }

  /**
   * Validate Gemini-specific configuration
   */
  private validateGeminiConfig(): void {
    if (!this.geminiConfig.model || !GEMINI_MODELS[this.geminiConfig.model]) {
      throw new ValidationError(
        `Invalid Gemini model: ${this.geminiConfig.model}. Supported models: ${Object.keys(GEMINI_MODELS).join(', ')}`,
        'gemini'
      )
    }

    const modelInfo = GEMINI_MODELS[this.geminiConfig.model]
    if (this.geminiConfig.maxTokens && this.geminiConfig.maxTokens > modelInfo.maxTokens) {
      this.logger.warn(`Max tokens (${this.geminiConfig.maxTokens}) exceeds model limit (${modelInfo.maxTokens}). Using model limit.`)
      this.geminiConfig.maxTokens = modelInfo.maxTokens
    }
  }

  /**
   * Analyze user intent using Gemini AI
   */
  async analyzeIntent(
    message: string,
    userProfile?: UserProfile,
    language: string = 'en'
  ): Promise<IntentAnalysis> {
    return this.executeWithMonitoring('analyzeIntent', async () => {
      const prompt = this.buildIntentAnalysisPrompt(message, userProfile, language)
      const response = await this.callGeminiAPI(prompt)

      return this.parseIntentAnalysisResponse(response, message)
    })
  }

  /**
   * Generate natural language response using Gemini AI
   */
  async generateResponse(request: NLGRequest): Promise<string> {
    return this.executeWithMonitoring('generateResponse', async () => {
      const prompt = this.buildResponseGenerationPrompt(request)
      const response = await this.callGeminiAPI(prompt)

      return this.cleanResponse(response)
    })
  }

  /**
   * Health check for Gemini service
   */
  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now()
    
    try {
      const testPrompt = 'Respond with "OK" if you can process this message.'
      const response = await this.callGeminiAPI(testPrompt)
      const latency = Date.now() - startTime
      
      const isHealthy = response.toLowerCase().includes('ok')
      
      return {
        status: isHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        provider: 'gemini',
        details: {
          latency,
          errorRate: 0
        }
      }
    } catch (error) {
      const latency = Date.now() - startTime
      
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        provider: 'gemini',
        details: {
          latency,
          errorRate: 1,
          lastError: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  }

  /**
   * Call Gemini API with proper error handling
   */
  private async callGeminiAPI(prompt: string): Promise<string> {
    const url = `${this.geminiConfig.baseUrl}/models/${this.geminiConfig.model}:generateContent?key=${this.geminiConfig.apiKey}`
    
    const requestBody: GeminiRequest = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        ...this.geminiConfig.generationConfig,
        ...(this.geminiConfig.maxTokens && { maxOutputTokens: this.geminiConfig.maxTokens })
      },
      safetySettings: this.geminiConfig.safetySettings
    }

    try {
      this.logger.debug('Calling Gemini API', {
        model: this.geminiConfig.model,
        promptLength: prompt.length,
        maxTokens: requestBody.generationConfig?.maxOutputTokens
      })

      const response: AxiosResponse<GeminiResponse | GeminiErrorResponse> = await axios.post(
        url,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            ...this.geminiConfig.additionalHeaders
          },
          timeout: this.geminiConfig.timeout || 30000
        }
      )

      // Check for API error response
      if ('error' in response.data) {
        const errorResponse = response.data as GeminiErrorResponse
        throw new APIError(
          `Gemini API error: ${errorResponse.error.message}`,
          'gemini',
          {
            code: errorResponse.error.code,
            status: errorResponse.error.status,
            details: errorResponse.error.details
          }
        )
      }

      const geminiResponse = response.data as GeminiResponse
      
      // Extract text from response
      const text = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text
      
      if (!text) {
        throw new APIError('No text content in Gemini response', 'gemini', geminiResponse)
      }

      // Log usage metadata if available
      if (geminiResponse.usageMetadata) {
        this.logger.debug('Gemini API usage', geminiResponse.usageMetadata)
      }

      // Check for safety issues
      const candidate = geminiResponse.candidates?.[0]
      if (candidate?.finishReason === 'SAFETY') {
        this.logger.warn('Gemini response blocked due to safety concerns', {
          safetyRatings: candidate.safetyRatings
        })
        throw new APIError('Response blocked due to safety concerns', 'gemini', {
          finishReason: candidate.finishReason,
          safetyRatings: candidate.safetyRatings
        })
      }

      return text
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new TimeoutError('Gemini API request timed out', 'gemini', {
            timeout: this.geminiConfig.timeout
          })
        }

        if (error.response) {
          // API returned an error response
          const status = error.response.status
          const data = error.response.data

          if (status === 401) {
            throw new APIError('Invalid API key for Gemini', 'gemini', { status, data })
          } else if (status === 429) {
            throw new APIError('Rate limit exceeded for Gemini API', 'gemini', { status, data })
          } else if (status >= 500) {
            throw new APIError('Gemini API server error', 'gemini', { status, data })
          } else {
            throw new APIError(`Gemini API error: ${status}`, 'gemini', { status, data })
          }
        } else if (error.request) {
          // Network error
          throw new APIError('Network error calling Gemini API', 'gemini', {
            message: error.message
          })
        }
      }

      // Re-throw if it's already our custom error
      if (error instanceof APIError || error instanceof TimeoutError) {
        throw error
      }

      // Unknown error
      throw new APIError(
        `Unexpected error calling Gemini API: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'gemini',
        error
      )
    }
  }

  /**
   * Get Gemini-specific configuration
   */
  getGeminiConfig(): GeminiConfig {
    return { ...this.geminiConfig }
  }

  /**
   * Update Gemini configuration
   */
  updateConfig(updates: Partial<GeminiConfig>): void {
    this.geminiConfig = { ...this.geminiConfig, ...updates }
    this.config = this.geminiConfig
    this.validateGeminiConfig()
  }

  /**
   * Get model information
   */
  getModelInfo() {
    return GEMINI_MODELS[this.geminiConfig.model]
  }

  /**
   * Check if model supports a specific feature
   */
  supportsFeature(feature: 'text' | 'image' | 'video' | 'audio'): boolean {
    const modelInfo = this.getModelInfo()
    return modelInfo.supportedFeatures.includes(feature as any)
  }

  /**
   * Get estimated token count for text (rough approximation)
   */
  estimateTokenCount(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters for English
    // This is not accurate but gives a ballpark estimate
    return Math.ceil(text.length / 4)
  }

  /**
   * Check if text would exceed token limit
   */
  wouldExceedTokenLimit(text: string): boolean {
    const estimatedTokens = this.estimateTokenCount(text)
    const maxTokens = this.geminiConfig.maxTokens || this.getModelInfo().maxTokens
    return estimatedTokens > maxTokens
  }
}
