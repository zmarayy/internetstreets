
import Link from 'next/link'
import { Metadata } from 'next'
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
import { loadServicesConfig } from '@/lib/services'

export const metadata: Metadata = {
  title: 'AI Black Market - Fake Document Generator | Internet Streets #1',
  description: '#1 AI Black Market for fake documents, prank papers, novelty FBI files, fake payslips, fake degrees. Generate realistic prank documents instantly. Best fake document generator online.',
  keywords: 'AI black market, fake documents, prank documents, fake FBI file, fake payslip generator, fake degree maker, novelty documents, prank papers, fake official documents, document generator, AI document creator, fake government documents, prank certificate maker, fake ID generator, novelty papers, entertainment documents, fake report generator, prank letter maker, fake assessment generator, document prank tool',
  openGraph: {
    title: 'AI Black Market - #1 Fake Document Generator | Internet Streets',
    description: '#1 AI Black Market for fake documents, prank papers, novelty FBI files, fake payslips, fake degrees. Generate realistic prank documents instantly.',
    url: 'https://internetstreets.uk',
    siteName: 'Internet Streets - AI Black Market',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Black Market - #1 Fake Document Generator',
    description: '#1 AI Black Market for fake documents, prank papers, novelty FBI files, fake payslips, fake degrees.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const iconMap = {
  'fbi-file': FileText,
  'nsa-surveillance': Eye,
  'criminal-record': Shield,
  'universal-credit': CreditCard,
  'credit-score': TrendingUp,
  'payslip': Receipt,
  'job-rejection': X,
  'rent-reference': Home,
  'school-behaviour': School,
  'college-degree': GraduationCap,
}

const colorMap = {
  'fbi-file': { color: 'text-neon-pink', borderColor: 'border-neon-pink' },
  'nsa-surveillance': { color: 'text-neon-green', borderColor: 'border-neon-green' },
  'criminal-record': { color: 'text-neon-purple', borderColor: 'border-neon-purple' },
  'universal-credit': { color: 'text-neon-blue', borderColor: 'border-neon-blue' },
  'credit-score': { color: 'text-neon-yellow', borderColor: 'border-neon-yellow' },
  'payslip': { color: 'text-neon-pink', borderColor: 'border-neon-pink' },
  'job-rejection': { color: 'text-neon-green', borderColor: 'border-neon-green' },
  'rent-reference': { color: 'text-neon-purple', borderColor: 'border-neon-purple' },
  'school-behaviour': { color: 'text-neon-blue', borderColor: 'border-neon-blue' },
  'college-degree': { color: 'text-neon-yellow', borderColor: 'border-neon-yellow' },
}

export default function HomePage() {
  // Load services data
  const servicesConfig = loadServicesConfig()
  const services = Object.entries(servicesConfig).map(([id, service]) => ({
    id,
    name: service.name,
    description: service.description,
    icon: iconMap[id as keyof typeof iconMap],
    color: colorMap[id as keyof typeof colorMap].color,
    borderColor: colorMap[id as keyof typeof colorMap].borderColor,
    href: `/services/${id}`,
    price: service.price
  }))

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Internet Streets",
    "alternateName": "The AI Black Market",
    "url": "https://internetstreets.uk",
    "description": "Generate realistic documents for novelty purposes. FBI files, payslips, degrees, and more. Entertainment only.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://internetstreets.uk/services?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "GBP",
      "lowPrice": "2.50",
      "highPrice": "2.50",
      "offerCount": services.length
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="glitch-text text-4xl sm:text-6xl lg:text-7xl font-bold text-neon-pink mb-6">
            Internet Streets
          </h1>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neon-green mb-8">
            The #1 AI Black Market
          </h2>
          <p className="text-gray-300 text-lg sm:text-xl max-w-3xl mx-auto mb-8">
            <strong>#1 Fake Document Generator Online</strong> - Generate realistic prank documents, fake FBI files, fake payslips, fake degrees, and novelty papers instantly. 
            The best AI black market for entertainment documents and prank papers.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-neon-green mb-12">
            Available Services
          </h2>
          
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
                      £{(service.price / 100).toFixed(2)}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Warning Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-neon-yellow mb-6">
            ⚠️ Important Disclaimer
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            All documents generated by Internet Streets are for <strong>novelty and entertainment purposes only</strong>. 
            They are not real documents and should not be used for fraudulent purposes. 
            We are not responsible for any misuse of generated content.
          </p>
        </div>
      </section>
      </div>
    </>
  )
}
