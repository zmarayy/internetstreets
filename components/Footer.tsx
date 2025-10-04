export default function Footer() {
  return (
    <footer className="bg-dark-bg border-t border-dark-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo */}
          <div className="glitch-text text-xl font-bold text-neon-pink">
            Internet Streets
          </div>
          
          {/* Disclaimer */}
          <div className="text-center md:text-right">
            <p className="text-gray-400 text-sm">
              For novelty use only. Not real documents.
            </p>
            <p className="text-gray-500 text-xs mt-1">
              © 2025 Internet Streets. All rights reserved.
            </p>
          </div>
        </div>
        
        {/* Site-wide disclaimer */}
        <div className="mt-6 pt-6 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-xs">
            Internet Streets — novelty content. Use responsibly. |{' '}
            <a 
              href="/tos" 
              className="text-gray-400 hover:text-neon-green transition-colors"
            >
              Terms of Service
            </a>
            {' '}|{' '}
            <a 
              href="mailto:thegaminggeekat@gmail.com" 
              className="text-gray-400 hover:text-neon-green transition-colors"
            >
              Report misuse
            </a>
            {' '}|{' '}
            <a 
              href="/admin" 
              className="text-gray-500 hover:text-gray-300 transition-colors"
              title="Admin Panel"
            >
              🔒
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
