import ServiceForm from '@/components/ServiceForm'

export default function RentReferencePage() {
  const fields = [
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text' as const,
      required: true,
      placeholder: 'John Doe'
    },
    {
      name: 'landlordName',
      label: 'Landlord Name',
      type: 'text' as const,
      required: true,
      placeholder: 'Jane Smith'
    },
    {
      name: 'propertyAddress',
      label: 'Property Address',
      type: 'text' as const,
      required: true,
      placeholder: '123 Main Street, London'
    },
    {
      name: 'rentAmount',
      label: 'Monthly Rent (£)',
      type: 'number' as const,
      required: true,
      placeholder: '1200'
    },
    {
      name: 'tenancyPeriod',
      label: 'Tenancy Period',
      type: 'text' as const,
      required: true,
      placeholder: '12 months'
    }
  ]

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="glitch-text text-4xl font-bold text-neon-purple mb-4">
            Rent Reference Letter Generator
          </h1>
          <p className="text-xl text-gray-300">
            Create landlord reference letters.
          </p>
        </div>

        <ServiceForm
          serviceId="rent-reference"
          serviceName="Rent Reference Letter Generator"
          fields={fields}
          description="Generate a professional rent reference letter from a landlord with payment history, property details, and tenancy assessment. For novelty purposes only."
        />
      </div>
    </div>
  )
}
