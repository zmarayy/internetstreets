/**
 * Shared Generation Status Store
 * Handles status tracking across serverless functions
 */

export interface GenerationStatus {
  status: 'processing' | 'repairing' | 'ready' | 'error'
  sessionId: string
  traceId: string
  error?: string
  documentId?: string
  previewUrl?: string
  downloadUrl?: string
  serviceName?: string
  repairAttempted?: boolean
}

// In-memory store for generation status
const generationStatusMap = new Map<string, GenerationStatus>()

// Cleanup expired statuses every 5 minutes
setInterval(() => {
  const now = Date.now()
  // Clean up statuses older than 2 hours
  for (const [sessionId, status] of Array.from(generationStatusMap.entries())) {
    // If no recent activity, clean up
    if (now - Date.now() > 2 * 60 * 60 * 1000) {
      generationStatusMap.delete(sessionId)
      console.log(`Cleaned up expired generation status: ${sessionId}`)
    }
  }
}, 5 * 60 * 1000)

export const generationStatus = {
  get: (sessionId: string) => generationStatusMap.get(sessionId),
  set: (sessionId: string, status: GenerationStatus) => {
    generationStatusMap.set(sessionId, status)
    console.log(`[GenerationStatus] Updated status for ${sessionId}: ${status.status}`)
  },
  delete: (sessionId: string) => {
    generationStatusMap.delete(sessionId)
    console.log(`[GenerationStatus] Deleted status for ${sessionId}`)
  },
  has: (sessionId: string) => generationStatusMap.has(sessionId),
  size: () => generationStatusMap.size,
  clear: () => generationStatusMap.clear()
}

// Graceful shutdown - cleanup all statuses
process.on('SIGTERM', () => {
  console.log('Cleaning up generation status store on shutdown...')
  generationStatusMap.clear()
})

process.on('SIGINT', () => {
  console.log('Cleaning up generation status store on shutdown...')
  generationStatusMap.clear()
})
