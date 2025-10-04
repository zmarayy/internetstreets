import { createBaseHTML } from '../lib/render'

export default function GovCriminalTemplate(json: any): string {
  const content = `
    <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #d32f2f; padding-bottom: 15px;">
        <h1 style="color: #d32f2f; font-size: 24px; font-weight: bold; margin-bottom: 5px;">
          CRIMINAL RECORD EXTRACT
        </h1>
        <p style="font-size: 12px; color: #666;">CLASSIFIED GOVERNMENT DOCUMENT</p>
      </div>

      <!-- Subject Information -->
      <div style="background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-left: 4px solid #d32f2f;">
        <h2 style="color: #d32f2f; font-size: 16px; margin-bottom: 10px;">SUBJECT DETAILS</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div><strong>Name:</strong> ${json.subject?.name || 'N/A'}</div>
          <div><strong>Date of Birth:</strong> ${json.subject?.dob || 'N/A'}</div>
          <div><strong>Record ID:</strong> ${json.record_id || 'N/A'}</div>
          <div><strong>Status:</strong> 
            <span style="background: #f44336; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">
              ACTIVE RECORD
            </span>
          </div>
        </div>
      </div>

      <!-- Offences Table -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #333; font-size: 16px; margin-bottom: 15px;">CRIMINAL OFFENCES</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Category</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Date</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Status</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Notes</th>
            </tr>
          </thead>
          <tbody>
            ${(json.offences || []).map((offence: any) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 10px;">${offence.category || 'N/A'}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">${offence.date || 'N/A'}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">
                  <span style="background: ${getStatusColor(offence.status)}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">
                    ${offence.status || 'N/A'}
                  </span>
                </td>
                <td style="border: 1px solid #ddd; padding: 10px;">${offence.notes || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Warnings -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #333; font-size: 16px; margin-bottom: 15px;">SECURITY WARNINGS</h3>
        <div style="background: #fff; padding: 15px; border: 1px solid #ddd;">
          ${(json.warnings || []).length > 0 ? 
            `<ul style="padding-left: 20px;">${(json.warnings || []).map((warning: string) => `<li style="margin-bottom: 8px; color: #d32f2f;">⚠️ ${warning}</li>`).join('')}</ul>` :
            '<p style="color: #4caf50; font-style: italic;">✅ No active warnings</p>'
          }
        </div>
      </div>

      <!-- Summary -->
      <div style="background: #e8f5e8; padding: 20px; margin-bottom: 25px; border-left: 4px solid #4caf50;">
        <h3 style="color: #2e7d32; font-size: 16px; margin-bottom: 10px;">RECORD SUMMARY</h3>
        <p style="font-size: 14px; color: #333; line-height: 1.5;">
          ${json.summary || 'No summary available for this record.'}
        </p>
      </div>

      <!-- Legal Information -->
      <div style="background: #f8f9fa; padding: 15px; margin-bottom: 25px; border: 1px solid #ddd;">
        <h3 style="color: #333; font-size: 14px; margin-bottom: 10px;">LEGAL INFORMATION</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px;">
          <div><strong>Data Protection:</strong> Subject to GDPR</div>
          <div><strong>Retention Period:</strong> 7 Years</div>
          <div><strong>Access Level:</strong> Authorized Personnel Only</div>
          <div><strong>Last Updated:</strong> ${json.issued_at || 'N/A'}</div>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #666;">
          Record Issued: ${json.issued_at || new Date().toISOString().split('T')[0]}
        </p>
        <div style="margin-top: 20px;">
          <div style="border-bottom: 1px solid #000; width: 200px; margin: 0 auto;"></div>
          <p style="font-size: 12px; margin-top: 5px;">Government Official Signature</p>
        </div>
        <p style="font-size: 10px; color: #999; margin-top: 15px;">
          Government Criminal Records Office
        </p>
      </div>
    </div>
  `

  return createBaseHTML(content, 'Criminal Record Extract')
}

function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'open': return '#f44336'
    case 'closed': return '#4caf50'
    case 'dismissed': return '#ff9800'
    default: return '#666'
  }
}
