import React from 'react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { generateServiceBrand } from '@/lib/brand'

interface FBIFileData {
  document_title: string
  document_classification: string
  case_number: string
  dossier_id: string
  subject: {
    name: string
    dob: string
    city: string
    occupation: string
    aliases: string[]
    nationality: string
    address: string
    known_associates: string[]
  }
  case_status: {
    investigation_status: string
    priority_level: string
    jurisdiction: string
    case_officer: string
    supervisor: string
    opened_date: string
  }
  threat_assessment: {
    overall_threat_level: string
    terrorism_risk: string
    criminal_activity_indicators: string[]
    weapons_monitoring: string
    financial_monitoring: string
  }
  surveillance_logs: Array<{
    timestamp: string
    location: string
    activity: string
    duration: string
    observers: string[]
    equipment_used: string[]
    behavior_assessment: string
  }>
  evidence_summary: {
    physical_evidence: Array<{
      type: string
      description: string
      discovery_date: string
    }>
    digital_evidence: Array<{
      source: string
      content: string
      date_recovered: string
    }>
  }
  analyst_assessment: {
    behavioral_profile: string
    motivational_factors: string[]
    communication_patterns: string
  }
  recommendations: string[]
  next_actions: string[]
  legal_status: {
    outstanding_warrants: string[]
    prosecution_recommendation: string
    charges_under_consideration: string[]
  }
  issued_at: string
  disclaimer: string
}

interface FBIProps {
  data: FBIFileData
  sanitizedInputs?: {
    org_sanitized?: boolean
    sanitized_reason?: string
  }
}

export default function FBITemplate({ data, sanitizedInputs }: FBIProps) {
  const doc = new jsPDF()
  
  // Generate professional branding
  const brand = generateServiceBrand('fbi-file')
  
  // Set document properties
  doc.setProperties({
    title: data.document_title,
    subject: `Case #${data.case_number}`,
    creator: 'Department of Records',
    author: 'Administrative Oversight'
  })

  // PAGE 1 - HEADER AND COVER PAGE
  // Header with gradient background
  doc.setFillColor(26, 58, 73) // Dark navy gradient
  doc.rect(0, 0, 210, 20, 'F')
  
  // Seal/logo section (top left)
  doc.setFillColor(220, 183, 36) // Gold seal background
  doc.circle(15, 10, 8, 'F')
  doc.setTextColor(75, 85, 99)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('DR', 15, 14, { align: 'center' })
  
  // Seal text
  doc.setFontSize(5)
  doc.setTextColor(255, 255, 255)
  doc.text('DEPARTMENT OF', 28, 8)
  doc.text('RECORDS', 28, 12)
  
  // Main title
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text(data.document_title, 105, 15, { align: 'center' })
  
  // Subtitle
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('CONFIDENTIAL INTELLIGENCE DOSSIER', 105, 19, { align: 'center' })
  
  // Metadata section (top right)
  doc.setFontSize(7)
  doc.text(`Case No: ${data.case_number}`, 180, 8, { align: 'right' })
  doc.text(`Issue Date: ${data.issued_at.split('T')[0]}`, 180, 11, { align: 'right' })
  doc.text(`Classification: ${data.document_classification}`, 180, 14, { align: 'right' })
  doc.text(`Dossier ID: ${data.dossier_id}`, 180, 17, { align: 'right' })

  // Classification stamp overlay
  doc.setTextColor(220, 53, 69)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('CLASSIFIED', 155, 45, { angle: -12 })

  // Subject summary block
  doc.setDrawColor(26, 58, 73)
  doc.setFillColor(248, 249, 250)
  doc.rect(15, 35, 180, 25, 'FD')
  
  // Subject Information table
  doc.setTextColor(26, 58, 73)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('SUBJECT INFORMATION', 20, 28)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  
  // Left column - Personal Details
  const personalData = [
    ['Full Name:', data.subject.name],
    ['Date of Birth:', data.subject.dob],
    ['Current City:', data.subject.city],
    ['Occupation:', data.subject.occupation],
    ['Nationality:', data.subject.nationality]
  ]
  
  personalData.forEach((row, i) => {
    doc.text(row[0], 20, 40 + (i * 3.5))
    doc.setTextColor(75, 85, 99)
    doc.text(row[1], 60, 40 + (i * 3.5))
    doc.setTextColor(26, 58, 73)
  })
  
  // Right column - Case Details
  doc.text('CASE METADATA', 120, 28)
  
  const caseData = [
    ['Case No:', data.case_number],
    ['Opened:', data.case_status.opened_date],
    ['Analyst:', data.case_status.case_officer],
    ['Priority:', data.case_status.priority_level.toUpperCase()],
    ['Status:', data.case_status.investigation_status.toUpperCase()]
  ]
  
  caseData.forEach((row, i) => {
    doc.text(row[0], 120, 40 + (i * 3.5))
    doc.setTextColor(75, 85, 99)
    doc.text(row[1], 160, 40 + (i * 3.5))
    doc.setTextColor(26, 58, 73)
  })

  // Threat Assessment Box
  doc.setDrawColor(220, 53, 69)
  doc.setFillColor(255, 245, 245)
  doc.rect(15, 65, 180, 15, 'FD')
  
  doc.setTextColor(220, 53, 69)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('THREAT ASSESSMENT', 20, 72)
  
  // Threat level badge
  const threatColor = data.threat_assessment.overall_threat_level === 'high' ? [220, 53, 69] :
                     data.threat_assessment.overall_threat_level === 'medium' ? [253, 126, 20] :
                     data.threat_assessment.overall_threat_level === 'low' ? [40, 167, 69] : [111, 66, 178]
  
  doc.setFillColor(threatColor[0], threatColor[1], threatColor[2])
  doc.rect(140, 68, 25, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(7)
  doc.text(data.threat_assessment.overall_threat_level.toUpperCase(), 152, 72, { align: 'center' })
  
  doc.setTextColor(75, 85, 99)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text(`Risk Level: ${data.threat_assessment.terrorism_risk.toUpperCase()}`, 20, 78)
  doc.text(`Financial Monitoring: ${data.threat_assessment.financial_monitoring}`, 20, 82)

  // Synopsis section
  doc.setTextColor(26, 58, 73)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('SYNOPSIS / KEY FINDINGS', 20, 95)
  
  doc.setDrawColor(26, 58, 73/255)
  doc.line(20, 97, 190, 97)
  
  doc.setTextColor(75, 85, 99)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  
  // Key findings as bullet points
  const findings = data.recommendations.slice(0, 5)
  findings.forEach((finding, i) => {
    doc.text(`• ${finding}`, 25, 105 + (i * 4))
  })

  // Risk Matrix
  doc.setFontSize(8)
  doc.setDrawColor(75, 85, 99)
  doc.rect(140, 110, 50, 25, 'S')
  doc.text('RISK MATRIX', 145, 115)
  
  // Risk indicators
  const riskLevels = ['Low', 'Medium', 'High', 'Critical']
  riskLevels.forEach((level, i) => {
    const color = level === 'Low' ? [40, 167, 69] :
                 level === 'Medium' ? [253, 126, 20] :
                 level === 'High' ? [220, 53, 69] : [111, 66, 178]
    
    doc.setFillColor(color[0], color[1], color[2])
    doc.circle(145, 120 + (i * 3), 1.5, 'F')
    doc.setTextColor(75, 85, 99)
    doc.text(level, 150, 121 + (i * 3))
  })

  // PAGE BREAK
  doc.addPage()

  // PAGE 2 - DETAILED SURVEILLANCE LOGS
  doc.setTextColor(26, 58, 73)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('DETAILED SURVEILLANCE LOGS', 20, 20)
  
  doc.setDrawColor(26, 58, 73)
  doc.line(20, 22, 190, 22)

  // Surveillance logs table
  const logs = data.surveillance_logs.slice(0, 10) // Limit to 10 entries for layout
  const tableData = logs.map((log, i) => [
    log.timestamp.split('T')[0] + ' ' + log.timestamp.split('T')[1].split('.')[0],
    log.location,
    log.activity.substring(0, 40) + (log.activity.length > 40 ? '...' : ''),
    log.behavior_assessment,
    `EV-2025-${String(i + 1).padStart(3, '0')}`
  ])

  ;(doc as any).autoTable({
    startY: 30,
    head: [['Timestamp', 'Location', 'Activity Description', 'Assessment', 'Evidence Ref']],
    body: tableData,
    themes: {
      fillColor: [26, 58, 73],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 7,
      fontStyle: 'normal',
      halign: 'left',
      textColor: [75, 85, 99]
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    },
    styles: {
      lineWidth: 0.5,
      lineColor: [209, 213, 219]
    },
    columnStyles: {
      0: { halign: 'center', fontStyle: 'bold' },
      4: { halign: 'center', fontStyle: 'bold', textColor: [134, 142, 164] }
    }
  })

  const finalY = (doc as any).lastAutoTable.finalY + 10

  // Evidence Summary Section
  doc.setTextColor(26, 58, 73)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('EVIDENCE SUMMARY', 20, finalY + 10)
  doc.setDrawColor(26, 58, 73)
  doc.line(20, finalY + 12, 190, finalY + 12)

  doc.setTextColor(75, 85, 99)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  // Physical Evidence
  doc.setFont('helvetica', 'bold')
  doc.text('Physical Evidence:', 20, finalY + 22)
  doc.setFont('helvetica', 'normal')
  
  data.evidence_summary.physical_evidence.forEach((evidence, i) => {
    doc.text(`• ${evidence.type}: ${evidence.description}`, 25, finalY + 28 + (i * 4))
  })

  // Digital Evidence
  doc.setFont('helvetica', 'bold')
  doc.text('Digital Evidence:', 20, finalY + 50)
  doc.setFont('helvetica', 'normal')
  
  data.evidence_summary.digital_evidence.forEach((evidence, i) => {
    doc.text(`• ${evidence.source}: ${evidence.content}`, 25, finalY + 56 + (i * 4))
  })

  // PAGE BREAK FOR ANALYST NOTES
  doc.addPage()

  // Analyst Assessment Section
  doc.setTextColor(26, 58, 73)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('ANALYST ASSESSMENT', 20, 20)
  doc.setDrawColor(26, 58, 73)
  doc.line(20, 22, 190, 22)

  // Background for analyst section
  doc.setFillColor(248, 249, 250)
  doc.rect(15, 30, 180, 100, 'F')
  doc.rect(15, 30, 180, 100, 'S')

  doc.setTextColor(26, 58, 73)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Behavioral Profile', 20, 40)
  
  doc.setTextColor(75, 85, 99)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  
  // Behavioral analysis paragraphs
  const profile = data.analyst_assessment.behavioral_profile
  doc.splitTextToSize(profile, 175, { fontSize: 9 })
  const splitProfile = doc.splitTextToSize(profile, 175, { fontSize: 9 })
  doc.text(splitProfile, 20, 50)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Communication Patterns', 20, 120)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(data.analyst_assessment.communication_patterns, 20, 130)

  // Recommendations Section
  doc.setTextColor(26, 58, 73)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('ANALYST RECOMMENDATIONS', 20, 150)
  doc.setDrawColor(26, 58, 73)
  doc.line(20, 152, 190, 152)

  doc.setTextColor(75, 85, 99)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  
  data.recommendations.forEach((recommendation, i) => {
    doc.text(`▶ ${recommendation}`, 25, 165 + (i * 5))
  })

  // Signature Block
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Authorized Signature:', 20, 220)
  
  doc.setDrawColor(75, 85, 99)
  doc.line(80, 215, 140, 215)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(data.case_status.supervisor, 90, 225)
  doc.text('Senior Analyst, Intelligence Division', 75, 230)

  // QR Code placeholder
  doc.setFillColor(0, 0, 0)
  doc.rect(170, 215, 15, 15, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(6)
  doc.text('QR', 177, 222, { align: 'center' })
  doc.text('2025', 177, 226, { align: 'center' })

  // Footer disclaimer
  doc.setTextColor(153, 153, 153)
  doc.setFontSize(7)
  doc.text('Internet Streets Entertainment – Not a Real Document', 105, 285, { align: 'center' })

  // Microtext
  doc.setFontSize(6)
  doc.text(`Document ID: ${data.case_number} • Generated by Internet Streets`, 20, 290)
  doc.text(new Date().toISOString().split('T')[0], 200, 290, { align: 'right' })

  return doc
}