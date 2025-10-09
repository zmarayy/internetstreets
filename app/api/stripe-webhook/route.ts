import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { validateAndGenerateText } from '@/lib/validateText'
import { buildPrompt, validateRequiredFields } from '@/lib/promptBuilder'
import { generateServiceBrand } from '@/lib/brand'
import { logger, generateTraceId, GenerationStep } from '@/lib/logger'
import { renderServiceToPdf } from '@/lib/pdfGenerator'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Simple in-memory store for generation status (no document storage)
const generationStatus = new Map<string, {
  status: 'processing' | 'ready' | 'error'
  sessionId: string
  traceId: string
  error?: string
  pdfBase64?: string
  serviceName?: string
}>()

/**
 * Generate document after successful payment (synchronous processing)
 */
async function processDocumentGeneration(
  sessionId: string,
  slug: string,
  inputs: Record<string, any>,
  customerEmail?: string
): Promise<{ success: boolean; pdfBase64?: string; error?: string }> {
  const traceId = generateTraceId()
  
  try {
    console.log(`[${traceId}] Starting document generation for session ${sessionId}, service: ${slug}`)
    logger.generationStart(traceId, sessionId, slug)
    
    // Update status to processing
    generationStatus.set(sessionId, {
      status: 'processing',
      sessionId,
      traceId,
      serviceName: inputs.companyName || inputs.fullName || slug
    })

    // Build and validate prompt
    console.log(`[${traceId}] Building prompt for service: ${slug}`)
    const promptResult = await buildPrompt(slug, inputs, traceId)
    if (!promptResult.success) {
      console.error(`[${traceId}] Prompt validation failed: ${promptResult.error}`)
      throw new Error(`Prompt validation failed: ${promptResult.error}`)
    }

    console.log(`[${traceId}] Prompt built successfully for ${slug}`)
    logger.generationStep('Prompt built and validated', traceId, GenerationStep.PROMPT_BUILT, sessionId, slug)
    
    // Log sanitization if occurred
    if (promptResult.sanitizedInputs?.org_sanitized) {
      logger.sanitizationAction(
        promptResult.sanitizedInputs.sanitized_reason || 'Organization sanitized',
        'Original name',
        'Sanitized name',
        traceId,
        sessionId,
        slug
      )
    }

    // Call OpenAI with retry logic (reduced retries for faster failure)
    console.log(`[${traceId}] 🔄 Starting OpenAI generation for ${slug}`)
    const generationResult = await validateAndGenerateText(
      promptResult.prompt!,
      promptResult.metadata!.temperature,
      slug,
      traceId,
      2 // Reduced retries for faster response
    )

    if (!generationResult.success) {
      // Log the raw response for debugging
      if (generationResult.rawResponse) {
        logger.jsonParseError(traceId, generationResult.rawResponse, sessionId, slug)
      }
      
      logger.generationFailed(
        `OpenAI generation failed after ${generationResult.retries} retries: ${generationResult.error}`,
        traceId,
        sessionId,
        slug,
        { retries: generationResult.retries }
      )
      throw new Error(`Generation failed: ${generationResult.error}`)
    }

    console.log(`[${traceId}] ✅ OpenAI generation successful! Response length: ${generationResult.data?.length || 0} characters`)
    logger.generationStep('Plain text generated and validated', traceId, GenerationStep.JSON_VALIDATED, sessionId, slug)

    // Generate brand/seal
    console.log(`[${traceId}] 🎨 Generating brand/seal for ${slug}`)
    const brand = generateServiceBrand(slug, inputs.companyName || inputs.fullName)
    
    // Extract basic metadata from the text
    console.log(`[${traceId}] 📊 Extracting metadata from generated text`)
    const { extractBasicFields } = await import('@/lib/promptBuilder')
    const metadata = extractBasicFields(generationResult.data!)

    // Render PDF from plain text
    console.log(`[${traceId}] 📄 Starting PDF rendering...`)
    const pdfBuffer = await renderServiceToPdf(
      slug,
      { text: generationResult.data!, metadata },
      brand,
      promptResult.sanitizedInputs
    )

    console.log(`[${traceId}] ✅ PDF rendering completed! Size: ${pdfBuffer.length} bytes`)
    logger.generationStep(`PDF rendered (${pdfBuffer.length} bytes)`, traceId, GenerationStep.PDF_RENDERED, sessionId, slug)

    // Convert PDF to base64 for direct return
    console.log(`[${traceId}] 🔄 Converting PDF to base64...`)
    const pdfBase64 = pdfBuffer.toString('base64')
    console.log(`[${traceId}] ✅ Base64 conversion completed! Length: ${pdfBase64.length} characters`)

    logger.generationSuccess(traceId, sessionId, slug, sessionId)

    // Update status to ready with PDF data
    generationStatus.set(sessionId, {
      status: 'ready',
      sessionId,
      traceId,
      pdfBase64,
      serviceName: metadata.name || slug
    })

    console.log(`[${traceId}] 🎉 Document generation COMPLETED successfully!`)
    return { success: true, pdfBase64 }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.log(`[${traceId}] 💥 ERROR in document generation: ${errorMessage}`)
    console.log(`[${traceId}] 🔍 Error stack:`, error instanceof Error ? error.stack : 'No stack trace')
    
    logger.generationFailed(
      `Document generation failed: ${errorMessage}`,
      traceId,
      sessionId,
      slug,
      error,
      GenerationStep.GENERATION_FAILED
    )

    // Update status to error
    generationStatus.set(sessionId, {
      status: 'error',
      sessionId,
      traceId,
      error: errorMessage
    })

    console.log(`[${traceId}] ❌ Generation status set to ERROR`)
    return { success: false, error: errorMessage }
  }
}

export async function POST(request: NextRequest) {
  console.log('🔔 Webhook received - processing request')
  const body = await request.text()
  console.log(`📊 Request body length: ${body.length} characters`)
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    console.log(`✅ Webhook signature verified`)
    console.log(`🔔 Webhook event type: ${event.type}`)
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    console.log(`💳 Payment completed for session ${session.id}`)

    try {
      // Extract service data from session metadata
      const slug = session.metadata?.slug
      const inputs = JSON.parse(session.metadata?.inputs || '{}')
      const customerEmail = session.customer_email

      console.log(`📋 Service slug: ${slug}`)
      console.log(`📝 Inputs:`, inputs)
      console.log(`👤 Customer email: ${customerEmail || 'Not provided'}`)

      if (!slug) {
        console.log(`❌ No service slug in session metadata`)
        throw new Error('No service slug in session metadata')
      }

      // Validate required inputs
      console.log(`🔍 Validating required fields for ${slug}`)
      const fieldValidation = validateRequiredFields(slug, inputs)
      if (!fieldValidation.valid) {
        console.log(`❌ Missing required fields: ${fieldValidation.missing.join(', ')}`)
        throw new Error(`Missing required fields: ${fieldValidation.missing.join(', ')}`)
      }
      console.log(`✅ Field validation passed`)

      console.log(`🚀 Starting document generation for session ${session.id}, service: ${slug}`)
      
      // Generate document synchronously with timeout
      const result = await Promise.race([
        processDocumentGeneration(session.id, slug, inputs, customerEmail || undefined),
        new Promise<{ success: boolean; error?: string }>((_, reject) =>
          setTimeout(() => reject(new Error('Generation timeout after 30 seconds')), 30000)
        )
      ])
      
      console.log(`📊 Generation result:`, result.success ? 'SUCCESS' : 'FAILED')
      
      if (result.success && 'pdfBase64' in result) {
        console.log(`✅ Returning successful response with PDF`)
        return NextResponse.json({ 
          success: true, 
          sessionId: session.id,
          pdfBase64: result.pdfBase64,
          serviceName: slug,
          message: 'Document generated successfully'
        })
      } else {
        console.log(`❌ Returning failed response:`, result.error)
        return NextResponse.json({ 
          success: false, 
          sessionId: session.id,
          error: result.error || 'Generation failed',
          message: 'Document generation failed'
        })
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.log(`💥 CRITICAL ERROR in webhook handler: ${errorMessage}`)
      console.log(`🔍 Error details:`, error)
      console.error('Webhook processing error:', errorMessage)
      
      return NextResponse.json(
        { 
          success: false, 
          sessionId: session.id,
          error: errorMessage,
          message: 'Payment confirmed, but generation failed. Please contact support.'
        },
        { status: 200 } // Return 200 to prevent Stripe retries
      )
    }
  }

  return NextResponse.json({ received: true })
}

/**
 * Get generation status (used by result page polling)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
  }

  const status = generationStatus.get(sessionId)
  
  if (!status) {
    return NextResponse.json({ 
      status: 'processing',
      message: 'Generation status not found'
    })
  }

  return NextResponse.json(status)
}