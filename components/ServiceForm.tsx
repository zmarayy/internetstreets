'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface ServiceFormProps {
  serviceId: string
  serviceName: string
  fields: Array<{
    name: string
    label: string
    type: 'text' | 'date' | 'email' | 'number'
    required?: boolean
    placeholder?: string
  }>
  description: string
  price?: number
}

export default function ServiceForm({ serviceId, serviceName, fields, description, price = 250 }: ServiceFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!disclaimerAccepted) {
      alert('Please confirm that you understand this is novelty content.')
      return
    }
    
    setIsLoading(true)

    try {
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: serviceId,
          inputs: formData,
        }),
      })

      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Error processing payment. Please try again.')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Error processing payment. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-dark-card border border-dark-border rounded-lg p-8 neon-border border-neon-pink">
        <h2 className="text-2xl font-bold text-neon-pink mb-4">{serviceName}</h2>
        <p className="text-gray-300 mb-8">{description}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {field.label}
                {field.required && <span className="text-neon-pink ml-1">*</span>}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                required={field.required}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green focus:ring-opacity-50 transition-colors"
              />
            </div>
          ))}

          <div className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-medium text-gray-300">Total:</span>
              <span className="text-2xl font-bold text-neon-green">£{(price / 100).toFixed(2)}</span>
            </div>
            
            <div className="mb-6">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={disclaimerAccepted}
                  onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 text-neon-green bg-dark-bg border-dark-border rounded focus:ring-neon-green focus:ring-2"
                />
                <span className="checkout-disclaimer">
                  I confirm this is novelty content and I will not use it as an official document.
                </span>
              </label>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-neon-pink hover:bg-neon-pink/80 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed neon-glow flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Generate for £{(price / 100).toFixed(2)}</span>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-dark-bg rounded-lg border border-neon-yellow">
          <p className="text-neon-yellow text-sm font-medium">
            ⚠️ This service generates novelty documents for entertainment purposes only. 
            Not real documents.
          </p>
        </div>
      </div>
    </div>
  )
}
