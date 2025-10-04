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
    case 'nsa-surveillance':
      addNSADetails(doc, json, yPos)
      break
    case 'criminal-record':
      addCriminalRecordDetails(doc, json, yPos)
      break
    case 'universal-credit':
      addUniversalCreditDetails(doc, json, yPos)
      break
    case 'credit-score':
      addCreditScoreDetails(doc, json, yPos)
      break
    case 'payslip':
      addPayslipDetails(doc, json, yPos)
      break
    case 'job-rejection':
      addJobRejectionDetails(doc, json, yPos)
      break
    case 'rent-reference':
      addRentReferenceDetails(doc, json, yPos)
      break
    case 'school-report':
      addSchoolReportDetails(doc, json, yPos)
      break
    case 'college-degree':
      addCollegeDegreeDetails(doc, json, yPos)
      break
    default:
      addGenericDetails(doc, json, yPos)
  }
  
  // Add minimal disclaimer at bottom
  doc.setFontSize(6)
  doc.setTextColor(180, 180, 180)
  doc.text('Internet Streets Entertainment – Not a Real Document', doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 8, { align: 'center' })
  
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

function addNSADetails(doc: jsPDF, json: any, startY: number) {
  let yPos = startY
  
  // Header Section
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(json.logId || 'NSA-LOG-UNKNOWN', 20, yPos)
  yPos += 10
  
  // Classification Badge
  if (json.classification) {
    doc.setFontSize(14)
    const classify = json.classification
    const classifyColor = getClassificationColor(classify)
    doc.setTextColor(classifyColor.r, classifyColor.g, classifyColor.b)
    doc.text(`CLASSIFICATION: ${classify}`, 20, yPos)
    doc.setTextColor(0, 0, 0)
    yPos += 15
  }
  
  // Subject Information
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('TARGET INFORMATION', 20, yPos)
  yPos += 15
  
  drawTableHeader(doc, 'FIELD', 'DETAILS', yPos)
  yPos += 8
  
  const subjectData = [
    ['Name', json.subject?.name || 'REDACTED'],
    ['Location', json.subject?.location || 'REDACTED'],
    ['Nationality', json.subject?.nationality || 'REDACTED'],
    ['Device Count', json.subject?.device_count?.toString() || 'REDACTED'],
    ['Log Date', json.logDate || 'REDACTED']
  ]
  
  subjectData.forEach(([field, value]) => {
    drawTableRow(doc, field, value, yPos)
    yPos += 10
  })
  
  yPos += 10
  
  // Activity Log Section
  if (json.entries && Array.isArray(json.entries)) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('SURVEILLANCE ACTIVITY LOG', 20, yPos)
    yPos += 15
    
    // Table headers
    doc.setFillColor(240, 240, 240)
    doc.rect(20, yPos - 5, 170, 12, 'F')
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Time', 25, yPos + 2)
    doc.text('Channel', 55, yPos + 2)
    doc.text('Activity', 95, yPos + 2)
    doc.text('Severity', 155, yPos + 2)
    yPos += 10
    
    // Activity entries
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    json.entries.forEach((entry: any) => {
      if (yPos > 250) return
      doc.text(entry.time || 'REDACTED', 25, yPos + 2)
      doc.text(entry.channel || 'REDACTED', 55, yPos + 2)
      doc.text(entry.detail || 'REDACTED', 95, yPos + 2)
      
      // Color-code severity
      const severity = entry.severity || 'low'
      if (severity === 'high') doc.setTextColor(200, 0, 0)
      else if (severity === 'moderate') doc.setTextColor(200, 100, 0)
      else doc.setTextColor(0, 150, 0)
      doc.text(severity.toUpperCase(), 155, yPos + 2)
      doc.setTextColor(0, 0, 0) // Reset color
      
      yPos += 8
    })
    yPos += 15
  }
  
  // Communication Analysis Section
  if (json.communicationAnalysis) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('COMMUNICATION ANALYSIS', 20, yPos)
    yPos += 15
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    const analysis = json.communicationAnalysis
    
    if (analysis.email_sentiment) {
      doc.text(`Email Sentiment: ${analysis.email_sentiment.toUpperCase()}`, 25, yPos)
      yPos += 8
    }
    if (analysis.call_patterns) {
      doc.text(`Call Patterns: ${analysis.call_patterns.toUpperCase()}`, 25, yPos)
      yPos += 8
    }
    if (analysis.social_media_activity) {
      doc.text(`Social Activity: ${analysis.social_media_activity.toUpperCase()}`, 25, yPos)
      yPos += 8
    }
    if (analysis.encrypted_communications) {
      doc.text(`Encrypted Communications: ${analysis.encrypted_communications}`, 25, yPos)
      yPos += 8
    }
    yPos += 10
  }
  
  // Technical Details Section
  if (json.technicalDetails) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('TECHNICAL DETAILS', 20, yPos)
    yPos += 15
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    
    if (json.technicalDetails.devices_tracked) {
      doc.text('Devices Tracked:', 25, yPos)
      yPos += 8
      json.technicalDetails.devices_tracked.forEach((device: string) => {
        doc.text(`• ${device}`, 35, yPos)
        yPos += 6
      })
      yPos += 5
    }
    
    if (json.technicalDetails.data_collected_gb) {
      doc.text(`Data Collected: ${json.technicalDetails.data_collected_gb} GB`, 25, yPos)
      yPos += 10
    }
  }
  
  // Flags Section
  if (json.flags && Array.isArray(json.flags)) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('SURVEILLANCE FLAGS', 20, yPos)
    yPos += 15
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    json.flags.forEach((flag: string, index: number) => {
      doc.text(`${index + 1}. ${flag}`, 25, yPos)
      yPos += 8
    })
    yPos += 10
  }
  
  // Summary Section
  if (json.analystSummary) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('ANALYST SUMMARY', 20, yPos)
    yPos += 15
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    const summaryLines = doc.splitTextToSize(json.analystSummary, 170)
    doc.text(summaryLines as string[], 20, yPos)
    yPos += summaryLines.length * 6 + 10
  }
  
  // Overall Assessment
  if (json.overallConcern) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('OVERALL ASSESSMENT', 20, yPos)
    yPos += 15
    
    doc.setFontSize(14)
    const concern = json.overallConcern
    const concernColor = getThreatLevelColor(concern)
    doc.setTextColor(concernColor.r, concernColor.g, concernColor.b)
    doc.text(`THREAT LEVEL: ${concern.toUpperCase()}`, 20, yPos)
    doc.setTextColor(0, 0, 0)
  }
}

function getClassificationColor(classification: string) {
  switch (classification?.toUpperCase()) {
    case 'TOP-SECRET':
    case 'TOP-SECEST':
      return { r: 180, g: 0, b: 0 }
    case 'SECRET':
      return { r: 200, g: 100, b: 0 }
    case 'CONFIDENTIAL':
      return { r: 200, g: 200, b: 0 }
    default:
      return { r: 100, g: 100, b: 100 }
  }
}

function addCriminalRecordDetails(doc: jsPDF, json: any, startY: number) {
  let yPos = startY
  
  // Header Section
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(json.record_id || 'CRIM-UNKNOWN', 20, yPos)
  yPos += 10
  
  // Classification Badge
  if (json.classification) {
    doc.setFontSize(14)
    const classify = json.classification
    const classifyColor = getClassificationColor(classify)
    doc.setTextColor(classifyColor.r, classifyColor.g, classifyColor.b)
    doc.text(`CLASSIFICATION: ${classify}`, 20, yPos)
    doc.setTextColor(0, 0, 0)
    yPos += 15
  }
  
  // Subject Information
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('SUBJECT INFORMATION', 20, yPos)
  yPos += 15
  
  drawTableHeader(doc, 'FIELD', 'DETAILS', yPos)
  yPos += 8
  
  const subjectData = [
    ['Name', json.subject?.name || 'REDACTED'],
    ['DOB', json.subject?.dob || 'REDACTED'],
    ['Nationality', json.subject?.nationality || 'REDACTED'],
    ['Last Known Address', json.subject?.last_known_address || 'REDACTED']
  ]
  
  subjectData.forEach(([field, value]) => {
    drawTableRow(doc, field, value, yPos)
    yPos += 10
  })
  
  yPos += 10
  
  // Criminal Offences Section
  if (json.offences && Array.isArray(json.offences)) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('CRIMINAL OFFENCES', 20, yPos)
    yPos += 15
    
    json.offences.forEach((offence: any, index: number) => {
      if (yPos > 200) return // Start new page if needed
      
      // Offence header
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(`${index + 1}. ${offence.category || 'UNKNOWN OFFENCE'}`, 20, yPos)
      yPos += 10
      
      // Offence details
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      
      const offenceData = [
        ['Date', offence.date || 'REDACTED'],
        ['Court', offence.venue || 'REDACTED'],
        ['Case Number', offence.case_number || 'REDACTED'],
        ['Charges', offence.charges || 'REDACTED'],
        ['Status', offence.status || 'REDACTED'],
        ['Sentencing', offence.sentencing || 'REDACTED']
      ]
      
      offenceData.forEach(([field, value]) => {
        doc.text(`${field}: ${value}`, 30, yPos)
        yPos += 6
      })
      
      if (offence.notes) {
        doc.text(`Notes: ${offence.notes}`, 30, yPos)
        yPos += 8
      }
      
      yPos += 5
    })
    yPos += 10
  }
  
  // Warnings Section
  if (json.warnings && Array.isArray(json.warnings)) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('WARNINGS & CAUTIONS', 20, yPos)
    yPos += 15
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    json.warnings.forEach((warning: string, index: number) => {
      doc.text(`${index + 1}. ${warning}`, 25, yPos)
      yPos += 8
    })
    yPos += 10
  }
  
  // Risk Assessment Section
  if (json.risk_assessment) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('RISK ASSESSMENT', 20, yPos)
    yPos += 15
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    const risk = json.risk_assessment
    
    if (risk.violence_risk) {
      doc.text(`Violence Risk: ${risk.violence_risk.toUpperCase()}`, 25, yPos)
      yPos += 8
    }
    if (risk.reoffending_probability) {
      doc.text(`Reoffending Probability: ${risk.reoffending_probability.toUpperCase()}`, 25, yPos)
      yPos += 8
    }
    if (risk.public_safety_concern) {
      doc.text(`Public Safety Concern: ${risk.public_safety_concern.toUpperCase()}`, 25, yPos)
      yPos += 8
    }
    if (risk.monitoring_level) {
      doc.text(`Monitoring Level: ${risk.monitoring_level.toUpperCase()}`, 25, yPos)
      yPos += 8
    }
    yPos += 10
  }
  
  // Summary Section
  if (json.summary) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('OVERALL SUMMARY', 20, yPos)
    yPos += 15
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    const summaryLines = doc.splitTextToSize(json.summary, 170)
    doc.text(summaryLines as string[], 20, yPos)
  }
}

function addUniversalCreditDetails(doc: jsPDF, json: any, startY: number) {
  let yPos = startY
  
  // Add logo/header simulation
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(json.logo || '╔═══ GOVERNMENT OFFICIAL', 20, yPos)
  doc.text(json.letterhead || 'Department for Work and Pensions', 20, yPos + 8)
  
  // Official border
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.8)
  doc.rect(15, yPos - 8, 165, 25)
  
  yPos += 30
  
  // Case Reference
  if (json.case_ref) {
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(`CASE REFERENCE: ${json.case_ref}`, 20, yPos)
    yPos += 15
  }
  
  // Applicant Information Table
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('APPLICANT INFORMATION', 20, yPos)
  yPos += 15
  
  drawTableHeader(doc, 'FIELD', 'DETAILS', yPos)
  yPos += 8
  
  const applicantData = [
    ['Full Name', json.applicant?.name || 'REDACTED'],
    ['Date of Birth', json.applicant?.dob || 'REDACTED'],
    ['National Insurance', json.applicant?.ni_number || 'REDACTED'],
    ['Address', json.applicant?.address || 'REDACTED'],
    ['Phone', json.applicant?.phone || 'REDACTED'],
    ['Claim Date', json.applicant?.claim_date || 'REDACTED']
  ]
  
  applicantData.forEach(([field, value]) => {
    drawTableRow(doc, field, value, yPos)
    yPos += 10
  })
  
  yPos += 10
  
  // Assessment Period
  if (json.assessment_period) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('ASSESSMENT PERIOD', 20, yPos)
    yPos += 15
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Period: ${json.assessment_period.period_start || 'N/A'} to ${json.assessment_period.period_end || 'N/A'}`, 25, yPos)
    doc.text(`Assessment Type: ${json.assessment_period.assessment_type || 'N/A'}`, 25, yPos + 8)
    yPos += 25
  }
  
  // Financial Assessment Table
  if (json.financial_assessment) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('FINANCIAL ASSESSMENT', 20, yPos)
    yPos += 15
    
    const financial = json.financial_assessment
    
    // Income Summary
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('MONTHLY INCOME SUMMARY', 25, yPos)
    yPos += 10
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    if (financial.total_monthly_income) {
      doc.text(`Total Monthly Income: £${financial.total_monthly_income}`, 30, yPos)
      yPos += 8
    }
    if (financial.work_allowance) {
      doc.text(`Work Allowance: £${financial.work_allowance}`, 30, yPos)
      yPos += 8
    }
    if (financial.housing_costs) {
      doc.text(`Housing Costs: £${financial.housing_costs}`, 30, yPos)
      yPos += 8
    }
    yPos += 5
    
    // Income Sources Table
    if (financial.income_sources && Array.isArray(financial.income_sources)) {
      doc.setFillColor(240, 240, 240)
      doc.rect(25, yPos - 5, 165, 12, 'F')
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('Source', 30, yPos + 2)
      doc.text('Amount', 100, yPos + 2)
      doc.text('Frequency', 140, yPos + 2)
      yPos += 10
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      financial.income_sources.forEach((source: any) => {
        doc.text(source.source || 'REDACTED', 30, yPos + 2)
        doc.text(`£${source.amount || '0'}`, 100, yPos + 2)
        doc.text(source.frequency || 'N/A', 140, yPos + 2)
        yPos += 8
      })
      yPos += 10
    }
  }
  
  // Calculated Awards Section
  if (json.calculated_awards) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('CALCULATED AWARDS', 20, yPos)
    yPos += 15
    
    const awards = json.calculated_awards.monthly_elements
    
    // Create awards table
    doc.setFillColor(220, 235, 255)
    doc.rect(20, yPos - 5, 170, 8, 'F')
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Element', 25, yPos + 2)
    doc.text('Amount (£)', 140, yPos + 2)
    yPos += 8
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    
    const awardDetails = [
      ['Standard Allowance', awards?.standard_allowance || '0'],
      ['Housing Element', awards?.housing_element || '0'],
      ['Carers Element', awards?.carers_element || '0'],
      ['Children Element', awards?.children_element || '0'],
      ['Childcare Element', awards?.childcare_element || '0']
    ]
    
    awardDetails.forEach(([element, amount]) => {
      doc.text(element, 25, yPos + 2)
      doc.text(`£${amount}`, 140, yPos + 2)
      yPos += 8
    })
    
    // Total calculation
    yPos += 5
    doc.setFillColor(200, 255, 200)
    doc.rect(20, yPos - 5, 170, 12, 'F')
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL MONTHLY AWARD (BEFORE DEDUCTIONS)', 25, yPos + 2)
    doc.text(`£${json.calculated_awards.total_monthly_award_before_deductions || '0'}`, 140, yPos + 2)
    
    yPos += 15
    doc.setFontSize(11)
    doc.text(`Income Reduction: £${json.calculated_awards.income_reduction || '0'}`, 25, yPos)
    yPos += 8
    doc.text(`Total Deductions: £${json.calculated_awards.total_deductions || '0'}`, 25, yPos)
    yPos += 8
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`FINAL MONTHLY PAYMENT: £${json.calculated_awards.final_monthly_payment || '0'}`, 25, yPos)
    yPos += 20
  }
  
  // Assessment Findings
  if (json.assessment_findings) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('ASSESSMENT FINDINGS', 20, yPos)
    yPos += 15
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    const findings = json.assessment_findings
    
    if (findings.work_requirements) {
      doc.text(`Work Requirements: ${findings.work_requirements.toUpperCase()}`, 25, yPos)
      yPos += 8
    }
    if (findings.capability_assessment) {
      doc.text(`Capability Assessment: ${findings.capability_assessment.toUpperCase()}`, 25, yPos)
      yPos += 8
    }
    if (findings.sanction_status) {
      doc.text(`Sanction Status: ${findings.sanction_status.toUpperCase()}`, 25, yPos)
      yPos += 8
    }
    yPos += 10
  }
  
  // Detailed Assessment Notes
  if (json.detailed_assessment_notes && Array.isArray(json.detailed_assessment_notes)) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('DETAILED ASSESSMENT NOTES', 20, yPos)
    yPos += 15
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    json.detailed_assessment_notes.forEach((note: string, index: number) => {
      doc.text(`${index + 1}. ${note}`, 25, yPos)
      yPos += 12
    })
    yPos += 10
  }
  
  // Recommendations
  if (json.recommendations && Array.isArray(json.recommendations)) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('RECOMMENDATIONS', 20, yPos)
    yPos += 15
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    json.recommendations.forEach((rec: string, index: number) => {
      doc.text(`${index + 1}. ${rec}`, 25, yPos)
      yPos += 12
    })
    yPos += 10
  }
  
  // Next Steps
  if (json.next_steps && Array.isArray(json.next_steps)) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('NEXT STEPS', 20, yPos)
    yPos += 15
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    json.next_steps.forEach((step: string, index: number) => {
      doc.text(`• ${step}`, 25, yPos)
      yPos += 8
    })
    yPos += 15
  }
  
  // Assessment Authority
  if (json.assessment_authority) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('ASSESSMENT AUTHORITY', 20, yPos)
    yPos += 15
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    const authority = json.assessment_authority
    
    if (authority.assessment_centre) {
      doc.text(`Assessment Centre: ${authority.assessment_centre}`, 25, yPos)
      yPos += 8
    }
    if (authority.work_coach?.name) {
      doc.text(`Work Coach: ${authority.work_coach.name}`, 25, yPos)
      yPos += 8
    }
    if (authority.work_coach?.employee_id) {
      doc.text(`Employee ID: ${authority.work_coach.employee_id}`, 25, yPos)
      yPos += 8
    }
    if (authority.location) {
      doc.text(`Location: ${authority.location}`, 25, yPos)
      yPos += 8
    }
  }
  
  // Success/Failure stamp simulation
  if (json.eligibility_result) {
    yPos += 20
    const result = json.eligibility_result.toLowerCase()
    
    if (result === 'approved') {
      doc.setTextColor(0, 150, 0) // Green
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('✓ CLAIM APPROVED', 95, yPos, { align: 'center' })
    } else if (result === 'declined') {
      doc.setTextColor(200, 0, 0) // Red
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('✗ CLAIM DECLINED', 95, yPos, { align: 'center' })
    } else {
      doc.setTextColor(200, 100, 0) // Orange
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('◐ UNDER REVIEW', 95, yPos, { align: 'center' })
    }
    doc.setTextColor(0, 0, 0) // Reset
  }
}

function addCreditScoreDetails(doc: jsPDF, json: any, startY: number) {
  let yPos = startY
  
  // Add logo/header simulation
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(json.logo || '╔═══ CREDIT AGENCY', 20, yPos)
  doc.text(json.letterhead || 'Credit Reference Agency Report', 20, yPos + 8)
  
  // Official border
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.8)
  doc.rect(15, yPos - 8, 165, 25)
  
  yPos += 30
  
  // Subject Information Table
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('SUBJECT INFORMATION', 20, yPos)
  yPos += 15
  
  drawTableHeader(doc, 'FIELD', 'DETAILS', yPos)
  yPos += 8
  
  const subjectData = [
    ['Name', json.subject?.name || 'REDACTED'],
    ['Income', json.subject?.income || 'REDACTED'],
    ['Address', json.subject?.address || 'REDACTED'],
    ['Employment', json.subject?.employment || 'REDACTED'],
    ['Report ID', json.report_id || 'REDACTED'],
    ['Report Date', json.report_date || 'REDACTED']
  ]
  
  subjectData.forEach(([field, value]) => {
    drawTableRow(doc, field, value, yPos)
    yPos += 10
  })
  
  yPos += 10
  
  // Credit Score Display
  if (json.credit_summary) {
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    const score = json.credit_summary.overall_score
    const rating = json.credit_summary.score_rating
    
    // Color-code score
    if (parseInt(score) >= 740) doc.setTextColor(0, 150, 0) // Green for excellent
    else if (parseInt(score) >= 670) doc.setTextColor(200, 200, 0) // Yellow for good
    else if (parseInt(score) >= 580) doc.setTextColor(255, 140, 0) // Orange for fair
    else doc.setTextColor(200, 0, 0) // Red for poor
    
    doc.text(`CREDIT SCORE: ${score}/850`, 95, yPos, { align: 'center' })
    doc.setTextColor(0, 0, 0) // Reset
    
    doc.setFontSize(16)
    doc.text(`RATING: ${rating.toUpperCase()}`, 95, yPos + 10, { align: 'center' })
    
    if (json.credit_summary.previous_score && json.credit_summary.score_change) {
      doc.setFontSize(14)
      const change = json.credit_summary.score_change
      if (change.startsWith('+')) doc.setTextColor(0, 150, 0) // Green for positive
      else if (change.startsWith('-')) doc.setTextColor(200, 0, 0) // Red for negative
      doc.text(`Change: ${change}`, 95, yPos + 20, { align: 'center' })
      doc.setTextColor(0, 0, 0) // Reset
    }
    
    yPos += 40
  }
  
  // Financial Summary Table
  if (json.financial_summary) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('FINANCIAL SUMMARY', 20, yPos)
    yPos += 15
    
    const financial = json.financial_summary
    
    doc.setFillColor(240, 240, 240)
    doc.rect(20, yPos - 5, 170, 8, 'F')
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Category', 25, yPos + 2)
    doc.text('Amount', 140, yPos + 2)
    yPos += 8
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    
    const financialDetails = [
      ['Total Debt', `£${financial.total_debt || '0'}`],
      ['Available Credit', `£${financial.available_credit || '0'}`],
      ['Credit Utilization', `${financial.credit_utilisation || '0'}%`],
      ['Monthly Debt Payments', `£${financial.monthly_debt_payments || '0'}`],
      ['Debt to Income Ratio', `${financial.debt_to_income_ratio || '0'}%`]
    ]
    
    financialDetails.forEach(([category, amount]) => {
      doc.text(category, 25, yPos + 2)
      doc.text(amount, 140, yPos + 2)
      yPos += 8
    })
    
    yPos += 15
  }
  
  // Account Details Section
  if (json.account_details && Array.isArray(json.account_details)) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('ACCOUNT DETAILS', 20, yPos)
    yPos += 15
    
    json.account_details.forEach((account: any, index: number) => {
      if (yPos > 200) return // Start new page if needed
      
      // Account header
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(`${index + 1}. ${account.account_name || 'ACCOUNT'} - ${account.provider || 'PROVIDER'}`, 20, yPos)
      yPos += 10
      
      // Account details
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      
      const accountData = [
        ['Account Number', account.account_number || 'REDACTED'],
        ['Opened', account.opened_date || 'REDACTED'],
        ['Credit Limit', `£${account.credit_limit || '0'}`],
        ['Current Balance', `£${account.current_balance || '0'}`],
        ['Monthly Payment', `£${account.monthly_payment || '0'}`],
        ['Status', account.payment_status || 'REDACTED']
      ]
      
      accountData.forEach(([field, value]) => {
        doc.text(`${field}: ${value}`, 30, yPos)
        yPos += 6
      })
      
      yPos += 5
    })
    yPos += 10
  }
  
  // Payment History Table
  if (json.payment_history && Array.isArray(json.payment_history)) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('RECENT PAYMENT HISTORY', 20, yPos)
    yPos += 15
    
    // Table headers
    doc.setFillColor(240, 240, 240)
    doc.rect(20, yPos - 5, 170, 12, 'F')
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Date', 25, yPos + 2)
    doc.text('Account', 60, yPos + 2)
    doc.text('Amount', 120, yPos + 2)
    doc.text('Status', 160, yPos + 2)
    yPos += 10
    
    // Payment entries
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    json.payment_history.forEach((payment: any) => {
      if (yPos > 250) return
      doc.text(payment.date || 'REDACTED', 25, yPos + 2)
      doc.text(payment.account || 'REDACTED', 60, yPos + 2)
      doc.text(`£${payment.amount || '0'}`, 120, yPos + 2)
      
      // Color-code payment status
      const status = payment.status || 'unknown'
      if (status === 'on_time') doc.setTextColor(0, 150, 0) // Green
      else if (status === 'late') doc.setTextColor(200, 100, 0) // Orange
      else if (status === 'missed') doc.setTextColor(200, 0, 0) // Red
      
      doc.text(status.toUpperCase(), 160, yPos + 2)
      doc.setTextColor(0, 0, 0) // Reset color
      
      yPos += 8
    })
    yPos += 15
  }
  
  // Score Factors
  if (json.score_factors && Array.isArray(json.score_factors)) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('SCORE FACTORS', 20, yPos)
    yPos += 15
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    json.score_factors.forEach((factor: string, index: number) => {
      const isPositive = factor.toLowerCase().includes('positive:')
      if (isPositive) doc.setTextColor(0, 150, 0) // Green for positive
      else if (factor.toLowerCase().includes('negative:')) doc.setTextColor(200, 0, 0) // Red for negative
      
      doc.text(`${index + 1}. ${factor}`, 25, yPos)
      doc.setTextColor(0, 0, 0) // Reset color
      yPos += 8
    })
    yPos += 10
  }
  
  // Recommendations
  if (json.recommendations && Array.isArray(json.recommendations)) {
    doc.setFontSize(14)  
    doc.setFont('helvetica', 'bold')
    doc.text('RECOMMENDATIONS', 20, yPos)
    yPos += 15
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    json.recommendations.forEach((rec: string, index: number) => {
      doc.text(`${index + 1}. ${rec}`, 25, yPos)
      yPos += 12
    })
    yPos += 10
  }
  
  // Risk Assessment Stamp
  if (json.credit_summary?.risk_assessment) {
    yPos += 20
    const risk = json.credit_summary.risk_assessment.toLowerCase()
    
    if (risk === 'low') {
      doc.setTextColor(0, 150, 0) // Green
      doc.text('✓ LOW RISK', 95, yPos, { align: 'center' })
    } else if (risk === 'medium') {
      doc.setTextColor(200, 100, 0) // Orange
      doc.text('◐ MEDIUM RISK', 95, yPos, { align: 'center' })
    } else if (risk === 'high') {
      doc.setTextColor(200, 0, 0) // Red
      doc.text('⚠ HIGH RISK', 95, yPos, { align: 'center' })
    }
    doc.setTextColor(0, 0, 0) // Reset
  }
}

function addPayslipDetails(doc: jsPDF, json: any, startY: number) {
  let yPos = startY
  
  // ULTRA REALISTIC COMPANY HEADER
  doc.setDrawColor(40, 80, 120)
  doc.setLineWidth(2)
  doc.setFillColor(240, 248, 255)
  doc.rect(20, yPos - 8, 170, 22, 'F')
  
  // Company branding
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(40, 80, 120)
  doc.text('★', 25, yPos + 2)
  doc.text(json.employer?.company || 'COMPANY NAME', 35, yPos + 2)
  
  // Professional payslip banner
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('PAYSLIP', 175, yPos - 2, { align: 'right' })
  
  yPos += 15
  
  // Date and reference formatting  
  const payDate = json.pay_period?.pay_date || new Date().toISOString().split('T')[0]
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }
  
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`Pay Period: ${json.pay_period?.period_start ? formatDate(json.pay_period.period_start) : 'XX/XX/XXXX'} - ${formatDate(payDate)}`, 30, yPos)
  doc.text(`Pay Date: ${formatDate(payDate)}`, 30, yPos + 8)
  doc.text(`Pay No: ${json.references?.slip_no || 'PS' + Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`, 150, yPos)
  
  yPos += 20
  
  // EMPLOYEE SECTION - PROFESSIONAL STYLING
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(1)
  doc.setFillColor(248, 249, 250)
  doc.rect(20, yPos - 3, 170, 28, 'F')
  
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('PAYEE INFORMATION', 25, yPos + 1)
  
  // Employee name - LARGE AND PROMINENT
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(json.employee?.name || 'EMPLOYEE NAME', 25, yPos + 10)
  
  // Professional details in two columns
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Position: ${json.employee?.job_title || 'JOB TITLE'}`, 25, yPos + 18)
  doc.text(`Employee ID: ${json.employee?.employee_id || 'EMP' + String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`, 25, yPos + 24)
  
  // Company registration
  if (json.employer?.registration) {
    doc.text(`Company Reg: ${json.employer.registration}`, 120, yPos + 18)
  }
  
  yPos += 35
  
  // MAIN PAYMENT TABLE - BANK-STYLE REALISM
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('EARNINGS & DEDUCTIONS', 20, yPos)
  yPos += 10
  
  // Professional table with borders
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)
  
  // Table header styling
  doc.setFillColor(235, 245, 255)
  doc.rect(20, yPos - 3, 170, 10, 'F')
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Description', 25, yPos + 1)
  doc.text('Current Period', 130, yPos + 1)
  doc.text('Year to Date', 165, yPos + 1)
  
  // Border lines
  doc.setDrawColor(0, 0, 0)
  doc.line(20, yPos - 3, 190, yPos - 3) // Top
  doc.line(20, yPos + 7, 190, yPos + 7) // Bottom
  doc.line(125, yPos - 3, 125, yPos + 7) // Vertical 1
  doc.line(160, yPos - 3, 160, yPos + 7) // Vertical 2
  
  yPos += 12
  
  // PAYMENT CALCULATIONS - DYNAMIC AND REALISTIC
  const amounts = json.amounts || {}
  const annualSalary = parseFloat(amounts.annual_salary_gbp || amounts.gross_pay_gbp || 0)
  const monthlyGross = annualSalary > 1000 ? annualSalary / 12 : parseFloat(amounts.monthly_gross_gbp || amounts.gross_pay_gbp || 0)
  const taxAmount = parseFloat(amounts.tax_amount_gbp || 0) || Math.round(monthlyGross * 0.20 * 100) / 100
  const niAmount = parseFloat(amounts.ni_amount_gbp || 0) || Math.round(monthlyGross * 0.12 * 100) / 100
  const pensionAmount = parseFloat(amounts.pension_deduction_gbp || 0) || Math.round(monthlyGross * 0.03 * 100) / 100 // 3% pension
  const netPay = monthlyGross - taxAmount - niAmount - pensionAmount
  
  // EARNINGS SECTION
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  
  // Basic salary - CLEARLY LABELED
  doc.text('Basic Salary', 25, yPos + 1)
  doc.text(`£${monthlyGross.toFixed(2)}`, 130, yPos + 1)
  doc.text(`£${(monthlyGross * 12).toFixed(2)}`, 165, yPos + 1)
  yPos += 8
  
  // Additional earnings
  if (amounts?.bonus_gbp && parseFloat(amounts.bonus_gbp) > 0) {
    doc.text('Performance Bonus', 25, yPos + 1)
    doc.text(`£${amounts.bonus_gbp}`, 130, yPos + 1)
    doc.text(`£${(parseFloat(amounts.bonus_gbp) * 12).toFixed(2)}`, 165, yPos + 1)
    yPos += 8
  }
  
  if (amounts?.overtime_gbp && parseFloat(amounts.overtime_gbp) > 0) {
    doc.text('Overtime Pay', 25, yPos + 1)
    doc.text(`£${amounts.overtime_gbp}`, 130, yPos + 1)
    doc.text(`£${(parseFloat(amounts.overtime_gbp) * 12).toFixed(2)}`, 165, yPos + 1)
    yPos += 8
  }
  
  // TOTAL GROSS - HIGHLIGHTED
  yPos += 2
  doc.setFillColor(220, 255, 220)
  doc.rect(20, yPos - 3, 170, 10, 'F')
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('GROSS PAY', 25, yPos + 1)
  doc.text(`£${monthlyGross.toFixed(2)}`, 130, yPos + 1)
  doc.text(`£${(monthlyGross * 12).toFixed(2)}`, 165, yPos + 1)
  yPos += 15
  
  // DEDUCTIONS SECTION HEADER
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('DEDUCTIONS', 25, yPos)
  yPos += 8
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  
  // Income Tax (PAYE)
  doc.text('Income Tax (PAYE)', 25, yPos + 1)
  doc.text(`£${taxAmount.toFixed(2)}`, 130, yPos + 1)
  doc.text(`£${(taxAmount * 12).toFixed(2)}`, 165, yPos + 1)
  yPos += 8
  
  // National Insurance
  doc.text('National Insurance', 25, yPos + 1)
  doc.text(`£${niAmount.toFixed(2)}`, 130, yPos + 1)
  doc.text(`£${(niAmount * 12).toFixed(2)}`, 165, yPos + 1)
  yPos += 8
  
  // Pension contribution
  doc.text('Pension Contribution', 25, yPos + 1)
  doc.text(`£${pensionAmount.toFixed(2)}`, 130, yPos + 1)
  doc.text(`£${(pensionAmount * 12).toFixed(2)}`, 165, yPos + 1)
  yPos += 8
  
  yPos += 8
  
  // NET PAY - PROMINENT FINAL AMOUNT
  doc.setFillColor(220, 245, 255)
  doc.rect(20, yPos - 3, 170, 14, 'F')
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 50, 150)
  doc.text('NET PAY', 25, yPos + 2)
  doc.text(`£${netPay.toFixed(2)}`, 130, yPos + 2)
  doc.text(`£${(netPay * 12).toFixed(2)}`, 165, yPos + 2)
  
  // Payment method info
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  doc.text('Will be paid to your nominated bank account', 25, yPos + 12)
  
  yPos += 25
  
  // PAYMENT INFO PANEL - BANKING STYLE
  doc.setDrawColor(150, 150, 150)
  doc.setFillColor(248, 248, 248)
  doc.rect(20, yPos - 3, 170, 18, 'F')
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Payment Information:', 25, yPos + 1)
  doc.text(`Tax Code: ${json.tax_code || '1257L'}`, 25, yPos + 8)
  doc.text(`NI Number: ${json.employee?.ni_number || '** ** ** A'}`, 100, yPos + 8)
  doc.text(`Payroll Contact: payroll@company.co.uk`, 25, yPos + 15)
  
  yPos += 20
  
  // LEGAL FOOTER - FINE PRINT
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 120, 120)
  doc.text('This payslip is computer generated and does not require a signature.', 95, yPos, { align: 'center' })
  doc.text('For queries contact HR Department. This document is for entertainment purposes only.', 95, yPos + 5, { align: 'center' })
}

function addJobRejectionDetails(doc: jsPDF, json: any, startY: number) {
  let yPos = startY
  
  // Add logo/header simulation
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(json.logo || '╔═══ COMPANY OFFICIAL', 20, yPos)
  doc.text(json.letterhead || 'Human Resources Department', 20, yPos + 8)
  
  // Official border
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.8)
  doc.rect(15, yPos - 8, 165, 25)
  
  yPos += 30
  
  // Application Reference
  if (json.applicant?.application_reference) {
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`APPLICATION REF: ${json.applicant.application_reference}`, 20, yPos)
    yPos += 15
  }
  
  // Applicant Information Table
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('APPLICATION SUMMARY', 20, yPos)
  yPos += 15
  
  drawTableHeader(doc, 'FIELD', 'DETAILS', yPos)
  yPos += 8
  
  const applicantData = [
    ['Applicant Name', json.applicant?.name || 'REDACTED'],
    ['Position Applied', json.applicant?.position_applied || 'REDACTED'],
    ['Company', json.applicant?.company || 'REDACTED'],
    ['Experience', json.applicant?.experience_years || 'REDACTED'],
    ['Application Date', json.applicant?.application_date || 'REDACTED'],
    ['Interview Date', json.applicant?.interview_date || 'N/A']
  ]
  
  applicantData.forEach(([field, value]) => {
    drawTableRow(doc, field, value, yPos)
    yPos += 10
  })
  
  yPos += 10
  
  // Letter Content
  if (json.salutation) {
    doc.setFontSize(12)
    doc.text(json.salutation, 20, yPos)
    yPos += 10
  }
  
  if (json.opening) {
    doc.setFontSize(11)
    const openingLines = doc.splitTextToSize(json.opening, 170)
    doc.text(openingLines as string[], 20, yPos)
    yPos += openingLines.length * 6 + 10
  }
  
  // Specific Reasons
  if (json.specific_reasons) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('DECISION REASONS', 20, yPos)
    yPos += 15
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    
    if (json.specific_reasons.primary_reason) {
      doc.text(`Primary Reason: ${json.specific_reasons.primary_reason}`, 25, yPos)
      yPos += 15
    }
    
    if (json.specific_reasons.secondary_factors) {
      doc.text('Secondary Factors:', 25, yPos)
      yPos += 8
      json.specific_reasons.secondary_factors.forEach((factor: string) => {
        doc.text(`• ${factor}`, 30, yPos)
        yPos += 8
      })
      yPos += 10
    }
  }
  
  // Constructive Feedback
  if (json.constructive_feedback) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('CONSTRUCTIVE FEEDBACK', 20, yPos)
    yPos += 15
    
    const feedback = json.constructive_feedback
    
    if (feedback.development_suggestions) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('DEVELOPMENT SUGGESTIONS', 25, yPos)
      yPos += 10
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      feedback.development_suggestions.forEach((suggestion: string) => {
        doc.text(`• ${suggestion}`, 30, yPos)
        yPos += 8
      })
      yPos += 10
    }
  }
  
  // Next Steps
  if (json.next_steps && Array.isArray(json.next_steps)) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('NEXT STEPS', 20, yPos)
    yPos += 15
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    json.next_steps.forEach((step: string, index: number) => {
      doc.text(`${index + 1}. ${step}`, 25, yPos)
      yPos += 8
    })
    yPos += 10
  }
  
  // Signature Block
  if (json.signature_block) {
    yPos += 20
    doc.text('Sincerely,', 20, yPos)
    yPos += 10
    
    doc.setFont('helvetica', 'bold')
    doc.text(json.signature_block.name || 'HR Manager', 20, yPos)
    yPos += 8
    
    doc.setFont('helvetica', 'normal')
    doc.text(json.signature_block.title || 'Human Resources', 20, yPos)
    yPos += 8
    doc.text(json.signature_block.company || 'Company Name', 20, yPos)
  }
}

function addRentReferenceDetails(doc: jsPDF, json: any, startY: number) {
  let yPos = startY
  
  // Add logo/header simulation
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(json.logo || '╔═══ PROPERTY MANAGEMENT', 20, yPos)
  doc.text(json.letterhead || 'Professional Property Management Services', 20, yPos + 8)
  
  // Official border
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.8)
  doc.rect(15, yPos - 8, 165, 25)
  
  yPos += 30
  
  // Reference Number
  if (json.reference_number) {
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`REFERENCE NUMBER: ${json.reference_number}`, 20, yPos)
    yPos += 15
  }
  
  // Property Details Table
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('PROPERTY & TENANCY DETAILS', 20, yPos)
  yPos += 15
  
  drawTableHeader(doc, 'FIELD', 'DETAILS', yPos)
  yPos += 8
  
  const propertyData = [
    ['Property Address', json.property_details?.address || 'REDACTED'],
    ['Property Type', json.property_details?.property_type || 'REDACTED'],
    ['Landlord', json.property_details?.landlord_name || 'REDACTED'],
    ['Monthly Rent', `£${json.financial_assessment?.monthly_rent_gbp || '0'}`],
    ['Tenancy Duration', json.tenant_information?.tenancy_duration || 'REDACTED'],
    ['Current Status', json.tenant_information?.current_status || 'REDACTED']
  ]
  
  propertyData.forEach(([field, value]) => {
    drawTableRow(doc, field, value, yPos)
    yPos += 10
  })
  
  yPos += 10
  
  // Payment History Table
  if (json.financial_assessment?.payment_history) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('PAYMENT HISTORY', 20, yPos)
    yPos += 15
    
    // Table headers
    doc.setFillColor(240, 240, 240)
    doc.rect(20, yPos - 5, 170, 12, 'F')
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Month', 25, yPos + 2)
    doc.text('Amount', 80, yPos + 2)
    doc.text('Date Paid', 110, yPos + 2)
    doc.text('Status', 150, yPos + 2)
    yPos += 10
    
    // Payment entries
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    json.financial_assessment.payment_history.forEach((payment: any) => {
      if (yPos > 250) return
      doc.text(payment.month || 'REDACTED', 25, yPos + 2)
      doc.text(`£${payment.amount || '0'}`, 80, yPos + 2)
      doc.text(payment.date_paid || 'REDACTED', 110, yPos + 2)
      
      // Color-code payment status
      const status = payment.status || 'unknown'
      if (status === 'on_time' || status === 'early') doc.setTextColor(0, 150, 0) // Green
      else if (status === 'late') doc.setTextColor(200, 100, 0) // Orange
      
      doc.text(status.toUpperCase(), 150, yPos + 2)
      doc.setTextColor(0, 0, 0) // Reset color
      
      yPos += 8
    })
    yPos += 15
  }
  
  // Reference Assessment Scores
  if (json.reference_assessment) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('TENANT ASSESSMENT SCORES', 20, yPos)
    yPos += 15
    
    const assessment = json.reference_assessment
    
    doc.setFillColor(220, 235, 255)
    doc.rect(20, yPos - 5, 170, 8, 'F')
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Assessment Category', 25, yPos + 2)
    doc.text('Score', 150, yPos + 2)
    yPos += 8
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    
    const assessmentDetails = [
      ['Rent Reliability', `${assessment.rent_reliability_score || 0}/10`],
      ['Property Care', `${assessment.property_care_score || 0}/10`],
      ['Communication', `${assessment.communication_score || 0}/10`],
      ['Overall Score', `${assessment.overall_tenant_score || 0}/10`]
    ]
    
    assessmentDetails.forEach(([category, score]) => {
      doc.text(category, 25, yPos + 2)
      doc.text(score, 150, yPos + 2)
      yPos += 8
    })
    
    yPos += 15
  }
  
  // Recommendation Stamp
  if (json.reference_assessment?.overall_rating) {
    yPos += 10
    const rating = json.reference_assessment.overall_rating.toLowerCase()
    
    if (rating === 'excellent') {
      doc.setTextColor(0, 150, 0) // Green
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('✓ EXCELLENT TENANT', 95, yPos, { align: 'center' })
    } else if (rating === 'good') {
      doc.setTextColor(200, 200, 0) // Yellow
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('◐ GOOD TENANT', 95, yPos, { align: 'center' })
    } else if (rating === 'fair') {
      doc.setTextColor(200, 100, 0) // Orange
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('○ FAIR TENANT', 95, yPos, { align: 'center' })
    } else {
      doc.setTextColor(200, 0, 0) // Red
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('⚠ POOR TENANT', 95, yPos, { align: 'center' })
    }
    doc.setTextColor(0, 0, 0) // Reset
    
    yPos += 20
  }
  
  // Additional Comments
  if (json.additional_comments && Array.isArray(json.additional_comments)) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('ADDITIONAL COMMENTS', 20, yPos)
    yPos += 15
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    json.additional_comments.forEach((comment: string, index: number) => {
      doc.text(`${index + 1}. ${comment}`, 25, yPos)
      yPos += 12
    })
    yPos += 10
  }
  
  // Reference Validity
  if (json.reference_validity) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Reference valid until: ${json.reference_validity.valid_until || 'N/A'}`, 20, yPos)
    yPos += 8
    doc.text(`For verification contact: ${json.reference_validity.contact_for_verification || 'N/A'}`, 20, yPos)
  }
}

function addSchoolReportDetails(doc: jsPDF, json: any, startY: number) {
  let yPos = startY
  
  // Add logo/header simulation
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(json.logo || '╔═══ EDUCATION DEPARTMENT', 20, yPos)
  doc.text(json.letterhead || 'School Behavioural Services Department', 20, yPos + 8)
  
  // Official border
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.8)
  doc.rect(15, yPos - 8, 165, 25)
  
  yPos += 30
  
  // School and Student Information Table
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('STUDENT BEHAVIOURAL ASSESSMENT', 20, yPos)
  yPos += 15
  
  drawTableHeader(doc, 'FIELD', 'DETAILS', yPos)
  yPos += 8
  
  const studentData = [
    ['Student Name', json.student_information?.full_name || 'REDACTED'],
    ['Date of Birth', json.student_information?.date_of_birth || 'REDACTED'],
    ['Student ID', json.student_information?.student_id || 'REDACTED'],
    ['Year Group', json.student_information?.year_group || 'REDACTED'],
    ['Form Class', json.student_information?.form_class || 'REDACTED'],
    ['School', json.school_details?.name || 'REDACTED']
  ]
  
  studentData.forEach(([field, value]) => {
    drawTableRow(doc, field, value, yPos)
    yPos += 10
  })
  
  yPos += 10
  
  // Academic Performance Section
  if (json.academic_performance) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('ACADEMIC PERFORMANCE', 20, yPos)
    yPos += 15
    
    const academic = json.academic_performance
    
    doc.setFillColor(220, 235, 255)
    doc.rect(20, yPos - 5, 170, 8, 'F')
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Assessment Category', 25, yPos + 2)
    doc.text('Grade/Score', 140, yPos + 2)
    yPos += 8
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    
    const academicDetails = [
      ['Overall Grade', academic.overall_grade || 'N/A'],
      ['Attendance', `${academic.attendance_percentage || 0}%`],
      ['Punctuality', academic.punctuality_record || 'N/A']
    ]
    
    academicDetails.forEach(([category, score]) => {
      doc.text(category, 25, yPos + 2)
      doc.text(score, 140, yPos + 2)
      yPos += 8
    })
    
    yPos += 15
  }
  
  // Behavioural Assessment Section
  if (json.behavioural_assessment) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('BEHAVIOURAL ASSESSMENT', 20, yPos)
    yPos += 15
    
    const behavioural = json.behavioural_assessment
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    
    const behaviourData = [
      ['Overall Behaviour Grade', behavioural.overall_behaviour_grade || 'N/A'],
      ['Classroom Conduct', behavioural.classroom_conduct || 'N/A'],
      ['Respect for Authority', behavioural.respect_for_authority || 'N/A'],
      ['Peer Relationships', behavioural.peer_relationships || 'N/A'],
      ['Following Rules', behavioural.following_rules || 'N/A']
    ]
    
    behaviourData.forEach(([category, assessment]) => {
      doc.text(`${category}: ${assessment}`, 25, yPos)
      yPos += 8
    })
    
    yPos += 15
  }
  
  // Incident Records Table
  if (json.incident_records && Array.isArray(json.incident_records)) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('INCIDENT RECORDS', 20, yPos)
    yPos += 15
    
    // Table headers
    doc.setFillColor(240, 240, 240)
    doc.rect(20, yPos - 5, 170, 12, 'F')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Date', 25, yPos + 2)
    doc.text('Type', 60, yPos + 2)
    doc.text('Location', 90, yPos + 2)
    doc.text('Status', 140, yPos + 2)
    yPos += 10
    
    // Incident entries
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    json.incident_records.forEach((incident: any) => {
      if (yPos > 250) return
      doc.text(incident.date || 'REDACTED', 25, yPos + 2)
      doc.text(incident.type || 'REDACTED', 60, yPos + 2)
      doc.text(incident.location || 'REDACTED', 90, yPos + 2)
      
      // Color-code status
      const status = incident.resolution_status || 'unknown'
      if (status === 'resolved') doc.setTextColor(0, 150, 0) // Green
      else if (status === 'ongoing') doc.setTextColor(200, 100, 0) // Orange
      else if (status === 'escalated') doc.setTextColor(200, 0, 0) // Red
      
      doc.text(status.toUpperCase(), 140, yPos + 2)
      doc.setTextColor(0, 0, 0) // Reset color
      
      yPos += 8
    })
    
    yPos += 15
  }
  
  // Positive Behaviours
  if (json.positive_behaviours && Array.isArray(json.positive_behaviours)) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('POSITIVE BEHAVIOURS', 20, yPos)
    yPos += 15
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    json.positive_behaviours.forEach((behaviour: string, index: number) => {
      doc.text(`${index + 1}. ${behaviour}`, 25, yPos)
      yPos += 8
    })
    yPos += 10
  }
  
  // Areas for Improvement
  if (json.areas_for_improvement && Array.isArray(json.areas_for_improvement)) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('AREAS FOR IMPROVEMENT', 20, yPos)
    yPos += 15
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    json.areas_for_improvement.forEach((area: string, index: number) => {
      doc.text(`${index + 1}. ${area}`, 25, yPos)
      yPos += 8
    })
    yPos += 10
  }
  
  // Recommendations
  if (json.recommendations && Array.isArray(json.recommendations)) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('RECOMMENDATIONS', 20, yPos)
    yPos += 15
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    json.recommendations.forEach((rec: string, index: number) => {
      doc.text(`${index + 1}. ${rec}`, 25, yPos)
      yPos += 12
    })
    yPos += 10
  }
  
  // Report Authority
  if (json.report_authority) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Assessment conducted by: ${json.report_authority.assessor_name || 'N/A'}`, 20, yPos)
    yPos += 8
    doc.text(`Department: ${json.report_authority.department || 'N/A'}`, 20, yPos)
  }
}

function addCollegeDegreeDetails(doc: jsPDF, json: any, startY: number) {
  let yPos = startY
  
  // Add logo/header simulation
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(json.logo || '╔═══ UNIVERSITY OFFICIAL', 20, yPos)
  doc.text(json.letterhead || 'Academic Registry & Certification Services', 20, yPos + 8)
  
  // Official border with thicker lines
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(1.2)
  doc.rect(15, yPos - 8, 165, 35)
  
  yPos += 40
  
  // Certificate Title
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(json.document_title || 'DEGREE CERTIFICATE', 95, yPos, { align: 'center' })
  yPos += 20
  
  // Student Information Table
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('GRADUATE INFORMATION', 20, yPos)
  yPos += 15
  
  drawTableHeader(doc, 'FIELD', 'DETAILS', yPos)
  yPos += 8
  
  const graduateData = [
    ['Full Name', json.student_information?.full_name || 'REDACTED'],
    ['Student Number', json.student_information?.student_number || 'REDACTED'],
    ['Date of Birth', json.student_information?.date_of_birth || 'REDACTED'],
    ['University', json.university_details?.official_name || 'REDACTED'],
    ['Mode of Study', json.student_information?.mode_of_study || 'REDACTED']
  ]
  
  graduateData.forEach(([field, value]) => {
    drawTableRow(doc, field, value, yPos)
    yPos += 10
  })
  
  yPos += 10
  
  // Degree Details Section
  if (json.degree_details) {
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    const degree = json.degree_details.degree_title || 'Degree'
    const subject = json.degree_details.subject_area || 'Subject'
    const classification = json.degree_details.degree_classification || 'Pass'
    
    doc.text(`${degree} in ${subject}`, 95, yPos, { align: 'center' })
    yPos += 15
    
    doc.setFontSize(18)
    
    // Color-code classification
    if (classification.includes('First') || classification.includes('Distinction')) doc.setTextColor(0, 150, 0) // Green
    else if (classification.includes('Second') || classification.includes('Merit')) doc.setTextColor(200, 200, 0) // Yellow
    else doc.setTextColor(100, 100, 100) // Grey
    
    doc.text(`${classification.toUpperCase()}`, 95, yPos, { align: 'center' })
    doc.setTextColor(0, 0, 0) // Reset
    
    yPos += 25
  }
  
  // Module Results Table
  if (json.module_results && Array.isArray(json.module_results)) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('ACADEMIC TRANSCRIPT', 20, yPos)
    yPos += 15
    
    // Table headers
    doc.setFillColor(240, 240, 240)
    doc.rect(20, yPos - 5, 170, 12, 'F')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Module', 25, yPos + 2)
    doc.text('Code', 80, yPos + 2)
    doc.text('Credits', 105, yPos + 2)
    doc.text('Mark', 125, yPos + 2)
    doc.text('Grade', 145, yPos + 2)
    doc.text('Status', 165, yPos + 2)
    yPos += 10
    
    // Module entries
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    json.module_results.forEach((module: any) => {
      if (yPos > 220) return // Move to new page if needed
      
      doc.text(module.module_title || 'MODULE', 25, yPos + 2)
      doc.text(module.module_code || 'CODE', 80, yPos + 2)
      doc.text(module.credits || '0', 105, yPos + 2)
      doc.text(`${module.mark_achieved || 0}%`, 125, yPos + 2)
      
      // Color-code grades
      const grade = module.grade || 'F'
      if (grade.startsWith('A')) doc.setTextColor(0, 150, 0) // Green
      else if (grade.startsWith('B')) doc.setTextColor(0, 200, 0) // Light green
      else if (grade.startsWith('C')) doc.setTextColor(200, 200, 0) // Yellow
      else doc.setTextColor(200, 0, 0) // Red
      
      doc.text(grade, 145, yPos + 2)
      
      // Color-code status
      const status = module.status || 'unknown'
      if (status === 'Passed') doc.setTextColor(0, 150, 0) // Green
      else if (status === 'Resit') doc.setTextColor(200, 100, 0) // Orange
      else doc.setTextColor(200, 0, 0) // Red
      
      doc.text(status.toUpperCase(), 165, yPos + 2)
      doc.setTextColor(0, 0, 0) // Reset color
      
      yPos += 8
    })
    
    yPos += 15
  }
  
  // Final Results
  if (json.final_results) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('FINAL ACADEMIC RESULTS', 20, yPos)
    yPos += 15
    
    const final = json.final_results
    
    doc.setFillColor(220, 235, 255)
    doc.rect(20, yPos - 5, 170, 8, 'F')
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Result Type', 25, yPos + 2)
    doc.text('Details', 140, yPos + 2)
    yPos += 8
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    
    const finalDetails = [
      ['Classification', final.overall_classification || 'N/A'],
      ['Final Average', `${final.final_average || 0}%`],
      ['Grade Point Average', final.grade_point_average || 'N/A'],
      ['Distinctions', final.distinctions_achieved || '0']
    ]
    
    finalDetails.forEach(([category, result]) => {
      doc.text(category, 25, yPos + 2)
      doc.text(result, 140, yPos + 2)
      yPos += 8
    })
    
    yPos += 15
  }
  
  // Special Achievements
  if (json.special_achievements && Array.isArray(json.special_achievements)) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('SPECIAL ACHIEVEMENTS', 20, yPos)
    yPos += 15
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    json.special_achievements.forEach((achievement: string, index: number) => {
      doc.text(`${index + 1}. ${achievement}`, 25, yPos)
      yPos += 8
    })
    yPos += 10
  }
  
  // Verification Information
  if (json.verification_information) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('VERIFICATION INFORMATION', 20, yPos)
    yPos += 8
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const verification = json.verification_information
    
    doc.text(`Certificate Number: ${verification.certificate_number || 'N/A'}`, 25, yPos)
    yPos += 8
    doc.text(`Verification Code: ${verification.verification_code || 'N/A'}`, 25, yPos)
    yPos += 8
    doc.text(`Issuing Authority: ${verification.issuance_authority || 'N/A'}`, 25, yPos)
    yPos += 15
  }
  
  // Signatories Section
  if (json.signatories) {
    yPos += 20
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('AUTHORIZED SIGNATORIES', 95, yPos, { align: 'center' })
    yPos += 20
    
    const signatories = json.signatories
    
    if (signatories.vice_chancellor) {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(signatories.vice_chancellor.name || 'Vice-Chancellor', 20, yPos)
      doc.text(signatories.vice_chancellor.title || 'Vice-Chancellor', 20, yPos + 8)
      doc.text('................................', 20, yPos + 16)
    }
    
    if (signatories.registrar) {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(signatories.registrar.name || 'Registrar', 120, yPos)
      doc.text(signatories.registrar.title || 'University Registrar', 120, yPos + 8)
      doc.text('................................', 120, yPos + 16)
    }
  }
  
  // Graduation Date
  if (json.degree_details?.graduation_date) {
    yPos += 40
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`Conferred this ${json.degree_details.graduation_date}`, 95, yPos, { align: 'center' })
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