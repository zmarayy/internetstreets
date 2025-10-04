import { NextRequest, NextResponse } from 'next/server'
import { retrieveDocument } from '@/lib/tempStore'

/**
 * Download or preview a stored PDF document
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params
    const { searchParams } = new URL(request.url)
    const previewType = searchParams.get('preview') === 'true'

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
    }

    // Retrieve document
    const doc = await retrieveDocument(documentId)
    
    if (!doc) {
      return NextResponse.json(
        { error: 'Document not found or expired' },
        { status: 404 }
      )
    }

    // Check expiry from URL parameter
    const expiresAt = searchParams.get('expires')
    if (expiresAt && parseInt(expiresAt) < Date.now()) {
      return NextResponse.json(
        { error: 'Document access expired' },
        { status: 410 }
      )
    }

    // Set appropriate headers
    const headers = new Headers()
    headers.set('Content-Type', doc.mimeType)
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    
    if (previewType) {
      // For preview, allow in browser
      headers.set('Content-Disposition', 'inline; filename="document.pdf"')
      headers.set('X-Frame-Options', 'SAMEORIGIN') // Allow iframe embedding from same origin
    } else {
      // For download, force download
      headers.set('Content-Disposition', 'attachment; filename="internet-streets-document.pdf"')
    }

    // Log access
    console.log(`${previewType ? 'Preview' : 'Download'} access for document ${documentId}`)

    return new NextResponse(doc.pdfBuffer as any, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Error serving document:', error)
    return NextResponse.json(
      { error: 'Failed to serve document' },
      { status: 500 }
    )
  }
}
