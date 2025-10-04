export default function ContactPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="glitch-text text-4xl font-bold text-neon-pink mb-4">
            Contact Internet Streets
          </h1>
          <p className="text-xl text-gray-300">
            Get in touch with the underground marketplace
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-8 neon-border border-neon-green">
            <h2 className="text-2xl font-bold text-neon-green mb-6">Contact Information</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Email & Support</h3>
                <a 
                  href="mailto:thegaminggeekat@gmail.com"
                  className="text-lg font-semibold text-neon-pink hover:text-neon-green hover:underline transition-colors cursor-pointer"
                >
                  thegaminggeekat@gmail.com
                </a>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Business Hours</h3>
                <p className="text-gray-300">24/7 Underground Operations</p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-8 neon-border border-neon-purple">
            <h2 className="text-2xl font-bold text-neon-purple mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Are the documents real?</h3>
                <p className="text-gray-300 text-sm">No, all documents are AI-generated for novelty purposes only. They are not real documents.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Can I use these for fraud?</h3>
                <p className="text-gray-300 text-sm">Absolutely not. These are for entertainment only. Using them fraudulently is illegal.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">How long does generation take?</h3>
                <p className="text-gray-300 text-sm">Results are generated instantly after payment confirmation.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Can I get a refund?</h3>
                <p className="text-gray-300 text-sm">Refunds are handled on a case-by-case basis. Contact support for assistance.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-6 bg-dark-bg border border-neon-yellow rounded-lg">
          <h3 className="text-lg font-bold text-neon-yellow mb-3">
            ⚠️ Important Legal Notice
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Internet Streets is a novelty service for entertainment purposes only. All generated documents are fictional and should not be used for any fraudulent or illegal activities. Users are solely responsible for their use of generated content. We do not endorse or encourage any illegal activities.
          </p>
        </div>
      </div>
    </div>
  )
}
