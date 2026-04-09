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
  Search,
  Phone,
  Video,
  Calendar,
  Send,
  ChevronDown,
  ChevronUp,
  Linkedin,
  MapPin,
  Tag,
  Award,
  Copy,
  DollarSign,
} from "lucide-react"
import CHRMJobBoard from "./CHRMJobBoard"

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
  // Profile fields
  client_phone: string | null
  client_linkedin: string | null
  client_location: string | null
  client_work_auth: string | null
  client_skills: string[] | null
  client_target_titles: string[] | null
  client_target_locations: string[] | null
  client_min_rate: number | null
  client_open_to_remote: boolean | null
  client_open_to_contract: boolean | null
  client_certifications: string[] | null
  client_resume_text: string | null
}

// Work auth display labels
const WORK_AUTH_LABELS: Record<string, string> = {
  us_citizen:   "US Citizen",
  green_card:   "Green Card",
  h1b:          "H1B",
  h1b_transfer: "H1B Transfer",
  stem_opt:     "STEM OPT",
  opt:          "OPT",
  ead:          "EAD",
  tn_visa:      "TN Visa",
  other:        "Other",
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
  cover_letter: string
  submitting: boolean
  error: string | null
  success: string | null
}

interface NotifyFormState {
  client_id: string
  submission_id: string   // optional: pre-existing submission to update
  job_title: string
  company_name: string
  scheduled_at: string    // datetime-local value
  call_type: string       // for interview: phone | video | in_person
  message: string
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

// ── Cover Letter Template Generator ──────────────────────────
function generateCoverLetter(
  clientName: string,
  jobTitle: string,
  company: string,
  skills: string[],
  workAuth: string | null,
  targetTitles: string[],
): string {
  const firstName = clientName.split(" ")[0] || clientName
  const topSkills = skills.slice(0, 5).join(", ") || "relevant technical skills"
  const authNote = workAuth && !["us_citizen", "green_card"].includes(workAuth)
    ? `\nI am authorized to work in the United States and am available to discuss my work authorization status.`
    : ""
  const roleContext = targetTitles.length > 0
    ? `With a background focused on ${targetTitles.slice(0, 2).join(" and ")} roles`
    : "With my background in technology consulting"

  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${company}. ${roleContext}, I bring hands-on expertise in ${topSkills} and a proven track record of delivering results in fast-paced consulting environments.

Throughout my career, I have demonstrated the ability to quickly adapt to new technologies, collaborate across cross-functional teams, and deliver high-quality solutions on time. I am particularly drawn to this opportunity at ${company} because of the chance to apply my skills in a challenging and impactful role.

I am confident that my technical skills, professional experience, and commitment to excellence make me a strong candidate for this position. I would welcome the opportunity to discuss how I can contribute to your team's success.

Thank you for considering my application. I look forward to hearing from you.${authNote}

Sincerely,
${firstName}`
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
  recentByAssignment,
}: {
  recruiter: RecruiterUser
  initialClients: Client[]
  initialSubmissions: Submission[]
  recentByAssignment: Record<string, Submission[]>
}) {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions)
  const [recentMap, setRecentMap] = useState<Record<string, Submission[]>>(recentByAssignment)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("clients")

  const [logForm, setLogForm] = useState<LogFormState>({
    assignment_id: initialClients[0]?.assignment_id ?? "",
    job_title: "",
    company_name: "",
    job_url: "",
    notes: "",
    status: "submitted",
    cover_letter: "",
    submitting: false,
    error: null,
    success: null,
  })

  const emptyNotifyForm = (): NotifyFormState => ({
    client_id: initialClients[0]?.client_id ?? "",
    submission_id: "",
    job_title: "",
    company_name: "",
    scheduled_at: "",
    call_type: "video",
    message: "",
    submitting: false,
    error: null,
    success: null,
  })

  const [screeningForm, setScreeningForm] = useState<NotifyFormState>(emptyNotifyForm)
  const [interviewForm, setInterviewForm] = useState<NotifyFormState>(emptyNotifyForm)

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

  // ── Send screening / interview notification ───────────────
  async function handleNotify(
    type: "screening" | "interview",
    form: NotifyFormState,
    setForm: React.Dispatch<React.SetStateAction<NotifyFormState>>
  ) {
    if (!form.client_id || !form.job_title || !form.company_name || !form.scheduled_at) {
      setForm((prev) => ({ ...prev, error: "Client, job title, company, and date/time are required." }))
      return
    }
    setForm((prev) => ({ ...prev, submitting: true, error: null, success: null }))
    try {
      const res = await fetch("/api/recruiter/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          client_id: form.client_id,
          submission_id: form.submission_id || undefined,
          job_title: form.job_title.trim(),
          company_name: form.company_name.trim(),
          scheduled_at: new Date(form.scheduled_at).toISOString(),
          call_type: form.call_type,
          message: form.message.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setForm((prev) => ({ ...prev, submitting: false, error: data.error ?? "Failed to send. Please try again." }))
        return
      }
      // Update submission in local state if it was updated
      if (data.updatedSubmission) {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === data.updatedSubmission.id
              ? { ...s, status: data.updatedSubmission.status }
              : s
          )
        )
      }
      const clientName = clients.find((c) => c.client_id === form.client_id)?.client_name ?? "client"
      setForm((prev) => ({
        ...prev,
        job_title: "",
        company_name: "",
        scheduled_at: "",
        message: "",
        submission_id: "",
        submitting: false,
        success: `✅ ${type === "screening" ? "Screening" : "Interview"} notification sent to ${clientName}`,
      }))
    } catch {
      setForm((prev) => ({ ...prev, submitting: false, error: "Network error. Please try again." }))
    }
  }

  // ── Client Card (candidates-first redesign) ───────────────
  function ClientCard({ client }: { client: Client }) {
    const [expanded, setExpanded] = useState(false)
    const dailyTarget = Number(client.applications_per_day)
    const todayCount  = Number(client.submissions_today)
    const progressPct = dailyTarget > 0
      ? Math.min(Math.round((todayCount / dailyTarget) * 100), 100)
      : 0
    const recentSubs = recentMap[client.assignment_id] ?? []
    const hasProfile = !!(client.client_work_auth || (client.client_skills ?? []).length > 0 || client.client_target_titles?.length)

    return (
      <Card className="overflow-hidden">
        {/* ── Top bar ── */}
        <div className="bg-gradient-to-r from-[#0A1A2F] to-[#132A47] px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-white text-base premium-heading">{client.client_name}</span>
            <Badge className={`text-xs ${planColor(client.plan_type)}`}>{planLabel(client.plan_type)}</Badge>
            {client.client_work_auth && (
              <Badge className="text-xs bg-white/20 text-white border-white/30">
                {WORK_AUTH_LABELS[client.client_work_auth] ?? client.client_work_auth}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-white/70 text-xs">
            {client.client_location && (
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{client.client_location}</span>
            )}
            {client.client_phone && (
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{client.client_phone}</span>
            )}
            {client.client_linkedin && (
              <a href={client.client_linkedin} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-[#E8C547] transition">
                <Linkedin className="w-3 h-3" />LinkedIn
              </a>
            )}
          </div>
        </div>

        <div className="p-5">
          {/* ── Profile snapshot (if any) ── */}
          {hasProfile && (
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {(client.client_target_titles ?? []).length > 0 && (
                <div>
                  <p className="text-muted-foreground font-medium mb-1 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Target Roles
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(client.client_target_titles ?? []).slice(0, 4).map((t) => (
                      <span key={t} className="bg-[#0A1A2F]/10 text-[#0A1A2F] rounded px-1.5 py-0.5">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {(client.client_skills ?? []).length > 0 && (
                <div>
                  <p className="text-muted-foreground font-medium mb-1 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Skills
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(client.client_skills ?? []).slice(0, 6).map((s) => (
                      <span key={s} className="bg-blue-50 text-blue-700 rounded px-1.5 py-0.5">{s}</span>
                    ))}
                    {(client.client_skills ?? []).length > 6 && (
                      <span className="text-muted-foreground">+{(client.client_skills ?? []).length - 6} more</span>
                    )}
                  </div>
                </div>
              )}
              <div className="space-y-1">
                {client.client_min_rate && (
                  <p className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="w-3 h-3" /> Min ${client.client_min_rate}/hr
                  </p>
                )}
                {(client.client_certifications ?? []).length > 0 && (
                  <p className="flex items-center gap-1 text-muted-foreground">
                    <Award className="w-3 h-3" /> {(client.client_certifications ?? []).slice(0, 2).join(", ")}
                  </p>
                )}
                {client.client_open_to_remote && (
                  <p className="text-green-600">✓ Open to remote</p>
                )}
              </div>
            </div>
          )}

          {!hasProfile && (
            <p className="text-xs text-muted-foreground mb-3 italic">
              No profile filled in yet — ask client to complete their profile for better job matching.
            </p>
          )}

          {/* ── Daily progress ── */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground premium-body">
                Today: <strong>{todayCount}</strong> / {dailyTarget} apps
              </span>
              <span className="flex items-center gap-3 text-muted-foreground">
                <span>{client.total_submissions} total</span>
                {Number(client.interview_count) > 0 && (
                  <span className="text-green-600 font-semibold">{client.interview_count} interviews 🎉</span>
                )}
                {client.last_submission_at && (
                  <span>Last: {formatDateTime(client.last_submission_at)}</span>
                )}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  progressPct >= 100 ? "bg-green-500" :
                  progressPct >= 50  ? "bg-[#E8C547]" : "bg-[#0A1A2F]"
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div className="flex flex-wrap gap-2 mb-4">
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
                  cover_letter: "",
                  error: null,
                  success: null,
                }))
                setActiveTab("log")
              }}
              className="bg-[#0A1A2F] hover:bg-[#132A47] text-white text-xs premium-heading"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Log Submission
            </Button>
            <Button
              size="sm" variant="outline"
              onClick={() => {
                setScreeningForm((p) => ({ ...p, client_id: client.client_id, submission_id: "", error: null, success: null }))
                setActiveTab("screening")
              }}
              className="text-xs text-blue-700 border-blue-200 hover:bg-blue-50"
            >
              <Phone className="w-3.5 h-3.5 mr-1.5" />
              Screening
            </Button>
            <Button
              size="sm" variant="outline"
              onClick={() => {
                setInterviewForm((p) => ({ ...p, client_id: client.client_id, submission_id: "", error: null, success: null }))
                setActiveTab("interview")
              }}
              className="text-xs text-green-700 border-green-200 hover:bg-green-50"
            >
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              Interview
            </Button>
          </div>

          {/* ── Recent submissions (inline, collapsible) ── */}
          {recentSubs.length > 0 && (
            <div>
              <button
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition mb-2"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {expanded ? "Hide" : "Show"} recent submissions ({recentSubs.length})
              </button>
              {expanded && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/40">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-foreground">Date</th>
                        <th className="px-3 py-2 text-left font-semibold text-foreground">Job / Company</th>
                        <th className="px-3 py-2 text-left font-semibold text-foreground">Status</th>
                        <th className="px-3 py-2 text-left font-semibold text-foreground">Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSubs.map((sub) => (
                        <tr key={sub.id} className="border-t border-border hover:bg-muted/20">
                          <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                            {formatDate(sub.application_date || sub.submitted_at)}
                          </td>
                          <td className="px-3 py-2 max-w-[200px]">
                            <div className="font-medium text-foreground truncate">{sub.job_title}</div>
                            <div className="text-muted-foreground truncate">{sub.company_name}</div>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium ${statusColor(sub.status)}`}>
                              {statusLabel(sub.status)}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            {sub.job_url ? (
                              <a href={sub.job_url} target="_blank" rel="noopener noreferrer"
                                className="text-[#0A1A2F] hover:text-[#E8C547] transition">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {client.assignment_notes && (
            <div className="mt-3 text-xs text-muted-foreground bg-muted/40 rounded px-3 py-2">
              <span className="font-medium">Notes:</span> {client.assignment_notes}
            </div>
          )}
        </div>
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
            <TabsTrigger value="screening" className="premium-heading">
              <Phone className="w-4 h-4 mr-1.5" />
              Screening
            </TabsTrigger>
            <TabsTrigger value="interview" className="premium-heading">
              <Calendar className="w-4 h-4 mr-1.5" />
              Interview
            </TabsTrigger>
            <TabsTrigger value="jobboard" className="premium-heading">
              <Search className="w-4 h-4 mr-1.5" />
              Job Board
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

                  {/* Cover Letter Template */}
                  <div className="space-y-2 border border-border rounded-lg p-4 bg-muted/20">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-sm font-medium text-foreground premium-heading flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-primary" />
                        Cover Letter Template
                      </label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={!logForm.job_title || !logForm.company_name}
                        onClick={() => {
                          const selectedClient = clients.find(
                            (c) => c.assignment_id === logForm.assignment_id
                          )
                          if (!selectedClient) return
                          const letter = generateCoverLetter(
                            selectedClient.client_name,
                            logForm.job_title,
                            logForm.company_name,
                            selectedClient.client_skills ?? [],
                            selectedClient.client_work_auth,
                            selectedClient.client_target_titles ?? [],
                          )
                          setLogForm((prev) => ({ ...prev, cover_letter: letter }))
                        }}
                        className="text-xs"
                      >
                        ✨ Generate Template
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Auto-fills from the client&apos;s profile (skills, work auth, target roles). Edit before use.
                    </p>
                    <textarea
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y premium-body font-mono"
                      rows={12}
                      placeholder="Click 'Generate Template' to auto-generate a cover letter, or type your own..."
                      value={logForm.cover_letter}
                      onChange={(e) =>
                        setLogForm((prev) => ({ ...prev, cover_letter: e.target.value }))
                      }
                    />
                    {logForm.cover_letter && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          navigator.clipboard.writeText(logForm.cover_letter)
                        }}
                      >
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        Copy to clipboard
                      </Button>
                    )}
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

          {/* ── Tab: Screening Request ─────────────────────────── */}
          <TabsContent value="screening">
            <Card className="p-6 max-w-2xl">
              <div className="flex items-center gap-2 mb-1">
                <Phone className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-foreground premium-heading">
                  Screening Call Request
                </h2>
              </div>
              <p className="text-sm text-muted-foreground premium-body mb-4">
                Notify your client of a scheduled screening call. The application status will update to
                {" "}<strong>Screening Scheduled</strong> on their dashboard.
              </p>
              <Separator className="mb-6" />

              {clients.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground premium-body">No clients assigned yet.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Client */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground premium-heading">Client *</label>
                    <Select
                      value={screeningForm.client_id}
                      onValueChange={(val) => setScreeningForm((p) => ({ ...p, client_id: val, submission_id: "", error: null, success: null }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
                      <SelectContent>
                        {clients.map((c) => (
                          <SelectItem key={c.client_id} value={c.client_id}>
                            {c.client_name} — {c.client_email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Link to existing submission (optional) */}
                  {screeningForm.client_id && submissions.filter((s) => {
                    const cl = clients.find((c) => c.client_id === screeningForm.client_id)
                    return cl && s.assignment_id === cl.assignment_id
                  }).length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground premium-heading">
                        Link to Application (optional)
                      </label>
                      <Select
                        value={screeningForm.submission_id}
                        onValueChange={(val) => {
                          const sub = submissions.find((s) => s.id === val)
                          setScreeningForm((p) => ({
                            ...p,
                            submission_id: val,
                            job_title: sub?.job_title ?? p.job_title,
                            company_name: sub?.company_name ?? p.company_name,
                          }))
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Select application (auto-fills details)..." /></SelectTrigger>
                        <SelectContent>
                          {submissions
                            .filter((s) => {
                              const cl = clients.find((c) => c.client_id === screeningForm.client_id)
                              return cl && s.assignment_id === cl.assignment_id
                            })
                            .slice(0, 20)
                            .map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.job_title} @ {s.company_name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Job title */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground premium-heading">Job Title *</label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring premium-body"
                      placeholder="e.g. Senior Java Developer"
                      value={screeningForm.job_title}
                      onChange={(e) => setScreeningForm((p) => ({ ...p, job_title: e.target.value }))}
                    />
                  </div>

                  {/* Company */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground premium-heading">Company *</label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring premium-body"
                      placeholder="e.g. Accenture"
                      value={screeningForm.company_name}
                      onChange={(e) => setScreeningForm((p) => ({ ...p, company_name: e.target.value }))}
                    />
                  </div>

                  {/* Scheduled date/time */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground premium-heading">Screening Date & Time *</label>
                    <input
                      type="datetime-local"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring premium-body"
                      value={screeningForm.scheduled_at}
                      onChange={(e) => setScreeningForm((p) => ({ ...p, scheduled_at: e.target.value }))}
                    />
                  </div>

                  {/* Optional message */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground premium-heading">
                      Recruiter Message / Prep Notes (optional)
                    </label>
                    <textarea
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none premium-body"
                      rows={3}
                      placeholder="Tips for the client, call format, who to expect on the call..."
                      value={screeningForm.message}
                      onChange={(e) => setScreeningForm((p) => ({ ...p, message: e.target.value }))}
                    />
                  </div>

                  {screeningForm.error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 premium-body">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {screeningForm.error}
                    </div>
                  )}
                  {screeningForm.success && (
                    <div className="flex items-center gap-2 text-sm text-green-600 premium-body">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      {screeningForm.success}
                    </div>
                  )}

                  <Button
                    onClick={() => handleNotify("screening", screeningForm, setScreeningForm)}
                    disabled={screeningForm.submitting || !screeningForm.client_id || !screeningForm.job_title || !screeningForm.company_name || !screeningForm.scheduled_at}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white premium-heading"
                  >
                    {screeningForm.submitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Screening Notification
                      </>
                    )}
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* ── Tab: Interview Confirmation ─────────────────────── */}
          <TabsContent value="interview">
            <Card className="p-6 max-w-2xl">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-foreground premium-heading">
                  Interview Confirmation
                </h2>
              </div>
              <p className="text-sm text-muted-foreground premium-body mb-4">
                Confirm an interview for your client. The application status will update to
                {" "}<strong>Interview Scheduled</strong> on their dashboard.
              </p>
              <Separator className="mb-6" />

              {clients.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground premium-body">No clients assigned yet.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Client */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground premium-heading">Client *</label>
                    <Select
                      value={interviewForm.client_id}
                      onValueChange={(val) => setInterviewForm((p) => ({ ...p, client_id: val, submission_id: "", error: null, success: null }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
                      <SelectContent>
                        {clients.map((c) => (
                          <SelectItem key={c.client_id} value={c.client_id}>
                            {c.client_name} — {c.client_email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Link to existing submission (optional) */}
                  {interviewForm.client_id && submissions.filter((s) => {
                    const cl = clients.find((c) => c.client_id === interviewForm.client_id)
                    return cl && s.assignment_id === cl.assignment_id
                  }).length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground premium-heading">
                        Link to Application (optional)
                      </label>
                      <Select
                        value={interviewForm.submission_id}
                        onValueChange={(val) => {
                          const sub = submissions.find((s) => s.id === val)
                          setInterviewForm((p) => ({
                            ...p,
                            submission_id: val,
                            job_title: sub?.job_title ?? p.job_title,
                            company_name: sub?.company_name ?? p.company_name,
                          }))
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Select application (auto-fills details)..." /></SelectTrigger>
                        <SelectContent>
                          {submissions
                            .filter((s) => {
                              const cl = clients.find((c) => c.client_id === interviewForm.client_id)
                              return cl && s.assignment_id === cl.assignment_id
                            })
                            .slice(0, 20)
                            .map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.job_title} @ {s.company_name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Job title */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground premium-heading">Job Title *</label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring premium-body"
                      placeholder="e.g. Senior Java Developer"
                      value={interviewForm.job_title}
                      onChange={(e) => setInterviewForm((p) => ({ ...p, job_title: e.target.value }))}
                    />
                  </div>

                  {/* Company */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground premium-heading">Company *</label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring premium-body"
                      placeholder="e.g. Accenture"
                      value={interviewForm.company_name}
                      onChange={(e) => setInterviewForm((p) => ({ ...p, company_name: e.target.value }))}
                    />
                  </div>

                  {/* Interview type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground premium-heading">Interview Type *</label>
                    <Select
                      value={interviewForm.call_type}
                      onValueChange={(val) => setInterviewForm((p) => ({ ...p, call_type: val }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phone">
                          <span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> Phone Interview</span>
                        </SelectItem>
                        <SelectItem value="video">
                          <span className="flex items-center gap-2"><Video className="w-3.5 h-3.5" /> Video Interview</span>
                        </SelectItem>
                        <SelectItem value="in_person">
                          <span className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /> In-Person Interview</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Scheduled date/time */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground premium-heading">Interview Date & Time *</label>
                    <input
                      type="datetime-local"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring premium-body"
                      value={interviewForm.scheduled_at}
                      onChange={(e) => setInterviewForm((p) => ({ ...p, scheduled_at: e.target.value }))}
                    />
                  </div>

                  {/* Optional message */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground premium-heading">
                      Recruiter Message / Prep Notes (optional)
                    </label>
                    <textarea
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none premium-body"
                      rows={3}
                      placeholder="Interview format, what to bring, preparation tips..."
                      value={interviewForm.message}
                      onChange={(e) => setInterviewForm((p) => ({ ...p, message: e.target.value }))}
                    />
                  </div>

                  {interviewForm.error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 premium-body">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {interviewForm.error}
                    </div>
                  )}
                  {interviewForm.success && (
                    <div className="flex items-center gap-2 text-sm text-green-600 premium-body">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      {interviewForm.success}
                    </div>
                  )}

                  <Button
                    onClick={() => handleNotify("interview", interviewForm, setInterviewForm)}
                    disabled={interviewForm.submitting || !interviewForm.client_id || !interviewForm.job_title || !interviewForm.company_name || !interviewForm.scheduled_at}
                    className="w-full bg-green-600 hover:bg-green-700 text-white premium-heading"
                  >
                    {interviewForm.submitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Interview Confirmation
                      </>
                    )}
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* ── Tab: CHRM NEXUS Job Board ──────────────────────── */}
          <TabsContent value="jobboard">
            <CHRMJobBoard
              clients={clients.map((c) => ({
                assignment_id: c.assignment_id,
                client_name: c.client_name,
                client_email: c.client_email,
                plan_type: c.plan_type,
              }))}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
