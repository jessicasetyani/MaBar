/**
 * Gemini-specific types and interfaces
 */

import { AIServiceConfig } from './index'

// Gemini service configuration
export interface GeminiConfig extends AIServiceConfig {
  provider: 'gemini'
  model: 'gemini-pro' | 'gemini-pro-vision' | 'gemini-1.5-pro' | 'gemini-1.5-flash'
  safetySettings?: GeminiSafetySetting[]
  generationConfig?: GeminiGenerationConfig
}

// Gemini safety settings
export interface GeminiSafetySetting {
  category: 'HARM_CATEGORY_HARASSMENT' | 'HARM_CATEGORY_HATE_SPEECH' | 'HARM_CATEGORY_SEXUALLY_EXPLICIT' | 'HARM_CATEGORY_DANGEROUS_CONTENT'
  threshold: 'BLOCK_NONE' | 'BLOCK_ONLY_HIGH' | 'BLOCK_MEDIUM_AND_ABOVE' | 'BLOCK_LOW_AND_ABOVE'
}

// Gemini generation configuration
export interface GeminiGenerationConfig {
  temperature?: number
  topP?: number
  topK?: number
  maxOutputTokens?: number
  stopSequences?: string[]
}

// Gemini API request structure
export interface GeminiRequest {
  contents: GeminiContent[]
  generationConfig?: GeminiGenerationConfig
  safetySettings?: GeminiSafetySetting[]
}

// Gemini content structure
export interface GeminiContent {
  parts: GeminiPart[]
  role?: 'user' | 'model'
}

// Gemini part structure
export interface GeminiPart {
  text?: string
  inlineData?: {
    mimeType: string
    data: string
  }
}

// Gemini API response structure
export interface GeminiResponse {
  candidates?: GeminiCandidate[]
  promptFeedback?: GeminiPromptFeedback
  usageMetadata?: GeminiUsageMetadata
}

// Gemini candidate structure
export interface GeminiCandidate {
  content?: GeminiContent
  finishReason?: 'FINISH_REASON_UNSPECIFIED' | 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'RECITATION' | 'OTHER'
  index?: number
  safetyRatings?: GeminiSafetyRating[]
}

// Gemini safety rating
export interface GeminiSafetyRating {
  category: string
  probability: 'NEGLIGIBLE' | 'LOW' | 'MEDIUM' | 'HIGH'
}

// Gemini prompt feedback
export interface GeminiPromptFeedback {
  safetyRatings?: GeminiSafetyRating[]
  blockReason?: string
}

// Gemini usage metadata
export interface GeminiUsageMetadata {
  promptTokenCount?: number
  candidatesTokenCount?: number
  totalTokenCount?: number
}

// Gemini error response
export interface GeminiErrorResponse {
  error: {
    code: number
    message: string
    status: string
    details?: any[]
  }
}

// Default Gemini configuration
export const DEFAULT_GEMINI_CONFIG: Partial<GeminiConfig> = {
  model: 'gemini-pro',
  temperature: 0.7,
  maxTokens: 2048,
  timeout: 30000,
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2048
  },
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    }
  ]
}

// Gemini model capabilities
export const GEMINI_MODELS = {
  'gemini-pro': {
    maxTokens: 32768,
    supportedFeatures: ['text'],
    description: 'Optimized for text-only prompts'
  },
  'gemini-pro-vision': {
    maxTokens: 16384,
    supportedFeatures: ['text', 'image'],
    description: 'Optimized for text and image prompts'
  },
  'gemini-1.5-pro': {
    maxTokens: 2097152,
    supportedFeatures: ['text', 'image', 'video', 'audio'],
    description: 'Latest model with extended context window'
  },
  'gemini-1.5-flash': {
    maxTokens: 1048576,
    supportedFeatures: ['text', 'image', 'video', 'audio'],
    description: 'Faster model with good performance'
  }
} as const

export type GeminiModelName = keyof typeof GEMINI_MODELS
