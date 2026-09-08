# Session Handoff - 2026-09-08 (LinkedIn / Bing Ads / Stripe cleanup / site audit session)

Read this file AND `claude/knowledge-base.md` first at the start of the next session - do not re-derive anything below. (This file is mirrored from the Claude Project doc of the same name - see the docs-in-two-places rule in the knowledge base.)

## 1. Fully resolved this session
- Stripe live-mode/account confirmation - CLOSED. `acct_1Ovttc04KnTBJoOr` (startekk.net) confirmed correct and live via product-catalog match + healthy webhook.
- Bing Ads email-leak root cause found (Bing's own "Primary contact" account field) - owner decided to leave it.
- CareerAccel LinkedIn Company Page created: linkedin.com/company/143718048.
- LinkedIn banner designed and delivered (file: careeraccel-banner-v2.png) - owner still needs to upload it manually (confirmed automation blocker, not a retry-able glitch).
- Full-site broken-link crawl: 43 URLs, 0 broken.

## 2. In progress, interrupted - resume here first
Archiving 4 unrelated Stripe products from `acct_1Ovttc04KnTBJoOr`: QR Business Plan ($49/mo), QR Pro Plan ($19/mo), QR Free Plan ($0), Attorney Fee - Candidate Profile ($150). On the product catalog page, scrolled into view, about to click the "..." menu on QR Business Plan -> Archive (not delete). Owner already gave go-ahead.

## 3. New Bing Ads guidance (not yet acted on)
Showcase all platform features but lead with "Hire a Recruiter"; target IT/technical jobs only (recruiter-in-the-middle model only works there). Feeds into task #14 (blocked on owner retrieving the Bing UET Tag ID).

## 4. Standing task list - see claude/knowledge-base.md, section "Task list carried forward", items 1-18, for full current status.

## 5. Known hard blockers (do not re-attempt)
- Chrome extension cannot upload Claude-generated/device-bridge-staged files into web forms - owner must click manually.
- dashboard.stripe.com/apikeys is classifier-blocked - use Webhooks/product-catalog pages instead.
- RDAP/WHOIS lookups blocked by network egress on both shells.
- Neon/Stripe APIs unreachable directly from either Claude shell - use their web consoles via Chrome.

## 6. Owner's standing instructions
- Stop asking permission task-by-task; take all reasonably-grantable permissions upfront and work continuously.
- Hard lines unchanged: never enter payment/card details, never bypass a classifier block, never permanently delete (archive instead), flag genuine hard blockers rather than guess past them.
- New (Sept 8): mirror every Claude Project `claude/*.md` doc update into this repo's `claude/` folder and push, same session.

## 7. Also found during this repo sync, not yet actioned (owner decision needed)
- Repo root has a stray `CLAUDE_KB.md` (old Sept 5 duplicate of the knowledge base, never committed) - candidate for deletion once confirmed superseded.
- 6 tracked files show full-file diffs that are confirmed line-ending/whitespace-only (not functional changes): app/api/ats-export-pdf/route.ts, app/api/ats-free/route.ts, app/api/ats-full/route.ts, app/page.tsx, lib/extract-resume-text.ts, next-env.d.ts. Left untouched pending owner decision (normalize+commit, or discard).
