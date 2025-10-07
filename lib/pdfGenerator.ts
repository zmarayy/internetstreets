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
 * Logo mapping for all services - Absolute URLs for Netlify compatibility
 */
const logoMap: Record<string, string> = {
  'fbi-file': 'https://internetstreets.uk/assets/logos/fbi-file.png',
  'nsa-surveillance': 'https://internetstreets.uk/assets/logos/nsa-surveillance.png',
  'criminal-record': 'https://internetstreets.uk/assets/logos/criminal-record.png',
  'universal-credit': 'https://internetstreets.uk/assets/logos/universal-credit.png',
  'payslip': 'https://internetstreets.uk/assets/logos/payslip.png',
  'credit-score': 'https://internetstreets.uk/assets/logos/credit-score.png',
  'job-rejection': 'https://internetstreets.uk/assets/logos/job-rejection.png',
  'rent-reference': 'https://internetstreets.uk/assets/logos/rent-reference.png',
  'school-behaviour': 'https://internetstreets.uk/assets/logos/school-behaviour.png',
  'college-degree': 'https://internetstreets.uk/assets/logos/college-degree.png'
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
 * Typography settings - Helvetica font family (optimized for length)
 */
const typography = {
  title: { size: 12, weight: 'bold' as const },
  sectionHeader: { size: 10, weight: 'bold' as const },
  body: { size: 10, weight: 'normal' as const },
  small: { size: 9, weight: 'normal' as const },
  lineHeight: 1.2,
  sectionSpacing: 15,
  headerMargin: 10
}

/**
 * Load logo from absolute URL and convert to data URL
 */
async function loadLogo(url: string): Promise<string> {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })
    return dataUrl
  } catch (error) {
    console.warn(`Failed to load logo from ${url}:`, error)
    throw error
  }
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
  
  // Professional styling - Helvetica font family (optimized)
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(10)
  doc.setLineHeightFactor(1.2)
  
  const pageHeight = doc.internal.pageSize.height
  const pageWidth = doc.internal.pageSize.width
  const marginY = 25
  const marginX = 20
  
  // Professional background
  doc.setFillColor(colors.background[0], colors.background[1], colors.background[2])
  doc.rect(0, 0, pageWidth, pageHeight, 'F')
  
  // Clean and format the text professionally with date injection
  const cleanedText = cleanGeneratedText(document.text)
  const today = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
  const textWithDate = cleanedText.replace(/\[Insert Current Date\]/gi, today)
  const { title, content, metadata } = formatTextForPdf(textWithDate)
  
  let yPos = marginY + 20  // Optimized top margin
  
  // Add service logo in top-right corner (async loading)
  await addServiceLogo(doc, slug, pageWidth, pageHeight)
  
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
  
  // Render main content with optimized formatting
  yPos = renderProfessionalContent(doc, content, yPos, pageWidth, pageHeight, marginX)
  
  // Add professional footer to all pages
  addProfessionalFooter(doc, pageWidth, pageHeight)
  
  // Return optimized PDF buffer
  return Buffer.from(doc.output('arraybuffer'))
}

/**
 * Add professional document header with improved layout
 */
function addDocumentHeader(doc: jsPDF, title: string, slug: string, pageWidth: number, yPos: number): number {
  // Document title - Helvetica font
  doc.setFontSize(typography.title.size)
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
  doc.setFont('Helvetica', typography.title.weight)
  doc.text(title, 20, yPos)
  yPos += 25
  
  // Add faint grey divider under title
  doc.setDrawColor(180, 180, 180)
  doc.setLineWidth(0.5)
  doc.line(20, yPos, pageWidth - 20, yPos)
  yPos += 10
  
  // Case reference number for realism
  const caseRef = generateCaseReference(slug)
  doc.setFontSize(typography.small.size)
  doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2])
  doc.setFont('Helvetica', 'normal')
  doc.text(`CASE REF: ${caseRef}`, 20, yPos)
  yPos += 15
  
  return yPos
}

/**
 * Add service logo in top-right corner - Async loading with absolute URLs
 */
async function addServiceLogo(doc: jsPDF, slug: string, pageWidth: number, pageHeight: number): Promise<void> {
  const logoUrl = logoMap[slug]
  
  if (!logoUrl) {
    console.log(`No logo found for service: ${slug}`)
    return
  }
  
  try {
    // Load logo from absolute URL
    const logoDataUrl = await loadLogo(logoUrl)
    
    // Logo positioning: top-right corner
    const logoX = pageWidth - 130  // 30px from right edge + 100px width
    const logoY = 40                // 40px from top
    const logoWidth = 100
    const logoHeight = 100
    
    // Add logo image (PNG format)
    doc.addImage(logoDataUrl, 'PNG', logoX, logoY, logoWidth, logoHeight)
    
    console.log(`Logo added for service: ${slug} from ${logoUrl}`)
  } catch (error) {
    console.warn(`Failed to load logo for service ${slug}: ${error}`)
    // Continue rendering without logo - graceful fallback
  }
}

/**
 * Add metadata section with clean formatting - Helvetica font
 */
function addMetadataSection(doc: jsPDF, metadata: any, x: number, yPos: number): number {
  doc.setFontSize(typography.small.size)
  doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2])
  doc.setFont('Helvetica', 'normal')
  
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
  pageHeight: number,
  marginX: number
): number {
  const lines = content.split('\n')
  const maxWidth = pageWidth - (marginX * 2)
  let yPos = startY
  
  // Check for table data
  const tableData = parseTableData(lines)
  const hasTable = tableData.length > 0
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
      // Skip empty lines but add minimal spacing
      if (line.trim() === '') {
        yPos += 4
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
      
      yPos = renderTable(doc, tableRows, marginX, yPos, pageWidth)
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
      
      // Apply appropriate styling - Helvetica font family
      const style = getTextStyle(wrappedLine)
      
      doc.setFont('Helvetica', style.weight)
      doc.setFontSize(style.size)
      doc.setTextColor(style.color[0], style.color[1], style.color[2])
      
      const indent = style.indent
      doc.text(wrappedLine, marginX + indent, yPos)
      yPos += (style.size * typography.lineHeight) + style.spacing
    }
  }
  
  return yPos
}

/**
 * Determine text styling based on content - Helvetica font family
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
  
  // Section headers - bold with top margin
  if (isSectionHeader(trimmed)) {
    return {
      weight: 'bold',
      size: typography.sectionHeader.size,
      color: colors.text,
      indent: 0,
      spacing: typography.headerMargin  // 15px top margin
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
    
    // Header text - Helvetica font
    doc.setFontSize(typography.small.size)
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
    doc.setFont('Helvetica', 'bold')
    
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
    
    // Row text - Helvetica font
    doc.setFontSize(typography.small.size)
    doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2])
    doc.setFont('Helvetica', 'normal')
    
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
 * Add professional footer to all pages - Helvetica font
 */
function addProfessionalFooter(doc: jsPDF, pageWidth: number, pageHeight: number): void {
  const pageCount = doc.getNumberOfPages()
  const now = new Date()
  const timestamp = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-GB', { hour12: false })
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    
    // Legal disclaimer (centered) - Helvetica 9pt, #555, opacity 0.7
    doc.setFontSize(9)
    doc.setTextColor(85, 85, 85) // #555
    doc.setFont('Helvetica', 'normal')
    doc.text('Internet Streets Entertainment – Not a Real Document.', pageWidth / 2, pageHeight - 15, { align: 'center' })
    
    // Timestamp (bottom left)
    doc.text(`Generated ${timestamp}`, 20, pageHeight - 15)
    
    // Page number (bottom right)
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