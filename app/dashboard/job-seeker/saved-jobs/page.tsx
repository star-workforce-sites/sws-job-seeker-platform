"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Bookmark,
  ArrowLeft,
  MapPin,
  DollarSign,
  Clock,
  ExternalLink,
  Trash2,
  Briefcase,
  Loader2,
} from "lucide-react"
import type { CHRMJob } from "@/types/chrm-nexus"

// ── Types ────────────────────────────────────────────────────

interface ManualSavedJob {
  id: string
  title: string
  description: string
  location: string
  industry: string
  employmentType: string
  salaryMin: number | null
  salaryMax: number | null
  expiresAt: string | null
  isActive: boolean
  createdAt: string
  company: string
  savedAt: string
}

interface SavedJobsData {
  manualJobs: ManualSavedJob[]
  chrmSavedJobs: Array<{ job_id: string; saved_at: string }>
  totalCount: number
}

// ── Helpers ──────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatRate(job: CHRMJob): string {
  if (job.rate_min && job.rate_max) {
    const type = job.rate_type === "annual" ? "/yr" : "/hr"
    return `$${job.rate_min.toLocaleString()}–$${job.rate_max.toLocaleString()}${type}`
  }
  if (job.rate_min) {
    const type = job.rate_type === "annual" ? "/yr" : "/hr"
    return `$${job.rate_min.toLocaleString()}${type}+`
  }
  return ""
}

function formatSalary(min: number | null, max: number | null): string {
  if (min && max) return `$${min.toLocaleString()}–$${max.toLocaleString()}`
  if (min) return `$${min.toLocaleString()}+`
  return ""
}

// ── Component ────────────────────────────────────────────────

export default function SavedJobsPage() {
  const [manualJobs, setManualJobs] = useState<ManualSavedJob[]>([])
  const [chrmJobs, setChrmJobs] = useState<CHRMJob[]>([])
  const [chrmSavedDates, setChrmSavedDates] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [tab, setTab] = useState<"all" | "manual" | "chrm">("all")

  useEffect(() => {
    fetchSavedJobs()
  }, [])

  async function fetchSavedJobs() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/dashboard/saved-jobs-full")
      if (!res.ok) throw new Error("Failed to fetch saved jobs")
      const data: SavedJobsData = await res.json()

      setManualJobs(data.manualJobs)

      // Build a map of CHRM job_id → saved_at
      const dateMap: Record<string, string> = {}
      data.chrmSavedJobs.forEach((s) => {
        dateMap[s.job_id] = s.saved_at
      })
      setChrmSavedDates(dateMap)

      // Fetch CHRM job details if we have saved CHRM jobs
      if (data.chrmSavedJobs.length > 0) {
        await fetchChrmDetails(data.chrmSavedJobs.map((s) => s.job_id))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load saved jobs")
    } finally {
      setLoading(false)
    }
  }

  async function fetchChrmDetails(jobIds: string[]) {
    try {
      // Fetch a large batch from CHRM and filter to our saved IDs
      const res = await fetch(`/api/chrm/jobs?limit=200`)
      if (!res.ok) return
      const data = await res.json()
      const allJobs: CHRMJob[] = data.jobs || []
      const savedSet = new Set(jobIds)
      const matched = allJobs.filter((j) => savedSet.has(j.job_id))
      setChrmJobs(matched)
    } catch {
      // Non-critical — we'll show IDs without details
    }
  }

  async function unsaveManualJob(jobId: string) {
    setRemovingId(jobId)
    try {
      const res = await fetch("/api/jobs/save", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      })
      if (res.ok) {
        setManualJobs((prev) => prev.filter((j) => j.id !== jobId))
      }
    } catch {
      // silently ignore
    } finally {
      setRemovingId(null)
    }
  }

  async function unsaveChrmJob(jobId: string) {
    setRemovingId(jobId)
    try {
      const res = await fetch("/api/chrm/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId, event_type: "job_saved" }),
      })
      if (res.ok) {
        setChrmJobs((prev) => prev.filter((j) => j.job_id !== jobId))
        setChrmSavedDates((prev) => {
          const copy = { ...prev }
          delete copy[jobId]
          return copy
        })
      }
    } catch {
      // silently ignore
    } finally {
      setRemovingId(null)
    }
  }

  const totalCount = manualJobs.length + Object.keys(chrmSavedDates).length

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/job-seeker"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground premium-heading">
                Saved Jobs
              </h1>
              <p className="text-muted-foreground premium-body mt-1">
                {loading
                  ? "Loading..."
                  : `${totalCount} saved job${totalCount !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {!loading && totalCount > 0 && (manualJobs.length > 0 && Object.keys(chrmSavedDates).length > 0) && (
          <div className="flex gap-2 mb-6">
            {(["all", "chrm", "manual"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t === "all"
                  ? `All (${totalCount})`
                  : t === "chrm"
                    ? `Consulting Roles (${Object.keys(chrmSavedDates).length})`
                    : `Job Board (${manualJobs.length})`}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-muted-foreground">Loading your saved jobs...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <Card className="p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button variant="outline" onClick={fetchSavedJobs}>
              Try Again
            </Button>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && totalCount === 0 && (
          <Card className="p-12 text-center">
            <Bookmark className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground premium-heading mb-2">
              No saved jobs yet
            </h2>
            <p className="text-muted-foreground premium-body mb-6 max-w-md mx-auto">
              Browse jobs and click the bookmark icon to save roles you&apos;re interested in.
              They&apos;ll appear here for easy access.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/jobs">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Browse Job Board
                </Button>
              </Link>
              <Link href="/dashboard/job-seeker#job-feed">
                <Button variant="outline">
                  View Consulting Roles
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* ── CHRM Saved Jobs ─────────────────────────────────── */}
        {!loading && (tab === "all" || tab === "chrm") && chrmJobs.length > 0 && (
          <div className="mb-8">
            {tab === "all" && (
              <h2 className="text-lg font-semibold text-foreground premium-heading mb-4">
                Consulting &amp; Contract Roles
              </h2>
            )}
            <div className="space-y-4">
              {chrmJobs.map((job) => (
                <Card
                  key={job.job_id}
                  className="p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-lg font-semibold text-foreground premium-heading truncate">
                          {job.title}
                        </h3>
                        {job.contract_type && (
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 whitespace-nowrap">
                            {job.contract_type.replace("_", " / ")}
                          </span>
                        )}
                      </div>
                      {job.company_name && (
                        <p className="text-sm text-foreground font-medium mb-1">
                          {job.company_name}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        {(job.city || job.state) && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {[job.city, job.state].filter(Boolean).join(", ")}
                            {job.work_model && job.work_model !== "onsite" && (
                              <span className="ml-1 text-xs text-green-600">
                                ({job.work_model})
                              </span>
                            )}
                          </span>
                        )}
                        {formatRate(job) && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            {formatRate(job)}
                          </span>
                        )}
                        {job.expires_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Expires {formatDate(job.expires_at)}
                          </span>
                        )}
                      </div>
                      {job.skills && job.skills.length > 0 && (
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {job.skills.slice(0, 5).map((skill) => (
                            <span
                              key={skill}
                              className="text-xs px-2 py-0.5 bg-muted rounded text-muted-foreground"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 5 && (
                            <span className="text-xs text-muted-foreground">
                              +{job.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Saved {formatDate(chrmSavedDates[job.job_id] || null)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href="/dashboard/job-seeker#job-feed">
                        <Button variant="outline" size="sm" className="text-xs">
                          <ExternalLink className="w-3.5 h-3.5 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => unsaveChrmJob(job.job_id)}
                        disabled={removingId === job.job_id}
                        className="text-muted-foreground hover:text-red-600"
                      >
                        {removingId === job.job_id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CHRM jobs we couldn't match (saved but no longer in feed) */}
        {!loading &&
          (tab === "all" || tab === "chrm") &&
          (() => {
            const matchedIds = new Set(chrmJobs.map((j) => j.job_id))
            const unmatched = Object.entries(chrmSavedDates).filter(
              ([id]) => !matchedIds.has(id)
            )
            if (unmatched.length === 0) return null
            return (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Expired or No Longer Available ({unmatched.length})
                </h3>
                <div className="space-y-2">
                  {unmatched.map(([jobId, savedAt]) => (
                    <Card key={jobId} className="p-4 opacity-60">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Job ID: {jobId.slice(0, 8)}...
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Saved {formatDate(savedAt)} — This listing may have expired
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => unsaveChrmJob(jobId)}
                          disabled={removingId === jobId}
                          className="text-muted-foreground hover:text-red-600"
                        >
                          {removingId === jobId ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })()}

        {/* ── Manual Saved Jobs ────────────────────────────────── */}
        {!loading && (tab === "all" || tab === "manual") && manualJobs.length > 0 && (
          <div className="mb-8">
            {tab === "all" && (
              <h2 className="text-lg font-semibold text-foreground premium-heading mb-4">
                Job Board Listings
              </h2>
            )}
            <div className="space-y-4">
              {manualJobs.map((job) => (
                <Card
                  key={job.id}
                  className={`p-5 hover:shadow-md transition-shadow ${
                    !job.isActive ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-lg font-semibold text-foreground premium-heading truncate">
                          {job.title}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-800 whitespace-nowrap">
                          {job.employmentType}
                        </span>
                        {!job.isActive && (
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                            Closed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground font-medium mb-1">
                        {job.company}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>
                        {formatSalary(job.salaryMin, job.salaryMax) && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            {formatSalary(job.salaryMin, job.salaryMax)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          {job.industry}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Saved {formatDate(job.savedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/jobs/${job.id}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          <ExternalLink className="w-3.5 h-3.5 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => unsaveManualJob(job.id)}
                        disabled={removingId === job.id}
                        className="text-muted-foreground hover:text-red-600"
                      >
                        {removingId === job.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
