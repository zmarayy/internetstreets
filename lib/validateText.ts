/**
 * Plain Text Validation and Retry Logic
 * Handles OpenAI response validation for natural text documents
 */

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
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
  
  // Check minimum length
  if (text.length < 200) {
    issues.push('Response too short (less than 200 characters)')
  }
  
  // Check for empty or whitespace-only response
  if (text.trim().length === 0) {
    issues.push('Empty response')
  }
  
  // Check for obvious AI artifacts
  if (text.includes('```') || text.includes('```json') || text.includes('```markdown')) {
    issues.push('Response contains code blocks instead of plain text')
  }
  
  // Check for JSON-like structure
  if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
    issues.push('Response appears to be JSON instead of plain text')
  }
  
  // Check for proper document structure (should have some headings or sections)
  const hasHeadings = /^[A-Z][A-Za-z\s]+:?\s*$/m.test(text) || 
                     /^[A-Z][A-Za-z\s]+:?\s*$/m.test(text) ||
                     text.includes('Title:') ||
                     text.includes('Subject:') ||
                     text.includes('Date:') ||
                     text.includes('Reference:')
  
  if (!hasHeadings && text.length > 500) {
    issues.push('Response lacks proper document structure')
  }
  
  return { valid: issues.length === 0, issues }
}

/**
 * Generate single attempt with OpenAI
 */
async function generateSingleAttempt(attempt: GenerationAttempt, traceId: string): Promise<ValidationResult> {
  try {
    console.log(`[${traceId}] OpenAI attempt ${attempt.attemptNumber}: generating plain text response`)
    
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
        retries: attempt.attemptNumber,
        rawResponse: ''
      }
    }

    // Validate text quality
    const qualityCheck = validateTextQuality(rawResponse)
    if (!qualityCheck.valid) {
      console.log(`[${traceId}] Text quality validation failed: ${qualityCheck.issues.join(', ')}`)
      return {
        success: false,
        error: `Text quality issues: ${qualityCheck.issues.join(', ')}`,
        retries: attempt.attemptNumber,
        rawResponse
      }
    }

    console.log(`[${traceId}] Plain text validation successful`)
    return {
      success: true,
      data: rawResponse,
      retries: attempt.attemptNumber,
      rawResponse
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[${traceId}] OpenAI generation error:`, errorMessage)
    
    return {
      success: false,
      error: `OpenAI generation failed: ${errorMessage}`,
      retries: attempt.attemptNumber,
      rawResponse: ''
    }
  }
}

/**
 * Validate and generate plain text with retry logic
 */
export async function validateAndGenerateText(
  prompt: string,
  temperature: number = 0.7,
  serviceSlug: string,
  traceId: string,
  maxRetries: number = 3
): Promise<ValidationResult> {
  console.log(`[${traceId}] Starting plain text generation for ${serviceSlug}`)
  
  const attempts: GenerationAttempt[] = []
  
  // Create attempts with varying temperature for retries
  for (let i = 1; i <= maxRetries; i++) {
    attempts.push({
      prompt,
      temperature: i === 1 ? temperature : Math.min(temperature + (i * 0.1), 0.9),
      maxTokens: 2000, // Increased for longer documents
      attemptNumber: i
    })
  }

  for (const attempt of attempts) {
    console.log(`[${traceId}] Attempt ${attempt.attemptNumber}/${maxRetries}`)
    
    const result = await generateSingleAttempt(attempt, traceId)
    
    if (result.success) {
      console.log(`[${traceId}] Plain text generation successful on attempt ${attempt.attemptNumber}`)
      return result
    }
    
    console.log(`[${traceId}] Attempt ${attempt.attemptNumber} failed: ${result.error}`)
    
    // If this was the last attempt, return the failure
    if (attempt.attemptNumber === maxRetries) {
      console.error(`[${traceId}] All ${maxRetries} attempts failed`)
      return {
        success: false,
        error: `All validation attempts failed. Last error: ${result.error}`,
        retries: maxRetries,
        rawResponse: result.rawResponse
      }
    }
    
    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, 1000 * attempt.attemptNumber))
  }

  return {
    success: false,
    error: 'Unexpected error in validation loop',
    retries: maxRetries
  }
}
