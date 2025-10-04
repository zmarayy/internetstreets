import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://internetstreets.uk'),
  title: 'Internet Streets - The AI Black Market | Novelty Document Generator',
  description: 'Generate realistic FBI files, payslips, degrees, and official documents for novelty purposes. AI-powered document creation with professional templates. Entertainment only.',
  keywords: 'AI document generator, novelty documents, FBI file generator, fake payslip, fake degree, entertainment documents, AI black market',
  authors: [{ name: 'Internet Streets' }],
  creator: 'Internet Streets',
  publisher: 'Internet Streets',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://internetstreets.uk',
    siteName: 'Internet Streets',
    title: 'Internet Streets - The AI Black Market',
    description: 'Generate realistic documents for novelty purposes. FBI files, payslips, degrees, and more. Entertainment only.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Internet Streets - The AI Black Market',
    description: 'Generate realistic documents for novelty purposes. Entertainment only.',
  },
  verification: {
    google: 'your-google-verification-code', // Add your actual verification code
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
