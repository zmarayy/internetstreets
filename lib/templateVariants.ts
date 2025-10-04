/**
 * Template Variant System
 * Provides 3 visual variants for each service template
 */

export type TemplateVariant = 'clean' | 'folder' | 'scanned'

export interface VariantConfig {
  variant: TemplateVariant
  className: string
  description: string
  features: string[]
}

export const TEMPLATE_VARIANTS: Record<TemplateVariant, VariantConfig> = {
  clean: {
    variant: 'clean',
    className: 'variant-clean',
    description: 'Clean official memo layout',
    features: ['Minimal optics', 'Focus on tables', 'Professional headers', 'Clean typography']
  },
  folder: {
    variant: 'folder',
    className: 'variant-folder',
    description: 'Folder/Case layout with cover-style first page',
    features: ['Large seal', 'Cover image overlay', 'Case folder styling', 'Enhanced visual hierarchy']
  },
  scanned: {
    variant: 'scanned',
    className: 'variant-scanned',
    description: 'Scanned memo with subtle noise overlay',
    features: ['Scan noise effect', 'DALL·E cover image', 'Retro aesthetic', 'Document authenticity']
  }
}

/**
 * Randomly select a template variant
 */
export function selectRandomVariant(): TemplateVariant {
  const variants: TemplateVariant[] = ['clean', 'folder', 'scanned']
  return variants[Math.floor(Math.random() * variants.length)]
}

/**
 * Get variant configuration
 */
export function getVariantConfig(variant: TemplateVariant): VariantConfig {
  return TEMPLATE_VARIANTS[variant]
}

/**
 * Generate QR code data for verification
 */
export function generateQRData(sessionId: string, serviceSlug: string): string {
  return `https://internetstreets.uk/verify/${sessionId}?service=${serviceSlug}&t=${Date.now()}`
}

/**
 * Generate document ID for microtext
 */
export function generateDocumentId(serviceSlug: string, caseNumber?: string): string {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return caseNumber ? `${caseNumber}-${random}` : `${serviceSlug.toUpperCase()}-${timestamp}-${random}`
}

/**
 * Content density requirements per service
 */
export const CONTENT_DENSITY_REQUIREMENTS = {
  'fbi-file': {
    minSurveillanceLogs: 8,
    maxSurveillanceLogs: 12,
    minNarrativeParagraphs: 3,
    minKeyFindings: 5,
    minEvidenceItems: 6
  },
  'nsa-surveillance': {
    minSurveillanceLogs: 10,
    maxSurveillanceLogs: 15,
    minNarrativeParagraphs: 3,
    minKeyFindings: 6,
    minEvidenceItems: 8
  },
  'criminal-record': {
    minCriminalHistory: 5,
    maxCriminalHistory: 10,
    minNarrativeParagraphs: 2,
    minKeyFindings: 4,
    minInvestigationTypes: 4
  },
  'payslip': {
    minDeductionItems: 5,
    maxDeductionItems: 8,
    minNarrativeParagraphs: 2,
    minKeyFindings: 3,
    minPaymentHistory: 6
  },
  'college-degree': {
    minCourses: 8,
    maxCourses: 15,
    minNarrativeParagraphs: 2,
    minKeyFindings: 4,
    minAcademicYears: 3
  },
  'rent-reference': {
    minPaymentHistory: 6,
    maxPaymentHistory: 12,
    minNarrativeParagraphs: 2,
    minKeyFindings: 4,
    minBehaviorMetrics: 5
  }
}

/**
 * Generate filler content when arrays are too short
 */
export function generateFillerContent(serviceSlug: string, fieldType: string, currentLength: number, requiredLength: number): string[] {
  const fillers: Record<string, string[]> = {
    'surveillance_logs': [
      'No further activity recorded on this date',
      'Routine surveillance - no significant observations',
      'Subject maintains normal daily patterns',
      'No suspicious behavior detected',
      'Standard monitoring protocols in effect'
    ],
    'criminal_history': [
      'No additional charges pending',
      'Clean record maintained since last incident',
      'No outstanding warrants',
      'All previous charges resolved',
      'No further legal proceedings'
    ],
    'payment_history': [
      'No additional payments recorded',
      'Payment schedule maintained as expected',
      'No outstanding balances',
      'All payments processed successfully',
      'No payment issues reported'
    ],
    'courses': [
      'Additional elective courses completed',
      'General education requirements fulfilled',
      'Core curriculum requirements met',
      'Elective studies completed',
      'Academic requirements satisfied'
    ]
  }

  const serviceFillers = fillers[fieldType] || ['No additional entries', 'No further data available', '—', 'N/A', 'Not applicable']
  const needed = requiredLength - currentLength
  
  if (needed <= 0) return []
  
  const result: string[] = []
  for (let i = 0; i < needed; i++) {
    result.push(serviceFillers[i % serviceFillers.length])
  }
  
  return result
}

/**
 * Domain-specific narrative tone guidelines
 */
export const NARRATIVE_TONE_GUIDELINES = {
  'fbi-file': {
    style: 'formal, clipped, analyst-like',
    acronyms: ['FBI', 'NSA', 'CIA', 'DHS', 'ATF', 'FISA', 'FISA Court', 'SIGINT', 'HUMINT'],
    phrases: ['intelligence indicates', 'surveillance confirms', 'analysis suggests', 'operational security', 'threat assessment'],
    sentenceLength: 'varied: short terse statements mixed with longer analytical paragraphs'
  },
  'payslip': {
    style: 'corporate, professional, payroll-focused',
    acronyms: ['HR', 'PAYE', 'NI', 'P45', 'P60', 'BACS', 'HMRC', 'RTI'],
    phrases: ['employee benefits', 'payroll processing', 'tax calculations', 'deduction schedule', 'net payment'],
    sentenceLength: 'clear, concise, business-appropriate'
  },
  'college-degree': {
    style: 'ceremonial, academic, formal',
    acronyms: ['GPA', 'BA', 'MA', 'PhD', 'BSc', 'MSc', 'LLB', 'MBA'],
    phrases: ['conferred upon', 'academic excellence', 'scholarly achievement', 'cum laude', 'magna cum laude'],
    sentenceLength: 'formal, longer sentences with ceremonial language'
  },
  'criminal-record': {
    style: 'legal, formal, court-appropriate',
    acronyms: ['CPS', 'Crown Court', 'Magistrates', 'CPS', 'PACE', 'POCA'],
    phrases: ['court proceedings', 'legal proceedings', 'criminal justice', 'prosecution evidence', 'sentencing guidelines'],
    sentenceLength: 'formal legal language, precise and technical'
  },
  'rent-reference': {
    style: 'professional, property management',
    acronyms: ['AST', 'DSS', 'HMO', 'EPC', 'EICR', 'RTB'],
    phrases: ['property management', 'tenancy agreement', 'rental payments', 'property condition', 'tenant behavior'],
    sentenceLength: 'professional, clear, property management appropriate'
  }
}
