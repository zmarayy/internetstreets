import React from 'react'
import { pdfGenerate as jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { generateServiceBrand } from '@/lib/brand'

interface CollegeDegreeData {
  student_name: string
  degree_type: string
  field_of_study: string
  university_name: string
  graduation_date: string
  grade_classification: string
  gpa_score: number
  honors: string
  academic_year: string
  registrar_signature: string
  chancellor_signature: string
  university_seal_text: string
  transcript_summary: {
    year_1_courses: Array<{
      course_title: string
      credit_hours: number
      grade: string
      gpa_points: number
    }>
    year_2_courses: Array<{
      course_title: string
      credit_hours: number
      grade: string
      gpa_points: number
    }>
    year_3_courses: Array<{
      course_title: string
      credit_hours: number
      grade: string
      gpa_points: number
    }>
    total_credits: number
    cumulative_gpa: number
  }
  graduation_ceremony: {
    ceremony_date: string
    commencement_speaker: string
    location: string
    attendees_count: string
  }
}

interface CollegeDegreeProps {
  data: CollegeDegreeData
  sanitizedInputs?: {
    org_sanitized?: boolean
    sanitized_reason?: string
  }
}

export default function CollegeDegreeTemplate({ data, sanitizedInputs }: CollegeDegreeProps) {
  const doc = new jsPDF()
  
  // Generate professional branding
  const brand = generateServiceBrand('college-degree', data.university_name)
  
  // Set document properties
  doc.setProperties({
    title: `${data.degree_type} Degree - ${data.student_name}`,
    subject: `${data.university_name} Diploma`,
    creator: brand.text,
    author: 'Academic Records Office'
  })

  // PAGE 1 - DEGREE CERTIFICATE
  // University header with ornamental design
  doc.setFillColor(101, 67, 33) // Deep brown/maroon for education
  doc.rect(0, 0, 210, 30, 'F')
  
  // Ornamental border top
  doc.setDrawColor(218, 165, 32) // Gold
  doc.setLineWidth(2)
  doc.line(15, 2, 195, 2)
  doc.line(15, 5, 195, 5)
  
  // University seal (circular)
  doc.setFillColor(218, 165, 32)
  doc.circle(30, 17, 12, 'F')
  doc.setDrawColor(101, 67, 33)
  doc.setLineWidth(2)
  doc.circle(30, 17, 12, 'S')
  
  // Seal details
  doc.setTextColor(101, 67, 33)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('CU', 30, 20, { align: 'center' })
  
  // Inner seal ring
  doc.setDrawColor(101, 67, 33)
  doc.setFillColor(255, 215, 0)
  doc.circle(30, 17, 8, 'FD')
  
  // Central emblem
  doc.setTextColor(101, 67, 33)
  doc.setFontSize(7)
  doc.text('ACADEMIA', 30, 18, { align: 'center' })

  // University name
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(brand.text, 55, 22)
  
  // Subtitle
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('COLLEGE OF HIGHER EDUCATION', 55, 26)

  // Ornamental border bottom
  doc.setDrawColor(218, 165, 32)
  doc.setLineWidth(2)
  doc.line(15, 27, 195, 27)

  // Main certificate content
  doc.setTextColor(101, 67, 33)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  
  // Certificate declaration
  const certificateText = [
    '',
    '',
    'This is to certify',
    'THAT',
    `${data.student_name}`,
    'has successfully completed the requirements and',
    'is hereby conferred the degree of',
    `${data.degree_type}`,
    `in ${data.field_of_study}`,
    'with a classification of',
    `${data.grade_classification}`,
    '',
    `Given this ${data.graduation_date} at ${brand.text}`
  ]
  
  certificateText.forEach((line, i) => {
    const yPos = 50 + (i * 6)
    if (line.toUpperCase() === line && line.length > 5) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.text(line, 105, yPos, { align: 'center' })
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
    } else {
      doc.text(line, 105, yPos, { align: 'center' })
    }
  })

  // GPA and honors section
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(`${data.gpa_score}/4.0 GPA`, 105, 140, { align: 'center' })
  
  if (data.honors) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`${data.honors}`, 105, 148, { align: 'center' })
  }

  // Signature section
  doc.setTextColor(75, 85, 99)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Registrar', 60, 200)
  doc.text('Chancellor', 150, 200)
  
  // Signature lines
  doc.setDrawColor(75, 85, 99)
  doc.line(50, 195, 100, 195)
  doc.line(130, 195, 180, 195)
  
  doc.setFont('helvetica', 'normal')
  doc.text(data.registrar_signature, 75, 210, { align: 'center' })
  doc.text(data.chancellor_signature, 155, 210, { align: 'center' })

  // University seal authenticator
  doc.setFillColor(240, 240, 240)
  doc.circle(105, 230, 25, 'F')
  doc.setDrawColor(101, 67, 33)
  doc.setLineWidth(2)
  doc.circle(105, 230, 25, 'S')
  
  doc.setTextColor(101, 67, 33)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text(brand.text.split(' ')[0], 105, 225, { align: 'center' })
  doc.text('OFFICIAL SEAL', 105, 230, { align: 'center' })
  doc.text(data.graduation_date.split('-')[0], 105, 235, { align: 'center' })

  // PAGE BREAK for transcript
  doc.addPage()

  // DETAILED TRANSCRIPT
  doc.setTextColor(101, 67, 33)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('ACADEMIC TRANSCRIPT', 20, 20)
  doc.setDrawColor(101, 67, 33)
  doc.line(20, 22, 190, 22)

  // Student and degree information
  doc.setFillColor(248, 249, 250)
  doc.setDrawColor(101, 67, 33)
  doc.rect(15, 25, 180, 25, 'FD')
  
  doc.setTextColor(101, 67, 33)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('STUDENT INFORMATION', 20, 30)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  
  const studentInfo = [
    ['Student Name:', data.student_name],
    ['Degree Program:', `${data.degree_type} in ${data.field_of_study}`],
    ['Academic Year:', data.academic_year],
    ['Graduation Date:', data.graduation_date]
  ]
  
  studentInfo.forEach((row, i) => {
    doc.text(row[0], 25, 40 + (i * 4))
    doc.setTextColor(75, 85, 99)
    doc.text(row[1], 80, 40 + (i * 4))
    doc.setTextColor(101, 67, 33)
  })

  // Academic performance summary
  doc.setTextColor(101, 67, 33)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('ACADEMIC PERFORMANCE', 20, 60)
  doc.setDrawColor(101, 67, 33)
  doc.line(20, 62, 190, 62)

  const perfData = [
    ['Academic Metric', 'Value', 'Classification', 'Honors'],
    ['Final GPA', `${data.gpa_score}/4.0`, data.grade_classification, data.honors],
    ['Total Credits', `${data.transcript_summary.total_credits}`, 'Complete', 'Earned'],
    ['Cumulative GPA', `${data.transcript_summary.cumulative_gpa}/4.0`, 'Final', 'Verified']
  ]

  doc.autoTable({
    startY: 70,
    body: perfData,
    theme: 'grid',
    headStyles: {
      fillColor: [101, 67, 33],
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
      1: { halign: 'center', fontStyle: 'bold' }
    },
    styles: {
      lineWidth: 0.5,
      lineColor: [209, 213, 219]
    }
  })

  const perfTableEnd = (doc as any).lastAutoTable.finalY + 5

  // Course transcript by year
  doc.setTextColor(101, 67, 33)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('DETAILED COURSE TRANSCRIPT', 20, perfTableEnd + 10)

  // Year 1 courses
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('FIRST YEAR COURSES', 20, perfTableEnd + 20)
  
  const year1Data = [
    ['Course Code', 'Course Title', 'Credits', 'Grade', 'GPA Points'],
    ...data.transcript_summary.year_1_courses.map(course => [
      course.course_title.substring(0, 15),
      course.course_title,
      course.credit_hours.toString(),
      course.grade,
      course.gpa_points.toFixed(2)
    ])
  ]

  doc.autoTable({
    startY: perfTableEnd + 25,
    body: year1Data,
    theme: 'grid',
    headStyles: {
      fillColor: [101, 67, 33],
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
    styles: {
      lineWidth: 0.5,
      lineColor: [209, 213, 219]
    }
  })

  const year1End = (doc as any).lastAutoTable.finalY + 5

  // Continue with year 2 and 3 if needed...
  if (year1End < 250) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('SECOND & THIRD YEAR COURSES', 20, year1End + 5)
    
    // Concatenate years 2 and 3
    const year2Data = [
      ['Course Code', 'Course Title', 'Credits', 'Grade', 'GPA Points'],
      ...data.transcript_summary.year_2_courses.map(course => [
        course.course_title.substring(0, 15),
        course.course_title,
        course.credit_hours.toString(),
        course.grade,
        course.gpa_points.toFixed(2)
      ]),
      ...data.transcript_summary.year_3_courses.map(course => [
        course.course_title.substring(0, 15),
        course.course_title,
        course.credit_hours.toString(),
        course.grade,
        course.gpa_points.toFixed(2)
      ])
    ]

    doc.autoTable({
      startY: year1End + 10,
      body: year2Data,
      theme: 'grid',
      headStyles: {
        fillColor: [101, 67, 33],
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
      styles: {
        lineWidth: 0.5,
        lineColor: [209, 213, 219]
      }
    })
  }

  // Graduation ceremony details
  const ceremonyEnd = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 20 : year1End + 50
  
  doc.setTextColor(101, 67, 33)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('GRADUATION CEREMONY DETAILS', 20, ceremonyEnd + 10)

  doc.setFillColor(248, 249, 250)
  doc.rect(15, ceremonyEnd + 15, 180, 30, 'FD')
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  
  const ceremonyInfo = [
    ['Ceremony Date:', data.graduation_ceremony.ceremony_date],
    ['Location:', data.graduation_ceremony.location],
    ['Commencement Speaker:', data.graduation_ceremony.commencement_speaker],
    ['Graduation Class Size:', data.graduation_ceremony.attendees_count]
  ]
  
  ceremonyInfo.forEach((row, i) => {
    doc.text(row[0], 25, ceremonyEnd + 25+ (i * 4))
    doc.setTextColor(75, 85, 99)
    doc.text(row[1], 90, ceremonyEnd + 25 + (i * 4))
    doc.setTextColor(101, 67, 33)
  })

  // Verification stamp
  doc.setFillColor(240, 240, 240)
  doc.rect(140, ceremonyEnd + 20, 40, 20, 'F')
  doc.setDrawColor(101, 67, 33)
  doc.rect(140, ceremonyEnd + 20, 40, 20, 'S')
  
  doc.setTextColor(101, 67, 33)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.text('VERIFIED', 160, ceremonyEnd + 28, { align: 'center' })
  doc.text(data.graduation_date.split('-')[0], 160, ceremonyEnd + 32, { align: 'center' })

  // Footer disclaimer
  doc.setTextColor(153, 153, 153)
  doc.setFontSize(7)
  doc.text('Internet Streets Entertainment – Not a Real Document', 105, 285, { align: 'center' })

  // Microtext
  doc.setFontSize(6)
  doc.text(`Degree Ref: ${data.student_name.replace(' ', '')}-${data.graduation_date.split('-')[0]} • Generated ${new Date().toISOString().split('T')[0]}`, 20, 290)
  doc.text('Academic Verification System', 200, 290, { align: 'right' })

  return doc
}