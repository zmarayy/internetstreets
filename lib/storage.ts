// Shared storage for generated results
// In production, use Redis, database, or cloud storage
export const generatedResults = new Map<string, { 
  buffer: Buffer; 
  serviceName: string; 
  timestamp: number 
}>()

// Clean up old results every hour
if (typeof window === 'undefined') {
  setInterval(() => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000)
    const entries = Array.from(generatedResults.entries())
    for (const [sessionId, result] of entries) {
      if (result.timestamp < oneHourAgo) {
        generatedResults.delete(sessionId)
      }
    }
  }, 60 * 60 * 1000) // Run every hour
}
