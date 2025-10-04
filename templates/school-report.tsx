import { createBaseHTML } from '../lib/render'

export default function SchoolReportTemplate(json: any): string {
  const content = `
    <div style="max-width: 700px; margin: 0 auto; padding: 20px;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2196f3; padding-bottom: 15px;">
        <h1 style="color: #1976d2; font-size: 24px; font-weight: bold; margin-bottom: 5px;">
          BEHAVIOUR REPORT
        </h1>
        <p style="font-size: 12px; color: #666;">School Behaviour Record</p>
      </div>

      <!-- Student Information -->
      <div style="background: #e3f2fd; padding: 20px; margin-bottom: 25px; border-left: 4px solid #2196f3;">
        <h2 style="color: #1976d2; font-size: 16px; margin-bottom: 15px;">STUDENT INFORMATION</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div><strong>Name:</strong> ${json.student?.name || 'N/A'}</div>
          <div><strong>Year Group:</strong> ${json.student?.year || 'N/A'}</div>
          <div><strong>Favourite Subject:</strong> ${json.student?.favourite_subject || 'N/A'}</div>
          <div><strong>Behaviour Grade:</strong> 
            <span style="background: ${getGradeColor(json.behaviour_grade)}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 16px;">
              ${json.behaviour_grade || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <!-- Attendance -->
      <div style="background: #f8f9fa; padding: 15px; margin-bottom: 25px; border: 1px solid #ddd;">
        <h3 style="color: #333; font-size: 14px; margin-bottom: 10px;">ATTENDANCE</h3>
        <div style="text-align: center;">
          <div style="font-size: 36px; font-weight: bold; color: #4caf50;">
            ${json.attendance_percent || 0}%
          </div>
          <p style="font-size: 14px; color: #666;">Overall Attendance Rate</p>
        </div>
      </div>

      <!-- Incidents -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #333; font-size: 14px; margin-bottom: 10px;">INCIDENTS</h3>
        <div style="background: #fff; padding: 15px; border: 1px solid #ddd; min-height: 100px;">
          ${(json.incidents || []).length > 0 ? 
            `<ul style="padding-left: 20px;">${(json.incidents || []).map((incident: string) => `<li style="margin-bottom: 5px;">${incident}</li>`).join('')}</ul>` :
            '<p style="color: #666; font-style: italic;">No incidents recorded</p>'
          }
        </div>
      </div>

      <!-- Teacher Comments -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #333; font-size: 14px; margin-bottom: 10px;">TEACHER COMMENTS</h3>
        <div style="background: #fff; padding: 15px; border: 1px solid #ddd; min-height: 80px;">
          <p style="font-style: italic; color: #333;">${json.teacher_comments || 'No comments available.'}</p>
        </div>
      </div>

      <!-- Awards -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #333; font-size: 14px; margin-bottom: 10px;">AWARDS & ACHIEVEMENTS</h3>
        <div style="background: #fff; padding: 15px; border: 1px solid #ddd;">
          ${(json.awards || []).length > 0 ? 
            `<ul style="padding-left: 20px;">${(json.awards || []).map((award: string) => `<li style="margin-bottom: 5px; color: #4caf50;">🏆 ${award}</li>`).join('')}</ul>` :
            '<p style="color: #666; font-style: italic;">No awards recorded</p>'
          }
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #666;">
          Issued: ${json.issued_at || new Date().toISOString().split('T')[0]}
        </p>
        <div style="margin-top: 20px;">
          <div style="border-bottom: 1px solid #000; width: 200px; margin: 0 auto;"></div>
          <p style="font-size: 12px; margin-top: 5px;">Head Teacher Signature</p>
        </div>
      </div>
    </div>
  `

  return createBaseHTML(content, 'School Behaviour Report')
}

function getGradeColor(grade: string): string {
  switch (grade?.toUpperCase()) {
    case 'A': return '#4caf50'
    case 'B': return '#8bc34a'
    case 'C': return '#ffc107'
    case 'D': return '#ff9800'
    case 'E': return '#ff5722'
    case 'F': return '#f44336'
    default: return '#666'
  }
}
