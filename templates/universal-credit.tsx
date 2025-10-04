import { createBaseHTML } from '../lib/render'

export default function UniversalCreditTemplate(json: any): string {
  const content = `
    <div style="max-width: 700px; margin: 0 auto; padding: 20px;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1976d2; padding-bottom: 15px;">
        <h1 style="color: #1565c0; font-size: 24px; font-weight: bold; margin-bottom: 5px;">
          UNIVERSAL CREDIT ASSESSMENT
        </h1>
        <p style="font-size: 12px; color: #666;">Department for Work and Pensions</p>
      </div>

      <!-- Applicant Information -->
      <div style="background: #e3f2fd; padding: 20px; margin-bottom: 25px; border-left: 4px solid #1976d2;">
        <h2 style="color: #1565c0; font-size: 16px; margin-bottom: 15px;">APPLICANT DETAILS</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div><strong>Name:</strong> ${json.applicant?.name || 'N/A'}</div>
          <div><strong>Date of Birth:</strong> ${json.applicant?.dob || 'N/A'}</div>
          <div><strong>Status:</strong> ${json.applicant?.status || 'N/A'}</div>
          <div><strong>City:</strong> ${json.applicant?.city || 'N/A'}</div>
        </div>
        <div style="margin-top: 10px;">
          <strong>Case Reference:</strong> ${json.case_ref || 'N/A'}
        </div>
      </div>

      <!-- Financial Overview -->
      <div style="background: #f8f9fa; padding: 20px; margin-bottom: 25px; border: 1px solid #ddd;">
        <h3 style="color: #333; font-size: 16px; margin-bottom: 15px;">FINANCIAL OVERVIEW</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <p style="font-size: 14px; color: #666; margin-bottom: 5px;">Assessed Income</p>
            <p style="font-size: 20px; font-weight: bold; color: #333;">£${json.financial_overview?.assessed_income_gbp || '0.00'}</p>
          </div>
          <div>
            <p style="font-size: 14px; color: #666; margin-bottom: 5px;">Spending Commentary</p>
            <p style="font-size: 14px; color: #333; font-style: italic;">${json.financial_overview?.spending_commentary || 'N/A'}</p>
          </div>
        </div>
      </div>

      <!-- Eligibility Result -->
      <div style="text-align: center; margin-bottom: 25px;">
        <h3 style="font-size: 16px; color: #333; margin-bottom: 10px;">ELIGIBILITY RESULT</h3>
        <span style="background: ${getEligibilityColor(json.eligibility_result)}; color: white; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 18px;">
          ${json.eligibility_result || 'UNDECIDED'}
        </span>
      </div>

      <!-- Recommended Allowance -->
      <div style="background: #e8f5e8; padding: 20px; margin-bottom: 25px; border-left: 4px solid #4caf50;">
        <h3 style="color: #2e7d32; font-size: 16px; margin-bottom: 15px;">RECOMMENDED ALLOWANCE</h3>
        <div style="text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #2e7d32;">
            £${json.recommended_allowance_gbp || '0.00'}
          </div>
          <p style="font-size: 14px; color: #666;">Monthly Payment</p>
        </div>
      </div>

      <!-- Notes -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #333; font-size: 16px; margin-bottom: 15px;">ASSESSMENT NOTES</h3>
        <div style="background: #fff; padding: 15px; border: 1px solid #ddd;">
          ${(json.notes || []).length > 0 ? 
            `<ul style="padding-left: 20px;">${(json.notes || []).map((note: string) => `<li style="margin-bottom: 8px;">${note}</li>`).join('')}</ul>` :
            '<p style="color: #666; font-style: italic;">No additional notes</p>'
          }
        </div>
      </div>

      <!-- Important Information -->
      <div style="background: #fff3e0; padding: 20px; margin-bottom: 25px; border: 1px solid #ff9800;">
        <h3 style="color: #f57c00; font-size: 16px; margin-bottom: 10px;">IMPORTANT INFORMATION</h3>
        <p style="font-size: 14px; color: #333; line-height: 1.5;">
          This assessment is based on the information provided and current Universal Credit regulations. 
          Payments may be subject to change based on changes in circumstances or income.
        </p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #666;">
          Assessment Date: ${json.issued_at || new Date().toISOString().split('T')[0]}
        </p>
        <div style="margin-top: 20px;">
          <div style="border-bottom: 1px solid #000; width: 200px; margin: 0 auto;"></div>
          <p style="font-size: 12px; margin-top: 5px;">Case Worker Signature</p>
        </div>
        <p style="font-size: 10px; color: #999; margin-top: 15px;">
          Department for Work and Pensions
        </p>
      </div>
    </div>
  `

  return createBaseHTML(content, 'Universal Credit Assessment')
}

function getEligibilityColor(result: string): string {
  switch (result?.toUpperCase()) {
    case 'APPROVED': return '#4caf50'
    case 'DECLINED': return '#f44336'
    case 'NEEDS REVIEW': return '#ff9800'
    default: return '#666'
  }
}
