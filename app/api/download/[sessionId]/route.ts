import { NextRequest, NextResponse } from 'next/server'

// We need to access the generated results from the result API
// Since they're in-memory, we'll need to make them accessible

// For now, let's create a simple file download handler
// In production, this would use persistent storage

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
    // Import the generatedResults from the result API
    // This is a temporary solution - in production use proper storage
    const { generatedResults } = await import('../result/[sessionId]/route')
    
    // Access the shared results Map
    const result = generatedResults.get(sessionId)
    
    if (!result) {
      return NextResponse.json(
        { error: 'Document not found or expired' },
        { status: 404 }
      )
    }

    // Return the PDF as a downloadable file
    return new NextResponse(result.buffer, {
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
