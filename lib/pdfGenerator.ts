/**
 * Simple PDF generator using jsPDF (no Chrome/Puppeteer required)
 * Works perfectly in serverless environments like Netlify Functions
 */

import jsPDF from 'jspdf'

export function generatePDFfromJSON(slug: string, json: any): Buffer {
  const doc = new jsPDF()
  
  // Set font
  doc.setFont('helvetica')
  
  // Add watermark
  doc.setFontSize(48)
  doc.setTextColor(200, 200, 200)
  // Watermark text (no rotation as jsPDF doesn't support it easily)
  doc.text('INTERNET STREETS', 15, 50)
  doc.text('ENTERTAINMENT', 25, 70)
  
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
  doc.setTextColor(100, 100, 100)
  doc.text('FOR ENTERTAINMENT ONLY. NOT A REAL DOCUMENT.', 20, doc.internal.pageSize.height - 20, { align: 'center' })
  
  // Convert to Buffer
  return Buffer.from(doc.output('arraybuffer'))
}

function addFBIDetails(doc: jsPDF, json: any, startY: number) {
  let yPos = startY
  
  if (json.case_number) {
    doc.setFontSize(12)
    doc.text(`Case Number: ${json.case_number}`, 20, yPos)
    yPos += 15
  }
  
  if (json.threat_level) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`Threat Level: ${json.threat_level}`, 20, yPos)
    yPos += 15
  }
  
  if (json.summary) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Summary:', 20, yPos)
    yPos += 8
    const summaryLines = doc.splitTextToSize(json.summary, 170)
    doc.text(summaryLines as string[], 30, yPos)
    yPos += summaryLines.length * 6
  }
  
  if (json.allegations && Array.isArray(json.allegations)) {
    doc.text('Allegations:', 20, yPos)
    yPos += 8
    json.allegations.forEach((allegation: string, index: number) => {
      doc.text(`• ${allegation}`, 30, yPos)
      yPos += 6
    })
  }
}

function addPayslipDetails(doc: jsPDF, json: any, startY: number) {
  let yPos = startY
  
  if (json.employee && json.employee.name) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`Employee: ${json.employee.name}`, 20, yPos)
    yPos += 15
  }
  
  if (json.employer && json.employer.company) {
    doc.text(`Company: ${json.employer.company}`, 20, yPos)
    yPos += 15
  }
  
  if (json.pay_period && json.pay_period.pay_date) {
    doc.text(`Pay Date: ${json.pay_period.pay_date}`, 20, yPos)
    yPos += 20
  }
  
  if (json.amounts) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Payment Details:', 20, yPos)
    yPos += 15
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    
    if (json.amounts.gross_pay_gbp) {
      doc.text(`Gross Pay: £${json.amounts.gross_pay_gbp}`, 30, yPos)
      yPos += 10
    }
    if (json.amounts.tax_amount_gbp) {
      doc.text(`Tax: £${json.amounts.tax_amount_gbp}`, 30, yPos)
      yPos += 10
    }
    if (json.amounts.ni_amount_gbp) {
      doc.text(`National Insurance: £${json.amounts.ni_amount_gbp}`, 30, yPos)
      yPos += 10
    }
    if (json.amounts.net_pay_gbp) {
      doc.setFont('helvetica', 'bold')
      doc.text(`Net Pay: £${json.amounts.net_pay_gbp}`, 30, yPos)
    }
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