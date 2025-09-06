/**
 * Logging utilities for AI services
 */

import { ILogger, LogLevel } from '../types'

export class ConsoleLogger implements ILogger {
  private logLevel: LogLevel
  private prefix: string

  constructor(logLevel: LogLevel = 'info', prefix: string = '[AI-Services]') {
    this.logLevel = logLevel
    this.prefix = prefix
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.log(`${this.prefix} [DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '')
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.info(`${this.prefix} [INFO] ${message}`, data ? JSON.stringify(data, null, 2) : '')
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(`${this.prefix} [WARN] ${message}`, data ? JSON.stringify(data, null, 2) : '')
    }
  }

  error(message: string, error?: any): void {
    if (this.shouldLog('error')) {
      const errorInfo = error instanceof Error 
        ? { message: error.message, stack: error.stack }
        : error
      console.error(`${this.prefix} [ERROR] ${message}`, errorInfo)
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = levels.indexOf(this.logLevel)
    const messageLevelIndex = levels.indexOf(level)
    
    return messageLevelIndex >= currentLevelIndex
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level
  }

  getLogLevel(): LogLevel {
    return this.logLevel
  }
}

export class SilentLogger implements ILogger {
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
}

export class StructuredLogger implements ILogger {
  private logs: Array<{
    level: LogLevel
    message: string
    data?: any
    timestamp: string
  }> = []

  debug(message: string, data?: any): void {
    this.addLog('debug', message, data)
  }

  info(message: string, data?: any): void {
    this.addLog('info', message, data)
  }

  warn(message: string, data?: any): void {
    this.addLog('warn', message, data)
  }

  error(message: string, error?: any): void {
    this.addLog('error', message, error)
  }

  private addLog(level: LogLevel, message: string, data?: any): void {
    this.logs.push({
      level,
      message,
      data,
      timestamp: new Date().toISOString()
    })
  }

  getLogs(): Array<{
    level: LogLevel
    message: string
    data?: any
    timestamp: string
  }> {
    return [...this.logs]
  }

  clearLogs(): void {
    this.logs = []
  }

  getLogsByLevel(level: LogLevel): Array<{
    level: LogLevel
    message: string
    data?: any
    timestamp: string
  }> {
    return this.logs.filter(log => log.level === level)
  }
}

/**
 * Create logger based on environment
 */
export function createLogger(
  type: 'console' | 'silent' | 'structured' = 'console',
  logLevel: LogLevel = 'info'
): ILogger {
  switch (type) {
    case 'silent':
      return new SilentLogger()
    case 'structured':
      return new StructuredLogger()
    case 'console':
    default:
      return new ConsoleLogger(logLevel)
  }
}

/**
 * Get log level from environment variable
 */
export function getLogLevelFromEnv(defaultLevel: LogLevel = 'info'): LogLevel {
  const envLevel = process.env.AI_LOG_LEVEL?.toLowerCase() as LogLevel
  const validLevels: LogLevel[] = ['debug', 'info', 'warn', 'error']
  
  return validLevels.includes(envLevel) ? envLevel : defaultLevel
}
