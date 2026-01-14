# Career Accel Platform - Technical Overview

**Version:** 1.0  
**Project Name:** Career Accel Platform (STAR Workforce Solutions)  
**Website:** www.starworkforcesolutions.com  
**Last Updated:** December 2024

---

## Table of Contents

1. [Code Location and Access](#code-location-and-access)
2. [Database Architecture](#database-architecture)
3. [Project Structure](#project-structure)
4. [Technology Stack](#technology-stack)
5. [Environment Variables](#environment-variables)
6. [API Routes](#api-routes)
7. [Database Schema Details](#database-schema-details)
8. [Storage Systems](#storage-systems)
9. [Deployment Information](#deployment-information)
10. [Development Workflow](#development-workflow)

---

## Code Location and Access

### Where is the Code?

Your code is currently stored in **v0 (Vercel's AI Code Editor)** in a workspace called **"Job seeker platform"**.

**To download the code:**
1. Click the **three dots (⋯)** in the top-right corner of any code block
2. Select **"Download ZIP"**
3. Extract the ZIP file to your local machine
4. Open in your preferred code editor (VS Code, WebStorm, etc.)

**To deploy the code:**
1. Click the **"Publish"** button in v0
2. Connect to your Vercel account
3. Optionally connect to GitHub for version control
4. Code will be automatically deployed to production

### Current Deployment

**Production URL:** https://www.starworkforcesolutions.com  
**Hosting Platform:** Vercel  
**DNS Provider:** GoDaddy (configured with Vercel DNS records)

---

## Database Architecture

### Database Provider: Neon PostgreSQL

**Status:** ✅ CONNECTED AND ACTIVE

**Database Details:**
- **Type:** PostgreSQL 16
- **Provider:** Neon (Serverless Postgres)
- **Connection:** Configured via environment variables
- **Total Tables:** 13 active tables

### Why Neon?

- Serverless architecture (auto-scaling)
- PostgreSQL compatibility (standard SQL)
- Fast queries with connection pooling
- Built-in branching for development/staging
- Free tier with generous limits

---

## Project Structure

```
career-accel-platform/
│
├── app/                                    # Next.js App Router
│   ├── api/                                # Backend API Routes
│   │   ├── ats-upload/route.ts             # Upload resume for ATS analysis
│   │   ├── ats-free/route.ts               # Free ATS preview (score + 3 keywords)
│   │   ├── ats-full/route.ts               # Paid ATS full report ($5)
│   │   ├── ats-restore/route.ts            # Restore ATS premium access
│   │   ├── ats-purchase/route.ts           # Stripe checkout for ATS
│   │   ├── cover-letter-upload/route.ts    # Upload resume for cover letter
│   │   ├── cover-letter-full/route.ts      # Generate cover letter (free/paid)
│   │   ├── cover-letter-restore/route.ts   # Restore cover letter access
│   │   ├── cover-letter-purchase/route.ts  # Stripe checkout for cover letter
│   │   ├── interview-prep-start/route.ts   # Start interview prep quiz
│   │   ├── interview-prep-submit/route.ts  # Submit quiz answers
│   │   └── stripe/webhook/route.ts         # Stripe webhook handler
│   │
│   ├── tools/                              # Tool Pages
│   │   ├── ats-optimizer/page.tsx          # ATS Optimizer tool
│   │   ├── cover-letter/page.tsx           # Cover Letter Generator
│   │   └── interview-prep/page.tsx         # Interview Prep (FREE)
│   │
│   ├── legal/                              # Legal Pages
│   │   ├── terms/page.tsx                  # Terms of Service
│   │   ├── privacy/page.tsx                # Privacy Policy
│   │   └── disclaimer/page.tsx             # Disclaimer
│   │
│   ├── auth/                               # Authentication Pages
│   │   ├── login/page.tsx                  # Login page
│   │   └── signup/page.tsx                 # Signup page
│   │
│   ├── employer/                           # Employer Features
│   │   ├── register/page.tsx               # Employer registration
│   │   └── dashboard/page.tsx              # Employer dashboard
│   │
│   ├── dashboard/                          # User Dashboard
│   │   └── page.tsx                        # User dashboard (applications, etc.)
│   │
│   ├── page.tsx                            # Homepage
│   ├── services/                           # Services page
│   │   ├── page.tsx
│   │   └── ServicesClient.tsx
│   ├── pricing/page.tsx                    # Pricing page
│   ├── jobs/page.tsx                       # Job board
│   ├── contact/page.tsx                    # Contact form
│   ├── layout.tsx                          # Root layout
│   ├── globals.css                         # Global styles (Tailwind CSS)
│   ├── sitemap.ts                          # SEO sitemap
│   └── robots.ts                           # SEO robots.txt
│
├── components/                             # Reusable Components
│   ├── navigation.tsx                      # Header navigation
│   ├── footer.tsx                          # Footer with links
│   ├── ats-optimizer-client.tsx            # ATS tool client logic
│   ├── cover-letter-client.tsx             # Cover letter tool client logic
│   ├── interview-prep-client.tsx           # Interview prep client logic
│   └── ui/                                 # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── ... (50+ components)
│
├── lib/                                    # Utility Libraries
│   ├── auth.ts                             # NextAuth configuration
│   └── utils.ts                            # Helper functions
│
├── scripts/                                # Database Scripts
│   └── 008_interview_prep_tables.sql       # SQL migration scripts
│
├── docs/                                   # Documentation
│   ├── PROJECT_DESCRIPTION.md              # Plain English documentation
│   └── TECHNICAL_OVERVIEW.md               # This file
│
├── public/                                 # Static Assets
│   ├── images/                             # Images
│   ├── favicon.svg                         # Favicon
│   └── icon-*.jpg                          # PWA icons
│
├── middleware.ts                           # Next.js middleware (www redirect)
├── next.config.mjs                         # Next.js configuration
├── package.json                            # Dependencies
└── tsconfig.json                           # TypeScript configuration
```

---

## Technology Stack

### Frontend
- **Framework:** Next.js 16.0.10 (React 19.2)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Fonts:** Montserrat (headings), Open Sans (body)

### Backend
- **Runtime:** Next.js API Routes (serverless functions)
- **Database:** Neon PostgreSQL
- **ORM/Query:** Direct SQL with `@neondatabase/serverless`
- **File Storage:** Vercel Blob
- **Payments:** Stripe API

### Hosting & Infrastructure
- **Hosting:** Vercel
- **Domain:** GoDaddy (DNS configured to Vercel)
- **CDN:** Vercel Edge Network
- **SSL:** Automatic HTTPS via Vercel

### Third-Party Services
- **Stripe:** Payment processing
- **Neon:** PostgreSQL database
- **Vercel Blob:** File storage
- **Google Analytics:** Traffic tracking

---

## Environment Variables

### Current Environment Variables (Configured in Vercel)

**Database (Neon):**
```
DATABASE_URL                    # Main database connection
POSTGRES_URL                    # Pooled connection
POSTGRES_PRISMA_URL             # Prisma-specific URL
POSTGRES_URL_NON_POOLING        # Direct connection (no pool)
POSTGRES_HOST                   # Database host
POSTGRES_USER                   # Database user
POSTGRES_PASSWORD               # Database password
POSTGRES_DATABASE               # Database name
NEON_PROJECT_ID                 # Neon project identifier
```

**Stripe (Payments):**
```
STRIPE_SECRET_KEY               # Stripe secret key (server-side)
STRIPE_PUBLISHABLE_KEY          # Stripe publishable key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  # Client-side Stripe key
STRIPE_WEBHOOK_SECRET           # Webhook signature verification
```

**Vercel Blob (File Storage):**
```
BLOB_READ_WRITE_TOKEN           # Vercel Blob access token
```

**Email (Contact Form):**
```
EMAIL_SERVER_HOST               # SMTP server host
EMAIL_SERVER_PORT               # SMTP port (587 or 465)
EMAIL_SERVER_USER               # SMTP username
EMAIL_SERVER_PASSWORD           # SMTP password
EMAIL_FROM                      # From email address
```

**Authentication (NextAuth - Currently Disabled):**
```
NEXTAUTH_SECRET                 # Session encryption key
GOOGLE_CLIENT_ID                # Google OAuth client ID
GOOGLE_CLIENT_SECRET            # Google OAuth secret
LINKEDIN_CLIENT_ID              # LinkedIn OAuth client ID
LINKEDIN_CLIENT_SECRET          # LinkedIn OAuth secret
```

**Other:**
```
NEXT_PUBLIC_URL                 # Public site URL
NEXT_PUBLIC_GA_ID               # Google Analytics ID
CRON_SECRET                     # Cron job authentication
```

---

## API Routes

### ATS Optimizer APIs

**`/api/ats-upload` (POST)**
- Uploads resume file
- Converts to base64 and stores in database
- Returns upload ID

**`/api/ats-free` (POST)**
- Generates FREE ATS preview
- Returns score + 3 keyword suggestions
- No payment required

**`/api/ats-full` (POST)**
- Generates FULL ATS report (paid users only)
- Returns 3-5 page PDF with detailed analysis
- Requires premium access cookie or valid email

**`/api/ats-restore` (POST)**
- Restores premium access for paid users
- Checks database first, then Stripe API
- Sets premium cookies if payment found
- Returns success or prompts to pay $5

**`/api/ats-purchase` (POST)**
- Creates Stripe checkout session
- Redirects to Stripe payment page
- Price: $5 one-time (priceId: `price_1SVd4E04KnTBJoOrBcQTH6T5`)

### Cover Letter APIs

**`/api/cover-letter-upload` (POST)**
- Uploads resume to Vercel Blob
- Stores URL in database
- Returns upload ID

**`/api/cover-letter-full` (POST)**
- Generates cover letter (free template or paid custom)
- Requires resume URL and job description
- Returns formatted cover letter text

**`/api/cover-letter-restore` (POST)**
- Restores premium access for paid users
- Checks database and Stripe
- Price ID: `price_1SWUhp04KnTBJoOrG8W8C8OK`

**`/api/cover-letter-purchase` (POST)**
- Creates Stripe checkout session for cover letter
- Price: $5 one-time

### Interview Prep APIs

**`/api/interview-prep-start` (POST)**
- Receives job description
- Extracts skills/topics using AI
- Queries database for matching questions
- Generates new questions if needed
- Returns 10 multiple-choice questions

**`/api/interview-prep-submit` (POST)**
- Receives user answers
- Calculates score
- Returns correct answers with explanations
- Saves session to database

### Stripe Webhook

**`/api/stripe/webhook` (POST)**
- Receives payment events from Stripe
- Verifies webhook signature
- On `checkout.session.completed`:
  - Extracts customer email and line items
  - Inserts record into `premium_access` table
  - Links payment to correct product (ATS or Cover Letter)

---

## Database Schema Details

### Table: `users`
Stores user account information.

**Columns:**
- `id` (uuid, PRIMARY KEY) - Unique user identifier
- `email` (text, UNIQUE) - User email address
- `name` (text) - User full name
- `role` (text) - User role (user, employer, admin)
- `atsPremium` (boolean) - Legacy premium flag
- `emailVerified` (timestamp) - Email verification timestamp
- `createdAt` (timestamp) - Account creation date

**Purpose:** User authentication and account management

---

### Table: `premium_access`
Tracks all $5 one-time payments for ATS and Cover Letter tools.

**Columns:**
- `id` (uuid, PRIMARY KEY) - Unique record identifier
- `email` (text) - Customer email (used for restore)
- `product` (varchar) - Product type (`ATS_OPTIMIZER` or `COVER_LETTER`)
- `priceId` (text) - Stripe price ID (enforces product separation)
- `stripeCustomerId` (text) - Stripe customer ID
- `stripeSessionId` (text) - Stripe checkout session ID
- `resumeId` (uuid) - Associated resume (for ATS)
- `paidAt` (timestamp) - Payment completion date
- `expiresAt` (timestamp) - Expiration date (NULL = lifetime)

**Purpose:** Payment tracking, restore access validation

**Critical:** `priceId` column ensures strict product separation:
- ATS: `price_1SVd4E04KnTBJoOrBcQTH6T5`
- Cover Letter: `price_1SWUhp04KnTBJoOrG8W8C8OK`

---

### Table: `resume_uploads`
Stores resume files as base64 text for ATS analysis.

**Columns:**
- `id` (uuid, PRIMARY KEY) - Upload identifier
- `userId` (uuid) - User who uploaded (nullable)
- `fileName` (text) - Original file name
- `fileType` (text) - File MIME type (e.g., application/pdf)
- `fileContent` (text) - Base64-encoded file content
- `email` (text) - Email associated with upload
- `analysisCache` (jsonb) - Cached analysis results (NOT USED - caching disabled)
- `uploadedAt` (timestamp) - Upload timestamp
- `expiresAt` (timestamp) - Auto-deletion date (optional)

**Purpose:** Store resumes for ATS analysis

**Why base64?** Keeps everything in one database, no external file dependencies

---

### Table: `cover_letter_uploads`
Stores cover letter generation data.

**Columns:**
- `id` (uuid, PRIMARY KEY) - Upload identifier
- `resume_url` (text) - Vercel Blob URL of resume
- `resume_filename` (varchar) - Original filename
- `job_description` (text) - Job description text
- `generated_cover_letter` (text) - Generated cover letter content
- `email` (varchar) - User email
- `tone_score` (integer) - Letter quality score (0-100)
- `uploaded_at` (timestamp) - Upload timestamp

**Purpose:** Store resume URLs and generated cover letters

---

### Table: `interview_questions`
Reusable bank of interview quiz questions.

**Columns:**
- `id` (uuid, PRIMARY KEY) - Question identifier
- `question` (text) - Question text
- `option_a` (text) - Answer option A
- `option_b` (text) - Answer option B
- `option_c` (text) - Answer option C
- `option_d` (text) - Answer option D
- `correct_option` (text) - Correct answer (A, B, C, or D)
- `explanation` (text) - Why this answer is correct
- `skill` (text) - Skill tested (e.g., "JavaScript", "SQL")
- `topic` (text) - Topic category (e.g., "software development")
- `difficulty` (text) - Difficulty level (easy, medium, hard)
- `createdAt` (timestamp) - Creation date

**Purpose:** Reusable question bank to reduce AI costs

**Query Pattern:**
```sql
SELECT * FROM interview_questions 
WHERE skill IN ('Python', 'SQL', 'APIs') 
LIMIT 10
```

---

### Table: `interview_sessions`
Tracks each quiz attempt.

**Columns:**
- `id` (uuid, PRIMARY KEY) - Session identifier
- `email` (text) - User email (nullable)
- `jobDescription` (text) - Job description analyzed
- `skills` (jsonb) - Extracted skills (JSON array)
- `score` (integer) - Number of correct answers (0-10)
- `total_questions` (integer) - Total questions (always 10)
- `percentage` (numeric) - Score as percentage (0-100)
- `completed` (boolean) - Whether quiz was completed
- `createdAt` (timestamp) - Session start time
- `completedAt` (timestamp) - Session completion time

**Purpose:** Track quiz performance and analytics

---

### Table: `interview_answers`
Stores individual answers for each session.

**Columns:**
- `id` (uuid, PRIMARY KEY) - Answer identifier
- `sessionId` (uuid, FOREIGN KEY) - Links to `interview_sessions`
- `questionId` (uuid, FOREIGN KEY) - Links to `interview_questions`
- `user_answer` (text) - User's selected answer (A, B, C, or D)
- `is_correct` (boolean) - Whether answer was correct
- `answeredAt` (timestamp) - Answer timestamp

**Purpose:** Detailed answer tracking for analytics

---

### Table: `jobs`
Stores job postings from employers.

**Columns:**
- `id` (uuid, PRIMARY KEY) - Job identifier
- `employerId` (uuid) - Employer who posted job
- `title` (text) - Job title
- `description` (text) - Full job description
- `location` (text) - Job location
- `salaryMin` (integer) - Minimum salary
- `salaryMax` (integer) - Maximum salary
- `employmentType` (text) - Job type (full-time, contract, etc.)
- `industry` (text) - Industry category
- `visa` (text) - Visa sponsorship info
- `isActive` (boolean) - Whether job is still open
- `createdAt` (timestamp) - Post date
- `expiresAt` (timestamp) - Expiration date

**Purpose:** Job board listings

---

### Table: `applications`
Tracks all job applications.

**Columns:**
- `id` (uuid, PRIMARY KEY) - Application identifier
- `userId` (uuid) - User who applied
- `jobId` (uuid, FOREIGN KEY) - Job applied to
- `status` (text) - Application status (submitted, under_review, rejected, etc.)
- `notes` (text) - Employer notes
- `appliedAt` (timestamp) - Application date
- `updatedAt` (timestamp) - Last status change

**Purpose:** Track applications and status

---

### Table: `application_limits`
Enforces 5 applications per day limit for free users.

**Columns:**
- `id` (uuid, PRIMARY KEY) - Record identifier
- `userId` (uuid) - User identifier
- `date` (date) - Date of applications
- `count` (integer) - Number of applications on this date

**Purpose:** Rate limiting

**Query Pattern:**
```sql
SELECT count FROM application_limits 
WHERE userId = $1 AND date = CURRENT_DATE
```

---

### Table: `saved_jobs`
Tracks jobs saved/bookmarked by users.

**Columns:**
- `id` (uuid, PRIMARY KEY) - Record identifier
- `userId` (uuid) - User who saved job
- `jobId` (uuid, FOREIGN KEY) - Job saved
- `savedAt` (timestamp) - Save date

**Purpose:** Job bookmarking feature

---

### Table: `resumes`
Alternative resume storage (file URLs).

**Columns:**
- `id` (uuid, PRIMARY KEY) - Resume identifier
- `userId` (uuid) - Resume owner
- `fileUrl` (text) - Vercel Blob URL
- `createdAt` (timestamp) - Upload date

**Purpose:** Store resume file URLs for general use

---

### Table: `payments`
General payment tracking (alternative to `premium_access`).

**Columns:**
- `id` (uuid, PRIMARY KEY) - Payment identifier
- `userId` (uuid) - User who paid
- `amount` (integer) - Amount in cents (e.g., 500 = $5)
- `product` (text) - Product purchased
- `stripeSessionId` (text) - Stripe session ID
- `createdAt` (timestamp) - Payment date

**Purpose:** General payment records

---

## Storage Systems

### 1. Neon PostgreSQL (Primary Database)

**What is stored:**
- User accounts
- Payment records
- Resume text (base64)
- Job postings
- Applications
- Interview questions
- Quiz sessions

**Connection:**
```typescript
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

// Query example
const result = await sql`
  SELECT * FROM users WHERE email = ${email}
`
```

**Why Neon?**
- Serverless (auto-scales)
- Fast queries
- Standard PostgreSQL
- Built-in connection pooling

---

### 2. Vercel Blob (File Storage)

**What is stored:**
- Cover letter resumes (PDF/Word files)
- Employer logos
- Future: User profile pictures

**Upload Example:**
```typescript
import { put } from '@vercel/blob'

const blob = await put(fileName, file, {
  access: 'public',
  token: process.env.BLOB_READ_WRITE_TOKEN
})

console.log(blob.url) // https://blob.vercel-storage.com/...
```

**Why Vercel Blob?**
- Cheap ($0.15/GB)
- Fast CDN delivery
- No database bloat
- Automatic expiration support

---

### 3. In-Database Base64 (ATS Resumes)

**Why store resumes as base64 in the database?**
- Single storage location (no file sync issues)
- Fast queries (no external API calls)
- Simple restore logic (one table query)
- No dependency on Blob storage

**Conversion:**
```typescript
// File to base64
const buffer = await file.arrayBuffer()
const base64 = Buffer.from(buffer).toString('base64')

// Base64 to file
const buffer = Buffer.from(base64, 'base64')
```

---

## Deployment Information

### Current Deployment

**Production URL:** https://www.starworkforcesolutions.com  
**Staging/Preview:** Automatic preview URLs on every code change  
**Hosting:** Vercel  
**DNS:** GoDaddy (A and CNAME records configured)

### Deployment Process

**From v0:**
1. Click "Publish" button
2. Connect to Vercel account
3. Automatic deployment to production
4. Instant live updates

**From Local:**
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel login`
3. Run: `vercel deploy --prod`

### Environment Variables Setup

All environment variables are configured in:
- Vercel Project Settings → Environment Variables
- Automatically injected during build and runtime
- No `.env` files needed in production

---

## Development Workflow

### How to Work on This Project

**Step 1: Download Code**
- Download ZIP from v0 or clone from GitHub

**Step 2: Install Dependencies**
```bash
npm install
```

**Step 3: Set Up Environment Variables**
Create `.env.local` file with all required variables (see Environment Variables section above)

**Step 4: Run Development Server**
```bash
npm run dev
```
Visit: http://localhost:3000

**Step 5: Make Changes**
- Edit files in your code editor
- Changes auto-reload in browser

**Step 6: Test Locally**
- Test all features
- Check browser console for errors
- Test Stripe in test mode

**Step 7: Deploy**
- Push to GitHub (if connected)
- Or upload to v0 and click "Publish"
- Vercel automatically deploys

---

## Key Code Patterns

### Database Queries

```typescript
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// SELECT query
const users = await sql`
  SELECT * FROM users WHERE email = ${email}
`

// INSERT query
await sql`
  INSERT INTO premium_access (email, product, priceId, paidAt)
  VALUES (${email}, ${product}, ${priceId}, ${new Date().toISOString()})
`

// UPDATE query
await sql`
  UPDATE users 
  SET name = ${name} 
  WHERE id = ${userId}
`
```

### Stripe Checkout

```typescript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Create checkout session
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price: 'price_1SVd4E04KnTBJoOrBcQTH6T5', // ATS price ID
    quantity: 1,
  }],
  mode: 'payment',
  success_url: `${process.env.NEXT_PUBLIC_URL}/tools/ats-optimizer?success=true&email=${email}`,
  cancel_url: `${process.env.NEXT_PUBLIC_URL}/tools/ats-optimizer`,
  customer_email: email,
})

return session.url // Redirect user here
```

### Vercel Blob Upload

```typescript
import { put } from '@vercel/blob'

const blob = await put(file.name, file, {
  access: 'public',
  token: process.env.BLOB_READ_WRITE_TOKEN,
})

const fileUrl = blob.url
```

---

## Summary

**Code Location:** v0 workspace → Download ZIP or deploy to Vercel  
**Database:** Neon PostgreSQL with 13 active tables  
**File Storage:** Vercel Blob for large files, base64 in database for ATS resumes  
**Payments:** Stripe with strict product separation via `priceId`  
**Hosting:** Vercel with automatic deployments  
**Domain:** www.starworkforcesolutions.com (GoDaddy DNS)

All features are operational and connected. Database schema is complete and normalized. Environment variables are configured in Vercel. No code changes needed for production.

---

**For questions or support, contact:** support@starworkforcesolutions.com

**End of Document**
