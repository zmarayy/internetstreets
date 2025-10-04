import puppeteer from 'puppeteer'
import { getService } from './services'

// Import all templates
import FBIFileTemplate from '../templates/fbi-file'
import NSALogTemplate from '../templates/nsa-log'
import GovCriminalTemplate from '../templates/gov-criminal'
import UniversalCreditTemplate from '../templates/universal-credit'
import TrapCreditTemplate from '../templates/trap-credit'
import PayslipTemplate from '../templates/payslip'
import RejectionLetterTemplate from '../templates/rejection-letter'
import RentReferenceTemplate from '../templates/rent-reference'
import SchoolReportTemplate from '../templates/school-report'
import CollegeDegreeTemplate from '../templates/college-degree'

export async function renderServiceToPdf(slug: string, json: any): Promise<Buffer> {
  const service = getService(slug)
  if (!service) {
    throw new Error(`Service not found: ${slug}`)
  }

  // Get the appropriate template based on slug
  let htmlContent: string
  
  switch (slug) {
    case 'fbi-file':
      htmlContent = FBIFileTemplate(json)
      break
    case 'nsa-surveillance':
      htmlContent = NSALogTemplate(json)
      break
    case 'criminal-record':
      htmlContent = GovCriminalTemplate(json)
      break
    case 'universal-credit':
      htmlContent = UniversalCreditTemplate(json)
      break
    case 'credit-score':
      htmlContent = TrapCreditTemplate(json)
      break
    case 'payslip':
      htmlContent = PayslipTemplate(json)
      break
    case 'job-rejection':
      htmlContent = RejectionLetterTemplate(json)
      break
    case 'rent-reference':
      htmlContent = RentReferenceTemplate(json)
      break
    case 'school-behaviour':
      htmlContent = SchoolReportTemplate(json)
      break
    case 'college-degree':
      htmlContent = CollegeDegreeTemplate(json)
      break
    default:
      throw new Error(`No template found for service: ${slug}`)
  }

  // Generate PDF using Puppeteer with Netlify-specific configuration
  const browser = await puppeteer.launch({
    headless: "new", // Use new headless mode
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--remote-debugging-port=9222'
    ]
  })

  try {
    const page = await browser.newPage()
    
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true
    })

    return pdfBuffer
  } finally {
    await browser.close()
  }
}

// Helper function to create base HTML structure
export function createBaseHTML(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Roboto', Arial, sans-serif;
            line-height: 1.4;
            color: #000;
            background: #fff;
            position: relative;
        }
        
        .watermark {
            position: absolute;
            top: 40%;
            left: -10%;
            transform: rotate(-30deg);
            font-size: 48px;
            color: rgba(0,0,0,0.06);
            font-weight: 700;
            pointer-events: none;
            user-select: none;
            z-index: 0;
        }
        
        .pdf-disclaimer {
            font-family: Arial, sans-serif;
            font-size: 9px;
            text-align: center;
            color: #444;
            margin-top: 24px;
            letter-spacing: 0.5px;
        }
        
        .content {
            padding-bottom: 60px;
        }
        
        @media print {
            .watermark {
                display: block;
            }
            .disclaimer {
                position: fixed;
                bottom: 0;
            }
        }
    </style>
</head>
<body>
    <div class="watermark">INTERNET STREETS — ENTERTAINMENT</div>
    <div class="content">
        ${content}
        <div class="pdf-disclaimer">
            FOR ENTERTAINMENT ONLY. NOT A REAL DOCUMENT.
        </div>
    </div>
</body>
</html>
  `
}
