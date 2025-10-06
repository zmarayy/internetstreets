import React from 'react'

interface UniversalCreditTemplateProps {
  document_text: string
  metadata?: {
    name?: string
    dob?: string
    city?: string
    occupation?: string
  }
}

export default function UniversalCreditTemplate({ document_text, metadata }: UniversalCreditTemplateProps) {
  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      fontSize: '12px', 
      lineHeight: '1.4',
      color: '#333',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#fff'
    }}>
      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px', 
        borderBottom: '2px solid #1976d2', 
        paddingBottom: '15px' 
      }}>
        <h1 style={{ 
          color: '#1565c0', 
          fontSize: '20px', 
          fontWeight: 'bold', 
          marginBottom: '5px',
          margin: '0 0 5px 0'
        }}>
          UNIVERSAL CREDIT ASSESSMENT
        </h1>
        <p style={{ fontSize: '10px', color: '#666', margin: '0' }}>
          Department for Work and Pensions
        </p>
      </div>

      {/* Document Content */}
      <div style={{ 
        whiteSpace: 'pre-wrap',
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        lineHeight: '1.3',
        color: '#333'
      }}>
        {document_text}
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '30px', 
        paddingTop: '15px', 
        borderTop: '1px solid #ddd',
        fontSize: '9px',
        color: '#666'
      }}>
        <p style={{ margin: '0 0 10px 0' }}>
          Internet Streets Entertainment – Not a Real Document
        </p>
        <p style={{ margin: '0' }}>
          Assessment Date: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
