/**
 * Temporary Storage System
 * Handles ephemeral PDF storage with automatic expiry
 */

import crypto from 'crypto'

interface StoredDocument {
  id: string
  pdfBuffer: Buffer
  mimeType: string
  createdAt: number
  expiresAt: number
  metadata: {
    serviceSlug: string
    sessionId: string
    traceId?: string
    userId?: string
  }
}

// In-memory store (fallback for Netlify)
const memoryStore = new Map<string, StoredDocument>()

// Cleanup expired documents every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [id, doc] of Array.from(memoryStore.entries())) {
    if (doc.expiresAt < now) {
      memoryStore.delete(id)
      console.log(`Cleaned up expired document: ${id}`)
    }
  }
}, 5 * 60 * 1000)

/**
 * Generate unique ID for document
 */
function generateDocumentId(): string {
  return 'doc_' + crypto.randomBytes(16).toString('hex')
}

/**
 * Store PDF in memory (primary method until Netlify Blob available)
 */
function storeInMemory(pdfBuffer: Buffer, metadata: any, expiryHours: number = 1): string {
  const id = generateDocumentId()
  const now = Date.now()
  const expiresAt = now + (expiryHours * 60 * 60 * 1000)
  
  const document: StoredDocument = {
    id,
    pdfBuffer,
    mimeType: 'application/pdf',
    createdAt: now,
    expiresAt,
    metadata
  }
  
  memoryStore.set(id, document)
    console.log(`Stored document ${id} for service ${metadata.serviceSlug}, expires at ${new Date(expiresAt).toISOString()}`)
  
  return id
}

/**
 * Retrieve document from memory
 */
function retrieveFromMemory(id: string): StoredDocument | null {
  const doc = memoryStore.get(id)
  
  if (!doc) {
    return null
  }
  
  // Check if expired
  if (doc.expiresAt < Date.now()) {
    memoryStore.delete(id)
    console.log(`Document ${id} expired and was automatically removed`)
    return null
  }
  
  return doc
}

/**
 * Store PDF document temporarily by sessionId
 */
export async function storeDocumentBySessionId(
  sessionId: string,
  pdfBuffer: Buffer,
  metadata: {
    serviceSlug: string
    traceId?: string
    userId?: string
  },
  expiryHours: number = 1
): Promise<void> {
  try {
    console.log(`[TempStore] Storing document for sessionId ${sessionId} (${pdfBuffer.length} bytes)`)
    
    const now = Date.now()
    const expiresAt = now + (expiryHours * 60 * 60 * 1000)
    
    const document: StoredDocument = {
      id: sessionId, // Use sessionId as the key
      pdfBuffer,
      mimeType: 'application/pdf',
      createdAt: now,
      expiresAt,
      metadata: {
        ...metadata,
        sessionId
      }
    }
    
    memoryStore.set(sessionId, document)
    console.log(`[TempStore] Stored document ${sessionId} at ${new Date().toISOString()}, expires at ${new Date(expiresAt).toISOString()}`)
    console.log(`[TempStore] Current store size after storage: ${memoryStore.size}`)
    console.log(`[TempStore] Available keys after storage: ${Array.from(memoryStore.keys()).join(', ')}`)
    
  } catch (error) {
    console.error('Failed to store document by sessionId:', error)
    throw new Error('Failed to store document temporarily')
  }
}

/**
 * Retrieve PDF document by sessionId
 */
export async function retrieveDocumentBySessionId(sessionId: string): Promise<{
  pdfBuffer: Buffer
  mimeType: string
  metadata: any
} | null> {
  try {
    console.log(`[TempStore] Retrieving document for sessionId: ${sessionId}`)
    console.log(`[TempStore] Current store size: ${memoryStore.size}`)
    console.log(`[TempStore] Available keys: ${Array.from(memoryStore.keys()).join(', ')}`)
    
    const doc = memoryStore.get(sessionId)
    
    if (!doc) {
      console.log(`[TempStore] Document ${sessionId} not found`)
      return null
    }
    
    // Check if expired
    if (doc.expiresAt < Date.now()) {
      memoryStore.delete(sessionId)
      console.log(`[TempStore] Document ${sessionId} expired and was automatically removed`)
      return null
    }
    
    console.log(`[TempStore] Retrieved document ${sessionId} successfully (${doc.pdfBuffer.length} bytes)`)
    return {
      pdfBuffer: doc.pdfBuffer,
      mimeType: doc.mimeType,
      metadata: doc.metadata
    }
    
  } catch (error) {
    console.error('Failed to retrieve document by sessionId:', error)
    return null
  }
}

/**
 * Store PDF document temporarily (legacy function - kept for compatibility)
 */
export async function storeDocument(
  pdfBuffer: Buffer,
  metadata: {
    serviceSlug: string
    sessionId: string
    traceId?: string
    userId?: string
  },
  expiryHours: number = 1
): Promise<{ documentId: string; expiryTime: number }> {
  try {
    console.log(`Storing PDF (${pdfBuffer.length} bytes) for session ${metadata.sessionId}`)
    
    const documentId = storeInMemory(pdfBuffer, metadata, expiryHours)
    const expiryTime = Date.now() + (expiryHours * 60 * 60 * 1000)
    
    // TODO: In production, integrate with Netlify Blob Storage or AWS S3
    // const blobUrl = await uploadToNetlifyBlob(pdfBuffer, metadata)
    // return { documentId, blobUrl, expiryTime }
    
    return { documentId, expiryTime }
    
  } catch (error) {
    console.error('Failed to store document:', error)
    throw new Error('Failed to store document temporarily')
  }
}

/**
 * Retrieve PDF document
 */
export async function retrieveDocument(documentId: string): Promise<{
  pdfBuffer: Buffer
  mimeType: string
  metadata: any
} | null> {
  try {
    console.log(`Retrieving document: ${documentId}`)
    
    const doc = retrieveFromMemory(documentId)
    
    if (!doc) {
      console.log(`Document ${documentId} not found or expired`)
      return null
    }
    
    return {
      pdfBuffer: doc.pdfBuffer,
      mimeType: doc.mimeType,
      metadata: doc.metadata
    }
    
  } catch (error) {
    console.error('Failed to retrieve document:', error)
    return null
  }
}

/**
 * Generate signed URL for document access
 * In production, this would integrate with CloudFront or similar
 */
export async function generateSignedUrl(
  documentId: string,
  expiresInMinutes: number = 60
): Promise<{ url: string; expiresAt: number }> {
  
  const expiresAt = Date.now() + (expiresInMinutes * 60 * 1000)
  
  // For now, return a direct URL to our API endpoint
  // In production, this would be a signed CloudFront URL or Netlify Blob URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://internetstreets.uk'
  const url = `${baseUrl}/api/document/${documentId}?expires=${expiresAt}`
  
  console.log(`Generated signed URL for ${documentId}, expires ${new Date(expiresAt).toISOString()}`)
  
  return { url, expiresAt }
}

/**
 * Check if document exists and is not expired
 */
export async function documentExists(documentId: string): Promise<boolean> {
  const doc = retrieveFromMemory(documentId)
  return doc !== null && doc.expiresAt > Date.now()
}

/**
 * Get document metadata
 */
export async function getDocumentMetadata(documentId: string): Promise<any | null> {
  const doc = retrieveFromMemory(documentId)
  return doc?.metadata || null
}

/**
 * Delete document (admin function)
 */
export async function deleteDocument(documentId: string): Promise<boolean> {
  const existed = memoryStore.has(documentId)
  memoryStore.delete(documentId)
  console.log(`Deleted document ${documentId}`)
  return existed
}

/**
 * Clean up expired documents manually
 */
export function cleanupExpiredDocuments(): number {
  const now = Date.now()
  let cleanedCount = 0
  
  for (const [id, doc] of Array.from(memoryStore.entries())) {
    if (doc.expiresAt < now) {
      memoryStore.delete(id)
      cleanedCount++
    }
  }
  
  console.log(`Cleaned up ${cleanedCount} expired documents`)
  return cleanedCount
}

/**
 * Get storage statistics
 */
export function getStorageStats(): {
  totalDocuments: number
  totalSizeBytes: number
  oldestDocument: Date | null
} {
  let totalSizeBytes = 0
  let oldestTimestamp = Date.now()
  
  for (const doc of Array.from(memoryStore.values())) {
    totalSizeBytes += doc.pdfBuffer.length
    if (doc.createdAt < oldestTimestamp) {
      oldestTimestamp = doc.createdAt
    }
  }
  
  return {
    totalDocuments: memoryStore.size,
    totalSizeBytes,
    oldestDocument: memoryStore.size > 0 ? new Date(oldestTimestamp) : null
  }
}

// Graceful shutdown - cleanup all documents
process.on('SIGTERM', () => {
  console.log('Cleaning up memory store on shutdown...')
  memoryStore.clear()
})

process.on('SIGINT', () => {
  console.log('Cleaning up memory store on shutdown...')
  memoryStore.clear()
})
