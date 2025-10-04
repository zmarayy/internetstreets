import { createBaseHTML } from '../lib/render'

export default function FBIFileTemplate(json: any): string {
  const content = `
    <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #d32f2f; padding-bottom: 15px;">
        <h1 style="color: #d32f2f; font-size: 24px; font-weight: bold; margin-bottom: 5px;">
          FBI INTELLIGENCE DOSSIER
        </h1>
        <p style="font-size: 12px; color: #666;">CLASSIFIED DOCUMENT</p>
      </div>

      <!-- Subject Information -->
      <div style="background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-left: 4px solid #d32f2f;">
        <h2 style="color: #d32f2f; font-size: 16px; margin-bottom: 10px;">SUBJECT INFORMATION</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div><strong>Name:</strong> ${json.subject?.name || 'N/A'}</div>
          <div><strong>Date of Birth:</strong> ${json.subject?.dob || 'N/A'}</div>
          <div><strong>Location:</strong> ${json.subject?.city || 'N/A'}</div>
          <div><strong>Case Number:</strong> ${json.case_number || 'N/A'}</div>
        </div>
      </div>

      <!-- Threat Level Badge -->
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="background: ${getThreatLevelColor(json.threat_level)}; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold;">
          THREAT LEVEL: ${json.threat_level || 'UNKNOWN'}
        </span>
      </div>

      <!-- Summary -->
      <div style="margin-bottom: 20px;">
        <h3 style="color: #333; font-size: 14px; margin-bottom: 8px;">SUMMARY</h3>
        <p style="background: #fff; padding: 10px; border: 1px solid #ddd; font-style: italic;">
          ${json.summary || 'No summary available.'}
        </p>
      </div>

      <!-- Allegations -->
      <div style="margin-bottom: 20px;">
        <h3 style="color: #333; font-size: 14px; margin-bottom: 8px;">ALLEGATIONS</h3>
        <ul style="padding-left: 20px;">
          ${(json.allegations || []).map((allegation: string) => `<li style="margin-bottom: 4px;">${allegation}</li>`).join('')}
        </ul>
      </div>

      <!-- Surveillance Notes -->
      <div style="margin-bottom: 20px;">
        <h3 style="color: #333; font-size: 14px; margin-bottom: 8px;">SURVEILLANCE NOTES</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Timestamp</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Note</th>
            </tr>
          </thead>
          <tbody>
            ${(json.surveillance_notes || []).map((note: any) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${note.timestamp || 'N/A'}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${note.note || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Risk Factors -->
      <div style="margin-bottom: 20px;">
        <h3 style="color: #333; font-size: 14px; margin-bottom: 8px;">RISK FACTORS</h3>
        <ul style="padding-left: 20px;">
          ${(json.risk_factors || []).map((factor: string) => `<li style="margin-bottom: 4px;">${factor}</li>`).join('')}
        </ul>
      </div>

      <!-- Recommendation -->
      <div style="background: #e8f5e8; padding: 15px; margin-bottom: 20px; border-left: 4px solid #4caf50;">
        <h3 style="color: #2e7d32; font-size: 14px; margin-bottom: 8px;">RECOMMENDATION</h3>
        <p style="font-weight: 500;">${json.recommendation || 'No recommendation available.'}</p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #666;">
          Issued: ${json.issued_at || new Date().toISOString().split('T')[0]}
        </p>
        <div style="margin-top: 15px;">
          <div style="border-bottom: 1px solid #000; width: 200px; margin: 0 auto;"></div>
          <p style="font-size: 12px; margin-top: 5px;">Agent Signature</p>
        </div>
      </div>
    </div>
  `

  return createBaseHTML(content, 'FBI Intelligence Dossier')
}

function getThreatLevelColor(level: string): string {
  switch (level?.toUpperCase()) {
    case 'LOW': return '#4caf50'
    case 'MEDIUM': return '#ff9800'
    case 'HIGH': return '#f44336'
    case 'CRITICAL': return '#d32f2f'
    default: return '#666'
  }
}
