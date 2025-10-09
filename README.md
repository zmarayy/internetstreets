# Internet Streets - The AI Black Market

A dark, gritty website for AI-generated novelty documents with a cyberpunk aesthetic.

## Features

- **10 AI-Powered Services**: FBI files, NSA surveillance logs, payslips, credit reports, and more
- **Stripe Payment Integration**: Secure £2.50 payments for each service
- **Dark Cyberpunk Theme**: Neon accents, glitch effects, and underground marketplace vibes
- **Responsive Design**: Works perfectly on desktop and mobile
- **Instant Generation**: AI-powered document creation using OpenAI GPT-4
- **Real-time Result Delivery**: PDF preview and download after payment
- **Professional Templates**: Styled document rendering with official layouts

## Services Available

1. **FBI File Generator** - Generate realistic FBI surveillance files
2. **NSA Surveillance Log** - Create digital footprint reports
3. **Government Criminal Record Leak** - Fake criminal history records
4. **Universal Credit Assessment Report** - Benefits assessment documents
5. **Trap Credit Score Report** - Detailed credit reports
6. **Fake Payslip Generator** - Professional payslips
7. **Job Application Rejection Letter** - HR rejection letters
8. **Rent Reference Letter Generator** - Landlord references
9. **School Behaviour Record Reprint** - Educational records
10. **Fake College Degree Generator** - University diplomas

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `env.example` to `.env.local` and fill in your API keys:

```bash
cp env.example .env.local
```

Required environment variables:
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret
- `OPENAI_API_KEY`: Your OpenAI API key
- `ADMIN_USER`: Admin panel username
- `ADMIN_PASS`: Admin panel password
- `NEXT_PUBLIC_BASE_URL`: Your application URL (https://internetstreets.uk for production)

### 3. Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe dashboard
3. Add them to your `.env.local` file

### 4. OpenAI Setup

1. Create an OpenAI account at https://openai.com
2. Generate an API key
3. Add it to your `.env.local` file

### 5. Run the Application

```bash
npm run dev
```

Visit http://localhost:3000 to see your Internet Streets marketplace!

## Project Structure

```
internet-streets/
├── app/
│   ├── api/
│   │   ├── create-checkout-session/    # Stripe checkout
│   │   ├── result/[sessionId]/         # Result retrieval
│   │   ├── stripe-webhook/             # Payment processing
│   │   └── admin/                      # Admin panel APIs
│   ├── services/                       # Individual service pages
│   ├── result/[sessionId]/             # Result display page
│   ├── admin/                          # Admin panel pages
│   ├── globals.css                     # Global styles
│   ├── layout.tsx                      # Root layout
│   └── page.tsx                        # Homepage
├── components/
│   ├── Navbar.tsx                      # Navigation component
│   ├── Footer.tsx                      # Footer component
│   └── ServiceForm.tsx                  # Reusable service form
├── templates/                          # PDF rendering templates
├── prompts/                            # AI prompt files
├── lib/                                # Utility functions
└── data/                               # Service configurations
```

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS with custom neon theme
- **Payments**: Stripe Checkout
- **AI**: OpenAI GPT-4
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Legal Disclaimer

⚠️ **IMPORTANT**: This application generates novelty documents for entertainment purposes only. All generated content is fictional and should not be used for fraudulent or illegal activities. Users are solely responsible for their use of generated content.

## Contributing

This is a novelty project for entertainment purposes. Feel free to fork and modify for your own projects!

## License

MIT License - See LICENSE file for details.
# Production Deployment - Thu Oct  9 03:09:48 BST 2025
