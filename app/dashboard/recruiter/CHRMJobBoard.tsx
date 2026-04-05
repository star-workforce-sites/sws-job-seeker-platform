"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Star,
  BookmarkIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  AlertTriangle,
  Send,
  Eye,
  Loader2,
} from "lucide-react"
import type { CHRMJob } from "@/types/chrm-nexus"

// ── US states for filter dropdown ────────────────────────────
const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN",
  "IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV",
  "NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN",
  "TX","UT","VT","VA","WA","WV","WI","WY","DC",
]

// ── Helpers ──────────────────────────────────────────────────
function formatRate(job: CHRMJob): string {
  if (job.rate_min == null && job.rate_max == null) return "Rate not listed"
  const suffix = job.rate_type === "hourly" ? "/hr" : job.rate_type === "annual" ? "/yr" : ""
  if (job.rate_min != null && job.rate_max != null) {
    return `$${job.rate_min.toLocaleString()}–$${job.rate_max.toLocaleString()}${suffix}`
  }
  if (job.rate_min != null) return `$${job.rate_min.toLocaleString()}+${suffix}`
  return `Up to $${job.rate_max!.toLocaleString()}${suffix}`
}

function workModelBadge(model: string): { label: string; className: string } {
  const map: Record<string, { label: string; className: string }> = {
    remote:  { label: "Remote",  className: "bg-green-100 text-green-800" },
    hybrid:  { label: "Hybrid",  className: "bg-blue-100 text-blue-800" },
    onsite:  { label: "Onsite",  className: "bg-orange-100 text-orange-800" },
  }
  return map[model?.toLowerCase()] ?? { label: model || "Unknown", className: "bg-gray-100 text-gray-700" }
}

function contractBadge(type: string | null): { label: string; className: string } {
  if (!type) return { label: "Not specified", className: "bg-gray-100 text-gray-700" }
  const map: Record<string, { label: string; className: string }> = {
    W2:         { label: "W2",        className: "bg-purple-100 text-purple-800" },
    C2C:        { label: "C2C",       className: "bg-indigo-100 text-indigo-800" },
    "1099":     { label: "1099",      className: "bg-teal-100 text-teal-800" },
    W2_OR_C2C:  { label: "W2 or C2C", className: "bg-violet-100 text-violet-800" },
  }
  return map[type] ?? { label: type, className: "bg-gray-100 text-gray-700" }
}

function qualityBadge(score: number): string {
  if (score >= 80) return "bg-green-100 text-green-800"
  if (score >= 60) return "bg-yellow-100 text-yellow-800"
  return "bg-gray-100 text-gray-700"
}

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHours < 1) return "Just now"
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return "1 day ago"
  if (diffDays < 7) return `${diffDays} days ago`
  const diffWeeks = Math.floor(diffDays / 7)
  return diffWeeks === 1 ? "1 week ago" : `${diffWeeks} weeks ago`
}

// ── Props ────────────────────────────────────────────────────
interface CHRMJobBoardProps {
  clients: Array<{
    assignment_id: string
    client_name: string
    client_email: string
    plan_type: string
  }>
}

// ── Main Component ───────────────────────────────────────────
export default function CHRMJobBoard({ clients }: CHRMJobBoardProps) {
  const [jobs, setJobs] = useState<CHRMJob[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set())
  const [selectedJob, setSelectedJob] = useState<CHRMJob | null>(null)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [submitJobId, setSubmitJobId] = useState<string | null>(null)
  const [submitJobTitle, setSubmitJobTitle] = useState("")
  const [submitCompany, setSubmitCompany] = useState("")
  const [selectedClient, setSelectedClient] = useState(clients[0]?.assignment_id ?? "")
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  // Filters
  const [filterState, setFilterState] = useState("")
  const [filterWorkModel, setFilterWorkModel] = useState("")
  const [filterSkills, setFilterSkills] = useState("")
  const [filterContractType, setFilterContractType] = useState("")
  const [filterMinScore, setFilterMinScore] = useState("")

  const LIMIT = 20

  // ── Fetch jobs ─────────────────────────────────────────────
  const fetchJobs = useCallback(async (newOffset = 0) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("limit", String(LIMIT))
      params.set("offset", String(newOffset))
      if (filterState && filterState !== "all") params.set("state", filterState)
      if (filterWorkModel && filterWorkModel !== "all") params.set("work_model", filterWorkModel)
      if (filterSkills.trim()) params.set("skills", filterSkills.trim())
      if (filterContractType && filterContractType !== "all") params.set("contract_type", filterContractType)
      if (filterMinScore && filterMinScore !== "0") params.set("min_score", filterMinScore)

      const res = await fetch(`/api/chrm/jobs?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setJobs(data.jobs ?? [])
        setTotal(data.total ?? 0)
        setOffset(newOffset)
      } else {
        console.error("[CHRMJobBoard] Failed to fetch jobs:", res.status)
        setJobs([])
      }
    } catch (error) {
      console.error("[CHRMJobBoard] Fetch error:", error)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [filterState, filterWorkModel, filterSkills, filterContractType, filterMinScore])

  // ── Fetch saved job IDs ────────────────────────────────────
  useEffect(() => {
    async function loadSavedJobs() {
      try {
        const res = await fetch("/api/chrm/activity?type=job_saved")
        if (res.ok) {
          const data = await res.json()
          setSavedJobIds(new Set(data.saved_job_ids ?? []))
        }
      } catch {
        // silently fail
      }
    }
    loadSavedJobs()
  }, [])

  // ── Initial load and filter changes ────────────────────────
  useEffect(() => {
    fetchJobs(0)
  }, [fetchJobs])

  // ── Record job view ────────────────────────────────────────
  const handleViewJob = useCallback(async (job: CHRMJob) => {
    setSelectedJob(job)
    // Fire and forget view tracking
    fetch("/api/chrm/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job_id: job.job_id,
        event_type: "job_viewed",
        metadata: { title: job.title, city: job.city, state: job.state },
      }),
    }).catch(() => {})
  }, [])

  // ── Toggle save job ────────────────────────────────────────
  const handleSaveJob = useCallback(async (jobId: string) => {
    try {
      const res = await fetch("/api/chrm/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId, event_type: "job_saved" }),
      })
      if (res.ok) {
        const data = await res.json()
        setSavedJobIds((prev) => {
          const next = new Set(prev)
          if (data.saved) {
            next.add(jobId)
          } else {
            next.delete(jobId)
          }
          return next
        })
      }
    } catch {
      // silently fail
    }
  }, [])

  // ── Submit candidate ───────────────────────────────────────
  const openSubmitDialog = useCallback((job: CHRMJob) => {
    setSubmitJobId(job.job_id)
    setSubmitJobTitle(job.title)
    setSubmitCompany(`${job.city}, ${job.state}`)
    setSelectedClient(clients[0]?.assignment_id ?? "")
    setSubmitSuccess(null)
    setSubmitDialogOpen(true)
  }, [clients])

  const handleSubmitCandidate = useCallback(async () => {
    if (!submitJobId || !selectedClient) return
    setSubmitting(true)
    setSubmitSuccess(null)
    try {
      // 1. Record activity event
      await fetch("/api/chrm/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: submitJobId,
          event_type: "candidate_submitted",
          metadata: {
            job_title: submitJobTitle,
            assignment_id: selectedClient,
            client_name: clients.find((c) => c.assignment_id === selectedClient)?.client_name,
          },
        }),
      })

      // 2. Also log in application_tracking via recruiter submissions API
      const res = await fetch("/api/recruiter/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignment_id: selectedClient,
          job_title: submitJobTitle,
          company_name: submitCompany,
          job_url: null,
          notes: `CHRM NEXUS Job ID: ${submitJobId}`,
          status: "submitted",
        }),
      })

      if (res.ok) {
        setSubmitSuccess(
          `Candidate submitted for "${submitJobTitle}" on behalf of ${
            clients.find((c) => c.assignment_id === selectedClient)?.client_name ?? "client"
          }`
        )
      } else {
        const errData = await res.json()
        setSubmitSuccess(null)
        alert(errData.error || "Failed to submit candidate")
      }
    } catch {
      alert("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }, [submitJobId, submitJobTitle, submitCompany, selectedClient, clients])

  // ── Pagination ─────────────────────────────────────────────
  const totalPages = Math.ceil(total / LIMIT)
  const currentPage = Math.floor(offset / LIMIT) + 1

  // ── Render ─────────────────────────────────────────────────
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground premium-heading mb-1">
        CHRM NEXUS Job Board
      </h2>
      <p className="text-sm text-muted-foreground premium-body mb-4">
        Browse live consulting and contract positions. Submit candidates for your clients directly.
      </p>
      <Separator className="mb-6" />

      {/* ── Filter Bar ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <div>
          <label className="text-xs font-medium text-muted-foreground premium-heading mb-1 block">
            State
          </label>
          <Select value={filterState} onValueChange={setFilterState}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="All states" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {US_STATES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground premium-heading mb-1 block">
            Work Model
          </label>
          <Select value={filterWorkModel} onValueChange={setFilterWorkModel}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="All models" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="onsite">Onsite</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground premium-heading mb-1 block">
            Contract Type
          </label>
          <Select value={filterContractType} onValueChange={setFilterContractType}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="W2">W2</SelectItem>
              <SelectItem value="C2C">C2C</SelectItem>
              <SelectItem value="1099">1099</SelectItem>
              <SelectItem value="W2_OR_C2C">W2 or C2C</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground premium-heading mb-1 block">
            Skills (comma-separated)
          </label>
          <Input
            placeholder="e.g. Java, AWS"
            value={filterSkills}
            onChange={(e) => setFilterSkills(e.target.value)}
            className="h-9 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground premium-heading mb-1 block">
            Min Quality Score
          </label>
          <Select value={filterMinScore} onValueChange={setFilterMinScore}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Any score" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any Score</SelectItem>
              <SelectItem value="50">50+</SelectItem>
              <SelectItem value="60">60+</SelectItem>
              <SelectItem value="70">70+</SelectItem>
              <SelectItem value="80">80+</SelectItem>
              <SelectItem value="90">90+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count + pagination */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground premium-body">
          {loading ? "Loading..." : `${total} jobs found`}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || loading}
              onClick={() => fetchJobs(offset - LIMIT)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground premium-body">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || loading}
              onClick={() => fetchJobs(offset + LIMIT)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* ── Loading State ───────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* ── Empty State ─────────────────────────────────────── */}
      {!loading && jobs.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium premium-heading">No jobs match your filters</p>
          <p className="text-sm text-muted-foreground premium-body mt-1">
            Try adjusting your search criteria
          </p>
        </div>
      )}

      {/* ── Job Cards ───────────────────────────────────────── */}
      {!loading && jobs.length > 0 && (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card
              key={job.job_id}
              className="p-5 hover:shadow-md transition cursor-pointer"
              onClick={() => handleViewJob(job)}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  {/* Title + badges */}
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="text-base font-semibold text-foreground premium-heading truncate">
                      {job.title}
                    </h3>
                    <Badge className={`text-xs ${workModelBadge(job.work_model).className}`}>
                      {workModelBadge(job.work_model).label}
                    </Badge>
                    <Badge className={`text-xs ${contractBadge(job.contract_type).className}`}>
                      {contractBadge(job.contract_type).label}
                    </Badge>
                    <Badge className={`text-xs ${qualityBadge(job.quality_score)}`}>
                      <Star className="w-3 h-3 mr-1" />
                      {job.quality_score}
                    </Badge>
                  </div>

                  {/* Location + rate + time */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground premium-body mb-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.city}, {job.state}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      {formatRate(job)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {relativeTime(job.ingested_at)}
                    </span>
                  </div>

                  {/* Skills (up to 6) */}
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {job.skills.slice(0, 6).map((skill) => (
                        <span
                          key={skill}
                          className="inline-block bg-[#0A1A2F]/10 text-[#0A1A2F] text-xs px-2 py-0.5 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 6 && (
                        <span className="text-xs text-muted-foreground">
                          +{job.skills.length - 6} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Visa warning */}
                  {job.visa_restrictions && job.visa_restrictions.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-orange-600">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Visa restrictions: {job.visa_restrictions.join(", ")}
                    </div>
                  )}
                </div>

                {/* Actions column */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSaveJob(job.job_id)
                    }}
                    title={savedJobIds.has(job.job_id) ? "Unsave job" : "Save job"}
                  >
                    <BookmarkIcon
                      className={`w-4 h-4 ${
                        savedJobIds.has(job.job_id) ? "fill-[#E8C547] text-[#E8C547]" : "text-muted-foreground"
                      }`}
                    />
                  </Button>
                  {clients.length > 0 && (
                    <Button
                      size="sm"
                      className="bg-[#0A1A2F] hover:bg-[#132A47] text-white text-xs premium-heading"
                      onClick={(e) => {
                        e.stopPropagation()
                        openSubmitDialog(job)
                      }}
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Submit
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Bottom Pagination ───────────────────────────────── */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => fetchJobs(offset - LIMIT)}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground premium-body px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => fetchJobs(offset + LIMIT)}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* ── Job Detail Dialog ───────────────────────────────── */}
      <Dialog open={!!selectedJob} onOpenChange={(open) => { if (!open) setSelectedJob(null) }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl premium-heading">
                  {selectedJob.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Badges row */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={workModelBadge(selectedJob.work_model).className}>
                    {workModelBadge(selectedJob.work_model).label}
                  </Badge>
                  <Badge className={contractBadge(selectedJob.contract_type).className}>
                    {contractBadge(selectedJob.contract_type).label}
                  </Badge>
                  <Badge className={qualityBadge(selectedJob.quality_score)}>
                    <Star className="w-3 h-3 mr-1" />
                    Quality: {selectedJob.quality_score}
                  </Badge>
                </div>

                {/* Meta info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground premium-body">
                    <MapPin className="w-4 h-4" />
                    {selectedJob.city}, {selectedJob.state}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground premium-body">
                    <DollarSign className="w-4 h-4" />
                    {formatRate(selectedJob)}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground premium-body">
                    <Clock className="w-4 h-4" />
                    Posted {relativeTime(selectedJob.ingested_at)}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground premium-body">
                    <Briefcase className="w-4 h-4" />
                    Expires {new Date(selectedJob.expires_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Skills */}
                {selectedJob.skills && selectedJob.skills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground premium-heading mb-2">
                      Required Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-block bg-[#0A1A2F]/10 text-[#0A1A2F] text-xs px-2.5 py-1 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Visa restrictions */}
                {selectedJob.visa_restrictions && selectedJob.visa_restrictions.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-orange-700 text-sm font-medium mb-1">
                      <AlertTriangle className="w-4 h-4" />
                      Visa Restrictions
                    </div>
                    <p className="text-sm text-orange-600">
                      {selectedJob.visa_restrictions.join(", ")}
                    </p>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground premium-heading mb-2">
                    Job Description
                  </h4>
                  <div className="text-sm text-foreground premium-body whitespace-pre-wrap leading-relaxed">
                    {selectedJob.description}
                  </div>
                </div>

                {/* Actions */}
                <Separator />
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleSaveJob(selectedJob.job_id)}
                    className="flex items-center gap-2"
                  >
                    <BookmarkIcon
                      className={`w-4 h-4 ${
                        savedJobIds.has(selectedJob.job_id) ? "fill-[#E8C547] text-[#E8C547]" : ""
                      }`}
                    />
                    {savedJobIds.has(selectedJob.job_id) ? "Saved" : "Save Job"}
                  </Button>
                  {clients.length > 0 && (
                    <Button
                      className="bg-[#0A1A2F] hover:bg-[#132A47] text-white premium-heading flex items-center gap-2"
                      onClick={() => {
                        setSelectedJob(null)
                        openSubmitDialog(selectedJob)
                      }}
                    >
                      <Send className="w-4 h-4" />
                      Submit Candidate
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Submit Candidate Dialog ─────────────────────────── */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="premium-heading">Submit Candidate</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <p className="text-sm text-muted-foreground premium-body">
                Submitting candidate for:
              </p>
              <p className="font-medium text-foreground premium-heading mt-1">
                {submitJobTitle}
              </p>
              <p className="text-sm text-muted-foreground premium-body">
                {submitCompany}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground premium-heading">
                Select Client *
              </label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.assignment_id} value={c.assignment_id}>
                      {c.client_name} — {c.plan_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {submitSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 premium-body">
                {submitSuccess}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSubmitDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#0A1A2F] hover:bg-[#132A47] text-white premium-heading"
                disabled={submitting || !selectedClient || !!submitSuccess}
                onClick={handleSubmitCandidate}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Candidate
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
