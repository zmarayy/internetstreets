/**
 * JSON Validation and Retry Logic with Robust JSON Repair
 * Handles OpenAI response validation with automatic repair and retries
 */

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export interface ValidationResult {
  success: boolean
  data?: any
  error?: string
  retries?: number
  rawResponse?: string
  repairAttempted?: boolean
}

export interface GenerationAttempt {
  prompt: string
  temperature: number
  maxTokens: number
  attemptNumber: number
}

/**
 * Comprehensive JSON repair function
 */
function repairJson(jsonString: string): { repaired: boolean; json: string } {
  try {
    let repaired = jsonString.trim()
    
    // Remove any markdown code blocks first
    repaired = repaired.replace(/```json\n?/gi, '').replace(/```\n?/gi, '')
    repaired = repaired.replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*?$/, '$1') // Extract main JSON object
    
    // Strip leading/trailing non-JSON text
    const startIndex = repaired.indexOf('{')
    if (startIndex === -1) return { repaired: false, json: jsonString }
    
    let endIndex = repaired.lastIndexOf('}')
    if (endIndex <= startIndex) return { repaired: false, json: jsonString }
    
    repaired = repaired.substring(startIndex, endIndex + 1)
    
    // Count braces to ensure completeness
    let braceCount = 0
    let bracketCount = 0
    let complete = true
    
    for (let i = 0; i < repaired.length; i++) {
      if (repaired[i] === '{') braceCount++
      if (repaired[i] === '}') braceCount--
      if (repaired[i] === '[') bracketCount++
      if (repaired[i] === ']') bracketCount--
    }
    
    // Repair attempts
    const repairs = [
      // Remove trailing commas before closing braces/brackets
      () => repaired.replace(/,(\s*[}\]])/g, '$1'),
      
      // Fix unclosed strings (add closing quote at end if missing)
      () => repaired.replace(/"([^"]*)$/, '"$1"'),
      
      // Fix unclosed arrays/objects (close them)
      () => {
        let fixed = repaired
        for (let i = 0; i < bracketCount; i++) fixed += ']'
        for (let i = 0; i < braceCount; i++) fixed += '}'
        return fixed
      },
      
      // Fix boolean/null values (replace malformed ones)
      () => repaired.replace(/\b(True|False)\b/g, (match) => match === 'True' ? 'true' : 'false'),
      
      // Fix number format issues
      () => repaired.replace(/:\s*([a-zA-Z].*?)(\s*[,\}])/g, ': "$1"$2'),
      
      // Ensure string values are quoted
      () => repaired.replace(/:\s*([^",{}\[\]]+?)(\s*[,\}])/g, (match, value, suffix) => {
        const trimmed = value.trim()
        if (/^(true|false|null|[0-9.-]+)$/.test(trimmed)) return match
        return `: "${trimmed}"${suffix}`
      })
    ]
    
    // Try each repair in sequence
    for (const repair of repairs) {
      try {
        const attempted = repair()
        // Quick validation test
        JSON.parse(attempted)
        repaired = attempted
        console.log('JSON repair successful using repair function')
      } catch (e) {
        // Continue to next repair
      }
    }
    
    return { repaired: true, json: repaired }
    
  } catch (error) {
    console.error('JSON repair failed:', error)
    return { repaired: false, json: jsonString }
  }
}

/**
 * Smart JSON extraction and repair
 */
function extractAndRepairJson(response: string): { success: boolean; data?: any; repaired?: boolean; error?: string } {
  try {
    // First, try direct parsing
    const directParse = JSON.parse(response)
    return { success: true, data: directParse }
  } catch (e) {
    console.log('Direct JSON parse failed, attempting repair...')
    
    // Attempt repair
    const repair = repairJson(response)
    if (!repair.repaired) {
      return { success: false, error: 'Unable to repair malformed JSON' }
    }
    
    try {
      const repairedData = JSON.parse(repair.json)
      console.log('JSON repair successful')
      return { success: true, data: repairedData, repaired: true }
    } catch (parseError) {
      return { success: false, error: `JSON repair failed: ${parseError instanceof Error ? parseError.message : 'Unknown error'}` }
    }
  }
}

/**
 * Validate JSON structure against expected schema
 */
function validateJsonStructure(jsonData: any, serviceSlug: string): { valid: boolean; issues: string[] } {
  const issues: string[] = []
  
  // Basic validation checks
  if (!jsonData || typeof jsonData !== 'object') {
    issues.push('Response is not a valid JSON object')
    return { valid: false, issues }
  }

  // Required fields based on service type (updated for hybrid structured+narrative)
  const requiredFields = {
    'fbi-file': ['structured', 'narrative'],
    'nsa-surveillance': ['structured', 'narrative'],
    'criminal-record': ['structured', 'narrative'],
    'universal-credit': ['structured', 'narrative'],
    'payslip': ['structured', 'narrative'],
    'credit-score': ['structured', 'narrative'],
    'job-rejection': ['structured', 'narrative'],
    'rent-reference': ['structured', 'narrative'],
    'school-behaviour': ['structured', 'narrative'],
    'college-degree': ['structured', 'narrative']
  }

  const serviceRequiredFields = requiredFields[serviceSlug as keyof typeof requiredFields] || []
  
  serviceRequiredFields.forEach(field => {
    if (!(field in jsonData)) {
      issues.push(`Missing required field: ${field}`)
    }
  })

  // Validate critical string fields aren't empty
  Object.keys(jsonData).forEach(key => {
    if (typeof jsonData[key] === 'string' && jsonData[key].trim() === '') {
      issues.push(`Empty value for field: ${key}`)
    }
  })

  return { valid: issues.length === 0, issues }
}

/**
 * Generate single attempt with OpenAI (increased timeout)
 */
async function generateSingleAttempt(attempt: GenerationAttempt, traceId: string): Promise<ValidationResult> {
  try {
    console.log(`[${traceId}] OpenAI attempt ${attempt.attemptNumber}: generating response`)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: attempt.prompt
        }
      ],
      temperature: attempt.temperature,
      max_tokens: attempt.maxTokens
    })

    clearTimeout(timeoutId)
    
    const rawResponse = response.choices[0]?.message?.content?.trim() || ''
    console.log(`[${traceId}] OpenAI response length: ${rawResponse.length} chars`)
    console.log(`[${traceId}] OpenAI response preview: ${rawResponse.substring(0, 200)}...`)
    
    if (!rawResponse) {
      return {
        success: false,
        error: 'Empty response from OpenAI',
        retries: attempt.attemptNumber - 1,
        rawResponse
      }
    }

    console.log(`[${traceId}] Received ${rawResponse.length} chars from OpenAI`)
    
    // Try extraction and repair
    const jsonResult = extractAndRepairJson(rawResponse)
    
    if (!jsonResult.success) {
      return {
        success: false,
        error: jsonResult.error || 'JSON extraction/repair failed',
        retries: attempt.attemptNumber - 1,
        rawResponse,
        repairAttempted: true
      }
    }

    return {
      success: true,
      data: jsonResult.data,
      rawResponse,
      repairAttempted: jsonResult.repaired
    }

  } catch (openaiError) {
    console.error(`[${traceId}] OpenAI error in attempt ${attempt.attemptNumber}:`, openaiError)
    
    const errorMessage = openaiError instanceof Error ? openaiError.message : 'Unknown error'
    const isTimeout = errorMessage.includes('AbortError') || errorMessage.includes('timeout')
    
    return {
      success: false,
      error: `OpenAI API ${isTimeout ? 'timeout' : 'error'}: ${errorMessage}`,
      retries: attempt.attemptNumber - 1
    }
  }
}

/**
 * Create retry prompt with ultra-strict instructions
 */
function createRetryPrompt(originalPrompt: string, attemptNumber: number): string {
  const retryInstructions = [
    'You MUST ONLY respond with one valid JSON object.',
    'No commentary, no Markdown, no explanations.',
    'JSON must strictly follow the provided schema.',
    'If unsure, output empty arrays/strings, but do not add text outside JSON.',
    `Attempt ${attemptNumber}: Return STRICT JSON only - NO COMMENTARY`
  ].join(' ')
  
  return `${originalPrompt}\n\nRETRY INSTRUCTIONS: ${retryInstructions}`
}

/**
 * Main validation function with repair and retry logic
 */
export async function validateAndGenerateJson(
  prompt: string,
  temperature: number,
  serviceSlug: string,
  traceId: string,
  maxRetries: number = 3
): Promise<ValidationResult> {
  
  console.log(`[${traceId}] Starting JSON validation for ${serviceSlug}`)
  
  // Ensure prompt starts with ultra-strict instructions
  const strictPrompt = `You MUST ONLY respond with one valid JSON object. No commentary, no Markdown, no explanations. JSON must strictly follow this schema:\n\n${prompt}\n\nIf unsure, output empty arrays/strings, but do not add text outside JSON.`
  
  let lastError = ''
  let totalRetries = 0
  let repairAttempted = false
  let finalRawResponse = ''

  // Initial attempt
  const attempts: GenerationAttempt[] = [
    {
      prompt: strictPrompt,
      temperature,
      maxTokens: 450,
      attemptNumber: 1
    }
  ]

  // Add retry attempts if needed
  for (let i = 1; i <= maxRetries; i++) {
    attempts.push({
      prompt: createRetryPrompt(strictPrompt, i + 1),
      temperature: Math.max(0.1, temperature - 0.1 * i), // Reduce temperature for retries
      maxTokens: 450,
      attemptNumber: i + 1
    })
  }

  // Execute attempts
  for (const attempt of attempts) {
    const result = await generateSingleAttempt(attempt, traceId)
    totalRetries = attempt.attemptNumber - 1
    
    if (!result.success) {
      lastError = result.error || 'Unknown error'
      finalRawResponse = result.rawResponse || ''
      repairAttempted = repairAttempted || !!result.repairAttempted
      
      console.log(`[${traceId}] Attempt ${attempt.attemptNumber} failed: ${lastError}`)
      
      // If this is a timeout, retry immediately without delay
      if (lastError.includes('timeout')) {
        continue
      }
      
      // If this is the last attempt, return the failure
      if (attempt.attemptNumber > maxRetries + 1) {
        return {
          success: false,
          error: `Failed after ${maxRetries} retries: ${lastError}`,
          retries: totalRetries,
          rawResponse: finalRawResponse,
          repairAttempted
        }
      }
      
      // Wait briefly before retry (except for timeouts)
      if (attempt.attemptNumber <= maxRetries + 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      continue
    }

    // Success - validate the JSON structure
    const structureValidation = validateJsonStructure(result.data, serviceSlug)
    
    if (!structureValidation.valid) {
      lastError = `Validation failed: ${structureValidation.issues.join(', ')}`
      finalRawResponse = result.rawResponse || ''
      repairAttempted = repairAttempted || !!result.repairAttempted
      console.log(`[${traceId}] Structure validation failed: ${lastError}`)
      
      // If this is the last attempt, return the failure
      if (attempt.attemptNumber > maxRetries + 1) {
        return {
          success: false,
          error: lastError,
          retries: totalRetries,
          rawResponse: finalRawResponse,
          repairAttempted
        }
      }
      
      // Retry with validation failure info
      continue
    }

    // Success!
    console.log(`[${traceId}] Successfully validated JSON after ${totalRetries} retries${repairAttempted ? ' with JSON repair' : ''}`)
    return {
      success: true,
      data: result.data,
      retries: totalRetries,
      rawResponse: result.rawResponse,
      repairAttempted
    }
  }

  // Fallback error
  return {
    success: false,
    error: 'All validation attempts failed',
    retries: totalRetries,
    rawResponse: finalRawResponse,
    repairAttempted
  }
}

/**
 * Quick validation for already-parsed JSON
 */
export function validateJsonOnly(jsonData: any, serviceSlug: string): ValidationResult {
  const structureValidation = validateJsonStructure(jsonData, serviceSlug)
  
  return {
    success: structureValidation.valid,
    data: structureValidation.valid ? jsonData : null,
    error: structureValidation.valid ? undefined : structureValidation.issues.join(', ')
  }
}