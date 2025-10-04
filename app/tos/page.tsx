import Link from 'next/link'

export default function TermsOfService() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-dark-bg text-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="glitch-text text-4xl font-bold text-neon-green mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-300">
            Internet Streets — The AI Black Market
          </p>
        </div>

        {/* Content */}
        <div className="bg-dark-card border border-dark-border rounded-lg p-8 shadow-lg">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              Internet Streets provides novelty, fictional, and entertainment-only digital content. 
              All generated documents and images are fictional and must not be represented as real 
              or used for unlawful or deceptive purposes. You agree to use outputs responsibly. 
              If you suspect misuse, contact{' '}
              <a 
                href="mailto:thegaminggeekat@gmail.com" 
                className="text-neon-blue hover:text-neon-blue/80 transition-colors"
              >
                thegaminggeekat@gmail.com
              </a>.
            </p>
            
            <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 font-medium">
                ⚠️ All content is for entertainment purposes only. Not real documents.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center mt-12">
          <Link 
            href="/"
            className="bg-neon-pink hover:bg-neon-pink/80 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 neon-glow"
          >
            Back to Internet Streets
          </Link>
        </div>
      </div>
    </div>
  )
}
