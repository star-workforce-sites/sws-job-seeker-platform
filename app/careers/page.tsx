import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = {
  title: 'Careers | STAR Workforce Solutions',
  description:
    'STAR Workforce Solutions is a small, distributed team building AI-powered career tools for consulting and contract professionals. See how to get in touch about opportunities.',
}

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <main className="py-12 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">Careers at STAR Workforce Solutions</h1>
            <p className="text-lg text-muted-foreground">
              We're a small, distributed team building AI-powered career tools and recruiter services for
              consulting and contract professionals.
            </p>
          </div>

          <Card className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">Current Openings</h2>
              <p className="text-muted-foreground">
                We don't have open roles posted on the site right now. We're a lean team and hire selectively as
                the platform grows — primarily for recruiting, product, and engineering roles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">Want to Be Considered for Future Roles?</h2>
              <p className="text-muted-foreground mb-4">
                If you'd like us to keep your resume on file for future openings, send it our way along with a
                short note about what you're looking for. We review every submission.
              </p>
              <Link href="/contact?subject=Careers Inquiry">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Submit Your Resume
                </Button>
              </Link>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">Interested in Recruiting for Us?</h2>
              <p className="text-muted-foreground">
                Our AI + Recruiter service is powered by professional, dedicated recruiters. If you have staffing
                or recruiting experience and are interested in working with us, mention that in your message and
                we'll follow up.
              </p>
            </section>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
