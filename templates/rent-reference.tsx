import { createBaseHTML } from '../lib/render'

export default function RentReferenceTemplate(json: any): string {
  const content = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 24px; font-weight: bold; color: #333; margin-bottom: 10px;">
          TENANCY REFERENCE LETTER
        </h1>
        <div style="border-bottom: 2px solid #4caf50; width: 150px; margin: 0 auto;"></div>
      </div>

      <!-- Date -->
      <div style="text-align: right; margin-bottom: 20px;">
        <p style="font-size: 14px; color: #666;">${json.issued_at || new Date().toISOString().split('T')[0]}</p>
      </div>

      <!-- Tenant Information -->
      <div style="background: #e8f5e8; padding: 20px; margin-bottom: 25px; border-left: 4px solid #4caf50;">
        <h2 style="color: #2e7d32; font-size: 16px; margin-bottom: 15px;">TENANT DETAILS</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div><strong>Name:</strong> ${json.tenant?.name || 'N/A'}</div>
          <div><strong>Address:</strong> ${json.tenant?.address || 'N/A'}</div>
          <div><strong>Duration:</strong> ${json.tenancy?.duration || 'N/A'}</div>
          <div><strong>Monthly Rent:</strong> £${json.tenancy?.monthly_rent_gbp || '0.00'}</div>
        </div>
      </div>

      <!-- Rating -->
      <div style="text-align: center; margin-bottom: 25px;">
        <h3 style="font-size: 16px; color: #333; margin-bottom: 10px;">OVERALL RATING</h3>
        <span style="background: ${getRatingColor(json.rating)}; color: white; padding: 10px 20px; border-radius: 6px; font-weight: bold; font-size: 18px;">
          ${json.rating || 'N/A'}
        </span>
      </div>

      <!-- Letter Content -->
      <div style="line-height: 1.6; font-size: 14px; margin-bottom: 25px;">
        <p style="margin-bottom: 15px;">
          To Whom It May Concern,
        </p>
        
        <p style="margin-bottom: 15px;">
          I am writing to provide a reference for <strong>${json.tenant?.name || 'the tenant'}</strong> 
          who was a tenant at <strong>${json.tenant?.address || 'the property'}</strong> 
          from <strong>${json.tenancy?.duration || 'the tenancy period'}</strong>.
        </p>

        <p style="margin-bottom: 15px;">
          During their tenancy, they paid a monthly rent of <strong>£${json.tenancy?.monthly_rent_gbp || '0.00'}</strong> 
          and maintained the property to a satisfactory standard.
        </p>

        <p style="margin-bottom: 15px;">
          I have no hesitation in recommending ${json.tenant?.name || 'this tenant'} as a reliable tenant. 
          They were respectful, maintained the property well, and always paid rent on time.
        </p>

        <p style="margin-bottom: 15px;">
          Please feel free to contact me if you require any additional information.
        </p>

        <p style="margin-bottom: 30px;">Yours sincerely,</p>
      </div>

      <!-- Remarks -->
      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 16px; color: #333; margin-bottom: 10px;">SPECIFIC REMARKS</h3>
        <div style="background: #fff; padding: 15px; border: 1px solid #ddd;">
          ${(json.remarks || []).length > 0 ? 
            `<ul style="padding-left: 20px;">${(json.remarks || []).map((remark: string) => `<li style="margin-bottom: 5px;">${remark}</li>`).join('')}</ul>` :
            '<p style="color: #666; font-style: italic;">No specific remarks</p>'
          }
        </div>
      </div>

      <!-- Landlord Contact -->
      <div style="background: #f8f9fa; padding: 15px; margin-bottom: 25px; border: 1px solid #ddd;">
        <h3 style="font-size: 14px; color: #333; margin-bottom: 10px;">LANDLORD CONTACT</h3>
        <p style="font-size: 12px; color: #666;">${json.landlord_contact || 'Contact information available upon request'}</p>
      </div>

      <!-- Signature -->
      <div style="margin-top: 40px;">
        <div style="border-bottom: 1px solid #333; width: 200px; margin-bottom: 10px;"></div>
        <p style="font-weight: bold; font-size: 14px;">Landlord Signature</p>
        <p style="font-size: 12px; color: #666;">Property Owner</p>
      </div>
    </div>
  `

  return createBaseHTML(content, 'Tenancy Reference Letter')
}

function getRatingColor(rating: string): string {
  switch (rating?.toUpperCase()) {
    case 'EXCELLENT': return '#4caf50'
    case 'GOOD': return '#8bc34a'
    case 'FAIR': return '#ffc107'
    default: return '#666'
  }
}
