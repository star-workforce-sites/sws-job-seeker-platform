"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Upload, Zap, CheckCircle, AlertCircle, Lock, Download, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Footer from "./footer"
import Navigation from "./navigation"
import Image from "next/image"

interface ATSResult {
  score: number
  isPremium: boolean
  keywords: {
    missing: string[]
    found: string[]
  }
  formatting: {
    issue: string
    severity: "high" | "medium" | "low"
  }[]
  tips: string[]
  sections?: {
    name: string
    score: number
  }[]
  jobAlignment?: number
}

export default function ATSOptimizerClient() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<ATSResult | null>(null)
  const [error, setError] = useState<string>("")
  const [isPremium, setIsPremium] = useState(false)
  const [resumeId, setResumeId] = useState<string | null>(null)
  const [email, setEmail] = useState<string>("")
  const [showRestoreForm, setShowRestoreForm] = useState(false)
  const [restoreLoading, setRestoreLoading] = useState(false)
  const { toast } = useToast()
  const [uploadId, setUploadId] = useState<string>("")

  useEffect(() => {
    // Kill all premium cookies on every single page load — no exceptions
    document.cookie = "atsPremium=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "atsEmail=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "coverLetterPremium=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "coverLetterEmail=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

    // Reset all React state
    setIsPremium(false)
    setResult(null)
    setEmail("")
    setResumeId(null)

    console.log("[CLIENT] Premium state forcibly reset on page load")
  }, []) // runs once on mount

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const status = urlParams.get("status")
    const urlResumeId = urlParams.get("resumeId")
    const urlEmail = urlParams.get("email")

    if (status === "success" && urlEmail) {
      handleRestoreAccess(urlEmail)
      return
    }

    if (status === "success") {
      document.cookie = "atsPremium=true; max-age=31536000; path=/; secure; samesite=lax"
      document.cookie = urlEmail ? `atsEmail=${urlEmail}; max-age=31536000; path=/; secure; samesite=lax` : ""
      setIsPremium(true)
      if (urlEmail) setEmail(urlEmail)

      if (urlResumeId) {
        setResumeId(urlResumeId)
        loadResumeAnalysis(urlResumeId, true)
      }

      window.history.replaceState({}, "", `/tools/ats-optimizer${urlResumeId ? `?resumeId=${urlResumeId}` : ""}`)
      toast({
        title: (
          <div className="flex items-center gap-2">
            <Image src="/favicon.svg" alt="STAR" width={24} height={24} />
            <span className="text-[#D4AF37] font-bold">Premium Access Restored!</span>
          </div>
        ),
        description: "You now have lifetime access to full ATS reports.",
        className: "bg-white border-2 border-black",
        duration: 4000,
      })
    } else if (status === "cancelled") {
      if (urlResumeId) {
        setResumeId(urlResumeId)
      }
      window.history.replaceState({}, "", `/tools/ats-optimizer${urlResumeId ? `?resumeId=${urlResumeId}` : ""}`)
      toast({
        title: (
          <div className="flex items-center gap-2">
            <Image src="/favicon.svg" alt="STAR" width={24} height={24} />
            <span className="text-[#E8C547] font-bold">Payment Cancelled</span>
          </div>
        ),
        description: "You can try again anytime.",
        className: "bg-white border-2 border-black",
      })
    } else if (urlResumeId) {
      setResumeId(urlResumeId)
      loadResumeAnalysis(urlResumeId, false)
    }
  }, [])

  const loadResumeAnalysis = async (id: string, premium: boolean) => {
    try {
      setLoading(true)
      const cacheBuster = `${Date.now()}_${Math.random().toString(36).substring(7)}`
      const endpoint =
        premium || isPremium
          ? `/api/ats-full?resumeId=${id}&ts=${cacheBuster}`
          : `/api/ats-free?resumeId=${id}&ts=${cacheBuster}`

      const response = await fetch(endpoint, {
        method: "POST",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
      }
    } catch (err) {
      console.error("Failed to load resume:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase()
      const validExtensions = ["pdf", "docx", "doc", "rtf", "txt", "docm", "dotx"]
      const fileExtension = fileName.split(".").pop()

      if (!validExtensions.includes(fileExtension || "")) {
        setError("Please upload a valid resume file (PDF, DOCX, DOC, RTF, TXT, DOCM, DOTX)")
        return
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        return
      }

      setFile(selectedFile)
      setError("")
      setResult(null)
      setResumeId(null)
      setUploadId(Date.now().toString())
    }
  }

  const uploadResume = async () => {
    if (!file) return null

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("resume", file)
      formData.append("email", email)

      const response = await fetch("/api/ats-upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      const newResumeId = data.resumeId
      setUploadId(newResumeId)

      window.history.replaceState({}, "", `/tools/ats-optimizer?resumeId=${newResumeId}`)
      setResumeId(newResumeId)

      return newResumeId
    } catch (err) {
      setError("Failed to upload resume. Please try again.")
      return null
    } finally {
      setUploading(false)
    }
  }

  const analyzeResume = async (isPremiumRequest = false) => {
    if (!file && !resumeId) {
      setError("Please select a file first")
      return
    }

    setLoading(true)
    setError("")

    try {
      let currentResumeId = resumeId
      if (!currentResumeId && file) {
        currentResumeId = await uploadResume()
        if (!currentResumeId) {
          throw new Error("Upload failed")
        }
      }

      const cacheBuster = `${Date.now()}_${Math.random().toString(36).substring(7)}_${uploadId || "new"}`
      const endpoint =
        isPremiumRequest || isPremium
          ? `/api/ats-full?resumeId=${currentResumeId}&email=${email}&ts=${cacheBuster}`
          : `/api/ats-free?resumeId=${currentResumeId}&ts=${cacheBuster}`

      console.log("[v0] Analyzing resume with cache-buster:", cacheBuster)

      const response = await fetch(endpoint, {
        method: "POST",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError("Failed to analyze resume. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleUnlock = async () => {
    if (!resumeId && file) {
      const id = await uploadResume()
      if (!id) {
        setError("Please upload a resume first")
        return
      }
    }

    try {
      const response = await fetch("/api/ats-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: resumeId,
          email: email,
        }),
      })

      if (!response.ok) {
        throw new Error("Purchase failed")
      }

      const { checkoutUrl } = await response.json()
      window.location.href = checkoutUrl
    } catch (err) {
      setError("Failed to initiate purchase. Please try again.")
    }
  }

  const handleRestoreAccess = async (restoreEmail?: string) => {
    const emailToUse = restoreEmail || email

    if (!emailToUse) {
      toast({
        title: "❌ Email Required",
        description: "Please enter your email to restore premium access.",
        variant: "destructive",
        duration: null,
        action: {
          label: "OK",
          onClick: () => toast.dismiss(),
        },
      })
      return
    }

    setRestoreLoading(true)

    setIsPremium(false)
    setResult(null)

    try {
      const timestamp = Date.now()
      const response = await fetch(`/api/ats-restore?t=${timestamp}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToUse }),
        cache: "no-store",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsPremium(true)
        setEmail(emailToUse)
        document.cookie = "atsPremium=true; path=/; max-age=31536000; secure; samesite=lax"
        document.cookie = `atsEmail=${emailToUse}; path=/; max-age=31536000; secure; samesite=lax`

        // Clear upload state
        setFile(null)
        setResult(null)
        setResumeId(null)
        setUploadId("")
        setError("")

        window.history.replaceState({}, "", "/tools/ats-optimizer")

        toast({
          title: "✅ Premium Access Restored Successfully!",
          description:
            "You now have full access to the ATS Optimizer. Upload your resume to get the complete unblurred analysis report.",
          duration: null,
          action: {
            label: "OK",
            onClick: () => toast.dismiss(),
          },
          className: "bg-white border-2 border-[#D4AF37]",
        })

        setShowRestoreForm(false)

        if (data.resumeId) {
          setTimeout(() => {
            setResumeId(data.resumeId)
            loadResumeAnalysis(data.resumeId, true)
          }, 500)
        }
      } else if (data.promptPay) {
        toast({
          title: "❌ No Payment Found",
          description: "No ATS Optimizer payment found for this email — unlock for $5?",
          variant: "destructive",
          duration: null,
          action: {
            label: "OK",
            onClick: () => toast.dismiss(),
          },
        })
        setShowRestoreForm(false)
      } else {
        const subject = encodeURIComponent("Premium Access Restore Issue")
        const body = encodeURIComponent(
          `Hello STAR Support,\n\nI'm trying to restore my premium access but couldn't find a payment for my email: ${emailToUse}\n\nPlease help me verify my payment and restore access.\n\nThank you!`,
        )
        window.location.href = `/contact?subject=${subject}&body=${body}&email=${encodeURIComponent(emailToUse)}`
      }
    } catch (error) {
      console.error("[CLIENT] Restore error:", error)
      toast({
        title: "❌ Restore Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
        duration: null,
        action: {
          label: "OK",
          onClick: () => toast.dismiss(),
        },
      })
    } finally {
      setRestoreLoading(false)
    }
  }

  const handleExportPDF = async () => {
    if (!resumeId) {
      setError("No resume analysis to export")
      return
    }

    try {
      const response = await fetch(`/api/ats-export-pdf?resumeId=${resumeId}`)

      if (!response.ok) {
        throw new Error("Export failed")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const originalName = file?.name.replace(/\.[^/.]+$/, "") || "resume"
      a.download = `${originalName}_STAR_Optimizer_Report.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError("Failed to export PDF. Please try again.")
    }
  }

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
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-white premium-body">Free AI-Powered ATS Analysis</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white premium-heading">Free ATS Resume Optimizer</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto premium-body">
            Get an instant, free analysis of your resume. Discover missing keywords, formatting issues, and optimization
            tips to pass ATS systems and get noticed by recruiters.
          </p>
          <p className="text-sm text-gray-400 mt-4 max-w-2xl mx-auto">
            AI-Powered Analysis – This report is generated by AI and may contain inaccuracies. Always review and
            customize before submitting to employers.
          </p>
        </div>
      </section>

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Upload Section */}
          <Card className="p-8 mb-8">
            <div className="text-center">
              <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 premium-heading">Upload Your Resume</h2>
              <p className="text-muted-foreground mb-6 premium-body">
                Upload your resume in PDF, DOCX, DOC, RTF, TXT, DOCM, or DOTX format (max 5MB)
              </p>

              {isPremium && (
                <div className="inline-flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full border border-accent/30 mb-4">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-accent premium-body">Premium Access Active</span>
                </div>
              )}

              {!isPremium && (
                <div className="mb-6">
                  <Button
                    onClick={() => setShowRestoreForm(!showRestoreForm)}
                    variant="outline"
                    className="border-2 border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-black font-bold transition-colors"
                    size="lg"
                  >
                    Already Paid? Click Here to Restore Access
                  </Button>
                </div>
              )}

              {showRestoreForm && (
                <Card className="p-6 mb-6 max-w-md mx-auto bg-muted/50 border-2 border-[#FFD700]">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleRestoreAccess()
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="restore-email" className="font-bold">
                        Enter your email to restore premium access
                      </Label>
                      <Input
                        id="restore-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={restoreLoading}
                      className="w-full bg-[#FFD700] hover:bg-[#FFD700]/90 text-black font-bold"
                    >
                      {restoreLoading ? "Restoring..." : "Restore Access"}
                    </Button>
                  </form>
                </Card>
              )}

              <div className="max-w-md mx-auto space-y-4">
                {!isPremium && !showRestoreForm && (
                  <div>
                    <Label htmlFor="user-email">Email (optional, for premium access restoration)</Label>
                    <Input
                      id="user-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                )}

                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.rtf,.txt,.docm,.dotx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload">
                  <Button asChild className="w-full cursor-pointer">
                    <span className="premium-body">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </span>
                  </Button>
                </label>

                {file && <p className="mt-4 text-base font-bold text-green-600 premium-body">Selected: {file.name}</p>}

                {error && (
                  <div className="mt-4 flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  onClick={() => analyzeResume(false)}
                  disabled={(!file && !resumeId) || loading || uploading}
                  className="w-full mt-4"
                  size="lg"
                >
                  {uploading
                    ? "Uploading..."
                    : loading
                      ? "Analyzing..."
                      : isPremium
                        ? "Analyze Resume (Full)"
                        : "Analyze Resume (Free)"}
                </Button>
              </div>
            </div>
          </Card>

          {/* Results Section */}
          {result && (
            <div className="space-y-6">
              {/* ATS Score */}
              <Card className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2 premium-heading">ATS Score</h3>
                  <div className="text-6xl font-bold text-primary mb-4">{result.score}%</div>
                  <Progress value={result.score} className="h-3 mb-2" />
                  <p className="text-sm text-muted-foreground premium-body">
                    {result.score >= 80
                      ? "Excellent! Your resume is well-optimized for ATS systems."
                      : result.score >= 60
                        ? "Good start, but there's room for improvement."
                        : "Your resume needs significant optimization to pass ATS filters."}
                  </p>
                  {!result.isPremium && (
                    <p className="text-xs text-gray-500 mt-4">
                      AI-Powered Analysis – This report is generated by AI and may contain inaccuracies. Always review
                      and customize before submitting to employers.
                    </p>
                  )}
                </div>
              </Card>

              {/* Missing Keywords */}
              <Card className="p-8 relative">
                <h3 className="text-xl font-bold mb-4 premium-heading flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Missing Keywords
                </h3>
                <div className="space-y-2">
                  {result.keywords.missing.slice(0, result.isPremium ? undefined : 3).map((keyword, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm premium-body">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      <span>{keyword}</span>
                    </div>
                  ))}
                </div>
                {!result.isPremium && result.keywords.missing.length > 3 && (
                  <div className="mt-4 text-center relative">
                    <div className="absolute inset-0 backdrop-blur-sm bg-background/60 flex items-center justify-center rounded-lg">
                      <Lock className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground blur-sm">
                      {result.keywords.missing.length - 3} more keywords hidden...
                    </p>
                  </div>
                )}
              </Card>

              {/* Formatting Issues */}
              <Card className="p-8 relative">
                <h3 className="text-xl font-bold mb-4 premium-heading flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Formatting Issues
                </h3>
                <div className="space-y-3">
                  {result.formatting.slice(0, result.isPremium ? undefined : 2).map((issue, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 ${
                          issue.severity === "high"
                            ? "bg-destructive"
                            : issue.severity === "medium"
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium premium-body">{issue.issue}</p>
                        <p className="text-xs text-muted-foreground capitalize">Severity: {issue.severity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {!result.isPremium && result.formatting.length > 2 && (
                  <div className="mt-4 text-center relative">
                    <div className="absolute inset-0 backdrop-blur-sm bg-background/60 flex items-center justify-center rounded-lg">
                      <Lock className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground blur-sm">
                      {result.formatting.length - 2} more issues hidden...
                    </p>
                  </div>
                )}
              </Card>

              {/* Optimization Tips */}
              <Card className="p-8 relative">
                <h3 className="text-xl font-bold mb-4 premium-heading flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Optimization Tips
                </h3>
                <div className="space-y-3">
                  {result.tips.slice(0, result.isPremium ? undefined : 2).map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm premium-body">{tip}</p>
                    </div>
                  ))}
                </div>
                {!result.isPremium && result.tips.length > 2 && (
                  <div className="mt-4 text-center relative">
                    <div className="absolute inset-0 backdrop-blur-sm bg-background/60 flex items-center justify-center rounded-lg">
                      <Lock className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground blur-sm">
                      {result.tips.length - 2} more tips hidden...
                    </p>
                  </div>
                )}
              </Card>

              {/* Unlock Full Report CTA */}
              {!isPremium && !result.isPremium && (
                <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                  <div className="text-center">
                    <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2 premium-heading">Unlock Full Report</h3>
                    <p className="text-muted-foreground mb-4 premium-body">
                      Get unlimited access to all features including:
                    </p>
                    <ul className="text-left max-w-md mx-auto space-y-2 mb-6">
                      <li className="flex items-center gap-2 premium-body">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        Full ATS score breakdown by section
                      </li>
                      <li className="flex items-center gap-2 premium-body">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        Complete keyword analysis (20+ keywords)
                      </li>
                      <li className="flex items-center gap-2 premium-body">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        All formatting issues
                      </li>
                      <li className="flex items-center gap-2 premium-body">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        Job role alignment score
                      </li>
                      <li className="flex items-center gap-2 premium-body">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        Export to PDF
                      </li>
                      <li className="flex items-center gap-2 premium-body">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        Unlimited resume uploads forever
                      </li>
                    </ul>
                    <div className="text-3xl font-bold mb-4 text-primary">
                      $5 <span className="text-base font-normal text-muted-foreground">one-time payment</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">
                      AI-Powered Analysis – This report is generated by AI and may contain inaccuracies. Always review
                      and customize before submitting to employers.
                    </p>
                    <Button onClick={handleUnlock} size="lg" className="w-full max-w-md">
                      Unlock Full Report
                    </Button>
                  </div>
                </Card>
              )}

              {/* Section Breakdown */}
              {result.sections && (
                <Card className="p-8">
                  <h3 className="text-xl font-bold mb-4 premium-heading">Section Breakdown</h3>
                  <div className="space-y-4">
                    {result.sections.map((section, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium premium-body">{section.name}</span>
                          <span className="text-sm font-bold text-primary">{section.score}%</span>
                        </div>
                        <Progress value={section.score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Job Alignment */}
              {result.jobAlignment && (
                <Card className="p-8">
                  <h3 className="text-xl font-bold mb-4 premium-heading">Job Role Alignment</h3>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">{result.jobAlignment}%</div>
                    <p className="text-sm text-muted-foreground premium-body">
                      Your resume aligns well with consulting and contract roles in high-tech industries
                    </p>
                  </div>
                </Card>
              )}

              {/* Export Button */}
              <div className="text-center">
                <Button onClick={handleExportPDF} size="lg" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Full Report as PDF
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
