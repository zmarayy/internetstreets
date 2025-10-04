import React from 'react'
import { pdfGenerate as jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { generateServiceBrand } from '@/lib/brand'

interface PayslipData {
  employee_name: string
  employee_id: string
  pay_period_start: string
  pay_period_end: string
  employer_name: string
  employer_address: string
  tax_code: string
  base_salary: number
  overtime_hours: number
  overtime_rate: number
  bonuses: number
  gross_pay: number
  income_tax: number
  national_insurance: number
  pension_contribution: number
  student_loan: number
  other_deductions: number
  net_pay: number
  pay_date: string
  payment_method: string
  bank_details: {
    name: string
    sort_code: string
    account_number: string
  }
  year_to_date_totals: {
    gross_pay: number
    tax_paid: number
    national_insurance: number
    pension_contribution: number
  }
}

interface PayslipProps {
  data: PayslipData
  sanitizedInputs?: {
    org_sanitized?: boolean
    sanitized_reason?: string
  }
}

export default function PayslipTemplate({ data, sanitizedInputs }: PayslipProps) {
  const doc = new jsPDF()
  
  // Generate professional branding
  const brand = generateServiceBrand('payslip', data.employer_name)
  
  // Set document properties
  doc.setProperties({
    title: `Payslip - ${data.employee_name}`,
    subject: `Pay Period: ${data.pay_period_start} to ${data.pay_period_end}`,
    creator: brand.text,
    author: 'Human Resources'
  })

  // COMPANY HEADER WITH LOGO
  // Header background
  doc.setFillColor(0, 100, 70) // Dark green for corporate
  doc.rect(0, 0, 210, 25, 'F')
  
  // Company logo area (top left)
  doc.setFillColor(255, 255, 255) // White logo background
  doc.circle(15, 12, 6, 'F')
  doc.setFillColor(0, 100, 70) // Green inside
  doc.circle(15, 12, 5, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('CS', 15, 15, { align: 'center' })
  
  // Company name and address
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(brand.text, 35, 12)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(data.employer_address, 35, 16)
  doc.text('PAYSLIP GENERATION SYSTEM', 35, 20)

  // Document title
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('PAY STATEMENT', 105, 22, { align: 'center' })

  // Pay period and employee info table
  doc.setDrawColor(0, 100, 70)
  doc.setFillColor(248, 249, 250)
  doc.rect(15, 30, 180, 35, 'FD')
  
  // Employee Information
  doc.setTextColor(0, 100, 70)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('EMPLOYEE INFORMATION', 20, 35)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  
  const employeeInfo = [
    ['Employee Name:', data.employee_name],
    ['Employee ID:', data.employee_id],
    ['Tax Code:', data.tax_code],
    ['Pay Period:', `${data.pay_period_start} to ${data.pay_period_end}`]
']

  employeeInfo.forEach((row, i) => {
    doc.text(row[0], 25, 45 + (i * 4))
    doc.setTextColor(75, 85, 99)
    doc.text(row[1], 85, 45 + (i * 4))
    doc.setTextColor(0, 100, 70)
  })

  // Right side - Pay details
  doc.text('PAYMENT DETAILS', 125, 35)
  
  const paymentInfo = [
    ['Bank Name:', data.bank_details.name],
    ['Sort Code:', data.bank_details.sort_code],
    ['Account No:', `****${data.bank_details.account_number.slice(-4)}`],
    ['Pay Date:', data.pay_date]
  ]
  
  paymentInfo.forEach((row, i) => {
    doc.text(row[0], 125, 45 + (i * 4))
    doc.setTextColor(75, 85, 99)
    doc.text(row[1], 165, 45 + (i * 4))
    doc.setTextColor(0, 100, 70)
  })

  // Earnings section
  doc.setTextColor(0, 100, 70)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('EARNINGS BREAKDOWN', 20, 75)
  doc.setDrawColor(0, 100, 70)
  doc.line(20, 77, 190, 77)

  // Earnings table
  const earningsData = [
    ['Earnings Category', 'Hours', 'Rate', 'Amount', 'YTD Total'],
    ['Base Salary', '', '', `£${data.base_salary.toFixed(2)}`, `£${data.year_to_date_totals.gross_pay.toFixed(2)}`],
    ['Overtime', data.overtime_hours.toString(), `£${data.overtime_rate.toFixed(2)}/hr`, `£${(data.overtime_hours * data.overtime_rate).toFixed(2)}`, '£0.00'],
    ['Bonus Payment', '', '', `£${data.bonuses.toFixed(2)}`, '£0.00'],
    ['', '', '', '', ''],
    ['TOTAL GROSS EARNINGS', '', '', `£${data.gross_pay.toFixed(2)}`, `£${data.year_to_date_totals.gross_pay.toFixed(2)}`]
  ]

  doc.autoTable({
    startY: 85,
    body: earningsData,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 100, 70],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8,
      fontStyle: 'normal',
      halign: 'left'
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    },
    columnStyles: {
      3: { halign: 'right', fontStyle: 'bold' },
      4: { halign: 'right' }
    },
    styles: {
      lineWidth: 0.5,
      lineColor: [209, 213, 219]
    }
  })

  const earningsTableEnd = (doc as any).lastAutoTable.finalY + 5

  // Deductions section
  doc.setTextColor(220, 53, 69)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('DEDUCTIONS', 20, earningsTableEnd + 5)
  doc.setDrawColor(220, 53, 69)
  doc.line(20, earningsTableEnd + 7, 190, earningsTableEnd + 7)

  const deductionsData = [
    ['Deduction Type', 'Amount', 'Calculation Method', 'YTD Total'],
    ['Income Tax', `£${data.income_tax.toFixed(2)}`, `${data.tax_code}`, `£${data.year_to_date_totals.tax_paid.toFixed(2)}`],
    ['National Insurance', `£${data.national_insurance.toFixed(2)}`, 'Class 1', `£${data.year_to_date_totals.national_insurance.toFixed(2)}`],
    ['Pension Contribution', `£${data.pension_contribution.toFixed(2)}`, '3% Auto Enrolment', `£${data.year_to_date_totals.pension_contribution.toFixed(2)}`],
    ['Student Loan (Plan 2)', `£${data.student_loan.toFixed(2)}`, 'Income Threshold', '£0.00'],
    ['Other Deductions', `£${data.other_deductions.toFixed(2)}`, 'Various', '£0.00'],
    ['', '', '', ''],
    ['TOTAL DEDUCTIONS', `£${(data.income_tax + data.national_insurance + data.pension_contribution + data.student_loan + data.other_deductions).toFixed(2)}`, '', '']
  ]

  doc.autoTable({
    startY: earningsTableEnd + 12,
    body: deductionsData,
    theme: 'grid',
    headStyles: {
      fillColor: [220, 53, 69],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8,
      fontStyle: 'normal',
      halign: 'left'
    },
    alternateRowStyles: {
      fillColor: [255, 245, 245]
    },
    columnStyles: {
      1: { halign: 'right', fontStyle: 'bold' },
      3: { halign: 'right' }
    },
    styles: {
      lineWidth: 0.5,
      lineColor: [209, 213, 219]
    }
  })

  const deductionsTableEnd = (doc as any).lastAutoTable.finalY + 5

  // NET PAY SUMMARY BOX
  doc.setFillColor(0, 100, 70)
  doc.setDrawColor(0, 100, 70)
  doc.rect(15, deductionsTableEnd + 10, 180, 20, 'FD')
  
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('NET PAYMENT DUE', 105, deductionsTableEnd + 18, { align: 'center' })
  
  doc.setFontSize(18)
  doc.text(`£${data.net_pay.toFixed(2)}`, 105, deductionsTableEnd + 25, { align: 'center' })

  // Payment Method section
  doc.setTextColor(75, 85, 99)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(`Payment Method: ${data.payment_method}`, 30, deductionsTableEnd + 35)
  
  // Footer information
  doc.setTextColor(75, 85, 99)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('This payslip has been generated electronically and is valid without signature.', 20, deductionsTableEnd + 50)
  doc.text('If you have any queries about this payslip, please contact HR department.', 20, deductionsTableEnd + 55)
  
  // Signature area
  doc.setTextColor(75, 85, 99)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('Authorized by:', 20, deductionsTableEnd + 70)
  
  // Signature line
  doc.setDrawColor(75, 85, 99)
  doc.line(60, deductionsTableEnd + 68, 120, deductionsTableEnd + 68)
  
  doc.setFont('helvetica', 'normal')
  doc.text('HR Manager', 70, deductionsTableEnd + 75)

  // Contact information box
  doc.setFillColor(248, 249, 250)
  doc.setDrawColor(0, 100, 70)
  doc.rect(15, deductionsTableEnd + 85, 180, 15, 'FD')
  
  doc.setTextColor(0, 100, 70)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('HR CONTACT INFORMATION', 25, deductionsTableEnd + 93)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text('Email: hr@company.com | Phone: 0800 123 456 | Office Hours: Mon-Fri 9AM-5PM', 25, deductionsTableEnd + 98)

  // Footer disclaimer
  doc.setTextColor(153, 153, 153)
  doc.setFontSize(7)
  doc.text('Internet Streets Entertainment – Not a Real Document', 105, deductionsTableEnd + 110, { align: 'center' })

  // Microtext
  doc.setFontSize(6)
  doc.text(`Payslip Ref: ${data.employee_id} • Generated ${new Date().toISOString().split('T')[0]}`, 20, deductionsTableEnd + 115)
  doc.text('Secure Generated Document', 200, deductionsTableEnd + 115, { align: 'right' })

  return doc
}