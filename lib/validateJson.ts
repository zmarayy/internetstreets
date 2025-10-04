/**
 * JSON Validation and Retry Logic
 * Handles OpenAI response validation with automatic retries
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
}

export interface GenerationAttempt {
  prompt: string
  temperature: number
  maxTokens: number
  attemptNumber: number
}

/**
 * Clean OpenAI response - extract JSON from potential noise
 */
function extractJsonFromResponse(response: string): string {
  // Remove any markdown code blocks
  let cleaned = response.replace(/```json\n?/gi, '').replace(/```\n?/gi, '')
  
  // Find the first complete JSON object
  const startIndex = cleaned.indexOf('{')
  if (startIndex === -1) return response
  
  // Count braces to find the end of the object
  let braceCount = 0
  let endIndex = startIndex
  
  for (let i = startIndex; i < cleaned.length; i++) {
    if (cleaned[i] === '{') braceCount++
    if (cleaned[i] === '}') braceCount--
    if (braceCount === 0) {
      endIndex = i + 1
      break
    }
  }
  
  return cleaned.substring(startIndex, endIndex)
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

  // Required fields based on service type
  const requiredFields = {
    'fbi-file': ['document_title', 'subject', 'case_number'],
    'nsa-surveillance': ['document_title', 'subject', 'case_number'],
    'criminal-record': ['document_title', 'subject', 'case_number'],
    'universal-credit': ['document_title', 'applicant', 'case_ref'],
    'payslip': ['document_title', 'employee', 'employer', 'amounts'],
    'credit-score': ['document_title', 'subject', 'credit_summary'],
    'job-rejection': ['document_title', 'applicant', 'specific_reasons'],
    'rent-reference': ['document_title', 'tenant_information', 'reference_assessment'],
    'school-report': ['document_title', 'student_information', 'academic_performance'],
    'college-degree': ['document_title', 'student_information', 'degree_details']
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
 * Generate single attempt with OpenAI
 */
async function generateSingleAttempt(attempt: GenerationAttempt, traceId: string): Promise<ValidationResult> {
  try {
    console.log(`[${traceId}] OpenAI attempt ${attempt.attemptNumber}: generating response`)
    
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

    const rawResponse = response.choices[0]?.message?.content?.trim() || ''
    
    if (!rawResponse) {
      return {
        success: false,
        error: 'Empty response from OpenAI',
        retries: attempt.attemptNumber - 1,
        rawResponse
      }
    }

    console.log(`[${traceId}] Received ${rawResponse.length} chars from OpenAI`)
    
    // Extract clean JSON
    const cleanedJson = extractJsonFromResponse(rawResponse)
    
    // Parse JSON
    try {
      const parsedJson = JSON.parse(cleanedJson)
      return {
        success: true,
        data: parsedJson,
        rawResponse
      }
    } catch (parseError) {
      return {
        success: false,
        error: `JSON parse error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
        retries: attempt.attemptNumber - 1,
        rawResponse
      }
    }

  } catch (openaiError) {
    console.error(`[${traceId}] OpenAI error in attempt ${attempt.attemptNumber}:`, openaiError)
    return {
      success: false,
      error: `OpenAI API error: ${openaiError instanceof Error ? openaiError.message : 'Unknown error'}`,
      retries: attempt.attemptNumber - 1
    }
  }
}

/**
 * Create retry prompt for failed attempts
 */
function createRetryPrompt(originalPrompt: string, errorMessage: string, attemptNumber: number): string {
  const retryInstructions = [
    attemptNumber === 2 ? 'STRICT JSON ONLY - NO COMMENTARY' : 'ENSURE VALID JSON OUTPUT',
    'Remove any text outside the JSON object',
    'Ensure all required fields are present',
    'Use proper JSON syntax with correct quotes and brackets'
  ].join('. ')
  
  return `${originalPrompt}\n\nRETRY INSTRUCTIONS (Attempt ${attemptNumber}): ${retryInstructions}`
}

/**
 * Main validation function with retry logic
 */
export async function validateAndGenerateJson(
  prompt: string,
  temperature: number,
  serviceSlug: string,
  traceId: string,
  maxRetries: number = 2
): Promise<ValidationResult> {
  
  console.log(`[${traceId}] Starting JSON validation for ${serviceSlug}`)
  
  let lastError = ''
  let totalRetries = 0
  let finalRawResponse = ''

  // Initial attempt
  const attempts: GenerationAttempt[] = [
    {
      prompt,
      temperature,
      maxTokens: 450,
      attemptNumber: 1
    }
  ]

  // Add retry attempts if needed
  for (let i = 1; i <= maxRetries; i++) {
    attempts.push({
      prompt: createRetryPrompt(prompt, lastError, i + 1),
      temperature: Math.max(0.1, temperature - 0.1 * i), // Reduce temperature slightly for retries
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
      console.log(`[${traceId}] Attempt ${attempt.attemptNumber} failed: ${lastError}`)
      
      // If this is the last attempt, return the failure
      if (attempt.attemptNumber > maxRetries + 1) {
        return {
          success: false,
          error: `Failed after ${maxRetries} retries: ${lastError}`,
          retries: totalRetries,
          rawResponse: finalRawResponse
        }
      }
      
      // Wait briefly before retry
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
      console.log(`[${traceId}] Structure validation failed: ${lastError}`)
      
      // If this is the last attempt, return the failure
      if (attempt.attemptNumber > maxRetries + 1) {
        return {
          success: false,
          error: lastError,
          retries: totalRetries,
          rawResponse: finalRawResponse
        }
      }
      
      // Retry with validation failure info
      continue
    }

    // Success!
    console.log(`[${traceId}] Successfully validated JSON after ${totalRetries} retries`)
    return {
      success: true,
      data: result.data,
      retries: totalRetries,
      rawResponse: result.rawResponse
    }
  }

  // Fallback error
  return {
    success: false,
    error: 'All validation attempts failed',
    retries: totalRetries,
    rawResponse: finalRawResponse
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
