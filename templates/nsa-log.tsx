import { createBaseHTML } from '../lib/render'

export default function NSALogTemplate(json: any): string {
  const content = `
    <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #d32f2f; padding-bottom: 15px;">
        <h1 style="color: #d32f2f; font-size: 24px; font-weight: bold; margin-bottom: 5px;">
          NSA SURVEILLANCE LOG
        </h1>
        <p style="font-size: 12px; color: #666;">CLASSIFIED DOCUMENT</p>
      </div>

      <!-- Subject Information -->
      <div style="background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-left: 4px solid #d32f2f;">
        <h2 style="color: #d32f2f; font-size: 16px; margin-bottom: 10px;">TARGET INFORMATION</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div><strong>Name:</strong> ${json.subject?.name || 'N/A'}</div>
          <div><strong>Location:</strong> ${json.subject?.city || 'N/A'}</div>
          <div><strong>Log Date:</strong> ${json.log_date || 'N/A'}</div>
          <div><strong>Overall Concern:</strong> 
            <span style="background: ${getConcernColor(json.overall_concern)}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">
              ${json.overall_concern || 'UNKNOWN'}
            </span>
          </div>
        </div>
      </div>

      <!-- Activity Log -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #333; font-size: 16px; margin-bottom: 15px;">SURVEILLANCE ACTIVITY</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Time</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Channel</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Activity</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Severity</th>
            </tr>
          </thead>
          <tbody>
            ${(json.entries || []).map((entry: any) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 10px; font-family: monospace;">${entry.time || 'N/A'}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">
                  <span style="background: ${getChannelColor(entry.channel)}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">
                    ${entry.channel || 'N/A'}
                  </span>
                </td>
                <td style="border: 1px solid #ddd; padding: 10px;">${entry.detail || 'N/A'}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">
                  <span style="background: ${getSeverityColor(entry.severity)}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">
                    ${entry.severity || 'N/A'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Flags -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #333; font-size: 16px; margin-bottom: 15px;">SECURITY FLAGS</h3>
        <div style="background: #fff; padding: 15px; border: 1px solid #ddd;">
          ${(json.flags || []).length > 0 ? 
            `<ul style="padding-left: 20px;">${(json.flags || []).map((flag: string) => `<li style="margin-bottom: 8px; color: #d32f2f;">🚨 ${flag}</li>`).join('')}</ul>` :
            '<p style="color: #4caf50; font-style: italic;">✅ No security flags detected</p>'
          }
        </div>
      </div>

      <!-- Analysis Summary -->
      <div style="background: #e8f5e8; padding: 20px; margin-bottom: 25px; border-left: 4px solid #4caf50;">
        <h3 style="color: #2e7d32; font-size: 16px; margin-bottom: 10px;">SURVEILLANCE ANALYSIS</h3>
        <p style="font-size: 14px; color: #333; line-height: 1.5;">
          Based on the surveillance data collected, the target's digital footprint shows 
          ${json.overall_concern?.toLowerCase() || 'standard'} levels of activity. 
          ${(json.flags || []).length > 0 ? 'Multiple security flags have been raised requiring further investigation.' : 'No immediate security concerns have been identified.'}
        </p>
      </div>

      <!-- Technical Details -->
      <div style="background: #f8f9fa; padding: 15px; margin-bottom: 25px; border: 1px solid #ddd;">
        <h3 style="color: #333; font-size: 14px; margin-bottom: 10px;">TECHNICAL PARAMETERS</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px;">
          <div><strong>Collection Method:</strong> Automated Surveillance</div>
          <div><strong>Data Retention:</strong> 7 Years</div>
          <div><strong>Access Level:</strong> Classified</div>
          <div><strong>Review Status:</strong> Active</div>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #666;">
          Log Generated: ${json.log_date || new Date().toISOString().split('T')[0]}
        </p>
        <div style="margin-top: 20px;">
          <div style="border-bottom: 1px solid #000; width: 200px; margin: 0 auto;"></div>
          <p style="font-size: 12px; margin-top: 5px;">NSA Agent Signature</p>
        </div>
        <p style="font-size: 10px; color: #999; margin-top: 15px;">
          National Security Agency - Surveillance Division
        </p>
      </div>
    </div>
  `

  return createBaseHTML(content, 'NSA Surveillance Log')
}

function getConcernColor(concern: string): string {
  switch (concern?.toLowerCase()) {
    case 'low': return '#4caf50'
    case 'moderate': return '#ff9800'
    case 'high': return '#f44336'
    default: return '#666'
  }
}

function getChannelColor(channel: string): string {
  switch (channel?.toLowerCase()) {
    case 'search': return '#2196f3'
    case 'call': return '#4caf50'
    case 'app': return '#ff9800'
    case 'sms': return '#9c27b0'
    case 'social': return '#e91e63'
    default: return '#666'
  }
}

function getSeverityColor(severity: string): string {
  switch (severity?.toLowerCase()) {
    case 'low': return '#4caf50'
    case 'moderate': return '#ff9800'
    case 'high': return '#f44336'
    default: return '#666'
  }
}
