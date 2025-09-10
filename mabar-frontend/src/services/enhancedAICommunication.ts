/**
 * Enhanced Inter-AI Communication System
 * Multi-turn negotiations, complex scenario handling, quick consensus
 */

export interface NegotiationRound {
  round: number
  from: 'Logic' | 'Presenter'
  to: 'Logic' | 'Presenter'
  message: any
  response: any
  timestamp: string
  consensusReached: boolean
}

export interface AIConsensus {
  agreed: boolean
  finalDecision: any
  reasoning: string
  negotiationRounds: number
  complexity: 'simple' | 'medium' | 'complex'
}

export class EnhancedAICommunication {
  private static negotiationHistory: NegotiationRound[] = []
  private static maxNegotiationRounds = 3

  /**
   * Multi-turn negotiation between AI Logic and AI Presenter
   */
  static async conductNegotiation(
    initialFindings: any,
    logicAnalysis: any,
    maxRounds: number = 3
  ): Promise<AIConsensus> {
    
    this.negotiationHistory = []
    let currentRound = 1
    let consensusReached = false
    let finalDecision: any = null

    console.log('🤝 Starting AI Negotiation...')
    
    // Determine complexity
    const complexity = this.assessComplexity(initialFindings, logicAnalysis)
    
    // Quick consensus for simple cases
    if (complexity === 'simple') {
      return this.quickConsensus(initialFindings, logicAnalysis)
    }

    // Multi-turn negotiation for complex cases
    let currentProposal = {
      findings: initialFindings,
      analysis: logicAnalysis,
      suggestedApproach: 'initial'
    }

    while (currentRound <= maxRounds && !consensusReached) {
      console.log(`🔄 Negotiation Round ${currentRound}`)
      
      // AI Logic proposes approach
      const logicProposal = await this.getLogicProposal(currentProposal, currentRound)
      
      // AI Presenter evaluates and responds
      const presenterResponse = await this.getPresenterResponse(logicProposal, currentRound)
      
      // Record negotiation round
      const round: NegotiationRound = {
        round: currentRound,
        from: 'Logic',
        to: 'Presenter',
        message: logicProposal,
        response: presenterResponse,
        timestamp: new Date().toISOString(),
        consensusReached: presenterResponse.agrees
      }
      
      this.negotiationHistory.push(round)
      
      console.log(`   Logic: ${logicProposal.reasoning}`)
      console.log(`   Presenter: ${presenterResponse.reasoning}`)
      console.log(`   Agreement: ${presenterResponse.agrees ? '✅' : '❌'}`)
      
      if (presenterResponse.agrees) {
        consensusReached = true
        finalDecision = presenterResponse.finalApproach
      } else {
        // Prepare for next round with Presenter's counter-proposal
        currentProposal = {
          findings: initialFindings,
          analysis: logicAnalysis,
          suggestedApproach: presenterResponse.counterProposal,
          previousRounds: this.negotiationHistory
        }
      }
      
      currentRound++
    }

    // Fallback if no consensus reached
    if (!consensusReached) {
      console.log('⚠️ No consensus reached, using fallback approach')
      finalDecision = this.getFallbackDecision(initialFindings, logicAnalysis)
    }

    return {
      agreed: consensusReached,
      finalDecision,
      reasoning: consensusReached ? 'Consensus reached through negotiation' : 'Fallback decision applied',
      negotiationRounds: currentRound - 1,
      complexity
    }
  }

  /**
   * Quick consensus for simple scenarios
   */
  private static quickConsensus(findings: any, analysis: any): AIConsensus {
    console.log('⚡ Quick Consensus - Simple scenario detected')
    
    const hasResults = this.hasValidResults(findings)
    const decision = {
      format: hasResults ? 'cards' : 'text',
      reasoning: hasResults ? 'Clear results available' : 'No results, provide guidance',
      approach: 'standard'
    }

    return {
      agreed: true,
      finalDecision: decision,
      reasoning: 'Simple scenario - immediate consensus',
      negotiationRounds: 0,
      complexity: 'simple'
    }
  }

  /**
   * AI Logic proposes approach
   */
  private static async getLogicProposal(proposal: any, round: number): Promise<any> {
    const { findings, analysis, suggestedApproach, previousRounds } = proposal
    
    // Simulate AI Logic thinking process
    const hasResults = this.hasValidResults(findings)
    const userContext = analysis.userContext || {}
    const confidence = analysis.confidence || 0.5

    let reasoning = ''
    let approach = ''

    if (round === 1) {
      if (hasResults && confidence > 0.7) {
        approach = 'show_results_with_cards'
        reasoning = 'High confidence results - recommend card format for easy selection'
      } else if (hasResults && confidence <= 0.7) {
        approach = 'show_results_with_explanation'
        reasoning = 'Results available but low confidence - add explanatory text'
      } else {
        approach = 'provide_alternatives'
        reasoning = 'No direct results - suggest alternatives and gather more info'
      }
    } else {
      // Subsequent rounds - consider previous feedback
      const lastResponse = previousRounds?.[previousRounds.length - 1]?.response
      
      if (lastResponse?.concern === 'too_complex') {
        approach = 'simplify_presentation'
        reasoning = 'Simplifying based on Presenter feedback about complexity'
      } else if (lastResponse?.concern === 'insufficient_info') {
        approach = 'gather_more_info'
        reasoning = 'Need more user information before proceeding'
      } else {
        approach = 'hybrid_approach'
        reasoning = 'Combining approaches based on negotiation feedback'
      }
    }

    return {
      approach,
      reasoning,
      confidence,
      findings,
      userContext,
      round
    }
  }

  /**
   * AI Presenter evaluates Logic proposal
   */
  private static async getPresenterResponse(logicProposal: any, round: number): Promise<any> {
    const { approach, findings, confidence, userContext } = logicProposal
    
    // Simulate AI Presenter UX evaluation
    let agrees = false
    let reasoning = ''
    let concern = ''
    let counterProposal = ''
    let finalApproach = null

    // Evaluate based on UX principles
    if (approach === 'show_results_with_cards') {
      if (findings.venues?.length > 5 || findings.players?.length > 8) {
        agrees = false
        concern = 'too_many_options'
        reasoning = 'Too many cards will overwhelm user - need filtering or pagination'
        counterProposal = 'show_top_3_with_more_option'
      } else if (findings.venues?.length > 0 || findings.players?.length > 0) {
        agrees = true
        reasoning = 'Good number of results for card presentation'
        finalApproach = { format: 'cards', maxItems: 3, includeMoreOption: true }
      }
    } else if (approach === 'provide_alternatives') {
      if (!userContext.location && !userContext.time) {
        agrees = false
        concern = 'insufficient_info'
        reasoning = 'Need basic location or time info before suggesting alternatives'
        counterProposal = 'ask_for_basic_info'
      } else {
        agrees = true
        reasoning = 'Can provide meaningful alternatives with current context'
        finalApproach = { format: 'text_with_suggestions', includeQuestions: true }
      }
    } else if (approach === 'simplify_presentation') {
      agrees = true
      reasoning = 'Simplified approach is better for user experience'
      finalApproach = { format: 'simple_text', maxOptions: 2 }
    }

    // Default agreement for other cases
    if (finalApproach === null) {
      agrees = true
      reasoning = 'Acceptable approach for current scenario'
      finalApproach = { format: 'mixed', adaptive: true }
    }

    return {
      agrees,
      reasoning,
      concern,
      counterProposal,
      finalApproach,
      round
    }
  }

  /**
   * Assess scenario complexity
   */
  private static assessComplexity(findings: any, analysis: any): 'simple' | 'medium' | 'complex' {
    const hasResults = this.hasValidResults(findings)
    const confidence = analysis.confidence || 0.5
    const userContext = analysis.userContext || {}
    
    // Simple: Clear results, high confidence, complete user context
    if (hasResults && confidence > 0.8 && Object.keys(userContext).length >= 2) {
      return 'simple'
    }
    
    // Complex: No results, low confidence, or ambiguous context
    if (!hasResults || confidence < 0.4 || Object.keys(userContext).length === 0) {
      return 'complex'
    }
    
    // Medium: Everything else
    return 'medium'
  }

  /**
   * Check if findings have valid results
   */
  private static hasValidResults(findings: any): boolean {
    if (!findings) return false
    
    const totalResults = (findings.venues?.length || 0) + 
                        (findings.players?.length || 0) + 
                        (findings.sessions?.length || 0)
    
    return totalResults > 0
  }

  /**
   * Fallback decision when no consensus reached
   */
  private static getFallbackDecision(findings: any, analysis: any): any {
    return {
      format: 'text',
      reasoning: 'Using safe fallback approach due to negotiation timeout',
      approach: 'conservative'
    }
  }

  /**
   * Get negotiation audit trail
   */
  static getNegotiationHistory(): NegotiationRound[] {
    return [...this.negotiationHistory]
  }

  /**
   * Reset negotiation state
   */
  static resetNegotiation(): void {
    this.negotiationHistory = []
  }

  /**
   * Get negotiation statistics
   */
  static getNegotiationStats(): any {
    return {
      totalRounds: this.negotiationHistory.length,
      consensusReached: this.negotiationHistory.some(r => r.consensusReached),
      averageRounds: this.negotiationHistory.length,
      lastNegotiation: this.negotiationHistory[this.negotiationHistory.length - 1]
    }
  }
}