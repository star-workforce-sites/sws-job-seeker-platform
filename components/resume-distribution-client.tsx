"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Upload,
  FileText,
  Send,
  CheckCircle,
  DollarSign,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Footer from "./footer"
import Navigation from "./navigation"
import Image from "next/image"
import { trackBeginCheckout, trackPurchase, trackFileUpload } from "@/lib/analytics"

interface FormData {
  resume: File | null
  targetJobTitle: string
  targetLocations: string
  industry: string
  experience: string
  email: string
}

interface UploadResult {
  resumeId: string
  fileName: string
  fileType: string
}

export default function ResumeDistributionClient() {
  const [formData, setFormData] = useState<FormData>({
    resume: null,
    targetJobTitle: "",
    targetLocations: "",
    industry: "Technology",
    experience: "3-5",
    email: "",
  })

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>("")
  const [resumeId, setResumeId] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const { toast } = useToast()

  // Check for success status in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlStatus = urlParams.get("status")
    const urlEmail = urlParams.get("email")

    if (urlStatus === "success") {
      trackPurchase("Resume Distribution", 149)
      setSubmitted(true)
      setStatus("success")
      setFormData((prev) => ({ ...prev, email: urlEmail || "" }))

      const toastElement = (
        <div className="flex items-center gap-2">
          <Image src="/favicon.svg" alt="STAR" width={24} height={24} />
          <span className="text-green-600 font-bold">Distribution Campaign Started!</span>
        </div>
      ) as unknown as string
      toast({
        title: toastElement,
        description: "Your resume will be distributed to 500+ recruiters over the next 12 months.",
        className: "bg-white border-2 border-green-600",
        duration: 4000,
      })

      window.history.replaceState({}, "", "/tools/resume-distribution")
    } else if (urlStatus === "cancelled") {
      const cancelToastElement = (
        <div className="flex items-center gap-2">
          <Image src="/favicon.svg" alt="STAR" width={24} height={24} />
          <span className="text-[#E8C547] font-bold">Payment Cancelled</span>
        </div>
      ) as unknown as string
      toast({
        title: cancelToastElement,
        description: "You can try again anytime.",
        className: "bg-white border-2 border-black",
      })
      window.history.replaceState({}, "", "/tools/resume-distribution")
    } else if (urlStatus === "error") {
      toast({
        title: "Error Processing Payment",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
      window.history.replaceState({}, "", "/tools/resume-distribution")
    }
  }, [toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase()
      const validExtensions = ["pdf", "docx"]
      const fileExtension = fileName.split(".").pop()

      if (!validExtensions.includes(fileExtension || "")) {
        setError("Please upload a PDF or DOCX file")
        return
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        return
      }

      setFormData((prev) => ({ ...prev, resume: selectedFile }))
      setError("")
    }
  }

  const uploadResume = async (): Promise<string | null> => {
    if (!formData.resume || !formData.email) {
      setError("Please select a file and enter your email")
      return null
    }

    setUploading(true)
    try {
      const fdata = new FormData()
      fdata.append("file", formData.resume)
      fdata.append("email", formData.email)
      fdata.append("targetRoles", formData.targetJobTitle)
      fdata.append("targetLocations", formData.targetLocations)
      fdata.append("industry", formData.industry)
      fdata.append("experience", formData.experience)

      const response = await fetch("/api/resume-distribution-upload", {
        method: "POST",
        body: fdata,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Upload failed")
      }

      const data: UploadResult = await response.json()
      setResumeId(data.resumeId)
      return data.resumeId
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload resume"
      setError(message)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handlePurchase = async () => {
    if (!resumeId || !formData.email) {
      setError("Please upload your resume first")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/resume-distribution-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          resumeId: resumeId,
          targetRoles: formData.targetJobTitle,
          targetLocations: formData.targetLocations,
          industry: formData.industry,
          experience: formData.experience,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.alreadyPurchased) {
          setError("You have already purchased resume distribution with this email address")
          return
        }
        throw new Error(data.error || "Purchase initiation failed")
      }

      const data = await response.json()
      if (data.url) {
        trackBeginCheckout("Resume Distribution", 149)
        window.location.href = data.url
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to initiate purchase"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.email) {
      setError("Please enter your email address")
      return
    }

    if (!formData.resume) {
      setError("Please upload your resume")
      return
    }

    if (!formData.targetJobTitle) {
      setError("Please enter your target job title")
      return
    }

    if (!formData.targetLocations) {
      setError("Please enter target locations")
      return
    }

    const uploadedId = await uploadResume()
    if (uploadedId) {
      setSubmitted(true)
      toast({
        title: "Resume Uploaded Successfully!",
        description: "Ready to start your distribution campaign?",
        className: "bg-white border-2 border-[#D4AF37]",
      })
    }
  }

  // Success state
  if (status === "success" && submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />

        <section
          className="text-white py-16 px-4 sm:px-6 lg:px-8 relative"
          style={{
            backgroundImage:
              'url("/images/professional-deep-blue-and-gold-abstract-corporate-background-with-subtle-network-connections-920ce753.png")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom right, rgba(0,0,0,0.85), rgba(0,0,0,0.7), rgba(0,0,0,0.3))",
            }}
          />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-400/30 mb-6">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-white premium-body">Campaign Active</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white premium-heading">
              Distribution Campaign Started!
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto premium-body">
              Your resume has been submitted for distribution to 500+ recruiters.
            </p>
          </div>
        </section>

        <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 text-center">
              <div className="mb-6">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              </div>
              <h2 className="text-3xl font-bold mb-4 premium-heading text-green-600">Success!</h2>
              <p className="text-lg text-muted-foreground mb-6 premium-body">
                Your resume will be actively distributed to 500+ recruiters over the next 12 months.
              </p>

              <div className="bg-muted/50 p-6 rounded-lg mb-6 text-left">
                <h3 className="font-bold mb-4 premium-heading">What Happens Next:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="premium-body">
                      Your resume is added to our active recruiter network
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="premium-body">
                      Recruiters matching your profile will receive your resume over 12 months
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="premium-body">
                      You may receive direct contact from qualified recruiters
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="premium-body">
                      Email confirmed: <strong>{formData.email}</strong>
                    </span>
                  </li>
                </ul>
              </div>

              <p className="text-sm text-muted-foreground mb-6 premium-body">
                Check your email for confirmation and updates about your campaign.
              </p>

              <div className="space-y-3">
                <Button asChild size="lg" className="w-full">
                  <a href="/">Return to Home</a>
                </Button>
              </div>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    )
  }

  // Submitted state (before payment)
  if (submitted && !status) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />

        <section
          className="text-white py-16 px-4 sm:px-6 lg:px-8 relative"
          style={{
            backgroundImage:
              'url("/images/professional-deep-blue-and-gold-abstract-corporate-background-with-subtle-network-connections-920ce753.png")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom right, rgba(0,0,0,0.85), rgba(0,0,0,0.7), rgba(0,0,0,0.3))",
            }}
          />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white premium-heading">
              Review Your Distribution Profile
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto premium-body">
              Confirm your details and complete your purchase to start distribution
            </p>
          </div>
        </section>

        <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6 premium-heading">Distribution Summary</h2>

              <div className="space-y-4 mb-8">
                <div className="border-b pb-4">
                  <Label className="text-muted-foreground premium-body">Resume</Label>
                  <p className="text-lg font-medium premium-body">{formData.resume?.name}</p>
                </div>

                <div className="border-b pb-4">
                  <Label className="text-muted-foreground premium-body">Target Job Title</Label>
                  <p className="text-lg font-medium premium-body">{formData.targetJobTitle}</p>
                </div>

                <div className="border-b pb-4">
                  <Label className="text-muted-foreground premium-body">Target Locations</Label>
                  <p className="text-lg font-medium premium-body">{formData.targetLocations}</p>
                </div>

                <div className="border-b pb-4">
                  <Label className="text-muted-foreground premium-body">Industry</Label>
                  <p className="text-lg font-medium premium-body">{formData.industry}</p>
                </div>

                <div className="border-b pb-4">
                  <Label className="text-muted-foreground premium-body">Years of Experience</Label>
                  <p className="text-lg font-medium premium-body">{formData.experience}</p>
                </div>

                <div>
                  <Label className="text-muted-foreground premium-body">Email</Label>
                  <p className="text-lg font-medium premium-body">{formData.email}</p>
                </div>
              </div>

              <div className="bg-muted/50 p-6 rounded-lg mb-8">
                <h3 className="font-bold mb-3 premium-heading">What You Get:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 premium-body">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Resume distribution to 500+ recruiters
                  </li>
                  <li className="flex items-center gap-2 premium-body">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Active distribution for 12 months
                  </li>
                  <li className="flex items-center gap-2 premium-body">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Targeted matching based on your profile
                  </li>
                  <li className="flex items-center gap-2 premium-body">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Direct recruiter contact
                  </li>
                </ul>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-destructive premium-body">{error}</p>
                </div>
              )}

              <div className="border-t pt-8">
                <div className="flex items-baseline justify-center mb-6">
                  <span className="text-4xl font-bold text-primary">$149</span>
                  <span className="text-muted-foreground ml-2 premium-body">one-time</span>
                </div>

                <Button
                  onClick={handlePurchase}
                  disabled={loading}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Pay $149 & Start Distribution
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => {
                    setSubmitted(false)
                    setResumeId(null)
                    setFormData((prev) => ({
                      ...prev,
                      resume: null,
                      targetJobTitle: "",
                      targetLocations: "",
                    }))
                  }}
                  variant="outline"
                  className="w-full mt-3"
                >
                  Edit Information
                </Button>
              </div>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    )
  }

  // Form state
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <section
        className="text-white py-16 px-4 sm:px-6 lg:px-8 relative"
        style={{
          backgroundImage:
            'url("/images/professional-deep-blue-and-gold-abstract-corporate-background-with-subtle-network-connections-920ce753.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom right, rgba(0,0,0,0.85), rgba(0,0,0,0.7), rgba(0,0,0,0.3))",
          }}
        />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full border border-accent/30 mb-6">
            <Send className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-white premium-body">Get Your Resume Noticed</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white premium-heading">
            Resume Distribution Service
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto premium-body mb-4">
            Get Your Resume in Front of 500+ Recruiters
          </p>
          <p className="text-2xl font-bold text-accent premium-heading">$149 one-time — 12 months of active distribution</p>
        </div>
      </section>

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* How It Works */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8 premium-heading">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2 premium-heading">1. Upload & Preferences</h3>
                <p className="text-sm text-muted-foreground premium-body">
                  Submit your resume and tell us about your ideal roles and locations
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2 premium-heading">2. One-Time Payment</h3>
                <p className="text-sm text-muted-foreground premium-body">
                  Pay $149 once for 12 months of active distribution to recruiters
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Send className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2 premium-heading">3. Get Discovered</h3>
                <p className="text-sm text-muted-foreground premium-body">
                  Your resume reaches matching recruiters who can connect you with opportunities
                </p>
              </Card>
            </div>
          </section>

          {/* Upload Form */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 premium-heading">Submit Your Information</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <Label htmlFor="email" className="font-bold">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="mt-2"
                  required
                />
              </div>

              {/* Resume Upload */}
              <div>
                <Label htmlFor="resume" className="font-bold">
                  Resume <span className="text-destructive">*</span>
                </Label>
                <p className="text-sm text-muted-foreground mb-3 premium-body">PDF or DOCX, max 5MB</p>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload">
                  <Button asChild type="button" className="w-full cursor-pointer">
                    <span className="premium-body">
                      <Upload className="w-4 h-4 mr-2" />
                      {formData.resume ? "Change File" : "Choose Resume"}
                    </span>
                  </Button>
                </label>
                {formData.resume && (
                  <p className="mt-2 text-sm font-medium text-green-600 premium-body">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Selected: {formData.resume.name}
                  </p>
                )}
              </div>

              {/* Target Job Title */}
              <div>
                <Label htmlFor="jobTitle" className="font-bold">
                  Target Job Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="jobTitle"
                  type="text"
                  placeholder="e.g., Senior Software Engineer, Product Manager"
                  value={formData.targetJobTitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, targetJobTitle: e.target.value }))}
                  className="mt-2"
                  required
                />
              </div>

              {/* Target Locations */}
              <div>
                <Label htmlFor="locations" className="font-bold">
                  Target Locations <span className="text-destructive">*</span>
                </Label>
                <p className="text-sm text-muted-foreground mb-3 premium-body">Comma-separated (e.g., San Francisco, New York, Remote)</p>
                <Input
                  id="locations"
                  type="text"
                  placeholder="City, City, Remote"
                  value={formData.targetLocations}
                  onChange={(e) => setFormData((prev) => ({ ...prev, targetLocations: e.target.value }))}
                  className="mt-2"
                  required
                />
              </div>

              {/* Industry */}
              <div>
                <Label htmlFor="industry" className="font-bold">
                  Industry Preference
                </Label>
                <select
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData((prev) => ({ ...prev, industry: e.target.value }))}
                  className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option>Technology</option>
                  <option>Healthcare</option>
                  <option>Finance</option>
                  <option>Engineering</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Experience */}
              <div>
                <Label htmlFor="experience" className="font-bold">
                  Years of Experience
                </Label>
                <select
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData((prev) => ({ ...prev, experience: e.target.value }))}
                  className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="0-2">0-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-destructive premium-body">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={uploading || loading}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Review & Proceed to Payment
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
