/**
 * Simple PDF generator using jsPDF (no Chrome/Puppeteer required)
 * Works perfectly in serverless environments like Netlify Functions
 */

import jsPDF from 'jspdf'

export function generatePDFfromJSON(slug: string, json: any): Buffer {
  const doc = new jsPDF()
  
  // Set font
  doc.setFont('helvetica')
  
  // Add subtle watermark only in footer (no giant text)
  
  // Reset text settings for content
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  
  let yPos = 30
  
  // Add document title
  if (json.document_title) {
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(json.document_title, 20, yPos)
    yPos += 15
  }
  
  // Add subject details
  if (json.subject) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Subject Information:', 20, yPos)
    yPos += 10
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    if (json.subject.name) {
      doc.text(`Name: ${json.subject.name}`, 30, yPos)
      yPos += 8
    }
    if (json.subject.dob) {
      doc.text(`Date of Birth: ${json.subject.dob}`, 30, yPos)
      yPos += 8
    }
    if (json.subject.city) {
      doc.text(`City: ${json.subject.city}`, 30, yPos)
      yPos += 8
    }
    yPos += 10
  }
  
  // Add case-specific content based on service type
  switch (slug) {
    case 'fbi-file':
      addFBIDetails(doc, json, yPos)
      break
    case 'payslip':
      addPayslipDetails(doc, json, yPos)
      break
    case 'rejection-letter':
      addRejectionLetter(doc, json, yPos)
      break
    default:
      addGenericDetails(doc, json, yPos)
  }
  
  // Add disclaimer at bottom
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text('FOR ENTERTAINMENT PURPOSES ONLY – NOT A REAL DOCUMENT', doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 15, { align: 'center' })
  
  // Convert to Buffer
  return Buffer.from(doc.output('arraybuffer'))
}

function addFBIDetails(doc: jsPDF, json: any, startY: number) {
  let yPos = startY
  
  // Case Number and Threat Level Header
  if (json.caseNumber || json.case_number) {
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`CASE FILE: ${json.caseNumber || json.case_number}`, 20, yPos)
    yPos += 12
  }
  
  // Threat Level Badge
  if (json.threatLevel || json.threat_level) {
    doc.setFontSize(14)
    const threat = json.threatLevel || json.threat_level
    const threatColor = getThreatLevelColor(threat)
    doc.setTextColor(threatColor.r, threatColor.g, threatColor.b)
    doc.text(`CLASSIFICATION: ${threat}`, 20, yPos)
    doc.setTextColor(0, 0, 0) // Reset to black
    yPos += 15
  }
  
  // Subject Header
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('SUBJECT INFORMATION', 20, yPos)
  yPos += 15
  
  // Subject Details Table
  drawTableHeader(doc, 'FIELD', 'DETAILS', yPos)
  yPos += 8
  
  const subjectData = [
    ['Full Name', json.subject?.name || 'REDACTED'],
    ['DOB', json.subject?.dob || 'REDACTED'],
    ['Location', json.subject?.city || 'REDACTED'],
    ['Status', 'ACTIVE MONITORING']
  ]
  
  subjectData.forEach(([field, value]) => {
    drawTableRow(doc, field, value, yPos)
    yPos += 10
  })
  
  yPos += 10
  
  // Summary Section
  if (json.summary) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('INTELLIGENCE SUMMARY', 20, yPos)
    yPos += 15
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    const summaryLines = doc.splitTextToSize(json.summary, 170)
    doc.text(summaryLines as string[], 20, yPos)
    yPos += summaryLines.length * 6 + 10
  }
  
  // Allegations Section
  if (json.allegations && Array.isArray(json.allegations)) {
    yPos += 5
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('KNOWN ALLEGATIONS', 20, yPos)
    yPos += 15
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    json.allegations.forEach((allegation: string, index: number) => {
      doc.text(`${index + 1}. ${allegation}`, 25, yPos)
      yPos += 8
    })
    yPos += 10
  }
  
  // Surveillance Logs Section
  if (json.surveillanceLogs && Array.isArray(json.surveillanceLogs)) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('SURVEILLANCE LOG', 20, yPos)
    yPos += 15
    
    // Table headers
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Timestamp', 20, yPos)
    doc.text('Activity', 75, yPos)
    doc.text('Severity', 140, yPos)
    yPos += 10
    
    // Table rows
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    json.surveillanceLogs.forEach((log: any) => {
      if (yPos > 250) return // Start new page if needed
      doc.text(log.timestamp || 'REDACTED', 20, yPos)
      doc.text(log.activity || 'REDACTED', 75, yPos)
      doc.text(log.severity || 'NORMAL', 140, yPos)
      yPos += 8
    })
    yPos += 15
  }
  
  // Analyst Notes Section
  if (json.analystNotes) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('ANALYST NOTES', 20, yPos)
    yPos += 15
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    const noteLines = doc.splitTextToSize(json.analystNotes, 170)
    doc.text(noteLines as string[], 20, yPos)
    yPos += noteLines.length * 6 + 10
  }
  
  // Recommendation Section
  if (json.recommendation) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('RECOMMENDATION', 20, yPos)
    yPos += 15
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    const recLines = doc.splitTextToSize(json.recommendation, 170)
    doc.text(recLines as string[], 20, yPos)
  }
}

function getThreatLevelColor(threatLevel: string) {
  switch (threatLevel?.toUpperCase()) {
    case 'CRITICAL':
      return { r: 180, g: 0, b: 0 }
    case 'HIGH':
      return { r: 200, g: 100, b: 0 }
    case 'MEDIUM':
      return { r: 200, g: 200, b: 0 }
    case 'LOW':
      return { r: 0, g: 150, b: 0 }
    default:
      return { r: 100, g: 100, b: 100 }
  }
}

function drawTableHeader(doc: jsPDF, col1: string, col2: string, y: number) {
  doc.setFillColor(240, 240, 240)
  doc.rect(20, y - 5, 170, 12, 'F')
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(col1, 25, y + 2)
  doc.text(col2, 100, y + 2)
}

function drawTableRow(doc: jsPDF, col1: string, col2: string, y: number) {
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(col1, 25, y + 2)
  doc.text(col2, 100, y + 2)
}

// Add subtle diagonal watermark function
function addWatermark(doc: jsPDF) {
  // This would require more complex jsPDF functionality
  // For now, we'll stick with the footer disclaimer
  // Could be enhanced later with rotated text or images
}

function addPayslipDetails(doc: jsPDF, json: any, startY: number) {
  let yPos = startY
  
  // Header Section with borders
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  doc.rect(20, yPos - 5, 170, 35)
  
  // Company Header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(json.document_title || 'PAYSLIP', 95, yPos + 8, { align: 'center' })
  
  if (json.employer && json.employer.company) {
    doc.setFontSize(14)
    doc.text(json.employer.company, 95, yPos + 15, { align: 'center' })
  }
  
  if (json.pay_period && json.pay_period.pay_date) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Payment Date: ${json.pay_period.pay_date}`, 95, yPos + 22, { align: 'center' })
  }
  
  yPos += 40
  
  // Employee Information Table
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('EMPLOYEE INFORMATION', 20, yPos)
  yPos += 15
  
  const empData = [
    ['Employee Name', json.employee?.name || 'REDACTED'],
    ['Job Title', json.employee?.job_title || 'REDACTED'],
    ['Employee Number', json.references?.employee_no || 'REDACTED'],
    ['Payslip Number', json.references?.slip_no || 'REDACTED']
  ]
  
  empData.forEach(([field, value]) => {
    drawTableRow(doc, field, value, yPos)
    yPos += 10
  })
  
  yPos += 15
  
  // Payment Details with proper table styling
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('PAYMENT SUMMARY', 95, yPos, { align: 'center' })
  yPos += 15
  
  // Draw payment table
  doc.setFillColor(240, 240, 240)
  doc.rect(20, yPos - 5, 170, 8, 'F')
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Description', 25, yPos + 2)
  doc.text('Amount (£)', 140, yPos + 2)
  yPos += 8
  
  // Payment details
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  
  const paymentDetails = [
    ['Basic Pay', json.amounts?.gross_pay_gbp || '0.00'],
    ['Gross Pay', json.amounts?.gross_pay_gbp || '0.00'],
    ['Tax Deduction', `-${json.amounts?.tax_amount_gbp || '0.00'}`],
    ['National Insurance', `-${json.amounts?.ni_amount_gbp || '0.00'}`]
  ]
  
  paymentDetails.forEach(([desc, amount]) => {
    doc.text(desc, 25, yPos + 2)
    doc.text(amount, 140, yPos + 2)
    yPos += 8
  })
  
  // Net Pay - highlighted
  yPos += 5
  doc.setFillColor(220, 220, 220)
  doc.rect(20, yPos - 5, 170, 12, 'F')
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Net Pay', 25, yPos + 2)
  doc.text(`£${json.amounts?.net_pay_gbp || '0.00'}`, 140, yPos + 2)
  
  yPos += 20
  
  // Additional info
  if (json.amounts) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Tax Rate: ${(json.amounts.tax_rate * 100).toFixed(1)}%`, 20, yPos)
    doc.text(`NI Rate: ${(json.amounts.ni_rate * 100).toFixed(1)}%`, 120, yPos)
  }
}

function addRejectionLetter(doc: jsPDF, json: any, startY: number) {
  let yPos = startY
  
  if (json.date) {
    doc.setFontSize(12)
    doc.text(`Date: ${new Date(json.date).toLocaleDateString()}`, 20, yPos)
    yPos += 20
  }
  
  if (json.salutation) {
    doc.text(json.salutation, 20, yPos)
    yPos += 15
  }
  
  if (json.opening) {
    const openingLines = doc.splitTextToSize(json.opening, 170)
    doc.text(openingLines as string[], 20, yPos)
    yPos += openingLines.length * 6 + 10
  }
  
  if (json.reasoning && Array.isArray(json.reasoning)) {
    doc.text('Key considerations included:', 20, yPos)
    yPos += 10
    json.reasoning.forEach((reason: string) => {
      doc.text(`• ${reason}`, 30, yPos)
      yPos += 6
    })
    yPos += 10
  }
  
  if (json.closing) {
    const closingLines = doc.splitTextToSize(json.closing, 170)
    doc.text(closingLines as string[], 20, yPos)
    yPos += closingLines.length * 6 + 15
  }
  
  if (json.signature_block) {
    doc.setFont('helvetica', 'bold')
    doc.text(json.signature_block.name, 20, yPos)
    yPos += 8
    doc.setFont('helvetica', 'normal')
    doc.text(json.signature_block.title, 20, yPos)
    yPos += 8
    doc.text(json.signature_block.company, 20, yPos)
  }
}

function addGenericDetails(doc: jsPDF, json: any, startY: number) {
  let yPos = startY
  
  // Add any other fields that are strings
  Object.entries(json).forEach(([key, value]) => {
    if (typeof value === 'string' && key !== 'document_title' && key !== 'disclaimer') {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`${key}: ${value}`, 20, yPos)
      yPos += 10
    }
  })
}