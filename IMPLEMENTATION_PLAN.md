# STAR Workforce Solutions — Enhancement Implementation Plan v2

**Date:** March 16, 2026
**Status:** FINAL DRAFT — Awaiting Approval Before Development
**Platform:** Next.js 16 / Vercel / Neon Postgres / Stripe
**Repository:** github.com/star-workforce-sites/sws-job-seeker-platform
**Research Status:** All research shared and validated. No further data pending.

---

## Decisions Log (All Confirmed by Srikanth)

| Decision | Answer |
|----------|--------|
| AI parsing for ATS enrichment | Yes — real AI via OpenAI GPT-4o-mini |
| OpenAI key status | Already in Vercel (added ~Sep 2025) |
| Interview Prep model | Freemium: 3–5 free questions, $9 one-time for full |
| Interview Prep bundle | $5 for users who already bought ATS or Cover Letter |
| Resume Distribution delivery | Store + mark pending; integrate with ResumeBlast.ai (owned app) later |
| /distribution-wizard | 301 redirect to /tools/resume-distribution |
| Hire-recruiter CTAs | Wire directly to Stripe subscription checkout |
| Stripe mode | Currently TEST keys; switch to LIVE in this sprint |
| DATABASE_URL fix | Update code to fallback to POSTGRES_URL (no new env var needed) |
| v0 console | Not used — no technical suggestions from v0 |

---

## Research Validation Adjustments (from final review)

These changes were made based on Srikanth's validated research feedback:

| Original Plan | Adjusted To | Reason |
|---------------|-------------|--------|
| Salary estimate as precise numbers | Broad ranges only (e.g., "$75K–$95K typical range") | No verified salary dataset; precision risks misrepresentation |
| "Top Hiring Companies" label | "Example companies hiring similar roles" | AI-generated list not data-verified; label must set correct expectations |
| ATS report v1: all sections at once | Phase 1: score, keywords, alignment, suggestions. Phase 2: salary, companies, roadmap | Avoid overloading v1; ship core value first |
| Resume Distribution as high-confidence feature | Ship it but treat as "plausible, not validated" | Research supports pricing but not demand volume |
| No SEO/content plan | Add as future roadmap item (not this sprint) | Research gap identified — traffic acquisition strategy missing |

---

## Execution Phases (Research-Validated Priority Order)

### Phase 1 — Enable Revenue (CRITICAL)
- Stream 0: Stripe Live Mode + DATABASE_URL code fix
- Stream 6: Payment Separation Audit

### Phase 2 — Core Product Enhancement
- Stream 3: ATS AI Enrichment (score, keywords, alignment explanations ONLY)
- Stream 2: Interview Prep Freemium Paywall ($9/$5 bundle)
- Stream 4: ATS PDF Export (3–5 pages with Phase 1 sections only)

### Phase 3 — Expansion
- Stream 1: Resume Distribution ($149)
- Stream 5: /hire-recruiter page update (SEO, Stripe CTAs, upsells)

### Phase 4 — Polish & Ship
- Stream 7: Privacy Auto-Delete
- Stream 8: Testing & Deployment

### Phase 5 — Future (Not This Sprint)
- ATS report: salary estimates, hiring companies, career roadmap
- ResumeBlast.ai API integration
- SEO content funnel (ATS guides, keyword guides, resume examples)
- AI job automation positioning/differentiation

---

## Stream 0 — Stripe Live Mode + DB Fix

**Goal:** Real payments work end-to-end. Database connections don't crash.
**Priority:** #1 — Nothing else matters until this works.

### Part A: DATABASE_URL Code Fix

Update all 8+ API routes that use `neon(process.env.DATABASE_URL!)` to fall back to `POSTGRES_URL`:

| File | Change |
|------|--------|
| `app/api/stripe/webhook/route.ts` | `neon(process.env.DATABASE_URL \|\| process.env.POSTGRES_URL!)` |
| `app/api/checkout/subscription/route.ts` | Same pattern |
| `app/api/checkout/guest/route.ts` | Same pattern |
| `app/api/interview-prep-start/route.ts` | Same pattern |
| `app/api/interview-prep-submit/route.ts` | Same pattern |
| `app/api/guest/verify-token/route.ts` | Same pattern |
| Any other routes using `neon(process.env.DATABASE_URL!)` | Same pattern |

Also create a shared helper in `lib/db.ts`:
```typescript
export function getDbUrl(): string {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error('No database URL configured');
  return url;
}
```

### Part B: Stripe Live Mode

**Stripe Product/Price Checklist (Create in Live Mode)**

| # | Product | Type | Price | Env Var | Status |
|---|---------|------|-------|---------|--------|
| 1 | ATS Resume Optimizer | One-time | $5.00 | `STRIPE_PRICE_ATS_OPTIMIZER` | Verify in live |
| 2 | AI Cover Letter Generator | One-time | $5.00 | `STRIPE_PRICE_COVER_LETTER` | Verify in live |
| 3 | Resume Distribution | One-time | $149.00 | `STRIPE_PRICE_RESUME_DISTRIBUTION` | Verify in live |
| 4 | Interview Prep (NEW) | One-time | $9.00 | `STRIPE_PRICE_INTERVIEW_PREP` | Create in live |
| 5 | Interview Prep Bundle (NEW) | One-time | $5.00 | `STRIPE_PRICE_INTERVIEW_PREP_BUNDLE` | Create in live |
| 6 | DIY Premium | Subscription | $9.99/mo | `STRIPE_PRICE_DIY_PREMIUM` | Verify in live |
| 7 | Recruiter Basic | Subscription | $199/mo | `STRIPE_PRICE_RECRUITER_BASIC` | Verify in live |
| 8 | Recruiter Standard | Subscription | $399/mo | `STRIPE_PRICE_RECRUITER_STANDARD` | Verify in live |
| 9 | Recruiter Pro | Subscription | $599/mo | `STRIPE_PRICE_RECRUITER_PRO` | Verify in live |

### Vercel Env Vars — Current Status (42 present, all correct)

**Confirmed present (from PDF 3/16/26):** OPENAI_API_KEY, STRIPE_SECRET_KEY (test), STRIPE_PUBLISHABLE_KEY (test), NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (test), STRIPE_WEBHOOK_SECRET, RESEND_API_KEY, all 7 STRIPE_PRICE_*, all 7 STRIPE_PRODUCT_*, all database vars, all auth vars, all email vars.

**Srikanth actions for live switch:**
```
Replace with live keys:
  STRIPE_SECRET_KEY                    → sk_live_...
  STRIPE_PUBLISHABLE_KEY               → pk_live_...
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY   → pk_live_...
  STRIPE_WEBHOOK_SECRET                → from live webhook endpoint
  All 7 STRIPE_PRICE_* vars            → live price IDs
  All 7 STRIPE_PRODUCT_* vars          → live product IDs

Add new:
  STRIPE_PRICE_INTERVIEW_PREP          → from new $9 live product
  STRIPE_PRICE_INTERVIEW_PREP_BUNDLE   → from new $5 live product
  STRIPE_PRODUCT_INTERVIEW_PREP        → prod_ ID from live product
```

**Stripe Dashboard:** Register live webhook at `https://www.starworkforcesolutions.com/api/stripe/webhook` for events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

---

## Stream 6 — Strict One-Time vs Subscription Separation

**Priority:** #1 (ships with Stream 0 — foundational payment integrity)

### Audit Checklist

| Product | Table | Check |
|---------|-------|-------|
| ATS Optimizer ($5) | `premium_access` where product='ats-optimizer' | priceId match |
| Cover Letter ($5) | `premium_access` where product='cover-letter' | priceId match |
| Resume Distribution ($149) | `premium_access` where product='resume-distribution' | priceId match |
| Interview Prep ($9) | `premium_access` where product='interview-prep' | priceId match |
| Recruiter plans | `subscriptions` table | subscription_type match |
| DIY Premium | `subscriptions` table | subscription_type match |

**Rule:** One-time purchases ONLY write to `premium_access`. Subscriptions ONLY write to `subscriptions`. No cross-unlock. Each tool's purchase route creates its own `premium_access` record inline (Option A — consistent with existing ATS/Cover Letter pattern).

---

## Stream 3 — ATS AI Enrichment (Phase 1 Scope Only)

**Existing route:** `/api/ats-full/route.ts`
**AI Provider:** OpenAI GPT-4o-mini (OPENAI_API_KEY already in Vercel)

### Phase 1 Sections (This Sprint)

| Section | What AI Generates | Notes |
|---------|-------------------|-------|
| ATS Score | Keyword match percentage + overall score | Keep existing algorithm, enhance with AI explanation |
| Keyword Gaps | Missing keywords from job description | AI identifies and explains importance of each |
| Job Alignment — Contract | 2–3 sentence explanation of contract/consulting fit | References resume keywords + consulting market |
| Job Alignment — Full-Time | 2–3 sentence explanation of full-time fit | References resume strengths vs FT requirements |
| Improvement Suggestions | 3–5 actionable resume improvements | Specific to user's resume + target role |

### Phase 2 Sections (DEFERRED — Future Sprint)

| Section | Why Deferred |
|---------|-------------|
| Salary Range Estimate | No verified salary dataset; risks inaccuracy. When added: broad ranges only ("$75K–$95K typical") with "estimated" label |
| Hiring Companies | AI-generated list not data-verified. When added: label as "Example companies hiring similar roles" not "Top hiring companies" |
| Career Roadmap | Nice-to-have, not core value |
| Certifications | Nice-to-have, not core value |

### Implementation Details

- **SDK:** `openai` npm package
- **Model:** `gpt-4o-mini`
- **Caching:** Store AI response in `resume_uploads.analysisCache` JSON field. Key: hash of `resume_text + job_description`. Same combo returns cached results — no repeat API calls.
- **Cost:** ~$0.005–$0.02 per analysis
- **Disclaimer on all AI sections:** "AI-generated analysis — for informational purposes only"
- **Fallback:** If OpenAI API fails or times out, return existing algorithmic/seeded data gracefully

### Files to Create/Modify

| File | Action |
|------|--------|
| `lib/openai.ts` | Create — OpenAI client singleton |
| `lib/ats-ai-analysis.ts` | Create — prompt templates, response parsing, caching logic |
| `app/api/ats-full/route.ts` | Modify — call AI for explanations, keep existing score algorithm |
| `package.json` | Add `openai` dependency |

---

## Stream 2 — Interview Prep Freemium Paywall ($9 One-Time)

**Existing page:** `/tools/interview-prep` — convert to freemium

### Free Tier (no login required)

- 3–5 sample questions generated from job description
- 1 AI-scored answer with brief feedback
- "Readiness Score" (e.g., 62/100) with 2–3 high-level tips
- CTA: "Unlock full mock interview — $9" (or $5 if bundle-eligible)

### Paid Tier ($9 one-time / $5 for ATS or Cover Letter purchasers)

- Full question set: 20–40 questions (behavioral, role-specific, salary/negotiation)
- AI scoring and detailed feedback per answer
- Summary "Interview Readiness Report"
- Unlimited re-takes

### Bundle Logic

Check `premium_access` for existing `product='ats-optimizer'` OR `product='cover-letter'` records matching user email. If found → show $5 price, use `STRIPE_PRICE_INTERVIEW_PREP_BUNDLE`.

### Cross-Sell Placement

- ATS results page: "Your resume is optimized — now prepare for interviews →"
- Cover Letter results page: "Letter ready — practice your interview questions →"
- Both show $5 bundle price if user already has a purchase

### Files to Create/Modify

| File | Action |
|------|--------|
| `components/interview-prep-client.tsx` | Modify — add free/paid tiers, paywall gate |
| `app/api/interview-prep-purchase/route.ts` | Create — Stripe checkout with bundle price detection |
| `app/api/interview-prep-start/route.ts` | Modify — check premium_access for full session |
| `app/api/interview-prep-submit/route.ts` | Modify — gate detailed feedback behind payment |
| `components/ats-optimizer-client.tsx` | Modify — add interview prep cross-sell CTA |
| `components/cover-letter-client.tsx` | Modify — add interview prep cross-sell CTA |

---

## Stream 4 — ATS PDF Export (3–5 Pages, Phase 1 Content)

**Existing route:** `/api/ats-export-pdf/route.ts` (204 lines, ~1–2 pages)

### Expanded PDF Layout (Phase 1 sections only)

| Page | Content |
|------|---------|
| 1 | Header with STAR branding, overall ATS score (large), keyword match summary, resume metadata |
| 2 | Detailed keyword analysis table, missing keywords with importance ratings |
| 3 | Contract/Consulting Alignment explanation + Full-Time Alignment explanation (AI-generated) |
| 4 | Top 5 improvement suggestions with actionable steps |
| 5 | Disclaimer, next steps (links to Interview Prep, Cover Letter), STAR branding footer |

Note: Salary estimates and hiring companies are NOT included in Phase 1 PDF per research validation.

### Files to Modify

| File | Action |
|------|--------|
| `app/api/ats-export-pdf/route.ts` | Rewrite — expand to ~400–500 lines for 5-page layout |

---

## Stream 1 — Resume Distribution Service ($149 One-Time)

**New page:** `/tools/resume-distribution`
**Redirect:** `/distribution-wizard` → 301 to `/tools/resume-distribution`
**Risk note:** Research supports the $149 price point but demand volume is not validated. Ship as MVP with manual fulfillment; measure conversion before investing in automation.

### What Gets Built

- **Page UI:** Upload resume + job preferences form (target roles, locations, industries, YOE)
- **Payment flow:** Stripe one-time checkout $149 → `premium_access` record with `product='resume-distribution'`
- **Post-payment:** Store resume + preferences, mark `distribution_status='pending'`
- **Admin notification:** Email to srikanth@ctekksolutions.net with full details
- **User confirmation:** Email confirming submission received
- **Fulfillment:** Manual via admin for MVP. ResumeBlast.ai integration deferred.

### Files to Create/Modify

| File | Action |
|------|--------|
| `app/tools/resume-distribution/page.tsx` | Create — server wrapper |
| `components/resume-distribution-client.tsx` | Create — full page component |
| `app/api/resume-distribution-purchase/route.ts` | Create — Stripe checkout |
| `app/api/resume-distribution-upload/route.ts` | Create — upload + preferences |
| `app/api/resume-distribution-success/route.ts` | Create — post-payment handler |
| `app/distribution-wizard/page.tsx` | Modify — 301 redirect |
| `lib/stripe/products.ts` | Modify — add mapping |

### Database

Uses existing `resume_uploads` + `premium_access`. Add column: `distribution_status` (null, pending, distributed).

---

## Stream 5 — Update /hire-recruiter Page

### SEO Keyword Integration

- H1: "Hire a Dedicated Offshore Recruiter for Your Job Search"
- Subheading: "Job Application Automation Service — 90 to 900 Applications Monthly"
- Body copy: "hire recruiter for job search", "offshore recruiter", "job application service"

### Structural Changes

1. **Pricing label:** Add "Monthly subscription — dedicated recruiter" above tier cards
2. **CTA buttons:** Wire to Stripe subscription checkout (replace `/contact?subject=...` links)
3. **One-Time Tools section:** Cards linking to Resume Distribution $149, Interview Prep $9, ATS $5, Cover Letter $5
4. **Social proof:** Placeholder testimonial section (real testimonials added later)

### Files to Modify

| File | Action |
|------|--------|
| `app/hire-recruiter/HireRecruiterClient.tsx` | Rewrite — SEO copy, Stripe CTAs, tool upsells |
| `app/api/checkout/subscription/route.ts` | Verify — handles unauthenticated users |

---

## Stream 7 — Privacy Auto-Delete

- New cron: `/api/cron/cleanup-uploads`
- Runs daily (same pattern as `/api/cron/expire-jobs`)
- Deletes `resume_uploads` older than 30 days (where `distribution_status` is null or 'distributed')
- Deletes `cover_letter_uploads` older than 30 days
- Preserves `premium_access` records (payment receipts)
- Logs deletion counts

| File | Action |
|------|--------|
| `app/api/cron/cleanup-uploads/route.ts` | Create |
| `vercel.json` | Modify — add cron schedule |

---

## Stream 8 — Testing & Deployment

### Test Matrix

| Test | Endpoint | Expected |
|------|----------|----------|
| DB connection fallback | All API routes | No crashes from missing DATABASE_URL |
| Resume Distribution page | `/tools/resume-distribution` | 200, form renders |
| Distribution wizard redirect | `/distribution-wizard` | 301 → `/tools/resume-distribution` |
| Interview Prep free tier | `/tools/interview-prep` | 3–5 questions, readiness score, no payment |
| Interview Prep $9 purchase | Stripe checkout | premium_access created |
| Interview Prep $5 bundle | Stripe (existing ATS buyer) | $5 price applied |
| ATS full with AI sections | `/api/ats-full` | AI alignment explanations, cached on repeat |
| ATS PDF 5 pages | `/api/ats-export-pdf` | PDF with score, keywords, alignments, suggestions |
| Hire-recruiter Stripe CTAs | `/hire-recruiter` | Subscription checkout opens |
| Webhook: one-time | Stripe event | premium_access row only |
| Webhook: subscription | Stripe event | subscriptions row only |
| Privacy cron | `/api/cron/cleanup-uploads` | Old uploads deleted |
| Cross-sell CTAs | ATS + Cover Letter results | Interview Prep upsell visible |
| OpenAI fallback | Kill OPENAI_API_KEY | Graceful fallback to seeded data |

### Vercel Logs Check

- All API routes: 200 responses (no 500s)
- Stripe webhook: events received and processed
- OpenAI: calls succeed, responses cached
- Database: no connection errors
- No unhandled promise rejections

---

## Action Items for Srikanth (Before Dev Starts)

1. ~~Create OpenAI API account~~ ✅ DONE — OPENAI_API_KEY already in Vercel

2. **Switch Stripe to LIVE mode** (when ready for real payments):
   - Toggle to Live mode in Stripe Dashboard
   - Create 9 live products mirroring test + Interview Prep $9 + Bundle $5
   - Copy all live price_/prod_ IDs → update 14 STRIPE_PRICE_*/STRIPE_PRODUCT_* vars
   - Copy sk_live_/pk_live_ keys → update STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   - Register live webhook → update STRIPE_WEBHOOK_SECRET

3. **Add 3 new env vars** to Vercel:
   - `STRIPE_PRICE_INTERVIEW_PREP` ($9 product)
   - `STRIPE_PRICE_INTERVIEW_PREP_BUNDLE` ($5 product)
   - `STRIPE_PRODUCT_INTERVIEW_PREP` (prod_ ID)

4. **Confirm:** keep test keys in Preview environment for staging?

**NOTE:** Dev can start immediately on ALL streams using current test keys.
The DATABASE_URL code fix, AI enrichment, new pages, UI work, and privacy
cleanup all work with test Stripe. Live switch is a Vercel env var swap
done at deployment time.

---

## Future Roadmap (Not This Sprint)

Based on research gaps identified in the validation review:

| Item | Rationale |
|------|-----------|
| ATS salary estimates (broad ranges) | Needs careful framing; add after core ATS enrichment proves value |
| ATS hiring companies | Needs "Example companies" labeling; add after core sections ship |
| ATS career roadmap + certifications | Nice-to-have upsell content |
| ResumeBlast.ai API integration | Wire $149 payment to automated distribution |
| SEO content funnel | ATS guides, keyword guides, resume examples — critical for traffic |
| AI job automation differentiation | Define positioning vs AutoApply, ApplyIQ, etc. |
| Free ATS scan tier | Consider 1–3 free limited scans to build top-of-funnel |
