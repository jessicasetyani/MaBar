import { GoogleGenAI } from '@google/genai'
import { env } from '../config/env'

// Simple AI Action Types
export type SimpleAIAction = 
  | 'findMatch'
  | 'getAvailableVenues'
  | 'findOpenSessions'
  | 'createNewSession'
  | 'needMoreInfo'

export interface SimpleAIRequest {
  action: SimpleAIAction
  parameters: {
    location?: string
    time?: string
    date?: string
    skillLevel?: string
    [key: string]: any
  }
}

export interface SimpleAIResponse {
  text: string
  data?: any
}

export class SimpleAITestFlow {
  private static ai = new GoogleGenAI({ apiKey: env.GOOGLE_API_KEY })

  // Minimal system instruction
  private static readonly SYSTEM_INSTRUCTION = `
You are a padel matchmaking assistant. Analyze user input and respond with JSON only:

Actions:
- findMatch: User wants to find courts and players
- getAvailableVenues: User wants to see courts
- findOpenSessions: User wants to join existing games
- createNewSession: User wants to start new game
- needMoreInfo: Need more details

Response format:
{"action": "actionName", "parameters": {"location": "...", "time": "...", "date": "..."}}

Examples:
"Play padel at 8pm in Senayan" → {"action": "findMatch", "parameters": {"location": "Senayan", "time": "8pm"}}
"Show courts tomorrow" → {"action": "getAvailableVenues", "parameters": {"date": "tomorrow"}}
"Hi" → {"action": "needMoreInfo", "parameters": {"message": "What padel activity would you like?"}}
`

  /**
   * STEP 1: Process user input and get AI toolbox selection
   */
  static async processUserInput(userInput: string): Promise<SimpleAIRequest> {
    console.log('🔍 STEP 1: Processing user input:', userInput)
    
    try {
      const model = this.ai.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        systemInstruction: this.SYSTEM_INSTRUCTION
      })

      const result = await model.generateContent(userInput)
      const aiResponse = result.response.text().trim()
      
      console.log('🤖 AI Raw Response:', aiResponse)
      
      // Parse JSON response
      const aiRequest = JSON.parse(aiResponse) as SimpleAIRequest
      
      console.log('✅ STEP 1 Complete - AI Selected Toolbox:', aiRequest.action)
      console.log('📋 Parameters:', aiRequest.parameters)
      
      return aiRequest
      
    } catch (error) {
      console.error('❌ STEP 1 Error:', error)
      return {
        action: 'needMoreInfo',
        parameters: { message: 'Could not understand your request' }
      }
    }
  }

  /**
   * STEP 2: Execute the selected toolbox function
   */
  static async executeToolbox(aiRequest: SimpleAIRequest): Promise<any> {
    console.log('🔧 STEP 2: Executing toolbox function:', aiRequest.action)
    
    try {
      switch (aiRequest.action) {
        case 'findMatch':
          return await this.mockFindMatch(aiRequest.parameters)
          
        case 'getAvailableVenues':
          return await this.mockGetVenues(aiRequest.parameters)
          
        case 'findOpenSessions':
          return await this.mockFindSessions(aiRequest.parameters)
          
        case 'createNewSession':
          return await this.mockCreateSession(aiRequest.parameters)
          
        case 'needMoreInfo':
          return { message: aiRequest.parameters.message || 'What would you like to do?' }
          
        default:
          return { error: 'Unknown action' }
      }
    } catch (error) {
      console.error('❌ STEP 2 Error:', error)
      return { error: 'Toolbox execution failed' }
    }
  }

  /**
   * STEP 3: Generate response after toolbox execution
   */
  static async generateResponse(toolboxResult: any, originalAction: SimpleAIAction): Promise<SimpleAIResponse> {
    console.log('💬 STEP 3: Generating response for action:', originalAction)
    console.log('📊 Toolbox Result:', toolboxResult)
    
    try {
      if (toolboxResult.error) {
        return {
          text: `Sorry, there was an issue: ${toolboxResult.error}`,
          data: toolboxResult
        }
      }

      switch (originalAction) {
        case 'findMatch':
          return {
            text: `Found ${toolboxResult.venues?.length || 0} venues and ${toolboxResult.sessions?.length || 0} open sessions for you!`,
            data: toolboxResult
          }
          
        case 'getAvailableVenues':
          return {
            text: `Here are ${toolboxResult.venues?.length || 0} available venues:`,
            data: toolboxResult
          }
          
        case 'findOpenSessions':
          return {
            text: `Found ${toolboxResult.sessions?.length || 0} open games you can join:`,
            data: toolboxResult
          }
          
        case 'createNewSession':
          return {
            text: `Created new session! Session ID: ${toolboxResult.sessionId}`,
            data: toolboxResult
          }
          
        case 'needMoreInfo':
          return {
            text: toolboxResult.message,
            data: toolboxResult
          }
          
        default:
          return {
            text: 'Action completed successfully',
            data: toolboxResult
          }
      }
    } catch (error) {
      console.error('❌ STEP 3 Error:', error)
      return {
        text: 'Could not generate response',
        data: { error: error.message }
      }
    }
  }

  /**
   * Complete flow: Input → AI Selection → Toolbox → Response
   */
  static async runCompleteFlow(userInput: string): Promise<SimpleAIResponse> {
    console.log('\n🚀 Starting Complete AI Test Flow')
    console.log('=' .repeat(50))
    
    // Step 1: Process input and get AI toolbox selection
    const aiRequest = await this.processUserInput(userInput)
    
    // Step 2: Execute selected toolbox function
    const toolboxResult = await this.executeToolbox(aiRequest)
    
    // Step 3: Generate final response
    const finalResponse = await this.generateResponse(toolboxResult, aiRequest.action)
    
    console.log('\n✅ Complete Flow Finished')
    console.log('📤 Final Response:', finalResponse.text)
    console.log('=' .repeat(50))
    
    return finalResponse
  }

  // Mock toolbox functions (replace with real implementations)
  private static async mockFindMatch(params: any) {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
    return {
      venues: [
        { id: 1, name: 'Senayan Padel Club', location: params.location || 'Senayan' },
        { id: 2, name: 'Jakarta Padel Center', location: params.location || 'Jakarta' }
      ],
      sessions: [
        { id: 1, playersNeeded: 2, time: params.time || '8pm' },
        { id: 2, playersNeeded: 1, time: params.time || '9pm' }
      ]
    }
  }

  private static async mockGetVenues(params: any) {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      venues: [
        { id: 1, name: 'Court A', available: true, location: params.location },
        { id: 2, name: 'Court B', available: true, location: params.location }
      ]
    }
  }

  private static async mockFindSessions(params: any) {
    await new Promise(resolve => setTimeout(resolve, 400))
    return {
      sessions: [
        { id: 1, playersNeeded: 2, skillLevel: params.skillLevel || 'intermediate' },
        { id: 2, playersNeeded: 1, skillLevel: params.skillLevel || 'beginner' }
      ]
    }
  }

  private static async mockCreateSession(params: any) {
    await new Promise(resolve => setTimeout(resolve, 600))
    return {
      sessionId: 'session_' + Date.now(),
      location: params.location,
      time: params.time,
      playersNeeded: 3
    }
  }
}