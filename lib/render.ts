import { generatePDFfromJSON } from './pdfGenerator'
import { getService } from './services'

// Using jsPDF now instead of HTML templates

export async function renderServiceToPdf(slug: string, json: any): Promise<Buffer> {
  const service = getService(slug)
  if (!service) {
    throw new Error(`Service not found: ${slug}`)
  }

  // Generate PDF using jsPDF (no Chrome/Puppeteer required!)
  console.log(`Generating PDF for ${slug} with jsPDF...`)
  const pdfBuffer = generatePDFfromJSON(slug, json)
  console.log(`PDF generated successfully! Size: ${pdfBuffer.length} bytes`)
  
  return pdfBuffer
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
