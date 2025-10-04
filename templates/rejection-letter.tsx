import { createBaseHTML } from '../lib/render'

export default function RejectionLetterTemplate(json: any): string {
  const content = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 24px; font-weight: bold; color: #333; margin-bottom: 10px;">
          APPLICATION OUTCOME
        </h1>
        <div style="border-bottom: 2px solid #666; width: 100px; margin: 0 auto;"></div>
      </div>

      <!-- Date -->
      <div style="text-align: right; margin-bottom: 20px;">
        <p style="font-size: 14px; color: #666;">${json.date || new Date().toISOString().split('T')[0]}</p>
      </div>

      <!-- Letter Content -->
      <div style="line-height: 1.6; font-size: 14px;">
        <p style="margin-bottom: 15px;">${json.salutation || 'Dear Candidate,'}</p>
        
        <p style="margin-bottom: 15px;">${json.opening || 'Thank you for your interest in our company.'}</p>
        
        <p style="margin-bottom: 15px;">
          After careful consideration of all applications received for the position of 
          <strong>${json.role_applied || 'the advertised role'}</strong>, 
          we have decided to move forward with other candidates whose qualifications more closely match our current needs.
        </p>

        <!-- Reasoning -->
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; color: #333; margin-bottom: 10px;">Feedback</h3>
          <ul style="padding-left: 20px;">
            ${(json.reasoning || []).map((reason: string) => `<li style="margin-bottom: 5px;">${reason}</li>`).join('')}
          </ul>
        </div>

        <p style="margin-bottom: 15px;">${json.closing || 'We encourage you to apply for future positions that may be a better fit for your skills and experience.'}</p>

        <p style="margin-bottom: 30px;">Thank you again for your interest in our company.</p>

        <p style="margin-bottom: 5px;">Sincerely,</p>
      </div>

      <!-- Signature Block -->
      <div style="margin-top: 40px;">
        <div style="border-bottom: 1px solid #333; width: 200px; margin-bottom: 10px;"></div>
        <p style="font-weight: bold; font-size: 14px;">${json.signature_block?.name || 'HR Representative'}</p>
        <p style="font-size: 12px; color: #666;">${json.signature_block?.title || 'Hiring Manager'}</p>
        <p style="font-size: 12px; color: #666;">${json.signature_block?.company || 'Company Name'}</p>
      </div>

      <!-- Contact Information -->
      <div style="background: #f8f9fa; padding: 15px; margin-top: 30px; border: 1px solid #ddd;">
        <h3 style="font-size: 14px; color: #333; margin-bottom: 10px;">Contact Information</h3>
        <p style="font-size: 12px; color: #666;">
          For any questions regarding this application, please contact our HR department.
        </p>
      </div>
    </div>
  `

  return createBaseHTML(content, 'Application Outcome')
}
