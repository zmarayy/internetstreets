import ServiceForm from '@/components/ServiceForm'

export default function JobRejectionPage() {
  const fields = [
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text' as const,
      required: true,
      placeholder: 'John Doe'
    },
    {
      name: 'companyName',
      label: 'Company Name',
      type: 'text' as const,
      required: true,
      placeholder: 'Tech Corp Ltd'
    },
    {
      name: 'jobTitle',
      label: 'Job Title Applied For',
      type: 'text' as const,
      required: true,
      placeholder: 'Software Developer'
    },
    {
      name: 'applicationDate',
      label: 'Application Date',
      type: 'date' as const,
      required: true
    }
  ]

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="glitch-text text-4xl font-bold text-neon-green mb-4">
            Job Application Rejection Letter
          </h1>
          <p className="text-xl text-gray-300">
            Generate professional job rejection letters.
          </p>
        </div>

        <ServiceForm
          serviceId="job-rejection"
          serviceName="Job Application Rejection Letter"
          fields={fields}
          description="Create a professional job rejection letter with detailed feedback and company branding. Perfect for novelty purposes or creative projects."
        />
      </div>
    </div>
  )
}
