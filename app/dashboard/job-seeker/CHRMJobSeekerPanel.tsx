"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/components/toast-provider"
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
  DollarSign,
  Clock,
  Star,
  TrendingUp,
  Flame,
  BarChart3,
  Globe,
  AlertTriangle,
  BookmarkIcon,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Eye,
  Loader2,
  Filter,
  ExternalLink,
  Timer,
  Building2,
  Users,
  Sparkles,
  GraduationCap,
} from "lucide-react"
import type {
  CHRMJob,
  CHRMIntelligenceData,
} from "@/types/chrm-nexus"
import ApplyModal from "./ApplyModal"

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

function workModelLabel(model: string): { label: string; className: string } {
  const map: Record<string, { label: string; className: string }> = {
    remote:  { label: "Remote",  className: "bg-green-100 text-green-800" },
    hybrid:  { label: "Hybrid",  className: "bg-blue-100 text-blue-800" },
    onsite:  { label: "Onsite",  className: "bg-orange-100 text-orange-800" },
  }
  return map[model?.toLowerCase()] ?? { label: model || "Unknown", className: "bg-gray-100 text-gray-700" }
}

function contractLabel(type: string | null): string {
  if (!type) return "Not specified"
  const map: Record<string, string> = { W2: "W2", C2C: "C2C", "1099": "1099", W2_OR_C2C: "W2 or C2C" }
  return map[type] ?? type.replace(/_/g, " ")
}

/**
 * Formats an avg_rate from company_analytics (which HAS a rate_type field).
 * For industry_demand (no rate_type), values > 500 are suppressed as corrupted
 * (CHRM mixes hourly/annual without normalizing — the average becomes meaningless).
 * Returns empty string for corrupted or missing values.
 */
function formatIntelRate(rate: number | null, rateType?: string | null): string {
  if (rate == null || rate <= 0) return ""
  // If we have an explicit rate_type (company_analytics), use it
  if (rateType === "annual") {
    const k = rate / 1000
    return `$${k >= 10 ? Math.round(k) : k.toFixed(1)}K/yr`
  }
  if (rateType === "hourly") {
    return `$${rate.toLocaleString()}/hr`
  }
  // No rate_type (industry_demand): only display if clearly hourly (≤ 500)
  // Values > 500 with no rate_type are corrupted averages — hide them
  if (rate > 500) return ""
  return `$${rate.toLocaleString()}/hr`
}

// ── Company name quality filters ──────────────────────────────
/**
 * Returns true if a company name is suitable for public display.
 * Filters out: spam/SES tools, AWS, all-caps abbreviations, generic names.
 */
function isDisplayableCompany(name: string | null): boolean {
  if (!name || name.trim().length === 0) return false
  const n = name.trim()
  const lower = n.toLowerCase()

  // Block known email marketing / SMTP / SES platforms masquerading as employers
  const blocklist = [
    "powerhouse", "prohires", "amazon web service", "amazon ses",
    "sendgrid", "mailchimp", "constant contact",
  ]
  if (blocklist.some((b) => lower.includes(b))) return false

  // Block plain generic names
  const genericExact = [
    "government agency", "agency", "company", "unknown", "n/a",
    "employer", "client", "staffing", "recruiter",
  ]
  if (genericExact.includes(lower)) return false

  // Block pure abbreviations: 2–7 uppercase letters/digits, no spaces
  // e.g., DSOHF, IDOH, HCL — unknown to end users
  if (/^[A-Z0-9]{2,7}$/.test(n)) return false

  return true
}

function relativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "recently"
  const then = new Date(dateStr).getTime()
  if (isNaN(then)) return "recently"
  const diffMs = Date.now() - then
  if (diffMs < 0) return "Just posted"
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHours < 1) return "Just now"
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return "1 day ago"
  if (diffDays < 7) return `${diffDays} days ago`
  const diffWeeks = Math.floor(diffDays / 7)
  return diffWeeks === 1 ? "1 week ago" : `${diffWeeks} weeks ago`
}

function timeRemaining(expiresAt: string | null | undefined): string {
  if (!expiresAt) return "48h window"
  const expTime = new Date(expiresAt).getTime()
  if (isNaN(expTime)) return "48h window"
  const diffMs = expTime - Date.now()
  if (diffMs <= 0) return "Expired"
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  if (hours < 1) return "<1hr left"
  if (hours < 24) return `${hours}h left`
  const days = Math.floor(hours / 24)
  return `${days}d left`
}

// ── Common visa types ────────────────────────────────────────
const VISA_TYPES = [
  "US Citizen",
  "Green Card",
  "H1B",
  "L1",
  "OPT",
  "CPT",
  "TN",
  "E3",
  "H4 EAD",
]

// ── Main Component ───────────────────────────────────────────
export default function CHRMJobSeekerPanel() {
  const { showToast } = useToast()

  // Intelligence data
  const [intelligence, setIntelligence] = useState<CHRMIntelligenceData | null>(null)
  const [intelLoading, setIntelLoading] = useState(true)

  // Job feed
  const [jobs, setJobs] = useState<CHRMJob[]>([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)

  // Hot jobs
  const [hotJobIds, setHotJobIds] = useState<Map<string, number>>(new Map())
  const [hotJobs, setHotJobs] = useState<CHRMJob[]>([])
  const [hotLoading, setHotLoading] = useState(true)

  // User state
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set())
  const [submittedJobIds, setSubmittedJobIds] = useState<Set<string>>(new Set())
  const [selectedJob, setSelectedJob] = useState<CHRMJob | null>(null)

  // Apply modal
  const [applyModalJob, setApplyModalJob] = useState<CHRMJob | null>(null)
  const [applyModalOpen, setApplyModalOpen] = useState(false)

  // Filters
  const [filterSkills, setFilterSkills] = useState("")
  const [filterState, setFilterState] = useState("")
  const [filterVisaType, setFilterVisaType] = useState("")

  const LIMIT = 12

  // ── Load intelligence data ─────────────────────────────────
  useEffect(() => {
    async function loadIntelligence() {
      try {
        const res = await fetch("/api/chrm/intelligence")
        if (res.ok) {
          const data = await res.json()
          setIntelligence(data)
        }
      } catch {
        // silently fail
      } finally {
        setIntelLoading(false)
      }
    }
    loadIntelligence()
  }, [])

  // ── Load saved jobs and submitted jobs ─────────────────────
  useEffect(() => {
    async function loadUserActivity() {
      try {
        const [savedRes, subRes] = await Promise.all([
          fetch("/api/chrm/activity?type=job_saved"),
          fetch("/api/chrm/activity?user_submissions=true"),
        ])
        if (savedRes.ok) {
          const data = await savedRes.json()
          setSavedJobIds(new Set(data.saved_job_ids ?? []))
        }
        if (subRes.ok) {
          const data = await subRes.json()
          setSubmittedJobIds(new Set((data.submissions ?? []).map((s: { job_id: string }) => s.job_id)))
        }
      } catch {
        // silently fail
      }
    }
    loadUserActivity()
  }, [])

  // ── Load hot jobs (aggregated views) ───────────────────────
  useEffect(() => {
    async function loadHotJobs() {
      try {
        const res = await fetch("/api/chrm/activity?hot_jobs=true")
        if (res.ok) {
          const data = await res.json()
          const hotMap = new Map<string, number>()
          for (const item of data.hot_jobs ?? []) {
            hotMap.set(item.job_id, Number(item.view_count))
          }
          setHotJobIds(hotMap)

          // Fetch job details for top 6 hot job IDs
          if (hotMap.size > 0) {
            const topIds = Array.from(hotMap.keys()).slice(0, 6)
            const jobRes = await fetch("/api/chrm/jobs?limit=50&min_score=50")
            if (jobRes.ok) {
              const jobData = await jobRes.json()
              const allJobs: CHRMJob[] = jobData.jobs ?? []
              const matched = topIds
                .map((id) => allJobs.find((j) => j.job_id === id))
                .filter((j): j is CHRMJob => j !== undefined)
              setHotJobs(matched)
            }
          }
        }
      } catch {
        // silently fail
      } finally {
        setHotLoading(false)
      }
    }
    loadHotJobs()
  }, [])

  // ── Fetch job feed ─────────────────────────────────────────
  const fetchJobs = useCallback(async (newOffset = 0) => {
    setJobsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("limit", String(LIMIT))
      params.set("offset", String(newOffset))
      params.set("sort_by", "posted_date")
      if (filterSkills.trim()) params.set("skills", filterSkills.trim())
      if (filterState && filterState !== "all") params.set("state", filterState)

      const res = await fetch(`/api/chrm/jobs?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        let fetchedJobs: CHRMJob[] = data.jobs ?? []

        // Apply visa filter client-side
        if (filterVisaType && filterVisaType !== "none") {
          fetchedJobs = fetchedJobs.filter((job) => {
            if (!job.visa_restrictions || job.visa_restrictions.length === 0) return true
            return !job.visa_restrictions.some(
              (r) => r.toLowerCase() === filterVisaType.toLowerCase()
            )
          })
        }

        setJobs(fetchedJobs)
        setTotal(data.total ?? 0)
        setOffset(newOffset)
      }
    } catch {
      setJobs([])
    } finally {
      setJobsLoading(false)
    }
  }, [filterSkills, filterState, filterVisaType])

  useEffect(() => {
    fetchJobs(0)
  }, [fetchJobs])

  // ── Track job view ─────────────────────────────────────────
  const handleViewJob = useCallback((job: CHRMJob) => {
    setSelectedJob(job)
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

  // ── Toggle save ────────────────────────────────────────────
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
          data.saved ? next.add(jobId) : next.delete(jobId)
          return next
        })
      }
    } catch {}
  }, [])

  // ── Apply (opens modal) ───────────────────────────────────
  const handleApply = useCallback((job: CHRMJob) => {
    if (submittedJobIds.has(job.job_id)) return
    setApplyModalJob(job)
    setApplyModalOpen(true)
  }, [submittedJobIds])

  // Called by ApplyModal on successful submission
  const handleApplySuccess = useCallback((jobId: string) => {
    setSubmittedJobIds((prev) => new Set(prev).add(jobId))
  }, [])

  // Pagination
  const totalPages = Math.ceil(total / LIMIT)
  const currentPage = Math.floor(offset / LIMIT) + 1

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* ══════════════════════════════════════════════════════ */}
      {/* ── MARKET INTELLIGENCE PANEL ─────────────────────── */}
      {/* ══════════════════════════════════════════════════════ */}
      <div id="market-intelligence">
        <Card className="p-6 bg-gradient-to-br from-[#0A1A2F] to-[#132A47] text-white">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-[#E8C547]" />
            <h2 className="text-xl font-bold premium-heading">Market Intelligence</h2>
          </div>

          {intelLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-white/50" />
            </div>
          ) : intelligence ? (
            <div className="space-y-6">
              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-[#E8C547] premium-heading">
                    {intelligence.stats.total_active.toLocaleString()}
                  </p>
                  <p className="text-sm text-white/70 premium-body">Live Jobs</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-[#E8C547] premium-heading">
                    {intelligence.stats.metro_count}
                  </p>
                  <p className="text-sm text-white/70 premium-body">Metro Areas</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-[#E8C547] premium-heading">
                    {intelligence.stats.state_count}
                  </p>
                  <p className="text-sm text-white/70 premium-body">States</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-[#E8C547] premium-heading">
                    {intelligence.stats.avg_quality}
                  </p>
                  <p className="text-sm text-white/70 premium-body">Avg Quality</p>
                </div>
              </div>

              {/* In-Demand Skills */}
              {intelligence.skill_velocity && intelligence.skill_velocity.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-white/90 premium-heading mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#E8C547]" />
                    In-Demand Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {intelligence.skill_velocity.slice(0, 15).map((sv) => (
                      <span
                        key={sv.skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${sv.color}20`,
                          color: sv.color,
                          border: `1px solid ${sv.color}40`,
                        }}
                      >
                        {sv.skill}
                        <span className="text-[10px] opacity-70">({sv.count})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Cities */}
              {intelligence.city_heatmap && intelligence.city_heatmap.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-white/90 premium-heading mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#E8C547]" />
                    Top Cities by Job Volume
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {intelligence.city_heatmap.slice(0, 8).map((ch) => (
                      <div key={ch.city} className="bg-white/10 rounded-lg px-3 py-2">
                        <p className="text-sm font-medium text-white premium-heading truncate">
                          {ch.city}
                        </p>
                        <p className="text-xs text-white/60 premium-body">
                          {ch.roles} roles · Score {ch.score}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Salary Benchmarks */}
              {(() => {
                // Show benchmarks that have a valid avg_range with non-zero values
                const validBenchmarks = (intelligence.salary_benchmarks ?? []).filter(
                  (sb) => sb.avg_range != null && (sb.avg_range.min > 0 || sb.avg_range.max > 0)
                )
                if (validBenchmarks.length === 0) return null

                // Format a salary range value: hourly shown as-is, annual shown as $XK
                function fmtBenchVal(val: number, rateType: string | null): string {
                  if (rateType === "annual") {
                    const k = val / 1000
                    return `$${k >= 10 ? Math.round(k) : k.toFixed(1)}K`
                  }
                  return `$${val.toLocaleString()}`
                }

                return (
                  <div>
                    <h3 className="text-sm font-semibold text-white/90 premium-heading mb-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[#E8C547]" />
                      Salary Benchmarks
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {validBenchmarks.slice(0, 4).map((sb) => {
                        const ctLabel = contractLabel(sb.contract_type ?? null)
                        const rateSuffix = sb.rate_type === "hourly" ? "/hr" : sb.rate_type === "annual" ? "/yr" : ""
                        const avgMin = fmtBenchVal(sb.avg_range!.min, sb.rate_type ?? null)
                        const avgMax = fmtBenchVal(sb.avg_range!.max, sb.rate_type ?? null)
                        const overallMin = sb.overall_range ? fmtBenchVal(sb.overall_range.min, sb.rate_type ?? null) : null
                        const overallMax = sb.overall_range ? fmtBenchVal(sb.overall_range.max, sb.rate_type ?? null) : null
                        return (
                          <div key={`${sb.contract_type}-${sb.rate_type}`} className="bg-white/10 rounded-lg px-3 py-2">
                            <p className="text-sm font-medium text-[#E8C547] premium-heading">
                              {avgMin}–{avgMax}{rateSuffix}
                            </p>
                            <p className="text-xs text-white/60 premium-body">
                              {ctLabel} · {sb.sample_size ?? 0} jobs
                            </p>
                            {overallMin && overallMax && (
                              <p className="text-[10px] text-white/40">
                                Range: {overallMin}–{overallMax}{rateSuffix}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}

              {/* Hiring Trends — uses API data when available, otherwise sector distribution */}
              {(() => {
                const apiTrends = intelligence.hiring_trends ?? []
                const apiHasData = apiTrends.some((ht) => (ht.new_jobs ?? 0) > 0)

                if (apiHasData) {
                  // ── API-provided weekly trend chart ────────────────────────
                  return (
                    <div>
                      <h3 className="text-sm font-semibold text-white/90 premium-heading mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#E8C547]" />
                        Hiring Trends (Last {apiTrends.length} Weeks)
                      </h3>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-end gap-1 h-20">
                          {apiTrends.map((ht, idx) => {
                            const newJobs = ht.new_jobs ?? 0
                            const netGrowth = ht.net_growth ?? 0
                            const maxJobs = Math.max(...apiTrends.map((h) => h.new_jobs ?? 0))
                            const heightPct = maxJobs > 0 ? (newJobs / maxJobs) * 100 : 10
                            return (
                              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-[9px] text-white/50">{newJobs}</span>
                                <div
                                  className={`w-full rounded-t ${netGrowth >= 0 ? "bg-green-400/60" : "bg-red-400/60"}`}
                                  style={{ height: `${Math.max(heightPct, 5)}%` }}
                                />
                                <span className="text-[8px] text-white/40 truncate w-full text-center">
                                  {(ht.week ?? "").slice(5)}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                        {(() => {
                          const totalNet = apiTrends.reduce((s, h) => s + (h.net_growth ?? 0), 0)
                          return (
                            <div className="flex justify-between mt-2 text-[10px] text-white/50">
                              <span>Net growth:{" "}
                                <span className={totalNet >= 0 ? "text-green-400" : "text-red-400"}>
                                  {totalNet >= 0 ? "+" : ""}{totalNet.toLocaleString()} jobs
                                </span>
                              </span>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  )
                }

                // ── Fallback: sector-based hiring activity from industry_demand ──
                const sectors = (intelligence.industry_demand ?? [])
                  .filter((id) => (id.job_count ?? 0) > 0)
                  .slice(0, 8)
                if (sectors.length === 0) return null
                const maxCount = Math.max(...sectors.map((id) => id.job_count ?? 0))
                return (
                  <div>
                    <h3 className="text-sm font-semibold text-white/90 premium-heading mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#E8C547]" />
                      Hiring Activity by Sector
                    </h3>
                    <div className="bg-white/5 rounded-lg p-4 space-y-2.5">
                      {sectors.map((id, idx) => {
                        const count = id.job_count ?? 0
                        const widthPct = maxCount > 0 ? Math.max((count / maxCount) * 100, 4) : 4
                        const growing = (id.growth_pct ?? 0) >= 0
                        const growthLabel = id.growth_pct != null
                          ? `${growing ? "+" : ""}${id.growth_pct.toFixed(0)}%`
                          : null
                        return (
                          <div key={id.industry ?? idx} className="flex items-center gap-3">
                            {/* Sector name */}
                            <span className="text-xs text-white/80 w-28 shrink-0 truncate premium-body">
                              {id.industry ?? "Other"}
                            </span>
                            {/* Bar */}
                            <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${growing ? "bg-green-400" : "bg-red-400"}`}
                                style={{ width: `${widthPct}%` }}
                              />
                            </div>
                            {/* Count */}
                            <span className="text-xs font-semibold text-white/90 w-8 text-right shrink-0">
                              {count.toLocaleString()}
                            </span>
                            {/* Growth badge */}
                            {growthLabel && (
                              <span className={`text-xs w-10 text-right shrink-0 ${growing ? "text-green-400" : "text-red-400"}`}>
                                {growthLabel}
                              </span>
                            )}
                          </div>
                        )
                      })}
                      <div className="flex justify-between pt-2 border-t border-white/10 text-xs text-white/50">
                        <span>
                          Total active:{" "}
                          <span className="text-green-400 font-semibold">
                            {intelligence.stats.total_active.toLocaleString()} jobs
                          </span>
                        </span>
                        <span className="text-white/30">Live snapshot</span>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Top Companies Hiring */}
              {(() => {
                // Filter: must have displayable name AND at least 1 open role
                const validCompanies = (intelligence.company_analytics ?? []).filter(
                  (ca) =>
                    isDisplayableCompany(ca.company_name ?? null) &&
                    (ca.open_roles ?? 0) > 0
                )
                if (validCompanies.length === 0) return null
                return (
                  <div>
                    <h3 className="text-sm font-semibold text-white/90 premium-heading mb-3 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#E8C547]" />
                      Top Companies Hiring
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {validCompanies.slice(0, 8).map((ca, idx) => (
                        <div key={ca.company_name ?? idx} className="bg-white/10 rounded-lg px-3 py-2 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white premium-heading">{ca.company_name}</p>
                            <p className="text-xs text-white/60 premium-body">
                              {ca.open_roles} open role{ca.open_roles !== 1 ? "s" : ""}
                              {ca.avg_rate != null && ca.avg_rate > 0 && (() => {
                                const rateStr = formatIntelRate(ca.avg_rate, ca.rate_type ?? null)
                                return rateStr ? ` · Avg ${rateStr}` : ""
                              })()}
                            </p>
                          </div>
                          {ca.top_skills && ca.top_skills.length > 0 && (
                            <div className="flex gap-1">
                              {ca.top_skills.slice(0, 2).map((sk) => (
                                <span key={sk} className="text-[9px] bg-white/10 text-white/60 px-1.5 py-0.5 rounded">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Industry Demand */}
              {intelligence.industry_demand && intelligence.industry_demand.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-white/90 premium-heading mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#E8C547]" />
                    Hottest Industries
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {intelligence.industry_demand.slice(0, 8).map((id, idx) => (
                      <div key={id.industry ?? idx} className="bg-white/10 rounded-lg px-3 py-2">
                        <p className="text-sm font-medium text-white premium-heading truncate">{id.industry ?? "Other"}</p>
                        <p className="text-xs text-white/60 premium-body">
                          {(id.job_count ?? 0).toLocaleString()} jobs
                          {id.avg_rate != null && id.avg_rate > 0 && ` · ${formatIntelRate(id.avg_rate)}`}
                        </p>
                        {id.growth_pct != null && (
                          <p className={`text-[10px] ${id.growth_pct >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {id.growth_pct >= 0 ? "+" : ""}{id.growth_pct}% growth
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-white/40 premium-body">
                Last updated: {new Date(intelligence.stats.last_updated).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p className="text-sm text-white/50 premium-body">
              Market intelligence data is currently unavailable.
            </p>
          )}
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* ── HOT JOBS SECTION — always visible ─────────────── */}
      {/* ══════════════════════════════════════════════════════ */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Flame className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-bold text-foreground premium-heading">
            Hot Jobs
          </h2>
          <span className="text-xs text-muted-foreground premium-body">
            Most viewed this week
          </span>
        </div>

        {hotLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : hotJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotJobs.map((job) => (
              <Card
                key={job.job_id}
                className="p-4 hover:shadow-md transition cursor-pointer border-l-4 border-l-orange-400"
                onClick={() => handleViewJob(job)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-foreground premium-heading line-clamp-2">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-1 text-orange-500 shrink-0">
                    <Eye className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">
                      {hotJobIds.get(job.job_id) ?? 0}
                    </span>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground premium-body">
                  <p className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {job.city}, {job.state}
                  </p>
                  <p className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {formatRate(job)}
                  </p>
                </div>
                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {job.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="inline-block bg-orange-50 text-orange-700 text-[10px] px-1.5 py-0.5 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                {/* 48-hour indicator */}
                <div className="flex items-center gap-1 mt-2 text-[10px] text-orange-600">
                  <Timer className="w-3 h-3" />
                  {timeRemaining(job.expires_at)}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-orange-50/50 rounded-lg border border-dashed border-orange-200">
            <Flame className="w-10 h-10 text-orange-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground premium-heading">
              No hot jobs yet
            </p>
            <p className="text-xs text-muted-foreground mt-1 premium-body">
              Hot jobs appear here once job seekers and recruiters start viewing listings.
              Browse the Job Feed below to discover opportunities!
            </p>
          </div>
        )}
      </Card>

      {/* ══════════════════════════════════════════════════════ */}
      {/* ── JOB FEED WITH FILTERS ─────────────────────────── */}
      {/* ══════════════════════════════════════════════════════ */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground premium-heading">
              Job Feed
            </h2>
          </div>
          {/* 48h freshness badge */}
          <div className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1 font-medium">
            <Timer className="w-3.5 h-3.5" />
            Jobs refresh every 48 hours
          </div>
        </div>

        {/* ── FILTER BAR — distinct styling ─── */}
        <div className="bg-[#F0F4F8] border border-[#D1DAE6] rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-[#0A1A2F]" />
            <span className="text-sm font-bold text-[#0A1A2F] premium-heading">Filter Jobs</span>
            <span className="text-xs text-muted-foreground premium-body ml-auto">
              {jobsLoading ? "Loading..." : `${total} jobs available`}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-[#0A1A2F] uppercase tracking-wider mb-1 block premium-heading">
                Skills
              </label>
              <Input
                placeholder="e.g. Python, AWS, React"
                value={filterSkills}
                onChange={(e) => setFilterSkills(e.target.value)}
                className="h-9 text-sm bg-white border-[#C0CBDA] focus:border-[#E8C547] focus:ring-[#E8C547]"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#0A1A2F] uppercase tracking-wider mb-1 block premium-heading">
                State
              </label>
              <Select value={filterState} onValueChange={setFilterState}>
                <SelectTrigger className="h-9 text-sm bg-white border-[#C0CBDA]">
                  <SelectValue placeholder="All states" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {["CA","TX","NY","FL","WA","IL","GA","NC","VA","MA","PA","OH","CO","AZ","NJ","DC"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#0A1A2F] uppercase tracking-wider mb-1 block premium-heading">
                Visa Type
              </label>
              <Select value={filterVisaType} onValueChange={setFilterVisaType}>
                <SelectTrigger className="h-9 text-sm bg-white border-[#C0CBDA]">
                  <SelectValue placeholder="No filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Visa Filter</SelectItem>
                  {VISA_TYPES.map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Hides jobs that restrict your visa type
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {jobsLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty */}
        {!jobsLoading && jobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium premium-heading">No jobs match your criteria</p>
            <p className="text-sm text-muted-foreground premium-body mt-1">
              Try adjusting your filters or check back later
            </p>
          </div>
        )}

        {/* Job cards */}
        {!jobsLoading && jobs.length > 0 && (
          <div className="space-y-3">
            {jobs.map((job) => (
              <Card
                key={job.job_id}
                className="p-4 hover:shadow-md transition cursor-pointer border hover:border-[#E8C547]/50"
                onClick={() => handleViewJob(job)}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {job.is_featured && (
                        <Badge className="text-[10px] bg-[#E8C547] text-[#0A1A2F] border-[#D4AF37]">
                          <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                          Featured
                        </Badge>
                      )}
                      <h3 className="text-sm font-semibold text-foreground premium-heading">
                        {job.title}
                      </h3>
                      <Badge className={`text-[10px] ${workModelLabel(job.work_model).className}`}>
                        {workModelLabel(job.work_model).label}
                      </Badge>
                      {job.quality_score >= 80 && (
                        <Badge className="text-[10px] bg-green-100 text-green-800">
                          <Star className="w-2.5 h-2.5 mr-0.5" />
                          Top Quality
                        </Badge>
                      )}
                      {submittedJobIds.has(job.job_id) && (
                        <Badge className="text-[10px] bg-purple-100 text-purple-800">
                          Applied
                        </Badge>
                      )}
                    </div>
                    {/* Company name */}
                    {job.company_name && (
                      <div className="flex items-center gap-1.5 text-xs text-foreground/80 mb-1">
                        <Building2 className="w-3 h-3 text-muted-foreground" />
                        <span className="font-medium">{job.company_name}</span>
                        {job.industry && (
                          <span className="text-muted-foreground">· {job.industry}</span>
                        )}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground premium-body">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.city}, {job.state}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {formatRate(job)}
                      </span>
                      {job.contract_type && <span>{contractLabel(job.contract_type)}</span>}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {relativeTime(job.posted_date || job.ingested_at)}
                      </span>
                      {typeof job.application_count === "number" && job.application_count > 0 && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <Users className="w-3 h-3" />
                          {job.application_count} applicant{job.application_count !== 1 ? "s" : ""}
                        </span>
                      )}
                      {job.seniority_level && (
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />
                          {job.seniority_level.charAt(0).toUpperCase() + job.seniority_level.slice(1)}
                          {job.experience_min != null && (
                            <span>· {job.experience_min}{job.experience_max ? `-${job.experience_max}` : "+"} yrs</span>
                          )}
                        </span>
                      )}
                      {/* 48h countdown */}
                      <span className="flex items-center gap-1 text-amber-600 font-medium">
                        <Timer className="w-3 h-3" />
                        {timeRemaining(job.expires_at)}
                      </span>
                    </div>
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.skills.slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            className="inline-block bg-[#0A1A2F]/10 text-[#0A1A2F] text-[10px] px-2 py-0.5 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 5 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{job.skills.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                    {job.visa_restrictions && job.visa_restrictions.length > 0 && (
                      <p className="flex items-center gap-1 text-[10px] text-orange-600 mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        Visa: {job.visa_restrictions.join(", ")}
                      </p>
                    )}
                  </div>
                  {/* Right side: Save + View */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSaveJob(job.job_id)
                      }}
                    >
                      <BookmarkIcon
                        className={`w-4 h-4 ${
                          savedJobIds.has(job.job_id) ? "fill-[#E8C547] text-[#E8C547]" : "text-muted-foreground"
                        }`}
                      />
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#E8C547] hover:bg-[#D4AF37] text-[#0A1A2F] text-[10px] h-7 px-2.5 font-bold disabled:opacity-50"
                      disabled={submittedJobIds.has(job.job_id)}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleApply(job)
                      }}
                    >
                      {submittedJobIds.has(job.job_id) ? "Applied ✓" : "Apply Now"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[10px] h-7 px-2.5"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewJob(job)
                      }}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!jobsLoading && totalPages > 1 && (
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
      </Card>

      {/* ── Apply Modal ────────────────────────────────────── */}
      <ApplyModal
        job={applyModalJob}
        open={applyModalOpen}
        onOpenChange={(open) => {
          setApplyModalOpen(open)
          if (!open) setApplyModalJob(null)
        }}
        onSuccess={handleApplySuccess}
      />

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
                <div className="flex flex-wrap gap-2">
                  {selectedJob.is_featured && (
                    <Badge className="bg-[#E8C547] text-[#0A1A2F] border-[#D4AF37]">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  <Badge className={workModelLabel(selectedJob.work_model).className}>
                    {workModelLabel(selectedJob.work_model).label}
                  </Badge>
                  {selectedJob.contract_type && (
                    <Badge className="bg-gray-100 text-gray-700">
                      {contractLabel(selectedJob.contract_type)}
                    </Badge>
                  )}
                  <Badge className={selectedJob.quality_score >= 80 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}>
                    <Star className="w-3 h-3 mr-1" />
                    Quality: {selectedJob.quality_score}
                  </Badge>
                  {typeof selectedJob.application_count === "number" && selectedJob.application_count > 0 && (
                    <Badge className="bg-blue-100 text-blue-700">
                      <Users className="w-3 h-3 mr-1" />
                      {selectedJob.application_count} applicant{selectedJob.application_count !== 1 ? "s" : ""}
                    </Badge>
                  )}
                  {/* 48h freshness */}
                  <Badge className="bg-amber-50 text-amber-700 border border-amber-200">
                    <Timer className="w-3 h-3 mr-1" />
                    {timeRemaining(selectedJob.expires_at)}
                  </Badge>
                </div>

                {/* Company + Industry */}
                {selectedJob.company_name && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{selectedJob.company_name}</span>
                    {selectedJob.industry && (
                      <span className="text-muted-foreground">· {selectedJob.industry}</span>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p className="flex items-center gap-2 text-muted-foreground premium-body">
                    <MapPin className="w-4 h-4" />
                    {selectedJob.city}, {selectedJob.state}
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground premium-body">
                    <DollarSign className="w-4 h-4" />
                    {formatRate(selectedJob)}
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground premium-body">
                    <Clock className="w-4 h-4" />
                    Posted {relativeTime(selectedJob.posted_date || selectedJob.ingested_at)}
                  </p>
                  {selectedJob.expires_at && (
                    <p className="flex items-center gap-2 text-muted-foreground premium-body">
                      <Briefcase className="w-4 h-4" />
                      Expires {new Date(selectedJob.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  )}
                  {selectedJob.seniority_level && (
                    <p className="flex items-center gap-2 text-muted-foreground premium-body">
                      <GraduationCap className="w-4 h-4" />
                      {selectedJob.seniority_level.charAt(0).toUpperCase() + selectedJob.seniority_level.slice(1)} Level
                      {selectedJob.experience_min != null && (
                        <span>· {selectedJob.experience_min}{selectedJob.experience_max ? `-${selectedJob.experience_max}` : "+"} yrs exp</span>
                      )}
                    </p>
                  )}
                </div>

                {/* 48-hour notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
                  <Timer className="w-4 h-4 text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700">
                    This listing is available for <strong>48 hours</strong> from when it was posted.
                    Act quickly to express interest.
                  </p>
                </div>

                {selectedJob.skills && selectedJob.skills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground premium-heading mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.skills.map((skill) => (
                        <span key={skill} className="bg-[#0A1A2F]/10 text-[#0A1A2F] text-xs px-2.5 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedJob.visa_restrictions && selectedJob.visa_restrictions.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="flex items-center gap-2 text-orange-700 text-sm font-medium mb-1">
                      <AlertTriangle className="w-4 h-4" />
                      Visa Restrictions
                    </p>
                    <p className="text-sm text-orange-600">
                      {selectedJob.visa_restrictions.join(", ")}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold text-foreground premium-heading mb-2">Description</h4>
                  <div className="text-sm text-foreground premium-body whitespace-pre-wrap leading-relaxed">
                    {selectedJob.description}
                  </div>
                </div>

                <Separator />

                {/* Action buttons */}
                <div className="flex items-center gap-3">
                  <Button
                    className="bg-[#E8C547] hover:bg-[#D4AF37] text-[#0A1A2F] font-bold flex items-center gap-2 disabled:opacity-50"
                    disabled={submittedJobIds.has(selectedJob.job_id)}
                    onClick={() => handleApply(selectedJob)}
                  >
                    <ExternalLink className="w-4 h-4" />
                    {submittedJobIds.has(selectedJob.job_id) ? "Applied ✓" : "Apply Now"}
                  </Button>
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
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
