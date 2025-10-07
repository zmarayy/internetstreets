/**
 * Professional PDF Generator for Internet Streets
 * Creates authentic-looking documents with clean styling
 */

import jsPDF from 'jspdf'
import { GeneratedBrand } from '@/lib/brand'
import { SanitizedInputs } from '@/lib/promptBuilder'
import { formatTextForPdf } from '@/lib/textPreprocessor'

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

/**
 * Logo mapping for all services - supports multiple formats
 */
const logoMap: Record<string, string[]> = {
  'fbi-file': ['/assets/logos/fbi-file.png', '/assets/logos/fbi-file.jpg', '/assets/logos/fbi-file.webp', '/assets/logos/fbi-file.svg'],
  'nsa-surveillance': ['/assets/logos/nsa-surveillance.png', '/assets/logos/nsa-surveillance.jpg', '/assets/logos/nsa-surveillance.webp', '/assets/logos/nsa-surveillance.svg'],
  'criminal-record': ['/assets/logos/criminal-record.png', '/assets/logos/criminal-record.jpg', '/assets/logos/criminal-record.webp', '/assets/logos/criminal-record.svg'],
  'universal-credit': ['/assets/logos/universal-credit.png', '/assets/logos/universal-credit.jpg', '/assets/logos/universal-credit.webp', '/assets/logos/universal-credit.svg'],
  'payslip': ['/assets/logos/payslip.png', '/assets/logos/payslip.jpg', '/assets/logos/payslip.webp', '/assets/logos/payslip.svg'],
  'credit-score': ['/assets/logos/credit-score.png', '/assets/logos/credit-score.jpg', '/assets/logos/credit-score.webp', '/assets/logos/credit-score.svg'],
  'job-rejection': ['/assets/logos/job-rejection.png', '/assets/logos/job-rejection.jpg', '/assets/logos/job-rejection.webp', '/assets/logos/job-rejection.svg'],
  'rent-reference': ['/assets/logos/rent-reference.png', '/assets/logos/rent-reference.jpg', '/assets/logos/rent-reference.webp', '/assets/logos/rent-reference.svg'],
  'school-behaviour': ['/assets/logos/school-behaviour.png', '/assets/logos/school-behaviour.jpg', '/assets/logos/school-behaviour.webp', '/assets/logos/school-behaviour.svg'],
  'college-degree': ['/assets/logos/college-degree.png', '/assets/logos/college-degree.jpg', '/assets/logos/college-degree.webp', '/assets/logos/college-degree.svg']
}

/**
 * Render a professional document to PDF
 */
export async function renderServiceToPdf(
  slug: string, 
  document: PlainTextDocument, 
  brand?: GeneratedBrand,
  sanitizedInputs?: SanitizedInputs
): Promise<Buffer> {
  const doc = new jsPDF()
  
  // Professional styling
  doc.setFont('helvetica')
  
  const pageHeight = doc.internal.pageSize.height
  const pageWidth = doc.internal.pageSize.width
  
  // Clean white background
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')
  
  // Format the text professionally
  const { title, content, metadata } = formatTextForPdf(document.text)
  
  let yPos = 40
  
  // Add service logo in top-right corner
  addServiceLogo(doc, slug, pageWidth, pageHeight)
  
  // Add document title (clean, no fictional markers)
  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 20, yPos)
  yPos += 25
  
  // Add metadata section if available
  if (document.metadata) {
    addMetadataSection(doc, document.metadata, 20, yPos)
    yPos += 40
  }
  
  // Add subtle divider line
  doc.setDrawColor(200, 200, 200)
  doc.line(20, yPos, pageWidth - 20, yPos)
  yPos += 20
  
  // Render main content with professional formatting
  yPos = renderProfessionalContent(doc, content, yPos, pageWidth, pageHeight)
  
  // Add professional footer to all pages
  addProfessionalFooter(doc, pageWidth, pageHeight)
  
  return Buffer.from(doc.output('arraybuffer'))
}

/**
 * Add service logo in top-right corner - tries multiple formats
 */
function addServiceLogo(doc: jsPDF, slug: string, pageWidth: number, pageHeight: number): void {
  const logoUrls = logoMap[slug]
  
  if (!logoUrls || logoUrls.length === 0) {
    console.log(`No logo found for service: ${slug}`)
    return
  }
  
  let logoAdded = false
  
  // Try each format until one works
  for (const logoUrl of logoUrls) {
    try {
      // Logo positioning: top-right corner
      const logoX = pageWidth - 130  // 30px from right edge + 100px width
      const logoY = 40                // 40px from top
      const logoWidth = 100
      const logoHeight = 100
      
      // Determine format from URL
      const format = logoUrl.split('.').pop()?.toUpperCase() || 'PNG'
      
      // Add logo image
      doc.addImage(logoUrl, format as any, logoX, logoY, logoWidth, logoHeight)
      
      console.log(`Logo added for service: ${slug} at ${logoUrl} (${format})`)
      logoAdded = true
      break // Success, stop trying other formats
      
    } catch (error) {
      console.log(`Failed to load logo ${logoUrl} for service ${slug}: ${error}`)
      // Continue to next format
    }
  }
  
  if (!logoAdded) {
    console.log(`No working logo found for service: ${slug}`)
    // Continue rendering without logo - graceful fallback
  }
}

/**
 * Add metadata section with clean formatting
 */
function addMetadataSection(doc: jsPDF, metadata: any, x: number, yPos: number): number {
  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  doc.setFont('helvetica', 'normal')
  
  let currentY = yPos
  
  const fields = [
    { key: 'name', label: 'Subject' },
    { key: 'dob', label: 'Date of Birth' },
    { key: 'city', label: 'Location' },
    { key: 'companyName', label: 'Organization' },
    { key: 'jobTitle', label: 'Position' },
    { key: 'salary', label: 'Salary' },
    { key: 'propertyAddress', label: 'Property' },
    { key: 'universityName', label: 'Institution' },
    { key: 'degreeTitle', label: 'Degree' }
  ]
  
  for (const field of fields) {
    if (metadata[field.key]) {
      doc.text(`${field.label}: ${metadata[field.key]}`, x, currentY)
      currentY += 6
    }
  }
  
  return currentY
}

/**
 * Render content with professional formatting
 */
function renderProfessionalContent(
  doc: jsPDF, 
  content: string, 
  startY: number, 
  pageWidth: number, 
  pageHeight: number
): number {
  const lines = content.split('\n')
  const lineHeight = 6
  const margin = 20
  const maxWidth = pageWidth - (margin * 2)
  let yPos = startY
  
  for (const line of lines) {
    // Skip empty lines but add small spacing
    if (line.trim() === '') {
      yPos += lineHeight / 2
      continue
    }
    
    // Check for new page
    if (yPos > pageHeight - 40) {
      doc.addPage()
      yPos = 30
    }
    
    // Handle line wrapping
    const wrappedLines = doc.splitTextToSize(line, maxWidth)
    
    for (const wrappedLine of wrappedLines) {
      if (yPos > pageHeight - 40) {
        doc.addPage()
        yPos = 30
      }
      
      // Apply appropriate styling
      const style = getTextStyle(wrappedLine)
      
      doc.setFont('helvetica', style.weight)
      doc.setFontSize(style.size)
      doc.setTextColor(style.color[0], style.color[1], style.color[2])
      
      const indent = style.indent
      doc.text(wrappedLine, margin + indent, yPos)
      yPos += lineHeight + style.spacing
    }
  }
  
  return yPos
}

/**
 * Determine text styling based on content
 */
function getTextStyle(line: string): {
  weight: 'normal' | 'bold'
  size: number
  color: [number, number, number]
  indent: number
  spacing: number
} {
  const trimmed = line.trim()
  
  // Document headers
  if (isDocumentHeader(trimmed)) {
    return {
      weight: 'bold',
      size: 14,
      color: [0, 0, 0],
      indent: 0,
      spacing: 2
    }
  }
  
  // Section headers
  if (isSectionHeader(trimmed)) {
    return {
      weight: 'bold',
      size: 12,
      color: [0, 0, 0],
      indent: 0,
      spacing: 1
    }
  }
  
  // List items
  if (isListItem(trimmed)) {
    return {
      weight: 'normal',
      size: 10,
      color: [40, 40, 40],
      indent: 10,
      spacing: 0
    }
  }
  
  // Field labels
  if (isFieldLabel(trimmed)) {
    return {
      weight: 'bold',
      size: 10,
      color: [0, 0, 0],
      indent: 0,
      spacing: 0
    }
  }
  
  // Regular text
  return {
    weight: 'normal',
    size: 11,
    color: [0, 0, 0],
    indent: 0,
    spacing: 0
  }
}

/**
 * Check if line is a document header
 */
function isDocumentHeader(line: string): boolean {
  const headers = [
    'FEDERAL BUREAU OF INVESTIGATION',
    'NATIONAL SECURITY AGENCY',
    'GOVERNMENT CRIMINAL RECORD',
    'UNIVERSAL CREDIT',
    'CREDIT SCORE REPORT',
    'STATEMENT OF EARNINGS',
    'APPLICATION OUTCOME',
    'TENANCY REFERENCE',
    'SCHOOL BEHAVIOUR REPORT',
    'UNIVERSITY DEGREE'
  ]
  
  return headers.some(header => line.toUpperCase().includes(header))
}

/**
 * Check if line is a section header
 */
function isSectionHeader(line: string): boolean {
  const patterns = [
    /^[A-Z\s]+:$/,  // ALL CAPS with colon
    /^[A-Z][a-z\s]+:$/,  // Title Case with colon
    /^Summary:$/i,
    /^Analysis:$/i,
    /^Findings:$/i,
    /^Recommendations:$/i,
    /^Assessment:$/i,
    /^Details:$/i,
    /^Information:$/i
  ]
  
  return patterns.some(pattern => pattern.test(line))
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
 * Check if line is a field label
 */
function isFieldLabel(line: string): boolean {
  const patterns = [
    /^[A-Z][a-z\s]+:\s/,  // Field: value
    /^[A-Z]{2,}:\s/,  // ABBREV: value
    /^[A-Z][a-z]+ [A-Z][a-z]+:\s/  // Two Word Field: value
  ]
  
  return patterns.some(pattern => pattern.test(line))
}

/**
 * Add professional footer to all pages
 */
function addProfessionalFooter(doc: jsPDF, pageWidth: number, pageHeight: number): void {
  const pageCount = doc.getNumberOfPages()
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    
    // Page number
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 15)
    
    // Legal disclaimer (small, unobtrusive)
    doc.setFontSize(7)
    doc.setTextColor(100, 100, 100)
    doc.text('Internet Streets Entertainment – Not a Real Document', pageWidth / 2, pageHeight - 15, { align: 'center' })
    
    // Date stamp
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-GB')
    doc.text(dateStr, 20, pageHeight - 15)
  }
}

/**
 * Get clean document title (no fictional markers)
 */
function getDocumentTitle(slug: string): string {
  const titles: Record<string, string> = {
    'fbi-file': 'FEDERAL BUREAU OF INVESTIGATION — INTELLIGENCE DOSSIER',
    'nsa-surveillance': 'NATIONAL SECURITY AGENCY — SIGNALS INTELLIGENCE REPORT',
    'criminal-record': 'GOVERNMENT CRIMINAL RECORD EXTRACT',
    'universal-credit': 'UNIVERSAL CREDIT ASSESSMENT SUMMARY',
    'payslip': 'STATEMENT OF EARNINGS',
    'credit-score': 'CREDIT SCORE REPORT',
    'job-rejection': 'APPLICATION OUTCOME LETTER',
    'rent-reference': 'TENANCY REFERENCE LETTER',
    'school-behaviour': 'SCHOOL BEHAVIOUR REPORT',
    'college-degree': 'UNIVERSITY DEGREE CERTIFICATE'
  }
  
  return titles[slug] || 'OFFICIAL DOCUMENT'
}

/**
 * Legacy function for backward compatibility
 */
export function generatePDFfromJSON(json: any, serviceSlug: string): Buffer {
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
  
  return text
}