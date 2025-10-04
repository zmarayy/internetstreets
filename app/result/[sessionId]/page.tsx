'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Loader2, Download, Share2, FileText } from 'lucide-react'

interface ResultStatus {
  status: 'processing' | 'ready' | 'error'
  url?: string
  error?: string
  serviceName?: string
}

export default function ResultPage() {
  const router = useRouter()
  const { sessionId } = router.query
  const [resultStatus, setResultStatus] = useState<ResultStatus>({ status: 'processing' })
  const [isLoading, setIsLoading] = useState(true)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return

    const pollResult = async () => {
      try {
        const response = await fetch(`/api/result/${sessionId}`)
        const data = await response.json()

        if (data.status === 'ready' && data.url) {
          setResultStatus({ status: 'ready', url: data.url, serviceName: data.serviceName })
          setDownloadUrl(data.url)
          setIsLoading(false)
        } else if (data.status === 'error') {
          setResultStatus({ status: 'error', error: data.error })
          setIsLoading(false)
        } else {
          // Still processing, poll again in 3 seconds
          setTimeout(pollResult, 3000)
        }
      } catch (error) {
        console.error('Error polling result:', error)
        setResultStatus({ status: 'error', error: 'Unable to retrieve your document. Please try again or contact support.' })
        setIsLoading(false)
      }
    }

    // Start polling immediately
    pollResult()
  }, [sessionId])

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `internet-streets-${sessionId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleShare = async () => {
    if (downloadUrl) {
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      } catch (error) {
        console.error('Failed to copy link:', error)
        alert('Failed to copy link. Please copy manually.')
      }
    }
  }

  if (resultStatus.status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg text-white">
        <div className="text-center p-8 bg-dark-card rounded-lg border border-red-500 shadow-lg max-w-md">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-lg text-gray-300 mb-6">{resultStatus.error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-neon-pink hover:bg-neon-pink/80 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 neon-glow"
          >
            Try Another Service
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg text-white">
        <div className="text-center">
          <Loader2 className="animate-spin text-neon-green mx-auto mb-6" size={64} />
          <h1 className="text-3xl font-bold text-neon-green mb-4">
            Your Document is Being Generated...
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            {resultStatus.serviceName || 'Processing your request'}
          </p>
          <p className="text-gray-400">
            This usually takes 10-30 seconds. Please don't close this page.
          </p>
          <div className="mt-8 text-sm text-gray-500">
            <p>⏱️ Document will auto-delete after 1 hour</p>
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
              ⏱️ Auto-deletes in 1 hour
            </div>
          </div>
          
          {downloadUrl && (
            <div className="bg-white rounded-lg overflow-hidden">
              <iframe
                src={downloadUrl}
                className="w-full h-[600px] border-none"
                title="Generated Document Preview"
              />
              <div className="result-note">
                This PDF/image is novelty content for entertainment purposes. Document available for 1 hour.
              </div>
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
