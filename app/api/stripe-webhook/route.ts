import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { validateAndGenerateText } from '@/lib/validateText'
import { buildPrompt, validateRequiredFields } from '@/lib/promptBuilder'
import { generateServiceBrand } from '@/lib/brand'
import { storeDocumentBySessionId } from '@/lib/tempStore'
import { generationStatus } from '@/lib/generationStatus'
import { logger, generateTraceId, GenerationStep } from '@/lib/logger'
import { renderServiceToPdf } from '@/lib/pdfGenerator'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

/**
 * Generate document after successful payment (async processing)
 */
async function processDocumentGeneration(
  sessionId: string,
  slug: string,
  inputs: Record<string, any>,
  customerEmail?: string
): Promise<void> {
  const traceId = generateTraceId()
  
  try {
    console.log(`[${traceId}] Starting document generation for session ${sessionId}, service: ${slug}`)
    logger.generationStart(traceId, sessionId, slug)
    
    // Store initial status
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

    // Call OpenAI with retry logic
    console.log(`[${traceId}] Starting plain text generation for ${slug}`)
    const generationResult = await validateAndGenerateText(
      promptResult.prompt!,
      promptResult.metadata!.temperature,
      slug,
      traceId,
      3 // Max retries
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

    logger.generationStep('Plain text generated and validated', traceId, GenerationStep.JSON_VALIDATED, sessionId, slug)

    // Generate brand/seal
    const brand = generateServiceBrand(slug, inputs.companyName || inputs.fullName)
    
    // Extract basic metadata from the text
    const { extractBasicFields } = await import('@/lib/promptBuilder')
    const metadata = extractBasicFields(generationResult.data!)

    // Render PDF from plain text
    const pdfBuffer = await renderServiceToPdf(
      slug,
      { text: generationResult.data!, metadata },
      brand,
      promptResult.sanitizedInputs
    )

    logger.generationStep(`PDF rendered (${pdfBuffer.length} bytes)`, traceId, GenerationStep.PDF_RENDERED, sessionId, slug)

    // Store PDF temporarily by sessionId
    await storeDocumentBySessionId(
      sessionId,
      pdfBuffer,
      {
        serviceSlug: slug,
        traceId,
        userId: customerEmail
      },
      1 // 1 hour expiry
    )

    logger.generationSuccess(traceId, sessionId, slug, sessionId)

    // Update status to ready
    generationStatus.set(sessionId, {
      status: 'ready',
      sessionId,
      traceId,
      documentId: sessionId, // Use sessionId as documentId
      previewUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://internetstreets.uk'}/api/document/${sessionId}`,
      downloadUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://internetstreets.uk'}/api/document/${sessionId}`,
      serviceName: metadata.name || slug
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
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
  }
}

export async function POST(request: NextRequest) {
  console.log('🔔 Webhook received - processing request')
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    console.log(`🔔 Webhook event type: ${event.type}`)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      // Extract service data from session metadata
      const slug = session.metadata?.slug
      const inputs = JSON.parse(session.metadata?.inputs || '{}')
      const customerEmail = session.customer_email

      if (!slug) {
        throw new Error('No service slug in session metadata')
      }

      // Validate required inputs
      const fieldValidation = validateRequiredFields(slug, inputs)
      if (!fieldValidation.valid) {
        throw new Error(`Missing required fields: ${fieldValidation.missing.join(', ')}`)
      }

      console.log(`Payment completed for session ${session.id}, service: ${slug}`)
      
      // Start document generation asynchronously (don't wait)
      processDocumentGeneration(session.id, slug, inputs, customerEmail || undefined)
        .catch(error => {
          console.error(`Background generation failed for session ${session.id}:`, error)
          // Update status to error so frontend knows
          generationStatus.set(session.id, {
            status: 'error',
            sessionId: session.id,
            traceId: 'error-trace',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        })
      
      // Return success immediately (Stripe expects quick response)
      return NextResponse.json({ 
        success: true, 
        sessionId: session.id,
        message: 'Payment confirmed, document generation started'
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Webhook processing error:', errorMessage)
      
      // Still return success to Stripe to avoid retry storms
      // The generationStatus will show error state
      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          message: 'Payment confirmed, but validation failed. Please contact support.'
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