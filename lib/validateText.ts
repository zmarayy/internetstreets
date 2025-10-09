/**
 * Plain Text Validation and Retry Logic - Optimized for Speed
 * Handles OpenAI response validation for natural text documents
 */

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 10000, // Reduced to 10 seconds for faster failure
  maxRetries: 0   // No retries at SDK level - we handle retries manually
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
 * Generate single attempt with OpenAI - Enhanced timeout debugging
 */
async function generateSingleAttempt(attempt: GenerationAttempt, traceId: string): Promise<ValidationResult> {
  try {
    console.log(`[${traceId}] 🔄 OpenAI attempt ${attempt.attemptNumber}: Making API call to OpenAI`)
    console.log(`[${traceId}] 📝 Prompt length: ${attempt.prompt.length} characters`)
    console.log(`[${traceId}] ⚙️ Settings: temp=${attempt.temperature}, max_tokens=${attempt.maxTokens}`)
    console.log(`[${traceId}] 🔑 API Key present: ${process.env.OPENAI_API_KEY ? 'YES' : 'NO'}`)
    
    const startTime = Date.now()
    
    // Add manual timeout wrapper
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Manual timeout after 8 seconds`))
      }, 8000)
    })
    
    const apiCallPromise = openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: attempt.prompt
        }
      ],
      temperature: attempt.temperature,
      max_tokens: 1200,
      stream: false
    })
    
    console.log(`[${traceId}] ⏱️ Starting API call with 8-second manual timeout...`)
    
    const response = await Promise.race([apiCallPromise, timeoutPromise])

    const duration = Date.now() - startTime
    const rawResponse = response.choices[0]?.message?.content?.trim() || ''
    
    console.log(`[${traceId}] ✅ OpenAI API call completed in ${duration}ms`)
    console.log(`[${traceId}] 📊 Response length: ${rawResponse.length} characters`)
    console.log(`[${traceId}] 📄 Response preview: ${rawResponse.substring(0, 200)}...`)
    
    if (!rawResponse) {
      console.log(`[${traceId}] ❌ Empty response from OpenAI`)
      return {
        success: false,
        error: 'Empty response from OpenAI',
        retries: attempt.attemptNumber,
        rawResponse: ''
      }
    }

    console.log(`[${traceId}] 🔍 Validating text quality...`)
    // Validate text quality
    const qualityCheck = validateTextQuality(rawResponse)
    if (!qualityCheck.valid) {
      console.log(`[${traceId}] ❌ Text quality validation failed: ${qualityCheck.issues.join(', ')}`)
      return {
        success: false,
        error: `Text quality issues: ${qualityCheck.issues.join(', ')}`,
        retries: attempt.attemptNumber,
        rawResponse
      }
    }

    console.log(`[${traceId}] ✅ Text quality validation passed`)
    return {
      success: true,
      data: rawResponse,
      retries: attempt.attemptNumber,
      rawResponse
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.log(`[${traceId}] ❌ OpenAI API call failed: ${errorMessage}`)
    console.log(`[${traceId}] 🔍 Error type: ${error instanceof Error ? error.constructor.name : typeof error}`)
    
    // Check if it's a timeout error
    if (errorMessage.includes('timeout')) {
      console.log(`[${traceId}] ⏰ TIMEOUT ERROR - API call took too long`)
    }
    
    return {
      success: false,
      error: `OpenAI generation failed: ${errorMessage}`,
      retries: attempt.attemptNumber,
      rawResponse: ''
    }
  }
}

/**
 * Validate and generate plain text with detailed logging
 */
export async function validateAndGenerateText(
  prompt: string,
  temperature: number = 0.7,
  serviceSlug: string,
  traceId: string,
  maxRetries: number = 1 // Reduced to 1 for faster failure
): Promise<ValidationResult> {
  const startTime = Date.now()
  console.log(`[${traceId}] 🚀 Starting OpenAI generation for ${serviceSlug}`)
  console.log(`[${traceId}] 📋 Max retries: ${maxRetries}`)
  
  // TEST MODE: Bypass OpenAI for debugging
  if (process.env.TEST_MODE === 'true') {
    console.log(`[${traceId}] 🧪 TEST MODE: Bypassing OpenAI API call`)
    const mockResponse = `FEDERAL BUREAU OF INVESTIGATION — INTELLIGENCE DOSSIER

CASE REF: FBI-2024-001234 DATE: ${new Date().toLocaleDateString('en-GB')}

Subject Information:
Name: Test Subject
Date of Birth: 1990-01-01
City: Test City
Occupation: Test Occupation

EXECUTIVE SUMMARY
This is a test document generated in test mode. The subject has been under investigation for potential activities that require further monitoring and analysis.

KEY FINDINGS
• Subject exhibits patterns consistent with routine behavior
• No immediate threats identified at this time
• Continued surveillance recommended
• Additional intelligence gathering required
• Subject maintains low profile in community

SURVEILLANCE ACTIVITY LOG
1. 2024-01-15 09:30 - Subject observed leaving residence
2. 2024-01-15 14:20 - Subject visited local business district
3. 2024-01-16 08:45 - Subject engaged in routine activities
4. 2024-01-16 16:30 - Subject returned to residence
5. 2024-01-17 10:15 - Subject met with unidentified individual
6. 2024-01-17 15:45 - Subject conducted routine errands
7. 2024-01-18 09:00 - Subject maintained normal schedule
8. 2024-01-18 17:20 - Subject concluded daily activities

ANALYST NOTES
Based on current intelligence gathering, the subject appears to be maintaining a normal routine. No suspicious activities have been observed that would warrant immediate intervention. Continued monitoring is recommended to establish patterns and identify any potential threats.

THREAT ASSESSMENT & RECOMMENDATION
Current threat level: LOW
Recommendation: Continue surveillance operations and maintain current monitoring protocols.`
    
    console.log(`[${traceId}] ✅ Test mode response generated (${mockResponse.length} chars)`)
    return {
      success: true,
      data: mockResponse,
      retries: 0,
      rawResponse: mockResponse
    }
  }
  
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
    console.log(`[${traceId}] 🔄 Starting attempt ${attempt.attemptNumber}/${maxRetries}`)
    
    const result = await generateSingleAttempt(attempt, traceId)
    
    if (result.success) {
      const totalTime = Date.now() - startTime
      console.log(`[${traceId}] ✅ OpenAI generation SUCCESS in ${totalTime}ms`)
      console.log(`[${traceId}] 📊 Final response length: ${result.data?.length || 0} characters`)
      return result
    }
    
    console.log(`[${traceId}] ❌ Attempt ${attempt.attemptNumber} failed: ${result.error}`)
    
    // If this was the last attempt, return the failure
    if (attempt.attemptNumber === maxRetries) {
      const totalTime = Date.now() - startTime
      console.log(`[${traceId}] 💥 ALL ATTEMPTS FAILED after ${totalTime}ms`)
      return {
        success: false,
        error: `All validation attempts failed. Last error: ${result.error}`,
        retries: maxRetries,
        rawResponse: result.rawResponse
      }
    }
    
    console.log(`[${traceId}] ⏳ Waiting 500ms before next attempt...`)
    // Reduced wait time between attempts
    await new Promise(resolve => setTimeout(resolve, 500)) // Reduced from 1000ms
  }

  console.log(`[${traceId}] 💥 Unexpected error in validation loop`)
  return {
    success: false,
    error: 'Unexpected error in validation loop',
    retries: maxRetries
  }
}
