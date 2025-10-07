'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { Loader2, Download, Share2, FileText } from 'lucide-react'

interface ResultStatus {
  status: 'processing' | 'ready' | 'error'
  pdfBase64?: string
  error?: string
  serviceName?: string
  sessionId?: string
}

export default function ResultPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string
  const [resultStatus, setResultStatus] = useState<ResultStatus>({ status: 'processing' })
  const [isLoading, setIsLoading] = useState(true)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pollInterval, setPollInterval] = useState(2000) // Start with 2 seconds

  useEffect(() => {
    if (!sessionId) return

    const pollResult = async () => {
      try {
        const response = await fetch(`/api/stripe-webhook?sessionId=${sessionId}`)
        const data = await response.json()

        if (data.status === 'ready' && data.pdfBase64) {
          // Convert base64 to blob URL
          const pdfBlob = new Blob(
            [Uint8Array.from(atob(data.pdfBase64), c => c.charCodeAt(0))], 
            { type: 'application/pdf' }
          )
          const url = URL.createObjectURL(pdfBlob)
          setPdfUrl(url)
          
          setResultStatus({ 
            status: 'ready', 
            pdfBase64: data.pdfBase64,
            serviceName: data.serviceName,
            sessionId: data.sessionId 
          })
          setIsLoading(false)
        } else if (data.status === 'error') {
          setResultStatus({ status: 'error', error: data.error || data.message })
          setIsLoading(false)
        } else {
          // Still processing, poll again with exponential backoff
          const nextInterval = Math.min(pollInterval * 1.5, 5000) // Cap at 5 seconds
          setPollInterval(nextInterval)
          setTimeout(pollResult, nextInterval)
        }
      } catch (error) {
        console.error('Error polling result:', error)
        setResultStatus({ status: 'error', error: 'Unable to retrieve your document. Please refresh the page or contact support.' })
        setIsLoading(false)
      }
    }

    // Start polling immediately
    pollResult()
  }, [sessionId, pollInterval])

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = `internet-streets-${sessionId}.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard! Share it with others.')
    } catch (error) {
      console.error('Failed to copy link:', error)
      alert('Failed to copy link. Please copy manually.')
    }
  }

  const handlePreviewInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank')
    }
  }

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [pdfUrl])

  if (resultStatus.status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg text-white">
        <div className="text-center p-8 bg-dark-card rounded-lg border border-red-500 shadow-lg max-w-md">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Generation Failed</h1>
          <p className="text-lg text-gray-300 mb-4">{resultStatus.error}</p>
          <p className="text-sm text-gray-400 mb-6">
            Reference ID: {sessionId}<br/>
            You will not be charged for this failed generation.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {navigator.clipboard.writeText(sessionId); alert('Reference ID copied!')}}
              className="bg-neon-blue hover:bg-neon-blue/80 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 mr-3"
            >
              Copy Reference ID
            </button>
            <button
              onClick={() => router.push('/contact')}
              className="bg-neon-pink hover:bg-neon-pink/80 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg text-white">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-6 text-neon-green" size={64} />
          <h1 className="text-3xl font-bold mb-4 text-neon-green">
            Your Document is Being Generated...
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            {resultStatus.serviceName || 'Processing your request'}
          </p>
          <p className="text-gray-400">
            This usually takes 10-30 seconds. Please don't close this page.
          </p>
          <div className="mt-8 text-sm text-gray-500">
            <p>📄 Document will be ready for immediate download</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-dark-bg text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="glitch-text text-4xl font-bold text-neon-green mb-4">
            Your Document is Ready!
          </h1>
          <p className="text-xl text-gray-300">
            Here's your AI-generated {resultStatus.serviceName || 'document'}. 
            You can view it below or download it.
          </p>
        </div>

        {/* PDF Preview */}
        <div className="bg-dark-card border border-dark-border rounded-lg p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-neon-blue flex items-center">
              <FileText className="mr-2" size={24} />
              Document Preview
            </h2>
            <div className="text-sm text-gray-400">
              📄 Ready for download
            </div>
          </div>
          
          {pdfUrl ? (
            <div className="bg-white rounded-lg overflow-hidden relative">
              <iframe
                src={pdfUrl}
                className="w-full h-[600px] border-none"
                title="Generated Document Preview"
                onError={() => {
                  // Fallback if iframe fails
                  const fallbackDiv = document.createElement('div')
                  fallbackDiv.innerHTML = `
                    <div class="text-center p-8">
                      <h3 class="text-red-600 mb-4">Preview not available</h3>
                      <p class="mb-4">You can still download the document using the button below</p>
                      <button onclick="window.open('${pdfUrl}', '_blank')" 
                              class="bg-blue-500 text-white px-4 py-2 rounded">Open in New Tab</button>
                    </div>
                  `
                  document.querySelector('.relative')?.appendChild(fallbackDiv)
                }}
              />
              <div className="absolute top-2 right-2 z-10">
                <button
                  onClick={handlePreviewInNewTab}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm opacity-80 hover:opacity-100"
                >
                  Open in New Tab
                </button>
              </div>
              <div className="result-note">
                This PDF is novelty content for entertainment purposes.
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 text-gray-600 p-8 rounded-lg text-center">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>Preview will appear when document is ready...</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center bg-neon-blue hover:bg-neon-blue/80 text-white font-bold py-4 px-8 rounded-lg transition-colors duration-300 neon-glow"
          >
            <Download className="mr-2" size={20} />
            Download PDF
          </button>
          
          <button
            onClick={handleShare}
            className="flex items-center justify-center bg-neon-purple hover:bg-neon-purple/80 text-white font-bold py-4 px-8 rounded-lg transition-colors duration-300 neon-glow"
          >
            <Share2 className="mr-2" size={20} />
            Share Link
          </button>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-yellow-400 mb-3">⚠️ Important Disclaimer</h3>
          <p className="text-gray-300 leading-relaxed">
            This document is generated for entertainment purposes only. It is not a real, official, 
            or legally binding document. Do not use this document for any official purposes, 
            legal proceedings, or to misrepresent yourself or others. Internet Streets is not 
            responsible for any misuse of generated content.
          </p>
        </div>

        {/* Navigation */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="bg-neon-pink hover:bg-neon-pink/80 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 neon-glow"
          >
            Generate Another Document
          </button>
        </div>
      </div>
    </div>
  )
}