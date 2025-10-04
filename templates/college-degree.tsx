import { createBaseHTML } from '../lib/render'

export default function CollegeDegreeTemplate(json: any): string {
  const content = `
    <div style="max-width: 800px; margin: 0 auto; padding: 40px; position: relative;">
      <!-- Decorative Border -->
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; border: 8px solid #2c3e50; border-radius: 10px;"></div>
      <div style="position: absolute; top: 8px; left: 8px; right: 8px; bottom: 8px; border: 2px solid #34495e; border-radius: 5px;"></div>
      
      <!-- Content -->
      <div style="position: relative; z-index: 1;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-size: 36px; font-weight: bold; color: #2c3e50; margin-bottom: 10px; font-family: 'Times New Roman', serif;">
            DEGREE CERTIFICATE
          </h1>
          <div style="border-bottom: 3px solid #e74c3c; width: 200px; margin: 0 auto;"></div>
        </div>

        <!-- University Name -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="font-size: 24px; color: #34495e; font-weight: 500; font-family: 'Times New Roman', serif;">
            ${json.awarding_body || 'University'}
          </h2>
        </div>

        <!-- Certificate Text -->
        <div style="text-align: center; margin-bottom: 40px; font-size: 18px; line-height: 1.6;">
          <p style="margin-bottom: 20px;">This is to certify that</p>
          <h3 style="font-size: 28px; font-weight: bold; color: #2c3e50; margin-bottom: 30px; text-decoration: underline;">
            ${json.recipient?.name || 'Student Name'}
          </h3>
          <p style="margin-bottom: 20px;">has successfully completed the requirements for the degree of</p>
          <h4 style="font-size: 22px; font-weight: bold; color: #34495e; margin-bottom: 10px;">
            ${json.degree?.title || 'Degree Title'}
          </h4>
          <p style="font-size: 20px; color: #e74c3c; font-weight: bold;">
            ${json.degree?.classification || 'Classification'}
          </p>
        </div>

        <!-- Graduation Date -->
        <div style="text-align: center; margin-bottom: 40px;">
          <p style="font-size: 16px; color: #666;">
            Graduated on: <strong>${json.graduation_date || 'Date'}</strong>
          </p>
          <p style="font-size: 14px; color: #666;">
            Certificate No: ${json.certificate_no || 'N/A'}
          </p>
        </div>

        <!-- Signatures -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 60px;">
          <div style="text-align: center;">
            <div style="border-bottom: 1px solid #333; width: 200px; margin: 0 auto 10px;"></div>
            <p style="font-size: 14px; font-weight: bold;">${json.signatories?.[0]?.name || 'Registrar Name'}</p>
            <p style="font-size: 12px; color: #666;">${json.signatories?.[0]?.title || 'Registrar'}</p>
          </div>
          <div style="text-align: center;">
            <div style="border-bottom: 1px solid #333; width: 200px; margin: 0 auto 10px;"></div>
            <p style="font-size: 14px; font-weight: bold;">${json.signatories?.[1]?.name || 'Dean Name'}</p>
            <p style="font-size: 12px; color: #666;">${json.signatories?.[1]?.title || 'Dean'}</p>
          </div>
        </div>

        <!-- Official Seal Area -->
        <div style="text-align: center; margin-top: 40px;">
          <div style="width: 100px; height: 100px; border: 3px solid #e74c3c; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center; background: #f8f9fa;">
            <span style="font-size: 12px; font-weight: bold; color: #e74c3c;">OFFICIAL SEAL</span>
          </div>
        </div>
      </div>
    </div>
  `

  return createBaseHTML(content, 'Degree Certificate')
}
