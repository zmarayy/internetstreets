import ServiceForm from '@/components/ServiceForm'

export default function NSASurveillancePage() {
  const fields = [
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text' as const,
      required: true,
      placeholder: 'John Doe'
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email' as const,
      required: true,
      placeholder: 'john@example.com'
    },
    {
      name: 'phoneNumber',
      label: 'Phone Number',
      type: 'text' as const,
      required: true,
      placeholder: '+44 7700 900000'
    },
    {
      name: 'city',
      label: 'City',
      type: 'text' as const,
      required: true,
      placeholder: 'London'
    }
  ]

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="glitch-text text-4xl font-bold text-neon-green mb-4">
            NSA Surveillance Log
          </h1>
          <p className="text-xl text-gray-300">
            Track your digital footprint with a detailed NSA surveillance report.
          </p>
        </div>

        <ServiceForm
          serviceId="nsa-surveillance"
          serviceName="NSA Surveillance Log"
          fields={fields}
          description="Generate a comprehensive NSA surveillance log showing intercepted communications, online activity monitoring, and digital footprint analysis. For entertainment purposes only."
        />
      </div>
    </div>
  )
}
