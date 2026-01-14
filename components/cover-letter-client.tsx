"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Upload, FileText, CheckCircle, AlertCircle, Lock, Download, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import Footer from "./footer"
import Navigation from "./navigation"
import Image from "next/image"

interface CoverLetterResult {
  coverLetter: string
  toneScore: number
  isPremium: boolean
  preview?: string
}

export default function CoverLetterClient() {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<CoverLetterResult | null>(null)
  const [error, setError] = useState<string>("")
  const [isPremium, setIsPremium] = useState(false)
  const [coverLetterId, setCoverLetterId] = useState<string | null>(null)
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
    setCoverLetterId(null)

    console.log("[CLIENT] Premium state forcibly reset on page load")
  }, []) // runs once on mount

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const status = urlParams.get("status")
    const urlCoverLetterId = urlParams.get("coverLetterId")
    const urlEmail = urlParams.get("email")

    if (status === "success" && urlEmail) {
      handleRestoreAccess(urlEmail)
      return
    }

    if (status === "success") {
      document.cookie = "coverLetterPremium=true; max-age=31536000; path=/; secure; samesite=lax"
      document.cookie = urlEmail ? `coverLetterEmail=${urlEmail}; max-age=31536000; path=/; secure; samesite=lax` : ""
      setIsPremium(true)
      if (urlEmail) setEmail(urlEmail)

      if (urlCoverLetterId) {
        setCoverLetterId(urlCoverLetterId)
        loadCoverLetter(urlCoverLetterId, true)
      }

      window.history.replaceState(
        {},
        "",
        `/tools/cover-letter${urlCoverLetterId ? `?coverLetterId=${urlCoverLetterId}` : ""}`,
      )
      toast({
        title: (
          <div className="flex items-center gap-2">
            <Image src="/favicon.svg" alt="STAR" width={24} height={24} />
            <span className="text-[#D4AF37] font-bold">Premium Access Activated!</span>
          </div>
        ),
        description: "You now have lifetime access to full cover letter generation.",
        className: "bg-white border-2 border-black",
        duration: 4000,
      })
    } else if (status === "cancelled") {
      if (urlCoverLetterId) {
        setCoverLetterId(urlCoverLetterId)
      }
      window.history.replaceState(
        {},
        "",
        `/tools/cover-letter${urlCoverLetterId ? `?coverLetterId=${urlCoverLetterId}` : ""}`,
      )
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
    } else if (urlCoverLetterId) {
      setCoverLetterId(urlCoverLetterId)
      loadCoverLetter(urlCoverLetterId, false)
    }
  }, [])

  const loadCoverLetter = async (id: string, premium: boolean) => {
    try {
      setLoading(true)
      const cacheBuster = `${Date.now()}_${Math.random().toString(36).substring(7)}`
      const endpoint =
        premium || isPremium
          ? `/api/cover-letter-full?coverLetterId=${id}&email=${email}&ts=${cacheBuster}`
          : `/api/cover-letter-free?coverLetterId=${id}&ts=${cacheBuster}`

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
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to load cover letter")
      }
    } catch (err) {
      console.error("Failed to load cover letter:", err)
      setError("Failed to load cover letter. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase()
      const validExtensions = ["pdf", "docx", "doc", "rtf", "txt"]
      const fileExtension = fileName.split(".").pop()

      if (!validExtensions.includes(fileExtension || "")) {
        setError("Please upload a valid resume file (PDF, DOCX, DOC, RTF, TXT)")
        return
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        return
      }

      setResumeFile(selectedFile)
      setError("")
      setResult(null)
      setCoverLetterId(null)
      setUploadId(Date.now().toString())
    }
  }

  const uploadData = async () => {
    if (!resumeFile || !jobDescription.trim()) return null

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("resume", resumeFile)
      formData.append("jobDescription", jobDescription)
      formData.append("email", email)

      const response = await fetch("/api/cover-letter-upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      const newCoverLetterId = data.coverLetterId
      setUploadId(newCoverLetterId)

      window.history.replaceState({}, "", `/tools/cover-letter?coverLetterId=${newCoverLetterId}`)
      setCoverLetterId(newCoverLetterId)

      return newCoverLetterId
    } catch (err) {
      setError("Failed to upload. Please try again.")
      return null
    } finally {
      setUploading(false)
    }
  }

  const generateCoverLetter = async (isPremiumRequest = false) => {
    if ((!resumeFile || !jobDescription.trim()) && !coverLetterId) {
      setError("Please upload your resume and paste the job description")
      return
    }

    setLoading(true)
    setError("")

    try {
      let currentCoverLetterId = coverLetterId
      if (!currentCoverLetterId && resumeFile && jobDescription.trim()) {
        currentCoverLetterId = await uploadData()
        if (!currentCoverLetterId) {
          throw new Error("Upload failed")
        }
      }

      const cacheBuster = `${Date.now()}_${Math.random().toString(36).substring(7)}_${uploadId || "new"}`
      const endpoint =
        isPremiumRequest || isPremium
          ? `/api/cover-letter-full?coverLetterId=${currentCoverLetterId}&email=${email}&ts=${cacheBuster}`
          : `/api/cover-letter-free?coverLetterId=${currentCoverLetterId}&ts=${cacheBuster}`

      const response = await fetch(endpoint, {
        method: "POST",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error("Generation failed")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError("Failed to generate cover letter. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleUnlock = async () => {
    if (!coverLetterId && (resumeFile || jobDescription.trim())) {
      const id = await uploadData()
      if (!id) {
        setError("Please upload your resume and job description first")
        return
      }
    }

    try {
      const response = await fetch("/api/cover-letter-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coverLetterId: coverLetterId,
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
      const response = await fetch(`/api/cover-letter-restore?t=${timestamp}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToUse }),
        cache: "no-store",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsPremium(true)
        setEmail(emailToUse)
        document.cookie = "coverLetterPremium=true; path=/; max-age=31536000; secure; samesite=lax"
        document.cookie = `coverLetterEmail=${emailToUse}; path=/; max-age=31536000; secure; samesite=lax`

        // Clear upload state
        setResumeFile(null)
        setJobDescription("")
        setResult(null)
        setCoverLetterId(null)
        setUploadId("")
        setError("")

        window.history.replaceState({}, "", "/tools/cover-letter")

        toast({
          title: "✅ Cover Letter Access Restored Successfully!",
          description: "Upload your resume and job description to generate a full cover letter.",
          duration: null,
          action: {
            label: "OK",
            onClick: () => toast.dismiss(),
          },
          className: "bg-white border-2 border-[#D4AF37]",
        })

        setShowRestoreForm(false)

        if (data.coverLetterId) {
          setTimeout(() => {
            setCoverLetterId(data.coverLetterId)
            loadCoverLetter(data.coverLetterId, true)
          }, 500)
        }
      } else if (data.promptPay) {
        toast({
          title: "❌ No Payment Found",
          description: "No Cover Letter payment found for this email — unlock for $5?",
          variant: "destructive",
          duration: null,
          action: {
            label: "OK",
            onClick: () => toast.dismiss(),
          },
        })
        setShowRestoreForm(false)
      } else {
        const subject = encodeURIComponent("Cover Letter Premium Access Restore Issue")
        const body = encodeURIComponent(
          `Hello STAR Support,\n\nI'm trying to restore my cover letter premium access but couldn't find a payment for my email: ${emailToUse}\n\nPlease help me verify my payment and restore access.\n\nThank you!`,
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
    if (!coverLetterId) {
      setError("No cover letter to export")
      return
    }

    try {
      const response = await fetch(`/api/cover-letter-export-pdf?coverLetterId=${coverLetterId}`)

      if (!response.ok) {
        throw new Error("Export failed")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const originalName = resumeFile?.name.replace(/\.[^/.]+$/, "") || "cover"
      a.download = `${originalName}_STAR_Cover_Letter.pdf`
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
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-white premium-body">AI-Powered Cover Letter Generation</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white premium-heading">AI Cover Letter Generator</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto premium-body">
            Upload your resume and paste the job description. Get a professional, tailored cover letter in seconds. Free
            preview, $5 one-time payment for full access.
          </p>
          <p className="text-sm text-gray-400 mt-4 max-w-2xl mx-auto">
            AI-Generated Content – This cover letter is created by AI and may require editing. Always review and
            customize before submitting to employers.
          </p>
        </div>
      </section>

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Upload Section */}
          <Card className="p-8 mb-8">
            <div className="space-y-6">
              <div className="text-center">
                <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2 premium-heading">Generate Your Cover Letter</h2>
                <p className="text-muted-foreground premium-body">
                  Upload your resume and paste the job description to generate a professional cover letter
                </p>

                {isPremium && (
                  <div className="inline-flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full border border-accent/30 mt-4">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-accent premium-body">Premium Access Active</span>
                  </div>
                )}

                {!isPremium && (
                  <div className="mt-6">
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
                  <Card className="p-6 mt-6 max-w-md mx-auto bg-muted/50 border-2 border-[#FFD700]">
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
              </div>

              <div className="max-w-2xl mx-auto space-y-6">
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

                {/* Resume Upload */}
                <div>
                  <Label htmlFor="resume-upload" className="text-base font-bold">
                    1. Upload Your Resume
                  </Label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.rtf,.txt"
                    onChange={handleResumeChange}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload">
                    <Button asChild className="w-full mt-2 cursor-pointer">
                      <span className="premium-body">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Resume File
                      </span>
                    </Button>
                  </label>
                  {resumeFile && (
                    <p className="mt-2 text-sm font-bold text-green-600 premium-body">Selected: {resumeFile.name}</p>
                  )}
                </div>

                {/* Job Description */}
                <div>
                  <Label htmlFor="job-description" className="text-base font-bold">
                    2. Paste Job Description
                  </Label>
                  <Textarea
                    id="job-description"
                    placeholder="Paste the full job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="mt-2 min-h-[200px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Include company name, job title, requirements, and responsibilities
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  onClick={() => generateCoverLetter(false)}
                  disabled={(!resumeFile || !jobDescription.trim()) && !coverLetterId}
                  className="w-full"
                  size="lg"
                  loading={loading || uploading}
                >
                  {uploading
                    ? "Uploading..."
                    : loading
                      ? "Generating..."
                      : isPremium
                        ? "Generate Cover Letter (Full)"
                        : "Generate Cover Letter (Free Preview)"}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  AI-Generated Content – Always review and customize before submitting
                </p>
              </div>
            </div>
          </Card>

          {/* Results Section */}
          {result && (
            <div className="space-y-6">
              {/* Tone Match Score */}
              {result.toneScore !== undefined && (
                <Card className="p-8">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2 premium-heading">Tone Match Score</h3>
                    <div className="text-6xl font-bold text-primary mb-2">{result.toneScore}%</div>
                    <p className="text-sm text-muted-foreground premium-body">
                      Your cover letter matches the job description's tone and requirements
                    </p>
                  </div>
                </Card>
              )}

              {/* Cover Letter Preview/Full */}
              <Card className="p-8 relative">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold premium-heading">Your Cover Letter</h3>
                  {result.isPremium && (
                    <Button onClick={handleExportPDF} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                  )}
                </div>

                {!result.isPremium ? (
                  <div className="space-y-6">
                    {/* Free Preview - First 2-3 sentences */}
                    <div className="prose max-w-none">
                      <p className="text-base leading-relaxed whitespace-pre-line">{result.preview}</p>
                    </div>

                    {/* Blurred rest */}
                    <div className="relative">
                      <div className="blur-sm select-none pointer-events-none text-base leading-relaxed text-gray-500">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
                        voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                        <br />
                        <br />
                        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim
                        id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
                        doloremque laudantium.
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                        <div className="text-center space-y-4 p-8">
                          <Lock className="w-16 h-16 text-primary mx-auto" />
                          <h4 className="text-xl font-bold">Unlock Full Cover Letter</h4>
                          <p className="text-sm text-muted-foreground max-w-md">
                            Get the complete professionally written cover letter tailored to this job
                          </p>
                          <div className="space-y-2">
                            <p className="font-bold text-2xl text-primary">$5 One-Time Payment</p>
                            <p className="text-xs text-muted-foreground">Lifetime access, no subscription</p>
                          </div>
                          {!email && (
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="max-w-xs mx-auto"
                            />
                          )}
                          <Button onClick={handleUnlock} size="lg" className="w-full max-w-xs">
                            Get Full Cover Letter - $5
                          </Button>
                          <ul className="text-xs text-left space-y-1 max-w-xs mx-auto">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-accent" />
                              Full cover letter (300-400 words)
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-accent" />
                              PDF export with proper formatting
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-accent" />
                              Unlimited cover letters forever
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <p className="text-base leading-relaxed whitespace-pre-line">{result.coverLetter}</p>
                  </div>
                )}

                {result.isPremium && (
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-xs text-gray-500 text-center">
                      AI-Generated Content – Review and customize before submitting to employers
                    </p>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
