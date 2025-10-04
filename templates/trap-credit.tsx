import { createBaseHTML } from '../lib/render'

export default function TrapCreditTemplate(json: any): string {
  const content = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ff5722; padding-bottom: 15px;">
        <h1 style="color: #d32f2f; font-size: 24px; font-weight: bold; margin-bottom: 5px;">
          CREDIT SCORE REPORT
        </h1>
        <p style="font-size: 12px; color: #666;">Financial Assessment Report</p>
      </div>

      <!-- Subject Information -->
      <div style="background: #fff3e0; padding: 20px; margin-bottom: 25px; border-left: 4px solid #ff5722;">
        <h2 style="color: #d32f2f; font-size: 16px; margin-bottom: 15px;">SUBJECT INFORMATION</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div><strong>Name:</strong> ${json.subject?.name || 'N/A'}</div>
          <div><strong>Income Note:</strong> ${json.income_note || 'N/A'}</div>
        </div>
      </div>

      <!-- Credit Score Display -->
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background: ${getScoreColor(json.score)}; color: white; padding: 30px; border-radius: 10px; margin-bottom: 15px;">
          <div style="font-size: 48px; font-weight: bold; margin-bottom: 10px;">
            ${json.score || 0}
          </div>
          <div style="font-size: 18px; font-weight: bold;">
            ${json.rating || 'UNKNOWN'}
          </div>
        </div>
        <p style="font-size: 14px; color: #666;">Out of 850</p>
      </div>

      <!-- Credit Utilization -->
      <div style="background: #f8f9fa; padding: 20px; margin-bottom: 25px; border: 1px solid #ddd;">
        <h3 style="color: #333; font-size: 16px; margin-bottom: 15px;">CREDIT UTILIZATION</h3>
        <div style="text-align: center;">
          <div style="font-size: 36px; font-weight: bold; color: ${getUtilizationColor(json.utilisation_percent)};">
            ${json.utilisation_percent || 0}%
          </div>
          <p style="font-size: 14px; color: #666;">Credit Utilization Rate</p>
        </div>
      </div>

      <!-- Recent Flags -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #333; font-size: 16px; margin-bottom: 15px;">RECENT FLAGS</h3>
        <div style="background: #fff; padding: 15px; border: 1px solid #ddd;">
          ${(json.recent_flags || []).length > 0 ? 
            `<ul style="padding-left: 20px;">${(json.recent_flags || []).map((flag: string) => `<li style="margin-bottom: 8px; color: #d32f2f;">⚠️ ${flag}</li>`).join('')}</ul>` :
            '<p style="color: #4caf50; font-style: italic;">✅ No recent flags</p>'
          }
        </div>
      </div>

      <!-- Advice Section -->
      <div style="background: #e8f5e8; padding: 20px; margin-bottom: 25px; border-left: 4px solid #4caf50;">
        <h3 style="color: #2e7d32; font-size: 16px; margin-bottom: 15px;">FINANCIAL ADVICE</h3>
        <ul style="padding-left: 20px;">
          ${(json.advice || []).map((advice: string) => `<li style="margin-bottom: 8px; color: #333;">💡 ${advice}</li>`).join('')}
        </ul>
      </div>

      <!-- Summary -->
      <div style="background: #f8f9fa; padding: 20px; margin-bottom: 25px; border: 1px solid #ddd;">
        <h3 style="color: #333; font-size: 16px; margin-bottom: 10px;">SUMMARY</h3>
        <p style="font-size: 14px; color: #666; line-height: 1.5;">
          Based on the available information, this credit report provides an assessment of creditworthiness. 
          The score reflects various factors including payment history, credit utilization, and recent activity.
        </p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #666;">
          Issued: ${json.issued_at || new Date().toISOString().split('T')[0]}
        </p>
        <div style="margin-top: 20px;">
          <div style="border-bottom: 1px solid #000; width: 200px; margin: 0 auto;"></div>
          <p style="font-size: 12px; margin-top: 5px;">Credit Analyst Signature</p>
        </div>
      </div>
    </div>
  `

  return createBaseHTML(content, 'Credit Score Report')
}

function getScoreColor(score: number): string {
  if (score >= 750) return '#4caf50'
  if (score >= 700) return '#8bc34a'
  if (score >= 650) return '#ffc107'
  if (score >= 600) return '#ff9800'
  return '#f44336'
}

function getUtilizationColor(percent: number): string {
  if (percent <= 30) return '#4caf50'
  if (percent <= 50) return '#ffc107'
  return '#f44336'
}
