import { NextRequest, NextResponse } from 'next/server'
import { generatedResults } from '@/lib/storage'

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
    // Look up the cached result
    const result = generatedResults.get(sessionId)
    
    if (!result) {
      return NextResponse.json(
        { error: 'Document not found or expired' },
        { status: 404 }
      )
    }

    // Return the PDF as a downloadable file
    const buffer = result.buffer as Buffer
    const uint8Array = new Uint8Array(buffer)
    
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="internet-streets-${sessionId}.pdf"`,
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error) {
    console.error('Error serving PDF:', error)
    return NextResponse.json(
      { error: 'Failed to serve PDF' },
      { status: 500 }
    )
  }
}
