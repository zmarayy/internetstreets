import ServiceForm from '@/components/ServiceForm'
import { getService } from '@/lib/services'

export default function SchoolBehaviourPage() {
  const service = getService('school-behaviour')
  
  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neon-blue mb-4">Service Not Found</h1>
          <p className="text-gray-300">The requested service could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="glitch-text text-4xl font-bold text-neon-blue mb-4">
            {service.name}
          </h1>
          <p className="text-xl text-gray-300">
            Generate school behaviour records.
          </p>
        </div>

        <ServiceForm
          serviceId={service.slug}
          serviceName={service.name}
          fields={service.fields}
          description="Create a detailed school behaviour record with attendance, disciplinary actions, and academic performance. For novelty and entertainment purposes only."
          price={service.price}
        />
      </div>
    </div>
  )
}
