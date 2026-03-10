"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { ChevronDown } from "lucide-react"

export default function FAQPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const faqs = [
    {
      id: "1",
      category: "General",
      question: "What is STAR Workforce Solutions?",
      answer:
        "STAR Workforce Solutions is a comprehensive job search platform offering resume distribution, offshore recruiter services, AI-powered tools, and employer registration. We have been in business since 2013 with 12+ years of experience helping job seekers and employers connect.",
    },
    {
      id: "2",
      category: "General",
      question: "What types of positions are available?",
      answer:
        "We specialize in contract positions (USA & Canada). Full-time roles are coming soon. We primarily place **US Citizens, US Permanent Residents (Green Card holders), Green Card EAD holders**, and candidates already authorized to work in the United States. We also successfully place **Canadian and Mexican citizens on TN visas**, as well as candidates on **H-1B, STEM OPT, H4 EAD, and L2 EAD**. We do **not** sponsor any new visas (H-1B, etc.), but we provide full assistance with resume distribution, employer introductions, and placement support across the **USA, Canada, and Mexico**.",
    },
    {
      id: "3",
      category: "General",
      question: "Does STAR guarantee employment?",
      answer:
        "No. STAR Workforce Solutions does NOT guarantee employment. We are a resume marketing and distribution service, not a staffing or employment agency. Our services maximize your visibility to recruiters and improve application quality, but employment outcomes depend on multiple factors including your qualifications, market conditions, and recruiter decisions.",
    },
    {
      id: "4",
      category: "General",
      question: "What industries do you serve?",
      answer:
        "We specialize in Software, AI, Machine Learning, Cloud, Cybersecurity, Data Engineering, DevOps, and High-Tech industries. We serve consulting and contract opportunities in USA & Canada only.",
    },
    {
      id: "5",
      category: "Services",
      question: "How does the resume distribution work?",
      answer:
        "You submit your resume once for a one-time fee ($149). Your profile is then distributed to 500+ verified recruiters for 12 months. Recruiters can contact you directly if they have suitable opportunities.",
    },
    {
      id: "6",
      category: "Services",
      question: "What is included in the offshore recruiter service?",
      answer:
        "Our offshore recruiter service assigns a dedicated recruiter who applies to jobs on your behalf daily. Options range from 5 applications/day (Basic) to 30 applications/day (Pro), with features like advanced dashboards, reports, and priority support.",
    },
    {
      id: "7",
      category: "Services",
      question: "Are offshore recruiters employees of STAR or my company?",
      answer:
        "No. Offshore recruiters are independent contractors and are NOT employees of STAR Workforce Solutions or your company. STAR is not liable for recruiter responses, inactions, or lack thereof. All services are paid upfront and are NOT contingent on job placement.",
    },
    {
      id: "8",
      category: "Pricing",
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes, you can cancel your subscription anytime with no penalties or hidden fees. Changes take effect at the start of your next billing cycle.",
    },
    {
      id: "9",
      category: "Pricing",
      question: "Do you offer refunds?",
      answer:
        "We offer a 14-day money-back guarantee for all paid services if you're not satisfied. Contact support@starworkforce.com to request a refund.",
    },
    {
      id: "10",
      category: "ATS Tools",
      question: "How does the ATS optimizer work?",
      answer:
        "Upload your resume and our AI analyzes it for ATS compatibility. You'll receive a score, keyword analysis, section-by-section breakdown, and actionable suggestions to improve your resume's visibility to recruiters.",
    },
    {
      id: "11",
      category: "ATS Tools",
      question: "Can I rely on AI tools for all resume optimization?",
      answer:
        "No. AI tools may make mistakes. While our ATS optimizer provides valuable analysis, you should review all suggestions and verify recommendations before submitting your resume. AI-generated content may be incomplete or incorrect. Users are responsible for all final resume decisions.",
    },
    {
      id: "12",
      category: "ATS Tools",
      question: "Will my sensitive information be protected?",
      answer:
        "Yes. Our system automatically redacts sensitive data including Social Security Numbers, dates of birth, and personal addresses before any distribution. We comply with privacy regulations and data protection standards.",
    },
    {
      id: "13",
      category: "Employers",
      question: "How can employers register?",
      answer:
        "Employers can register for free and post up to 2 job postings per month. Employers can hire up to 5 candidates per month at no cost, with optional paid upgrades available for higher volume.",
    },
    {
      id: "14",
      category: "Legal & Compliance",
      question: "Does STAR negotiate salary or contracts for me?",
      answer:
        "No. STAR Workforce Solutions does NOT negotiate salaries or contracts. You are solely responsible for all salary negotiations and contract reviews. We recommend consulting with a legal professional before signing any contracts.",
    },
    {
      id: "15",
      category: "Legal & Compliance",
      question: "What visa sponsorship options are supported?",
      answer:
        "We primarily place **US Citizens, US Permanent Residents (Green Card holders), Green Card EAD holders**, and candidates already authorized to work in the United States. We also successfully place **Canadian and Mexican citizens on TN visas**, as well as candidates on **H-1B, STEM OPT, H4 EAD, and L2 EAD**. We do **not** sponsor any new visas (H-1B, etc.), but we provide full assistance with resume distribution, employer introductions, and placement support across the **USA, Canada, and Mexico**.",
    },
    {
      id: "16",
      category: "Support",
      question: "What should I do if I have a complaint?",
      answer:
        "We have a formal complaint resolution process. Submit your complaint via the contact form or email support@starworkforce.com. Initial review is within 48 hours, with full resolution typically within 30 days.",
    },
    {
      id: "17",
      category: "Security",
      question: "How is my data secured?",
      answer:
        "We use industry-standard encryption, secure data transmission, limited access controls, and regular security audits. Your personal information is never shared without your explicit consent.",
    },
    {
      id: "18",
      category: "Account",
      question: "How do I update my profile information?",
      answer:
        'Log in to your account and navigate to "Profile Settings". You can update your resume, contact information, job preferences, and privacy settings anytime.',
    },
  ]

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)))

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* Hero */}
      <section className="abstract-gradient text-primary-foreground py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white premium-heading">Frequently Asked Questions</h1>
          <p className="text-lg text-white/90 premium-body">
            Find answers to common questions about our consulting and contract services
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-3xl mx-auto">
          {categories.map((category) => (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6 pb-3 border-b border-border premium-heading">
                {category}
              </h2>
              <div className="space-y-3">
                {faqs
                  .filter((faq) => faq.category === category)
                  .map((faq) => (
                    <Card key={faq.id} className="border border-border overflow-hidden">
                      <button
                        onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                        className="w-full p-6 flex items-center justify-between hover:bg-muted transition-colors"
                      >
                        <h3 className="font-semibold text-foreground text-left premium-heading">{faq.question}</h3>
                        <ChevronDown
                          className={`w-5 h-5 text-primary flex-shrink-0 transition-transform ${
                            expandedId === faq.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {expandedId === faq.id && (
                        <div className="px-6 pb-6 border-t border-border pt-4">
                          <p className="text-muted-foreground leading-relaxed premium-body">{faq.answer}</p>
                        </div>
                      )}
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
