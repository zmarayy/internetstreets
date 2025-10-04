/**
 * Prompt Builder with Input Sanitization & Safety
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
    const services = JSON.parse(fs.readFileSync(servicesPath, 'utf-8'))
    return services[slug] || null
  } catch (error) {
    console.error('Failed to load service config:', error)
    return null
  }
}

/**
 * Check if input contains blocked organizations or public figures
 */
function checkBlacklists(inputs: Record<string, any>): { 
  sanitized: boolean, 
  reason?: string, 
  sanitizedInputs: Record<string, any> 
} {
  let sanitized = false
  let reason = ''
  const sanitizedInputs = { ...inputs }

  // Check all string inputs for blocked content
  Object.entries(inputs).forEach(([key, value]) => {
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase()
      
      // Check organization blacklist
      for (const blockedOrg of BLOCKED_ORGANIZATIONS) {
        if (lowerValue.includes(blockedOrg.toLowerCase())) {
          sanitizedInputs[key] = 'Organization Name Redacted'
          sanitizedInputs.org_sanitized = true
          sanitizedInputs.sanitized_reason = `Blocked organization: ${blockedOrg}`
          sanitized = true
          reason = `Organization name sanitized (${blockedOrg} detected)`
        }
      }
      
      // Check public figures blacklist
      for (const figure of BLOCKED_PUBLIC_FIGURES) {
        if (lowerValue.includes(figure.toLowerCase())) {
          sanitizedInputs[key] = 'Name Redacted for Privacy'
          sanitizedInputs.figure_sanitized = true
          sanitizedInputs.sanitized_reason = `Blocked public figure: ${figure}`
          sanitized = true
          reason = `Public figure name sanitized (${figure} detected)`
        }
      }
    }
  })

  return { sanitized, reason, sanitizedInputs }
}

/**
 * Sanitize and validate form inputs
 */
function sanitizeInputs(inputs: Record<string, any>): SanitizedInputs {
  const sanitized: SanitizedInputs = {}
  
  Object.entries(inputs).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // Trim whitespace and limit length
      sanitized[key] = value.trim().slice(0, 200)
    } else if (typeof value === 'number') {
      // Validate numeric inputs
      sanitized[key] = Math.max(0, Math.min(value, 999999999)) // Reasonable bounds
    } else {
      sanitized[key] = value
    }
  })

  return sanitized
}

/**
 * Map form field names to prompt placeholders
 */
function mapFieldsToPlaceholders(config: ServiceConfig, inputs: SanitizedInputs): Record<string, string> {
  const mappedInputs: Record<string, string> = {}
  
  config.fields.forEach(field => {
    if (inputs[field.name] !== undefined) {
      mappedInputs[field.name] = String(inputs[field.name])
    }
  })

  return mappedInputs
}

/**
 * Build prompt content with placeholders replaced
 */
function buildPromptWithInputs(promptTemplate: string, inputs: Record<string, string>): string {
  let builtPrompt = promptTemplate
  
  // Replace all placeholders with actual input values
  Object.entries(inputs).forEach(([fieldName, value]) => {
    const placeholder = `{{${fieldName}}}`
    builtPrompt = builtPrompt.replace(new RegExp(placeholder, 'g'), value)
  })

  return builtPrompt
}

/**
 * Load prompt template file
 */
function loadPromptTemplate(promptFile: string): string | null {
  try {
    const promptPath = path.join(process.cwd(), 'prompts', promptFile)
    return fs.readFileSync(promptPath, 'utf-8')
  } catch (error) {
    console.error(`Failed to load prompt template ${promptFile}:`, error)
    return null
  }
}

/**
 * Main function: Build sanitized prompt for OpenAI
 */
export async function buildPrompt(
  slug: string, 
  userInputs: Record<string, any>,
  traceId: string
): Promise<{
  success: boolean
  prompt?: string
  sanitizedInputs?: SanitizedInputs
  metadata?: any
  error?: string
}> {
  try {
    console.log(`[${traceId}] Building prompt for service: ${slug}`)
    
    // Load service configuration
    const config = loadServiceConfig(slug)
    if (!config) {
      return { success: false, error: `Service '${slug}' not found` }
    }

    // Sanitize inputs
    let sanitizedInputs = sanitizeInputs(userInputs)
    
    // Check blacklists
    const blacklistCheck = checkBlacklists(sanitizedInputs)
    if (blacklistCheck.sanitized) {
      sanitizedInputs = blacklistCheck.sanitizedInputs
      console.log(`[${traceId}] Input sanitized: ${blacklistCheck.reason}`)
    }

    // Map fields to prompt placeholders
    const mappedInputs = mapFieldsToPlaceholders(config, sanitizedInputs)
    
    // Load prompt template
    const promptTemplate = loadPromptTemplate(config.prompt_file)
    if (!promptTemplate) {
      return { success: false, error: `Prompt template for '${slug}' not found` }
    }

    // Build final prompt
    const finalPrompt = buildPromptWithInputs(promptTemplate, mappedInputs)
    
    // Extract temperature from prompt
    let temperature = 0.5 // Default
    const tempMatch = finalPrompt.match(/Temperature\s+([\d.]+)/i)
    if (tempMatch) {
      temperature = parseFloat(tempMatch[1])
    }

    const metadata = {
      slug,
      serviceName: config.name,
      temperature,
      maxTokens: 450,
      sanitized: blacklistCheck.sanitized,
      sanitizationReason: blacklistCheck.reason,
      inputFields: Object.keys(mappedInputs)
    }

    console.log(`[${traceId}] Prompt built successfully for ${config.name}`)
    
    return {
      success: true,
      prompt: finalPrompt,
      sanitizedInputs,
      metadata
    }

  } catch (error) {
    console.error(`[${traceId}] Error building prompt:`, error)
    return { 
      success: false, 
      error: `Failed to build prompt: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

/**
 * Validate that critical fields are present
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
