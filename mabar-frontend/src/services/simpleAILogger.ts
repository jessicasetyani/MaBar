/**
 * Simple AI Flow Logger - Minimal logging for conversation flow
 */

export class SimpleAILogger {
  private static logs: string[] = []

  static log(message: string): void {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `[${timestamp}] ${message}`
    this.logs.push(logEntry)
    console.log(logEntry)
  }

  static clear(): void {
    this.logs = []
    console.clear()
  }

  static getLogs(): string[] {
    return [...this.logs]
  }

  static printSummary(): void {
    console.log('\n=== AI CONVERSATION FLOW SUMMARY ===')
    this.logs.forEach(log => console.log(log))
    console.log('=====================================\n')
  }
}