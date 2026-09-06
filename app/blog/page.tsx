import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export const metadata = {
  title: 'Blog | Career & Job Search Tips | STAR Workforce Solutions',
  description:
    'Practical, no-fluff advice on beating ATS filters, writing cover letters that get read, and running an efficient consulting or contract job search.',
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <main className="py-12 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">STAR Workforce Blog</h1>
            <p className="text-lg text-muted-foreground">
              Practical, no-fluff advice for consulting and contract job seekers.
            </p>
          </div>

          <div className="space-y-8">
            <Card className="p-8" id="beat-the-ats">
              <p className="text-sm text-muted-foreground mb-2">STAR Workforce Solutions Team</p>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Why 75% of Resumes Never Reach a Human — and How to Fix Yours
              </h2>
              <div className="text-muted-foreground space-y-3">
                <p>
                  Most mid-size and large companies now screen resumes with an Applicant Tracking System (ATS)
                  before a recruiter ever opens them. These systems parse your resume into fields — job titles,
                  dates, skills, keywords — and rank or filter candidates automatically. A resume that's
                  formatted for a human reader (columns, graphics, unusual headers, text boxes) often parses
                  incorrectly or drops content entirely, which is a big part of why so many qualified candidates
                  never make it past this first step.
                </p>
                <p>The fixes that matter most are almost always structural, not stylistic:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Use a single-column layout with standard section headers (Experience, Education, Skills).</li>
                  <li>Mirror the exact keywords and skill names used in the job description, not just synonyms.</li>
                  <li>Avoid tables, text boxes, and headers/footers for content the ATS needs to read.</li>
                  <li>Save as a standard .docx or text-based PDF — not a scanned image or design-tool export.</li>
                </ul>
                <p>
                  Our{' '}
                  <Link href="/tools/ats-optimizer" className="text-primary underline hover:text-accent">
                    ATS Optimizer
                  </Link>{' '}
                  scans your resume against a specific job description and flags exactly which of these issues
                  apply to you, with a keyword gap list you can fix in minutes.
                </p>
              </div>
            </Card>

            <Card className="p-8" id="cover-letters-that-get-read">
              <p className="text-sm text-muted-foreground mb-2">STAR Workforce Solutions Team</p>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Cover Letters for Consulting Roles: What Actually Gets Read
              </h2>
              <div className="text-muted-foreground space-y-3">
                <p>
                  For contract and consulting roles specifically, hiring managers and staffing coordinators are
                  usually skimming dozens of submissions for one open requirement. A generic "I am excited to
                  apply" cover letter gets skipped in seconds. What tends to get read is short, specific, and
                  answers one question: can this person start this engagement and deliver on day one?
                </p>
                <p>A cover letter that works for consulting/contract roles usually does three things in the first two lines:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Names the exact role and, if relevant, the client or technology stack from the posting.</li>
                  <li>States your availability (start date, contract length you're open to, remote/hybrid/onsite).</li>
                  <li>Leads with one concrete, relevant accomplishment — not a summary of your whole career.</li>
                </ul>
                <p>
                  Our{' '}
                  <Link href="/tools/cover-letter" className="text-primary underline hover:text-accent">
                    Cover Letter Generator
                  </Link>{' '}
                  builds a first draft tailored to the specific job description you paste in, which is usually a
                  faster starting point than a blank page — always read it over and adjust it in your own voice
                  before sending.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
