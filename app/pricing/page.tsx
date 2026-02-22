"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Check, ArrowRight } from "lucide-react"

export default function Pricing() {
  const recruiterTiers = [
    {
      id: "basic",
      name: "Basic",
      price: "$199",
      period: "/month",
      applications: "3-5 applications/day",
      features: [
        "90-150 applications per month",
        "Basic activity dashboard",
        "Email support",
        "Job title targeting",
        "Weekly status reports",
      ],
    },
    {
      id: "standard",
      name: "Standard",
      price: "$399",
      period: "/month",
      applications: "10-15 applications/day",
      features: [
        "300-450 applications per month",
        "Advanced dashboard & analytics",
        "Priority support",
        "Job title + location targeting",
        "Daily status updates",
        "Direct recruiter messaging",
      ],
      highlighted: true,
    },
    {
      id: "pro",
      name: "Pro",
      price: "$599",
      period: "/month",
      applications: "20-30 applications/day",
      features: [
        "600-900 applications per month",
        "Full analytics dashboard",
        "24/7 priority support",
        "Custom job criteria & filters",
        "Daily detailed reports",
        "Personal recruiter consultation",
        "Strategy calls (bi-weekly)",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <section className="abstract-gradient text-primary-foreground py-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-white premium-heading">
            Simple Pricing – Get Hired Faster, No Subscriptions
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto premium-body">
            Pay once, optimize forever. Built by recruiters – 75% of resumes fail ATS; fix yours today.
          </p>
        </div>
      </section>

      {/* One-Time Payment Tools Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-foreground premium-heading">
            Career Tools - One-Time Payment
          </h2>
          <p className="text-center text-muted-foreground mb-12 premium-body">
            Pay once, use forever. No subscriptions, no monthly fees.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Tier Card */}
            <Card className="p-6 border-2 border-border bg-background flex flex-col">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-3 premium-heading">Free Tier</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-foreground premium-heading">$0</span>
                  <p className="text-sm text-muted-foreground mt-1 premium-body">Start Here</p>
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground premium-body">
                    Limited ATS preview (5 keywords, 2 issues)
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground premium-body">
                    5 job applications per day
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground premium-body">
                    FREE Interview Prep with unlimited quizzes
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground premium-body">Basic job search & filters</span>
                </div>
              </div>

              <Link href="/tools/ats-optimizer" className="mt-auto">
                <Button
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary/10 bg-transparent"
                >
                  Start Free
                </Button>
              </Link>
            </Card>

            {/* ATS Optimizer Card */}
            <Card className="p-6 border-2 border-primary bg-primary/5 flex flex-col">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-3 premium-heading">ATS Optimizer</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-foreground premium-heading">$5</span>
                  <p className="text-sm text-muted-foreground mt-1 premium-body">one-time payment</p>
                  <p className="text-xs text-accent font-semibold mt-1 premium-body">
                    Lifetime access – pay once, use forever
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground premium-body">Complete ATS score & keyword analysis</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground premium-body">All formatting issues & improvement tips</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground premium-body">Unlimited resume uploads forever</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground premium-body">PDF export of full report</span>
                </div>
              </div>

              <Link href="/tools/ats-optimizer" className="mt-auto">
                <Button className="w-full bg-accent hover:bg-[#FFD700] text-primary-foreground hover:text-black border-2 border-black transition-colors shadow-lg">
                  Unlock Now
                </Button>
              </Link>

              <p className="text-xs text-center text-muted-foreground mt-3 premium-body">
                No subscription, no monthly fees
              </p>
            </Card>

            {/* Cover Letter Card */}
            <Card className="p-6 border-2 border-border bg-background flex flex-col">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-3 premium-heading">Cover Letter Generator</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-foreground premium-heading">$5</span>
                  <p className="text-sm text-muted-foreground mt-1 premium-body">one-time payment</p>
                  <p className="text-xs text-accent font-semibold mt-1 premium-body">
                    Lifetime access – pay once, use forever
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground premium-body">AI-powered custom cover letters</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground premium-body">Tailored to each job description</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground premium-body">Unlimited generations forever</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground premium-body">Professional formatting</span>
                </div>
              </div>

              <Link href="/tools/cover-letter" className="mt-auto">
                <Button className="w-full" variant="outline">
                  Get Started
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* NEW: Hire-a-Recruiter Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground premium-heading">
              Hire an Offshore Recruiter
            </h2>
            <p className="text-xl text-muted-foreground mb-2 premium-body">
              Let professionals handle your job search while you focus on interviews
            </p>
            <p className="text-sm text-muted-foreground premium-body">
              90-900 applications per month • Real-time tracking • 90% feedback rate
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {recruiterTiers.map((tier) => (
              <Card
                key={tier.id}
                className={`p-8 border-2 transition-all hover:shadow-lg flex flex-col ${
                  tier.highlighted
                    ? "border-primary bg-primary/5 shadow-lg"
                    : "border-border"
                }`}
              >
                {tier.highlighted && (
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded text-sm font-bold inline-block mb-4 premium-heading self-center">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2 text-foreground premium-heading">{tier.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-foreground premium-heading">{tier.price}</span>
                    <span className="text-lg text-muted-foreground premium-body">{tier.period}</span>
                  </div>
                  <p className="text-sm font-semibold text-primary premium-body">{tier.applications}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground premium-body">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/hire-recruiter" className="mt-auto">
                  <Button
                    className={`w-full premium-heading ${
                      tier.highlighted
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : ""
                    }`}
                    variant={tier.highlighted ? "default" : "outline"}
                  >
                    Choose {tier.name}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/hire-recruiter">
              <Button size="lg" className="bg-accent hover:bg-[#FFD700] text-primary-foreground hover:text-black premium-heading">
                View All Recruiter Plans & Details
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="abstract-gradient text-primary-foreground py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white premium-heading">
            Ready to Accelerate Your Career?
          </h2>
          <p className="text-xl mb-8 text-white/90 premium-body">
            Join thousands of professionals who've optimized their job search
          </p>
          <Link href="/tools/ats-optimizer">
            <Button 
              className="bg-[#E8C547] hover:bg-[#D4AF37] text-[#0A1A2F] font-bold py-6 px-12 text-lg premium-heading"
              size="lg"
            >
              Start Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
