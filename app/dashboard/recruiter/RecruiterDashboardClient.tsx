"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Briefcase,
  CheckCircle,
  Clock,
  Users,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  TrendingUp,
  FileText,
  LogOut,
} from "lucide-react"

// ── DOL-compliant status values ───────────────────────────────
const VALID_STATUSES = [
  { value: "submitted",                  label: "Submitted" },
  { value: "confirmed",                  label: "Confirmed" },
  { value: "under_review",               label: "Under Review" },
  { value: "screening_scheduled",        label: "Screening Scheduled" },
  { value: "screening_completed",        label: "Screening Completed" },
  { value: "interview_scheduled",        label: "Interview Scheduled" },
  { value: "interview_completed",        label: "Interview Completed" },
  { value: "second_interview_scheduled", label: "2nd Interview Scheduled" },
  { value: "assessment_scheduled",       label: "Assessment Scheduled" },
  { value: "assessment_completed",       label: "Assessment Completed" },
  { value: "references_requested",       label: "References Requested" },
  { value: "not_selected",               label: "Not Selected" },
  { value: "no_response",                label: "No Response" },
  { value: "position_closed",            label: "Position Closed" },
  { value: "application_withdrawn",      label: "Application Withdrawn" },
]

// ── Types ─────────────────────────────────────────────────────
interface Client {
  assignment_id: string
  client_id: string
  plan_type: string
  applications_per_day: number
  assigned_at: string
  assignment_notes: string | null
  client_name: string
  client_email: string
  subscription_type: string | null
  total_submissions: number
  submissions_today: number
  interview_count: number
  last_submission_at: string | null
}

interface Submission {
  id: string
  assignment_id: string
  job_title: string
  company_name: string
  job_url: string | null
  status: string
  application_date: string | null
  submitted_at: string
  feedback_received: boolean
  feedback_notes: string | null
  notes: string | null
  updated_at: string
  client_name: string
  client_email: string
}

interface RecruiterUser {
  id: string
  name: string
  email: string
  role: string
}

interface LogFormState {
  assignment_id: string
  job_title: string
  company_name: string
  job_url: string
  notes: string
  status: string
  submitting: boolean
  error: string | null
  success: string | null
}

// ── Helpers ───────────────────────────────────────────────────
function planLabel(planType: string): string {
  const map: Record<string, string> = {
    recruiter_basic:    "Basic (4/day)",
    recruiter_standard: "Standard (12/day)",
    recruiter_pro:      "Pro (25/day)",
  }
  return map[planType] ?? planType
}

function planColor(planType: string): string {
  const map: Record<string, string> = {
    recruiter_basic:    "bg-blue-100 text-blue-800",
    recruiter_standard: "bg-purple-100 text-purple-800",
    recruiter_pro:      "bg-[#E8C547]/20 text-[#0A1A2F]",
  }
  return map[planType] ?? "bg-gray-100 text-gray-800"
}

function statusColor(status: string): string {
  if (["interview_scheduled", "interview_completed", "second_interview_scheduled"].includes(status))
    return "bg-green-100 text-green-800"
  if (["screening_scheduled", "screening_completed", "assessment_scheduled", "assessment_completed", "references_requested"].includes(status))
    return "bg-blue-100 text-blue-800"
  if (["not_selected", "no_response", "position_closed", "application_withdrawn"].includes(status))
    return "bg-gray-100 text-gray-700"
  if (["submitted", "confirmed", "under_review"].includes(status))
    return "bg-yellow-100 text-yellow-800"
  return "bg-gray-100 text-gray-700"
}

function statusLabel(status: string): string {
  return VALID_STATUSES.find((s) => s.value === status)?.label ?? status
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  })
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({
  icon, label, value, color,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  color: string
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <div className={color}>{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground premium-body">{label}</p>
          <p className="text-2xl font-bold text-foreground premium-heading">{value}</p>
        </div>
      </div>
    </Card>
  )
}

// ── Main Component ────────────────────────────────────────────
export default function RecruiterDashboardClient({
  recruiter,
  initialClients,
  initialSubmissions,
}: {
  recruiter: RecruiterUser
  initialClients: Client[]
  initialSubmissions: Submission[]
}) {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("clients")

  const [logForm, setLogForm] = useState<LogFormState>({
    assignment_id: initialClients[0]?.assignment_id ?? "",
    job_title: "",
    company_name: "",
    job_url: "",
    notes: "",
    status: "submitted",
    submitting: false,
    error: null,
    success: null,
  })

  // ── Derived stats ─────────────────────────────────────────
  const totalToday = clients.reduce(
    (sum, c) => sum + Number(c.submissions_today), 0
  )
  const totalInterviews = clients.reduce(
    (sum, c) => sum + Number(c.interview_count), 0
  )
  const totalSubmissions = clients.reduce(
    (sum, c) => sum + Number(c.total_submissions), 0
  )

  // ── Refresh ───────────────────────────────────────────────
  async function handleRefresh() {
    setRefreshing(true)
    try {
      const [clientRes, subRes] = await Promise.all([
        fetch("/api/recruiter/clients"),
        fetch("/api/recruiter/submissions?limit=50"),
      ])
      if (clientRes.ok) {
        const data = await clientRes.json()
        setClients(data.clients ?? [])
      }
      if (subRes.ok) {
        const data = await subRes.json()
        setSubmissions(data.submissions ?? [])
      }
    } catch {
      // silently fail — user can retry
    } finally {
      setRefreshing(false)
    }
  }

  // ── Log submission ────────────────────────────────────────
  async function handleLogSubmission() {
    if (!logForm.assignment_id || !logForm.job_title || !logForm.company_name) {
      setLogForm((prev) => ({
        ...prev,
        error: "Client, job title, and company name are required.",
      }))
      return
    }

    setLogForm((prev) => ({ ...prev, submitting: true, error: null, success: null }))

    try {
      const res = await fetch("/api/recruiter/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignment_id: logForm.assignment_id,
          job_title: logForm.job_title.trim(),
          company_name: logForm.company_name.trim(),
          job_url: logForm.job_url.trim() || null,
          notes: logForm.notes.trim() || null,
          status: logForm.status,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setLogForm((prev) => ({
          ...prev,
          submitting: false,
          error: data.error ?? "Failed to log submission. Please try again.",
        }))
        return
      }

      // Add to submissions list and update client today count
      setSubmissions((prev) => [data.submission, ...prev])
      setClients((prev) =>
        prev.map((c) =>
          c.assignment_id === logForm.assignment_id
            ? {
                ...c,
                total_submissions: Number(c.total_submissions) + 1,
                submissions_today: Number(c.submissions_today) + 1,
                last_submission_at: new Date().toISOString(),
              }
            : c
        )
      )

      // Reset form (keep client selected)
      setLogForm((prev) => ({
        ...prev,
        job_title: "",
        company_name: "",
        job_url: "",
        notes: "",
        status: "submitted",
        submitting: false,
        success: `✅ Application logged: ${data.submission.job_title} at ${data.submission.company_name}`,
      }))
    } catch {
      setLogForm((prev) => ({
        ...prev,
        submitting: false,
        error: "Network error. Please try again.",
      }))
    }
  }

  // ── Update submission status ──────────────────────────────
  async function handleStatusUpdate(submissionId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/recruiter/submissions/${submissionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        const data = await res.json()
        setSubmissions((prev) =>
          prev.map((s) => (s.id === submissionId ? data.submission : s))
        )
      }
    } catch {
      // silently fail — table will show stale status
    }
  }

  // ── Client Card ───────────────────────────────────────────
  function ClientCard({ client }: { client: Client }) {
    const dailyTarget = Number(client.applications_per_day)
    const todayCount = Number(client.submissions_today)
    const progressPct = dailyTarget > 0
      ? Math.min(Math.round((todayCount / dailyTarget) * 100), 100)
      : 0

    return (
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-foreground premium-heading">
                {client.client_name}
              </span>
              <Badge className={`text-xs ${planColor(client.plan_type)}`}>
                {planLabel(client.plan_type)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground premium-body">
              {client.client_email}
            </p>
            <p className="text-xs text-muted-foreground premium-body mt-1">
              Assigned: {formatDate(client.assigned_at)}
              {client.last_submission_at && (
                <span className="ml-3">
                  Last submission: {formatDateTime(client.last_submission_at)}
                </span>
              )}
            </p>

            {/* Daily progress bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs premium-body mb-1">
                <span className="text-muted-foreground">
                  Today: {todayCount} / {dailyTarget} applications
                </span>
                <span className={progressPct >= 100 ? "text-green-600 font-medium" : "text-muted-foreground"}>
                  {progressPct}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    progressPct >= 100 ? "bg-green-500" :
                    progressPct >= 50  ? "bg-[#E8C547]" :
                    "bg-[#0A1A2F]"
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stats column */}
          <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2 shrink-0">
            <div className="text-center sm:text-right">
              <p className="text-2xl font-bold text-foreground premium-heading">
                {client.total_submissions}
              </p>
              <p className="text-xs text-muted-foreground premium-body">total</p>
            </div>
            {Number(client.interview_count) > 0 && (
              <div className="text-center sm:text-right">
                <p className="text-lg font-bold text-green-600 premium-heading">
                  {client.interview_count}
                </p>
                <p className="text-xs text-muted-foreground premium-body">interviews</p>
              </div>
            )}
            <Button
              size="sm"
              onClick={() => {
                setLogForm((prev) => ({
                  ...prev,
                  assignment_id: client.assignment_id,
                  job_title: "",
                  company_name: "",
                  job_url: "",
                  notes: "",
                  status: "submitted",
                  error: null,
                  success: null,
                }))
                setActiveTab("log")
              }}
              className="bg-[#0A1A2F] hover:bg-[#132A47] text-white premium-heading text-xs"
            >
              Log Submission
            </Button>
          </div>
        </div>

        {client.assignment_notes && (
          <div className="mt-3 text-xs text-muted-foreground premium-body bg-muted/40 rounded px-3 py-2">
            <span className="font-medium">Notes:</span> {client.assignment_notes}
          </div>
        )}
      </Card>
    )
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground premium-heading">
              Recruiter Dashboard
            </h1>
            <p className="text-muted-foreground mt-1 premium-body">
              Welcome, {recruiter.name} — {recruiter.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-8 h-8" />}
            label="Active Clients"
            value={clients.length}
            color="text-[#0A1A2F]"
          />
          <StatCard
            icon={<FileText className="w-8 h-8" />}
            label="Submitted Today"
            value={totalToday}
            color={totalToday > 0 ? "text-green-500" : "text-muted-foreground"}
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8" />}
            label="Total Submissions"
            value={totalSubmissions}
            color="text-[#E8C547]"
          />
          <StatCard
            icon={<CheckCircle className="w-8 h-8" />}
            label="Interviews"
            value={totalInterviews}
            color={totalInterviews > 0 ? "text-green-500" : "text-muted-foreground"}
          />
        </div>

        {/* No clients notice */}
        {clients.length === 0 && (
          <Card className="mb-6 p-6 border-2 border-[#E8C547]/30 bg-[#E8C547]/5">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#E8C547] shrink-0" />
              <p className="text-sm text-foreground premium-body">
                No clients assigned yet. The admin will assign clients to you shortly.
              </p>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="clients" className="premium-heading">
              My Clients ({clients.length})
            </TabsTrigger>
            <TabsTrigger value="log" className="premium-heading">
              Log Submission
            </TabsTrigger>
            <TabsTrigger value="submissions" className="premium-heading">
              Recent Submissions
              {submissions.length > 0 && (
                <span className="ml-2 bg-[#0A1A2F] text-white text-xs rounded-full px-2 py-0.5">
                  {submissions.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Tab: My Clients ─────────────────────────────── */}
          <TabsContent value="clients">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground premium-heading mb-4">
                Assigned Clients
              </h2>
              <Separator className="mb-4" />
              {clients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground premium-body">
                    No clients assigned yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {clients.map((client) => (
                    <ClientCard key={client.assignment_id} client={client} />
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* ── Tab: Log Submission ─────────────────────────── */}
          <TabsContent value="log">
            <Card className="p-6 max-w-2xl">
              <h2 className="text-lg font-semibold text-foreground premium-heading mb-1">
                Log Application Submission
              </h2>
              <p className="text-sm text-muted-foreground premium-body mb-4">
                Record a job application submitted on behalf of a client.
              </p>
              <Separator className="mb-6" />

              {clients.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground premium-body">
                    No clients assigned. Cannot log submissions yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">

                  {/* Client select */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground premium-heading">
                      Client *
                    </label>
                    <Select
                      value={logForm.assignment_id}
                      onValueChange={(val) =>
                        setLogForm((prev) => ({ ...prev, assignment_id: val, error: null, success: null }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client..." />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((c) => (
                          <SelectItem key={c.assignment_id} value={c.assignment_id}>
                            {c.client_name} — {planLabel(c.plan_type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Job title */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground premium-heading">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring premium-body"
                      placeholder="e.g. Senior Java Developer"
                      value={logForm.job_title}
                      onChange={(e) =>
                        setLogForm((prev) => ({ ...prev, job_title: e.target.value, error: null, success: null }))
                      }
                    />
                  </div>

                  {/* Company */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground premium-heading">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring premium-body"
                      placeholder="e.g. Accenture"
                      value={logForm.company_name}
                      onChange={(e) =>
                        setLogForm((prev) => ({ ...prev, company_name: e.target.value, error: null, success: null }))
                      }
                    />
                  </div>

                  {/* Job URL */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground premium-heading">
                      Job URL (optional)
                    </label>
                    <input
                      type="url"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring premium-body"
                      placeholder="https://..."
                      value={logForm.job_url}
                      onChange={(e) =>
                        setLogForm((prev) => ({ ...prev, job_url: e.target.value }))
                      }
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground premium-heading">
                      Status *
                    </label>
                    <Select
                      value={logForm.status}
                      onValueChange={(val) =>
                        setLogForm((prev) => ({ ...prev, status: val }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VALID_STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground premium-body">
                      Only DOL-compliant status values are available.
                    </p>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground premium-heading">
                      Notes (optional)
                    </label>
                    <textarea
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none premium-body"
                      rows={3}
                      placeholder="Contract role, remote, 6 months..."
                      value={logForm.notes}
                      onChange={(e) =>
                        setLogForm((prev) => ({ ...prev, notes: e.target.value }))
                      }
                    />
                  </div>

                  {/* Error / Success */}
                  {logForm.error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 premium-body">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {logForm.error}
                    </div>
                  )}
                  {logForm.success && (
                    <div className="flex items-center gap-2 text-sm text-green-600 premium-body">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      {logForm.success}
                    </div>
                  )}

                  <Button
                    onClick={handleLogSubmission}
                    disabled={logForm.submitting || !logForm.assignment_id || !logForm.job_title || !logForm.company_name}
                    className="w-full bg-[#0A1A2F] hover:bg-[#132A47] text-white premium-heading"
                  >
                    {logForm.submitting ? "Logging..." : "Log Submission"}
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* ── Tab: Recent Submissions ─────────────────────── */}
          <TabsContent value="submissions">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground premium-heading mb-1">
                Recent Submissions
              </h2>
              <p className="text-sm text-muted-foreground premium-body mb-4">
                Last 50 submissions. Click a status to update it.
              </p>
              <Separator className="mb-4" />

              {submissions.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground premium-body">
                    No submissions logged yet. Use the Log Submission tab to get started.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-3 py-3 text-left font-semibold text-foreground premium-heading">Date</th>
                        <th className="px-3 py-3 text-left font-semibold text-foreground premium-heading">Client</th>
                        <th className="px-3 py-3 text-left font-semibold text-foreground premium-heading">Job Title</th>
                        <th className="px-3 py-3 text-left font-semibold text-foreground premium-heading">Company</th>
                        <th className="px-3 py-3 text-left font-semibold text-foreground premium-heading">Status</th>
                        <th className="px-3 py-3 text-left font-semibold text-foreground premium-heading">Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((sub) => (
                        <tr key={sub.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="px-3 py-3 text-muted-foreground premium-body whitespace-nowrap">
                            {formatDate(sub.application_date || sub.submitted_at)}
                          </td>
                          <td className="px-3 py-3 text-foreground premium-body">
                            <div className="font-medium">{sub.client_name}</div>
                            <div className="text-xs text-muted-foreground">{sub.client_email}</div>
                          </td>
                          <td className="px-3 py-3 text-foreground premium-body max-w-[180px]">
                            <div className="truncate font-medium">{sub.job_title}</div>
                            {sub.notes && (
                              <div className="text-xs text-muted-foreground truncate">{sub.notes}</div>
                            )}
                          </td>
                          <td className="px-3 py-3 text-foreground premium-body whitespace-nowrap">
                            {sub.company_name}
                          </td>
                          <td className="px-3 py-3">
                            <Select
                              value={sub.status}
                              onValueChange={(val) => handleStatusUpdate(sub.id, val)}
                            >
                              <SelectTrigger className="h-7 text-xs border-0 p-0 focus:ring-0 w-auto">
                                <Badge className={`text-xs cursor-pointer ${statusColor(sub.status)}`}>
                                  {statusLabel(sub.status)}
                                </Badge>
                              </SelectTrigger>
                              <SelectContent>
                                {VALID_STATUSES.map((s) => (
                                  <SelectItem key={s.value} value={s.value} className="text-xs">
                                    {s.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-3 py-3">
                            {sub.job_url ? (
                              <a
                                href={sub.job_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#0A1A2F] hover:text-[#E8C547] transition"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
