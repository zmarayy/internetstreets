/**
 * Plain Text Validation and Retry Logic - Optimized for Speed
 * Handles OpenAI response validation for natural text documents
 */

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 15000, // 15 second timeout for entire request
  maxRetries: 1   // Reduce retries at SDK level
})

export interface ValidationResult {
  success: boolean
  data?: string
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
 * Validate plain text response quality
 */
function validateTextQuality(text: string): { valid: boolean; issues: string[] } {
  const issues: string[] = []
  
  // Check minimum length (increased to 300 as requested)
  if (text.length < 300) {
    issues.push('Response too short (less than 300 characters)')
  }
  
  // Check for empty or whitespace-only response
  if (text.trim().length === 0) {
    issues.push('Empty response')
  }
  
  // Check for obvious AI artifacts (code blocks)
  if (text.includes('```') || text.includes('```json') || text.includes('```markdown')) {
    issues.push('Response contains code blocks instead of plain text')
  }
  
  // Check for JSON-like structure (basic check)
  if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
    issues.push('Response appears to be JSON instead of plain text')
  }
  
  // REMOVED: All structural checks - accept any natural language text
  // No more checks for headings, document structure, etc.
  
  return { valid: issues.length === 0, issues }
}

/**
 * Generate single attempt with OpenAI - Optimized for speed
 */
async function generateSingleAttempt(attempt: GenerationAttempt, traceId: string): Promise<ValidationResult> {
  try {
    const startTime = Date.now()
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: attempt.prompt
        }
      ],
      temperature: attempt.temperature,
      max_tokens: 1200, // Reduced from 2000 for faster generation
      stream: false // Ensure no streaming overhead
    })

    const duration = Date.now() - startTime
    const rawResponse = response.choices[0]?.message?.content?.trim() || ''
    
    // Minimal logging for performance
    if (duration > 5000) {
      console.log(`[${traceId}] Slow OpenAI response: ${duration}ms, ${rawResponse.length} chars`)
    }
    
    if (!rawResponse) {
      return {
        success: false,
        error: 'Empty response from OpenAI',
        retries: attempt.attemptNumber,
        rawResponse: ''
      }
    }

    // Validate text quality
    const qualityCheck = validateTextQuality(rawResponse)
    if (!qualityCheck.valid) {
      return {
        success: false,
        error: `Text quality issues: ${qualityCheck.issues.join(', ')}`,
        retries: attempt.attemptNumber,
        rawResponse
      }
    }

    return {
      success: true,
      data: rawResponse,
      retries: attempt.attemptNumber,
      rawResponse
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return {
      success: false,
      error: `OpenAI generation failed: ${errorMessage}`,
      retries: attempt.attemptNumber,
      rawResponse: ''
    }
  }
}

/**
 * Validate and generate plain text with optimized retry logic
 */
export async function validateAndGenerateText(
  prompt: string,
  temperature: number = 0.7,
  serviceSlug: string,
  traceId: string,
  maxRetries: number = 2 // Reduced from 3 to 2
): Promise<ValidationResult> {
  const startTime = Date.now()
  
  // Create attempts with optimized settings
  const attempts: GenerationAttempt[] = []
  for (let i = 1; i <= maxRetries; i++) {
    attempts.push({
      prompt,
      temperature: i === 1 ? temperature : Math.min(temperature + 0.1, 0.8), // Smaller temp increase
      maxTokens: 1200, // Reduced for faster generation
      attemptNumber: i
    })
  }

  for (const attempt of attempts) {
    const result = await generateSingleAttempt(attempt, traceId)
    
    if (result.success) {
      const totalTime = Date.now() - startTime
      if (totalTime > 10000) {
        console.log(`[${traceId}] OpenAI generation completed in ${totalTime}ms`)
      }
      return result
    }
    
    // If this was the last attempt, return the failure
    if (attempt.attemptNumber === maxRetries) {
      return {
        success: false,
        error: `All validation attempts failed. Last error: ${result.error}`,
        retries: maxRetries,
        rawResponse: result.rawResponse
      }
    }
    
    // Reduced wait time between attempts
    await new Promise(resolve => setTimeout(resolve, 500)) // Reduced from 1000ms
  }

  return {
    success: false,
    error: 'Unexpected error in validation loop',
    retries: maxRetries
  }
}
