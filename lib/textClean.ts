/**
 * Text Cleanup and Structure Utilities for Professional PDF Generation
 */

export interface FBIInputs {
  fullName: string
  dateOfBirth: string
  city: string
  occupation: string
}

export interface CleanResult {
  body: string
  inputs: FBIInputs
}

/**
 * Sanitize single line input to prevent field contamination
 */
export function sanitizeSingleLine(v?: string): string {
  if (!v) return ''
  return v.replace(/\r?\n/g, ' ').replace(/[^\w\s.,'-]/g, '').trim() || ''
}

/**
 * Clean body text - remove duplicate headers, subject blocks, and empty placeholders
 */
export function cleanBody(text: string): string {
  let t = text
    .replace(/\*\*/g, '')                  // no markdown bold
    .replace(/^-{3,}$/gm, '')              // no hr lines
    .replace(/Internet Streets.*Page \d+ of \d+/gi, '') // strip leaked footers
    .replace(/\[(?:Insert )?Current Date\]/gi, '')      // strip placeholders
    .trim()

  // Remove repeated top banners or subject blocks from AI text
  t = t.replace(/^FEDERAL BUREAU OF INVESTIGATION.*\n/gi, '')
  t = t.replace(/^Subject Information[\s\S]*?(?=^\S|\Z)/gmi, '')
  t = t.replace(/^Subject:\s.*$/gmi, '')
  
  // Remove empty placeholder lines
  t = t.replace(/^(Name|DOB|City|Occupation):\s*$/gmi, '')
  t = t.replace(/^(Name|Date of Birth|City|Occupation):\s*$/gmi, '')

  // Normalize section headers we expect
  t = t.replace(/^\s*Executive Summary\s*$/gmi, 'EXECUTIVE SUMMARY')
       .replace(/^\s*Key Findings\s*$/gmi, 'KEY FINDINGS')
       .replace(/^\s*Surveillance Activity Log\s*$/gmi, 'SURVEILLANCE ACTIVITY LOG')
       .replace(/^\s*Analyst Notes?\s*$/gmi, 'ANALYST NOTES')
       .replace(/^\s*Threat Assessment.*$/gmi, 'THREAT ASSESSMENT & RECOMMENDATION')

  // Fix double list markers like "1.  - "
  t = t.replace(/^(\d+)\.\s*-\s+/gmi, '$1. ')

  // Normalize line breaks and compress excessive whitespace
  t = t.replace(/\n{3,}/g, '\n\n')

  return t
}

/**
 * Clean and structure FBI text with deduplication
 */
export function cleanAndStructureFBI(text: string, inputs: FBIInputs): CleanResult {
  // Clean the body text first
  const cleanedBody = cleanBody(text)
  
  return { body: cleanedBody, inputs }
}

/**
 * Generic text cleanup for all services
 */
export function cleanGeneric(text: string): string {
  return text
    // Strip markdown formatting
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/^-{3,}$/gm, '')
    
    // Remove inline footer artifacts
    .replace(/Internet Streets Entertainment.*Page \d+ of \d+/gi, '')
    
    // Remove placeholders
    .replace(/\[(?:Insert )?Current Date\]/gi, '')
    .replace(/\[.*?\]/g, '')
    
    // Collapse multiple blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Generate case reference number
 */
export function generateCaseRef(prefix: string): string {
  const year = new Date().getFullYear().toString().slice(-2)
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${year}-${random}-${prefix}`
}

/**
 * Load image as base64 data URL (Node.js compatible) - Optimized with caching
 */
const logoCache = new Map<string, string>()

export async function loadImageBase64(url: string, mime = 'image/png'): Promise<string> {
  // Check cache first
  if (logoCache.has(url)) {
    return logoCache.get(url)!
  }
  
  try {
    const res = await fetch(url, {
      headers: {
        'Cache-Control': 'max-age=3600', // Cache for 1 hour
        'User-Agent': 'InternetStreets-PDF-Generator/1.0'
      }
    })
    if (!res.ok) {
      throw new Error(`Logo fetch failed: ${url} - ${res.status} ${res.statusText}`)
    }
    const buf = Buffer.from(await res.arrayBuffer())
    const dataUrl = `data:${mime};base64,` + buf.toString('base64')
    
    // Cache the result
    logoCache.set(url, dataUrl)
    return dataUrl
  } catch (error) {
    console.warn(`Failed to load image from ${url}:`, error)
    throw error
  }
}
