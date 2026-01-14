"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Upload, CheckCircle, FileText, Briefcase, Rocket, ChevronRight } from "lucide-react"

export default function DistributionWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    resume: null as File | null,
    categories: [] as string[],
    targetRoles: "",
    salaryMin: "",
    salaryMax: "",
  })

  const steps = [
    { number: 1, title: "Upload Resume", icon: Upload },
    { number: 2, title: "ATS Check", icon: FileText },
    { number: 3, title: "Select Categories", icon: Briefcase },
    { number: 4, title: "Launch Campaign", icon: Rocket },
  ]

  const categories = [
    "Software Engineering",
    "Product Management",
    "Data Science",
    "Cloud/DevOps",
    "QA/Testing",
    "IT Operations",
    "Business Analysis",
    "Project Management",
    "Technical Writing",
    "Systems Architecture",
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, resume: e.target.files[0] })
    }
  }

  const handleCategoryToggle = (category: string) => {
    setFormData({
      ...formData,
      categories: formData.categories.includes(category)
        ? formData.categories.filter((c) => c !== category)
        : [...formData.categories, category],
    })
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleLaunch = () => {
    alert("Distribution campaign launched successfully!")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* Hero */}
      <section
        className="text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(to bottom right, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.70) 50%, rgba(0, 0, 0, 0.30) 100%), url(/images/professional-deep-blue-and-gold-abstract-corporate-background-with-subtle-network-connections-920ce753.png)",
          backgroundSize: "auto, cover",
          backgroundPosition: "center, center",
          backgroundAttachment: "scroll, fixed",
        }}
      >
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold premium-heading mb-4">DIY Job Distribution Wizard</h1>
          <p className="text-lg text-white/90 premium-body">
            Create and launch your consulting & contract job distribution campaign in 4 simple steps
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex justify-between mb-8">
              {steps.map((step, idx) => {
                const Icon = step.icon
                return (
                  <div key={step.number} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                        currentStep >= step.number
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-center text-foreground">{step.title}</p>
                    {idx < steps.length - 1 && (
                      <div
                        className={`h-1 w-full mt-4 mx-2 transition-colors ${
                          currentStep > step.number ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Step Content */}
          <Card className="p-8 border border-border mb-8">
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Step 1: Upload Your Resume</h2>
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                  <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Drag & Drop Your Resume</h3>
                  <p className="text-muted-foreground mb-6">PDF, DOC, or DOCX format</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-file"
                  />
                  <label htmlFor="resume-file">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Choose File</Button>
                  </label>
                  {formData.resume && (
                    <div className="mt-6 bg-muted p-4 rounded">
                      <p className="text-sm text-muted-foreground mb-1">Selected:</p>
                      <p className="font-semibold text-foreground">{formData.resume.name}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Step 2: ATS Compatibility Check</h2>
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <h3 className="font-bold text-green-900">ATS Check Complete</h3>
                    </div>
                    <p className="text-green-800 text-sm">
                      Your resume passed the ATS compatibility check with a score of 78%. Ready to proceed with
                      distribution!
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded">
                      <p className="text-sm text-muted-foreground mb-2">Resume Score</p>
                      <p className="text-3xl font-bold text-primary">78%</p>
                    </div>
                    <div className="p-4 bg-muted rounded">
                      <p className="text-sm text-muted-foreground mb-2">Keywords Detected</p>
                      <p className="text-3xl font-bold text-primary">24</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full text-primary border-primary hover:bg-primary/10 bg-transparent"
                  >
                    View Detailed Analysis
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Step 3: Select Job Categories</h2>
                <p className="text-muted-foreground mb-6">Choose which job categories to receive applications for</p>

                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryToggle(category)}
                      className={`p-4 border-2 rounded-lg transition-all text-left font-medium ${
                        formData.categories.includes(category)
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-foreground hover:border-primary/50"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div className="bg-muted p-6 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-3">Selected Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.categories.length > 0 ? (
                      formData.categories.map((cat) => (
                        <span key={cat} className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
                          {cat}
                        </span>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No categories selected yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Step 4: Launch Campaign</h2>
                <div className="space-y-6">
                  <div className="bg-accent/5 border border-accent/20 p-6 rounded-lg">
                    <h3 className="font-bold text-foreground mb-3">Campaign Summary</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>Resume: {formData.resume?.name || "Not selected"}</p>
                      <p>Categories: {formData.categories.length} selected</p>
                      <p>Distribution Type: Multi-step wizard</p>
                      <p>Status: Ready to launch</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-yellow-800">
                    Your resume will be distributed across our network of recruiters and job boards. You can track all
                    applications from your dashboard.
                  </div>

                  <div className="p-4 bg-muted rounded">
                    <p className="text-sm text-muted-foreground mb-2">Free Tier Limit</p>
                    <p className="text-foreground font-semibold">5 distributions remaining this month</p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Navigation Buttons */}
          <div className="flex gap-4 justify-between">
            <Button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              variant="outline"
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !formData.resume) || (currentStep === 3 && formData.categories.length === 0)
                }
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleLaunch} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Launch Campaign
              </Button>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
