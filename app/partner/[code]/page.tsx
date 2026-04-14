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
    title: `${partner.name} — Career Accel Platform`,
    description: partner.landing_headline || `Accelerate your career with STAR Workforce Solutions. Referred by ${partner.name}.`,
  }
}

export default async function PartnerLandingPage({ params }: Props) {
  const { code } = await params
  const partner = await getPartner(code)

  if (!partner) {
    redirect("/")
  }

  const headline = partner.landing_headline || "Accelerate Your Career with AI-Powered Tools"
  const bio = partner.landing_bio || `I partner with STAR Workforce Solutions to help job seekers like you land their dream roles faster. Sign up through my link and get access to the Career Accel Platform — ATS-optimized resumes, AI cover letters, recruiter support, and more.`

  const services = [
    {
      title: "ATS Resume Optimizer",
      description: "AI-powered resume analysis that beats applicant tracking systems",
      price: "$5",
      icon: "📄",
    },
    {
      title: "AI Cover Letter Generator",
      description: "Tailored cover letters matched to each job posting",
      price: "$5",
      icon: "✍️",
    },
    {
      title: "Resume Distribution",
      description: "Get your resume in front of 1,000+ recruiters via ResumeBlast",
      price: "$149",
      icon: "🚀",
    },
    {
      title: "Recruiter Assistance",
      description: "Dedicated recruiter applying to 90–900 jobs/month on your behalf",
      price: "From $199/mo",
      icon: "👤",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1A2F] via-[#132A47] to-[#0A1A2F]">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-[#E8C547] font-bold text-xl">
            STAR Workforce Solutions
          </Link>
          <Link
            href={`/auth/signup?ref=${partner.referral_code}`}
            className="bg-[#E8C547] text-[#0A1A2F] px-6 py-2.5 rounded-lg font-bold hover:bg-[#D4AF37] transition text-sm"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-12 text-center">
        {partner.landing_image && (
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-6 border-3 border-[#E8C547]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={partner.landing_image} alt={partner.name} className="w-full h-full object-cover" />
          </div>
        )}

        <p className="text-[#E8C547] font-medium mb-3 text-sm uppercase tracking-wider">
          Recommended by {partner.name}
        </p>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight max-w-3xl mx-auto">
          {headline}
        </h1>

        <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          {bio}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/auth/signup?ref=${partner.referral_code}`}
            className="inline-block bg-[#E8C547] text-[#0A1A2F] px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#D4AF37] transition shadow-lg"
          >
            Create Free Account
          </Link>
          <Link
            href="/#services"
            className="inline-block border border-white/30 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition"
          >
            Explore Services
          </Link>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-white text-center mb-10">
          Career Accel Platform Services
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:border-[#E8C547]/30 transition"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{service.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-bold text-lg">{service.title}</h3>
                    <span className="text-[#E8C547] font-bold">{service.price}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{service.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="grid grid-cols-3 gap-8">
          <div>
            <div className="text-3xl font-bold text-[#E8C547]">500+</div>
            <div className="text-gray-400 text-sm mt-1">Job Seekers Helped</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#E8C547]">95%</div>
            <div className="text-gray-400 text-sm mt-1">ATS Pass Rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#E8C547]">1,000+</div>
            <div className="text-gray-400 text-sm mt-1">Recruiter Network</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white/5 backdrop-blur-lg border border-[#E8C547]/30 rounded-2xl p-10">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Accelerate Your Career?</h2>
          <p className="text-gray-300 mb-8 max-w-lg mx-auto">
            Join thousands of job seekers who have transformed their job search with AI-powered tools and expert recruiter support.
          </p>
          <Link
            href={`/auth/signup?ref=${partner.referral_code}`}
            className="inline-block bg-[#E8C547] text-[#0A1A2F] px-10 py-4 rounded-lg font-bold text-lg hover:bg-[#D4AF37] transition shadow-lg"
          >
            Get Started — It&apos;s Free to Sign Up
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Startek LLC. All rights reserved.{" "}
            <Link href="/" className="text-gray-400 hover:text-white transition">
              starworkforcesolutions.com
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
