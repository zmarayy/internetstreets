import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getService, validateServiceInputs } from '@/lib/services'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  try {
    const { slug, inputs } = await request.json()

    // Validate service exists
    const service = getService(slug)
    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Validate inputs
    if (!validateServiceInputs(slug, inputs)) {
      return NextResponse.json(
        { error: 'Invalid inputs provided' },
        { status: 400 }
      )
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: service.name,
              description: `AI-generated ${service.name} for novelty purposes`,
            },
            unit_amount: service.price, // Price in pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/result/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/services/${slug}`,
      metadata: {
        slug,
        inputs: JSON.stringify(inputs),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Unable to process payment. Please try again or contact support.' },
      { status: 500 }
    )
  }
}
