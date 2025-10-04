/**
 * Comprehensive Logging System
 * Handles generation status, errors, and admin debugging
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  id: string
  timestamp: number
  level: LogLevel
  traceId: string
  message: string
  data?: any
  sessionId?: string
  serviceSlug?: string
  step?: GenerationStep
}

export enum GenerationStep {
  CHECKOUT_COMPLETED = 'CHECKOUT_COMPLETED',
  PROMPT_BUILT = 'PROMPT_BUILT',
  OPENAI_CALLED = 'OPENAI_CALLED',
  JSON_VALIDATED = 'JSON_VALIDATED',
  PDF_RENDERED = 'PDF_RENDERED',
  PDF_STORED = 'PDF_STORED',
  GENERATION_COMPLETE = 'GENERATION_COMPLETE',
  GENERATION_FAILED = 'GENERATION_FAILED',
  RETRY_ATTEMPT = 'RETRY_ATTEMPT',
  SANITIZATION = 'SANITIZATION',
  BLACKLIST_HIT = 'BLACKLIST_HIT'
}

// In-memory log store (in production, use proper logging service)
const logStore = new Map<string, LogEntry[]>()

// Rolling log cleanup - keep last 1000 entries per session
const MAX_LOG_ENTRIES_PER_SESSION = 1000

/**
 * Generate trace ID
 */
function generateTraceId(): string {
  return 'trace_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8)
}

/**
 * Log entry ID
 */
function generateLogId(): string {
  return 'log_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6)
}

/**
 * Format log entry
 */
function formatLogEntry(entry: LogEntry): string {
  const level = LogLevel[entry.level]
  const timestamp = new Date(entry.timestamp).toISOString()
  const step = entry.step ? ` [${entry.step}]` : ''
  
  return `[${timestamp}] ${level} ${entry.traceId}${step}: ${entry.message}${entry.data ? ` | ${JSON.stringify(entry.data)}` : ''}`
}

/**
 * Main logging function
 */
export function log(
  level: LogLevel,
  message: string,
  traceId: string,
  data?: any,
  sessionId?: string,
  serviceSlug?: string,
  step?: GenerationStep
): void {
  const entry: LogEntry = {
    id: generateLogId(),
    timestamp: Date.now(),
    level,
    traceId,
    message,
    data,
    sessionId,
    serviceSlug,
    step
  }

  // Store in memory
  const sessionLogs = logStore.get(traceId) || []
  sessionLogs.push(entry)
  
  // Limit log entries to prevent memory issues
  if (sessionLogs.length > MAX_LOG_ENTRIES_PER_SESSION) {
    sessionLogs.splice(0, sessionLogs.length - MAX_LOG_ENTRIES_PER_SESSION)
  }
  
  logStore.set(traceId, sessionLogs)

  // Console output for development
  console.log(formatLogEntry(entry))

  // TODO: In production, send to CloudWatch, DataDog, or similar
}

/**
 * Convenience functions
 */
export const logger = {
  debug: (message: string, traceId: string, data?: any, sessionId?: string, serviceSlug?: string, step?: GenerationStep) =>
    log(LogLevel.DEBUG, message, traceId, data, sessionId, serviceSlug, step),

  info: (message: string, traceId: string, data?: any, sessionId?: string, serviceSlug?: string, step?: GenerationStep) =>
    log(LogLevel.INFO, message, traceId, data, sessionId, serviceSlug, step),

  warn: (message: string, traceId: string, data?: any, sessionId?: string, serviceSlug?: string, step?: GenerationStep) =>
    log(LogLevel.WARN, message, traceId, data, sessionId, serviceSlug, step),

  error: (message: string, traceId: string, data?: any, sessionId?: string, serviceSlug?: string, step?: GenerationStep) =>
    log(LogLevel.ERROR, message, traceId, data, sessionId, serviceSlug, step),

  // Generation workflow specific helpers
  generationStart: (traceId: string, sessionId: string, serviceSlug: string) =>
    log(LogLevel.INFO, 'Generation started', traceId, { sessionId, serviceSlug }, sessionId, serviceSlug, GenerationStep.CHECKOUT_COMPLETED),

  generationStep: (message: string, traceId: string, step: GenerationStep, sessionId?: string, serviceSlug?: string, data?: any) =>
    log(LogLevel.INFO, message, traceId, data, sessionId, serviceSlug, step),

  generationSuccess: (traceId: string, sessionId: string, serviceSlug: string, documentId: string) =>
    log(LogLevel.INFO, 'Generation completed successfully', traceId, { documentId }, sessionId, serviceSlug, GenerationStep.GENERATION_COMPLETE),

  generationFailed: (message: string, traceId: string, sessionId: string, serviceSlug: string, error: any, step?: GenerationStep) =>
    log(LogLevel.ERROR, message, traceId, { error: error instanceof Error ? error.message : error }, sessionId, serviceSlug, step || GenerationStep.GENERATION_FAILED),

  retryAttempt: (attemptNumber: number, reason: string, traceId: string, sessionId?: string, serviceSlug?: string) =>
    log(LogLevel.WARN, `Retry attempt ${attemptNumber}: ${reason}`, traceId, { attemptNumber, reason }, sessionId, serviceSlug, GenerationStep.RETRY_ATTEMPT),

  sanitizationAction: (reason: string, originalValue: string, sanitizedValue: string, traceId: string, sessionId?: string, serviceSlug?: string) =>
    log(LogLevel.WARN, `Input sanitized: ${reason}`, traceId, { originalValue, sanitizedValue }, sessionId, serviceSlug, GenerationStep.SANITIZATION),

  blacklistHit: (detectedValue: string, reason: string, traceId: string, sessionId?: string, serviceSlug?: string) =>
    log(LogLevel.WARN, `Blocked item detected: ${reason}`, traceId, { detectedValue }, sessionId, serviceSlug, GenerationStep.BLACKLIST_HIT)
}

/**
 * Get logs for a trace/session
 */
export function getLogs(traceId: string): LogEntry[] {
  return logStore.get(traceId) || []
}

/**
 * Get logs for a session (combine multiple traces)
 */
export function getSessionLogs(sessionId: string): LogEntry[] {
  const allLogs: LogEntry[] = []
  
  for (const sessionLogs of Array.from(logStore.values())) {
    const sessionEntries = sessionLogs.filter(log => log.sessionId === sessionId)
    allLogs.push(...sessionEntries)
  }
  
  return allLogs.filter((entry, index, self) => 
    index === self.findIndex(e => e.id === entry.id)
  ).sort((a, b) => a.timestamp - b.timestamp)
}

/**
 * Get logs by service
 */
export function getServiceLogs(serviceSlug: string): LogEntry[] {
  const allLogs: LogEntry[] = []
  
  for (const sessionLogs of Array.from(logStore.values())) {
    const serviceEntries = sessionLogs.filter(log => log.serviceSlug === serviceSlug)
    allLogs.push(...serviceEntries)
  }
  
  return allLogs.filter((entry, index, self) => 
    index === self.findIndex(e => e.id === entry.id)
  ).sort((a, b) => a.timestamp - b.timestamp)
}

/**
 * Get recent error logs
 */
export function getErrorLogs(hours: number = 24): LogEntry[] {
  const cutoff = Date.now() - (hours * 60 * 60 * 1000)
  const allLogs: LogEntry[] = []
  
  for (const sessionLogs of Array.from(logStore.values())) {
    const errorEntries = sessionLogs.filter(log => 
      log.level === LogLevel.ERROR && log.timestamp > cutoff
    )
    allLogs.push(...errorEntries)
  }
  
  return allLogs.filter((entry, index, self) => 
    index === self.findIndex(e => e.id === entry.id)
  ).sort((a, b) => b.timestamp - a.timestamp) // Next-to-last first
}

/**
 * Get generation stats
 */
export function getGenerationStats(hours: number = 24): {
  totalGenerations: number
  successfulGenerations: number
  failedGenerations: number
  serviceStats: { [serviceSlug: string]: { success: number; failed: number } }
  commonErrors: { error: string; count: number }[]
} {
  const cutoff = Date.now() - (hours * 60 * 60 * 1000)
  const allLogs: LogEntry[] = []
  
  for (const sessionLogs of Array.from(logStore.values())) {
    const recentLogs = sessionLogs.filter(log => log.timestamp > cutoff)
    allLogs.push(...recentLogs)
  }

  // Count generations
  const completeLogs = allLogs.filter(log => log.step === GenerationStep.GENERATION_COMPLETE)
  const failedLogs = allLogs.filter(log => log.step === GenerationStep.GENERATION_FAILED)

  // Service stats
  const serviceStats: { [serviceSlug: string]: { success: number; failed: number } } = {}
  
  completeLogs.forEach(log => {
    if (log.serviceSlug) {
      if (!serviceStats[log.serviceSlug]) {
        serviceStats[log.serviceSlug] = { success: 0, failed: 0 }
      }
      serviceStats[log.serviceSlug].success++
    }
  })
  
  failedLogs.forEach(log => {
    if (log.serviceSlug) {
      if (!serviceStats[log.serviceSlug]) {
        serviceStats[log.serviceSlug] = { success: 0, failed: 0 }
      }
      serviceStats[log.serviceSlug].failed++
    }
  })

  // Common errors
  const errorMessages = allLogs
    .filter(log => log.level === LogLevel.ERROR)
    .map(log => log.message)
  
  const errorCounts: { [error: string]: number } = {}
  errorMessages.forEach(error => {
    errorCounts[error] = (errorCounts[error] || 0) + 1
  })
  
  const commonErrors = Object.entries(errorCounts)
    .map(([error, count]) => ({ error, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return {
    totalGenerations: completeLogs.length + failedLogs.length,
    successfulGenerations: completeLogs.length,
    failedGenerations: failedLogs.length,
    serviceStats,
    commonErrors
  }
}

/**
 * Clean old logs
 */
export function cleanupOldLogs(maxAgeHours: number = 24): number {
  const cutoff = Date.now() - (maxAgeHours * 60 * 60 * 1000)
  let cleanedCount = 0
  
  for (const [traceId, logs] of Array.from(logStore.entries())) {
    const oldLogs = logs.filter(log => log.timestamp < cutoff)
    const recentLogs = logs.filter(log => log.timestamp >= cutoff)
    
    cleanedCount += oldLogs.length
    
    if (recentLogs.length === 0) {
      logStore.delete(traceId)
    } else {
      logStore.set(traceId, recentLogs)
    }
  }
  
  console.log(`Cleaned up ${cleanedCount} old log entries`)
  return cleanedCount
}

// Generate trace ID export
export { generateTraceId }
