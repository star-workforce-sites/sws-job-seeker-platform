# STAR Workforce Solutions - Complete Project Documentation
## Version 1.0 | January 21, 2026

---

# TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Technical Architecture](#2-technical-architecture)
3. [Database Schema](#3-database-schema)
4. [Authentication System](#4-authentication-system)
5. [Payment System (Stripe)](#5-payment-system-stripe)
6. [API Routes Reference](#6-api-routes-reference)
7. [Page Structure](#7-page-structure)
8. [Environment Variables](#8-environment-variables)
9. [Changes Made (Session Log)](#9-changes-made-session-log)
10. [Lessons Learned](#10-lessons-learned)
11. [Known Issues & Future Work](#11-known-issues--future-work)
12. [Troubleshooting Guide](#12-troubleshooting-guide)

---

# 1. PROJECT OVERVIEW

## 1.1 Business Description
STAR Workforce Solutions is a job seeker platform specializing in consulting and contract job placement for Software, AI, ML, Cloud, Cybersecurity, Data Engineering, and DevOps professionals in USA & Canada.

## 1.2 Core Services
| Service | Price | Type | Description |
|---------|-------|------|-------------|
| ATS Optimizer | $5 | One-time | Resume optimization for ATS systems |
| Cover Letter Generator | $5 | One-time | AI-powered cover letter creation |
| Resume Distribution | $149 | One-time | Send resume to 500+ recruiters |
| DIY Job Search Premium | $9.99/mo | Subscription | Unlimited job applications |
| Recruiter Basic | $199/mo | Subscription | 3-5 daily job applications |
| Recruiter Standard | $399/mo | Subscription | 10-15 daily job applications |
| Recruiter Pro | $599/mo | Subscription | 20-30 daily job applications |

## 1.3 User Types
| Role | Database Value | Access Level |
|------|----------------|--------------|
| Job Seeker | `jobseeker` | Dashboard, tools, job applications |
| Employer | `employer` | Post jobs (max 5 active), view candidates |
| Recruiter | `recruiter` | Manage clients, submit applications |
| Admin | `admin` | Full system access |

**CRITICAL:** Database stores `jobseeker` (no underscore), NOT `job_seeker`

## 1.4 URLs
| Environment | URL |
|-------------|-----|
| Production | https://www.starworkforcesolutions.com |
| Vercel Dashboard | https://vercel.com/srikanth-2237s-projects/v0-job-seeker-platform |
| GitHub Repository | https://github.com/star-workforce-sites/sws-job-seeker-platform |
| Stripe Dashboard | https://dashboard.stripe.com/test |
| Neon Database | https://console.neon.tech |

---

# 2. TECHNICAL ARCHITECTURE

## 2.1 Tech Stack
| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 16.0.10 |
| Language | TypeScript | 5.x |
| UI Library | React | 19.2.0 |
| Styling | Tailwind CSS | 3.x |
| Database | PostgreSQL (Neon) | - |
| ORM | Prisma | 6.19.2 |
| Auth | NextAuth.js | 4.24.13 |
| Payments | Stripe | 20.0.0 |
| Email | Resend | - |
| Deployment | Vercel | - |

## 2.2 Project Structure
```
sws-job-seeker-platform/
├── app/                          # Next.js App Router
│   ├── admin/panel/              # Admin panel
│   ├── api/                      # API routes
│   │   ├── auth/                 # NextAuth endpoints
│   │   ├── checkout/             # Payment checkout
│   │   │   ├── guest/            # Guest purchases
│   │   │   └── subscription/     # Subscription checkout
│   │   ├── contact/              # Contact form
│   │   ├── jobs/                 # Job CRUD operations
│   │   ├── stripe/               # Stripe webhook
│   │   └── user/                 # User profile
│   ├── auth/                     # Auth pages
│   │   ├── login/
│   │   ├── register/
│   │   └── error/
│   ├── contact/                  # Contact page
│   ├── dashboard/                # User dashboards
│   │   ├── admin/
│   │   ├── job-seeker/
│   │   └── recruiter/
│   ├── hire-recruiter/           # Recruiter plans page
│   ├── jobs/                     # Job listings
│   ├── pricing/                  # Pricing page
│   ├── services/                 # Services page
│   ├── tools/                    # Tools (ATS, Cover Letter, Interview)
│   │   ├── ats-optimizer/
│   │   ├── cover-letter/
│   │   └── interview-prep/
│   ├── layout.tsx                # Root layout with AuthProvider
│   └── page.tsx                  # Homepage
├── components/                   # React components
│   ├── auth-provider.tsx         # SessionProvider wrapper
│   ├── navigation.tsx            # Session-aware nav
│   ├── footer.tsx
│   ├── contact-form-client.tsx
│   └── ui/                       # shadcn/ui components
├── lib/                          # Utilities
│   ├── auth.ts                   # NextAuth config
│   ├── db.ts                     # Database functions
│   ├── prisma.ts                 # Prisma client
│   ├── stripe.ts                 # Stripe client
│   ├── session.ts                # Session utilities
│   └── send-email.ts             # Resend email
├── prisma/
│   └── schema.prisma             # Database schema
├── scripts/
│   └── add-sample-jobs.sql       # Sample jobs SQL
└── middleware.ts                 # Request middleware
```

## 2.3 Key Design Patterns

### SessionProvider Architecture
```
app/layout.tsx
  └── AuthProvider (components/auth-provider.tsx)
        └── SessionProvider (next-auth/react)
              └── {children}
```
**IMPORTANT:** Only ONE SessionProvider at root level. Child layouts should NOT wrap with SessionProvider again.

### API Route Pattern
```typescript
// Standard API route structure
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  // ALWAYS use authOptions with getServerSession
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // ... rest of handler
}
```

---

# 3. DATABASE SCHEMA

## 3.1 Complete Table List (22 Tables)
| Table | Description |
|-------|-------------|
| users | User accounts |
| accounts | OAuth accounts (NextAuth) |
| sessions | User sessions |
| verification_tokens | Email verification |
| subscriptions | Active subscriptions |
| subscription_history | Subscription changes log |
| payments | Payment records |
| payment_methods | Saved payment methods |
| guest_purchases | Non-logged-in purchases |
| premium_access | Feature access grants |
| jobs | Job postings |
| applications | Job applications |
| saved_jobs | User saved jobs |
| application_limits | Daily application tracking |
| resumes | Resume metadata |
| resume_uploads | Resume files |
| cover_letter_uploads | Cover letter files |
| interview_sessions | Interview prep sessions |
| interview_questions | Interview questions |
| interview_answers | User answers |
| recruiter_assignments | Recruiter-client assignments |
| application_tracking | Recruiter job submissions |

## 3.2 Key Tables Detail

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'jobseeker',  -- jobseeker, employer, recruiter, admin
  "emailVerified" TIMESTAMP,
  image TEXT,
  "atsPremium" BOOLEAN DEFAULT false,
  stripe_customer_id VARCHAR(255),
  phone VARCHAR(50),
  location VARCHAR(255),
  job_title VARCHAR(255),
  skills TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

### subscriptions
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subscription_type VARCHAR(50),  -- diy_premium, recruiter_basic, recruiter_standard, recruiter_pro
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_price_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',  -- active, canceled, past_due
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### jobs
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "employerId" UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  industry VARCHAR(100),
  "employmentType" VARCHAR(50),  -- contract, consulting
  visa BOOLEAN DEFAULT false,
  "salaryMin" INTEGER,
  "salaryMax" INTEGER,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "expiresAt" TIMESTAMP
);

-- TRIGGER: Limits employer to 5 active jobs
CREATE TRIGGER check_employer_job_limit
BEFORE INSERT ON jobs
FOR EACH ROW
EXECUTE FUNCTION check_employer_job_count();
```

### premium_access
```sql
CREATE TABLE premium_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  "stripeCustomerId" VARCHAR(255),
  "stripeSessionId" VARCHAR(255),
  "paidAt" TIMESTAMP DEFAULT NOW(),
  product VARCHAR(100),  -- ATS_OPTIMIZER, COVER_LETTER, RESUME_DISTRIBUTION
  "priceId" VARCHAR(255),
  "resumeId" VARCHAR(255),
  "expiresAt" TIMESTAMP,
  UNIQUE(email, "priceId")
);
```

## 3.3 Database Triggers & Constraints

### Employer Job Limit
- **Trigger:** `check_employer_job_limit`
- **Limit:** 5 active jobs per employer
- **Workaround for sample jobs:** Created 4 system employers (5 jobs each)

### System Employers (for sample jobs)
| Email | Name | Jobs |
|-------|------|------|
| jobs-software@starworkforcesolutions.com | STAR Jobs - Software & Cloud | 5 |
| jobs-aiml@starworkforcesolutions.com | STAR Jobs - AI/ML & Data | 5 |
| jobs-security@starworkforcesolutions.com | STAR Jobs - Security & DevOps | 5 |
| jobs-mobile@starworkforcesolutions.com | STAR Jobs - Mobile & Management | 5 |

---

# 4. AUTHENTICATION SYSTEM

## 4.1 NextAuth Configuration

### Providers
| Provider | Status | Client ID Location |
|----------|--------|-------------------|
| Google | ✅ Active | merianda@starworkforce.net account |
| LinkedIn | ✅ Active | srikanth.thimmayya@gmail.com account |
| Credentials | ⚠️ Placeholder | Not implemented |

### OAuth Redirect URIs
Both providers need these redirect URIs configured:
- `https://www.starworkforcesolutions.com/api/auth/callback/google`
- `https://www.starworkforcesolutions.com/api/auth/callback/linkedin`
- `https://starworkforcesolutions.vercel.app/api/auth/callback/google`
- `https://starworkforcesolutions.vercel.app/api/auth/callback/linkedin`

## 4.2 Session Flow
```
1. User clicks "Sign In with Google"
2. Redirected to Google OAuth
3. Google returns to /api/auth/callback/google
4. NextAuth signIn callback:
   - Checks if user exists in DB
   - Creates user if not exists (role: 'jobseeker')
5. redirect callback returns /dashboard
6. User lands on /dashboard
7. /dashboard checks role and redirects to:
   - /dashboard/job-seeker (jobseeker)
   - /dashboard/admin (admin)
   - /dashboard/recruiter (recruiter)
   - /employer/dashboard (employer)
```

## 4.3 Session Data Structure
```typescript
interface Session {
  user: {
    id: string;          // User UUID
    email: string;
    name: string;
    image?: string;
    role: string;        // jobseeker, employer, recruiter, admin
    atsPremium: boolean; // Has paid for ATS
  }
}
```

## 4.4 Critical Auth Files
| File | Purpose |
|------|---------|
| `lib/auth.ts` | NextAuth configuration with callbacks |
| `components/auth-provider.tsx` | SessionProvider wrapper |
| `app/layout.tsx` | Wraps app with AuthProvider |
| `app/api/auth/[...nextauth]/route.ts` | NextAuth API route |

---

# 5. PAYMENT SYSTEM (STRIPE)

## 5.1 Stripe Account Details
| Setting | Value |
|---------|-------|
| Account ID | acct_1Ovttc04KnTBJoOr |
| Account Name | startekk.net |
| Mode | TEST |
| Test Keys Expire | April 15, 2026 |

## 5.2 API Keys
```
STRIPE_SECRET_KEY=sk_test_51Ovttc04KnTBJoOr4AKXGF9q1e63zlBwHgVqtJ2yzUlsAZUSZzc3OIz83PKRm0VF2RzJnlyMHa8bEtOPfS82V7Kw00ugXuPTcB
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Ovttc04KnTBJoOr8HIhDKDUoDhcxntd8fAPZWs3gy4PU8Jh4n8MhQBuC0an0DNzs1VEQcadfzWg9TMTP5x16BSZ001WgNE9fm
STRIPE_WEBHOOK_SECRET=whsec_MpNFFthE7iKklWWmcAj0Urg4hjJvEc1X
```

## 5.3 Products & Prices
| Product | Product ID | Price ID | Amount | Type |
|---------|-----------|----------|--------|------|
| ATS Optimizer | prod_TnVjF1MvT1OIaX | price_1Spui804KnTBJoOrmwyaBQ2U | $5.00 | One-time |
| Cover Letter Generator | prod_TnVjwwx1qfpt9O | price_1SpuiA04KnTBJoOr6m4qR3vA | $5.00 | One-time |
| Resume Distribution | prod_TnVjJ8JufGR1iW | price_1SpuiB04KnTBJoOrPn8txtgJ | $149.00 | One-time |
| DIY Job Search Premium | prod_TnVjkvuYWwN81X | price_1Sq0Xy04KnTBJoOrMhv4b4hL | $9.99 | Monthly |
| Recruiter Basic | prod_TnVjWVnuFc96iE | price_1Sq0Xz04KnTBJoOrcJzx5VYj | $199.00 | Monthly |
| Recruiter Standard | prod_TnVjQH7pSdqhhv | price_1Sq0Y104KnTBJoOrFSD1cNem | $399.00 | Monthly |
| Recruiter Pro | prod_TnVj4k0qKZaeQW | price_1Sq0Y304KnTBJoOrcvV748Jl | $599.00 | Monthly |

## 5.4 Checkout Flow
```
1. User clicks "Choose Plan" on /hire-recruiter
2. If not logged in → redirect to /auth/login?callbackUrl=/hire-recruiter
3. If logged in → POST /api/checkout/subscription
4. API creates/gets Stripe customer
5. API creates Stripe checkout session
6. User redirected to Stripe checkout page
7. User completes payment
8. Stripe redirects to /dashboard?success=true
9. Stripe sends webhook to /api/stripe/webhook
10. Webhook updates database (subscriptions table)
```

## 5.5 Webhook Events to Handle
| Event | Action |
|-------|--------|
| checkout.session.completed | Grant access, create records |
| customer.subscription.created | Insert into subscriptions |
| customer.subscription.updated | Update subscription status |
| customer.subscription.deleted | Mark as canceled |
| invoice.payment_succeeded | Log payment |
| invoice.payment_failed | Alert, update status |

## 5.6 Webhook Registration
**STATUS:** ⚠️ NOT REGISTERED

**To Register:**
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. URL: `https://www.starworkforcesolutions.com/api/stripe/webhook`
4. Select events (see 5.5 above)
5. Copy signing secret to Vercel env vars if different

---

# 6. API ROUTES REFERENCE

## 6.1 Authentication
| Route | Method | Description |
|-------|--------|-------------|
| /api/auth/[...nextauth] | ALL | NextAuth handlers |
| /api/auth/register | POST | Email registration |
| /api/auth/forgot-password | POST | Password reset request |
| /api/auth/reset-password | POST | Password reset confirm |

## 6.2 Payments
| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| /api/checkout/subscription | POST | Required | Create subscription checkout |
| /api/checkout/guest | POST | None | Guest one-time purchase |
| /api/stripe/webhook | POST | Stripe Sig | Handle Stripe events |
| /api/stripe/checkout | POST | Required | Legacy checkout (use /api/checkout/*) |

## 6.3 Jobs
| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| /api/jobs/list | GET | None | Get active jobs |
| /api/jobs/search | GET | None | Search jobs |
| /api/jobs/apply | POST | Required | Apply to job |
| /api/jobs/save | POST/DELETE | Required | Save/unsave job |
| /api/jobs/create | POST | Employer | Create job posting |
| /api/jobs/[id]/deactivate | POST | Employer | Deactivate job |
| /api/jobs/employer/list | GET | Employer | Get employer's jobs |

## 6.4 User
| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| /api/user/profile | GET/PUT | Required | Get/update profile |
| /api/user/resumes | GET | Required | Get user's resumes |

## 6.5 Dashboard
| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| /api/dashboard/stats | GET | Required | User statistics |
| /api/dashboard/applications | GET | Required | User applications |
| /api/dashboard/saved-jobs | GET | Required | Saved jobs |

## 6.6 Tools
| Route | Method | Description |
|-------|--------|-------------|
| /api/ats-upload | POST | Upload resume for ATS |
| /api/ats-free | POST | Free ATS preview |
| /api/ats-full | POST | Full ATS analysis |
| /api/cover-letter-upload | POST | Upload for cover letter |
| /api/cover-letter-free | POST | Free preview |
| /api/cover-letter-full | POST | Full generation |

## 6.7 Other
| Route | Method | Description |
|-------|--------|-------------|
| /api/contact | POST | Contact form submission |
| /api/employer/register | POST | Employer registration |
| /api/health | GET | Health check |

---

# 7. PAGE STRUCTURE

## 7.1 Public Pages
| Page | Path | Description |
|------|------|-------------|
| Homepage | / | Landing page with services |
| Services | /services | Service descriptions |
| Pricing | /pricing | Pricing tiers |
| Jobs | /jobs | Job listings |
| Contact | /contact | Contact form |
| Hire Recruiter | /hire-recruiter | Recruiter plans |
| FAQ | /faq | Frequently asked questions |

## 7.2 Auth Pages
| Page | Path | Description |
|------|------|-------------|
| Login | /auth/login | Sign in form |
| Register | /auth/register | Sign up form |
| Signup | /auth/signup | Alias for register |
| Forgot Password | /auth/forgot-password | Password reset |
| Error | /auth/error | Auth error display |
| Verify | /auth/verify | Email verification |

## 7.3 Dashboard Pages
| Page | Path | Role | Description |
|------|------|------|-------------|
| Dashboard Router | /dashboard | Any | Redirects based on role |
| Job Seeker | /dashboard/job-seeker | jobseeker | Main dashboard |
| Admin | /dashboard/admin | admin | Admin dashboard |
| Recruiter | /dashboard/recruiter | recruiter | Recruiter dashboard |
| Analytics | /dashboard/analytics | Any | Usage analytics |

## 7.4 Tool Pages
| Page | Path | Description |
|------|------|-------------|
| ATS Optimizer | /tools/ats-optimizer | Resume ATS analysis |
| Cover Letter | /tools/cover-letter | Cover letter generator |
| Interview Prep | /tools/interview-prep | Mock interviews |

## 7.5 Employer Pages
| Page | Path | Description |
|------|------|-------------|
| Register | /employer/register | Company registration |
| Dashboard | /employer/dashboard | Employer portal |

## 7.6 Other Pages
| Page | Path | Description |
|------|------|-------------|
| Payment Success | /payment/success | Post-payment |
| Payment Cancel | /payment/cancel | Canceled payment |
| Guest Dashboard | /guest-dashboard | Non-logged purchases |
| Distribution Wizard | /distribution-wizard | Resume distribution |
| Terms | /legal/terms | Terms of service |
| Privacy | /legal/privacy | Privacy policy |
| Disclaimer | /legal/disclaimer | Legal disclaimer |

---

# 8. ENVIRONMENT VARIABLES

## 8.1 Complete List (All in Vercel)

### Database
```
DATABASE_URL=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
```

### Authentication
```
NEXTAUTH_SECRET=<secret>
NEXTAUTH_URL=https://www.starworkforcesolutions.com
GOOGLE_CLIENT_ID=357997537936-ljfk3d0fshklo39qv78iurlor9nf5jcl.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<secret>
LINKEDIN_CLIENT_ID=86n8gwa9up02vr
LINKEDIN_CLIENT_SECRET=<secret>
```

### Stripe
```
STRIPE_SECRET_KEY=sk_test_51Ovttc04KnTBJoOr...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Ovttc04KnTBJoOr...
STRIPE_WEBHOOK_SECRET=whsec_MpNFFthE7iKklWWmcAj0Urg4hjJvEc1X
STRIPE_PRICE_ATS_OPTIMIZER=price_1Spui804KnTBJoOrmwyaBQ2U
STRIPE_PRICE_COVER_LETTER=price_1SpuiA04KnTBJoOr6m4qR3vA
STRIPE_PRICE_RESUME_DISTRIBUTION=price_1SpuiB04KnTBJoOrPn8txtgJ
STRIPE_PRICE_DIY_PREMIUM=price_1Sq0Xy04KnTBJoOrMhv4b4hL
STRIPE_PRICE_RECRUITER_BASIC=price_1Sq0Xz04KnTBJoOrcJzx5VYj
STRIPE_PRICE_RECRUITER_STANDARD=price_1Sq0Y104KnTBJoOrFSD1cNem
STRIPE_PRICE_RECRUITER_PRO=price_1Sq0Y304KnTBJoOrcvV748Jl
```

### Email
```
RESEND_API_KEY=re_FWqhcup1_FY2Ug4puWTKtPf5HasvYCtbd
```

### Other
```
NEXT_PUBLIC_URL=https://www.starworkforcesolutions.com
NEXT_PUBLIC_GA_ID=G-2KEG2N039D
CRON_SECRET=<secret>
```

---

# 9. CHANGES MADE (SESSION LOG)

## 9.1 January 21, 2026 Session

### Fix 1: Stripe Checkout 404 Error
- **Problem:** POST /api/checkout/subscription returned 404
- **Root Cause:** `getServerSession()` called without `authOptions`
- **Solution:** Changed to `getServerSession(authOptions)`
- **File:** `app/api/checkout/subscription/route.ts`

### Fix 2: Google OAuth Redirect
- **Problem:** After login, redirected to homepage instead of dashboard
- **Solution:** Added `redirect` callback to NextAuth config
- **File:** `lib/auth.ts`

### Fix 3: Navigation Session Awareness
- **Problem:** Always showed "Sign In" even when logged in
- **Solution:** Added `useSession()` hook and conditional rendering
- **File:** `components/navigation.tsx`

### Fix 4: SessionProvider Architecture
- **Problem:** `useSession()` returned null in components
- **Solution:** Created AuthProvider, wrapped root layout
- **Files:** `components/auth-provider.tsx`, `app/layout.tsx`

### Fix 5: Hire Recruiter Layout
- **Problem:** Different header/footer than rest of site
- **Solution:** Changed to use shared Navigation/Footer
- **File:** `app/hire-recruiter/layout.tsx`

### Fix 6: Dashboard Login Loop
- **Problem:** Infinite redirect between /dashboard and /auth/login
- **Root Cause:** Role check used `job_seeker` but DB stores `jobseeker`
- **Solution:** Changed role checks to `jobseeker`
- **Files:** `app/dashboard/page.tsx`, `app/dashboard/job-seeker/page.tsx`

### Fix 7: Contact Page Redesign
- **Changes:** Form moved to top, contact details compact below
- **File:** `app/contact/page.tsx`

### Fix 8: Contact Form Subjects
- **Changes:** Added 14 service-specific subject options
- **File:** `components/contact-form-client.tsx`

### Fix 9: Contact API - Resend
- **Changes:** Switched from nodemailer to Resend
- **File:** `app/api/contact/route.ts`

### Fix 10: Sample Jobs
- **Changes:** Added 20 sample jobs via SQL
- **Method:** Created 4 system employers (5 jobs each) to work around trigger
- **File:** `scripts/add-sample-jobs.sql`

---

# 10. LESSONS LEARNED

## 10.1 Authentication

### ❌ WRONG: getServerSession without authOptions
```typescript
const session = await getServerSession(); // FAILS SILENTLY!
```

### ✅ CORRECT: Always pass authOptions
```typescript
import { authOptions } from '@/lib/auth';
const session = await getServerSession(authOptions);
```

### ❌ WRONG: Multiple SessionProviders
```tsx
// layout.tsx
<SessionProvider>
  // hire-recruiter/layout.tsx
  <SessionProvider>  // DUPLICATE - CAUSES ISSUES
```

### ✅ CORRECT: Single SessionProvider at root
```tsx
// app/layout.tsx ONLY
<AuthProvider>
  {children}
</AuthProvider>
```

## 10.2 Database

### ❌ WRONG: Assuming role values
```typescript
if (session.user?.role !== 'job_seeker') // WRONG - DB has 'jobseeker'
```

### ✅ CORRECT: Use exact DB values
```typescript
if (session.user?.role !== 'jobseeker') // CORRECT
```

### Role Values in Database
| Correct | Wrong |
|---------|-------|
| `jobseeker` | `job_seeker`, `job-seeker`, `JobSeeker` |
| `employer` | `Employer` |
| `recruiter` | `Recruiter` |
| `admin` | `Admin` |

## 10.3 Stripe

### Price IDs Must Come from Environment
```typescript
// ❌ WRONG: Hardcoded price IDs
const priceId = 'price_1SVd4E04KnTBJoOrBcQTH6T5';

// ✅ CORRECT: From environment
const priceId = process.env.STRIPE_PRICE_RECRUITER_BASIC;
```

### Webhook Must Be Registered
- Checkout works without webhook
- But database won't be updated
- User won't get access to features

## 10.4 Database Triggers

### Employer Job Limit
- Trigger limits to 5 active jobs per employer
- Cannot be bypassed in INSERT
- **Workaround:** Use multiple employers for sample data

## 10.5 Prisma Schema Sync

### Always Introspect Before Changes
```bash
npx prisma db pull  # Get actual DB structure
npx prisma generate # Generate client
```

### Never Assume Schema Matches
- Previous session found schema had 8 fields
- Actual database had 19 models
- Always verify with introspection

---

# 11. KNOWN ISSUES & FUTURE WORK

## 11.1 Critical (Must Fix)

### Stripe Webhook Not Registered
- **Impact:** Payments work but DB not updated
- **Solution:** Register webhook in Stripe Dashboard
- **Priority:** HIGH

### Current Plan Display
- **Issue:** Dashboard shows "Free" even after payment
- **Cause:** Not checking subscriptions table
- **Solution:** Query subscription status in dashboard
- **Priority:** HIGH

## 11.2 Important (Should Fix)

### Services Page Buttons
- **Issue:** Hire Recruiter section links to /contact
- **Solution:** Update to link to /hire-recruiter
- **Priority:** MEDIUM

### Homepage Buttons
- **Issue:** Some CTAs redirect to /contact instead of proper pages
- **Solution:** Update Link hrefs
- **Priority:** MEDIUM

### User Profile Editing
- **Issue:** No way to update name, phone, location, skills
- **Solution:** Add profile edit form and API
- **Priority:** MEDIUM

## 11.3 Enhancements (Nice to Have)

### Recruiter Dashboard
- Job submission tracking
- Client management
- Daily application logs

### Admin Panel
- Real data from database
- User management
- Subscription management
- Revenue analytics

### Paid User Analytics
- Applications submitted
- Response rates
- Interview pipeline

---

# 12. TROUBLESHOOTING GUIDE

## 12.1 "Failed to create checkout session"
1. Check if user is logged in
2. Verify API route uses `getServerSession(authOptions)`
3. Check Stripe env vars are set in Vercel
4. Check Vercel logs for detailed error

## 12.2 Login Loop (Dashboard ↔ Login)
1. Check role value in database
2. Ensure using `jobseeker` not `job_seeker`
3. Check SessionProvider is only at root
4. Clear browser cookies and retry

## 12.3 Navigation Not Showing User
1. Verify AuthProvider wraps app in root layout
2. Check navigation.tsx uses `useSession()`
3. Check for duplicate SessionProviders

## 12.4 Jobs Page Empty
1. Check if jobs exist in database
2. Verify jobs have `isActive = true`
3. Check `expiresAt` hasn't passed
4. Check API route `/api/jobs/list` response

## 12.5 Contact Form Not Sending
1. Check RESEND_API_KEY in Vercel
2. Check Vercel logs for errors
3. Verify email is from verified domain

## 12.6 Webhook Not Receiving Events
1. Verify webhook is registered in Stripe
2. Check endpoint URL is correct
3. Verify STRIPE_WEBHOOK_SECRET matches
4. Check Stripe Dashboard → Webhooks → Logs

---

# APPENDIX A: SQL SCRIPTS

## A.1 Check User Roles
```sql
SELECT email, name, role, "atsPremium" FROM users ORDER BY "createdAt" DESC;
```

## A.2 Check Active Subscriptions
```sql
SELECT 
  u.email,
  s.subscription_type,
  s.status,
  s.current_period_end
FROM subscriptions s
JOIN users u ON s.user_id = u.id
WHERE s.status = 'active';
```

## A.3 Check Active Jobs
```sql
SELECT 
  j.title,
  j.location,
  j.industry,
  u.name as employer
FROM jobs j
JOIN users u ON j."employerId" = u.id
WHERE j."isActive" = true
ORDER BY j."createdAt" DESC;
```

## A.4 Check Premium Access
```sql
SELECT email, product, "priceId", "paidAt" 
FROM premium_access 
ORDER BY "paidAt" DESC;
```

---

*Document Version: 1.0*
*Last Updated: January 21, 2026*
*Author: Claude AI Assistant*
