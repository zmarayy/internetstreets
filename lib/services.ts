import servicesConfig from '../data/services.json'

export interface ServiceField {
  name: string
  label: string
  type: 'text' | 'date' | 'email' | 'number'
  required: boolean
  placeholder?: string
}

export interface Service {
  name: string
  description: string
  slug: string
  prompt_file: string
  type: 'pdf' | 'image'
  price: number
  fields: ServiceField[]
}

export interface ServicesConfig {
  [key: string]: Service
}

export function getService(slug: string): Service | null {
  return (servicesConfig as ServicesConfig)[slug] || null
}

export function getAllServices(): Service[] {
  return Object.values(servicesConfig as ServicesConfig)
}

export function validateServiceInputs(slug: string, inputs: Record<string, string>): boolean {
  const service = getService(slug)
  if (!service) return false

  for (const field of service.fields) {
    if (field.required && (!inputs[field.name] || inputs[field.name].trim() === '')) {
      return false
    }
  }

  return true
}

export function loadServicesConfig(): ServicesConfig {
  return servicesConfig as ServicesConfig
}
