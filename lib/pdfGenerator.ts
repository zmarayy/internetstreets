/**
 * Professional PDF Generator for Internet Streets
 * Clean, structured document generation with proper footers
 */

import jsPDF from 'jspdf'
import { GeneratedBrand } from '@/lib/brand'
import { SanitizedInputs } from '@/lib/promptBuilder'
import { cleanAndStructureFBI, cleanGeneric, generateCaseRef, loadImageBase64, FBIInputs } from '@/lib/textClean'

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
 * Professional color scheme
 */
const colors = {
  background: [248, 248, 248] as [number, number, number], // #f8f8f8
  text: [0, 0, 0] as [number, number, number], // #000
  textSecondary: [60, 60, 60] as [number, number, number], // #3c3c3c
  textMuted: [120, 120, 120] as [number, number, number], // #787878
  border: [170, 170, 170] as [number, number, number], // #aaaaaa
  divider: [204, 204, 204] as [number, number, number], // #ccc
  footer: [85, 85, 85] as [number, number, number] // #555
}

/**
 * Typography settings - Optimized for page count
 */
const typography = {
  title: { size: 12, weight: 'bold' as const },
  sectionHeader: { size: 11, weight: 'bold' as const },
  body: { size: 10, weight: 'normal' as const },
  small: { size: 9, weight: 'normal' as const },
  lineHeight: 1.25,
  sectionSpacing: 8,
  headerMargin: 5
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
  
  // Professional styling - Helvetica with tighter defaults
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(10)
  doc.setLineHeightFactor(1.25)
  
  const pageHeight = doc.internal.pageSize.height
  const pageWidth = doc.internal.pageSize.width
  const marginX = 20
  const marginY = 25
  
  // Professional background
  doc.setFillColor(colors.background[0], colors.background[1], colors.background[2])
  doc.rect(0, 0, pageWidth, pageHeight, 'F')
  
  // Clean and structure text based on service type
  let cleanedText: string
  let inputs: FBIInputs | null = null
  
  if (slug === 'fbi-file' && document.metadata) {
    // FBI-specific cleaning with inputs
    inputs = {
      fullName: document.metadata.name || 'Unknown Subject',
      dateOfBirth: document.metadata.dob || 'Unknown',
      city: document.metadata.city || 'Unknown',
      occupation: document.metadata.companyName || 'Unknown'
    }
    const result = cleanAndStructureFBI(document.text, inputs)
    cleanedText = result.body
  } else {
    // Generic cleaning for other services
    cleanedText = cleanGeneric(document.text)
  }
  
  let yPos = marginY + 15
  
  // Add service logo (first page only)
  await addServiceLogo(doc, slug, pageWidth, pageHeight)
  
  // Add document header based on service type
  if (slug === 'fbi-file' && inputs) {
    yPos = addFBIHeader(doc, inputs, pageWidth, yPos)
  } else {
    yPos = addGenericHeader(doc, slug, pageWidth, yPos)
  }
  
  // Render main content with proper paragraph handling
  yPos = renderContent(doc, cleanedText, yPos, pageWidth, pageHeight, marginX, marginY)
  
  // Add professional footer to all pages (AFTER content is laid out)
  addProfessionalFooter(doc, pageWidth, pageHeight, marginX)
  
  return Buffer.from(doc.output('arraybuffer'))
}

/**
 * Add FBI-specific header with subject block
 */
function addFBIHeader(doc: jsPDF, inputs: FBIInputs, pageWidth: number, yPos: number): number {
  // Title + case ref line
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('FEDERAL BUREAU OF INVESTIGATION — INTELLIGENCE DOSSIER', 20, yPos)
  yPos += 8
  
  // Divider line
  doc.setDrawColor(200)
  doc.line(20, yPos, pageWidth - 20, yPos)
  yPos += 10
  
  // Case ref and date
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(10)
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  doc.text(`CASE REF: ${generateCaseRef('FBI')}    DATE: ${today}`, 20, yPos)
  yPos += 15
  
  // Subject info (deduped, from inputs)
  const subjLines = [
    `Name: ${inputs.fullName}`,
    `Date of Birth: ${inputs.dateOfBirth}`,
    `City: ${inputs.city}`,
    `Occupation: ${inputs.occupation}`
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
 * Add service logo (first page only)
 */
async function addServiceLogo(doc: jsPDF, slug: string, pageWidth: number, pageHeight: number): Promise<void> {
  const logoUrl = logoMap[slug]
  
  if (!logoUrl) {
    console.log(`No logo found for service: ${slug}`)
    return
  }
  
  try {
    // Load logo from absolute URL (Node.js compatible)
    const logoDataUrl = await loadImageBase64(logoUrl, 'image/png')
    
    // Logo positioning: top-right corner
    const logoX = pageWidth - 130  // ~20mm from right edge
    const logoY = 28               // ~20mm from top edge
    const logoWidth = 90           // Realistic size
    const logoHeight = 90          // Maintain aspect ratio
    
    // Add logo image (PNG format)
    doc.addImage(logoDataUrl, 'PNG', logoX, logoY, logoWidth, logoHeight)
    
    console.log(`✅ Logo successfully added for service: ${slug}`)
  } catch (error) {
    console.warn(`⚠️ Failed to load logo for service ${slug}: ${error}`)
    // Add a placeholder text instead of failing completely
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.setFont('Helvetica', 'normal')
    doc.text(`[${slug.toUpperCase()}]`, pageWidth - 30, 35)
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
  marginY: number
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
    yPos = drawParagraph(doc, line, yPos, pageWidth, pageHeight, marginX, marginY)
  }
  
  return yPos
}

/**
 * Draw section header
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
 * Draw paragraph with proper wrapping
 */
function drawParagraph(
  doc: jsPDF, 
  text: string, 
  yPos: number, 
  pageWidth: number, 
  pageHeight: number,
  marginX: number,
  marginY: number
): number {
  const maxW = pageWidth - marginX * 2
  const lines = doc.splitTextToSize(text, maxW)
  
  for (const line of lines) {
    // Check for new page
    if (yPos > pageHeight - marginY - 18) {
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
 * Add professional footer to all pages (AFTER content is laid out)
 */
function addProfessionalFooter(doc: jsPDF, pageWidth: number, pageHeight: number, marginX: number): void {
  const pageCount = doc.getNumberOfPages()
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    const w = pageWidth
    const h = pageHeight
    
    // Timestamp (left), disclaimer (center), page number (right)
    const ts = new Date().toLocaleString('en-GB', { hour12: false })
    doc.setFontSize(9)
    doc.setTextColor(colors.footer[0], colors.footer[1], colors.footer[2])
    doc.setFont('Helvetica', 'normal')
    
    doc.text(`Generated ${ts}`, marginX, h - 12)
    doc.text('Internet Streets Entertainment – Not a Real Document.', w / 2, h - 12, { align: 'center' })
    doc.text(`Page ${i} of ${pageCount}`, w - marginX, h - 12, { align: 'right' })
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