#!/usr/bin/env python3
"""
12-rename-ai-recruiter-and-reorg-nav.py

Renames "Hire a Recruiter" -> "AI + Recruiter" across every location found by
the Sept 8 2026 grep audit, fixes the "Distribution Wizard" / "Resume
Distribution" nav mismatch, fixes the "Job Search" / "Job Board" nav mismatch,
adds Cover Letter Generator + Interview Prep to the top nav (currently
missing despite one being paid and the other being the free-tier hook), and
regroups the nav into "Do It Yourself" vs "AI + Recruiter Service" clusters
per the owner-approved flow-chart proposal.

Keyword rule applied throughout (verified via live search Sept 8 2026):
  - "dedicated" is KEPT in display copy (already validated in prior keyword
    research; reads as a benefit).
  - "offshore" is REMOVED from display copy / SEO titles (search results for
    that term are dominated by B2B/RPO content aimed at companies, not job
    seekers) but the required compliance disclosure sentence elsewhere on the
    site ("Offshore recruiters are independent contractors...") is NOT
    touched by this script -- that legal language stays exactly as-is.
  - "Recruiter Assistant" is never introduced anywhere (search results for
    that term are overwhelmingly AI tools sold TO recruiters/HR teams, wrong
    audience for a job-seeker-facing feature).

Copy is kept general ("job seekers and employers with a bench of candidates")
per owner's note that this should stay open for a future B2B/on-demand-
recruiter offering -- no wording here narrows it to individual job seekers
only.

Every replacement below is a unique-string match verified against the live
repo on Sept 8 2026 -- the script hard-fails (non-zero exit) if any expected
string is not found exactly once, rather than silently skipping it.
"""
import sys

REPO = "."  # run from repo root

def apply(path, replacements):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    original = content
    for old, new in replacements:
        count = content.count(old)
        if count != 1:
            print(f"FAIL: expected exactly 1 match for a string in {path}, found {count}.")
            print(f"  Looking for: {old[:120]!r}")
            sys.exit(1)
        content = content.replace(old, new)
    if content == original:
        print(f"FAIL: no changes applied to {path} (unexpected).")
        sys.exit(1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"OK: {path} updated ({len(replacements)} replacement(s))")


def main():
    # 1. components/navigation.tsx -- full navLinks reorg + rename
    path = f"{REPO}/components/navigation.tsx"
    old_nav_block = """  const navLinks = [
    { href: '/services', label: 'Services' },
    { href: '/tools/ats-optimizer', label: 'ATS Optimizer' },
    { href: '/distribution-wizard', label: 'Distribution Wizard' },
    { href: '/jobs', label: 'Job Search' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/hire-recruiter', label: 'Hire Recruiter' },
    { href: '/employer/register', label: 'For Employers' },
    { href: '/contact', label: 'Contact' },
  ]"""
    new_nav_block = """  // Grouped per the Sept 2026 job-seeker-mindset flow audit:
  // "Do It Yourself" tools first, then the paid "AI + Recruiter" service
  // cluster, then site-level links. Cover Letter Generator and Interview
  // Prep were previously missing from the nav entirely.
  const diyLinks = [
    { href: '/services', label: 'Services' },
    { href: '/tools/ats-optimizer', label: 'ATS Optimizer' },
    { href: '/tools/cover-letter', label: 'Cover Letter Generator' },
    { href: '/tools/interview-prep', label: 'Interview Prep' },
    { href: '/jobs', label: 'Job Board' },
  ]
  const serviceLinks = [
    { href: '/hire-recruiter', label: 'AI + Recruiter' },
    { href: '/tools/resume-distribution', label: 'Resume Distribution' },
  ]
  const siteLinks = [
    { href: '/pricing', label: 'Pricing' },
    { href: '/employer/register', label: 'For Employers' },
    { href: '/contact', label: 'Contact' },
  ]
  const navLinks = [...diyLinks, ...serviceLinks, ...siteLinks]"""

    old_desktop_render = """          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="text-sm font-medium text-gray-300 hover:text-[#E8C547] transition-colors duration-200"
                style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 500 }}
              >
                {link.label}
              </Link>
            ))}
          </div>"""
    new_desktop_render = """          <div className="hidden lg:flex items-center gap-5 xl:gap-6">
            {diyLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-300 hover:text-[#E8C547] transition-colors duration-200"
                style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 500 }}
              >
                {link.label}
              </Link>
            ))}
            <div className="w-px h-5 bg-white/15" aria-hidden="true" />
            {serviceLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-300 hover:text-[#E8C547] transition-colors duration-200"
                style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 500 }}
              >
                {link.label}
              </Link>
            ))}
            <div className="w-px h-5 bg-white/15" aria-hidden="true" />
            {siteLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-300 hover:text-[#E8C547] transition-colors duration-200"
                style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 500 }}
              >
                {link.label}
              </Link>
            ))}
          </div>"""

    old_mobile_button = '            className="md:hidden p-2 hover:bg-white/10 rounded transition-colors"'
    new_mobile_button = '            className="lg:hidden p-2 hover:bg-white/10 rounded transition-colors"'

    old_mobile_wrap_open = '          <div className="md:hidden py-4 border-t border-white/10">'
    new_mobile_wrap_open = '          <div className="lg:hidden py-4 border-t border-white/10">'

    old_mobile_render = """            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-300 hover:text-[#E8C547] hover:bg-white/5 px-4 py-2 rounded transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="border-t border-white/10 my-2"></div>"""
    new_mobile_render = """            <div className="flex flex-col gap-1">
              <p className="px-4 pt-1 pb-1 text-[11px] uppercase tracking-wider text-gray-500">Do It Yourself</p>
              {diyLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-300 hover:text-[#E8C547] hover:bg-white/5 px-4 py-2 rounded transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <p className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-wider text-gray-500">Let Someone Do It</p>
              {serviceLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-300 hover:text-[#E8C547] hover:bg-white/5 px-4 py-2 rounded transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-white/10 my-2"></div>
              {siteLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-300 hover:text-[#E8C547] hover:bg-white/5 px-4 py-2 rounded transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-white/10 my-2"></div>"""

    apply(path, [
        (old_nav_block, new_nav_block),
        (old_desktop_render, new_desktop_render),
        (old_mobile_button, new_mobile_button),
        (old_mobile_wrap_open, new_mobile_wrap_open),
        (old_mobile_render, new_mobile_render),
    ])

    # 2. app/page.tsx -- homepage card
    apply(f"{REPO}/app/page.tsx", [
        ("Hire a Dedicated Recruiter", "AI + Recruiter"),
        (
            "Hire a dedicated recruiter to apply on your behalf daily to consulting and contract opportunities.",
            "A dedicated recruiter, matched by AI, applies on your behalf daily to consulting and contract opportunities.",
        ),
    ])

    # 3. app/pricing/PricingClient.tsx
    apply(f"{REPO}/app/pricing/PricingClient.tsx", [
        ("{/* NEW: Hire-a-Recruiter Section */}", "{/* AI + Recruiter Section */}"),
        ("Hire an Offshore Recruiter", "AI + Recruiter"),
    ])

    # 4. app/services/ServicesClient.tsx
    apply(f"{REPO}/app/services/ServicesClient.tsx", [
        ("{/* NEW: Service 3: Hire a Dedicated Recruiter */}", "{/* Service 3: AI + Recruiter */}"),
        (
            '<h2 className="text-2xl font-bold text-foreground premium-heading">Hire a Dedicated Recruiter</h2>',
            '<h2 className="text-2xl font-bold text-foreground premium-heading">AI + Recruiter</h2>',
        ),
    ])

    # 5. app/about/page.tsx
    apply(f"{REPO}/app/about/page.tsx", [
        (
            "<strong>Hire a Dedicated Recruiter</strong> — a professional offshore recruiter applies to",
            "<strong>AI + Recruiter</strong> — a professional, dedicated recruiter applies to",
        ),
    ])

    # 6. app/careers/page.tsx
    apply(f"{REPO}/app/careers/page.tsx", [
        (
            "Our Hire-a-Recruiter service is powered by professional offshore recruiters.",
            "Our AI + Recruiter service is powered by professional, dedicated recruiters.",
        ),
    ])

    # 7. app/jobs/JobsClient.tsx
    apply(f"{REPO}/app/jobs/JobsClient.tsx", [
        ("Hire a Recruiter Instead", "Try AI + Recruiter"),
        (
            '<a href="/hire-recruiter" className="text-primary underline underline-offset-2">Recruiter Job Search Service</a>',
            '<a href="/hire-recruiter" className="text-primary underline underline-offset-2">AI + Recruiter Job Search Service</a>',
        ),
    ])

    # 8. app/hire-recruiter/HireRecruiterClient.tsx -- H1
    apply(f"{REPO}/app/hire-recruiter/HireRecruiterClient.tsx", [
        (
            "Hire a Dedicated Offshore Recruiter for Your Job Search",
            "AI + Recruiter: A Dedicated Recruiter Applies for Your Job Search",
        ),
    ])

    # 9. app/hire-recruiter/page.tsx -- meta title/description/OG/Twitter
    apply(f"{REPO}/app/hire-recruiter/page.tsx", [
        (
            'title: "Recruiter Job Search Service | A Real Recruiter Applies to Jobs for You",',
            'title: "AI + Recruiter | A Dedicated Recruiter Applies to Jobs for You",',
        ),
        (
            'Stop applying alone. Hire a dedicated recruiter who applies to 90-900 jobs per month on your behalf. Monthly subscription for consulting and contract positions in tech. Plans from $199/month.',
            'Stop applying alone. AI + Recruiter pairs you with a dedicated recruiter who applies to 90-900 jobs per month on your behalf. Monthly subscription for consulting and contract positions in tech. Plans from $199/month.',
        ),
        (
            '"recruiter subscription service", "personal recruiter service",\n    "hire a recruiter for job search", "dedicated recruiter service",',
            '"recruiter subscription service", "personal recruiter service",\n    "hire a recruiter for job search", "dedicated recruiter service",\n    "ai recruiter job search", "ai matched recruiter service",',
        ),
        (
            'title: "Recruiter Job Search Service | A Real Recruiter Applies for You",\n    description: "Hire a dedicated recruiter who applies to 90-900 jobs monthly on your behalf. Plans from $199/month. No placement fees.",',
            'title: "AI + Recruiter | A Real Recruiter Applies for You",\n    description: "AI + Recruiter pairs you with a dedicated recruiter who applies to 90-900 jobs monthly on your behalf. Plans from $199/month. No placement fees.",',
        ),
        (
            'title: "Recruiter Applies to Jobs for You | Monthly Subscription",',
            'title: "AI + Recruiter Applies to Jobs for You | Monthly Subscription",',
        ),
    ])

    # 10. Contact form dropdown label + API label (values only, keys untouched
    # deliberately -- those are stored/analytics identifiers, not display text)
    apply(f"{REPO}/components/contact-form-client.tsx", [
        ("{ value: 'hire-recruiter-basic', label: 'Hire Recruiter - Basic Plan' },",
         "{ value: 'hire-recruiter-basic', label: 'AI + Recruiter - Basic Plan' },"),
        ("{ value: 'hire-recruiter-standard', label: 'Hire Recruiter - Standard Plan' },",
         "{ value: 'hire-recruiter-standard', label: 'AI + Recruiter - Standard Plan' },"),
        ("{ value: 'hire-recruiter-pro', label: 'Hire Recruiter - Pro Plan' },",
         "{ value: 'hire-recruiter-pro', label: 'AI + Recruiter - Pro Plan' },"),
    ])
    apply(f"{REPO}/app/api/contact/route.ts", [
        ("'hire-recruiter-basic': 'Hire Recruiter - Basic Plan',",
         "'hire-recruiter-basic': 'AI + Recruiter - Basic Plan',"),
        ("'hire-recruiter-standard': 'Hire Recruiter - Standard Plan',",
         "'hire-recruiter-standard': 'AI + Recruiter - Standard Plan',"),
        ("'hire-recruiter-pro': 'Hire Recruiter - Pro Plan',",
         "'hire-recruiter-pro': 'AI + Recruiter - Pro Plan',"),
    ])

    print("\nAll replacements applied successfully.")


if __name__ == "__main__":
    main()
