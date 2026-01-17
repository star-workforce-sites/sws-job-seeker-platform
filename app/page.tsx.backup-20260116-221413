"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import {
  FileText,
  Users,
  Briefcase,
  Sparkles,
  MessageSquare,
  Users2,
  Award,
  TrendingUp,
  Shield,
  CheckCircle,
} from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section
        className="text-primary-foreground py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(to bottom right, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.70) 50%, rgba(0, 0, 0, 0.30) 100%), url(/images/professional-deep-blue-and-gold-abstract-corporate-background-with-subtle-network-connections-920ce753.png)",
          backgroundSize: "auto, cover",
          backgroundPosition: "center, center",
          backgroundAttachment: "scroll, fixed",
        }}
      >
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm">
              <Award className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-white/95 premium-body">
                Since 2013 — 12+ Years Excellence in Workforce Solutions
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight premium-heading">
              <span className="text-white">Accelerate Your Career with</span>
              <br />
              <span className="text-secondary">Strategic Resume Distribution</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed font-light premium-body">
              Get instant visibility to top recruiters across USA & Canada. Distributed to leading companies in
              Software, AI, ML, Cloud, Cybersecurity, DevOps, and Data Engineering. Our AI-powered ATS optimization
              ensures your resume bypasses filters and reaches the right hands faster.
            </p>
            <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full border border-white/20 backdrop-blur-sm mx-auto">
              <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0" />
              <span className="text-sm font-medium text-white/95 premium-body">
                Not a staffing agency. Services paid upfront. No placement guarantees.
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/contact?subject=Start Distribution">
                <Button className="bg-secondary hover:bg-secondary/90 text-primary px-8 py-6 text-lg h-auto font-semibold premium-heading shadow-lg hover:shadow-xl transition-all">
                  Start Distribution
                </Button>
              </Link>
              <Link href="/contact?subject=Hire a Dedicated Recruiter">
                <Button
                  variant="outline"
                  className="border-white text-white hover:text-[#FFD700] hover:bg-white/10 px-8 py-6 text-lg h-auto font-semibold premium-body bg-transparent transition-colors"
                >
                  Hire a Dedicated Recruiter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 premium-heading">
              Comprehensive Career Services
            </h2>
            <div className="accent-line"></div>
            <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto premium-body">
              Everything you need to accelerate your consulting and contract career in one premium platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 justify-center">
            {/* Resume Submission */}
            <Card className="p-6 premium-card-hover border border-border bg-card group">
              <div className="mb-4 p-3 bg-accent/10 rounded-lg w-fit group-hover:bg-accent/20 transition-colors">
                <FileText className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground premium-heading">Resume Submission</h3>
              <p className="text-sm text-muted-foreground leading-relaxed premium-body">
                Submit to verified recruiters across top companies nationwide for consulting and contract roles.
              </p>
            </Card>

            {/* Offshore Recruiter */}
            <Card className="p-6 premium-card-hover border border-border bg-card group">
              <div className="mb-4 p-3 bg-accent/10 rounded-lg w-fit group-hover:bg-accent/20 transition-colors">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground premium-heading">Dedicated Recruiter</h3>
              <p className="text-sm text-muted-foreground leading-relaxed premium-body">
                Hire a dedicated recruiter to apply on your behalf daily to consulting and contract opportunities.
              </p>
            </Card>

            {/* DIY Job Search */}
            <Card className="p-6 premium-card-hover border border-border bg-card group">
              <div className="mb-4 p-3 bg-accent/10 rounded-lg w-fit group-hover:bg-accent/20 transition-colors">
                <Briefcase className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground premium-heading">Job Distribution</h3>
              <p className="text-sm text-muted-foreground leading-relaxed premium-body">
                Multi-board distribution wizard with one-click application to consulting and contract boards.
              </p>
            </Card>

            {/* ATS Optimization */}
            <Card className="p-6 premium-card-hover border border-border bg-card group">
              <div className="mb-4 p-3 bg-accent/10 rounded-lg w-fit group-hover:bg-accent/20 transition-colors">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground premium-heading">ATS Optimizer</h3>
              <p className="text-sm text-muted-foreground leading-relaxed premium-body">
                AI-powered resume scanning with keyword analysis & scoring. AI may make mistakes—review all results.
              </p>
            </Card>

            {/* Cover Letter */}
            <Card className="p-6 premium-card-hover border border-border bg-card group">
              <div className="mb-4 p-3 bg-accent/10 rounded-lg w-fit group-hover:bg-accent/20 transition-colors">
                <MessageSquare className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground premium-heading">AI Cover Letters</h3>
              <p className="text-sm text-muted-foreground leading-relaxed premium-body">
                Generate tailored cover letters for any consulting or contract job instantly.
              </p>
            </Card>

            {/* Interview Prep */}
            <Link href="/tools/interview-prep" className="block">
              <Card className="p-6 premium-card-hover border border-border bg-card group h-full transition-all hover:border-accent/50">
                <div className="mb-4 p-3 bg-accent/10 rounded-lg w-fit group-hover:bg-accent/20 transition-colors">
                  <Users2 className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground premium-heading">Interview Prep</h3>
                <p className="text-sm text-muted-foreground leading-relaxed premium-body">
                  Practice unlimited interview questions tailored to job descriptions with instant scoring.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-accent text-sm font-semibold">
                  <span>100% FREE</span>
                  <span className="text-xs px-2 py-1 bg-accent/20 rounded">NEW</span>
                </div>
              </Card>
            </Link>

            {/* Admin Dashboard */}
            <Card className="p-6 premium-card-hover border border-border bg-card group">
              <div className="mb-4 p-3 bg-accent/10 rounded-lg w-fit group-hover:bg-accent/20 transition-colors">
                <TrendingUp className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground premium-heading">Analytics Dashboard</h3>
              <p className="text-sm text-muted-foreground leading-relaxed premium-body">
                Track applications, response rates, and career progress metrics on your consulting journey.
              </p>
            </Card>

            {/* Employer Portal */}
            <Card className="p-6 premium-card-hover border border-border bg-card group">
              <div className="mb-4 p-3 bg-accent/10 rounded-lg w-fit group-hover:bg-accent/20 transition-colors">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground premium-heading">Employer Portal</h3>
              <p className="text-sm text-muted-foreground leading-relaxed premium-body">
                Post consulting and contract roles, manage candidates, configure work visa sponsorship.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust & Social Proof Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50 border-y border-border">
        <div className="max-w-6xl mx-auto">
          {typeof window !== "undefined" && window.location.hostname !== "localhost" && (
            <div className="w-full max-w-md mx-auto my-8 mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-8 premium-heading">
                Fresh off Product Hunt! 🚀
              </h2>
              <div className="relative w-full" style={{ paddingBottom: "81%" }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  style={{ border: "none" }}
                  src="https://cards.producthunt.com/cards/products/1129502"
                  frameBorder="0"
                  scrolling="no"
                  allowFullScreen
                  title="STAR Workforce Solutions on Product Hunt"
                />
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2 premium-heading">12+</div>
              <p className="text-muted-foreground premium-body">Years of Excellence</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2 premium-heading">10,000+</div>
              <p className="text-muted-foreground premium-body">Professionals Served</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2 premium-heading">95%</div>
              <p className="text-muted-foreground premium-body">Customer Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl font-bold premium-heading">
            Ready to Accelerate Your Consulting Career?
          </h2>
          <p className="text-lg opacity-90 leading-relaxed font-light premium-body">
            Join thousands of professionals who have transformed their careers with STAR Workforce Solutions in
            consulting and contract roles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button className="bg-accent hover:bg-accent/90 text-primary px-8 py-6 text-lg h-auto font-semibold premium-heading shadow-lg hover:shadow-xl transition-all">
                Create Free Account
              </Button>
            </Link>
            <Link href="/services">
              <Button
                variant="outline"
                className="border-white text-white hover:text-[#FFD700] hover:bg-white/10 px-8 py-6 text-lg h-auto font-semibold premium-body bg-transparent transition-colors"
              >
                Explore Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
