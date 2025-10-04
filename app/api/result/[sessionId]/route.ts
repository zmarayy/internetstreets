import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getService } from '@/lib/services'
import { loadPrompt, buildPromptWithUserData, extractJSONFromResponse } from '@/lib/promptLoader'
import { renderServiceToPdf } from '@/lib/render'
import OpenAI from 'openai'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Initialize OpenAI client lazily to avoid build-time issues
function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// In-memory storage for generated results (in production, use Netlify Blob store)
export const generatedResults: Map<string, { buffer: Buffer; serviceName: string; timestamp: number }> = new Map()

// Clean up old results every hour
setInterval(() => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000)
  const entries = Array.from(generatedResults.entries())
  for (const [sessionId, result] of entries) {
    if (result.timestamp < oneHourAgo) {
      generatedResults.delete(sessionId)
    }
  }
}, 60 * 60 * 1000) // Run every hour

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = params

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID required' },
      { status: 400 }
    )
  }

  try {
    // Check if result is already generated and cached
    const cachedResult = generatedResults.get(sessionId)
    if (cachedResult) {
      // Return URL that serves the cached PDF
      return NextResponse.json({
        status: 'ready',
        url: `/api/download/${sessionId}`,
        serviceName: cachedResult.serviceName,
        expiresAt: new Date(cachedResult.timestamp + (60 * 60 * 1000)).toISOString()
      })
    }

    // Retrieve the session to verify payment
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Extract service data from session metadata
    const slug = session.metadata?.slug
    const inputs = JSON.parse(session.metadata?.inputs || '{}')

    if (!slug) {
      throw new Error('No service slug in session metadata')
    }

    // Get service configuration
    const service = getService(slug)
    if (!service) {
      throw new Error(`Service not found: ${slug}`)
    }

    // Generate the document
    const basePrompt = await loadPrompt(service.prompt_file)
    const builtPrompt = buildPromptWithUserData(basePrompt, inputs)

    // Generate JSON content with OpenAI
    const openai = getOpenAI()
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: builtPrompt
        }
      ],
      max_tokens: 450,
      temperature: getTemperatureForService(service.prompt_file),
    })

    const response = completion.choices[0].message.content || ''
    
    // Extract JSON from response
    const jsonData = extractJSONFromResponse(response)

    // Generate PDF from JSON data using the render system
    const pdfBuffer = await renderServiceToPdf(slug, jsonData)

    // Cache the result
    generatedResults.set(sessionId, {
      buffer: pdfBuffer,
      serviceName: service.name,
      timestamp: Date.now()
    })

    // Return the PDF directly via streaming response
    // Don't use URL.createObjectURL on server side

    // Return a URL that serves the PDF directly from our API
    return NextResponse.json({
      status: 'ready',
      url: `/api/download/${sessionId}`,
      serviceName: service.name,
      expiresAt: new Date(Date.now() + (60 * 60 * 1000)).toISOString()
    })

  } catch (error) {
    console.error('Error generating result:', error)
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Failed to generate result. Please try again or contact support.'
      },
      { status: 500 }
    )
  }
}

function getTemperatureForService(promptFile: string): number {
  const temperatureMap: Record<string, number> = {
    'fbi-file.txt': 0.6,
    'nsa-log.txt': 0.5,
    'gov-criminal.txt': 0.5,
    'universal-credit.txt': 0.4,
    'trap-credit.txt': 0.5,
    'payslip.txt': 0.2,
    'rejection-letter.txt': 0.3,
    'rent-reference.txt': 0.3,
    'school-report.txt': 0.4,
    'college-degree.txt': 0.3,
  }
  
  return temperatureMap[promptFile] || 0.5
}
