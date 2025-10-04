import ServiceForm from '@/components/ServiceForm'

export default function SchoolBehaviourPage() {
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
      name: 'schoolName',
      label: 'School Name',
      type: 'text' as const,
      required: true,
      placeholder: 'St. Mary\'s High School'
    },
    {
      name: 'yearGroup',
      label: 'Year Group',
      type: 'text' as const,
      required: true,
      placeholder: 'Year 11'
    },
    {
      name: 'studentId',
      label: 'Student ID',
      type: 'text' as const,
      required: true,
      placeholder: 'SM2024001'
    }
  ]

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="glitch-text text-4xl font-bold text-neon-blue mb-4">
            School Behaviour Record Reprint
          </h1>
          <p className="text-xl text-gray-300">
            Generate school behaviour records.
          </p>
        </div>

        <ServiceForm
          serviceId="school-behaviour"
          serviceName="School Behaviour Record Reprint"
          fields={fields}
          description="Create a detailed school behaviour record with attendance, disciplinary actions, and academic performance. For novelty and entertainment purposes only."
        />
      </div>
    </div>
  )
}
