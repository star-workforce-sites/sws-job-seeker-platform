"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { FileText, Briefcase, Upload, Check, Users } from "lucide-react"

export default function ServicesClient() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="abstract-gradient text-primary-foreground py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white premium-heading">
            Your Complete Career Toolkit
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-white/90 premium-body">
            Professional tools to land your next consulting or contract role faster
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Service 1: ATS Optimizer */}
          <div className="mb-16">
            <Card className="p-8 border border-border">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-8 h-8 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground premium-heading">ATS Optimizer</h2>
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed premium-body">
                    75% of resumes are rejected by ATS before a human sees them. Our AI-powered tool analyzes your
                    resume for ATS compatibility and provides actionable recommendations.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2 text-foreground premium-body">
                      <Check className="w-5 h-5 text-primary" />
                      One-time fee: $5 (lifetime access)
                    </li>
                    <li className="flex items-center gap-2 text-foreground premium-body">
                      <Check className="w-5 h-5 text-primary" />
                      Complete ATS score + keyword analysis
                    </li>
                    <li className="flex items-center gap-2 text-foreground premium-body">
                      <Check className="w-5 h-5 text-primary" />
                      Formatting & improvement recommendations
                    </li>
                    <li className="flex items-center gap-2 text-foreground premium-body">
                      <Check className="w-5 h-5 text-primary" />
                      Unlimited resume uploads forever
                    </li>
                  </ul>
                  <Link href="/tools/ats-optimizer">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground premium-heading">
                      Optimize Your Resume
                    </Button>
                  </Link>
                </div>
                <div className="bg-muted p-8 rounded-lg">
                  <div className="space-y-4">
                    <div className="bg-background p-4 rounded border border-border">
                      <p className="font-semibold text-foreground mb-2 premium-heading">What You'll Get:</p>
                      <ul className="text-sm text-muted-foreground space-y-1 premium-body">
                        <li>• ATS compatibility score (0-100)</li>
                        <li>• Missing keywords analysis</li>
                        <li>• Formatting issues detected</li>
                        <li>• Section-by-section improvements</li>
                        <li>• Downloadable PDF report</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Service 2: Cover Letter Generator */}
          <div className="mb-16">
            <Card className="p-8 border border-border">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-muted p-8 rounded-lg">
                  <div className="space-y-4">
                    <div className="bg-background p-4 rounded border border-border">
                      <p className="font-semibold text-foreground mb-2 premium-heading">How It Works:</p>
                      <ul className="text-sm text-muted-foreground space-y-1 premium-body">
                        <li>1. Upload your resume</li>
                        <li>2. Paste the job description</li>
                        <li>3. Get AI-generated cover letter</li>
                        <li>4. Edit and customize as needed</li>
                        <li>5. Download and apply</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Upload className="w-8 h-8 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground premium-heading">Cover Letter Generator</h2>
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed premium-body">
                    Stop writing cover letters from scratch. Our AI creates tailored, professional cover letters
                    customized to each job description in seconds.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2 text-foreground premium-body">
                      <Check className="w-5 h-5 text-primary" />
                      One-time fee: $5 (lifetime access)
                    </li>
                    <li className="flex items-center gap-2 text-foreground premium-body">
                      <Check className="w-5 h-5 text-primary" />
                      AI-powered customization
                    </li>
                    <li className="flex items-center gap-2 text-foreground premium-body">
                      <Check className="w-5 h-5 text-primary" />
                      Professional formatting
                    </li>
                    <li className="flex items-center gap-2 text-foreground premium-body">
                      <Check className="w-5 h-5 text-primary" />
                      Unlimited generations forever
                    </li>
                  </ul>
                  <Link href="/tools/cover-letter">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground premium-heading">
                      Generate Cover Letter
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>

          {/* NEW: Service 3: Hire an Offshore Recruiter */}
          <div className="mb-16">
            <Card className="p-8 border-2 border-primary bg-primary/5">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-8 h-8 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground premium-heading">Hire an Offshore Recruiter</h2>
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed premium-body">
                    Stop spending 10-20 hours per week applying to jobs. Let our professional offshore recruiters
                    handle your job search while you focus on interview preparation and skills development.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2 text-foreground premium-body">
                      <Check className="w-5 h-5 text-primary" />
                      Starting at $199/month
                    </li>
                    <li className="flex items-center gap-2 text-foreground premium-body">
                      <Check className="w-5 h-5 text-primary" />
                      3-30 applications per day (depending on plan)
                    </li>
                    <li className="flex items-center gap-2 text-foreground premium-body">
                      <Check className="w-5 h-5 text-primary" />
                      Real-time application tracking dashboard
                    </li>
                    <li className="flex items-center gap-2 text-foreground premium-body">
                      <Check className="w-5 h-5 text-primary" />
                      90% feedback success rate
                    </li>
                    <li className="flex items-center gap-2 text-foreground premium-body">
                      <Check className="w-5 h-5 text-primary" />
                      Professional recruiters with 10+ years experience
                    </li>
                  </ul>
                  <Link href="/hire-recruiter">
                    <Button className="bg-accent hover:bg-[#FFD700] text-primary-foreground hover:text-black premium-heading border-2 border-black shadow-lg">
                      View Recruiter Plans
                    </Button>
                  </Link>
                </div>
                <div className="bg-background p-8 rounded-lg border border-border">
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded">
                      <p className="font-semibold text-foreground mb-2 premium-heading">How It Works:</p>
                      <ul className="text-sm text-muted-foreground space-y-2 premium-body">
                        <li>1. Choose your plan (Basic, Standard, or Pro)</li>
                        <li>2. Get assigned a dedicated recruiter within 48 hours</li>
                        <li>3. Recruiter submits 3-30 applications daily on your behalf</li>
                        <li>4. Track all submissions in your dashboard</li>
                        <li>5. Receive status updates as applications progress</li>
                      </ul>
                    </div>
                    <div className="bg-muted p-4 rounded">
                      <p className="font-semibold text-foreground mb-2 premium-heading">3 Plans Available:</p>
                      <ul className="text-sm text-muted-foreground space-y-1 premium-body">
                        <li>• <strong>Basic:</strong> $199/mo - 3-5 apps/day</li>
                        <li>• <strong>Standard:</strong> $399/mo - 10-15 apps/day</li>
                        <li>• <strong>Pro:</strong> $599/mo - 20-30 apps/day</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Service 4: Resume Distribution */}
          <div className="mb-16">
            <Card className="p-8 border border-border">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Briefcase className="w-8 h-8 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground premium-heading">Resume Distribution</h2>
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed premium-body">
                    Get your resume in front of 500+ verified recruiters specializing in consulting and contract roles.
                    Your profile gets reviewed by experienced hiring professionals.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2 text-foreground premium-body">
                      <Check className="w-5 h-5 text-primary" />
                      One-time fee: $149
                    </li>
                    <li className="flex items-center gap-2 text-foreground premium-body">
                      <Check className="w-5 h-5 text-primary" />
                      Access to 500+ verified recruiters
                    </li>
                    <li className="flex items-center gap-2 text-foreground premium-body">
                      <Check className="w-5 h-5 text-primary" />
                      Resume visibility for 12 months
                    </li>
                  </ul>
                  <Link href="/distribution-wizard">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground premium-heading">
                      Submit Resume Now
                    </Button>
                  </Link>
                </div>
                <div className="bg-muted p-8 rounded-lg">
                  <div className="space-y-4">
                    <div className="bg-background p-4 rounded border border-border">
                      <p className="font-semibold text-foreground mb-2 premium-heading">What Recruiters See:</p>
                      <ul className="text-sm text-muted-foreground space-y-1 premium-body">
                        <li>• Your resume (PDF/Word)</li>
                        <li>• Work experience summary</li>
                        <li>• Skills and certifications</li>
                        <li>• Contact information</li>
                        <li>• LinkedIn profile link</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Service 5: DIY Job Search */}
          <div className="mb-16">
            <Card className="p-8 border border-border">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Briefcase className="w-8 h-8 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground premium-heading">DIY Job Search</h2>
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed premium-body">
                    Browse and apply to thousands of consulting and contract opportunities yourself. Perfect for job
                    seekers who want hands-on control of their search.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2 text-foreground premium-body">
                      <Check className="w-5 h-5 text-primary" />
                      Free: 5 applications per day
                    </li>
                    <li className="flex items-center gap-2 text-foreground premium-body">
                      <Check className="w-5 h-5 text-primary" />
                      Premium: Unlimited applications ($9.99/month)
                    </li>
                    <li className="flex items-center gap-2 text-foreground premium-body">
                      <Check className="w-5 h-5 text-primary" />
                      Advanced filters and search
                    </li>
                    <li className="flex items-center gap-2 text-foreground premium-body">
                      <Check className="w-5 h-5 text-primary" />
                      Application tracking dashboard
                    </li>
                  </ul>
                  <Link href="/jobs">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground premium-heading">
                      Browse Jobs
                    </Button>
                  </Link>
                </div>
                <div className="bg-muted p-8 rounded-lg">
                  <div className="space-y-4">
                    <div className="bg-background p-4 rounded border border-border">
                      <p className="font-semibold text-foreground mb-2 premium-heading">Job Categories:</p>
                      <ul className="text-sm text-muted-foreground space-y-1 premium-body">
                        <li>• Software Development</li>
                        <li>• AI/ML Engineering</li>
                        <li>• Cloud Architecture</li>
                        <li>• Cybersecurity</li>
                        <li>• Data Engineering</li>
                        <li>• DevOps</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="abstract-gradient text-primary-foreground py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white premium-heading">
            Ready to Land Your Next Role?
          </h2>
          <p className="text-xl mb-8 text-white/90 premium-body">
            Start with our free tools or upgrade for full access
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tools/ats-optimizer">
              <Button
                size="lg"
                className="bg-[#E8C547] hover:bg-[#D4AF37] text-[#0A1A2F] font-bold premium-heading"
              >
                Try ATS Optimizer Free
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white premium-heading">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
