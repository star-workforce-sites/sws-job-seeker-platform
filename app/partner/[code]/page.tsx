import { sql } from "@vercel/postgres"
import { redirect } from "next/navigation"
import { Metadata } from "next"
import Link from "next/link"

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
    title: `${partner.name} — Career Accel Platform | AI-Powered Job Search`,
    description: partner.landing_headline || `Stop applying blindly. Get AI-powered resume optimization, real-time market intelligence, and recruiter support. Referred by ${partner.name}.`,
  }
}

export default async function PartnerLandingPage({ params }: Props) {
  const { code } = await params
  const partner = await getPartner(code)

  if (!partner) {
    redirect("/")
  }

  const headline = partner.landing_headline || "Stop Sending Resumes Into the Void"
  const bio = partner.landing_bio || `Most job seekers waste months applying with the wrong resume to the wrong roles. Career Accel Platform uses AI and real market data to fix that — so you spend less time applying and more time interviewing.`

  const signupUrl = `/auth/signup?ref=${partner.referral_code}`

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1A2F] via-[#132A47] to-[#0A1A2F]">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="border-b border-white/10 bg-[#0A1A2F]/90 backdrop-blur-lg sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[#E8C547] font-bold text-lg">Career Accel Platform</span>
            <span className="text-gray-500 text-xs hidden sm:inline">powered by STAR Workforce Solutions</span>
          </Link>
          <Link
            href={signupUrl}
            className="bg-[#E8C547] text-[#0A1A2F] px-5 py-2 rounded-lg font-bold hover:bg-[#D4AF37] transition text-sm shadow-lg shadow-[#E8C547]/20"
          >
            Start Free
          </Link>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pt-16 md:pt-24 pb-8 text-center">
        {partner.landing_image && (
          <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-5 border-2 border-[#E8C547]/60 shadow-lg shadow-[#E8C547]/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={partner.landing_image} alt={partner.name} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="inline-block bg-[#E8C547]/10 border border-[#E8C547]/30 rounded-full px-4 py-1.5 mb-6">
          <span className="text-[#E8C547] text-sm font-medium">Recommended by {partner.name}</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight max-w-4xl mx-auto">
          {headline}
        </h1>

        <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
          {bio}
        </p>

        {/* Hero CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Link
            href={signupUrl}
            className="inline-flex items-center justify-center bg-[#E8C547] text-[#0A1A2F] px-10 py-4 rounded-xl font-bold text-lg hover:bg-[#D4AF37] transition shadow-xl shadow-[#E8C547]/25 hover:shadow-[#E8C547]/40"
          >
            Create Your Free Account
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
        </div>
        <p className="text-gray-500 text-sm">No credit card required. Free ATS scan + market intelligence included.</p>
      </section>

      {/* ── Free Features Highlight ────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <span className="inline-block bg-green-500/10 border border-green-500/30 rounded-full px-4 py-1 text-green-400 text-sm font-medium mb-4">FREE — No Purchase Required</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            See What You Get <span className="text-[#E8C547]">Before You Pay</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Sign up and instantly access these tools — no trial period, no expiration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-lg border border-green-500/20 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">FREE</div>
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-white font-bold text-lg mb-2">Free ATS Resume Scan</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Upload your resume and get an instant ATS compatibility score. See exactly what recruiters and applicant tracking systems see — formatting issues, missing keywords, and how your resume stacks up.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-green-500/20 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">FREE</div>
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-white font-bold text-lg mb-2">Real-Time Market Intelligence</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              See live consulting rate ranges by industry, the hottest job markets, which sectors are hiring now, and what employers are actually paying. Data pulled from real job postings — updated daily.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-green-500/20 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">FREE</div>
            <div className="text-4xl mb-4">🔥</div>
            <h3 className="text-white font-bold text-lg mb-2">Hot Jobs &amp; Live Feed</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Access a live feed of consulting and contract roles from staffing firms across the country. See which jobs are trending, save roles you like, and get a head start before they fill up.
            </p>
          </div>
        </div>
      </section>

      {/* ── The Problem / Solution ─────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-red-500/5 to-transparent border border-red-500/10 rounded-2xl p-8 md:p-10 mb-8">
          <h3 className="text-red-400 font-bold text-sm uppercase tracking-wider mb-3">The Problem</h3>
          <p className="text-white text-xl md:text-2xl font-medium leading-relaxed">
            75% of resumes are rejected by ATS software before a human ever sees them. You could be the perfect candidate — and still get auto-filtered because of formatting, missing keywords, or a generic cover letter.
          </p>
        </div>

        <div className="bg-gradient-to-r from-[#E8C547]/5 to-transparent border border-[#E8C547]/20 rounded-2xl p-8 md:p-10">
          <h3 className="text-[#E8C547] font-bold text-sm uppercase tracking-wider mb-3">The Solution</h3>
          <p className="text-white text-xl md:text-2xl font-medium leading-relaxed">
            Career Accel Platform uses GPT-4o AI to rewrite your resume for each role, generate targeted cover letters, and show you real-time market data so you know <em className="text-[#E8C547]">exactly</em> where to aim and what to charge.
          </p>
        </div>
      </section>

      {/* ── Paid Services ──────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Premium Tools That <span className="text-[#E8C547]">Land Interviews</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Affordable, one-time purchases. No subscriptions required for AI tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ATS Optimizer */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:border-[#E8C547]/40 transition group">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-500/10 rounded-lg p-3">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <span className="bg-[#E8C547]/10 text-[#E8C547] font-bold px-3 py-1 rounded-full text-sm">$5</span>
            </div>
            <h3 className="text-white font-bold text-xl mb-2">ATS Resume Optimizer</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              AI rewrites your resume to pass ATS filters for a specific job posting. Get keyword optimization, formatting fixes, and a detailed score breakdown. One purchase, unlimited revisions for that role.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded">ATS Score Analysis</span>
              <span className="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded">Keyword Matching</span>
              <span className="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded">PDF Export</span>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:border-[#E8C547]/40 transition group">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-purple-500/10 rounded-lg p-3">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
              <span className="bg-[#E8C547]/10 text-[#E8C547] font-bold px-3 py-1 rounded-full text-sm">$5</span>
            </div>
            <h3 className="text-white font-bold text-xl mb-2">AI Cover Letter Generator</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Generates a unique, role-specific cover letter that references the company, the job requirements, and your experience. No more generic templates — each letter is one-of-a-kind.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded">Job-Matched</span>
              <span className="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded">Company Research</span>
              <span className="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded">Tone Customization</span>
            </div>
          </div>

          {/* Resume Distribution */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:border-[#E8C547]/40 transition group">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-orange-500/10 rounded-lg p-3">
                <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </div>
              <span className="bg-[#E8C547]/10 text-[#E8C547] font-bold px-3 py-1 rounded-full text-sm">$149</span>
            </div>
            <h3 className="text-white font-bold text-xl mb-2">ResumeBlast Distribution</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Your resume gets sent directly to 1,000+ recruiters and hiring managers in your target industry and location. Skip the job boards — let opportunities come to you.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded">1,000+ Recruiters</span>
              <span className="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded">Industry Targeted</span>
              <span className="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded">Location Filtered</span>
            </div>
          </div>

          {/* Recruiter Assistance */}
          <div className="bg-white/5 backdrop-blur-lg border border-[#E8C547]/20 rounded-xl p-6 hover:border-[#E8C547]/40 transition group relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#E8C547] text-[#0A1A2F] text-xs font-bold px-3 py-1 rounded-bl-lg">MOST POPULAR</div>
            <div className="flex items-start justify-between mb-4">
              <div className="bg-[#E8C547]/10 rounded-lg p-3">
                <svg className="w-6 h-6 text-[#E8C547]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <span className="bg-[#E8C547]/10 text-[#E8C547] font-bold px-3 py-1 rounded-full text-sm">From $199/mo</span>
            </div>
            <h3 className="text-white font-bold text-xl mb-2">Recruiter Assistance Program</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              A dedicated recruiter applies to 90 to 900 jobs per month on your behalf. They handle the grind — submitting applications, following up, and coordinating interviews — while you focus on preparing.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-[#E8C547]/10 text-[#E8C547] px-2 py-1 rounded">Basic: 90-150/mo</span>
              <span className="text-xs bg-[#E8C547]/10 text-[#E8C547] px-2 py-1 rounded">Standard: 300-450/mo</span>
              <span className="text-xs bg-[#E8C547]/10 text-[#E8C547] px-2 py-1 rounded">Pro: 600-900/mo</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: "1", title: "Sign Up Free", desc: "Create your account in 30 seconds. No credit card needed." },
            { step: "2", title: "Get Your Score", desc: "Upload your resume for a free ATS scan and market intel dashboard." },
            { step: "3", title: "Optimize & Apply", desc: "Use AI tools to tailor your resume and cover letter for each role." },
            { step: "4", title: "Land Interviews", desc: "Let our recruiters handle the volume or distribute your resume to 1,000+." },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 bg-[#E8C547] text-[#0A1A2F] rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="text-white font-bold mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Market Intel Preview ────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 md:p-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <span className="inline-block bg-blue-500/10 text-blue-400 text-xs font-bold px-3 py-1 rounded-full mb-4">MARKET INTELLIGENCE</span>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Know Your Worth Before You Negotiate
              </h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Our dashboard pulls live data from job postings across the country to show you real consulting and contract rate ranges by industry. See what Healthcare IT, Financial Services, Technology, and other sectors are paying right now — so you never undersell yourself.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { industry: "Technology", range: "$55-85/hr" },
                  { industry: "Healthcare IT", range: "$50-75/hr" },
                  { industry: "Financial Services", range: "$60-95/hr" },
                  { industry: "Government", range: "$45-70/hr" },
                ].map((item) => (
                  <div key={item.industry} className="bg-white/5 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-500">{item.industry}</p>
                    <p className="text-[#E8C547] font-bold">{item.range}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-3">* Sample ranges. Live data updates daily on your dashboard.</p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4 w-full">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                <div className="text-3xl font-bold text-[#E8C547]">500+</div>
                <div className="text-gray-400 text-xs mt-1">Active Job Listings</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                <div className="text-3xl font-bold text-[#E8C547]">95%</div>
                <div className="text-gray-400 text-xs mt-1">ATS Pass Rate</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                <div className="text-3xl font-bold text-[#E8C547]">8+</div>
                <div className="text-gray-400 text-xs mt-1">Industries Tracked</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                <div className="text-3xl font-bold text-[#E8C547]">1,000+</div>
                <div className="text-gray-400 text-xs mt-1">Recruiter Network</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-b from-[#E8C547]/10 to-transparent border border-[#E8C547]/30 rounded-2xl p-10 md:p-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Your Next Interview Starts Here
          </h2>
          <p className="text-gray-300 text-lg mb-4 max-w-xl mx-auto">
            Join hundreds of job seekers who stopped guessing and started landing interviews with AI-powered tools and real market data.
          </p>
          <p className="text-[#E8C547] font-medium mb-8">
            Free to sign up. Free ATS scan. Free market intelligence. No catch.
          </p>
          <Link
            href={signupUrl}
            className="inline-flex items-center justify-center bg-[#E8C547] text-[#0A1A2F] px-12 py-5 rounded-xl font-bold text-xl hover:bg-[#D4AF37] transition shadow-xl shadow-[#E8C547]/25 hover:shadow-[#E8C547]/40"
          >
            Create Your Free Account
            <svg className="w-6 h-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
          <p className="text-gray-600 text-xs mt-4">No credit card required</p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-[#E8C547] font-bold text-sm">Career Accel Platform</p>
            <p className="text-gray-600 text-xs">Powered by STAR Workforce Solutions &middot; A Startek LLC Property</p>
          </div>
          <p className="text-gray-600 text-xs">
            &copy; {new Date().getFullYear()} Startek LLC. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
