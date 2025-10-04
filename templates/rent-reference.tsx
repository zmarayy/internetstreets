import React from 'react'
import { pdfGenerate as jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { generateServiceBrand } from '@/lib/brand'

interface RentReferenceData {
  tenant_name: string
  tenant_email: string
  property_manager_name: string
  property_manager_email: string
  company_name: string
  rental_duration: string
  property_address: string
  monthly_rent: number
  lease_start_date: string
  lease_end_date: string
  rent_payments: {
    total_amount_paid: number
    missed_payments: number
    late_payment_count: number
    average_payment_delay_days: number
  }
  payment_history: Array<{
    payment_date: string
    amount: string
    status: string
    notes: string
  }>
  property_condition: {
    move_in_condition: string
    move_out_condition: string
    damage_deposit_charged: number
    cleaning_charges: number
    damage_charges: number
    total_deposit_return: number
  }
  behavior_assessment: {
    noise_complaints: number
    neighbor_conflicts: number
    maintenance_requests: number
    overall_tenancy_quality: string
    recommended_for_future_tenancy: boolean
  }
  additional_information: string
  reference_date: string
}

interface RentReferenceProps {
  data: RentReferenceData
  sanitizedInputs?: {
    org_sanitized?: boolean
    sanitized_reason?: string
  }
}

export default function RentReferenceTemplate({ data, sanitizedInputs }: RentReferenceProps) {
  const doc = new jsPDF()
  
  // Generate professional branding
  const brand = generateServiceBrand('rent-reference', data.company_name)
  
  // Set document properties
  doc.setProperties({
    title: `Rent Reference - ${data.tenant_name}`,
    subject: `Property: ${data.property_address}`,
    creator: brand.text,
    author: 'Property Management Services'
  })

  // HEADER WITH COMPANY BRANDING
  // Header background (dark blue-green for estate agents)
  doc.setFillColor(34, 139,<｜tool▁calls▁end｜> 34) // Forest green
  doc.rect(0, 0, 210, 25, 'F')
  
  // Company logo
  doc.setFillColor(255, 255, 255)
  doc.circle(15, 12, 6, 'F')
  doc.setDrawColor(34, 139, 34)
  doc.setLineWidth(2)
  doc.circle(15, 12, 6, 'S')
  
  // Logo initials
  doc.setTextColor(34, 139, 34)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('PM', 15, 15, { align: 'center' })
  
  // Company name and contact
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(brand.text, 35, 12)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(data.property_manager_email, 35, 17)
  doc.text('PROPERTY MANAGEMENT SERVICES', 35, 21)

  // Document title
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('RENT REFERENCE CERTIFICATE', 105, 22, { align: 'center' })

  // Document details header
  doc.setFillColor(248, 249, 250)
  doc.setDrawColor(34, 139, 34)
  doc.rect(15, 30, 180, 30, 'FD')
  
  doc.setTextColor(34, 139, 34)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('TENANT & PROPERTY INFORMATION', 20, 35)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  
  const propertyInfo = [
    ['Tenant Name:', data.tenant_name],
    ['Property Address:', data.property_address],
    ['Lease Period:', `${data.lease_start_date} - ${data.lease_end_date}`],
    ['Monthly Rent:', `£${data.monthly_rent.toFixed(2)}`],
    ['Rental Duration:', data.rental_duration]
  ]
  
  propertyInfo.forEach((row, i) => {
    doc.text(row[0], 25, 45 + (i * 4))
    doc.setTextColor(75, 85, 99)
    doc.text(row[1], 85, 45 + (i * 4))
    doc.setTextColor(34, 139, 34)
  })

  // Payment Performance Summary
  doc.setTextColor(34, 139, 34)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('PAYMENT PERFORMANCE SUMMARY', 20, 75)
  doc.setDrawColor(34, 139, 34)
  doc.line(20, 77, 190, 77)

  // Payment metrics in colored boxes
  doc.setFillColor(245, 255, 245)
  doc.rect(15, 85, 40, 25, 'F')
  doc.setDrawColor(40, 167, 69)
  doc.rect(15, 85, 40, 25, 'S')
  
  doc.setTextColor(40, 167, 69)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('TOTAL PAID', 35, 92, { align: 'center' })
  doc.setFontSize(12)
  doc.text(`£${data.rent_payments.total_amount_paid.toFixed(2)}`, 35, 100, { align: 'center' })

  doc.setFillColor(255, 245, 245)
  doc.rect(60, 85, 40, 25, 'F')
  doc.setDrawColor(220, 53, 69)
  doc.rect(60, 85, 40, 25, 'S')
  
  doc.setTextColor(220, 53, 69)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('MISSED PAYMENTS', 80, 92, { align: 'center' })
  doc.setFontSize(12)
  doc.text(data.rent_payments.missed_payments.toString(), 80, 100, { align: 'center' })

  doc.setFillColor(255, 255, 245)
  doc.rect(105, 85, 40, 25, 'F')
  doc.setDrawColor(253, 126, 20)
  doc.rect(105, 85, 40, 25, 'S')
  
  doc.setTextColor(253, 126, 20)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('LATE PAYMENTS', 125, 92, { align: 'center' })
  doc.setFontSize(12)
  doc.text(data.rent_payments.late_payment_count.toString(), 125, 100, { align: 'center' })

  doc.setFillColor(245, 245, 255)
  doc.rect(150, 85, 40, 25, 'F')
  doc.setDrawColor(103, 126, 232)
  doc.rect(150, 85, 40, 25, 'S')
  
  doc.setTextColor(103, 126, 232)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('AVG DELAY', 170, 92, { align: 'center' })
  doc.setFontSize(12)
  doc.text(`${data.rent_payments.average_payment_delay_days}d`, 170, 100, { align: 'center' })

  // Detailed Payment History Table
  doc.setTextColor(34, 139, 34)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('DETAILED PAYMENT HISTORY', 20, 125)
  doc.setDrawColor(34, 139, 34)
  doc.line(20, 127, 190, 127)

  const paymentData = [
    ['Payment Date', 'Amount', 'Status', 'Notes'],
    ...data.payment_history.map(payment => [
      payment.payment_date,
      payment.amount,
      payment.status,
      payment.notes.substring(0, 30) + (payment.notes.length > 30 ? '...' : '')
    ])
  ]

  doc.autoTable({
    startY: 135,
    body: paymentData,
    theme: 'grid',
    headStyles: {
      fillColor: [34, 139, 34],
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
      1: { halign: 'right', fontStyle: 'bold' },
      2: { halign: 'center' }
    },
    styles: {
      lineWidth: 0.5,
      lineColor: [209, 213, 219]
    }
  })

  const paymentEnd = (doc as any).lastAutoTable.finalY + 5

  // PAGE BREAK FOR PROPERTY CONDITION AND BEHAVIOR
  doc.addPage()

  // Property Condition Assessment
  doc.setTextColor(34, 139, 34)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('PROPERTY CONDITION ASSESSMENT', 20, 20)
  doc.setDrawColor(34, 139, 34)
  doc.line(20, 22, 190, 22)

  // Property condition table
  const conditionData = [
    ['Assessment Category', 'Condition Rating', 'Details', 'Financial Impact'],
    ['Move-in Condition', data.property_condition.move_in_condition, 'Professional Inspection', 'Baseline'],
    ['Move-out Condition', data.property_condition.move_out_condition, 'Final Inspection', 'Charges Applied'],
    ['Damage Deposit', '£' + data.property_condition.damage_deposit_charged.toFixed(2), 'Original Deposit', 'Held'],
    ['Cleaning Charges', '£' + data.property_condition.cleaning_charges.toFixed(2), 'Deep Clean Required', 'Debited'],
    ['Damage Charges', '£' + data.property_condition.damage_charges.toFixed(2), 'Repairs Required', 'Debited'],
    ['Final Refund', '£' + data.property_condition.total_deposit_return.toFixed(2), 'Net Deposit Return', 'Total']
  ]

  doc.autoTable({
    startY: 30,
    body: conditionData,
    theme: 'grid',
    headStyles: {
      fillColor: [34, 139, 34],
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
      1: { halign: 'center', fontStyle: 'bold' },
      3: { halign: 'right', fontStyle: 'bold' }
    },
    styles: {
      lineWidth: 0.5,
      lineColor: [209, 213, 219]
    }
  })

  const conditionEnd = (doc as any).lastAutoTable.finalY + 5

  // Behavior Assessment Section
  doc.setTextColor(34, 139, 34)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('TENANT BEHAVIOR ASSESSMENT', 20, conditionEnd + 10)
  doc.setDrawColor(34, 139, 34)
  doc.line(20, conditionEnd + 12, 190, conditionEnd + 12)

  // Behavior metrics
  doc.setFillColor(248, 249, 250)
  doc.setDrawColor(34, 139, 34)
  doc.rect(15, conditionEnd + 18, 180, 35, 'FD')
  
  doc.setTextColor(34, 139, 34)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  
  const behaviorMetrics = [
    ['Noise Complaints:', data.behavior_assessment.noise_complaints.toString()],
    ['Neighbor Conflicts:', data.behavior_assessment.neighbor_conflicts.toString()],
    ['Maintenance Requests:', data.behavior_assessment.maintenance_requests.toString()],
    ['Tenancy Quality:', data.behavior_assessment.overall_tenancy_quality],
    ['Future Recommendation:', data.behavior_assessment.recommended_for_future_tenancy ? 'YES' : 'NO']
  ]
  
  behaviorMetrics.forEach((row, i) => {
    const color = i === 4 ? (data.behavior_assessment.recommended_for_future_tenancy ? [40, 167, 69] : [220, 53, 69]) : [34, 139, 34]
    
    doc.setTextColor(...color)
    doc.text(row[0], 25, conditionEnd + 30 + (i * 5))
    doc.setTextColor(75, 85, 99)
    doc.text(row[1], 100, conditionEnd + 30 + (i * 5))
  })

  // Additional Information
  if (data.additional_information) {
    doc.setTextColor(34, 139, 34)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('ADDITIONAL INFORMATION', 20, conditionEnd + 55)
    doc.setDrawColor(34, 139, 34)
    doc.line(20, conditionEnd + 57, 190, conditionEnd + 57)

    doc.setTextColor(75, 85, 99)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const noteLines = doc.splitTextToSize(data.additional_information, 175, { fontSize: 9 })
    doc.text(noteLines, 20, conditionEnd + 67)
  }

  // Reference Summary Conclusion
  doc.setFillColor(245, 255, 245)
  doc.setDrawColor(40, 167, 69)
  doc.rect(15, conditionEnd + 95, 180, 25, 'FD')
  
  doc.setTextColor(40, 167, 69)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('REFERENCE SUMMARY', 25, conditionEnd + 105)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('This tenant has been assessed across multiple criteria including payment', 25, conditionEnd + 113)
  doc.text('performance, property care, and community relationships. Please contact us', 25, conditionEnd + 117)
  doc.text('with any additional questions regarding this reference.', 25, conditionEnd + 121)

  // Signature Section
  doc.setTextColor(75, 85, 99)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Authorized Signature:', 20, 250)
  
  // Signature line
  doc.setDrawColor(75, 85, 99)
  doc.line(80, 248, 140, 248)
  
  // Signature details
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(data.property_manager_name, 90, 260)
  doc.text('Property Manager', 85, 265)

  // Contact verification stamp
  doc.setFillColor(240, 240, 240)
  doc.rect(150, 245, 35, 25, 'F')
  doc.setDrawColor(34, 139, 34)
  doc.rect(150, 245, 35, 25, 'S')
  
  doc.setTextColor(34, 139, 34)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.text('VERIFIED', 167, 253, { align: 'center' })
  doc.text('REFERENCE', 167, 257, { align: 'center' })
  doc.text(data.reference_date.split('-')[0], 167, 261, { align: 'center' })
  doc.text('CONFIRMED', 167, 265, { align: 'center' })

  // Footer disclaimer
  doc.setTextColor(153, 153, 153)
  doc.setFontSize(7)
  doc.text('Internet Streets Entertainment – Not a Real Document', 105, 275, { align: 'center' })

  // Microtext
  doc.setFontSize(6)
  doc.text(`Reference ID: ${data.tenant_name.replace(' ', '')}-${data.reference_date.split('-')[0]} • Generated ${new Date().toISOString().split('T')[0]}`, 20, 280)
  doc.text('Property Management System', 200, 280, { align: 'right' })

  return doc
}