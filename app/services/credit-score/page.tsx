import ServiceForm from '@/components/ServiceForm'

export default function CreditScorePage() {
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
      name: 'address',
      label: 'Address',
      type: 'text' as const,
      required: true,
      placeholder: '123 Main Street, London'
    },
    {
      name: 'employmentStatus',
      label: 'Employment Status',
      type: 'text' as const,
      required: true,
      placeholder: 'Employed'
    }
  ]

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="glitch-text text-4xl font-bold text-neon-yellow mb-4">
            Trap Credit Score Report
          </h1>
          <p className="text-xl text-gray-300">
            Generate fake credit reports with detailed financial history.
          </p>
        </div>

        <ServiceForm
          serviceId="credit-score"
          serviceName="Trap Credit Score Report"
          fields={fields}
          description="Create a comprehensive credit score report with detailed financial history, loan records, and credit analysis. For novelty purposes only."
        />
      </div>
    </div>
  )
}
