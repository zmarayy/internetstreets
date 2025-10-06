/**
 * Plain Text Prompt Builder with Input Sanitization & Safety
 * Handles field mapping, organization blacklisting, and input validation
 */

import fs from 'fs'
import path from 'path'

// Organization blacklist for safety
const BLOCKED_ORGANIZATIONS = [
  'FBI', 'CIA', 'NSA', 'MI5', 'MI6', 'GCHQ', 'ASIS', 'CSIS',
  'HMRC', 'IRS', 'NASA', 'NHS', 'FBI', 'CIA', 'NSA', 'DOD',
  'Government', 'HM Government', 'HM Revenue', 'Internal Revenue',
  'Central Intelligence', 'Federal Bureau', 'National Security',
  'Department of Defense', 'Ministry of Defence', 'Treasury',
  'HM Treasury', 'Revenue and Customs', 'Tax Office'
]

// Public figures blacklist (partial list)
const BLOCKED_PUBLIC_FIGURES = [
  'Elon Musk', 'Jeff Bezos', 'Bill Gates', 'Barack Obama', 'Donald Trump',
  'Joe Biden', 'Boris Johnson', 'Rishi Sunak', 'Boris Johnson'
]

export interface ServiceConfig {
  slug: string
  name: string
  fields: Array<{
    name: string
    label: string
    type: string
    required: boolean
    placeholder?: string
  }>
  prompt_file: string
  type: string
}

export interface SanitizedInputs {
  [key: string]: string | boolean | number | undefined
  org_sanitized?: boolean
  sanitized_reason?: string
}

/**
 * Load service configuration from services.json
 */
function loadServiceConfig(slug: string): ServiceConfig | null {
  try {
    const servicesPath = path.join(process.cwd(), 'data', 'services.json')
    const servicesData = fs.readFileSync(servicesPath, 'utf8')
    const services = JSON.parse(servicesData)
    return services[slug] || null
  } catch (error) {
    console.error('Error loading service config:', error)
    return null
  }
}

/**
 * Sanitize organization names for safety
 */
function sanitizeOrganizationName(name: string): { sanitized: string; wasSanitized: boolean; reason?: string } {
  const upperName = name.toUpperCase()
  
  for (const blocked of BLOCKED_ORGANIZATIONS) {
    if (upperName.includes(blocked.toUpperCase())) {
      return {
        sanitized: 'Department X',
        wasSanitized: true,
        reason: `Organization name "${name}" contains blocked term "${blocked}"`
      }
    }
  }
  
  return { sanitized: name, wasSanitized: false }
}

/**
 * Sanitize public figure names
 */
function sanitizePublicFigureName(name: string): { sanitized: string; wasSanitized: boolean; reason?: string } {
  const upperName = name.toUpperCase()
  
  for (const blocked of BLOCKED_PUBLIC_FIGURES) {
    if (upperName.includes(blocked.toUpperCase())) {
      return {
        sanitized: 'John Smith',
        wasSanitized: true,
        reason: `Name "${name}" matches blocked public figure "${blocked}"`
      }
    }
  }
  
  return { sanitized: name, wasSanitized: false }
}

/**
 * Build plain text prompt for a service
 */
export async function buildPrompt(
  slug: string, 
  inputs: Record<string, any>, 
  traceId: string
): Promise<{
  success: boolean
  prompt?: string
  sanitizedInputs?: SanitizedInputs
  error?: string
  metadata?: { temperature: number }
}> {
  try {
    console.log(`[${traceId}] Building plain text prompt for service: ${slug}`)
    
    const config = loadServiceConfig(slug)
    if (!config) {
      return { success: false, error: `Service configuration not found for ${slug}` }
    }

    // Load the plain text prompt template
    const promptPath = path.join(process.cwd(), 'prompts', config.prompt_file)
    if (!fs.existsSync(promptPath)) {
      return { success: false, error: `Prompt file not found: ${config.prompt_file}` }
    }

    let promptTemplate = fs.readFileSync(promptPath, 'utf8')
    
    // Sanitize inputs
    const sanitizedInputs: SanitizedInputs = { ...inputs }
    let anySanitized = false
    let sanitizationReason = ''

    // Sanitize organization names
    if (inputs.companyName) {
      const orgResult = sanitizeOrganizationName(inputs.companyName)
      if (orgResult.wasSanitized) {
        sanitizedInputs.companyName = orgResult.sanitized
        sanitizedInputs.org_sanitized = true
        sanitizedInputs.sanitized_reason = orgResult.reason
        anySanitized = true
        sanitizationReason = orgResult.reason || ''
      }
    }

    // Sanitize public figures
    if (inputs.fullName) {
      const nameResult = sanitizePublicFigureName(inputs.fullName)
      if (nameResult.wasSanitized) {
        sanitizedInputs.fullName = nameResult.sanitized
        sanitizedInputs.org_sanitized = true
        sanitizedInputs.sanitized_reason = nameResult.reason
        anySanitized = true
        sanitizationReason = nameResult.reason || ''
      }
    }

    // Replace placeholders in the prompt template
    let finalPrompt = promptTemplate
    for (const [key, value] of Object.entries(sanitizedInputs)) {
      if (value !== undefined && value !== null) {
        const placeholder = `{{${key}}}`
        finalPrompt = finalPrompt.replace(new RegExp(placeholder, 'g'), String(value))
      }
    }

    console.log(`[${traceId}] Plain text prompt built successfully for ${config.name}`)
    if (anySanitized) {
      console.log(`[${traceId}] Inputs sanitized: ${sanitizationReason}`)
    }

    return {
      success: true,
      prompt: finalPrompt,
      sanitizedInputs,
      metadata: { temperature: 0.7 } // Good for natural text generation
    }

  } catch (error) {
    console.error(`[${traceId}] Error building prompt:`, error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Validate required fields for a service
 */
export function validateRequiredFields(
  slug: string, 
  inputs: Record<string, any>
): { valid: boolean; missing: string[] } {
  const config = loadServiceConfig(slug)
  if (!config) {
    return { valid: false, missing: ['Service configuration'] }
  }

  const missing: string[] = []
  config.fields.forEach(field => {
    if (field.required && (inputs[field.name] === undefined || inputs[field.name] === '')) {
      missing.push(field.label || field.name)
    }
  })

  return { valid: missing.length === 0, missing }
}

/**
 * Extract basic metadata from plain text document
 */
export function extractBasicFields(text: string): {
  name?: string
  dob?: string
  city?: string
  companyName?: string
  [key: string]: string | undefined
} {
  const metadata: Record<string, string> = {}

  // Extract name patterns
  const namePatterns = [
    /(?:Name|Full Name|Subject Name|Employee Name|Student Name|Applicant Name)[:\s]+([A-Za-z\s]+)/i,
    /(?:Name|Full Name|Subject Name|Employee Name|Student Name|Applicant Name)[:\s]+([A-Za-z\s]+)/i
  ]
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern)
    if (match) {
      metadata.name = match[1].trim()
      break
    }
  }

  // Extract DOB patterns
  const dobPatterns = [
    /(?:DOB|Date of Birth|Birth Date)[:\s]+(\d{4}-\d{2}-\d{2})/i,
    /(?:DOB|Date of Birth|Birth Date)[:\s]+(\d{2}\/\d{2}\/\d{4})/i,
    /(?:DOB|Date of Birth|Birth Date)[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i
  ]
  
  for (const pattern of dobPatterns) {
    const match = text.match(pattern)
    if (match) {
      metadata.dob = match[1].trim()
      break
    }
  }

  // Extract city patterns
  const cityPatterns = [
    /(?:City|Location|Address)[:\s]+([A-Za-z\s,]+)/i
  ]
  
  for (const pattern of cityPatterns) {
    const match = text.match(pattern)
    if (match) {
      metadata.city = match[1].trim().split(',')[0].trim()
      break
    }
  }

  // Extract company name patterns
  const companyPatterns = [
    /(?:Company|Employer|Organization)[:\s]+([A-Za-z\s&.,]+)/i
  ]
  
  for (const pattern of companyPatterns) {
    const match = text.match(pattern)
    if (match) {
      metadata.companyName = match[1].trim()
      break
    }
  }

  return metadata
}