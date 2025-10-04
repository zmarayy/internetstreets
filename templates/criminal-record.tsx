import React from 'react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { generateServiceBrand } from '@/lib/brand'

interface CriminalRecordData {
  subject_name: string
  date_of_birth: string
  address: string
  nationality: string
  record_number: string
  date_of_issue: string
  issuing_authority: string
  classification_level: string
  criminal_history: Array<{
    offense_date: string
    case_number: string
    offense_description: string
    court: string
    sentence: string
    conviction_status: string
    discharge_date?: string
  }>
  background_checks: {
    employment_checks: number
    education_verification: boolean
    foreign_travel_log: string[]
    known_associates: string[]
    financial_investigations: Array<{
      bank: string
      account_status: string
      investigation_reason: string
      conclusion_date: string
    }>
  }
  risk_assessment: {
    reoffending_probability: string
    threat_level: string
    conditions_applied: string[]
    monitoring_status: string
    next_review_date: string
  }
  legal_restrictions: string[]
  summary_note: string
}

interface CriminalRecordProps {
  data: CriminalRecordData
  sanitizedInputs?: {
    org_sanitized?: boolean
    sanitized_reason?: string
  }
}

export default function CriminalRecordTemplate({ data, sanitizedInputs }: CriminalRecordProps) {
  const doc = new jsPDF()
  
  // Generate professional branding for court/police
  const brand = generateServiceBrand('criminal-record', data.issuing_authority)
  
  // Set document properties
  doc.setProperties({
    title: `Criminal Record - ${data.subject_name}`,
    subject: `Record No: ${data.record_number}`,
    creator: brand.text,
    author: 'Court Records Office'
  })

  // PAGE 1 - HEADER AND DETAILS
  // Government header
  doc.setFillColor(25, 35, 66) // Deep navy government color
  doc.rect(0, 0, 210, 25, 'F')
  
  // Official seal (government building)
  doc.setFillColor(220, 153, 36) // Gold
  doc.rect(15, 10, 20, 15, 'F')
  doc.setDrawColor(25, 35, 66)
  doc.setLineWidth(2)
  doc.rect(15, 10, 20, 15, 'S')
  
  // Seal internal design
  doc.setFillColor(25, 35, 66)
  doc.circle(25, 17, 5, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('CR', 25, 19, { align: 'center' })
  
  // Seal text
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('COURT', 40, 12)
  doc.text('RECORDS', 40, 17)
  doc.text('OFFICE', 40, 22)

  // Document title
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('CRIMINAL RECORD SUMMARY', 105, 18, { align: 'center' })
  
  // Classification
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Classification: ${data.classification_level}`, 105, 22, { align: 'center' })

  // Document metadata
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(`Record No: ${data.record_number}`, 180, 8, { align: 'right' })
  doc.text(`Issue Date: ${data.date_of_issue}`, 180, 12, { align: 'right' })
  doc.text(`Authority: ${brand.text}`, 180, 16, { align: 'right' })
  doc.text('CONFIDENTIAL SENSITIVE', 180, 20, { align: 'right' })

  // Confidential stamp
  doc.setTextColor(220, 53, 69)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('CONFIDENTIAL', 150, 35, { angle: -5 })

  // Subject Information
  doc.setFillColor(248, 249, 250)
  doc.setDrawColor(25, 35, 66)
  doc.rect(15, 40, 180, 25, 'FD')
  
  doc.setTextColor(25, 35, 66)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('SUBJECT INFORMATION', 20, 45)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  
  const subjectInfo = [
    ['Full Name:', data.subject_name],
    ['Date of Birth:', data.date_of_birth],
    ['Address:', data.address],
    ['Nationality:', data.nationality]
  ]
  
  subjectInfo.forEach((row, i) => {
    doc.text(row[0], 25, 55 + (i * 4))
    doc.setTextColor(75, 85, 99)
    doc.text(row[1], 80, 55 + (i * 4))
    doc.setTextColor(25, 35, 66)
  })

  // Risk Assessment Box
  doc.setFillColor(255, 245, 245)
  doc.setDrawColor(220, 53, 69)
  doc.rect(15, 70, 180, 20, 'FD')
  
  doc.setTextColor(220, 53, 69)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('RISK ASSESSMENT', 20, 77)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(`Threat Level: ${data.risk_assessment.threat_level.toUpperCase()}`, 25, 84)
  doc.text(`Reoffending Probability: ${data.risk_assessment.reoffending_probability}`, 25, 88)
  
  // Risk color coding
  const riskColor = data.risk_assessment.threat_level === 'high' ? [220, 53, 69] :
                   data.risk_assessment.threat_level === 'medium' ? [253, 126, 20] : [40, 167, 69]
  
  doc.setFillColor(riskColor[0], riskColor[1], riskColor[2])
  doc.rect(150, 74, 20, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(7)
  doc.text(data.risk_assessment.threat_level.toUpperCase(), 160, 78, { align: 'center' })

  // SUMMARY SECTION
  doc.setTextColor(25, 35, 66)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('EXECUTIVE SUMMARY', 20, 105)
  doc.setDrawColor(25, 35, 66)
  doc.line(20, 107, 190, 107)

  doc.setTextColor(75, 85, 99)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(data.summary_note, 20, 115)

  // Legal Restrictions
  if (data.legal_restrictions.length > 0) {
    doc.setTextColor(220, 53, 69)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('ACTIVE LEGAL RESTRICTIONS', 20, 130)
    
    doc.setTextColor(75, 85, 99)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    data.legal_restrictions.forEach((restriction, i) => {
      doc.text(`• ${restriction}`, 25, 140 + (i * 4))
    })
  }

  // PAGE BREAK FOR DETAILED RECORD
  doc.addPage()

  // DETAILED CRIMINAL HISTORY
  doc.setTextColor(25, 35, 66)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('DETAILED CRIMINAL HISTORY', 20, 20)
  doc.setDrawColor(25, 35, 66)
  doc.line(20, 22, 190, 22)

  // Criminal history table
  const historyData = [
    ['Date', 'Case No.', 'Offense Description', 'Court', 'Sentence', 'Status'],
    ...data.criminal_history.map(record => [
      record.offense_date,
      record.case_number,
      record.offense_description.substring(0, 25) + (record.offense_description.length > 25 ? '...' : ''),
      record.court.substring(0, 15),
      record.sentence.substring(0, 20),
      record.conviction_status
    ])
  ]

  ;(doc as any).autoTable({
    startY: 30,
    body: historyData,
    theme: 'grid',
    headStyles: {
      fillColor: [25, 35, 66],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 7,
      fontStyle: 'normal',
      halign: 'left'
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    },
    columnStyles: {
      0: { halign: 'center', fontStyle: 'bold' },
      5: { halign: 'center' }
    },
    styles: {
      lineWidth: 0.5,
      lineColor: [209, 213, 219]
    }
  })

  const historyEnd = (doc as any).lastAutoTable.finalY + 5

  // BACKGROUND INVESTIGATIONS
  doc.setTextColor(25, 35, 66)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('BACKGROUND INVESTIGATIONS', 20, historyEnd + 10)
  doc.setDrawColor(25, 35, 66)
  doc.line(20, historyEnd + 12, 190, historyEnd + 12)

  // Investigation summary table
  const invData = [
    ['Investigation Type', 'Status', 'Details', 'Date Completed'],
    ['Employment Background Checks', `${data.background_checks.employment_checks} References Contacted`, 'Standard Procedure', new Date().toISOString().split('T')[0]],
    ['Education Verification', data.background_checks.education_verification ? 'Verified' : 'Not Completed', 'Academic Records', new Date().toISOString().split('T')[0]],
    ['Financial Investigation', `${data.background_checks.financial_investigations.length} Accounts Checked`,'Financial Crime Unit', new Date().toISOString().split('T')[0]],
    ['Travel History Analysis', `${data.background_checks.foreign_travel_log.length} Countries Visited`, 'Immigration Records', new Date().toISOString().split('T')[0]]
  ]

  ;(doc as any).autoTable({
    startY: historyEnd + 18,
    body: invData,
    theme: 'grid',
    headStyles: {
      fillColor: [25, 35, 66],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 7,
      fontStyle: 'normal',
      halign: 'left'
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    },
    styles: {
      lineWidth: 0.5,
      lineColor: [209, 213, 219]
    }
  })

  const invEnd = (doc as any).lastAutoTable.finalY + 5

  // Monitoring and Conditions
  if (invEnd < 250) {
    doc.setTextColor(25, 35, 66)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('CURRENT MONITORING STATUS', 20, invEnd + 10)

    doc.setFillColor(248, 249, 250)
    doc.rect(15, invEnd + 15, 180, 40, 'FD')
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    
    const monitorInfo = [
      ['Monitoring Status:', data.risk_assessment.monitoring_status],
      ['Next Review Date:', data.risk_assessment.next_review_date],
      ['Active Conditions:', data.risk_assessment.conditions_applied.join(', ')],
      ['', '']
    ]
    
    monitorInfo.forEach((row, i) => {
      if (row[0]) {
        doc.text(row[0], 25, invEnd + 25 + (i * 4))
        doc.setTextColor(75, 85, 99)
        doc.text(row[1], 90, invEnd + 25 + (i * 4))
        doc.setTextColor(25, 35, 66)
      }
    })
  }

  // Signature and authorization
  doc.setTextColor(75, 85, 99)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Authorized Signature:', 20, 270)
  
  // Signature line
  doc.setDrawColor(75, 85, 99)
  doc.line(80, 268, 140, 268)
  
  // Digital signature placeholder
  doc.setTextColor(25, 35, 66)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('Chief Registrar', 90, 275)
  doc.text('Court Records Office', 85, 280)

  // Official verification stamp
  doc.setFillColor(240, 240, 240)
  doc.rect(150, 260, 35, 25, 'F')
  doc.setDrawColor(25, 35, 66)
  doc.rect(150, 260, 35, 25, 'S')
  
  doc.setTextColor(25, 35, 66)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.text('OFFICIAL', 167, 268, { align: 'center' })
  doc.text('RECORD', 167, 272, { align: 'center' })
  doc.text(data.date_of_issue.split('-')[0], 167, 276, { align: 'center' })
  doc.text('VERIFIED', 167, 280, { align: 'center' })

  // Footer disclaimer
  doc.setTextColor(153, 153, 153)
  doc.setFontSize(7)
  doc.text('Internet Streets Entertainment – Not a Real Document', 105, 285, { align: 'center' })

  // Microtext
  doc.setFontSize(6)
  doc.text(`Record Ref: ${data.record_number} • Generated ${new Date().toISOString().split('T')[0]}`, 20, 290)
  doc.text('Secure Government Database', 200, 290, { align: 'right' })

  return doc
}
