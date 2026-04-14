import { sql } from "@vercel/postgres"
import { redirect } from "next/navigation"
import { Metadata } from "next"
import Link from "next/link"
import Script from "next/script"

interface Props {
  params: Promise<{ code: string }>
}

async function getPartner(code: string) {
  const result = await sql`
    SELECT name, referral_code, tier, landing_headline, landing_bio, landing_image
    FROM partners
    WHERE referral_code = ${code.toLowerCase()} AND status = 'active'
    LIMIT 1
  `
  return result.rows[0] || null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  const partner = await getPartner(code)
  if (!partner) return { title: "Career Accel Platform" }

  return {
    title: `${partner.name} | Career Accel Platform — AI Resume Tools & Job Market Intelligence`,
    description: "AI-powered resume optimization, real-time consulting rate data, exclusive contract roles, and dedicated recruiter support. Free ATS scan included.",
    keywords: [
      "AI resume optimizer", "ATS resume checker", "career acceleration platform",
      "consulting rate data", "contract job search", "recruiter assistance",
      "resume distribution service", "job market intelligence", "career tools",
      "IT consulting jobs", "staffing agency alternative", "resume marketing",
    ].join(", "),
    openGraph: {
      title: `Career Accel Platform — AI-Powered Career Tools`,
      description: "AI resume optimization, real-time market intelligence, and recruiter support. Free to sign up.",
      url: `https://www.starworkforcesolutions.com/partner/${code}`,
      siteName: "Career Accel Platform",
      type: "website",
    },
    alternates: {
      canonical: `https://www.starworkforcesolutions.com/partner/${code}`,
    },
  }
}

export default async function PartnerLandingPage({ params }: Props) {
  const { code } = await params
  const partner = await getPartner(code)
  if (!partner) redirect("/")

  const headline = partner.landing_headline || "AI-Powered Tools to Help You Navigate the Job Market Smarter"
  const bio = partner.landing_bio || "Career Accel Platform combines AI resume analysis, real-time consulting rate data, exclusive contract roles from staffing firms, and optional recruiter support — all in one place."
  const ref = partner.referral_code
  const signupUrl = `/auth/signup?ref=${ref}`
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  return (
    <>
      {/* ── Google Analytics ─────────────────────────────── */}
      {gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga-partner" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', { page_path: window.location.pathname, send_page_view: true });
          `}</Script>
        </>
      )}

      {/* ── JSON-LD Structured Data ──────────────────────── */}
      <Script id="ld-json" type="application/ld+json" strategy="afterInteractive">{`
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Career Accel Platform — Partner Page",
          "description": "AI resume tools, market intelligence, and recruiter support for job seekers.",
          "url": "https://www.starworkforcesolutions.com/partner/${ref}",
          "publisher": {
            "@type": "Organization",
            "name": "STAR Workforce Solutions",
            "legalName": "Startek LLC",
            "url": "https://www.starworkforcesolutions.com"
          }
        }
      `}</Script>

      <div className="min-h-screen bg-[#0A1A2F]" style={{ fontFamily: "'Open Sans', sans-serif" }}>

        {/* ═══════════════════════════════════════════════════ */}
        {/* HEADER                                             */}
        {/* ═══════════════════════════════════════════════════ */}
        <header className="border-b border-white/10 bg-[#0A1A2F]/95 backdrop-blur-xl sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              {/* Same logo as login/nav */}
              <div className="w-9 h-9 bg-[#E8C547] rounded flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-[#0A1A2F]" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <div className="hidden sm:block leading-tight">
                <span className="text-white font-bold text-sm tracking-wider block" style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700 }}>
                  Career Accel Platform
                </span>
                <span className="text-gray-500 text-[10px] tracking-wide" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  powered by STAR Workforce Solutions
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="text-gray-400 hover:text-white text-sm transition hidden sm:inline">
                Sign In
              </Link>
              <Link href={signupUrl} className="bg-[#E8C547] text-[#0A1A2F] px-5 py-2 rounded-lg font-bold text-sm hover:bg-[#D4AF37] transition shadow-lg shadow-[#E8C547]/20">
                Get Started Free
              </Link>
            </div>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════ */}
        {/* HERO                                               */}
        {/* ═══════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden">
          {/* Subtle gradient backdrop */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A1A2F] via-[#132A47] to-[#0A1A2F]" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E8C547]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 text-center">
            {partner.landing_image && (
              <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 border-2 border-[#E8C547]/50 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={partner.landing_image} alt={partner.name} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="inline-flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
              <span className="text-[#E8C547] text-sm" style={{ fontFamily: "Montserrat, sans-serif" }}>Recommended by <strong>{partner.name}</strong></span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 leading-tight max-w-3xl mx-auto" style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700 }}>
              {headline}
            </h1>

            <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              {bio}
            </p>

            <Link href={signupUrl} className="inline-flex items-center bg-[#E8C547] text-[#0A1A2F] px-8 py-3.5 rounded-lg font-bold text-base hover:bg-[#D4AF37] transition shadow-xl shadow-[#E8C547]/20 hover:shadow-[#E8C547]/35" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Create Your Free Account
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <p className="text-gray-500 text-xs mt-4">No credit card required &middot; Free ATS scan included</p>

            {/* Disclaimer inline */}
            <p className="text-gray-600 text-[11px] mt-6 max-w-lg mx-auto">
              Not a staffing agency. Services paid upfront. No placement guarantees.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════ */}
        {/* WHAT YOU GET FREE                                   */}
        {/* ═══════════════════════════════════════════════════ */}
        <section className="bg-[#0D2137] border-y border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="text-center mb-12">
              <span className="inline-block bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1 text-green-400 text-xs font-semibold tracking-wider uppercase mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>Included Free</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3" style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700 }}>
                Tools You Can Use <span className="text-[#E8C547]">Right Away</span>
              </h2>
              <p className="text-gray-400 text-sm max-w-lg mx-auto">
                Create an account and start using these features immediately. No trial. No expiration.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0A1A2F] border border-white/10 rounded-xl p-6 hover:border-green-500/20 transition">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-white font-semibold text-base mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>ATS Resume Scan</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Upload your resume and get an instant compatibility score. See what applicant tracking systems see — formatting issues, missing keywords, and areas for improvement.
                </p>
              </div>

              <div className="bg-[#0A1A2F] border border-white/10 rounded-xl p-6 hover:border-green-500/20 transition">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <h3 className="text-white font-semibold text-base mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>Real-Time Market Intelligence</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Live consulting rate ranges by industry, the hottest hiring sectors, and demand trends — pulled from real job postings and updated daily so you can negotiate with confidence.
                </p>
              </div>

              <div className="bg-[#0A1A2F] border border-white/10 rounded-xl p-6 hover:border-green-500/20 transition">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-white font-semibold text-base mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>Exclusive Contract &amp; Consulting Roles</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Access a live feed of urgent contract and consulting roles sourced from staffing firms through our CHRM NEXUS integration — roles that are often filled before they reach public job boards.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════ */}
        {/* CHRM NEXUS / EXCLUSIVE ROLES                       */}
        {/* ═══════════════════════════════════════════════════ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <span className="inline-block bg-blue-500/10 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider" style={{ fontFamily: "Montserrat, sans-serif" }}>CHRM NEXUS Integration</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4" style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700 }}>
                Roles You Won&apos;t Find on Job Boards
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-5">
                Most contract and consulting positions are filled before they&apos;re posted publicly. Through our CHRM NEXUS connection, Career Accel surfaces urgent roles directly from staffing firms and employers — including end-client details, rate ranges, and location requirements.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "Urgent roles from staffing firms updated in real time",
                  "See the posting company, end client, and industry",
                  "Filter by location, contract type, and rate range",
                  "Save roles and track your application activity",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-[#E8C547] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href={signupUrl} className="inline-flex items-center text-[#E8C547] font-semibold text-sm hover:underline" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Sign up to browse roles
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>

            {/* Rate preview cards */}
            <div className="flex-1 w-full">
              <div className="bg-[#0D2137] border border-white/10 rounded-xl p-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>Sample Market Rate Ranges</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { industry: "Technology", range: "$55–85/hr" },
                    { industry: "Healthcare IT", range: "$50–75/hr" },
                    { industry: "Financial Services", range: "$60–95/hr" },
                    { industry: "Government", range: "$45–70/hr" },
                    { industry: "Energy", range: "$55–80/hr" },
                    { industry: "Manufacturing", range: "$45–65/hr" },
                  ].map((item) => (
                    <div key={item.industry} className="bg-[#0A1A2F] rounded-lg px-3 py-2.5 border border-white/5">
                      <p className="text-gray-500 text-xs">{item.industry}</p>
                      <p className="text-[#E8C547] font-bold text-sm" style={{ fontFamily: "Montserrat, sans-serif" }}>{item.range}</p>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-[10px] mt-3">* Illustrative ranges. Live data updates daily on your dashboard.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════ */}
        {/* PREMIUM SERVICES                                    */}
        {/* ═══════════════════════════════════════════════════ */}
        <section className="bg-[#0D2137] border-y border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3" style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700 }}>
                Premium Career Tools
              </h2>
              <p className="text-gray-400 text-sm max-w-lg mx-auto">
                Affordable, one-time purchases. No subscriptions required for AI tools.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* ATS Optimizer */}
              <div className="bg-[#0A1A2F] border border-white/10 rounded-xl p-5 hover:border-[#E8C547]/30 transition flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-4.5 h-4.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <span className="text-[#E8C547] font-bold text-sm" style={{ fontFamily: "Montserrat, sans-serif" }}>$5</span>
                </div>
                <h3 className="text-white font-semibold text-sm mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>ATS Resume Optimizer</h3>
                <p className="text-gray-400 text-xs leading-relaxed flex-1">
                  AI rewrites your resume to align with a specific job posting — keyword optimization, formatting fixes, and a detailed score breakdown.
                </p>
              </div>

              {/* Cover Letter */}
              <div className="bg-[#0A1A2F] border border-white/10 rounded-xl p-5 hover:border-[#E8C547]/30 transition flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-4.5 h-4.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </div>
                  <span className="text-[#E8C547] font-bold text-sm" style={{ fontFamily: "Montserrat, sans-serif" }}>$5</span>
                </div>
                <h3 className="text-white font-semibold text-sm mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>AI Cover Letter Generator</h3>
                <p className="text-gray-400 text-xs leading-relaxed flex-1">
                  Generates a unique, role-specific cover letter referencing the company, job requirements, and your experience.
                </p>
              </div>

              {/* Resume Distribution */}
              <div className="bg-[#0A1A2F] border border-white/10 rounded-xl p-5 hover:border-[#E8C547]/30 transition flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-4.5 h-4.5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </div>
                  <span className="text-[#E8C547] font-bold text-sm" style={{ fontFamily: "Montserrat, sans-serif" }}>$149</span>
                </div>
                <h3 className="text-white font-semibold text-sm mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>ResumeBlast Distribution</h3>
                <p className="text-gray-400 text-xs leading-relaxed flex-1">
                  Your resume gets sent to 1,000+ recruiters and hiring managers in your target industry and location.
                </p>
              </div>

              {/* Recruiter Assistance */}
              <div className="bg-[#0A1A2F] border border-[#E8C547]/20 rounded-xl p-5 hover:border-[#E8C547]/40 transition flex flex-col relative">
                <div className="absolute -top-2.5 right-4 bg-[#E8C547] text-[#0A1A2F] text-[10px] font-bold px-2.5 py-0.5 rounded-full" style={{ fontFamily: "Montserrat, sans-serif" }}>POPULAR</div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 bg-[#E8C547]/10 rounded-lg flex items-center justify-center">
                    <svg className="w-4.5 h-4.5 text-[#E8C547]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <span className="text-[#E8C547] font-bold text-sm" style={{ fontFamily: "Montserrat, sans-serif" }}>From $199/mo</span>
                </div>
                <h3 className="text-white font-semibold text-sm mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>Recruiter Assistance</h3>
                <p className="text-gray-400 text-xs leading-relaxed flex-1">
                  A dedicated recruiter submits 90–900 applications per month on your behalf — handling outreach, follow-ups, and coordination.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════ */}
        {/* HOW IT WORKS                                        */}
        {/* ═══════════════════════════════════════════════════ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12" style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700 }}>
            How It Works
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { step: "1", title: "Create Account", desc: "Sign up free in 30 seconds. No credit card." },
              { step: "2", title: "Scan Your Resume", desc: "Get a free ATS compatibility score and improvement areas." },
              { step: "3", title: "Explore the Market", desc: "Browse rate data, hot industries, and exclusive contract roles." },
              { step: "4", title: "Take Action", desc: "Optimize your resume, generate cover letters, or enlist recruiter help." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 bg-[#E8C547] text-[#0A1A2F] rounded-full flex items-center justify-center font-bold text-base mx-auto mb-3" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  {item.step}
                </div>
                <h3 className="text-white font-semibold text-sm mb-1.5" style={{ fontFamily: "Montserrat, sans-serif" }}>{item.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════ */}
        {/* STATS BAR                                           */}
        {/* ═══════════════════════════════════════════════════ */}
        <section className="bg-[#0D2137] border-y border-white/5">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-[#E8C547]" style={{ fontFamily: "Montserrat, sans-serif" }}>500+</div>
                <div className="text-gray-500 text-xs mt-1">Active Job Listings</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#E8C547]" style={{ fontFamily: "Montserrat, sans-serif" }}>8+</div>
                <div className="text-gray-500 text-xs mt-1">Industries Tracked</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#E8C547]" style={{ fontFamily: "Montserrat, sans-serif" }}>1,000+</div>
                <div className="text-gray-500 text-xs mt-1">Recruiter Network</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#E8C547]" style={{ fontFamily: "Montserrat, sans-serif" }}>Daily</div>
                <div className="text-gray-500 text-xs mt-1">Market Data Updates</div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════ */}
        {/* FINAL CTA                                           */}
        {/* ═══════════════════════════════════════════════════ */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4" style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700 }}>
            Ready to Take the Next Step?
          </h2>
          <p className="text-gray-400 text-sm mb-3 max-w-lg mx-auto">
            Create a free account to access your ATS scan, market intelligence dashboard, and exclusive contract roles. Upgrade to premium tools only when you&apos;re ready.
          </p>
          <p className="text-gray-600 text-xs mb-8">
            Not a staffing agency. Services paid upfront. No placement guarantees.
          </p>
          <Link href={signupUrl} className="inline-flex items-center bg-[#E8C547] text-[#0A1A2F] px-10 py-4 rounded-lg font-bold text-base hover:bg-[#D4AF37] transition shadow-xl shadow-[#E8C547]/20" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Create Your Free Account
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
          <p className="text-gray-600 text-[11px] mt-3">No credit card required</p>
        </section>

        {/* ═══════════════════════════════════════════════════ */}
        {/* FOOTER                                              */}
        {/* ═══════════════════════════════════════════════════ */}
        <footer className="border-t border-white/10 bg-[#07111F]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            {/* Legal Disclaimer */}
            <div className="mb-8 text-center">
              <p className="text-gray-500 text-[11px] leading-relaxed max-w-3xl mx-auto">
                STAR Workforce Solutions is a resume marketing and distribution service. We do not guarantee employment.
                We are not a staffing agency or employment agency. We charge for resume marketing and recruiter support
                services, not job placement. Offshore recruiters are independent contractors and not employees of the
                job seeker or STAR Workforce Solutions. All services are paid upfront and are NOT contingent on job
                placement. AI tools may be used to assist with resume analysis and distribution. Users must verify all
                AI-generated output.
              </p>
            </div>

            {/* Compliance badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {[
                { label: "256-bit SSL", icon: "🔒" },
                { label: "GDPR Compliant", icon: "🛡️" },
                { label: "FTC Compliant", icon: "✓" },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                  <span className="text-xs">{badge.icon}</span>
                  <span className="text-gray-400 text-[10px] font-medium">{badge.label}</span>
                </div>
              ))}
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-4 mb-6 text-[11px]">
              <Link href="/privacy" className="text-gray-500 hover:text-gray-300 transition">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-500 hover:text-gray-300 transition">Terms of Service</Link>
              <Link href="/disclaimer" className="text-gray-500 hover:text-gray-300 transition">Disclaimer</Link>
              <Link href="/contact" className="text-gray-500 hover:text-gray-300 transition">Contact</Link>
            </div>

            {/* Branding */}
            <div className="text-center">
              <p className="text-white font-bold text-sm" style={{ fontFamily: "Montserrat, sans-serif" }}>Career Accel Platform</p>
              <p className="text-gray-600 text-[10px] mt-1">Powered by STAR Workforce Solutions</p>
              <p className="text-gray-600 text-[10px] mt-2">
                &copy; {new Date().getFullYear()} STAR Workforce Solutions. All rights reserved. Since 2013. Consulting &amp; Contract Services Only — USA &amp; Canada.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
