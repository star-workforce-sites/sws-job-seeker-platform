# Code Location and Database Information

**Project Name:** Career Accel Platform (STAR Workforce Solutions)  
**Website:** www.starworkforcesolutions.com  
**Last Updated:** December 2024

---

## Table of Contents

1. [Where is the Code Located?](#where-is-the-code-located)
2. [How to Download the Code](#how-to-download-the-code)
3. [Database Information](#database-information)
4. [Project Structure](#project-structure)
5. [Environment Variables](#environment-variables)
6. [Storage Systems](#storage-systems)
7. [API Routes Reference](#api-routes-reference)
8. [Database Tables Reference](#database-tables-reference)
9. [How to Deploy](#how-to-deploy)
10. [How to Run Locally](#how-to-run-locally)

---

## Where is the Code Located?

### Current Location: v0 Cloud Workspace

Your code is currently stored in **v0 (Vercel's AI code editor)** in a workspace called **"Job seeker platform"**.

**What this means:**
- The code exists in the cloud on v0's servers
- It's not on your local computer yet
- It's already connected to your database and integrations
- It's ready to deploy to Vercel at any time

**Access:**
- You're viewing and editing it through v0.app
- All changes are auto-saved in the v0 workspace
- You can download it as a ZIP file anytime
- You can deploy it to Vercel with one click

---

## How to Download the Code

### Method 1: Download ZIP from v0

1. Look for the **code block** in your v0 chat
2. Find the **three vertical dots (⋯)** in the top-right corner of the code block
3. Click the three dots
4. Select **"Download ZIP"**
5. Save the ZIP file to your computer
6. Extract the ZIP file
7. You now have the full codebase locally

**The downloaded file will be named:** `v0-export-[timestamp].zip` or similar

### Method 2: Deploy to GitHub

1. Click the **"Publish"** button in v0 (top-right)
2. Connect your GitHub account
3. Choose "Create new repository"
4. Name your repository (e.g., "career-accel-platform")
5. Click "Publish"
6. Your code is now on GitHub
7. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/your-username/career-accel-platform.git
   ```

### Method 3: Deploy to Vercel First, Then Download

1. Click **"Publish"** in v0
2. Deploy to Vercel
3. Go to Vercel dashboard
4. Find your project
5. Go to Settings → Git
6. View the connected GitHub repository
7. Clone from GitHub

---

## Database Information

### Database Provider: Neon PostgreSQL

**Status:** ✅ ACTIVE and fully connected

**Database Details:**
- **Provider:** Neon (https://neon.tech)
- **Type:** PostgreSQL (Serverless)
- **Project ID:** `still-scene-80287420`
- **Connection:** Configured via environment variables

### How to Access Your Database

**Option 1: Neon Dashboard**
1. Go to https://neon.tech
2. Log in with your account
3. Select your project: `still-scene-80287420`
4. Click "SQL Editor" to run queries
5. Click "Tables" to view all tables

**Option 2: Local Database Client**
Use tools like:
- pgAdmin
- DBeaver
- TablePlus
- DataGrip

**Connection String:**
Use the `DATABASE_URL` from your environment variables (see section below)

### Database Tables (13 Total)

1. **users** - User accounts
2. **premium_access** - Tracks $5 payments (ATS & Cover Letter)
3. **resume_uploads** - Stores resumes for ATS tool (base64)
4. **cover_letter_uploads** - Cover letter generation data
5. **interview_questions** - Quiz question bank (reusable)
6. **interview_sessions** - Quiz attempt tracking
7. **interview_answers** - Individual quiz answers
8. **jobs** - Job postings
9. **applications** - Job applications
10. **application_limits** - Rate limiting (5 apps/day)
11. **saved_jobs** - Bookmarked jobs
12. **resumes** - Resume file URLs
13. **payments** - Payment records

### How Code Connects to Database

```typescript
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

// Example query
const users = await sql`SELECT * FROM users WHERE email = ${email}`
```

---

## Project Structure

### Root Directory Structure

```
career-accel-platform/
├── app/                          # Next.js App Router
│   ├── api/                      # Backend API routes
│   ├── tools/                    # Tool pages (ATS, Cover Letter, Interview Prep)
│   ├── legal/                    # Legal pages (Terms, Privacy, Disclaimer)
│   ├── auth/                     # Authentication pages
│   ├── employer/                 # Employer features
│   ├── dashboard/                # User dashboard
│   ├── page.tsx                  # Homepage
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components (buttons, cards, etc.)
│   ├── navigation.tsx            # Header navigation
│   ├── footer.tsx                # Footer
│   ├── ats-optimizer-client.tsx  # ATS tool logic
│   ├── cover-letter-client.tsx   # Cover letter tool logic
│   └── interview-prep-client.tsx # Interview prep logic
│
├── lib/                          # Utility functions
│   ├── utils.ts                  # Helper functions
│   └── auth.ts                   # Authentication logic
│
├── scripts/                      # Database migration scripts
│   └── 008_interview_prep_tables.sql
│
├── docs/                         # Documentation
│   ├── PROJECT_DESCRIPTION.md
│   └── CODE_LOCATION_AND_DATABASE.md
│
├── public/                       # Static assets
│   └── images/                   # Image files
│
├── middleware.ts                 # Middleware (www redirect, etc.)
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
└── tailwind.config.ts            # Tailwind CSS configuration
```

### App Directory (Detailed)

```
app/
├── api/                          # Backend API Routes
│   ├── ats-upload/route.ts       # Upload resume for ATS
│   ├── ats-free/route.ts         # Free ATS preview
│   ├── ats-full/route.ts         # Paid ATS full report
│   ├── ats-restore/route.ts      # Restore ATS access
│   ├── ats-purchase/route.ts     # Stripe payment for ATS
│   ├── cover-letter-upload/route.ts
│   ├── cover-letter-full/route.ts
│   ├── cover-letter-restore/route.ts
│   ├── cover-letter-purchase/route.ts
│   ├── interview-prep-start/route.ts
│   ├── interview-prep-submit/route.ts
│   └── stripe/webhook/route.ts   # Stripe webhook handler
│
├── tools/                        # Tool Pages
│   ├── ats-optimizer/page.tsx    # ATS Optimizer tool
│   ├── cover-letter/page.tsx     # Cover Letter Generator
│   └── interview-prep/page.tsx   # Interview Prep tool
│
├── legal/                        # Legal Pages
│   ├── terms/page.tsx            # Terms of Service
│   ├── privacy/page.tsx          # Privacy Policy
│   └── disclaimer/page.tsx       # Disclaimer
│
├── auth/                         # Authentication
│   ├── login/page.tsx            # Login page
│   └── signup/page.tsx           # Signup page
│
├── employer/                     # Employer Features
│   ├── register/page.tsx         # Employer registration
│   └── dashboard/page.tsx        # Employer dashboard
│
├── dashboard/                    # User Dashboard
│   ├── page.tsx                  # Main dashboard
│   └── analytics/page.tsx        # Analytics
│
├── admin/                        # Admin Panel
│   └── panel/page.tsx            # Admin dashboard
│
├── services/                     # Services
│   ├── page.tsx                  # Services page
│   └── ServicesClient.tsx        # Services client component
│
├── pricing/page.tsx              # Pricing page
├── jobs/page.tsx                 # Job board
├── contact/page.tsx              # Contact form
├── distribution-wizard/page.tsx  # Bulk job application
├── page.tsx                      # Homepage
├── layout.tsx                    # Root layout
├── globals.css                   # Global styles
├── sitemap.ts                    # SEO sitemap
└── robots.ts                     # SEO robots.txt
```

### Components Directory

```
components/
├── ui/                           # shadcn/ui Components
│   ├── button.tsx                # Button component
│   ├── card.tsx                  # Card component
│   ├── input.tsx                 # Input component
│   ├── dialog.tsx                # Modal dialog
│   ├── toast.tsx                 # Toast notifications
│   ├── badge.tsx                 # Badge component
│   └── [50+ more UI components]
│
├── navigation.tsx                # Header navigation bar
├── footer.tsx                    # Footer with links
├── ats-optimizer-client.tsx      # ATS tool logic (upload, analyze, payment)
├── cover-letter-client.tsx       # Cover letter logic (upload, generate, payment)
├── interview-prep-client.tsx     # Interview prep logic (quiz, scoring)
├── contact-form-client.tsx       # Contact form logic
└── hero-section.tsx              # Homepage hero section
```

---

## Environment Variables

### Current Environment Variables (Already Configured)

Your project has these environment variables set in Vercel:

**Database (Neon):**
- `DATABASE_URL` - Main connection string
- `POSTGRES_URL` - Pooled connection
- `POSTGRES_PRISMA_URL` - Prisma-specific connection
- `POSTGRES_URL_NON_POOLING` - Direct connection
- `POSTGRES_URL_NO_SSL` - No SSL connection
- `POSTGRES_HOST` - Database host
- `POSTGRES_USER` - Database username
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DATABASE` - Database name
- `NEON_PROJECT_ID` - Neon project ID

**Stripe (Payments):**
- `STRIPE_SECRET_KEY` - Stripe secret API key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Client-side Stripe key
- `STRIPE_WEBHOOK_SECRET` - Webhook signature verification
- `STRIPE_MCP_KEY` - Stripe MCP key

**File Storage (Vercel Blob):**
- `BLOB_READ_WRITE_TOKEN` - Blob storage access token

**Email (SMTP):**
- `EMAIL_SERVER_HOST` - SMTP server host
- `EMAIL_SERVER_PORT` - SMTP server port
- `EMAIL_SERVER_USER` - SMTP username
- `EMAIL_SERVER_PASSWORD` - SMTP password
- `EMAIL_FROM` - Sender email address

**Authentication (NextAuth - For Future Use):**
- `NEXTAUTH_SECRET` - NextAuth encryption secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `LINKEDIN_CLIENT_ID` - LinkedIn OAuth client ID
- `LINKEDIN_CLIENT_SECRET` - LinkedIn OAuth client secret

**Other:**
- `NEXT_PUBLIC_URL` - Public website URL
- `NEXT_PUBLIC_GA_ID` - Google Analytics ID
- `CRON_SECRET` - Cron job authentication
- `CI` - CI/CD flag

### How to View Environment Variables

**In v0:**
- Look at the **Vars** section in the in-chat sidebar

**In Vercel:**
1. Go to your Vercel project dashboard
2. Click **Settings**
3. Click **Environment Variables**
4. View all variables

**Locally (.env.local file):**
When you download the code and run it locally, create a `.env.local` file:

```bash
# Database
DATABASE_URL=your_neon_connection_string

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# Email
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_email@gmail.com
EMAIL_SERVER_PASSWORD=your_app_password
EMAIL_FROM=noreply@starworkforcesolutions.com

# NextAuth
NEXTAUTH_SECRET=your_random_secret_string

# Public URL
NEXT_PUBLIC_URL=http://localhost:3000
```

---

## Storage Systems

### 1. Neon PostgreSQL (Database)

**Used For:**
- User accounts
- Payment records
- Job postings and applications
- Interview quiz questions
- ATS resume data (stored as base64 text)

**Connection:**
```typescript
import { neon } from '@neondatabase/serverless'
const sql = neon(process.env.DATABASE_URL)
```

### 2. Vercel Blob (File Storage)

**Used For:**
- Cover letter resumes (PDF files)
- Employer logos
- User profile pictures (future)

**Connection:**
```typescript
import { put } from '@vercel/blob'
const blob = await put('filename.pdf', file, { access: 'public' })
```

### 3. Stripe (Payment Data)

**Used For:**
- Payment processing
- Customer records
- Checkout sessions
- Payment history

**Connection:**
```typescript
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
```

---

## API Routes Reference

### ATS Optimizer APIs

**POST /api/ats-upload**
- Upload resume file
- Stores resume as base64 in database
- Returns upload ID

**POST /api/ats-free**
- Generate free preview (score + 3 keywords)
- No payment required

**POST /api/ats-full**
- Generate full report (3-5 pages)
- Requires premium access
- Returns detailed analysis

**POST /api/ats-restore**
- Restore premium access
- Checks database and Stripe
- Sets cookies if valid

**POST /api/ats-purchase**
- Create Stripe checkout session
- Redirects to Stripe payment page
- Price: $5 (price_1SVd4E04KnTBJoOrBcQTH6T5)

### Cover Letter APIs

**POST /api/cover-letter-upload**
- Upload resume to Vercel Blob
- Returns upload ID and blob URL

**POST /api/cover-letter-full**
- Generate custom cover letter
- Requires premium access
- Returns formatted letter

**POST /api/cover-letter-restore**
- Restore premium access
- Checks database and Stripe
- Sets cookies if valid

**POST /api/cover-letter-purchase**
- Create Stripe checkout session
- Price: $5 (price_1SWUhp04KnTBJoOrG8W8C8OK)

### Interview Prep APIs

**POST /api/interview-prep-start**
- Parse job description
- Extract skills and topics
- Fetch or generate quiz questions
- Returns 10 questions

**POST /api/interview-prep-submit**
- Submit quiz answers
- Calculate score
- Return results with explanations

### Stripe Webhook

**POST /api/stripe/webhook**
- Handles Stripe events
- `checkout.session.completed` - Save payment to database
- Verifies webhook signature

---

## Database Tables Reference

### Table: users

**Columns:**
- `id` (UUID, primary key)
- `email` (VARCHAR, unique)
- `name` (VARCHAR)
- `created_at` (TIMESTAMP)

**Purpose:** Store user account information

### Table: premium_access

**Columns:**
- `id` (UUID, primary key)
- `email` (VARCHAR)
- `priceId` (VARCHAR) - Stripe price ID
- `product` (VARCHAR) - ATS_OPTIMIZER or COVER_LETTER
- `stripeCustomerId` (VARCHAR)
- `stripeSessionId` (VARCHAR)
- `paidAt` (TIMESTAMP)

**Purpose:** Track $5 payments for ATS and Cover Letter tools

**Key Constraint:** Product separation enforced by `priceId`

### Table: resume_uploads

**Columns:**
- `id` (UUID, primary key)
- `userId` (UUID, nullable)
- `fileName` (VARCHAR)
- `fileContent` (TEXT) - Base64 encoded
- `uploadedAt` (TIMESTAMP)

**Purpose:** Store resumes for ATS Optimizer

### Table: cover_letter_uploads

**Columns:**
- `id` (UUID, primary key)
- `userId` (UUID, nullable)
- `resumeUrl` (VARCHAR) - Vercel Blob URL
- `jobDescription` (TEXT)
- `uploadedAt` (TIMESTAMP)

**Purpose:** Store cover letter generation data

### Table: interview_questions

**Columns:**
- `id` (UUID, primary key)
- `question` (TEXT)
- `optionA` (TEXT)
- `optionB` (TEXT)
- `optionC` (TEXT)
- `optionD` (TEXT)
- `correctAnswer` (VARCHAR) - A, B, C, or D
- `explanation` (TEXT)
- `skill` (VARCHAR) - e.g., "JavaScript"
- `topic` (VARCHAR) - e.g., "Software Development"
- `createdAt` (TIMESTAMP)

**Purpose:** Reusable question bank for interview prep

### Table: interview_sessions

**Columns:**
- `id` (UUID, primary key)
- `jobDescription` (TEXT)
- `skills` (JSON array)
- `questions` (JSON array)
- `answers` (JSON array)
- `score` (INTEGER)
- `createdAt` (TIMESTAMP)

**Purpose:** Track quiz attempts and scores

### Table: jobs

**Columns:**
- `id` (UUID, primary key)
- `title` (VARCHAR)
- `company` (VARCHAR)
- `location` (VARCHAR)
- `salary` (VARCHAR)
- `description` (TEXT)
- `requirements` (TEXT)
- `employerId` (UUID)
- `status` (VARCHAR) - active, closed, filled
- `createdAt` (TIMESTAMP)

**Purpose:** Store job postings

### Table: applications

**Columns:**
- `id` (UUID, primary key)
- `userId` (UUID)
- `jobId` (UUID)
- `resumeUrl` (VARCHAR)
- `coverLetter` (TEXT, nullable)
- `status` (VARCHAR) - submitted, under_review, rejected, interview_scheduled, hired
- `appliedAt` (TIMESTAMP)

**Purpose:** Track job applications

### Table: application_limits

**Columns:**
- `id` (UUID, primary key)
- `userId` (UUID)
- `date` (DATE)
- `count` (INTEGER)

**Purpose:** Enforce 5 applications per day limit

---

## How to Deploy

### Deploy to Vercel (Recommended)

**From v0:**
1. Click **"Publish"** button in v0 (top-right)
2. Sign in with Vercel account
3. Select team/organization
4. Choose project name
5. Click "Deploy"
6. Wait 2-3 minutes
7. Your site is live at `your-project.vercel.app`

**What Happens:**
- Code is deployed to Vercel
- Environment variables are automatically configured
- Database connection is established
- Domain is assigned
- SSL certificate is issued

**Custom Domain:**
- Go to Vercel project settings
- Add custom domain: `www.starworkforcesolutions.com`
- Update DNS records at your domain registrar
- Wait for DNS propagation (15 min - 2 hours)

### Deploy via GitHub

1. Push code to GitHub repository
2. Go to vercel.com
3. Click "Import Project"
4. Select your GitHub repository
5. Configure environment variables
6. Click "Deploy"

---

## How to Run Locally

### Prerequisites

1. **Node.js** (v18 or higher)
   - Download from https://nodejs.org

2. **Package Manager**
   - npm (comes with Node.js)
   - Or install pnpm: `npm install -g pnpm`

3. **Code Editor**
   - VS Code (recommended)
   - Or any text editor

### Steps to Run Locally

**Step 1: Download the Code**
- Download ZIP from v0 or clone from GitHub

**Step 2: Extract and Navigate**
```bash
cd path/to/career-accel-platform
```

**Step 3: Install Dependencies**
```bash
npm install
```

**Step 4: Set Up Environment Variables**
Create a `.env.local` file in the root directory:

```bash
# Copy from Vercel or v0 Vars section
DATABASE_URL=your_neon_connection_string
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

**Step 5: Run Development Server**
```bash
npm run dev
```

**Step 6: Open Browser**
Go to http://localhost:3000

### Common Commands

**Development:**
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

**Database:**
```bash
# Run migration scripts manually
psql $DATABASE_URL < scripts/008_interview_prep_tables.sql
```

---

## Troubleshooting

### Database Connection Issues

**Error: "Database connection failed"**

**Solution:**
1. Check `DATABASE_URL` in `.env.local`
2. Verify Neon project is active
3. Check network/firewall settings

### Stripe Payment Issues

**Error: "No Stripe secret key"**

**Solution:**
1. Add `STRIPE_SECRET_KEY` to `.env.local`
2. Restart dev server

### Build Errors

**Error: "Module not found"**

**Solution:**
```bash
rm -rf node_modules
npm install
```

---

## Support

**For Questions:**
- Email: support@starworkforcesolutions.com
- Check docs folder for detailed documentation

**For Bugs:**
- Check browser console for errors
- Check Vercel logs for server errors
- Review API route logs

---

**End of Document**

Last Updated: December 2024
