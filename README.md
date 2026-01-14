# STAR Workforce Solutions

Complete Next.js platform for consulting and contract job seekers in USA & Canada.

## Features

- Professional Deep Navy & Gold branding with premium UI/UX
- NextAuth.js authentication (Google, LinkedIn, Email magic links)
- Vercel Postgres database with full schema
- Stripe payment integration for ATS Optimizer unlocks
- Employer job posting system (max 5 active, 30-day expiration)
- Vercel Blob resume uploads with file management
- Complete API layer with type-safe database queries
- Playwright end-to-end test suite
- Cookie consent with Google Analytics integration
- Comprehensive legal pages (Terms, Privacy, Disclaimer)
- Responsive design for all devices

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Vercel Postgres
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Storage**: Vercel Blob
- **Testing**: Playwright
- **Analytics**: Google Analytics 4
- **Deployment**: Vercel

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Set up environment variables (see .env.example)
cp .env.example .env.local

# Run development server
npm run dev

# Open http://localhost:3000
\`\`\`

## Environment Variables

Create `.env.local` with these variables:

\`\`\`bash
# Database (Vercel Postgres)
POSTGRES_URL=your-postgres-url
POSTGRES_URL_NON_POOLING=your-postgres-url-non-pooling

# Authentication (NextAuth.js)
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Email (SMTP)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@starworkforcesolutions.com

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# Analytics
NEXT_PUBLIC_GA_ID=G-2KEG2N039D

# Site URL
NEXT_PUBLIC_URL=http://localhost:3000

# Cron Job Secret
CRON_SECRET=your-cron-secret
\`\`\`

## Database Setup

1. Create Vercel Postgres database in your Vercel dashboard
2. Run migrations:

\`\`\`bash
# Connect to database
psql $POSTGRES_URL_NON_POOLING

# Run migrations
\i scripts/001_init_schema.sql
\i scripts/002_seed_admin.sql
\`\`\`

See [docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md) for details.

## Authentication Setup

Configure OAuth providers:

1. **Google OAuth**: [docs/AUTH_SETUP.md](docs/AUTH_SETUP.md#google-oauth)
2. **LinkedIn OAuth**: [docs/AUTH_SETUP.md](docs/AUTH_SETUP.md#linkedin-oauth)
3. **Email Provider**: [docs/AUTH_SETUP.md](docs/AUTH_SETUP.md#email-provider-smtp)

## Stripe Setup

1. Create Stripe account
2. Get API keys from Stripe Dashboard
3. Configure webhook endpoint: `/api/stripe/webhook`
4. Add webhook secret to environment variables

See [docs/STRIPE_SETUP.md](docs/STRIPE_SETUP.md) for details.

## Deployment to Vercel

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel Dashboard
vercel env pull
\`\`\`

### Post-Deployment Checklist

- [ ] Set all environment variables in Vercel Dashboard
- [ ] Create Vercel Postgres database
- [ ] Run database migrations
- [ ] Enable Vercel Blob storage
- [ ] Configure Stripe webhook URL
- [ ] Set up OAuth redirect URIs (production URLs)
- [ ] Configure custom domain
- [ ] Test authentication flow
- [ ] Test payment flow
- [ ] Test resume upload
- [ ] Run Playwright tests in CI/CD

## Testing

\`\`\`bash
# Install Playwright
npx playwright install

# Run all tests
npx playwright test

# Run tests in UI mode
npx playwright test --ui

# Run specific test
npx playwright test tests/homepage.spec.ts
\`\`\`

See [tests/README.md](tests/README.md) for details.

## Project Structure

\`\`\`
star-workforce-solutions/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/[...nextauth]/   # NextAuth endpoints
│   │   ├── contact/              # Contact form
│   │   ├── upload/               # Resume upload
│   │   ├── jobs/                 # Job listings
│   │   ├── employer/             # Employer endpoints
│   │   ├── stripe/               # Stripe checkout & webhooks
│   │   ├── cron/                 # Cron jobs
│   │   └── health/               # Health check
│   ├── auth/                     # Auth pages
│   ├── dashboard/                # User dashboard
│   ├── employer/                 # Employer pages
│   ├── jobs/                     # Job listings
│   ├── services/                 # Services page
│   ├── pricing/                  # Pricing page
│   ├── contact/                  # Contact page
│   ├── legal/                    # Legal pages
│   └── tools/                    # ATS Optimizer
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── navigation.tsx            # Header navigation
│   ├── footer.tsx                # Footer
│   ├── cookie-consent.tsx        # Cookie banner
│   ├── auth-provider.tsx         # NextAuth provider
│   └── resume-upload.tsx         # Resume upload
├── lib/                          # Utilities
│   ├── auth.ts                   # NextAuth config
│   ├── session.ts                # Session utilities
│   ├── db.ts                     # Database queries
│   ├── stripe.ts                 # Stripe utilities
│   └── utils.ts                  # General utilities
├── scripts/                      # SQL migrations
│   ├── 001_init_schema.sql       # Database schema
│   └── 002_seed_admin.sql        # Seed data
├── tests/                        # Playwright tests
├── docs/                         # Documentation
│   ├── DATABASE_SETUP.md
│   ├── AUTH_SETUP.md
│   ├── STRIPE_SETUP.md
│   ├── VERCEL_BLOB_SETUP.md
│   └── API_REFERENCE.md
├── public/                       # Static assets
└── types/                        # TypeScript types
\`\`\`

## Documentation

- [Database Setup](docs/DATABASE_SETUP.md)
- [Authentication Setup](docs/AUTH_SETUP.md)
- [Stripe Payment Setup](docs/STRIPE_SETUP.md)
- [Vercel Blob Setup](docs/VERCEL_BLOB_SETUP.md)
- [API Reference](docs/API_REFERENCE.md)
- [Test Suite](tests/README.md)

## Key Features Detail

### Authentication
- Google OAuth
- LinkedIn OAuth
- Email magic links
- Role-based access (jobseeker, employer, admin)
- Session management with JWT

### Job Posting System
- Employers can post max 5 active jobs
- Jobs auto-expire after 30 days
- Vercel Cron job runs daily cleanup
- Consulting and contract roles only
- Industry, location, salary filters

### ATS Optimizer
- Freemium model: Free limited analysis, $5 unlock for full access
- Resume upload (PDF/DOCX, max 5MB)
- Keyword extraction and scoring
- ATS compatibility analysis
- Premium features with PDF export

### Payment System
- Stripe checkout integration
- Webhook handler for payment confirmation
- Cookie-based premium access
- Database payment tracking
- One-time and subscription support

### Resume Management
- Vercel Blob storage
- File type and size validation
- Audit trail in database
- User association
- Public URLs with random suffixes

## Legal Compliance

All legal pages included:
- Terms of Service
- Privacy Policy
- Legal Disclaimer
- Cookie consent banner
- Footer disclaimers

Compliance features:
- No employment guarantees stated
- Consulting & contract only messaging
- AI tool limitations disclosed
- Geographic restrictions (USA & Canada)
- Industry specialization stated

## Performance

- Server-side rendering (SSR)
- Static generation where possible
- Image optimization
- Code splitting
- Vercel Edge Network
- Database connection pooling

## Security

- NextAuth.js session management
- Stripe webhook signature verification
- SQL injection protection (parameterized queries)
- File upload validation
- Role-based access control
- Environment variable protection

## Support

For issues or questions:
1. Check documentation in `/docs`
2. Review API reference
3. Run Playwright tests to verify setup
4. Check Vercel logs for errors

## License

Proprietary - STAR Workforce Solutions

---

**Built with v0 by Vercel**
\`\`\`
