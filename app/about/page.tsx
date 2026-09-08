import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export const metadata = {
  title: 'About Us | STAR Workforce Solutions',
  description:
    'STAR Workforce Solutions has helped consulting and contract professionals accelerate their job search since 2013 with AI-powered resume tools, recruiter distribution, and dedicated application support.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <main className="py-12 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">About STAR Workforce Solutions</h1>
            <p className="text-lg text-muted-foreground">
              Since 2013 — helping consulting and contract professionals get in front of the recruiters who are
              actually hiring.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mb-10 text-center">
            <Card className="p-6">
              <div className="text-3xl font-bold text-primary mb-1">12+</div>
              <p className="text-sm text-muted-foreground">Years of Excellence</p>
            </Card>
            <Card className="p-6">
              <div className="text-3xl font-bold text-primary mb-1">10,000+</div>
              <p className="text-sm text-muted-foreground">Professionals Served</p>
            </Card>
            <Card className="p-6">
              <div className="text-3xl font-bold text-primary mb-1">1,300+</div>
              <p className="text-sm text-muted-foreground">Verified Recruiter Contacts</p>
            </Card>
          </div>

          <Card className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">What We Do</h2>
              <p className="text-muted-foreground mb-3">
                STAR Workforce Solutions is a resume marketing and career-services platform built specifically for
                consulting and contract professionals in Software, AI/ML, Cloud, Cybersecurity, DevOps, and Data
                Engineering. We are not a staffing agency and we do not guarantee job placement. Instead, we give
                job seekers the same tools and reach that top recruiters use, so their resume gets in front of the
                right people faster.
              </p>
              <p className="text-muted-foreground">Our platform gives job seekers two paths, and they can use either or both:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li>
                  <strong>DIY tools</strong> — an AI-powered ATS optimizer, cover letter generator, interview
                  prep, and a searchable job board, all available as low-cost, one-time purchases with no
                  subscription required.
                </li>
                <li>
                  <strong>AI + Recruiter</strong> — a professional, dedicated recruiter applies to
                  consulting and contract roles on your behalf every day, so you can focus on interview prep
                  instead of the job boards.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Our Approach</h2>
              <p className="text-muted-foreground">
                75% of resumes are rejected by applicant tracking systems before a human ever sees them. We built
                our tools around that single problem: helping a genuinely qualified candidate's resume survive the
                filters and reach a real recruiter. Everything we charge for is paid upfront and is not contingent
                on you getting hired — we are transparent about that on every pricing page because we think it
                matters to know exactly what you're paying for.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Get in Touch</h2>
              <p className="text-muted-foreground">
                Have a question about our services, a partnership idea, or feedback on the platform? We'd like to
                hear from you.
              </p>
              <p className="mt-3">
                <Link href="/contact" className="text-primary underline hover:text-accent">
                  Contact our team
                </Link>
                {' · '}
                <a href="mailto:info@starworkforcesolutions.com" className="text-primary underline hover:text-accent">
                  info@starworkforcesolutions.com
                </a>
              </p>
            </section>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
