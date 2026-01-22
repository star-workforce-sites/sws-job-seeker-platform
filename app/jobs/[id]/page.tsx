"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { MapPin, DollarSign, Briefcase, BookmarkIcon, ArrowLeft, FileText, GraduationCap, ExternalLink } from "lucide-react"
import Link from "next/link"

type Job = {
  id: string
  title: string
  company: string
  location: string
  employmentType: string
  salary: string
  description: string
  postedDate: string
  remoteType: string
}

export default function JobDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    async function fetchJob() {
      try {
        const response = await fetch(`/api/jobs/${jobId}`)
        const data = await response.json()
        
        if (response.ok && data.job) {
          setJob(data.job)
        } else {
          router.push('/jobs')
        }
      } catch (error) {
        console.error("Failed to fetch job:", error)
        router.push('/jobs')
      } finally {
        setLoading(false)
      }
    }

    if (jobId) {
      fetchJob()
    }
  }, [jobId, router])

  const handleSave = useCallback(async () => {
    if (!session?.user?.id) {
      router.push(`/auth/login?callbackUrl=/jobs/${jobId}`)
      return
    }

    try {
      const method = saved ? "DELETE" : "POST"
      const response = await fetch("/api/jobs/save", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      })

      if (response.ok) {
        setSaved(!saved)
      }
    } catch (error) {
      console.error("Failed to save job:", error)
    }
  }, [saved, session, router, jobId])

  const handleApply = useCallback(async () => {
    if (!session?.user?.id) {
      router.push(`/auth/login?callbackUrl=/jobs/${jobId}`)
      return
    }

    setApplying(true)
    
    try {
      const response = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      })

      if (response.ok) {
        alert("Application submitted! Check your dashboard for status updates.")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to submit application")
      }
    } catch (error) {
      console.error("Failed to apply:", error)
      alert("Failed to submit application. Please try again.")
    } finally {
      setApplying(false)
    }
  }, [session, router, jobId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!job) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="abstract-gradient text-primary-foreground py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-white premium-heading mb-2">
            {job.title}
          </h1>
          <p className="text-lg text-white/90 premium-body">{job.company}</p>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar - InstantResumeAI CTA */}
          <aside className="lg:col-span-3 space-y-6">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-foreground">Pro Tip</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Tailor your resume for this role in minutes. Edit and update your existing resume with AI.
              </p>
              <a 
                href="https://instantresumeai.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Try InstantResumeAI
                <ExternalLink className="h-4 w-4" />
              </a>
              <p className="text-xs text-muted-foreground mt-2">Free to start</p>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  onClick={handleApply}
                  disabled={applying}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {applying ? "Applying..." : !session ? "Login to Apply" : "Apply Now"}
                </Button>
                <Button 
                  onClick={handleSave}
                  variant="outline"
                  className="w-full"
                >
                  <BookmarkIcon className={`h-4 w-4 mr-2 ${saved ? "fill-current" : ""}`} />
                  {saved ? "Saved" : "Save Job"}
                </Button>
                <Link href="/jobs">
                  <Button variant="ghost" className="w-full">
                    Browse More Jobs
                  </Button>
                </Link>
              </div>
            </Card>
          </aside>

          {/* Center - Job Details */}
          <div className="lg:col-span-6">
            <Card className="p-8">
              {/* Job Meta */}
              <div className="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground pb-6 border-b">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span className="capitalize">{job.employmentType}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>{job.salary}</span>
                </div>
                <div>
                  <span className="capitalize">{job.remoteType}</span>
                </div>
                <div>
                  <span>Posted {job.postedDate}</span>
                </div>
              </div>

              {/* Job Description */}
              <div className="prose max-w-none">
                <h2 className="text-xl font-bold text-foreground mb-4 premium-heading">Job Description</h2>
                <div className="text-foreground whitespace-pre-line premium-body">
                  {job.description}
                </div>

                <div className="mt-8 p-6 bg-muted rounded-lg">
                  <h3 className="font-bold text-foreground mb-3">About This Role</h3>
                  <p className="text-sm text-muted-foreground">
                    This is a <strong className="text-foreground">{job.employmentType}</strong> position 
                    offering <strong className="text-foreground">{job.remoteType}</strong> work. 
                    The role is based in <strong className="text-foreground">{job.location}</strong>.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-4 pt-6 border-t">
                <Button 
                  onClick={handleApply}
                  disabled={applying}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 flex-1"
                >
                  {applying ? "Applying..." : !session ? "Login to Apply" : "Apply Now"}
                </Button>
                <Button 
                  onClick={handleSave}
                  variant="outline"
                  size="lg"
                >
                  <BookmarkIcon className={`h-5 w-5 ${saved ? "fill-current" : ""}`} />
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Sidebar - OptPlanet CTA */}
          <aside className="lg:col-span-3 space-y-6">
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="h-5 w-5 text-green-600" />
                <h3 className="font-bold text-foreground">For STEM Students</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Find STEM-approved opportunities and stay OPT compliant. Resources for international students.
              </p>
              <a 
                href="https://optplanet.net" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700"
              >
                Visit OptPlanet
                <ExternalLink className="h-4 w-4" />
              </a>
              <p className="text-xs text-muted-foreground mt-2">Free resources</p>
            </Card>

            {/* Similar Jobs */}
            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-4">More Opportunities</h3>
              <div className="space-y-3 text-sm">
                <Link href="/services" className="block text-primary hover:underline">
                  Resume Distribution Service
                </Link>
                <Link href="/hire-recruiter" className="block text-primary hover:underline">
                  Hire a Dedicated Recruiter
                </Link>
                <Link href="/tools/ats-optimizer" className="block text-primary hover:underline">
                  ATS Resume Optimizer
                </Link>
                <Link href="/tools/cover-letter" className="block text-primary hover:underline">
                  AI Cover Letter Generator
                </Link>
              </div>
            </Card>
          </aside>

        </div>
      </main>

      <Footer />
    </div>
  )
}
