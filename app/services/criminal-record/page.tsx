import ServiceForm from '@/components/ServiceForm'

export default function CriminalRecordPage() {
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
      name: 'nationality',
      label: 'Nationality',
      type: 'text' as const,
      required: true,
      placeholder: 'British'
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
          <h1 className="glitch-text text-4xl font-bold text-neon-purple mb-4">
            Government Criminal Record Leak
          </h1>
          <p className="text-xl text-gray-300">
            Generate fake criminal history records.
          </p>
        </div>

        <ServiceForm
          serviceId="criminal-record"
          serviceName="Government Criminal Record Leak"
          fields={fields}
          description="Create a realistic criminal record with charges, convictions, and court proceedings. For novelty and entertainment purposes only."
        />
      </div>
    </div>
  )
}
