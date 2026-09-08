**Last updated:** Sept 8, 2026 (LinkedIn/Bing/Stripe-cleanup session merged in). Keep this file updated as work progresses — read it first in any new session before re-investigating anything below.

## 0f. Sept 8, 2026 session — LinkedIn, Bing Ads root cause, Stripe live-mode confirmation, broken-link crawl (merged from `claude/session-handoff-2026-09-08.md`)

- **Stripe live-mode/account — CONFIRMED, CLOSED.** `acct_1Ovttc04KnTBJoOr` (startekk.net) is the correct, already-**live** account: product catalog prices match the live site exactly, and its webhook endpoint (`adventurous-dream` -> `/api/stripe/webhook`) is Active with 0% error rate against the real production URL. No "make Stripe live" action needed. (Verified via product-catalog match + webhook health, since the raw API-keys page is classifier-blocked - see 0g.)
- **Bing/Microsoft Ads showing `srikanth@startekk.net` instead of `info@starworkforcesolutions.com` - ROOT CAUSE FOUND, owner decided to leave it as-is.** Not website code, HTTP headers, or WHOIS (all checked, clean). It's Bing Ads' own account-level "Primary contact" field (Account Settings), restricted to registered account users - `info@` isn't one. No further action planned.
- **CareerAccel LinkedIn Company Page created**: `linkedin.com/company/143718048` - standalone page (not a Showcase Page; parent pages don't meet the 10k-follower threshold recommended for Showcase Pages - full reasoning in `claude/linkedin-careeraccel-plan.md`).
- **LinkedIn banner designed, delivered, NOT yet uploaded.** Theme: "Hire a Recruiter - real humans, no robots" (not a generic ATS-score graphic), navy/gold brand palette, kept clear of LinkedIn's logo-overlap zone (~x:0-190, y:95-191 of a 1128x191 banner). File delivered to owner (`careeraccel-banner-v2.png`). **Owner must upload it manually** - confirmed hard blocker, not a retry-able glitch (see 0g).
- **Full-site broken-link crawl run** (Python requests+BeautifulSoup, sitemap + breadth-first crawl, 150-URL cap): 43 URLs crawled, **0 broken links** in the currently-linked page graph. GSC's previously-reported 9 404s/4 redirects/2 noindex'd pages were NOT reachable by this crawl - likely orphaned/old URLs no longer linked anywhere, but this is not yet confirmed by pulling GSC's actual list (see task #11/#16).
- **New Bing Ads campaign guidance from owner (not yet built):** ads should showcase all platform features, but lead with/emphasize "Hire a Recruiter"; targeting must be restricted to **IT/technical jobs only**, because the recruiter-in-the-middle fulfillment model (real offshore humans applying on the candidate's behalf) only works for IT/technical roles. Applies to task #14 (Bing UET tag), which is still blocked on the owner retrieving the actual UET Tag ID from Bing Ads (Tools -> Conversion Tracking -> UET Tags).
- **IN PROGRESS, interrupted mid-action - resume first next session:** archiving 4 unrelated Stripe products (leftover from other STARTekk projects, not this platform) from `acct_1Ovttc04KnTBJoOr`: QR Business Plan ($49/mo), QR Pro Plan ($19/mo), QR Free Plan ($0), Attorney Fee - Candidate Profile ($150). Owner gave a blanket go-ahead. Use "..." menu -> **Archive** (not delete - archiving is reversible). State when interrupted: on the product catalog page, scrolled into view, about to click the QR Business Plan row's "..." menu.
- **Owner's standing instruction (applies going forward):** stop asking permission task-by-task; take all reasonably-grantable permissions upfront and work through the task list continuously. Hard lines still apply regardless: never enter payment/card details, never bypass a classifier block, never permanently delete (archive instead), always flag a genuinely hard blocker rather than guess past it.

## 0g. Automation hard blockers confirmed Sept 8, 2026 (don't re-attempt, don't re-discover)

- **Chrome extension file-upload tools cannot upload arbitrary Claude-generated or device-bridge-staged files into web forms.** `mcp__claude-in-chrome__upload_image` only accepts images already captured as a screenshot or already user-uploaded to the conversation. `mcp__claude-in-chrome__file_upload` rejected a device-bridge-staged file outright ("only files this session is allowed to read can be uploaded"). Net effect: LinkedIn banner upload and any resume-upload-for-checkout-test must be done by the owner's own manual click after Claude stages/delivers the file as far as possible.
- **`dashboard.stripe.com/apikeys` is blocked by a Claude Code auto-mode classifier.** Use the Webhooks page or product catalog for account/mode verification instead - never the raw API keys page. (An isolated `Escape` keypress inside the Stripe dashboard also once triggered the same classifier block; proceeding with subsequent clicks worked fine, so treat that one as non-blocking noise, not a hard stop.)
- **RDAP/WHOIS lookups are blocked by network egress on both the device shell and the cloud container** (403 blocked-by-allowlist / 403 from `rdap.org` via both `curl` and `WebFetch`). If a WHOIS-type check is ever needed again, ask the owner to check the registrar's own dashboard directly instead of retrying.
- Neon/Stripe API network blocks from 0d below still apply and were re-confirmed operationally this session (used the Neon web SQL Editor and Stripe Dashboard UI via Chrome throughout, per established workaround).

## Task list carried forward (IDs unchanged, status as of Sept 8, 2026 evening)

1. Finalize CareerAccel LinkedIn banner - waiting on owner's manual upload (file ready).
2. Complete CareerAccel LinkedIn page setup (About, tagline, location, first posts) - not started.
3. Upload the 2 Grok Imagine videos to the CareerAccel LinkedIn page - not started.
4. Decide instructional/FAQ video approach for the website - awaiting owner decision.
5. Build & embed website instructional video w/ VideoObject schema - blocked on #4.
6. DONE - Stripe live-mode confirmation (0f).
7. Full end-to-end site test - DB/webhook parts done; live $5 checkout click-through attempted but not completed (file-upload blocker, 0g).
8. SEO meta/keyword audit - not started.
9. Resubmit sitemap.xml to Google Search Console - not started.
10. Investigate `/contact` landing-page anomaly (106 sessions, 0s engagement, 0 conversions in GA) - not started.
11. Reconcile GSC's reported 9 404s/4 redirects/2 noindex'd pages against this session's clean 0-broken-links crawl - needs the exact URL list pulled from GSC's Indexing report; likely orphaned URLs but not yet confirmed.
12. Clean up Sept 7 e2e test data (2 rows in `recruiter_blast_log` + test admin alert email) - not done.
13. Header rebrand + careeraccel.ai domain alias - deferred by owner ("start with the page and link to current site, decide later").
14. Add Bing UET conversion tracking tag to site code - blocked on owner retrieving the UET Tag ID; new targeting/messaging guidance attached (0f).
15. Archive 4 unrelated Stripe products - **IN PROGRESS, resume first** (0f).
16. Broken-link crawl - crawl done (0 broken); GSC reconciliation folded into #11.
17. Codebase cleanup (remove unused files/docs, verify with grep before deleting) - not started. NOTE (added during repo sync Sept 8): repo root also has a stray, outdated `CLAUDE_KB.md` (Sept 5 duplicate, never committed) and several uncommitted whitespace/line-ending-only diffs on `app/api/ats-export-pdf/route.ts`, `app/api/ats-free/route.ts`, `app/api/ats-full/route.ts`, `app/page.tsx`, `lib/extract-resume-text.ts`, `next-env.d.ts` (confirmed line-ending/whitespace only via diff, not functional changes) - both need an owner decision before touching (delete duplicate doc? normalize line endings and commit, or discard?).
18. Re-audit site messaging/flow for job-seeker clarity, per `claude/site-audit-and-recommendations.md` and `claude/master-fix-and-growth-plan.md` - not started.

Also still open from before this session:
- `lib/email-templates.ts` ~line 452: partner/recruiter email template mailto link still shows `Srikanth@startekk.net` instead of `info@starworkforcesolutions.com` - offered to fix, owner never explicitly confirmed (got sidetracked by the Bing investigation, which turned out to be unrelated). Worth fixing for consistency once confirmed.

## STANDING RULE (added Sept 7, 2026, strengthened Sept 8 - non-negotiable)

**Zero assumptions. Zero guesses. Ever.** See the separate project-instructions draft (`claude/project-instructions-draft.md`) for the full, strengthened version of this rule the owner asked to be enforced platform-wide, on every task, not just Mailercloud. Summary: never state that something works, fails, is safe, or is configured a certain way unless it was just verified by an actual command/query/test run in this session, or is a direct quote from primary documentation. "Should work," "probably," "this is fine" are banned phrasings. When two of my own environments (or an environment and documentation) disagree, say so explicitly and pick neither silently.

**Also:** don't stop to ask permission for routine investigative/testing steps within an already-agreed plan (checking logs, running the established $0 signed-webhook test method, reading docs, navigating a dashboard). Only pause for real decisions: spending real money, changing pricing/branding/product scope, or an irreversible action. **Sept 8 evening update:** owner extended this further - take all reasonably-grantable permissions upfront and work through the standing task list continuously without asking per-item; only surface genuinely hard blockers (payment entry, classifier blocks, irreversible deletes, or a step that requires the owner's own manual click).

**Sept 8 evening addition - docs-in-two-places rule:** whenever a Claude Project doc under `claude/` (knowledge-base, handoffs, plans) is created or updated, also write/commit the same file into this actual repo under `claude/` and push it, so the doc lives both in the Claude Project (claude.ai) and in the real codebase/GitHub - not just one or the other.

## 0d. Network/tooling environment facts learned Sept 8, 2026 (do not re-discover these)

- **Neither of Claude's own execution environments can reach Neon's database API directly.** The device's shell (device_bash, running in a sandboxed Linux VM on the owner's Windows machine) has a narrow network egress allowlist that explicitly blocks `api.us-east-1.aws.neon.tech` (confirmed via direct `curl -v`: `403 blocked-by-allowlist`) - it also blocks `cloudapi.mailercloud.com` the same way (see earlier Mailercloud testing). Claude's cloud container has its own separate, different egress policy that ALSO does not include Neon's host (confirmed via a direct attempt: `403 Host not in allowlist: api.us-east-1.aws.neon.tech`). Do not retry or hunt for a workaround when hitting a `blocked-by-allowlist` or `Host not in allowlist` error - it's a hard policy block on both sides, not a flaky connection.
- **Working alternative for one-off SQL/migrations against Neon: Neon's own web console SQL Editor**, reached via Chrome (already logged in) at `https://console.neon.tech`. The correct project for this app is **`neon-cyan-garden`** (project id `still-scene-80287420`), NOT `startekk-calculator` (the other project in the same Neon org) - confirmed by cross-referencing the Vercel Storage integration page for `v0-job-seeker-platform`, which links directly to `neon-cyan-garden`, and by matching the `.env` `DATABASE_URL` endpoint hostname (`ep-crimson-paper-a4sfebbv-pooler`) to that project.
- **The `@neondatabase/serverless` package's `sql.query()` cannot run multiple SQL statements in a single call** - real error text: `cannot insert multiple commands into a prepared statement`. Split on `;` and execute each statement in its own call, or use the Neon web console instead.
- **`.git/index.lock` can go stale** in the device's repo folder if a prior git operation was interrupted - blocks all future `git commit`/`git add` with a "file exists" error. `device_bash` cannot delete files by default in a connected folder; use `device_request_delete_permission` before attempting `rm` on anything in the repo.
- **General lesson:** a "successfully completed" message from a tool is not itself verification - independently confirm the end state before telling the owner it worked.

## 0c. Mailercloud recruiter-blast Reply-To - current state (Sept 7-8, 2026)

See prior session logs for full detail (reply-email verification behavior, race-condition fix, deploy script `deploy-recruiter-blast-fix.sh` still pending owner run, Free-plan contact cap blocking the real ~1,400-recruiter list until Premium upgrade).

## 0e. AI-search-visibility (GEO/AEO) research - Sept 7, 2026, not yet actioned

robots.txt already allows all crawlers; llms.txt does not exist yet; only one JSON-LD block sitewide (homepage). Recommended levers: Organization/Article/FAQPage schema plus quotable 40-60 word answers per section. Not actioned yet, owner has not decided timing.

---

## 1. Identity & access (confirmed, do not re-derive)

| Thing | Value |
|---|---|
| Live site | https://www.starworkforcesolutions.com |
| GitHub repo | https://github.com/star-workforce-sites/sws-job-seeker-platform (branch `main`) |
| Vercel project | `v0-job-seeker-platform` - https://vercel.com/srikanth-2237s-projects/v0-job-seeker-platform (auto-deploys on push to `main`) |
| Database | Neon PostgreSQL, project `neon-cyan-garden` (id `still-scene-80287420`) |
| Stripe - correct account | `startekk.net`, account ID `acct_1Ovttc04KnTBJoOr` - Enabled, live mode confirmed Sept 8 |
| Stripe webhook | Endpoint "adventurous-dream" -> `/api/stripe/webhook`, Active, 0% error rate, missing subscription-lifecycle events (see fix list) |
| CareerAccel LinkedIn Company Page | `linkedin.com/company/143718048` - created Sept 8, banner designed but not yet uploaded |
| Bing/Microsoft Ads account | login `srikanth@startekk.net` via Gmail; "Primary contact" field intentionally left as `srikanth@startekk.net` per owner decision Sept 8 |
| Source of truth for the repo itself | `PROJECT_CONTEXT.md` in the repo root |

(Full historical detail on git-auth fix, Mailercloud, OpenAI-billing root cause, etc. preserved in the Claude Project's copy of this file and in `claude/session-handoff-2026-09-06.md` / `claude/session-handoff-2026-09-08.md`.)

## 4. Decisions made by the owner - do not re-ask these

1. "Career Accel" stays a sub-brand under STAR Workforce Solutions; must become visible/consistent everywhere. Header rebrand + careeraccel.ai domain alias deferred (Sept 8): start with the LinkedIn page linking to the current site, decide later.
2. Pricing/free-tier limits: leave exactly as configured now; fix copy to match reality, don't introduce new numbers.
3. Resume Distribution: use the owner's existing ~1,400-email recruiter list via MailerCloud API.
4. Employer flow: build paid CHRM NEXUS-exclusive job-lead access for employers, not just a redirect fix.
5. CareerAccel LinkedIn presence: standalone Company Page, not a Showcase Page.
6. Bing Ads "Primary contact" field: leave as `srikanth@startekk.net`, no action.
7. Stripe product cleanup: archive (never delete) the 4 unrelated products.
8. Operating cadence: stop asking permission task-by-task; take all reasonably-grantable permissions upfront and work continuously, only surfacing genuinely hard blockers.
9. Bing Ads campaign direction: showcase all features, lead with "Hire a Recruiter," target IT/technical jobs only.

## 6. Operating notes for future sessions

- Zero manual coding; all changes via Git-Bash-runnable scripts (Windows-compatible); verify against live GitHub state first; verify everything with actual tests/queries, not assumptions.
- Fix scripts live in `scripts/claude-fixes/` - check that folder before writing a new one.
- Git identity in this repo is LOCAL (`git config user.name/email` without `--global`).
- See section 0d for network/tooling hard limits and 0g for browser/automation hard blockers - don't re-discover either by trial and error.
- **Start of next session: resume the in-progress Stripe product archiving (0f) before anything else**, then continue down the numbered task list without pausing for permission on routine steps.
- **Docs-in-two-places rule (added Sept 8):** any update to a Claude Project `claude/*.md` doc gets mirrored into this actual repo's `claude/` folder and pushed, same session.
