/**
 * Professional PDF Generator for Internet Streets
 * Fixed structure with trusted inputs and clean rendering
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
 * Render a professional document to PDF
 */
export async function renderServiceToPdf(
  slug: string, 
  document: PlainTextDocument, 
  brand?: GeneratedBrand,
  sanitizedInputs?: SanitizedInputs
): Promise<Buffer> {
  const doc = new jsPDF()
  
  // Consistent typography and margins
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(10)
  doc.setLineHeightFactor(1.25)
  
  const pageHeight = doc.internal.pageSize.height
  const pageWidth = doc.internal.pageSize.width
  const marginX = 20
  const marginY = 25
  const maxW = pageWidth - marginX * 2
  
  // Professional background
  doc.setFillColor(248, 248, 248)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')
  
  // Clean and structure text based on service type
  let cleanedText: string
  let inputs: FBIInputs | null = null
  
  if (slug === 'fbi-file' && document.metadata) {
    // FBI-specific cleaning with inputs
    inputs = {
      fullName: sanitizeSingleLine(document.metadata.name),
      dateOfBirth: sanitizeSingleLine(document.metadata.dob),
      city: sanitizeSingleLine(document.metadata.city),
      occupation: sanitizeSingleLine(document.metadata.companyName)
    }
    const result = cleanAndStructureFBI(document.text, inputs)
    cleanedText = result.body
  } else {
    // Generic cleaning for other services
    cleanedText = cleanGeneric(document.text)
  }
  
  let yPos = marginY + 15
  
  // Add service logo (first page only, small and top-right)
  await addLogoFirstPage(doc, slug, pageWidth)
  
  // Add document header based on service type
  if (slug === 'fbi-file' && inputs) {
    yPos = addFBIHeader(doc, inputs, pageWidth, yPos)
  } else {
    yPos = addGenericHeader(doc, slug, pageWidth, yPos)
  }
  
  // Render main content with proper paragraph handling
  yPos = renderContent(doc, cleanedText, yPos, pageWidth, pageHeight, marginX, marginY, maxW)
  
  // Add professional footer to all pages (AFTER content is laid out)
  renderFooter(doc, pageWidth, pageHeight)
  
  return Buffer.from(doc.output('arraybuffer'))
}

/**
 * Add FBI-specific header with trusted subject block
 */
function addFBIHeader(doc: jsPDF, inputs: FBIInputs, pageWidth: number, yPos: number): number {
  // Title - 12pt bold uppercase
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('FEDERAL BUREAU OF INVESTIGATION — INTELLIGENCE DOSSIER', 20, yPos)
  yPos += 8
  
  // Divider line
  doc.setDrawColor(200)
  doc.line(20, yPos, pageWidth - 20, yPos)
  yPos += 10
  
  // Case ref and date - 10pt normal
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(10)
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  doc.text(`CASE REF: ${generateCaseRef('FBI')}    DATE: ${today}`, 20, yPos)
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
    doc.text(line, 20, yPos)
    yPos += 6
  })
  
  yPos += 10
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
  
  // Title - 12pt bold uppercase
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(title, 20, yPos)
  yPos += 8
  
  // Divider line
  doc.setDrawColor(200)
  doc.line(20, yPos, pageWidth - 20, yPos)
  yPos += 15
  
  return yPos
}

/**
 * Add logo first page only - small and top-right
 */
async function addLogoFirstPage(doc: jsPDF, slug: string, pageWidth: number): Promise<void> {
  const logoUrl = logoMap[slug]
  
  if (!logoUrl) {
    console.log(`No logo found for service: ${slug}`)
    return
  }
  
  try {
    // Load logo from absolute URL (Node.js compatible)
    const logoDataUrl = await loadImageBase64(logoUrl, 'image/png')
    
    // Small logo positioning: top-right corner
    const logoW = 42
    const logoH = 42
    const logoX = pageWidth - 20 - logoW  // 20px right margin
    const logoY = 20                      // 20px top margin
    
    // Add logo image (PNG format)
    doc.addImage(logoDataUrl, 'PNG', logoX, logoY, logoW, logoH)
    
    console.log(`✅ Logo successfully added for service: ${slug} (first page only)`)
  } catch (error) {
    console.warn(`⚠️ Failed to load logo for service ${slug}: ${error}`)
    // Add a placeholder text instead of failing completely
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.setFont('Helvetica', 'normal')
    doc.text(`[${slug.toUpperCase()}]`, pageWidth - 30, 25)
    console.log(`📝 Added text placeholder for missing logo: ${slug}`)
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
  pageHeight: number,
  marginX: number,
  marginY: number,
  maxW: number
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
      yPos = drawSectionHeader(doc, line, yPos, pageWidth, pageHeight, marginX, marginY)
      continue
    }
    
    // Handle regular text as paragraphs
    yPos = drawParagraph(doc, line, yPos, pageWidth, pageHeight, marginX, marginY, maxW)
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
  pageHeight: number,
  marginX: number,
  marginY: number
): number {
  // Check for new page
  if (yPos > pageHeight - marginY - 30) {
    doc.addPage()
    yPos = marginY
  }
  
  yPos += 10
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(title.toUpperCase(), marginX, yPos)
  yPos += 8
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(10)
  
  return yPos
}

/**
 * Draw paragraph with proper wrapping - 10pt normal
 */
function drawParagraph(
  doc: jsPDF, 
  text: string, 
  yPos: number, 
  pageWidth: number, 
  pageHeight: number,
  marginX: number,
  marginY: number,
  maxW: number
): number {
  const lines = doc.splitTextToSize(text, maxW)
  
  for (const line of lines) {
    // Check for new page
    if (yPos > pageHeight - marginY - 16) {
      doc.addPage()
      yPos = marginY
    }
    
    doc.text(line, marginX, yPos)
    yPos += 5
  }
  
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
 * Render footer after content is laid out
 */
function renderFooter(doc: jsPDF, pageWidth: number, pageHeight: number): void {
  const pages = doc.getNumberOfPages()
  
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    const w = pageWidth
    const h = pageHeight
    
    // Timestamp (left), disclaimer (center), page number (right)
    const ts = new Date().toLocaleString('en-GB', { hour12: false })
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(85)
    
    doc.text(`Generated ${ts}`, 20, h - 12)
    doc.text('Internet Streets Entertainment – Not a Real Document.', w / 2, h - 12, { align: 'center' })
    doc.text(`Page ${i} of ${pages}`, w - 20, h - 12, { align: 'right' })
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