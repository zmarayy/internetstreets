import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://internetstreets.uk'),
  title: 'Internet Streets – AI Black Marketplace',
  description: 'Internet Streets is the AI Black Marketplace — generate hyper-realistic AI-powered documents, parody files, and creative novelty reports instantly. Purely for entertainment.',
  keywords: 'Internet Streets, AI Black Marketplace, AI entertainment, parody documents, fake reports, novelty PDFs, AI tools, internetstreets.uk',
  authors: [{ name: 'Internet Streets Entertainment' }],
  creator: 'Internet Streets Entertainment',
  publisher: 'Internet Streets Entertainment',
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
      <head>
        {/* Structured Data Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Internet Streets",
              "url": "https://internetstreets.uk",
              "description": "Internet Streets – The AI Black Marketplace for creative, realistic, and entertaining digital document generation.",
              "publisher": {
                "@type": "Organization",
                "name": "Internet Streets Entertainment"
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://internetstreets.uk/?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
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
