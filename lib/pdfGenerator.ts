/**
 * Professional PDF Generator for Internet Streets
 * Refined typography and layout for realism and polish
 */

import jsPDF from 'jspdf'
import { GeneratedBrand } from '@/lib/brand'
import { SanitizedInputs } from '@/lib/promptBuilder'
import { cleanAndStructureFBI, cleanGeneric, generateCaseRef, loadImageBase64, sanitizeSingleLine, FBIInputs } from '@/lib/textClean'

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
 * Logo mapping for all services - Absolute URLs
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
 * Typographic System
 */
const typography = {
  title: { size: 14, weight: 'bold' as const, align: 'center' as const },
  sectionHeader: { size: 11, weight: 'bold' as const, spacingBefore: 10, spacingAfter: 4 },
  body: { size: 10, weight: 'normal' as const, lineHeight: 1.3, align: 'justify' as const },
  monospace: { size: 9, weight: 'normal' as const, font: 'Courier' as const },
  footer: { size: 9, weight: 'normal' as const }
}

/**
 * Page Layout
 */
const layout = {
  marginTop: 25,    // 25mm top
  marginSides: 20,  // 20mm sides
  marginBottom: 25, // 25mm bottom
  sectionSpacing: 10, // 10px before new section
  footerPadding: 15   // 15px from bottom
}

/**
 * Render a professional document to PDF - Detailed logging
 */
export async function renderServiceToPdf(
  slug: string, 
  document: PlainTextDocument, 
  brand?: GeneratedBrand,
  sanitizedInputs?: SanitizedInputs
): Promise<Buffer> {
  console.log(`📄 Starting PDF generation for service: ${slug}`)
  console.log(`📊 Document text length: ${document.text.length} characters`)
  
  const doc = new jsPDF()
  
  const pageHeight = doc.internal.pageSize.height
  const pageWidth = doc.internal.pageSize.width
  
  console.log(`📐 Page dimensions: ${pageWidth}x${pageHeight}`)
  
  // Clean and structure text based on service type
  let cleanedText: string
  let inputs: FBIInputs | null = null
  
  if (slug === 'fbi-file' && document.metadata) {
    console.log(`🔍 Processing FBI file with metadata:`, document.metadata)
    // FBI-specific cleaning with inputs
    inputs = {
      fullName: sanitizeSingleLine(document.metadata.name),
      dateOfBirth: sanitizeSingleLine(document.metadata.dob),
      city: sanitizeSingleLine(document.metadata.city),
      occupation: sanitizeSingleLine(document.metadata.companyName)
    }
    const result = cleanAndStructureFBI(document.text, inputs)
    cleanedText = result.body
    console.log(`🧹 Cleaned FBI text length: ${cleanedText.length} characters`)
  } else {
    console.log(`🔍 Processing generic service: ${slug}`)
    // Generic cleaning for other services
    cleanedText = cleanGeneric(document.text)
    console.log(`🧹 Cleaned generic text length: ${cleanedText.length} characters`)
  }
  
  // Normalize line breaks before rendering
  cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n')
  console.log(`📝 Final text length after normalization: ${cleanedText.length} characters`)
  
  // Add service logo (first page only) - positioned first
  console.log(`🖼️ Adding logo for service: ${slug}`)
  await addLogoFirstPage(doc, slug, pageWidth)
  
  // Start content below logo - adjust Y position to be below logo
  let yPos = layout.marginTop + 60 // Increased from 15 to 60 to clear logo
  
  // Add document header based on service type
  if (slug === 'fbi-file' && inputs) {
    console.log(`📋 Adding FBI header with subject block`)
    yPos = addFBIHeader(doc, inputs, pageWidth, yPos)
  } else {
    console.log(`📋 Adding generic header for ${slug}`)
    yPos = addGenericHeader(doc, slug, pageWidth, yPos)
  }
  
  // Add visual separation line under title
  doc.setDrawColor(210)
  doc.line(layout.marginSides, yPos - 5, pageWidth - layout.marginSides, yPos - 5)
  yPos += 10
  
  // Render main content with proper paragraph handling
  console.log(`📝 Rendering content starting at Y position: ${yPos}`)
  yPos = renderContent(doc, cleanedText, yPos, pageWidth, pageHeight)
  console.log(`📝 Content rendering completed at Y position: ${yPos}`)
  
  // Add professional footer to all pages (AFTER content is laid out)
  console.log(`📄 Adding footer to all pages`)
  renderFooter(doc, pageWidth, pageHeight)
  
  // Return PDF buffer (compression handled by jsPDF internally)
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
  console.log(`✅ PDF generation completed! Size: ${pdfBuffer.length} bytes`)
  
  return pdfBuffer
}

/**
 * Add FBI-specific header with trusted subject block
 */
function addFBIHeader(doc: jsPDF, inputs: FBIInputs, pageWidth: number, yPos: number): number {
  // Title - 14pt bold uppercase, centered
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(typography.title.size)
  doc.text('FEDERAL BUREAU OF INVESTIGATION — INTELLIGENCE DOSSIER', pageWidth / 2, yPos, { align: 'center' })
  yPos += 15
  
  // Case ref and date - 10pt normal
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(typography.body.size)
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  doc.text(`CASE REF: ${generateCaseRef('FBI')}    DATE: ${today}`, layout.marginSides, yPos)
  yPos += 15
  
  // Subject info (trusted inputs only, no AI parsing)
  const subj = {
    name: sanitizeSingleLine(inputs.fullName),
    dob: sanitizeSingleLine(inputs.dateOfBirth),
    city: sanitizeSingleLine(inputs.city),
    occupation: sanitizeSingleLine(inputs.occupation)
  }
  
  const subjLines = [
    `Name: ${subj.name}`,
    `Date of Birth: ${subj.dob}`,
    `City: ${subj.city}`,
    `Occupation: ${subj.occupation}`
  ]
  
  subjLines.forEach(line => {
    doc.text(line, layout.marginSides, yPos)
    yPos += 6
  })
  
  yPos += layout.sectionSpacing
  return yPos
}

/**
 * Add generic header for other services
 */
function addGenericHeader(doc: jsPDF, slug: string, pageWidth: number, yPos: number): number {
  const serviceNames: Record<string, string> = {
    'nsa-surveillance': 'NATIONAL SECURITY AGENCY — SURVEILLANCE REPORT',
    'criminal-record': 'GOVERNMENT CRIMINAL RECORD EXTRACT',
    'universal-credit': 'UNIVERSAL CREDIT ASSESSMENT SUMMARY',
    'payslip': 'STATEMENT OF EARNINGS',
    'credit-score': 'CREDIT SCORE REPORT',
    'job-rejection': 'APPLICATION OUTCOME NOTIFICATION',
    'rent-reference': 'TENANCY REFERENCE LETTER',
    'school-behaviour': 'SCHOOL BEHAVIOUR REPORT',
    'college-degree': 'DEGREE CERTIFICATE'
  }
  
  const title = serviceNames[slug] || 'DOCUMENT'
  
  // Title - 14pt bold uppercase, centered
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(typography.title.size)
  doc.text(title, pageWidth / 2, yPos, { align: 'center' })
  yPos += 20
  
  return yPos
}

/**
 * Add logo first page only - 38px width, positioned top-right (Optimized)
 */
async function addLogoFirstPage(doc: jsPDF, slug: string, pageWidth: number): Promise<void> {
  const logoUrl = logoMap[slug]
  
  if (!logoUrl) {
    console.log(`No logo found for service: ${slug}`)
    return
  }
  
  try {
    // Load logo from absolute URL (Node.js compatible) with timeout
    const logoDataUrl = await Promise.race([
      loadImageBase64(logoUrl, 'image/png'),
      new Promise<string>((_, reject) => 
        setTimeout(() => reject(new Error('Logo load timeout')), 2000)
      )
    ]) as string
    
    // Logo positioning: top-right corner, smaller size to avoid overlap
    const logoWidth = 30
    const logoHeight = 30  // Smaller to avoid title overlap
    const logoX = pageWidth - layout.marginSides - logoWidth  // Right margin
    const logoY = layout.marginTop + 5  // Top margin
    
    // Add logo image (PNG format)
    doc.addImage(logoDataUrl, 'PNG', logoX, logoY, logoWidth, logoHeight)
    
    console.log(`✅ Logo successfully added for service: ${slug} (first page only)`)
  } catch (error) {
    console.warn(`⚠️ Failed to load logo for service ${slug}: ${error}`)
    // Skip logo entirely for faster generation
    console.log(`📝 Skipping logo for faster generation: ${slug}`)
  }
}

/**
 * Render content with proper paragraph handling
 */
function renderContent(
  doc: jsPDF, 
  content: string, 
  startY: number, 
  pageWidth: number, 
  pageHeight: number
): number {
  const lines = content.split('\n')
  let yPos = startY
  
  for (const line of lines) {
    // Skip empty lines but add minimal spacing
    if (line.trim() === '') {
      yPos += 4
      continue
    }
    
    // Check for section headers
    if (isSectionHeader(line)) {
      yPos = drawSectionHeader(doc, line, yPos, pageWidth, pageHeight)
      continue
    }
    
    // Check for table/monospace content
    if (isTableOrMonospace(line)) {
      yPos = drawMonospaceLine(doc, line, yPos, pageWidth, pageHeight)
      continue
    }
    
    // Handle regular text as paragraphs
    yPos = drawParagraph(doc, line, yPos, pageWidth, pageHeight)
  }
  
  return yPos
}

/**
 * Draw section header - 11pt bold uppercase
 */
function drawSectionHeader(
  doc: jsPDF, 
  title: string, 
  yPos: number, 
  pageWidth: number, 
  pageHeight: number
): number {
  // Check for new page
  if (yPos > pageHeight - layout.marginBottom - 30) {
    doc.addPage()
    yPos = layout.marginTop
  }
  
  yPos += typography.sectionHeader.spacingBefore
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(typography.sectionHeader.size)
  doc.text(title.toUpperCase(), layout.marginSides, yPos)
  yPos += typography.sectionHeader.spacingAfter
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(typography.body.size)
  
  return yPos
}

/**
 * Draw paragraph with justified alignment - 10pt normal
 */
function drawParagraph(
  doc: jsPDF, 
  text: string, 
  yPos: number, 
  pageWidth: number, 
  pageHeight: number
): number {
  const maxW = pageWidth - layout.marginSides * 2
  const lines = doc.splitTextToSize(text, maxW)
  
  for (const line of lines) {
    // Check for new page
    if (yPos > pageHeight - layout.marginBottom - layout.footerPadding) {
      doc.addPage()
      yPos = layout.marginTop
    }
    
    doc.text(line, layout.marginSides, yPos, { align: 'justify' })
    yPos += typography.body.lineHeight * 4 // Convert line height to points
  }
  
  return yPos
}

/**
 * Draw monospace line for tables/logs - 9pt Courier
 */
function drawMonospaceLine(
  doc: jsPDF, 
  text: string, 
  yPos: number, 
  pageWidth: number, 
  pageHeight: number
): number {
  // Check for new page
  if (yPos > pageHeight - layout.marginBottom - layout.footerPadding) {
    doc.addPage()
    yPos = layout.marginTop
  }
  
  doc.setFont('Courier', 'normal')
  doc.setFontSize(typography.monospace.size)
  
  const maxW = pageWidth - layout.marginSides * 2
  const lines = doc.splitTextToSize(text, maxW)
  
  for (const line of lines) {
    // Check for new page
    if (yPos > pageHeight - layout.marginBottom - layout.footerPadding) {
      doc.addPage()
      yPos = layout.marginTop
    }
    
    doc.text(line, layout.marginSides, yPos)
    yPos += 4
  }
  
  // Reset to body font
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(typography.body.size)
  
  return yPos
}

/**
 * Check if line is a section header
 */
function isSectionHeader(line: string): boolean {
  const patterns = [
    /^EXECUTIVE SUMMARY$/i,
    /^KEY FINDINGS$/i,
    /^SURVEILLANCE ACTIVITY LOG$/i,
    /^ANALYST NOTES$/i,
    /^THREAT ASSESSMENT.*$/i,
    /^SUMMARY$/i,
    /^ANALYSIS$/i,
    /^FINDINGS$/i,
    /^RECOMMENDATIONS$/i,
    /^ASSESSMENT$/i,
    /^DETAILS$/i,
    /^INFORMATION$/i
  ]
  
  return patterns.some(pattern => pattern.test(line.trim()))
}

/**
 * Check if line is table or monospace content
 */
function isTableOrMonospace(line: string): boolean {
  return line.startsWith('|') || 
         /^\d+\.\s/.test(line) || 
         /^\s*[-•]\s/.test(line) ||
         /^\s*\d{4}-\d{2}-\d{2}/.test(line) // Date patterns
}

/**
 * Render footer after content is laid out
 */
function renderFooter(doc: jsPDF, pageWidth: number, pageHeight: number): void {
  const pages = doc.getNumberOfPages()
  
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    const w = pageWidth
    const h = pageHeight
    
    // Add visual separation line above footer on page 1
    if (i === 1) {
      doc.setDrawColor(210)
      doc.line(layout.marginSides, h - layout.footerPadding - 5, w - layout.marginSides, h - layout.footerPadding - 5)
    }
    
    // Timestamp (left), disclaimer (center), page number (right)
    const ts = new Date().toLocaleString('en-GB', { hour12: false })
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(typography.footer.size)
    doc.setTextColor(85)
    
    doc.text(`Generated ${ts}`, layout.marginSides, h - layout.footerPadding)
    doc.text('Internet Streets Entertainment – Not a Real Document.', w / 2, h - layout.footerPadding, { align: 'center' })
    doc.text(`Page ${i} of ${pages}`, w - layout.marginSides, h - layout.footerPadding, { align: 'right' })
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