import Link from 'next/link'
import { 
  FileText, 
  Eye, 
  Shield, 
  CreditCard, 
  TrendingUp, 
  Receipt, 
  X, 
  Home, 
  GraduationCap, 
  School 
} from 'lucide-react'

const services = [
  {
    id: 'fbi-file',
    name: 'FBI File Generator',
    description: 'See what the gov has on you 👀',
    icon: FileText,
    color: 'text-neon-pink',
    borderColor: 'border-neon-pink',
    href: '/services/fbi-file'
  },
  {
    id: 'nsa-surveillance',
    name: 'NSA Surveillance Log',
    description: 'Track your digital footprint',
    icon: Eye,
    color: 'text-neon-green',
    borderColor: 'border-neon-green',
    href: '/services/nsa-surveillance'
  },
  {
    id: 'criminal-record',
    name: 'Government Criminal Record Leak',
    description: 'Generate fake criminal history',
    icon: Shield,
    color: 'text-neon-purple',
    borderColor: 'border-neon-purple',
    href: '/services/criminal-record'
  },
  {
    id: 'universal-credit',
    name: 'Universal Credit Assessment Report',
    description: 'Fake benefits assessment',
    icon: CreditCard,
    color: 'text-neon-blue',
    borderColor: 'border-neon-blue',
    href: '/services/universal-credit'
  },
  {
    id: 'credit-score',
    name: 'Trap Credit Score Report',
    description: 'Generate fake credit reports',
    icon: TrendingUp,
    color: 'text-neon-yellow',
    borderColor: 'border-neon-yellow',
    href: '/services/credit-score'
  },
  {
    id: 'payslip',
    name: 'Fake Payslip Generator',
    description: 'Create realistic payslips',
    icon: Receipt,
    color: 'text-neon-pink',
    borderColor: 'border-neon-pink',
    href: '/services/payslip'
  },
  {
    id: 'job-rejection',
    name: 'Job Application Rejection Letter',
    description: 'Generate rejection letters',
    icon: X,
    color: 'text-neon-green',
    borderColor: 'border-neon-green',
    href: '/services/job-rejection'
  },
  {
    id: 'rent-reference',
    name: 'Rent Reference Letter Generator',
    description: 'Create landlord references',
    icon: Home,
    color: 'text-neon-purple',
    borderColor: 'border-neon-purple',
    href: '/services/rent-reference'
  },
  {
    id: 'school-behaviour',
    name: 'School Behaviour Record Reprint',
    description: 'Generate school records',
    icon: School,
    color: 'text-neon-blue',
    borderColor: 'border-neon-blue',
    href: '/services/school-behaviour'
  },
  {
    id: 'college-degree',
    name: 'Fake College Degree Generator',
    description: 'Create fake diplomas',
    icon: GraduationCap,
    color: 'text-neon-yellow',
    borderColor: 'border-neon-yellow',
    href: '/services/college-degree'
  }
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="glitch-text text-4xl sm:text-6xl font-bold text-neon-pink mb-6">
            All Services
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Choose from our collection of AI-powered document generators. 
            Each service creates realistic documents for novelty purposes only.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service) => {
            const IconComponent = service.icon
            return (
              <Link
                key={service.id}
                href={service.href}
                className={`group block bg-dark-card border ${service.borderColor} rounded-lg p-6 card-hover neon-border ${service.color}`}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <IconComponent 
                    size={48} 
                    className={`${service.color} group-hover:animate-neon-pulse`}
                  />
                  <h3 className="text-xl font-bold text-white group-hover:text-neon-green transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {service.description}
                  </p>
                  <div className="text-neon-pink font-bold text-lg">
                    £2.50
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-16 text-center">
          <div className="bg-dark-card border border-neon-purple rounded-lg p-8 max-w-4xl mx-auto mb-8">
            <h2 className="text-3xl font-bold text-neon-purple mb-6">
              🚀 More Services Coming Soon
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              We're constantly expanding our underground marketplace with new AI-powered tools. 
              Stay tuned for more document generators, verification services, and novelty utilities.
            </p>
            <div className="flex justify-center items-center space-x-4 text-neon-green">
              <div className="animate-spin">
                <div className="w-4 h-4 border-2 border-neon-green border-t-transparent rounded-full"></div>
              </div>
              <span className="text-lg font-medium">Development in progress...</span>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-dark-card border border-neon-yellow rounded-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-neon-yellow mb-4">
              ⚠️ Important Disclaimer
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              All documents generated by Internet Streets are for <strong>novelty and entertainment purposes only</strong>. 
              They are not real documents and should not be used for fraudulent purposes. 
              We are not responsible for any misuse of generated content.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
