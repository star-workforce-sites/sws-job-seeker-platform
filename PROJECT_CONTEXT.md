# Career Accel Platform — Project Context
> Paste this file at the start of any new Claude session to instantly resume work.

---

## Project Identity

- **Product Name:** Career Accel Platform
- **Hosted On:** STAR Workforce Solutions
- **Live URL:** https://www.starworkforcesolutions.com
- **GitHub Repo:** https://github.com/star-workforce-sites/sws-job-seeker-platform
- **Owner:** Srikanth | Startek LLC | Srikanth@startekk.net
- **Deployed On:** Vercel (auto-deploys on push to `main`)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16, App Router, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Database | Neon PostgreSQL (serverless) via `@vercel/postgres` |
| AI | OpenAI GPT-4o-mini |
| Payments | Stripe (live mode) — one-time + subscriptions |
| Auth | NextAuth.js (Google, LinkedIn, Email/Password) |
| Email | Resend API |
| Hosting | Vercel |
| File Storage | Vercel Blob |
| Analytics | Google Analytics 4 — Measurement ID: G-2KEG2N039D |

---

## Local Project Path (Windows)

```
C:\Users\STAR Workforce\projects\sws-job-seeker-platform
```

## Push to GitHub (run from project folder)

```bash
git pull origin main
git push origin main
```

---

## Product Suite & Pricing

### AI Career Tools (One-Time)
| Product | Price | Key API Route |
|---------|-------|--------------|
| ATS Resume Optimizer | $5 | `/api/ats-purchase`, `/api/ats-free` |
| Cover Letter Generator | $5 | `/api/cover-letter-purchase`, `/api/cover-letter-free` |
| Interview Prep | $9 (or $5 bundle) | `/api/interview-prep-purchase` |
| Resume Distribution | $149 | `/api/resume-distribution-purchase` |

### Managed Recruiter Service (Subscriptions)
| Plan | Price | Applications |
|------|-------|-------------|
| Basic | $199/mo | 90–150/mo |
| Standard | $399/mo | 300–450/mo |
| Pro | $599/mo | 600–900/mo |

### Coming Soon
- DIY Job Search (free) — 3rd-party job aggregation page exists with "Coming Soon" banner

---

## Key Files & Architecture

```
app/
  layout.tsx              ← Root layout — GA script injected here
  robots.ts               ← Dynamic robots.txt (blocks /auth/, /admin/, /api/)
  sitemap.ts              ← Dynamic sitemap (pulls active jobs from DB)
  page.tsx                ← Homepage
  hire-recruiter/
    page.tsx
    HireRecruiterClient.tsx  ← Subscription checkout + GA tracking
  tools/
    ats-optimizer/        ← ATS tool pages
    cover-letter/         ← Cover letter tool pages
    interview-prep/       ← Interview prep tool pages
    resume-distribution/  ← Resume distribution tool pages
  jobs/
    JobsClient.tsx        ← "Coming Soon" banner
  admin/panel/            ← Admin dashboard (role-gated)
  auth/login/             ← Email/password + OAuth login
  auth/register/          ← User registration
  api/
    ats-free/             ← Free ATS (limited results)
    ats-purchase/         ← Stripe checkout for ATS
    ats-success/          ← Post-payment ATS handler
    cover-letter-free/    ← Free cover letter (preview only)
    cover-letter-purchase/← Stripe checkout for cover letter
    cover-letter-full/    ← Full AI cover letter
    interview-prep-start/ ← Start interview prep session
    interview-prep-submit/← Submit answers, get results
    interview-prep-purchase/← Stripe checkout for interview prep
    resume-distribution-upload/ ← Upload resume file
    resume-distribution-purchase/ ← Stripe checkout ($149)
    resume-distribution-success/ ← Post-payment handler (TODO: ResumeBlast.ai API)
    checkout/subscription/ ← Recruiter plan Stripe checkout
    cron/cleanup-uploads/ ← Daily privacy delete (30-day retention)
    cron/expire-jobs/     ← Daily job expiry
    stripe/webhook/       ← Stripe webhook handler
    chrm/jobs/            ← CHRM NEXUS job board proxy (server-side, x-api-key)
    chrm/intelligence/    ← CHRM NEXUS market intelligence proxy (no auth needed)
    chrm/activity/        ← Activity tracking (job_viewed, candidate_submitted, job_saved, hot_jobs)
  dashboard/
    recruiter/
      RecruiterDashboardClient.tsx ← Recruiter dashboard with Job Board tab
      CHRMJobBoard.tsx             ← CHRM NEXUS Job Board component (filters, pagination, submit candidate)
    job-seeker/
      page.tsx                     ← Job seeker dashboard (server component)
      CHRMJobSeekerPanel.tsx       ← Market intel, hot jobs, job feed, visa filter

components/
  analytics-tracker.tsx   ← GA page view tracking (in layout)
  ats-optimizer-client.tsx
  cover-letter-client.tsx
  interview-prep-client.tsx
  resume-distribution-client.tsx
  navigation.tsx
  footer.tsx

lib/
  analytics.ts            ← GA event tracking functions
  analytics.ts exports:   trackBeginCheckout, trackPurchase, trackSubscription,
                          trackFreeToolUse, trackUpgradeClick, trackFileUpload,
                          trackAuth, trackSignup, trackPageView, trackEvent
  auth.ts                 ← Shared NextAuth config (Credentials + Google + LinkedIn)
  ats-ai-analysis.ts      ← GPT-4o-mini ATS analysis
  cover-letter-ai.ts      ← GPT-4o-mini cover letter generation

middleware.ts             ← WWW redirect, bot blocking, security headers
next.config.ts            ← Security headers + 301 redirects for old 404 pages
vercel.json               ← Cron jobs (cleanup-uploads, expire-jobs)
```

---

## Database Tables (Neon PostgreSQL)

| Table | Purpose |
|-------|---------|
| `users` | User accounts |
| `resume_uploads` | Resume files (base64) + ATS analysis cache |
| `cover_letter_uploads` | Cover letter data + generated letter cache |
| `premium_access` | Records of one-time purchases by email + product |
| `subscriptions` | Recruiter plan subscription records |
| `jobs` | Job listings |
| `guest_purchases` | Guest checkout records |
| `chrm_activity_events` | CHRM NEXUS activity tracking (job_viewed, candidate_submitted, job_saved) |

---

## Admin Credentials

- **URL:** https://www.starworkforcesolutions.com/admin/panel
- **Email:** admin@starworkforcesolutions.com
- **Password:** Set in environment variables (`ADMIN_PASSWORD`)
- **Admin dashboard:** Manage subscribers, assign recruiters, track plans

---

## Environment Variables (in Vercel + .env.local)

```
NEXT_PUBLIC_GA_ID=G-2KEG2N039D
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://www.starworkforcesolutions.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ATS=price_...
STRIPE_PRICE_COVER_LETTER=price_...
STRIPE_PRICE_INTERVIEW_PREP=price_...
STRIPE_PRICE_RESUME_DISTRIBUTION=price_...
STRIPE_PRICE_RECRUITER_BASIC=price_...
STRIPE_PRICE_RECRUITER_STANDARD=price_...
STRIPE_PRICE_RECRUITER_PRO=price_...
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
POSTGRES_URL=...
BLOB_READ_WRITE_TOKEN=...
CRON_SECRET=...
NEXT_PUBLIC_URL=https://www.starworkforcesolutions.com
CHRM_API_KEY=...                     ← CHRM NEXUS API key (server-side only, used in x-api-key header)
```

---

## Email Routing (via Resend)

| Trigger | Recipient |
|---------|-----------|
| New subscriber signs up | Srikanth@startekk.net |
| Contact form submission | info@starworkforcesolutions.com |
| Admin notifications | Srikanth@startekk.net |
| Welcome emails | User's email |

---

## What's Been Completed

1. ✅ ATS Optimizer — real GPT-4o-mini analysis, per-resume caching, free/premium tiers, PDF export
2. ✅ Cover Letter Generator — AI-generated from resume + job description, per-document caching
3. ✅ Interview Prep — freemium (5 free / 40 premium), readiness report, Stripe checkout
4. ✅ Resume Distribution — upload + $149 Stripe checkout, success flow (manual fulfillment for now)
5. ✅ Hire-a-Recruiter — 3 Stripe subscription tiers, admin assignment dashboard
6. ✅ Auth — Google OAuth, LinkedIn OAuth, email/password (NextAuth shared config)
7. ✅ Admin Dashboard — subscriber management, recruiter assignment
8. ✅ Privacy Cron — daily auto-delete of uploads after 30 days
9. ✅ Google Analytics — gtag.js in layout, page view tracking, conversion events on all purchase flows
10. ✅ SEO Fixes — dynamic robots.txt, dynamic sitemap, canonical on /contact, 301 redirects for old pages
11. ✅ DIY Job Search — "Coming Soon" banner with explanation
12. ✅ GA Conversion Tracking — begin_checkout + purchase events on all 5 payment flows
13. ✅ CHRM NEXUS Integration — Recruiter Job Board tab on /dashboard/recruiter + Job Seeker dashboard enhancements (market intelligence, hot jobs, job feed, visa filter, activity tracking)

---

## Remaining / Pending Work

### High Priority
- **ResumeBlast.ai Integration** — After payment, Career Accel must call ResumeBlast.ai API to trigger distribution. Currently manual. See `ResumeBlast_Integration_Spec.md` and `ResumeBlast_Claude_Prompt.md` in the project root for full spec.
  - Career Accel side: update `/api/resume-distribution-success/route.ts` with API call
  - ResumeBlast.ai side: needs `POST /api/v1/distribute` endpoint + API key

### Medium Priority
- **DIY Job Search** — Build actual 3rd-party job aggregation from niche APIs
- **ATS Deferred Features:**
  - Salary estimates based on resume skills
  - Hiring companies matched to skill set
- **Admin Notification Emails** — Send email to Srikanth@startekk.net on new purchases (TODO in success handlers)

### Future Revenue Features (from recommendations doc)
- Resume Rewrite Service ($49–99)
- LinkedIn Optimization Report ($19)
- Career Accel All-Access Pass ($29/mo — bundle subscription)
- Employer Job Posting Marketplace ($99–299/post)
- B2B / White-Label Licensing ($500–2,000/mo per agency)
- Career Coaching Marketplace (15–20% commission)
- Salary Negotiation Tool ($19)
- AI Video Interview Simulator ($29–49)
- International Expansion (UK, AU, EU)

---

## Related Asset

**ResumeBlast.ai** — A separately deployed resume distribution fulfillment engine, owned by Startek LLC. Once its API endpoint is built, Career Accel will call it automatically after Resume Distribution purchases. See `ResumeBlast_Integration_Spec.md` for full API contract.

---

## Documents Generated

Located in project root:
- `Career_Accel_Platform_Project_Details.docx` — Full project details + revenue recommendations
- `Career_Accel_Platform_MA_Teaser.docx` — 2-page M&A investment teaser
- `ResumeBlast_Integration_Spec.md` — Full API spec for ResumeBlast.ai integration
- `ResumeBlast_Claude_Prompt.md` — Prompt to use in ResumeBlast.ai Claude session

---

## How to Resume Work in a New Session

1. Open a new Claude (Cowork) session
2. Grant access to: `C:\Users\STAR Workforce\projects\sws-job-seeker-platform`
3. Say: *"Continue the Career Accel Platform project. Read PROJECT_CONTEXT.md first."*
4. Claude will read this file and be fully up to speed instantly.
