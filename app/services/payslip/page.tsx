import ServiceForm from '@/components/ServiceForm'

export default function PayslipPage() {
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
      label: 'Job Title',
      type: 'text' as const,
      required: true,
      placeholder: 'Software Developer'
    },
    {
      name: 'salary',
      label: 'Annual Salary (£)',
      type: 'number' as const,
      required: true,
      placeholder: '50000'
    },
    {
      name: 'payPeriod',
      label: 'Pay Period',
      type: 'text' as const,
      required: true,
      placeholder: 'Monthly'
    }
  ]

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="glitch-text text-4xl font-bold text-neon-pink mb-4">
            Fake Payslip Generator
          </h1>
          <p className="text-xl text-gray-300">
            Create realistic payslips for novelty purposes.
          </p>
        </div>

        <ServiceForm
          serviceId="payslip"
          serviceName="Fake Payslip Generator"
          fields={fields}
          description="Generate a professional-looking payslip with detailed salary breakdown, deductions, and company information. Perfect for novelty purposes, creative projects, or educational use."
        />
      </div>
    </div>
  )
}
