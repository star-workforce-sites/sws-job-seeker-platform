"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Check } from "lucide-react"

export default function Pricing() {
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

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
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
                    Limited ATS preview (5 keywords, 2 issues – blurred full report)
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground premium-body">
                    5 job applications per day (track progress, save jobs)
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

            {/* Employer Plans Card */}
            <Card className="p-6 border-2 border-border bg-background flex flex-col">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-3 premium-heading">Employer Plans</h3>
                <p className="text-sm text-muted-foreground premium-body">Post jobs, hire talent</p>
              </div>

              <div className="space-y-4 mb-6 flex-1">
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-bold text-foreground mb-1 premium-heading">Free</h4>
                  <p className="text-xs text-muted-foreground premium-body">2 job listings/month</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-bold text-foreground mb-1 premium-heading">Growth</h4>
                  <p className="text-xs text-muted-foreground premium-body">10 listings + featured posts</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-bold text-foreground mb-1 premium-heading">Enterprise</h4>
                  <p className="text-xs text-muted-foreground premium-body">Unlimited + dedicated support</p>
                </div>
              </div>

              <Link href="/contact" className="mt-auto">
                <Button
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary/10 bg-transparent"
                >
                  Contact Sales
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 premium-heading">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-2 premium-heading">Is the $5 payment really one-time?</h3>
              <p className="text-muted-foreground premium-body">
                Yes! Pay $5 once and get lifetime access. No recurring charges, no hidden fees. Upload and analyze
                unlimited resumes forever.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-2 premium-heading">What's included in the free tier?</h3>
              <p className="text-muted-foreground premium-body">
                Free users get a limited preview (5 keywords, 2 issues shown with the full report blurred) and can apply
                to 5 jobs per day. Perfect for testing before upgrading.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-2 premium-heading">Can I get a refund?</h3>
              <p className="text-muted-foreground premium-body">
                We offer a 7-day money-back guarantee. If you're not satisfied with the ATS analysis, contact us for a
                full refund.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-2 premium-heading">Do employer plans include ATS access?</h3>
              <p className="text-muted-foreground premium-body">
                No. Employer plans are for job posting and candidate management only. If you need ATS optimization,
                purchase the $5 one-time unlock separately.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
