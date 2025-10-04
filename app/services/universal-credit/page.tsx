import ServiceForm from '@/components/ServiceForm'

export default function UniversalCreditPage() {
  const fields = [
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text' as const,
      required: true,
      placeholder: 'John Doe'
    },
    {
      name: 'dateOfBirth',
      label: 'Date of Birth',
      type: 'date' as const,
      required: true
    },
    {
      name: 'nationalInsurance',
      label: 'National Insurance Number',
      type: 'text' as const,
      required: true,
      placeholder: 'AB123456C'
    },
    {
      name: 'address',
      label: 'Address',
      type: 'text' as const,
      required: true,
      placeholder: '123 Main Street, London'
    }
  ]

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="glitch-text text-4xl font-bold text-neon-blue mb-4">
            Universal Credit Assessment Report
          </h1>
          <p className="text-xl text-gray-300">
            Generate fake benefits assessment reports.
          </p>
        </div>

        <ServiceForm
          serviceId="universal-credit"
          serviceName="Universal Credit Assessment Report"
          fields={fields}
          description="Create a realistic Universal Credit assessment report with benefit calculations, eligibility status, and payment schedules. For novelty purposes only."
        />
      </div>
    </div>
  )
}
