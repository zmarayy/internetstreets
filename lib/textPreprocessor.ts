/**
 * Advanced text cleaning for professional document generation
 */
export function cleanGeneratedText(text: string): string {
  if (!text) return text

  return text
    // Remove markdown formatting
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
    .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
    .replace(/---+/g, '') // Remove horizontal rules
    .replace(/###?\s*/g, '') // Remove heading markdown
    
    // Remove novelty markers and placeholders
    .replace(/\(Fictional\)/gi, '')
    .replace(/\(FAKE\)/gi, '')
    .replace(/\(NOT REAL\)/gi, '')
    .replace(/\[REDACTED\]/gi, '')
    .replace(/\[CLASSIFIED\]/gi, '')
    .replace(/\[CONFIDENTIAL\]/gi, '')
    .replace(/\[Insert Current Date\]/gi, '') // Remove date placeholders
    .replace(/\[DATE\]/gi, '')
    .replace(/\[PLACEHOLDER\]/gi, '')
    .replace(/\[.*?\]/g, '') // Remove any remaining bracketed placeholders
    
    // Remove watermark text and disclaimers from body
    .replace(/INTERNET STREETS ENTERTAINMENT/gi, '')
    .replace(/NOT A REAL DOCUMENT/gi, '')
    .replace(/FOR ENTERTAINMENT ONLY/gi, '')
    .replace(/This is a fictional document/gi, '')
    .replace(/For entertainment purposes only/gi, '')
    
    // Remove duplicated field headers (common AI pattern)
    .replace(/Subject Information:\s*\n\s*Name:.*?\n\s*Date of Birth:.*?\n\s*City:.*?\n\s*Occupation:.*?\n/gi, '')
    .replace(/Subject Details:\s*\n\s*Name:.*?\n\s*DOB:.*?\n\s*Location:.*?\n/gi, '')
    .replace(/Personal Information:\s*\n\s*Full Name:.*?\n\s*Date of Birth:.*?\n/gi, '')
    
    // Clean up extra whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Max 2 line breaks
    .replace(/^\s+|\s+$/g, '') // Trim start/end
    .replace(/[ \t]+/g, ' ') // Single spaces only
    
    // Fix common AI artifacts
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`([^`]+)`/g, '$1') // Remove inline code
    .replace(/^\d+\.\s*/gm, '• ') // Convert numbered lists to bullets
    .replace(/^-\s*/gm, '• ') // Convert dashes to bullets
    
    // Ensure proper paragraph breaks
    .replace(/([.!?])\s*([A-Z])/g, '$1\n\n$2')
    
    .trim()
}

/**
 * Extract document metadata from cleaned text
 */
export function extractDocumentMetadata(text: string): {
  title?: string
  subject?: string
  date?: string
  reference?: string
} {
  const metadata: any = {}
  
  // Extract title (usually first line or after "TITLE:")
  const titleMatch = text.match(/^(.*?)(?:\n|$)/m)
  if (titleMatch && titleMatch[1].length > 5 && titleMatch[1].length < 100) {
    metadata.title = titleMatch[1].trim()
  }
  
  // Extract subject/name
  const subjectMatch = text.match(/(?:Subject|Name|Applicant):\s*([^\n]+)/i)
  if (subjectMatch) {
    metadata.subject = subjectMatch[1].trim()
  }
  
  // Extract date
  const dateMatch = text.match(/(?:Date|Issued|Generated):\s*([^\n]+)/i)
  if (dateMatch) {
    metadata.date = dateMatch[1].trim()
  }
  
  // Extract reference number
  const refMatch = text.match(/(?:Reference|Case|File|ID):\s*([^\n]+)/i)
  if (refMatch) {
    metadata.reference = refMatch[1].trim()
  }
  
  return metadata
}

/**
 * Format text for professional PDF rendering
 */
export function formatTextForPdf(text: string): {
  title: string
  content: string
  metadata: any
} {
  const cleaned = cleanGeneratedText(text)
  const metadata = extractDocumentMetadata(cleaned)
  
  // Extract title from first line if not found in metadata
  let title = metadata.title || ''
  if (!title) {
    const lines = cleaned.split('\n')
    const firstLine = lines[0]?.trim()
    if (firstLine && firstLine.length > 5 && firstLine.length < 100) {
      title = firstLine
    }
  }
  
  // Remove title from content if it's the first line
  let content = cleaned
  if (title && content.startsWith(title)) {
    content = content.substring(title.length).trim()
  }
  
  return {
    title: title || 'Document',
    content,
    metadata
  }
}
