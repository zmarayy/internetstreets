import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getService } from '@/lib/services'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

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

      if (!slug) {
        throw new Error('No service slug in session metadata')
      }

      // Get service configuration
      const service = getService(slug)
      if (!service) {
        throw new Error(`Service not found: ${slug}`)
      }

      // Store the session metadata for later processing
      console.log(`Payment completed for session ${session.id}, service: ${slug}`)
      
      return NextResponse.json({ 
        success: true, 
        sessionId: session.id,
        serviceName: service.name,
        type: service.type
      })

    } catch (error) {
      console.error('Error processing webhook:', error)
      return NextResponse.json(
        { error: 'Payment confirmed, but document generation failed. Please contact support.' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ received: true })
}
