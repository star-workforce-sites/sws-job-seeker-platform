"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { FileText, Users, Briefcase, Sparkles, MessageSquare, Users2, Check } from "lucide-react"

export default function ServicesClient() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* Hero */}
      <section className="abstract-gradient text-primary-foreground py-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-white premium-heading">
            Career Acceleration Services
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto premium-body">
            Choose the service that best fits your consulting and contract job search strategy
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-6xl mx-auto">
          {/* Service 1: Resume Submission */}
          <div className="mb-16">
            <Card className="p-8 border border-border">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-8 h-8 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground premium-heading">Resume Submission</h2>
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed premium-body">
                    Submit your resume directly to verified recruiters seeking consulting and contract talent. Your
                    profile gets reviewed by experienced hiring professionals.
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

          {/* Service 2: DIY Job Search */}
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
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="border border-border p-4 rounded">
                      <p className="font-semibold text-foreground mb-2 premium-heading">Free Tier</p>
                      <p className="text-sm text-muted-foreground mb-3 premium-body">5 applications/day</p>
                      <Link href="/jobs">
                        <Button variant="outline" className="w-full premium-body bg-transparent">
                          Start Searching
                        </Button>
                      </Link>
                    </div>
                    <div className="border border-primary bg-primary/5 p-4 rounded">
                      <p className="font-semibold text-foreground mb-2 premium-heading">Premium</p>
                      <p className="text-sm text-muted-foreground mb-3 premium-body">Unlimited applications</p>
                      <Link href="/contact?subject=Service Upgrade Inquiry">
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground premium-heading">
                          Upgrade
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="bg-muted p-8 rounded-lg">
                  <p className="font-semibold text-foreground mb-4 premium-heading">Premium Features:</p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-foreground premium-body">
                      <Check className="w-5 h-5 text-primary" />
                      Unlimited applications
                    </li>
                    <li className="flex items-center gap-2 text-foreground premium-body">
                      <Check className="w-5 h-5 text-primary" />
                      Saved searches & alerts
                    </li>
                    <li className="flex items-center gap-2 text-foreground premium-body">
                      <Check className="w-5 h-5 text-primary" />
                      Bookmark jobs
                    </li>
                    <li className="flex items-center gap-2 text-foreground premium-body">
                      <Check className="w-5 h-5 text-primary" />
                      Advanced filters
                    </li>
                    <li className="flex items-center gap-2 text-foreground premium-body">
                      <Check className="w-5 h-5 text-primary" />
                      $9.99/month
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* Service 3: Offshore Recruiter - COMPACT CTA */}
          <div className="mb-16">
            <Card className="p-8 border-2 border-primary bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="text-center max-w-2xl mx-auto">
                <Users className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-foreground mb-4 premium-heading">
                  Hire an Offshore Recruiter
                </h2>
                <p className="text-lg text-muted-foreground mb-6 premium-body">
                  Let our dedicated recruiters handle your job search. Starting at $199/month with plans up to 30 applications per day.
                </p>
                <Link href="/hire-recruiter">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg premium-heading">
                    View Recruiter Plans
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Service 4: Career Tools */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-8 premium-heading">Career Tools</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* ATS Optimizer */}
              <Card className="p-8 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                  <h3 className="text-xl font-bold text-foreground premium-heading">ATS Optimizer</h3>
                </div>
                <p className="text-muted-foreground mb-6 premium-body">
                  Get your resume scanned for ATS compatibility · $5 one-time (lifetime)
                </p>
                <div className="bg-muted p-4 rounded mb-6 text-sm space-y-2 premium-body">
                  <p className="font-semibold text-foreground">Premium users get unlimited uploads + PDF export</p>
                </div>
                <Link href="/tools/ats-optimizer">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground premium-heading">
                    Optimize Resume – $5
                  </Button>
                </Link>
              </Card>

              {/* Cover Letter Generator */}
              <Card className="p-8 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-8 h-8 text-primary" />
                  <h3 className="text-xl font-bold text-foreground premium-heading">Cover Letter Generator</h3>
                </div>
                <p className="text-muted-foreground mb-6 premium-body">
                  Professional tailored cover letter in seconds · $5 one-time (lifetime)
                </p>
                <div className="bg-muted p-4 rounded mb-6 text-sm space-y-2 premium-body">
                  <p className="font-semibold text-foreground">Premium ATS users get 50% off ($2.50)</p>
                  <p className="text-muted-foreground">Free preview available</p>
                </div>
                <Link href="/tools/cover-letter">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground premium-heading">
                    Generate Cover Letter – $5
                  </Button>
                </Link>
              </Card>

              {/* Interview Prep */}
              <Card className="p-8 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Users2 className="w-8 h-8 text-primary" />
                  <h3 className="text-xl font-bold text-foreground premium-heading">Interview Prep</h3>
                </div>
                <p className="text-muted-foreground mb-6 premium-body">
                  Practice unlimited interview questions based on job descriptions · 100% FREE
                </p>
                <div className="bg-muted p-4 rounded mb-6 text-sm space-y-2 premium-body">
                  <p className="font-semibold text-foreground">Free unlimited practice tests</p>
                  <p className="text-muted-foreground">Instant scoring with explanations</p>
                </div>
                <Link href="/tools/interview-prep">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground premium-heading">
                    Start Practice Test - FREE
                  </Button>
                </Link>
              </Card>

              {/* LinkedIn Optimizer - Coming Soon */}
              <Card className="p-8 border border-border opacity-75">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-8 h-8 text-primary" />
                  <h3 className="text-xl font-bold text-foreground premium-heading">
                    LinkedIn Optimizer (Coming Soon)
                  </h3>
                </div>
                <p className="text-muted-foreground mb-6 premium-body">
                  Boost recruiter visibility · Included in future Pro plan
                </p>
                <div className="bg-muted p-4 rounded mb-6 text-sm space-y-2 premium-body">
                  <p className="font-semibold text-foreground">Coming Soon</p>
                </div>
                <Button disabled className="w-full bg-transparent" variant="outline">
                  Coming Soon
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
