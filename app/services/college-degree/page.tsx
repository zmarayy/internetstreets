import ServiceForm from '@/components/ServiceForm'

export default function CollegeDegreePage() {
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
      name: 'universityName',
      label: 'University Name',
      type: 'text' as const,
      required: true,
      placeholder: 'University of London'
    },
    {
      name: 'degreeType',
      label: 'Degree Type',
      type: 'text' as const,
      required: true,
      placeholder: 'Bachelor of Science'
    },
    {
      name: 'subject',
      label: 'Subject',
      type: 'text' as const,
      required: true,
      placeholder: 'Computer Science'
    },
    {
      name: 'graduationYear',
      label: 'Graduation Year',
      type: 'number' as const,
      required: true,
      placeholder: '2023'
    }
  ]

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="glitch-text text-4xl font-bold text-neon-yellow mb-4">
            Fake College Degree Generator
          </h1>
          <p className="text-xl text-gray-300">
            Create fake diplomas and certificates.
          </p>
        </div>

        <ServiceForm
          serviceId="college-degree"
          serviceName="Fake College Degree Generator"
          fields={fields}
          description="Generate a realistic college degree certificate with university branding, official seals, and detailed academic information. For novelty and entertainment purposes only."
        />
      </div>
    </div>
  )
}
