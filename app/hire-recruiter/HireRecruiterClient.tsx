"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Check, Users, TrendingUp, Shield, Clock, Award, ArrowRight } from "lucide-react"
import { trackSubscription, trackBeginCheckout } from "@/lib/analytics"

export default function HireRecruiterClient() {
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  const handleSubscribe = async (tierId: string) => {
    setCheckoutLoading(tierId)
    try {
      const response = await fetch('/api/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionType: `recruiter_${tierId}` }),
      })
      const data = await response.json()
      if (data.url) {
        const prices: Record<string, number> = { basic: 199, standard: 399, pro: 599 }
        trackSubscription(tierId, prices[tierId] || 0)
        trackBeginCheckout(`Recruiter ${tierId}`, prices[tierId] || 0)
        window.location.href = data.url
      } else if (response.status === 401) {
        // Redirect to sign in
        window.location.href = '/auth/login?callbackUrl=/hire-recruiter'
      } else {
        alert(data.error || 'Failed to start checkout')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setCheckoutLoading(null)
    }
  }

  const tiers = [
    {
      id: "basic",
      name: "Basic",
      price: "$199/month",
      applications: "3-5 applications/day",
      description: "90-150 applications per month",
      features: [
        "Daily consulting & contract job applications",
        "Basic activity dashboard",
        "Email support",
        "Job title targeting",
        "Weekly status reports",
      ],
    },
    {
      id: "standard",
      name: "Standard",
      price: "$399/month",
      applications: "10-15 applications/day",
      description: "300-450 applications per month",
      features: [
        "Daily consulting & contract job applications",
        "Advanced dashboard & analytics",
        "Priority support",
        "Job title + location targeting",
        "Salary range filtering",
        "Daily status updates",
        "Direct recruiter messaging",
      ],
      highlighted: true,
    },
    {
      id: "pro",
      name: "Pro",
      price: "$599/month",
      applications: "20-30 applications/day",
      description: "600-900 applications per month",
      features: [
        "Daily consulting & contract job applications",
        "Full analytics dashboard",
        "24/7 priority support",
        "Custom job criteria & filters",
        "Advanced targeting options",
        "Daily detailed reports",
        "Personal recruiter consultation",
        "Strategy calls (bi-weekly)",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="abstract-gradient text-primary-foreground py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white premium-heading">
            Hire a Dedicated Offshore Recruiter for Your Job Search
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-white/90 premium-body">
            Job Application Automation Service — 90 to 900 Applications per Month
          </p>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8 premium-body">
            Professional recruiters submit applications daily for consulting and contract positions.
            90% feedback success rate. Save 10-20 hours per week.
          </p>
          <p className="text-sm text-white/60 max-w-xl mx-auto mb-8 premium-body">
            Services paid upfront. No placement guarantees. Non-contingent staffing service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="#pricing">
              <Button
                size="lg"
                className="bg-[#E8C547] hover:bg-[#D4AF37] text-[#0A1A2F] font-bold py-6 px-10 text-lg premium-heading"
              >
                View Pricing Plans
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-white/15 hover:bg-white/25 text-white font-bold py-6 px-10 text-lg border border-white/50 premium-heading"
              >
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2 premium-heading">90%</div>
              <div className="text-muted-foreground premium-body">Feedback Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2 premium-heading">900+</div>
              <div className="text-muted-foreground premium-body">Monthly Applications</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2 premium-heading">2013</div>
              <div className="text-muted-foreground premium-body">Est. Year</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2 premium-heading">No Spam</div>
              <div className="text-muted-foreground premium-body">Compliant</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground premium-heading">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4 premium-heading">
                1
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground premium-heading">Choose Plan</h3>
              <p className="text-muted-foreground premium-body">
                Select Basic, Standard, or Pro based on your job search intensity
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4 premium-heading">
                2
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground premium-heading">Upload Resume</h3>
              <p className="text-muted-foreground premium-body">
                Share your resume and job preferences with your dedicated recruiter
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4 premium-heading">
                3
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground premium-heading">We Apply Daily</h3>
              <p className="text-muted-foreground premium-body">
                Your recruiter submits applications to consulting and contract roles every day
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4 premium-heading">
                4
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground premium-heading">Track Progress</h3>
              <p className="text-muted-foreground premium-body">
                Monitor applications via your dashboard and receive regular status reports
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground premium-heading">
            Why Choose Our Service
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center">
              <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3 text-foreground premium-heading">Save 10-20 Hours/Week</h3>
              <p className="text-muted-foreground premium-body">
                Stop spending hours on job boards. Your recruiter handles all applications daily.
              </p>
            </Card>
            <Card className="p-8 text-center">
              <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3 text-foreground premium-heading">10x More Applications</h3>
              <p className="text-muted-foreground premium-body">
                Apply to 90-900 positions per month vs the 10-20 most people manage manually.
              </p>
            </Card>
            <Card className="p-8 text-center">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3 text-foreground premium-heading">DOL Compliant</h3>
              <p className="text-muted-foreground premium-body">
                Non-contingent service. Services paid upfront. No placement fees. 29 CFR 1625.2.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground premium-heading">
            Choose Your Plan
          </h2>
          <p className="text-center text-sm font-medium text-[#E8C547] mb-8 premium-heading">
            Monthly Subscription — Dedicated Recruiter Service
          </p>
          <p className="text-center text-muted-foreground mb-12 premium-body">
            All plans include a dedicated recruiter. Cancel anytime.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {tiers.map((tier) => (
              <Card
                key={tier.id}
                className={`p-8 relative ${
                  tier.highlighted
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                {tier.highlighted && (
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded text-sm font-bold inline-block mb-4 premium-heading">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2 text-foreground premium-heading">{tier.name}</h3>
                <p className="text-4xl font-bold mb-1 text-foreground premium-heading">{tier.price}</p>
                <p className="text-sm text-muted-foreground mb-2 premium-body">{tier.applications}</p>
                <p className="text-xs text-muted-foreground mb-6 premium-body">{tier.description}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-foreground premium-body">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={checkoutLoading !== null}
                  className={`w-full premium-heading ${
                    tier.highlighted
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "bg-[#0A1A2F] hover:bg-[#132A47] text-white border border-[#0A1A2F]"
                  }`}
                >
                  {checkoutLoading === tier.id ? "Processing..." : `Subscribe to ${tier.name}`}
                </Button>
              </Card>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-8 premium-body">
            Services paid upfront. No placement guarantees. Non-contingent staffing service.
            Offshore recruiters are independent contractors, not employees of STAR Workforce Solutions.
          </p>
        </div>
      </section>

      {/* One-Time Job Search Tools */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground premium-heading">
            Boost Your Job Search with One-Time Tools
          </h2>
          <p className="text-center text-muted-foreground mb-12 premium-body">
            No subscription needed. Pay once, use forever.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Resume Distribution",
                price: "$149",
                description: "Distribute your resume to 1,000+ recruiters and hiring managers across the US",
                href: "/tools/resume-distribution",
              },
              {
                name: "Interview Prep",
                price: "$9",
                description: "40 AI-powered practice questions with detailed explanations and readiness report",
                href: "/tools/interview-prep",
              },
              {
                name: "ATS Resume Optimizer",
                price: "$5",
                description: "AI-powered ATS compatibility analysis with keyword optimization and score",
                href: "/tools/ats-optimizer",
              },
              {
                name: "Cover Letter Generator",
                price: "$5",
                description: "AI-generated cover letters tailored to specific job descriptions",
                href: "/tools/cover-letter",
              },
            ].map((tool) => (
              <Card key={tool.name} className="p-6 flex flex-col">
                <h3 className="text-lg font-bold mb-1 text-foreground premium-heading">{tool.name}</h3>
                <p className="text-2xl font-bold text-[#E8C547] mb-3 premium-heading">{tool.price}</p>
                <p className="text-sm text-muted-foreground mb-4 flex-1 premium-body">{tool.description}</p>
                <Link href={tool.href}>
                  <Button variant="outline" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="abstract-gradient text-primary-foreground py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white premium-heading">
            Ready to Accelerate Your Job Search?
          </h2>
          <p className="text-xl mb-8 text-white/90 premium-body">
            Join professionals who stopped applying manually and started getting results
          </p>
          <Link href="#pricing">
            <Button
              className="bg-[#E8C547] hover:bg-[#D4AF37] text-[#0A1A2F] font-bold py-6 px-12 text-lg premium-heading"
              size="lg"
            >
              View Pricing Plans
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
