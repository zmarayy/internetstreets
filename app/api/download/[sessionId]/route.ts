import { NextRequest, NextResponse } from 'next/server'
import { getDocument } from '@/lib/tempStore'

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
    // Look up the stored document by sessionId
    const document = await getDocument(sessionId)
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or expired' },
        { status: 404 }
      )
    }

    // Return the PDF as a downloadable file
    const buffer = document.pdfBuffer
    
    return new NextResponse(buffer, {
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
