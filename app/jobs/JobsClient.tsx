"use client"

import { useState, useCallback, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { MapPin, DollarSign, Briefcase, BookmarkIcon, Search, Filter, Lock, UserPlus, ArrowRight } from "lucide-react"
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

export default function Jobs() {
  const { data: session } = useSession()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    remote: "all",
    salary: "all",
    level: "all",
  })
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [applicationsToday, setApplicationsToday] = useState(0)
  const [hasSubscription, setHasSubscription] = useState(false)

  const MAX_FREE_APPLICATIONS = 5

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch("/api/jobs/list")
        const data = await response.json()
        setJobs(data.jobs || [])
      } catch (error) {
        console.error("Failed to fetch jobs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  useEffect(() => {
    async function fetchUserData() {
      if (!session?.user?.id) return

      try {
        const [statsRes, savedRes] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/dashboard/saved-jobs"),
        ])

        if (statsRes.ok) {
          const stats = await statsRes.json()
          setApplicationsToday(stats.applicationsToday || 0)
          setHasSubscription(!!stats.subscription)
        }

        if (savedRes.ok) {
          const saved = await savedRes.json()
          setSavedJobs(saved.savedJobs?.map((j: any) => j.jobId) || [])
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error)
      }
    }

    fetchUserData()
  }, [session])

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    if (filters.remote !== "all" && job.remoteType !== filters.remote) return false

    return true
  })

  const handleSaveJob = useCallback(
    async (jobId: string) => {
      if (!session?.user?.id) {
        router.push("/auth/login?callbackUrl=/jobs")
        return
      }

      try {
        const method = savedJobs.includes(jobId) ? "DELETE" : "POST"
        const response = await fetch("/api/jobs/save", {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId }),
        })

        if (response.ok) {
          setSavedJobs((prev) => (prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]))
        }
      } catch (error) {
        console.error("Failed to save job:", error)
      }
    },
    [savedJobs, session, router],
  )

  const handleApply = useCallback(
    async (jobId: string) => {
      if (!session?.user?.id) {
        router.push("/auth/signup?callbackUrl=/jobs")
        return
      }

      if (applicationsToday >= MAX_FREE_APPLICATIONS && !hasSubscription) {
        router.push("/pricing")
        return
      }

      try {
        const response = await fetch("/api/jobs/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId }),
        })

        if (response.ok) {
          setApplicationsToday((prev) => prev + 1)
          alert("Application submitted! Check your dashboard for status updates.")
        } else {
          const error = await response.json()
          alert(error.error || "Failed to submit application")
        }
      } catch (error) {
        console.error("Failed to apply:", error)
        alert("Failed to submit application. Please try again.")
      }
    },
    [applicationsToday, hasSubscription, session, router],
  )

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="abstract-gradient text-primary-foreground py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white premium-heading">
            Job Board
          </h1>
          <p className="text-lg text-white/90 premium-body mb-6">
            Browse consulting and contract opportunities in Software, AI, Cloud, Cybersecurity, and more
          </p>
          {!session && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/signup?callbackUrl=/jobs">
                <Button className="bg-[#E8C547] hover:bg-[#D4AF37] text-[#0A1A2F] font-bold px-8 py-3 text-base">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Register Free to Apply
                </Button>
              </Link>
              <Link href="/auth/login?callbackUrl=/jobs">
                <Button className="bg-white/20 hover:bg-white/30 text-white font-semibold border border-white/40 px-8 py-3 text-base">
                  Already a Member? Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#0A1A2F] to-[#132A47] rounded-xl p-8 text-center text-white">
            <div className="inline-flex items-center gap-2 bg-[#E8C547] text-[#0A1A2F] px-4 py-1.5 rounded-full text-sm font-bold mb-4">
              Save Time
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 premium-heading">
              Want Someone to Apply for You?
            </h2>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto premium-body">
              Skip the daily grind of applications. A dedicated recruiter submits 5-30 applications per day
              on your behalf — so you can focus on interview prep and networking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/tools/ats-optimizer">
                <Button className="bg-[#E8C547] hover:bg-[#D4AF37] text-[#0A1A2F] font-bold px-8">
                  Optimize Your Resume First
                </Button>
              </Link>
              <Link href="/hire-recruiter">
                <Button className="bg-[#E8C547]/20 hover:bg-[#E8C547]/30 text-[#E8C547] font-bold border-2 border-[#E8C547] px-8">
                  Let a Recruiter Apply for You
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Search & Filters */}
        <div className="mb-8 bg-[#F0F4F8] border border-[#D1DAE6] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-[#0A1A2F]" />
            <h3 className="text-sm font-bold text-[#0A1A2F] uppercase tracking-wider">Search & Filter Jobs</h3>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by job title, company, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-[#0A1A2F] uppercase tracking-wider mb-2 block">Work Type</label>
              <select
                value={filters.remote}
                onChange={(e) => setFilters({ ...filters, remote: e.target.value })}
                className="w-full p-2.5 border border-[#D1DAE6] rounded-lg bg-white text-sm"
              >
                <option value="all">All Work Types</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#0A1A2F] uppercase tracking-wider mb-2 block">Job Type</label>
              <select
                value={filters.salary}
                onChange={(e) => setFilters({ ...filters, salary: e.target.value })}
                className="w-full p-2.5 border border-[#D1DAE6] rounded-lg bg-white text-sm"
              >
                <option value="all">All Job Types</option>
                <option value="contract">Contract</option>
                <option value="consulting">Consulting</option>
              </select>
            </div>

            <div className="flex items-end">
              {session ? (
                <div className="text-sm text-[#0A1A2F] bg-white px-4 py-2.5 rounded-lg border border-[#D1DAE6] w-full text-center">
                  Applications this week: <span className="font-bold">{applicationsToday}/{hasSubscription ? "Unlimited" : MAX_FREE_APPLICATIONS}</span>
                </div>
              ) : (
                <Link href="/auth/signup?callbackUrl=/jobs" className="w-full">
                  <div className="text-sm text-[#0A1A2F] bg-[#E8C547]/20 px-4 py-2.5 rounded-lg border border-[#E8C547] w-full text-center font-semibold cursor-pointer hover:bg-[#E8C547]/30 transition">
                    <UserPlus className="h-4 w-4 inline mr-1" />
                    Register Free to Apply
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-muted-foreground font-medium">
            {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"} found
          </p>
          {!session && filteredJobs.length > 0 && (
            <p className="text-sm text-[#E8C547] font-semibold flex items-center gap-1">
              <Lock className="h-4 w-4" />
              Register free to apply
            </p>
          )}
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">No jobs listed yet</p>
            <p className="text-muted-foreground mb-6">Job listings are updated daily from our CHRM NEXUS integration. Check back soon!</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/tools/ats-optimizer">
                <Button className="bg-[#E8C547] hover:bg-[#D4AF37] text-[#0A1A2F] font-bold">
                  Optimize Your Resume
                </Button>
              </Link>
              <Link href="/hire-recruiter">
                <Button className="bg-[#0A1A2F] hover:bg-[#132A47] text-white font-bold">
                  Hire a Recruiter Instead
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="p-6 hover:shadow-lg transition border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <Link href={`/jobs/${job.id}`} className="hover:underline">
                      <h3 className="text-xl font-bold text-foreground mb-1 premium-heading">
                        {job.title}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground premium-body">{job.company}</p>
                  </div>
                  {session ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSaveJob(job.id)}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <BookmarkIcon
                        className={`h-5 w-5 ${savedJobs.includes(job.id) ? "fill-current text-primary" : ""}`}
                      />
                    </Button>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-3 mb-4 text-sm">
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span className="capitalize">{job.employmentType}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                    <DollarSign className="h-3.5 w-3.5" />
                    {job.salary}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full capitalize">
                    {job.remoteType}
                  </span>
                  <span className="text-muted-foreground text-xs self-center">
                    Posted {job.postedDate}
                  </span>
                </div>

                <p className="text-foreground mb-4 line-clamp-2 premium-body text-sm">
                  {job.description}
                </p>

                <div className="flex gap-2 items-center">
                  {session ? (
                    <>
                      <Button
                        onClick={() => handleApply(job.id)}
                        disabled={applicationsToday >= MAX_FREE_APPLICATIONS && !hasSubscription}
                        className="bg-[#E8C547] hover:bg-[#D4AF37] text-[#0A1A2F] font-bold disabled:opacity-50"
                      >
                        Apply Now
                      </Button>
                      <Link href={`/jobs/${job.id}`}>
                        <Button variant="outline" className="border-[#0A1A2F] text-[#0A1A2F] hover:bg-[#0A1A2F]/5">
                          View Details
                        </Button>
                      </Link>
                      {applicationsToday >= MAX_FREE_APPLICATIONS && !hasSubscription && (
                        <Link href="/pricing" className="ml-2">
                          <span className="text-sm text-[#E8C547] font-semibold hover:underline">
                            Upgrade for Unlimited
                          </span>
                        </Link>
                      )}
                    </>
                  ) : (
                    <>
                      <Link href="/auth/signup?callbackUrl=/jobs">
                        <Button className="bg-[#E8C547] hover:bg-[#D4AF37] text-[#0A1A2F] font-bold">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Register Free to Apply
                        </Button>
                      </Link>
                      <Link href={`/jobs/${job.id}`}>
                        <Button variant="outline" className="border-[#0A1A2F] text-[#0A1A2F] hover:bg-[#0A1A2F]/5">
                          View Details
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Bottom CTA for non-logged-in users */}
        {!session && filteredJobs.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-[#0A1A2F] to-[#132A47] rounded-xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-3 premium-heading">Ready to Start Applying?</h3>
            <p className="text-white/80 mb-6 max-w-lg mx-auto">
              Create a free account to apply for jobs, save listings, and track your applications.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/signup?callbackUrl=/jobs">
                <Button className="bg-[#E8C547] hover:bg-[#D4AF37] text-[#0A1A2F] font-bold px-8 py-3 text-base">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Create Free Account
                </Button>
              </Link>
              <Link href="/pricing">
                <Button className="bg-white/20 hover:bg-white/30 text-white font-semibold border border-white/40 px-8 py-3 text-base">
                  View Plans & Pricing
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
