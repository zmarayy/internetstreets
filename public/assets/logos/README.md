# Internet Streets Service Logos

This directory contains the static logos for all 10 Internet Streets services.

## Required Logo Files:

1. **fbi-file** - FBI Intelligence Dossier logo
2. **nsa-surveillance** - NSA Surveillance Log logo  
3. **criminal-record** - Government Criminal Record logo
4. **universal-credit** - Universal Credit Assessment logo
5. **payslip** - Payslip Generator logo
6. **credit-score** - Credit Score Report logo
7. **job-rejection** - Job Rejection Letter logo
8. **rent-reference** - Rent Reference Letter logo
9. **school-behaviour** - School Behaviour Report logo
10. **college-degree** - College Degree Certificate logo

## Logo Specifications:
- **Formats**: PNG, JPG, WEBP, or SVG (any format supported)
- **Size**: Recommended 200x200px minimum
- **Background**: Transparent or white
- **Style**: Professional, clean, appropriate for document headers
- **Position**: Top-right corner of PDF documents

## File Naming:
Use the service slug as the filename with any supported extension:
- `fbi-file.png` or `fbi-file.jpg` or `fbi-file.webp` or `fbi-file.svg`
- `nsa-surveillance.png` or `nsa-surveillance.jpg` etc.
- And so on for all 10 services...

## Usage:
Logos are automatically loaded by the PDF generator based on service slug.
The system tries multiple formats (PNG → JPG → WEBP → SVG) until one works.
If no logo file is found, the PDF will render without it (graceful fallback).

## File Paths:
All logos are served from: `https://internetstreets.uk/assets/logos/[filename]`
