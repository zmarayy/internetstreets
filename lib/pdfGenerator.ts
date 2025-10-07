/**
 * Professional PDF Generator for Internet Streets
 * Creates cinematic, realistic documents with professional styling
 */

import jsPDF from 'jspdf'
import { GeneratedBrand } from '@/lib/brand'
import { SanitizedInputs } from '@/lib/promptBuilder'
import { formatTextForPdf, cleanGeneratedText } from '@/lib/textPreprocessor'

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
 * Professional color scheme
 */
const colors = {
  background: [248, 248, 248] as [number, number, number], // #f8f8f8
  text: [0, 0, 0] as [number, number, number], // #000
  textSecondary: [60, 60, 60] as [number, number, number], // #3c3c3c
  textMuted: [120, 120, 120] as [number, number, number], // #787878
  border: [170, 170, 170] as [number, number, number], // #aaaaaa
  divider: [204, 204, 204] as [number, number, number], // #ccc
  tableHeader: [239, 239, 239] as [number, number, number], // #efefef
  footer: [102, 102, 102] as [number, number, number] // #666
}

/**
 * Typography settings
 */
const typography = {
  title: { size: 14, weight: 'bold' as const },
  sectionHeader: { size: 12, weight: 'bold' as const },
  body: { size: 11, weight: 'normal' as const },
  small: { size: 9, weight: 'normal' as const },
  lineHeight: 1.4,
  sectionSpacing: 20
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
  
  // Professional background
  doc.setFillColor(colors.background[0], colors.background[1], colors.background[2])
  doc.rect(0, 0, pageWidth, pageHeight, 'F')
  
  // Clean and format the text professionally
  const cleanedText = cleanGeneratedText(document.text)
  const { title, content, metadata } = formatTextForPdf(cleanedText)
  
  let yPos = 50
  
  // Add service logo in top-right corner
  addServiceLogo(doc, slug, pageWidth, pageHeight)
  
  // Add professional document header
  yPos = addDocumentHeader(doc, title, slug, pageWidth, yPos)
  
  // Add metadata section if available
  if (document.metadata) {
    yPos = addMetadataSection(doc, document.metadata, 20, yPos)
    yPos += typography.sectionSpacing
  }
  
  // Add divider line
  addDividerLine(doc, pageWidth, yPos)
  yPos += 15
  
  // Render main content with professional formatting
  yPos = renderProfessionalContent(doc, content, yPos, pageWidth, pageHeight)
  
  // Add professional footer to all pages
  addProfessionalFooter(doc, pageWidth, pageHeight)
  
  return Buffer.from(doc.output('arraybuffer'))
}

/**
 * Add professional document header
 */
function addDocumentHeader(doc: jsPDF, title: string, slug: string, pageWidth: number, yPos: number): number {
  // Document title
  doc.setFontSize(typography.title.size)
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
  doc.setFont('helvetica', typography.title.weight)
  doc.text(title, 20, yPos)
  yPos += 25
  
  // Add divider line
  addDividerLine(doc, pageWidth, yPos)
  yPos += 10
  
  // Case reference number
  const caseRef = generateCaseReference(slug)
  doc.setFontSize(typography.small.size)
  doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2])
  doc.setFont('helvetica', 'normal')
  doc.text(`CASE REF: ${caseRef}`, 20, yPos)
  yPos += 15
  
  return yPos
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
  doc.setFontSize(typography.small.size)
  doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2])
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
 * Add divider line
 */
function addDividerLine(doc: jsPDF, pageWidth: number, yPos: number): void {
  doc.setDrawColor(colors.divider[0], colors.divider[1], colors.divider[2])
  doc.setLineWidth(0.5)
  doc.line(20, yPos, pageWidth - 20, yPos)
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
  const margin = 20
  const maxWidth = pageWidth - (margin * 2)
  let yPos = startY
  
  // Check for table data
  const tableData = parseTableData(lines)
  const hasTable = tableData.length > 0
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Skip empty lines but add small spacing
    if (line.trim() === '') {
      yPos += 6
      continue
    }
    
    // Check for new page
    if (yPos > pageHeight - 60) {
      doc.addPage()
      yPos = 30
    }
    
    // Handle table data
    if (hasTable && isTableData(line)) {
      // Find all consecutive table lines
      const tableLines = []
      let j = i
      while (j < lines.length && isTableData(lines[j])) {
        tableLines.push(lines[j])
        j++
      }
      
      // Parse and render table
      const tableRows = tableLines.map(tableLine => 
        tableLine.split('|')
          .map(cell => cell.trim())
          .filter(cell => cell.length > 0)
      )
      
      yPos = renderTable(doc, tableRows, margin, yPos, pageWidth)
      i = j - 1 // Skip processed table lines
      continue
    }
    
    // Handle regular text
    const wrappedLines = doc.splitTextToSize(line, maxWidth)
    
    for (const wrappedLine of wrappedLines) {
      if (yPos > pageHeight - 60) {
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
      yPos += (style.size * typography.lineHeight) + style.spacing
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
      size: typography.title.size,
      color: colors.text,
      indent: 0,
      spacing: 8
    }
  }
  
  // Section headers
  if (isSectionHeader(trimmed)) {
    return {
      weight: 'bold',
      size: typography.sectionHeader.size,
      color: colors.text,
      indent: 0,
      spacing: 6
    }
  }
  
  // List items
  if (isListItem(trimmed)) {
    return {
      weight: 'normal',
      size: typography.body.size,
      color: colors.textSecondary,
      indent: 15,
      spacing: 2
    }
  }
  
  // Field labels
  if (isFieldLabel(trimmed)) {
    return {
      weight: 'bold',
      size: typography.body.size,
      color: colors.text,
      indent: 0,
      spacing: 2
    }
  }
  
  // Regular text
  return {
    weight: 'normal',
    size: typography.body.size,
    color: colors.text,
    indent: 0,
    spacing: 2
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
    /^EXECUTIVE SUMMARY$/i,
    /^KEY FINDINGS$/i,
    /^SURVEILLANCE LOG$/i,
    /^ANALYST NOTES$/i,
    /^FINAL RECOMMENDATION$/i,
    /^SUMMARY$/i,
    /^ANALYSIS$/i,
    /^FINDINGS$/i,
    /^RECOMMENDATIONS$/i,
    /^ASSESSMENT$/i,
    /^DETAILS$/i,
    /^INFORMATION$/i
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
 * Generate case reference number
 */
function generateCaseReference(slug: string): string {
  const prefixes: Record<string, string> = {
    'fbi-file': 'FBI',
    'nsa-surveillance': 'NSA',
    'criminal-record': 'PNC',
    'universal-credit': 'UC',
    'payslip': 'PAY',
    'credit-score': 'CRD',
    'job-rejection': 'HR',
    'rent-reference': 'REF',
    'school-behaviour': 'SCH',
    'college-degree': 'DEG'
  }
  
  const prefix = prefixes[slug] || 'DOC'
  const year = new Date().getFullYear().toString().slice(-2)
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  
  return `${year}-${random}-${prefix}`
}

/**
 * Render table data with professional formatting
 */
function renderTable(
  doc: jsPDF, 
  tableData: string[][], 
  x: number, 
  yPos: number, 
  pageWidth: number
): number {
  if (!tableData || tableData.length === 0) return yPos
  
  const margin = 20
  const tableWidth = pageWidth - (margin * 2)
  const colCount = tableData[0]?.length || 0
  const colWidth = tableWidth / colCount
  
  let currentY = yPos
  
  // Draw table header
  if (tableData.length > 0) {
    const headerRow = tableData[0]
    
    // Header background
    doc.setFillColor(colors.tableHeader[0], colors.tableHeader[1], colors.tableHeader[2])
    doc.rect(x, currentY - 8, tableWidth, 16, 'F')
    
    // Header text
    doc.setFontSize(typography.small.size)
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
    doc.setFont('helvetica', 'bold')
    
    headerRow.forEach((cell, index) => {
      const cellX = x + (index * colWidth)
      doc.text(cell, cellX + 5, currentY)
    })
    
    currentY += 16
  }
  
  // Draw table rows
  for (let rowIndex = 1; rowIndex < tableData.length; rowIndex++) {
    const row = tableData[rowIndex]
    
    // Row background (alternating)
    if (rowIndex % 2 === 0) {
      doc.setFillColor(248, 248, 248)
      doc.rect(x, currentY - 8, tableWidth, 16, 'F')
    }
    
    // Row text
    doc.setFontSize(typography.small.size)
    doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2])
    doc.setFont('helvetica', 'normal')
    
    row.forEach((cell, index) => {
      const cellX = x + (index * colWidth)
      doc.text(cell, cellX + 5, currentY)
    })
    
    currentY += 16
  }
  
  // Draw table borders
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2])
  doc.setLineWidth(0.5)
  
  // Vertical lines
  for (let i = 0; i <= colCount; i++) {
    const lineX = x + (i * colWidth)
    doc.line(lineX, yPos - 8, lineX, currentY - 8)
  }
  
  // Horizontal lines
  for (let i = 0; i <= tableData.length; i++) {
    const lineY = yPos - 8 + (i * 16)
    doc.line(x, lineY, x + tableWidth, lineY)
  }
  
  return currentY + 10
}

/**
 * Check if content contains table data
 */
function isTableData(line: string): boolean {
  const trimmed = line.trim()
  return trimmed.includes('|') && trimmed.split('|').length > 2
}

/**
 * Parse table data from text
 */
function parseTableData(lines: string[]): string[][] {
  const tableLines = lines.filter(line => isTableData(line))
  if (tableLines.length === 0) return []
  
  return tableLines.map(line => 
    line.split('|')
      .map(cell => cell.trim())
      .filter(cell => cell.length > 0)
  )
}

/**
 * Add professional footer to all pages
 */
function addProfessionalFooter(doc: jsPDF, pageWidth: number, pageHeight: number): void {
  const pageCount = doc.getNumberOfPages()
  const now = new Date()
  const timestamp = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-GB', { hour12: false })
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    
    // Legal disclaimer (centered)
    doc.setFontSize(typography.small.size)
    doc.setTextColor(colors.footer[0], colors.footer[1], colors.footer[2])
    doc.setFont('helvetica', 'normal')
    doc.text('Internet Streets Entertainment – Not a Real Document.', pageWidth / 2, pageHeight - 15, { align: 'center' })
    
    // Timestamp (left)
    doc.text(`Generated ${timestamp}`, 20, pageHeight - 15)
    
    // Page number (right)
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 15)
  }
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