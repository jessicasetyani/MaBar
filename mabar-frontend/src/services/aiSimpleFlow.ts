import { GoogleGenAI } from '@google/genai'
import { env } from '../config/env'

export class AISimpleFlow {
  private static ai = new GoogleGenAI({ apiKey: env.GOOGLE_API_KEY })
  private static conversation: Array<{ role: 'user' | 'model', parts: Array<{ text: string }> }> = []

  static async processUserInput(userInput: string): Promise<any> {
    console.log(`👤 [USER] ${userInput}`)
    
    // 1. AI THINKS - What does user want? Do I need data?
    const aiDecision = await this.aiThinks(userInput)
    console.log(`🧠 [AI THINKS] ${aiDecision.reasoning}`)
    
    // 2. TOOLBOX - Get data if AI needs it
    let data = null
    if (aiDecision.needsData) {
      data = await this.toolboxGetData(aiDecision.dataRequest)
      console.log(`🔧 [TOOLBOX] Got ${data?.length || 0} results`)
    }
    
    // 3. AI PRESENTS - Analyze data and create response
    const response = await this.aiPresents(userInput, aiDecision, data)
    console.log(`🎯 [AI RESPONSE] ${response.text?.substring(0, 50)}...`)
    
    return response
  }

  private static async aiThinks(userInput: string): Promise<any> {
    this.conversation.push({ role: 'user', parts: [{ text: userInput }] })

    const result = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: [
        { role: 'user', parts: [{ text: 'You are MaBar AI. Think about what user wants.' }] },
        { role: 'model', parts: [{ text: 'I help users find padel sessions in Jakarta.' }] },
        ...this.conversation.slice(-6),
        { 
          role: 'user', 
          parts: [{ text: `Think: What does user want? Do I need database data to help them?
          
Respond JSON:
{
  "reasoning": "what user wants",
  "needsData": true/false,
  "dataRequest": {
    "type": "venues|players|sessions",
    "params": {search_parameters}
  }
}` }] 
        }
      ]
    })

    const response = result.text?.replace(/```json\n?|\n?```/g, '').trim()
    try {
      return JSON.parse(response || '{}')
    } catch {
      return { reasoning: "Processing user request", needsData: false }
    }
  }

  private static async toolboxGetData(dataRequest: any): Promise<any> {
    if (!dataRequest) return null

    try {
      const { MatchmakingToolboxService } = await import('./matchmakingToolboxService')
      
      switch (dataRequest.type) {
        case 'venues':
          const venueResult = await MatchmakingToolboxService.getAvailableVenues(dataRequest.params)
          return venueResult.data || []
        case 'players':
          const playerResult = await MatchmakingToolboxService.getAvailablePlayers(dataRequest.params)
          return playerResult.data || []
        case 'sessions':
          const sessionResult = await MatchmakingToolboxService.findOpenSessions(dataRequest.params)
          return sessionResult.data || []
        default:
          return null
      }
    } catch (error) {
      console.error('Toolbox error:', error)
      return null
    }
  }

  private static async aiPresents(userInput: string, aiDecision: any, data: any): Promise<any> {
    const result = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: [
        ...this.conversation.slice(-4),
        {
          role: 'user',
          parts: [{ text: `User asked: "${userInput}"
Your reasoning: "${aiDecision.reasoning}"
Database data: ${JSON.stringify(data)}

Create response with appropriate UI cards if helpful.

Respond JSON:
{
  "text": "your response to user",
  "sessionCards": [
    {
      "type": "existing-session|create-new|no-availability",
      "data": {card_data}
    }
  ]
}` }]
        }
      ]
    })

    const response = result.text?.replace(/```json\n?|\n?```/g, '').trim()
    try {
      const parsed = JSON.parse(response || '{}')
      this.conversation.push({ role: 'model', parts: [{ text: parsed.text || 'How can I help?' }] })
      return parsed
    } catch {
      return { text: "How can I help you with padel today?", sessionCards: [] }
    }
  }

  static resetConversation(): void {
    this.conversation = []
  }
}