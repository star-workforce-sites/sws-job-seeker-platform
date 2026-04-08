"use client"

import { useState, useCallback, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { MapPin, DollarSign, Briefcase, BookmarkIcon, Search, Filter, Lock, UserPlus, ArrowRight, Zap, Eye } from "lucide-react"
import Link from "next/link"

// ── Manual job (from our own DB) ─────────────────────────────────
type ManualJob = {
  _source: "manual"
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

// ── CHRM NEXUS job (read-only, external) ─────────────────────────
type CHRMJob = {
  _source: "chrm"
  id: string
  title: string
  company: string
  location: string
  work_model: string | null
  rate_min: number | null
  rate_max: number | null
  rate_type: string | null
  description: string | null
  posted_date: string | null
  ingested_at: string | null
  contract_type: string | null
  required_skills: string[] | null
  city: string | null
  state: string | null
  company_name: string | null
  seniority_level: string | null
}

type CombinedJob = ManualJob | CHRMJob

function formatCHRMRate(job: CHRMJob): string {
  if (job.rate_min == null && job.rate_max == null) return "Rate not listed"
  const suffix = job.rate_type === "hourly" ? "/hr" : job.rate_type === "annual" ? "/yr" : ""
  if (job.rate_min != null && job.rate_max != null) {
    return `$${job.rate_min.toLocaleString()}–$${job.rate_max.toLocaleString()}${suffix}`
  }
  if (job.rate_min != null) return `$${job.rate_min.toLocaleString()}+${suffix}`
  return `Up to $${job.rate_max!.toLocaleString()}${suffix}`
}

function relativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "Recently posted"
  const then = new Date(dateStr).getTime()
  if (isNaN(then)) return "Recently posted"
  const diff = Date.now() - then
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
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
  const [manualJobs, setManualJobs] = useState<ManualJob[]>([])
  const [chrmJobs, setChrmJobs] = useState<CHRMJob[]>([])
  const [loading, setLoading] = useState(true)
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [applicationsToday, setApplicationsToday] = useState(0)
  const [hasSubscription, setHasSubscription] = useState(false)

  const MAX_FREE_APPLICATIONS = 5

  useEffect(() => {
    async function fetchAllJobs() {
      try {
        const [manualRes, chrmRes] = await Promise.allSettled([
          fetch("/api/jobs/list"),
          fetch("/api/chrm/public-jobs"),
        ])

        if (manualRes.status === "fulfilled" && manualRes.value.ok) {
          const data = await manualRes.value.json()
          setManualJobs(
            (data.jobs || []).map((j: any) => ({ ...j, _source: "manual" as const }))
          )
        }

        if (chrmRes.status === "fulfilled" && chrmRes.value.ok) {
          const data = await chrmRes.value.json()
          setChrmJobs(
            (data.jobs || []).map((j: any) => ({
              _source: "chrm" as const,
              id: j.id,
              title: j.title,
              company: j.company_name || j.city || "See details",
              location: j.city && j.state ? `${j.city}, ${j.state}` : (j.state || "Remote"),
              work_model: j.work_model,
              rate_min: j.rate_min ?? null,
              rate_max: j.rate_max ?? null,
              rate_type: j.rate_type ?? null,
              description: j.description ?? null,
              posted_date: j.posted_date ?? null,
              ingested_at: j.ingested_at ?? null,
              contract_type: j.contract_type ?? null,
              required_skills: j.required_skills ?? null,
              city: j.city ?? null,
              state: j.state ?? null,
              company_name: j.company_name ?? null,
              seniority_level: j.seniority_level ?? null,
            }))
          )
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllJobs()
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

  // Combine and filter — manual jobs first, then CHRM
  const allJobs: CombinedJob[] = [...manualJobs, ...chrmJobs]

  const filteredJobs = allJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    if (filters.remote !== "all") {
      if (job._source === "manual") {
        if (job.remoteType !== filters.remote) return false
      } else {
        const model = job.work_model?.toLowerCase()
        if (model !== filters.remote) return false
      }
    }

    return true
  })

  const handleSaveJob = useCallback(
    async (jobId: string) => {
      // Only manual jobs can be saved
      if (!session?.user?.id) {
        router.push("/auth/register?callbackUrl=/jobs")
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
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-muted-foreground font-medium">
              {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"} found
            </p>
            {chrmJobs.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Includes {chrmJobs.filter(j => filteredJobs.some(f => f.id === j.id)).length} Nexus Hot Jobs (Posted Recently)
              </p>
            )}
          </div>
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
            <p className="text-lg font-semibold text-foreground mb-2">No jobs found</p>
            <p className="text-muted-foreground mb-6">Try adjusting your filters or search term.</p>
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
            {filteredJobs.map((job) => {
              const isCHRM = job._source === "chrm"

              if (isCHRM) {
                // ── CHRM NEXUS job card (view-only) ──────────────────────
                const cj = job as CHRMJob
                return (
                  <Card key={`chrm-${cj.id}`} className="p-6 hover:shadow-lg transition border border-blue-100 bg-blue-50/30">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-xl font-bold text-foreground premium-heading">
                            {cj.title}
                          </h3>
                          <Badge className="bg-blue-100 text-blue-700 text-[10px] shrink-0">
                            <Zap className="h-2.5 w-2.5 mr-1" />
                            Nexus Hot Job
                          </Badge>
                        </div>
                        <p className="text-muted-foreground premium-body text-sm">
                          {cj.company_name || cj.company}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4 text-sm">
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs">
                        <MapPin className="h-3 w-3" />
                        {cj.location}
                      </span>
                      {cj.work_model && (
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs capitalize">
                          {cj.work_model}
                        </span>
                      )}
                      {(cj.rate_min != null || cj.rate_max != null) && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs">
                          <DollarSign className="h-3 w-3" />
                          {formatCHRMRate(cj)}
                        </span>
                      )}
                      {cj.contract_type && (
                        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full text-xs">
                          {cj.contract_type}
                        </span>
                      )}
                      {cj.seniority_level && (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs capitalize">
                          {cj.seniority_level}
                        </span>
                      )}
                      <span className="text-muted-foreground text-xs self-center">
                        {relativeTime(cj.posted_date || cj.ingested_at)}
                      </span>
                    </div>

                    {cj.description && (
                      <p className="text-foreground mb-4 line-clamp-2 premium-body text-sm">
                        {cj.description}
                      </p>
                    )}

                    {cj.required_skills && cj.required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {cj.required_skills.slice(0, 6).map((skill) => (
                          <span key={skill} className="text-[10px] bg-white border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full">
                            {skill}
                          </span>
                        ))}
                        {cj.required_skills.length > 6 && (
                          <span className="text-[10px] text-muted-foreground self-center">+{cj.required_skills.length - 6} more</span>
                        )}
                      </div>
                    )}

                    {/* CHRM jobs are view-only — no direct apply from public page */}
                    <div className="flex gap-2 items-center">
                      {session ? (
                        <Link href="/dashboard/job-seeker">
                          <Button size="sm" className="bg-[#0A1A2F] hover:bg-[#132A47] text-white font-semibold text-xs">
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            Express Interest in Dashboard
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/auth/register">
                          <Button size="sm" className="bg-[#E8C547] hover:bg-[#D4AF37] text-[#0A1A2F] font-semibold text-xs">
                            <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                            Register to Express Interest
                          </Button>
                        </Link>
                      )}
                      <p className="text-[10px] text-muted-foreground italic">
                        Hot listing — recently posted, apply through your dashboard
                      </p>
                    </div>
                  </Card>
                )
              }

              // ── Manual job card (full apply flow) ────────────────────────
              const mj = job as ManualJob
              return (
                <Card key={`manual-${mj.id}`} className="p-6 hover:shadow-lg transition border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <Link href={`/jobs/${mj.id}`} className="hover:underline">
                        <h3 className="text-xl font-bold text-foreground mb-1 premium-heading">
                          {mj.title}
                        </h3>
                      </Link>
                      <p className="text-muted-foreground premium-body">{mj.company}</p>
                    </div>
                    {session ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSaveJob(mj.id)}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <BookmarkIcon
                          className={`h-5 w-5 ${savedJobs.includes(mj.id) ? "fill-current text-primary" : ""}`}
                        />
                      </Button>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-3 mb-4 text-sm">
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                      <MapPin className="h-3.5 w-3.5" />
                      {mj.location}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full">
                      <Briefcase className="h-3.5 w-3.5" />
                      <span className="capitalize">{mj.employmentType}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                      <DollarSign className="h-3.5 w-3.5" />
                      {mj.salary}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full capitalize">
                      {mj.remoteType}
                    </span>
                    <span className="text-muted-foreground text-xs self-center">
                      Posted {mj.postedDate}
                    </span>
                  </div>

                  <p className="text-foreground mb-4 line-clamp-2 premium-body text-sm">
                    {mj.description}
                  </p>

                  <div className="flex gap-2 items-center">
                    {session ? (
                      <>
                        <Button
                          onClick={() => handleApply(mj.id)}
                          disabled={applicationsToday >= MAX_FREE_APPLICATIONS && !hasSubscription}
                          className="bg-[#E8C547] hover:bg-[#D4AF37] text-[#0A1A2F] font-bold disabled:opacity-50"
                        >
                          Apply Now
                        </Button>
                        <Link href={`/jobs/${mj.id}`}>
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
                        <Link href="/auth/register?callbackUrl=/jobs">
                          <Button className="bg-[#E8C547] hover:bg-[#D4AF37] text-[#0A1A2F] font-bold">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Register Free to Apply
                          </Button>
                        </Link>
                        <Link href={`/jobs/${mj.id}`}>
                          <Button variant="outline" className="border-[#0A1A2F] text-[#0A1A2F] hover:bg-[#0A1A2F]/5">
                            View Details
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Bottom CTA for non-logged-in users */}
        {!session && allJobs.length > 0 && (
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
