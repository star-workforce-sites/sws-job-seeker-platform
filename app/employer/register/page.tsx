"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Check, ChevronRight } from "lucide-react"

export default function EmployerRegister() {
  const [formStep, setFormStep] = useState(1)
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    industry: "",
    companySize: "",
    visaSponsor: false,
    visaTypes: [] as string[],
  })

  const visaOptions = ["TN", "H-1B", "L-1", "STEM OPT"]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    })
  }

  const handleVisaToggle = (visa: string) => {
    setFormData({
      ...formData,
      visaTypes: formData.visaTypes.includes(visa)
        ? formData.visaTypes.filter((v) => v !== visa)
        : [...formData.visaTypes, visa],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/employer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        alert("Registration successful! Check your email for confirmation.")
        // TODO: Redirect to employer dashboard once auth is enabled
        // window.location.href = '/employer/dashboard'
      } else {
        alert(data.error || "Registration failed. Please try again.")
      }
    } catch (error) {
      console.error("Registration error:", error)
      alert("An error occurred. Please try again.")
    }
  }

  const steps = [
    { number: 1, title: "Company Info" },
    { number: 2, title: "Contact Details" },
    { number: 3, title: "Work Visa Support" },
    { number: 4, title: "Review & Submit" },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* Hero */}
      <section className="network-pattern bg-gradient-to-br from-primary/10 to-accent/5 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground">Register Your Company</h1>
          <p className="text-lg text-muted-foreground">
            Post contract positions and hire from our network of verified candidates
          </p>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex justify-between mb-8">
              {steps.map((step, idx) => (
                <div key={step.number} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 font-bold transition-colors ${
                      formStep >= step.number ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.number}
                  </div>
                  <p className="text-xs font-medium text-center text-foreground">{step.title}</p>
                  {idx < steps.length - 1 && (
                    <div
                      className={`h-1 w-full mt-4 mx-1 transition-colors ${
                        formStep > step.number ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card className="p-8 border border-border mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Company Info */}
              {formStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-6">Company Information</h2>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Company Name *</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your Company"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Industry *</label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select an industry...</option>
                      <option>Technology</option>
                      <option>Finance</option>
                      <option>Healthcare</option>
                      <option>Consulting</option>
                      <option>Manufacturing</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Company Size *</label>
                    <select
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select size...</option>
                      <option>1-50</option>
                      <option>51-200</option>
                      <option>201-1000</option>
                      <option>1000+</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Step 2: Contact Details */}
              {formStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-6">Contact Information</h2>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Work Visa Support */}
              {formStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-6">Work Visa Support</h2>
                    <p className="text-muted-foreground mb-6">
                      Do you support work visa sponsorship? Select the visa types your company can sponsor.
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="visaSponsor"
                        checked={formData.visaSponsor}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border border-border"
                      />
                      <span className="font-medium text-foreground">Yes, we support visa sponsorship</span>
                    </label>
                  </div>

                  {formData.visaSponsor && (
                    <div>
                      <p className="text-sm font-medium text-foreground mb-3">Select supported visa types:</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {visaOptions.map((visa) => (
                          <button
                            key={visa}
                            onClick={() => handleVisaToggle(visa)}
                            className={`p-4 border-2 rounded-lg transition-all text-left font-medium ${
                              formData.visaTypes.includes(visa)
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border text-foreground hover:border-primary/50"
                            }`}
                          >
                            {visa}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {formStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-6">Review Your Information</h2>
                  </div>

                  <Card className="p-6 bg-muted border border-border">
                    <h3 className="font-bold text-foreground mb-4">Company Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Company Name:</span>
                        <span className="font-medium text-foreground">{formData.companyName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Industry:</span>
                        <span className="font-medium text-foreground">{formData.industry}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Company Size:</span>
                        <span className="font-medium text-foreground">{formData.companySize}</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-muted border border-border">
                    <h3 className="font-bold text-foreground mb-4">Contact Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium text-foreground">{formData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium text-foreground">{formData.phone}</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-accent/5 border border-accent/20">
                    <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      Visa Sponsorship
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.visaSponsor
                        ? `Supported types: ${formData.visaTypes.join(", ")}`
                        : "No visa sponsorship available"}
                    </p>
                  </Card>

                  <Card className="p-6 bg-muted border border-border">
                    <h3 className="font-bold text-foreground mb-3">Free Tier Benefits</h3>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Post up to 2 job listings per month</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Hire up to 5 candidates per month</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Access to our full candidate database</span>
                      </li>
                    </ul>
                  </Card>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 justify-between pt-6 border-t border-border">
                <Button
                  type="button"
                  onClick={() => setFormStep(Math.max(1, formStep - 1))}
                  variant="outline"
                  disabled={formStep === 1}
                >
                  Previous
                </Button>

                {formStep < 4 ? (
                  <Button
                    type="button"
                    onClick={() => setFormStep(formStep + 1)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                    <Check className="w-4 h-4" />
                    Complete Registration
                  </Button>
                )}
              </div>
            </form>
          </Card>

          {/* Info Section */}
          <Card className="p-6 bg-primary/5 border border-primary/20">
            <h3 className="font-bold text-foreground mb-3">What Happens Next?</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li>1. You'll receive a confirmation email within 1 hour</li>
              <li>2. Set up your company profile and start posting jobs</li>
              <li>3. Browse our candidate database and start hiring</li>
              <li>4. Contact support to upgrade your plan or add more positions</li>
            </ol>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
