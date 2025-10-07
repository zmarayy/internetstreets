import ServiceForm from '@/components/ServiceForm'
import { getService } from '@/lib/services'

export default function PayslipPage() {
  const service = getService('payslip')
  
  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neon-pink mb-4">Service Not Found</h1>
          <p className="text-gray-300">The requested service could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="glitch-text text-4xl font-bold text-neon-pink mb-4">
            {service.name}
          </h1>
          <p className="text-xl text-gray-300">
            Create realistic payslips for novelty purposes.
          </p>
        </div>

        <ServiceForm
          serviceId={service.slug}
          serviceName={service.name}
          fields={service.fields}
          description="Generate a professional-looking payslip with detailed salary breakdown, deductions, and company information. Perfect for novelty purposes, creative projects, or educational use."
          price={service.price}
        />
      </div>
    </div>
  )
}
