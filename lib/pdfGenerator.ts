/**
 * PDF Generator for Plain Text Documents
 * Creates realistic PDFs from natural text documents
 */

import jsPDF from 'jspdf'
import { GeneratedBrand } from '@/lib/brand'
import { SanitizedInputs } from '@/lib/promptBuilder'

export interface PlainTextDocument {
  text: string
  metadata?: {
    name?: string
    dob?: string
    city?: string
    companyName?: string
    [key: string]: string | undefined
  }
}

export interface GeneratedBrand {
  organizationName: string
  logo?: string
  color?: string
}

/**
 * Render a plain text document to PDF using React templates
 */
export async function renderServiceToPdf(
  slug: string, 
  document: PlainTextDocument, 
  brand?: GeneratedBrand,
  sanitizedInputs?: SanitizedInputs
): Promise<Buffer> {
  // For now, use the simple jsPDF approach
  // In production, you'd use Puppeteer to render React components
  const doc = new jsPDF()
  
  // Set up fonts
  doc.setFont('helvetica')
  
  // Add subtle watermark only in footer (no giant text)
  const pageHeight = doc.internal.pageSize.height
  const pageWidth = doc.internal.pageSize.width
  
  // Add paper texture background
  doc.setFillColor(250, 250, 250)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')
  
  let yPos = 30
  
  // Add document header with seal
  if (brand) {
    // Add faux seal/logo
    const sealSize = 40
    const sealX = pageWidth - 60
    const sealY = 20
    
    // Create circular seal
    doc.setFillColor(200, 200, 200)
    doc.circle(sealX, sealY, sealSize / 2, 'F')
    
    // Add seal text
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(brand.organizationName, sealX, sealY - 5, { align: 'center' })
    doc.text('OFFICIAL', sealX, sealY + 5, { align: 'center' })
  }
  
  // Add document title
  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  
  const title = getDocumentTitle(slug)
  doc.text(title, 20, yPos)
  yPos += 20
  
  // Add classification stamp for government docs
  if (isGovernmentDocument(slug)) {
    doc.setFontSize(10)
    doc.setTextColor(200, 0, 0)
    doc.setFont('helvetica', 'bold')
    doc.text('CONFIDENTIAL', pageWidth - 50, 15, { angle: -30 })
  }
  
  // Add metadata if available
  if (document.metadata) {
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'normal')
    
    const metadata = document.metadata
    if (metadata.name) {
      doc.text(`Subject: ${metadata.name}`, 20, yPos)
      yPos += 8
    }
    if (metadata.dob) {
      doc.text(`DOB: ${metadata.dob}`, 20, yPos)
      yPos += 8
    }
    if (metadata.city) {
      doc.text(`Location: ${metadata.city}`, 20, yPos)
      yPos += 8
    }
    yPos += 10
  }
  
  // Add horizontal line
  doc.setDrawColor(200, 200, 200)
  doc.line(20, yPos, pageWidth - 20, yPos)
  yPos += 15
  
  // Render the main document text
  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  
  // Split text into lines and render
  const lines = document.text.split('\n')
  const lineHeight = 6
  const margin = 20
  const maxWidth = pageWidth - (margin * 2)
  
  for (const line of lines) {
    // Check if we need a new page
    if (yPos > pageHeight - 30) {
      doc.addPage()
      yPos = 30
    }
    
    // Handle long lines by wrapping
    const wrappedLines = doc.splitTextToSize(line, maxWidth)
    
    for (const wrappedLine of wrappedLines) {
      if (yPos > pageHeight - 30) {
        doc.addPage()
        yPos = 30
      }
      
      // Style different types of content
      if (isHeading(wrappedLine)) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.text(wrappedLine, margin, yPos)
        yPos += lineHeight + 2
      } else if (isListItem(wrappedLine)) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.text(wrappedLine, margin + 10, yPos)
        yPos += lineHeight
      } else {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(11)
        doc.text(wrappedLine, margin, yPos)
        yPos += lineHeight
      }
    }
  }
  
  // Add footer on every page
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    
    // Add page number
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 10)
    
    // Add disclaimer
    doc.text('Internet Streets Entertainment – Not a Real Document', pageWidth / 2, pageHeight - 10, { align: 'center' })
    
    // Add watermark
    doc.setGState(new doc.GState({ opacity: 0.1 }))
    doc.setFontSize(48)
    doc.setTextColor(200, 200, 200)
    doc.text('INTERNET STREETS ENTERTAINMENT', pageWidth / 2, pageHeight / 2, { 
      align: 'center', 
      angle: -30 
    })
  }
  
  return Buffer.from(doc.output('arraybuffer'))
}

/**
 * Get document title based on service slug
 */
function getDocumentTitle(slug: string): string {
  const titles: Record<string, string> = {
    'fbi-file': 'FBI Intelligence Dossier (Fictional)',
    'nsa-surveillance': 'NSA Surveillance Activity Log (Fictional)',
    'criminal-record': 'Police National Computer Record (Fictional)',
    'universal-credit': 'Universal Credit Assessment Report (Fictional)',
    'payslip': 'Statement of Earnings (Fictional)',
    'credit-score': 'Credit Score Report (Fictional)',
    'job-rejection': 'Application Outcome Letter (Fictional)',
    'rent-reference': 'Landlord Reference Letter (Fictional)',
    'school-behaviour': 'School Behaviour Record Reprint (Fictional)',
    'college-degree': 'University Degree Certificate (Fictional)'
  }
  
  return titles[slug] || 'Document (Fictional)'
}

/**
 * Check if this is a government document
 */
function isGovernmentDocument(slug: string): boolean {
  return ['fbi-file', 'nsa-surveillance', 'criminal-record', 'universal-credit'].includes(slug)
}

/**
 * Check if line is a heading
 */
function isHeading(line: string): boolean {
  const trimmed = line.trim()
  return trimmed.length > 0 && 
         (trimmed.endsWith(':') || 
          trimmed === trimmed.toUpperCase() ||
          trimmed.startsWith('Title:') ||
          trimmed.startsWith('Subject:') ||
          trimmed.startsWith('Summary:') ||
          trimmed.startsWith('Key Findings:') ||
          trimmed.startsWith('Analysis:') ||
          trimmed.startsWith('Recommendations:'))
}

/**
 * Check if line is a list item
 */
function isListItem(line: string): boolean {
  const trimmed = line.trim()
  return trimmed.startsWith('•') || 
         trimmed.startsWith('-') || 
         trimmed.startsWith('*') ||
         /^\d+\./.test(trimmed)
}

/**
 * Legacy function for backward compatibility
 */
export function generatePDFfromJSON(json: any, serviceSlug: string): Buffer {
  // Convert old JSON format to plain text for backward compatibility
  const text = convertJSONToText(json, serviceSlug)
  return renderServiceToPdf(serviceSlug, { text }, undefined, undefined) as any
}

/**
 * Convert JSON to plain text (for backward compatibility)
 */
function convertJSONToText(json: any, serviceSlug: string): string {
  let text = ''
  
  if (json.document_title) {
    text += `${json.document_title}\n\n`
  }
  
  if (json.subject) {
    text += `Subject Information:\n`
    if (json.subject.name) text += `Name: ${json.subject.name}\n`
    if (json.subject.dob) text += `DOB: ${json.subject.dob}\n`
    if (json.subject.city) text += `City: ${json.subject.city}\n`
    text += '\n'
  }
  
  if (json.summary) {
    text += `Summary:\n${json.summary}\n\n`
  }
  
  if (json.key_findings) {
    text += `Key Findings:\n`
    json.key_findings.forEach((finding: string) => {
      text += `• ${finding}\n`
    })
    text += '\n'
  }
  
  // Add disclaimer
  text += '\nInternet Streets Entertainment – Not a Real Document'
  
  return text
}