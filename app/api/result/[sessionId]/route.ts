import { NextRequest, NextResponse } from 'next/server'
import { generationStatus } from '../../stripe-webhook/route'

/**
 * Get generation result for a session
 * Used by result page for polling
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const status = generationStatus.get(sessionId)

    if (!status) {
      return NextResponse.json({
        status: 'processing',
        message: 'Document is being generated...'
      })
    }

    return NextResponse.json(status)

  } catch (error) {
    console.error('Error retrieving result status:', error)
    return NextResponse.json(
      { 
        status: 'error' as const,
        error: 'Failed to retrieve generation status',
        message: 'Please contact support'
      },
      { status: 500 }
    )
  }
}

/**
 * Manual retry endpoint (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    const body = await request.json()
    const { action } = body

    if (action === 'regenerate') {
      // TODO: Re-implement generation for this session
      // For now, just return not implemented
      return NextResponse.json({
        success: false,
        message: 'Regeneration not yet implemented'
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    })

  } catch (error) {
    console.error('Error in result POST:', error)
    return NextResponse.json(
      { success: false, error: 'Request failed' },
      { status: 500 }
    )
  }
}