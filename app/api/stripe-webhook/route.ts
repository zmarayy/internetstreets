import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { validateAndGenerateJson } from '@/lib/validateJson'
import { buildPrompt, validateRequiredFields } from '@/lib/promptBuilder'
import { generateServiceBrand } from '@/lib/brand'
import { storeDocument, generateSignedUrl } from '@/lib/tempStore'
import { logger, generateTraceId, GenerationStep } from '@/lib/logger'
import { renderServiceToPdf } from '@/lib/pdfGenerator'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Store generation status for polling
const generationStatus = new Map<string, {
  status: 'processing' | 'ready' | 'error'
  sessionId: string
  traceId: string
  error?: string
  documentId?: string
  previewUrl?: string
  downloadUrl?: string
  serviceName?: string
}>()

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
    logger.generationStart(traceId, sessionId, slug)
    
    // Store initial status
    generationStatus.set(sessionId, {
      status: 'processing',
      sessionId,
      traceId,
      serviceName: inputs.companyName || inputs.fullName || slug
    })

    // Build and validate prompt
    const promptResult = await buildPrompt(slug, inputs, traceId)
    if (!promptResult.success) {
      throw new Error(`Prompt validation failed: ${promptResult.error}`)
    }

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
    const generationResult = await validateAndGenerateJson(
      promptResult.prompt!,
      promptResult.metadata!.temperature,
      slug,
      traceId,
      2 // Max retries
    )

    if (!generationResult.success) {
      logger.generationFailed(
        `OpenAI generation failed after ${generationResult.retries} retries: ${generationResult.error}`,
        traceId,
        sessionId,
        slug,
        { retries: generationResult.retries, rawResponse: generationResult.rawResponse }
      )
      throw new Error(`Generation failed: ${generationResult.error}`)
    }

    logger.generationStep('JSON validated and generated', traceId, GenerationStep.JSON_VALIDATED, sessionId, slug)

    // Generate brand/seal
    const brand = generateServiceBrand(slug, inputs.companyName || inputs.fullName)
    
    // Render PDF
    const pdfBuffer = await renderServiceToPdf(
      slug,
      generationResult.data!,
      brand,
      promptResult.sanitizedInputs
    )

    logger.generationStep(`PDF rendered (${pdfBuffer.length} bytes)`, traceId, GenerationStep.PDF_RENDERED, sessionId, slug)

    // Store PDF temporarily
    const { documentId, expiryTime } = await storeDocument(
      pdfBuffer,
      {
        serviceSlug: slug,
        sessionId,
        traceId,
        userId: customerEmail
      },
      1 // 1 hour expiry
    )

  // Generate signed URLs
  const { url: previewUrl } = await generateSignedUrl(documentId, 60)
  const downloadUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://internetstreets.uk'}/api/document/${documentId}?expires=${expiryTime}`

    logger.generationSuccess(traceId, sessionId, slug, documentId)

    // Update status to ready
    generationStatus.set(sessionId, {
      status: 'ready',
      sessionId,
      traceId,
      documentId,
      previewUrl,
      downloadUrl,
      serviceName: generationResult.data?.document_title || slug
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
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
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

// Export generationStatus for admin/debugging
export { generationStatus }