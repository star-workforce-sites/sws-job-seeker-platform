"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Check, Users, TrendingUp, Shield, Clock, Award, ArrowRight } from "lucide-react"

export default function HireRecruiterClient() {
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

      {/* Hero Section - Matches site gradient */}
      <section className="abstract-gradient text-primary-foreground py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white premium-heading">
            Hire an Offshore Recruiter
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-white/90 premium-body">
            90-900 Job Applications on Autopilot
          </p>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8 premium-body">
            Professional recruiters submit applications daily for consulting and contract positions. 
            90% feedback success rate. Save 10-20 hours per week.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="#pricing">
              <Button 
                className="bg-[#E8C547] hover:bg-[#D4AF37] text-[#0A1A2F] font-bold py-6 px-10 text-lg premium-heading"
                size="lg"
              >
                View Pricing Plans
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white/10 font-bold py-6 px-10 text-lg premium-heading"
                size="lg"
              >
                How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2 premium-heading">90%</div>
              <div className="text-muted-foreground premium-body">Feedback Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2 premium-heading">900+</div>
              <div className="text-muted-foreground premium-body">Apps/Month</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2 premium-heading">2013</div>
              <div className="text-muted-foreground premium-body">Established</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2 premium-heading">No Spam</div>
              <div className="text-muted-foreground premium-body">Compliant</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
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
                Share resume and job preferences with your dedicated recruiter
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4 premium-heading">
                3
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground premium-heading">We Apply Daily</h3>
              <p className="text-muted-foreground premium-body">
                Recruiters submit 3-30 applications per day to matching positions
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4 premium-heading">
                4
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground premium-heading">Track Progress</h3>
              <p className="text-muted-foreground premium-body">
                Monitor applications in dashboard with 90% feedback success rate
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground premium-heading">
            Why Choose STAR Workforce
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 border border-border">
              <Shield className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3 text-foreground premium-heading">No Spam, Ever</h3>
              <p className="text-muted-foreground premium-body">
                Targeted submissions only to approved companies. Dual email system ensures deliverability.
              </p>
            </Card>
            <Card className="p-8 border border-border">
              <TrendingUp className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3 text-foreground premium-heading">90% Feedback Rate</h3>
              <p className="text-muted-foreground premium-body">
                Industry-leading tracking. Know where every application stands in real-time.
              </p>
            </Card>
            <Card className="p-8 border border-border">
              <Users className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3 text-foreground premium-heading">Expert Recruiters</h3>
              <p className="text-muted-foreground premium-body">
                Professional offshore recruiters with years of experience in IT and consulting.
              </p>
            </Card>
            <Card className="p-8 border border-border">
              <Clock className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3 text-foreground premium-heading">Save 10-20 Hours/Week</h3>
              <p className="text-muted-foreground premium-body">
                Stop spending evenings applying. Focus on interviews and preparation.
              </p>
            </Card>
            <Card className="p-8 border border-border">
              <Award className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3 text-foreground premium-heading">Since 2013</h3>
              <p className="text-muted-foreground premium-body">
                Over a decade of proven results and partnerships with major employers.
              </p>
            </Card>
            <Card className="p-8 border border-border">
              <Check className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3 text-foreground premium-heading">Dashboard Tracking</h3>
              <p className="text-muted-foreground premium-body">
                Real-time application tracking with 6-status framework and detailed analytics.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground premium-heading">
            Choose Your Plan
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg premium-body">
            All plans include dashboard tracking, email support, and our 90% feedback guarantee
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {tiers.map((tier) => (
              <Card
                key={tier.id}
                className={`p-8 border-2 transition-all hover:shadow-lg ${
                  tier.highlighted ? "border-primary bg-primary/5" : "border-border"
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

                <Link href={`/contact?subject=Hire Recruiter - ${tier.name} Plan`}>
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
