/**
 * Shared interfaces for the 3-AI system
 */

export interface ConversationContext {
  history: Array<{ role: 'user' | 'model', content: string }>
  accumulatedInfo: Record<string, any>
  userPreferences?: Record<string, any>
  sessionId?: string
}

export interface AIResponse {
  text: string
  sessionCards?: any[]
  needsMoreInfo?: boolean
  conversationComplete?: boolean
}

export interface ToolboxResults {
  venues?: any[]
  players?: any[]
  sessions?: any[]
  totalResults?: number
  error?: string
}

export interface PresentationPlan {
  format: 'cards' | 'text' | 'mixed'
  message: string
  cards?: any[]
  reasoning?: string
}

// AI Logic Service interfaces
export interface IntentAnalysis {
  intent: 'find_venue' | 'find_players' | 'join_session' | 'create_session' | 'general_inquiry'
  confidence: number
  extractedInfo: Record<string, any>
  missingInfo: string[]
  isComplete: boolean
}

export interface InfoGatheringResult {
  needsMoreInfo: boolean
  nextQuestion: string
  accumulatedInfo: Record<string, any>
  readyForToolbox: boolean
  toolboxAction?: string
  toolboxParams?: any
}

export interface PresentationStrategy {
  findings: any
  recommendedPresentation: 'cards' | 'text' | 'mixed'
  reasoning: string
  userContext: Record<string, any>
}

// AI Presenter Service interfaces (for future implementation)
export interface PresentationDiscussion {
  strategy: PresentationStrategy
  presenterRecommendation: 'cards' | 'text' | 'mixed'
  finalFormat: 'cards' | 'text' | 'mixed'
  reasoning: string
}

export interface UserResponse {
  text: string
  sessionCards: any[]
  needsMoreInfo: boolean
  conversationComplete: boolean
}