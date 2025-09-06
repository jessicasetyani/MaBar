/**
 * Performance monitoring utilities for AI services
 */

import { PerformanceMetrics } from '../types'

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private maxMetrics: number

  constructor(maxMetrics: number = 1000) {
    this.maxMetrics = maxMetrics
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric)
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  /**
   * Get metrics for a specific operation
   */
  getMetricsForOperation(operation: string): PerformanceMetrics[] {
    return this.metrics.filter(metric => metric.operation === operation)
  }

  /**
   * Get average duration for an operation
   */
  getAverageDuration(operation: string): number {
    const operationMetrics = this.getMetricsForOperation(operation)
    if (operationMetrics.length === 0) return 0
    
    const totalDuration = operationMetrics.reduce((sum, metric) => sum + metric.duration, 0)
    return totalDuration / operationMetrics.length
  }

  /**
   * Get success rate for an operation
   */
  getSuccessRate(operation: string): number {
    const operationMetrics = this.getMetricsForOperation(operation)
    if (operationMetrics.length === 0) return 0
    
    const successCount = operationMetrics.filter(metric => metric.success).length
    return successCount / operationMetrics.length
  }

  /**
   * Get performance summary for an operation
   */
  getOperationSummary(operation: string): {
    count: number
    averageDuration: number
    minDuration: number
    maxDuration: number
    successRate: number
    lastExecuted?: string
  } {
    const operationMetrics = this.getMetricsForOperation(operation)
    
    if (operationMetrics.length === 0) {
      return {
        count: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        successRate: 0
      }
    }

    const durations = operationMetrics.map(m => m.duration)
    const successCount = operationMetrics.filter(m => m.success).length
    const lastMetric = operationMetrics[operationMetrics.length - 1]

    return {
      count: operationMetrics.length,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      successRate: successCount / operationMetrics.length,
      lastExecuted: lastMetric?.timestamp
    }
  }

  /**
   * Get overall performance summary
   */
  getOverallSummary(): Record<string, ReturnType<typeof this.getOperationSummary>> {
    const operations = [...new Set(this.metrics.map(m => m.operation))]
    const summary: Record<string, ReturnType<typeof this.getOperationSummary>> = {}
    
    for (const operation of operations) {
      summary[operation] = this.getOperationSummary(operation)
    }
    
    return summary
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = []
  }

  /**
   * Clear metrics older than specified time
   */
  clearOldMetrics(olderThanMs: number): void {
    const cutoffTime = Date.now() - olderThanMs
    this.metrics = this.metrics.filter(metric => {
      const metricTime = new Date(metric.timestamp).getTime()
      return metricTime > cutoffTime
    })
  }

  /**
   * Get metrics within a time range
   */
  getMetricsInRange(startTime: string, endTime: string): PerformanceMetrics[] {
    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()
    
    return this.metrics.filter(metric => {
      const metricTime = new Date(metric.timestamp).getTime()
      return metricTime >= start && metricTime <= end
    })
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): string {
    return JSON.stringify({
      exportTime: new Date().toISOString(),
      totalMetrics: this.metrics.length,
      summary: this.getOverallSummary(),
      metrics: this.metrics
    }, null, 2)
  }

  /**
   * Import metrics from JSON
   */
  importMetrics(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData)
      if (data.metrics && Array.isArray(data.metrics)) {
        this.metrics = data.metrics
      }
    } catch (error) {
      throw new Error(`Failed to import metrics: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

/**
 * Timer utility for measuring operation duration
 */
export class Timer {
  private startTime: number

  constructor() {
    this.startTime = Date.now()
  }

  /**
   * Get elapsed time in milliseconds
   */
  elapsed(): number {
    return Date.now() - this.startTime
  }

  /**
   * Reset the timer
   */
  reset(): void {
    this.startTime = Date.now()
  }

  /**
   * Create a performance metric from this timer
   */
  createMetric(operation: string, success: boolean, metadata?: Record<string, any>): PerformanceMetrics {
    return {
      operation,
      duration: this.elapsed(),
      timestamp: new Date().toISOString(),
      success,
      metadata
    }
  }
}

/**
 * Utility function for manual performance monitoring
 * Use this instead of the decorator for better compatibility
 */
export function withMonitoring<T>(
  operation: string,
  fn: () => Promise<T>,
  monitor?: PerformanceMonitor
): Promise<T> {
  const timer = new Timer()
  let success = false
  let error: Error | undefined

  return fn()
    .then(result => {
      success = true
      return result
    })
    .catch(err => {
      error = err as Error
      throw err
    })
    .finally(() => {
      if (monitor) {
        monitor.recordMetric(
          timer.createMetric(operation, success, {
            error: error?.message
          })
        )
      }
    })
}
