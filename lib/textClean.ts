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
 * Clean and structure FBI text with deduplication
 */
export function cleanAndStructureFBI(text: string, inputs: FBIInputs): CleanResult {
  let t = text
    // Strip markdown & separators
    .replace(/\*\*/g, '')
    .replace(/^-{3,}$/gm, '')
    
    // Kill any inline footer artifacts that crept into body
    .replace(/Internet Streets Entertainment.*Page \d+ of \d+/gi, '')
    
    // Remove placeholders
    .replace(/\[(?:Insert )?Current Date\]/gi, '')
    .replace(/\[Analyst Name\]/gi, 'Analyst Unit 42')
    .replace(/\[.*?\]/g, '') // Remove any remaining bracketed placeholders
    
    // Collapse duplicated standalone labels (e.g. "Date of Birth" on its own)
    .replace(/^(Name|Date of Birth|City|Occupation)\s*$/gmi, '')
    
    // Collapse multiple blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  // Ensure we render the subject block from trusted inputs once, not from AI text.
  // Remove any repeated "Subject:" or "Subject Information" blocks in AI body:
  t = t.replace(/^Subject Information[\s\S]*?(?=^\S|\Z)/gmi, '')
       .replace(/^Subject:\s.*$/gmi, '')

  // Normalize common section headers to consistent forms we will detect:
  t = t
    .replace(/^\s*Executive Summary\s*$/gmi, 'EXECUTIVE SUMMARY')
    .replace(/^\s*Key Findings\s*$/gmi, 'KEY FINDINGS')
    .replace(/^\s*Surveillance Activity Log\s*$/gmi, 'SURVEILLANCE ACTIVITY LOG')
    .replace(/^\s*Analyst Notes?\s*$/gmi, 'ANALYST NOTES')
    .replace(/^\s*Threat Assessment.*$/gmi, 'THREAT ASSESSMENT & RECOMMENDATION')

  return { body: t, inputs }
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
 * Load image as base64 data URL (Node.js compatible)
 */
export async function loadImageBase64(url: string, mime = 'image/png'): Promise<string> {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Logo fetch failed: ${url} - ${res.status} ${res.statusText}`)
    }
    const buf = Buffer.from(await res.arrayBuffer())
    return `data:${mime};base64,` + buf.toString('base64')
  } catch (error) {
    console.warn(`Failed to load image from ${url}:`, error)
    throw error
  }
}
