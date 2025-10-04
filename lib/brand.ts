/**
 * Brand Generator - Faux SVG Logo/Seal Creation
 * Generates believable non-trademarked logos and seals for documents
 */

export interface BrandOptions {
  name: string
  type: 'government' | 'company' | 'educational' | 'financial' | 'medical' | 'military'
  sanitized?: boolean
}

export interface GeneratedBrand {
  svg: string
  text: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
}

/**
 * Color schemes for different organization types
 */
const COLOR_SCHEMES = {
  government: {
    primary: '#1e3a8a',    // Dark blue
    secondary: '#dc2626',  // Red
    accent: '#fbbf24'     // Gold
  },
  company: {
    primary: '#0f172a',    // Dark slate
    secondary: '#3b82f6',  // Blue
    accent: '#10b981'     // Green
  },
  educational: {
    primary: '#7c3aed',    // Purple
    secondary: '#1d4ed8',  // Blue
    accent: '#f59e0b'     // Orange
  },
  financial: {
    primary: '#059669',    // Green
    secondary: '#0f172a',  // Dark
    accent: '#dc2626'     // Red
  },
  medical: {
    primary: '#dc2626',    // Red
    secondary: '#1e40af',  // Blue
    accent: '#f59e0b'     // Orange
  },
  military: {
    primary: '#374151',    // Grey
    secondary: '#dc2626',  // Red
    accent: '#d97706'     // Brown
  }
}

/**
 * Generate initials from name
 */
function generateInitials(name: string): string {
  const words = name.split(' ').filter(word => word.length > 0)
  
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  } else if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase()
  } else {
    return 'XX'
  }
}

/**
 * Generate organization text based on type and sanitization status
 */
function generateOrganizationText(options: BrandOptions): string {
  const { name, type, sanitized } = options
  
  if (sanitized) {
    const sanitizedNames = {
      government: 'Department of Records',
      company: 'National Corporation',
      educational: 'National University',
      financial: 'Financial Institution',
      medical: 'Healthcare Services',
      military: 'Defense Department'
    }
    return sanitizedNames[type] || 'National Agency'
  }

  // Clean and capitalize the name
  return name.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Generate circular seal SVG with embossed effect and inner glyph
 */
function generateCircularSeal(options: BrandOptions, colors: any): string {
  const { name, type, sanitized } = options
  const organizationText = generateOrganizationText(options)
  const initials = generateInitials(name)
  
  // Generate inner glyph based on organization type
  const innerGlyph = generateInnerGlyph(type)
  
  return `
    <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Embossed gradient effect -->
        <radialGradient id="emboss" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stop-color="rgba(255,255,255,0.3)"/>
          <stop offset="50%" stop-color="rgba(255,255,255,0.1)"/>
          <stop offset="100%" stop-color="rgba(0,0,0,0.1)"/>
        </radialGradient>
        
        <!-- Drop shadow filter -->
        <filter id="dropshadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
        
        <!-- Text path for organization name -->
        <path id="textPath" d="M 20 60 A 40 40 0 1 1 100 60" />
      </defs>
      
      <!-- Outer ring with embossed effect -->
      <circle cx="60" cy="60" r="55" fill="none" stroke="${colors.primary}" stroke-width="4" filter="url(#dropshadow)"/>
      <circle cx="60" cy="60" r="48" fill="${colors.primary}" opacity="0.08"/>
      
      <!-- Inner circle -->
      <circle cx="60" cy="60" r="35" fill="none" stroke="${colors.secondary}" stroke-width="2"/>
      
      <!-- Central emblem area with embossed background -->
      <circle cx="60" cy="60" r="25" fill="url(#emboss)" stroke="${colors.accent}" stroke-width="1"/>
      
      <!-- Central initials -->
      <text x="60" y="65" font-family="Georgia, serif" font-size="14" font-weight="bold" 
            text-anchor="middle" fill="${colors.primary}">${initials}</text>
      
      <!-- Inner glyph (shield, star, scroll, etc.) -->
      ${innerGlyph}
      
      <!-- Organization text around circumference -->
      <text font-family="Georgia, serif" font-size="9" font-weight="bold" 
            text-anchor="middle" fill="${colors.secondary}" letter-spacing="1px">
        <textPath href="#textPath" startOffset="50%">${organizationText.toUpperCase()}</textPath>
      </text>
      
      <!-- Decorative elements -->
      <g fill="${colors.accent}" opacity="0.6">
        <circle cx="35" cy="40" r="1.5"/>
        <circle cx="85" cy="40" r="1.5"/>
        <circle cx="35" cy="80" r="1.5"/>
        <circle cx="85" cy="80" r="1.5"/>
        <polygon points="60,25 65,35 55,35" fill="${colors.accent}" opacity="0.4"/>
        <polygon points="60,95 65,85 55,85" fill="${colors.accent}" opacity="0.4"/>
      </g>
    </svg>
  `;
}

/**
 * Generate inner glyph based on organization type
 */
function generateInnerGlyph(type: BrandOptions['type']): string {
  switch (type) {
    case 'government':
      return `
        <g fill="none" stroke="#b80f2a" stroke-width="1.5">
          <path d="M 50 50 L 60 45 L 70 50 L 70 60 L 60 70 L 50 60 Z"/>
          <circle cx="60" cy="57" r="3"/>
        </g>
      `
    case 'military':
      return `
        <g fill="none" stroke="#b80f2a" stroke-width="1.5">
          <path d="M 50 50 L 60 45 L 70 50 L 70 60 L 60 70 L 50 60 Z"/>
          <path d="M 55 55 L 65 55 M 60 50 L 60 60"/>
        </g>
      `
    case 'financial':
      return `
        <g fill="none" stroke="#123f2c" stroke-width="1.5">
          <rect x="50" y="50" width="20" height="20" rx="2"/>
          <path d="M 55 55 L 65 55 M 55 60 L 65 60 M 55 65 L 65 65"/>
        </g>
      `
    case 'educational':
      return `
        <g fill="none" stroke="#703030" stroke-width="1.5">
          <path d="M 50 50 L 60 45 L 70 50 L 70 60 L 60 70 L 50 60 Z"/>
          <path d="M 55 55 L 65 55 M 55 60 L 65 60"/>
        </g>
      `
    case 'medical':
      return `
        <g fill="none" stroke="#b80f2a" stroke-width="1.5">
          <circle cx="60" cy="55" r="8"/>
          <path d="M 60 50 L 60 60 M 55 55 L 65 55"/>
        </g>
      `
    default:
      return `
        <g fill="none" stroke="#666" stroke-width="1.5">
          <rect x="50" y="50" width="20" height="20" rx="2"/>
          <path d="M 55 55 L 65 55 M 55 60 L 65 60"/>
        </g>
      `
  }
}

/**
 * Generate rectangular logo SVG
 */
function generateRectangularLogo(options: BrandOptions, colors: any): string {
  const { name, type } = options
  const initials = generateInitials(name)
  const organizationText = generateOrganizationText(options)
  
  return `
    <svg width="200" height="80" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
      <!-- Rectangle background -->
      <rect x="2" y="2" width="196" height="76" rx="8" fill="none" stroke="${colors.primary}" stroke-width="2"/>
      <rect x="4" y="4" width="192" height="72" rx="6" fill="${colors.primary}" opacity="0.05"/>
      
      <!-- Left emblem area -->
      <circle cx="25" cy="40" r="15" fill="${colors.primary}" opacity="0.1"/>
      <circle cx="25" cy="40" r="12" fill="none" stroke="${colors.secondary}" stroke-width="2"/>
      <text x="25" y="46" font-family="Arial, sans-serif" font-size="12" font-weight="bold" 
            text-anchor="middle" fill="${colors.primary}">${initials}</text>
      
      <!-- Organization name -->
      <text x="55" y="35" font-family="Arial, sans-serif" font-size="16" font-weight="bold" 
            fill="${colors.primary}">${organizationText}</text>
      
      <!-- Subtitle -->
      <text x="55" y="50" font-family="Arial, sans-serif" font-size="11" 
            fill="${colors.secondary}" opacity="0.8">Official Documentation</text>
      
      <!-- Right decorative element -->
      <rect x="170" y="15" width="2" height="50" fill="${colors.accent}" opacity="0.6"/>
      <rect x="175" y="30" width="2" height="20" fill="${colors.accent}" opacity="0.4"/>
      <rect x="180" y="25" width="2" height="30" fill="${colors.accent}" opacity="0.4"/>
    </svg>
  `;
}

/**
 * Detect organization type from name/content
 */
function detectOrganizationType(name: string): BrandOptions['type'] {
  const lowerName = name.toLowerCase()
  
  if (lowerName.includes('gov') || lowerName.includes('ministry') || 
      lowerName.includes('department') || lowerName.includes('bureau')) {
    return 'government'
  }
  
  if (lowerName.includes('university') || lowerName.includes('college') || 
      lowerName.includes('school') || lowerName.includes('academy')) {
    return 'educational'
  }
  
  if (lowerName.includes('bank') || lowerName.includes('credit') || 
      lowerName.includes('financial') || lowerName.includes('financial')) {
    return 'financial'
  }
  
  if (lowerName.includes('hospital') || lowerName.includes('medical') || 
      lowerName.includes('health') || lowerName.includes('clinic')) {
    return 'medical'
  }
  
  if (lowerName.includes('military') || lowerName.includes('defense') || 
      lowerName.includes('army') || lowerName.includes('navy')) {
    return 'military'
  }
  
  return 'company' // Default
}

/**
 * Main brand generation function
 */
export function generateBrand(options: BrandOptions): GeneratedBrand {
  const colors = COLOR_SCHEMES[options.type]
  const organizationText = generateOrganizationText(options)
  
  // Choose seal or logo based on type
  const svg = options.type === 'government' || options.type === 'medical' || options.type === 'military'
    ? generateCircularSeal(options, colors)
    : generateRectangularLogo(options, colors)
  
  return {
    svg,
    text: organizationText,
    colors
  }
}

/**
 * Generate brand from automatic type detection
 */
export function generateBrandFromName(name: string, sanitized?: boolean): GeneratedBrand {
  const type = detectOrganizationType(name)
  return generateBrand({ name, type, sanitized })
}

/**
 * Generate service-specific branding
 */
export function generateServiceBrand(serviceSlug: string, organizationName?: string): GeneratedBrand {
  const defaultNames = {
    'fbi-file': 'Federal Intelligence Bureau',
    'nsa-surveillance': 'National Security Agency',
    'criminal-record': 'Court Records Office',
    'universal-credit': 'Department of Work and Pensions',
    'payslip': organizationName || 'Corporate Services Ltd',
    'credit-score': 'Credit Rating Services',
    'job-rejection': organizationName || 'Human Resources Ltd',
    'rent-reference': 'Property Management Services',
    'school-report': 'Department of Education',
    'college-degree': organizationName || 'City University'
  }
  
  const name = defaultNames[serviceSlug as keyof typeof defaultNames] || 'Official Services'
  const sanitized = !organizationName || 
                    ['fbi', 'cia', 'mi5', 'hmrc', 'internal revenue', 'federal bureau']
                      .some(val => organizationName.toLowerCase().includes(val))
  
  return generateBrandFromName(name, sanitized)
}
