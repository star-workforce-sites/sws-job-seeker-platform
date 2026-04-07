"use client"

import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Users, Clock, CheckCircle, AlertCircle, RefreshCw, UserCheck,
  Briefcase, Search, Shield, Ban, Plus, ChevronRight,
  BarChart3, Activity, Eye, BookmarkIcon, UserPlus, TrendingUp,
  Loader2, XCircle,
} from "lucide-react"

// ── Types ────────────────────────────────────────────────────

interface Subscriber {
  subscription_id: string
  plan_name: string
  subscription_status: string
  subscribed_at: string
  user_id: string
  job_seeker_name: string
  job_seeker_email: string
  assignment_id: string | null
  assignment_status: string | null
  assigned_at: string | null
  recruiter_name: string | null
  recruiter_email: string | null
}

interface Recruiter {
  id: string
  name: string
  email: string
  suspended: boolean
  active_assignments: number
}

interface UserRecord {
  id: string
  name: string | null
  email: string
  role: string
  created_at: string
  last_login: string | null
  suspended: boolean
  suspended_at: string | null
  suspended_reason: string | null
  active_subscriptions: number
  as_client_assignments: number
  as_recruiter_assignments: number
}

interface OverviewStats {
  users: {
    total_users: number
    total_jobseekers: number
    total_recruiters: number
    total_employers: number
    suspended_users: number
    new_users_7d: number
    new_users_30d: number
  }
  subscriptions: {
    total_active_subscriptions: number
    basic_count: number
    standard_count: number
    pro_count: number
  }
  assignments: {
    total_active_assignments: number
    active: number
    inactive: number
  }
  chrm_activity: {
    total_events: number
    job_views: number
    job_saves: number
    candidate_submissions: number
    events_7d: number
    events_24h: number
  }
  recruiter_submissions: {
    total_submissions: number
    submissions_7d: number
    submissions_24h: number
    interview_count: number
  }
}

interface RecruiterPerf {
  recruiter_id: string
  recruiter_name: string
  recruiter_email: string
  suspended: boolean
  active_clients: number
  total_submissions: number
  submissions_7d: number
  submissions_24h: number
  interview_conversions: number
}

// ── Helpers ──────────────────────────────────────────────────

function planLabel(p: string): string {
  return ({ recruiter_basic: "Basic", recruiter_standard: "Standard", recruiter_pro: "Pro" }[p] ?? p)
}
function planColor(p: string): string {
  return ({
    recruiter_basic: "bg-blue-100 text-blue-800",
    recruiter_standard: "bg-purple-100 text-purple-800",
    recruiter_pro: "bg-[#E8C547]/20 text-[#0A1A2F]",
  }[p] ?? "bg-gray-100 text-gray-800")
}
function roleColor(r: string): string {
  return ({
    admin: "bg-red-100 text-red-800",
    recruiter: "bg-blue-100 text-blue-800",
    jobseeker: "bg-green-100 text-green-800",
    employer: "bg-purple-100 text-purple-800",
  }[r] ?? "bg-gray-100 text-gray-800")
}
function formatDate(d: string | null): string {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}
function daysSince(d: string): number {
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
}
function n(val: string | number | null | undefined): number {
  return parseInt(String(val || "0"))
}

// ── Stat Card ────────────────────────────────────────────────

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: number | string; color: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={color}>{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground premium-body">{label}</p>
          <p className="text-xl font-bold text-foreground premium-heading">{value}</p>
        </div>
      </div>
    </Card>
  )
}

// ══════════════════════════════════════════════════════════════
// ── Main Component ───────────────────────────────────────────
// ══════════════════════════════════════════════════════════════

export default function AdminDashboardClient({
  initialSubscribers,
  initialRecruiters,
}: {
  initialSubscribers: Subscriber[]
  initialRecruiters: Recruiter[]
}) {
  // Tabs
  const [activeTab, setActiveTab] = useState("overview")

  // Assignments data (from server props)
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers)
  const [recruiters, setRecruiters] = useState<Recruiter[]>(initialRecruiters)

  // Overview
  const [overview, setOverview] = useState<OverviewStats | null>(null)
  const [overviewLoading, setOverviewLoading] = useState(false)

  // Users
  const [users, setUsers] = useState<UserRecord[]>([])
  const [usersTotal, setUsersTotal] = useState(0)
  const [usersLoading, setUsersLoading] = useState(false)
  const [userSearch, setUserSearch] = useState("")
  const [userRoleFilter, setUserRoleFilter] = useState("all")

  // Recruiter performance
  const [recruiterPerf, setRecruiterPerf] = useState<RecruiterPerf[]>([])
  const [perfLoading, setPerfLoading] = useState(false)

  // Modals
  const [assignModal, setAssignModal] = useState<{
    open: boolean; subscriber: Subscriber | null; selectedRecruiterId: string;
    notes: string; loading: boolean; error: string | null
  }>({ open: false, subscriber: null, selectedRecruiterId: "", notes: "", loading: false, error: null })

  const [userActionModal, setUserActionModal] = useState<{
    open: boolean; user: UserRecord | null; action: string; role: string;
    reason: string; loading: boolean; error: string | null
  }>({ open: false, user: null, action: "", role: "", reason: "", loading: false, error: null })

  const [addUserModal, setAddUserModal] = useState<{
    open: boolean; name: string; email: string; role: string;
    loading: boolean; error: string | null; success: boolean
  }>({ open: false, name: "", email: "", role: "recruiter", loading: false, error: null, success: false })

  const [refreshing, setRefreshing] = useState(false)

  const unassigned = subscribers.filter((s) => !s.assignment_id)
  const assigned = subscribers.filter((s) => s.assignment_id)

  // ── Load overview ───────────────────────────────────────────
  const loadOverview = useCallback(async () => {
    setOverviewLoading(true)
    try {
      const res = await fetch("/api/admin/activity?view=overview")
      if (res.ok) setOverview(await res.json())
    } catch {} finally { setOverviewLoading(false) }
  }, [])

  useEffect(() => { loadOverview() }, [loadOverview])

  // ── Load users ──────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const params = new URLSearchParams({ limit: "100", offset: "0" })
      if (userRoleFilter !== "all") params.set("role", userRoleFilter)
      if (userSearch.trim()) params.set("search", userSearch.trim())
      const res = await fetch(`/api/admin/users?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users ?? [])
        setUsersTotal(data.total ?? 0)
      }
    } catch {} finally { setUsersLoading(false) }
  }, [userRoleFilter, userSearch])

  useEffect(() => {
    if (activeTab === "users") loadUsers()
  }, [activeTab, loadUsers])

  // ── Load recruiter performance ─────────────────────────────
  const loadRecruiterPerf = useCallback(async () => {
    setPerfLoading(true)
    try {
      const res = await fetch("/api/admin/activity?view=recruiter_performance")
      if (res.ok) {
        const data = await res.json()
        setRecruiterPerf(data.recruiters ?? [])
      }
    } catch {} finally { setPerfLoading(false) }
  }, [])

  useEffect(() => {
    if (activeTab === "performance") loadRecruiterPerf()
  }, [activeTab, loadRecruiterPerf])

  // ── Refresh assignments data ────────────────────────────────
  async function handleRefresh() {
    setRefreshing(true)
    try {
      const [subRes, recRes] = await Promise.all([
        fetch("/api/admin/subscribers"),
        fetch("/api/admin/recruiters"),
      ])
      if (subRes.ok) setSubscribers((await subRes.json()).subscribers ?? [])
      if (recRes.ok) setRecruiters((await recRes.json()).recruiters ?? [])
      await loadOverview()
    } catch {} finally { setRefreshing(false) }
  }

  // ── Assign recruiter ────────────────────────────────────────
  async function handleAssign() {
    if (!assignModal.subscriber || !assignModal.selectedRecruiterId) {
      setAssignModal((p) => ({ ...p, error: "Please select a recruiter." }))
      return
    }
    setAssignModal((p) => ({ ...p, loading: true, error: null }))
    try {
      const res = await fetch("/api/admin/recruiter-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription_id: assignModal.subscriber.subscription_id,
          recruiter_id: assignModal.selectedRecruiterId,
          notes: assignModal.notes || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAssignModal((p) => ({ ...p, loading: false, error: data.error ?? "Failed" }))
        return
      }
      const rec = recruiters.find((r) => r.id === assignModal.selectedRecruiterId)
      setSubscribers((prev) =>
        prev.map((s) =>
          s.subscription_id === assignModal.subscriber!.subscription_id
            ? { ...s, assignment_id: data.assignment?.id ?? "assigned", assignment_status: "active",
                assigned_at: new Date().toISOString(), recruiter_name: rec?.name ?? null, recruiter_email: rec?.email ?? null }
            : s
        )
      )
      setAssignModal((p) => ({ ...p, open: false }))
    } catch {
      setAssignModal((p) => ({ ...p, loading: false, error: "Network error" }))
    }
  }

  // ── User actions (role change, suspend, unsuspend) ──────────
  async function handleUserAction() {
    if (!userActionModal.user) return
    setUserActionModal((p) => ({ ...p, loading: true, error: null }))
    try {
      const body: Record<string, string> = {
        user_id: userActionModal.user.id,
        action: userActionModal.action,
      }
      if (userActionModal.action === "change_role") body.role = userActionModal.role
      if (userActionModal.action === "suspend") body.reason = userActionModal.reason

      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setUserActionModal((p) => ({ ...p, loading: false, error: data.error ?? "Failed" }))
        return
      }
      setUserActionModal((p) => ({ ...p, open: false }))
      loadUsers() // refresh
      handleRefresh() // refresh recruiters too
    } catch {
      setUserActionModal((p) => ({ ...p, loading: false, error: "Network error" }))
    }
  }

  // ── Add new user ────────────────────────────────────────────
  async function handleAddUser() {
    if (!addUserModal.name || !addUserModal.email || !addUserModal.role) {
      setAddUserModal((p) => ({ ...p, error: "All fields required" }))
      return
    }
    setAddUserModal((p) => ({ ...p, loading: true, error: null }))
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: addUserModal.name, email: addUserModal.email, role: addUserModal.role }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAddUserModal((p) => ({ ...p, loading: false, error: data.error ?? "Failed" }))
        return
      }
      setAddUserModal((p) => ({ ...p, loading: false, success: true }))
      loadUsers()
      handleRefresh()
    } catch {
      setAddUserModal((p) => ({ ...p, loading: false, error: "Network error" }))
    }
  }

  // ══════════════════════════════════════════════════════════════
  // ── RENDER ─────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground premium-heading flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#E8C547]" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1 premium-body">
              Complete platform control — users, recruiters, assignments, and activity
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh All"}
          </Button>
        </div>

        {/* ── TABS ──────────────────────────────────────────── */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" className="premium-heading">
              <BarChart3 className="w-4 h-4 mr-1.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="premium-heading">
              <Users className="w-4 h-4 mr-1.5" /> Users
            </TabsTrigger>
            <TabsTrigger value="assignments" className="premium-heading">
              <UserCheck className="w-4 h-4 mr-1.5" /> Assignments
              {unassigned.length > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5">
                  {unassigned.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="performance" className="premium-heading">
              <TrendingUp className="w-4 h-4 mr-1.5" /> Recruiter Performance
            </TabsTrigger>
          </TabsList>

          {/* ════════════════════════════════════════════════════ */}
          {/* ── TAB: OVERVIEW ──────────────────────────────── */}
          {/* ════════════════════════════════════════════════════ */}
          <TabsContent value="overview">
            {overviewLoading && !overview ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : overview ? (
              <div className="space-y-6">
                {/* User stats */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 premium-heading">Users</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <StatCard icon={<Users className="w-6 h-6" />} label="Total Users" value={n(overview.users.total_users)} color="text-primary" />
                    <StatCard icon={<Briefcase className="w-6 h-6" />} label="Job Seekers" value={n(overview.users.total_jobseekers)} color="text-green-500" />
                    <StatCard icon={<UserCheck className="w-6 h-6" />} label="Recruiters" value={n(overview.users.total_recruiters)} color="text-blue-500" />
                    <StatCard icon={<UserPlus className="w-6 h-6" />} label="New (7d)" value={n(overview.users.new_users_7d)} color="text-[#E8C547]" />
                    <StatCard icon={<UserPlus className="w-6 h-6" />} label="New (30d)" value={n(overview.users.new_users_30d)} color="text-purple-500" />
                    <StatCard icon={<Ban className="w-6 h-6" />} label="Suspended" value={n(overview.users.suspended_users)} color="text-red-500" />
                  </div>
                </div>

                {/* Subscriptions */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 premium-heading">Recruiter Subscriptions</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard icon={<Briefcase className="w-6 h-6" />} label="Total Active" value={n(overview.subscriptions.total_active_subscriptions)} color="text-primary" />
                    <StatCard icon={<Briefcase className="w-6 h-6" />} label="Basic" value={n(overview.subscriptions.basic_count)} color="text-blue-500" />
                    <StatCard icon={<Briefcase className="w-6 h-6" />} label="Standard" value={n(overview.subscriptions.standard_count)} color="text-purple-500" />
                    <StatCard icon={<Briefcase className="w-6 h-6" />} label="Pro" value={n(overview.subscriptions.pro_count)} color="text-[#E8C547]" />
                  </div>
                </div>

                {/* Assignments */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 premium-heading">Assignments</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <StatCard icon={<CheckCircle className="w-6 h-6" />} label="Active" value={n(overview.assignments.active)} color="text-green-500" />
                    <StatCard icon={<AlertCircle className="w-6 h-6" />} label="Unassigned" value={unassigned.length} color={unassigned.length > 0 ? "text-red-500" : "text-green-500"} />
                    <StatCard icon={<XCircle className="w-6 h-6" />} label="Inactive" value={n(overview.assignments.inactive)} color="text-gray-400" />
                  </div>
                </div>

                {/* Platform Activity */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 premium-heading">Platform Activity (CHRM)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <StatCard icon={<Eye className="w-6 h-6" />} label="Job Views" value={n(overview.chrm_activity.job_views)} color="text-blue-500" />
                    <StatCard icon={<BookmarkIcon className="w-6 h-6" />} label="Job Saves" value={n(overview.chrm_activity.job_saves)} color="text-[#E8C547]" />
                    <StatCard icon={<ChevronRight className="w-6 h-6" />} label="Candidates Sent" value={n(overview.chrm_activity.candidate_submissions)} color="text-green-500" />
                    <StatCard icon={<Activity className="w-6 h-6" />} label="Events (24h)" value={n(overview.chrm_activity.events_24h)} color="text-purple-500" />
                    <StatCard icon={<Activity className="w-6 h-6" />} label="Events (7d)" value={n(overview.chrm_activity.events_7d)} color="text-orange-500" />
                    <StatCard icon={<Activity className="w-6 h-6" />} label="Total Events" value={n(overview.chrm_activity.total_events)} color="text-gray-500" />
                  </div>
                </div>

                {/* Recruiter Submissions */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 premium-heading">Recruiter Submissions</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard icon={<Briefcase className="w-6 h-6" />} label="Total" value={n(overview.recruiter_submissions.total_submissions)} color="text-primary" />
                    <StatCard icon={<Briefcase className="w-6 h-6" />} label="Last 7 Days" value={n(overview.recruiter_submissions.submissions_7d)} color="text-blue-500" />
                    <StatCard icon={<Briefcase className="w-6 h-6" />} label="Last 24h" value={n(overview.recruiter_submissions.submissions_24h)} color="text-green-500" />
                    <StatCard icon={<TrendingUp className="w-6 h-6" />} label="Interviews" value={n(overview.recruiter_submissions.interview_count)} color="text-[#E8C547]" />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Failed to load overview data.</p>
            )}
          </TabsContent>

          {/* ════════════════════════════════════════════════════ */}
          {/* ── TAB: USERS ─────────────────────────────────── */}
          {/* ════════════════════════════════════════════════════ */}
          <TabsContent value="users">
            <Card className="p-6">
              {/* Search / Filter bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Input
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                  <SelectTrigger className="h-9 text-sm w-[160px]">
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="jobseeker">Job Seekers</SelectItem>
                    <SelectItem value="recruiter">Recruiters</SelectItem>
                    <SelectItem value="employer">Employers</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={loadUsers} disabled={usersLoading} variant="outline" className="h-9">
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${usersLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button
                  size="sm"
                  className="h-9 bg-[#0A1A2F] hover:bg-[#132A47] text-white"
                  onClick={() => setAddUserModal({ open: true, name: "", email: "", role: "recruiter", loading: false, error: null, success: false })}
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add User
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mb-3">{usersTotal} users found</p>
              <Separator className="mb-4" />

              {usersLoading && users.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((u) => (
                    <div key={u.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border rounded-lg hover:bg-muted/30 transition ${u.suspended ? "opacity-60 bg-red-50/50" : ""}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-foreground premium-heading truncate">
                            {u.name || "No name"}
                          </span>
                          <Badge className={`text-[10px] ${roleColor(u.role)}`}>{u.role}</Badge>
                          {u.suspended && <Badge className="text-[10px] bg-red-100 text-red-700">Suspended</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground premium-body">{u.email}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Joined {formatDate(u.created_at)}
                          {u.last_login && ` · Last login ${formatDate(u.last_login)}`}
                          {n(u.active_subscriptions) > 0 && ` · ${n(u.active_subscriptions)} subscription(s)`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => setUserActionModal({
                            open: true, user: u, action: "change_role",
                            role: u.role, reason: "", loading: false, error: null,
                          })}
                        >
                          Change Role
                        </Button>
                        {u.suspended ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-green-700 border-green-300 hover:bg-green-50"
                            onClick={() => setUserActionModal({
                              open: true, user: u, action: "unsuspend",
                              role: "", reason: "", loading: false, error: null,
                            })}
                          >
                            Unsuspend
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-red-700 border-red-300 hover:bg-red-50"
                            onClick={() => setUserActionModal({
                              open: true, user: u, action: "suspend",
                              role: "", reason: "", loading: false, error: null,
                            })}
                          >
                            Suspend
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && !usersLoading && (
                    <div className="text-center py-8">
                      <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No users found matching your criteria.</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* ════════════════════════════════════════════════════ */}
          {/* ── TAB: ASSIGNMENTS ───────────────────────────── */}
          {/* ════════════════════════════════════════════════════ */}
          <TabsContent value="assignments">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <StatCard icon={<Users className="w-6 h-6" />} label="Total Subscribers" value={subscribers.length} color="text-primary" />
              <StatCard icon={<AlertCircle className="w-6 h-6" />} label="Unassigned" value={unassigned.length} color={unassigned.length > 0 ? "text-red-500" : "text-green-500"} />
              <StatCard icon={<CheckCircle className="w-6 h-6" />} label="Assigned" value={assigned.length} color="text-green-500" />
            </div>

            {unassigned.length > 0 && (
              <Card className="mb-4 p-3 border-2 border-red-200 bg-red-50">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-xs text-red-700 premium-body">
                    <span className="font-bold">{unassigned.length}</span> subscriber{unassigned.length > 1 ? "s" : ""} need a recruiter assigned within 48 hours.
                  </p>
                </div>
              </Card>
            )}

            {/* Unassigned */}
            <Card className="p-6 mb-6">
              <h2 className="text-lg font-semibold text-foreground premium-heading mb-3">Awaiting Assignment</h2>
              <Separator className="mb-3" />
              {unassigned.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">All subscribers are assigned.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {unassigned.map((sub) => (
                    <div key={sub.subscription_id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border rounded-lg hover:bg-muted/30 transition">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm premium-heading">{sub.job_seeker_name || "Unknown"}</span>
                          <Badge className={`text-[10px] ${planColor(sub.plan_name)}`}>{planLabel(sub.plan_name)}</Badge>
                          {daysSince(sub.subscribed_at) >= 2 && <Badge className="text-[10px] bg-red-100 text-red-700">{daysSince(sub.subscribed_at)}d waiting</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{sub.job_seeker_email} · Subscribed {formatDate(sub.subscribed_at)}</p>
                      </div>
                      <Button size="sm" onClick={() => setAssignModal({ open: true, subscriber: sub, selectedRecruiterId: "", notes: "", loading: false, error: null })} className="bg-[#0A1A2F] hover:bg-[#132A47] text-white text-xs h-8">
                        Assign Recruiter
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Assigned */}
            <Card className="p-6 mb-6">
              <h2 className="text-lg font-semibold text-foreground premium-heading mb-3">Active Assignments</h2>
              <Separator className="mb-3" />
              {assigned.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No assignments yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {assigned.map((sub) => (
                    <div key={sub.subscription_id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border rounded-lg hover:bg-muted/30 transition">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm premium-heading">{sub.job_seeker_name || "Unknown"}</span>
                          <Badge className={`text-[10px] ${planColor(sub.plan_name)}`}>{planLabel(sub.plan_name)}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {sub.job_seeker_email} · <span className="text-green-600 font-medium">→ {sub.recruiter_name}</span> (assigned {formatDate(sub.assigned_at)})
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setAssignModal({ open: true, subscriber: sub, selectedRecruiterId: recruiters.find(r => r.name === sub.recruiter_name)?.id ?? "", notes: "", loading: false, error: null })} className="text-xs h-8">
                        Reassign
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Recruiters list */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground premium-heading mb-3">Available Recruiters</h2>
              <Separator className="mb-3" />
              {recruiters.length === 0 ? (
                <div className="text-center py-8">
                  <UserCheck className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">No recruiters in the system.</p>
                  <Button size="sm" onClick={() => setAddUserModal({ open: true, name: "", email: "", role: "recruiter", loading: false, error: null, success: false })} className="bg-[#0A1A2F] text-white text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Recruiter
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {recruiters.map((rec) => (
                    <Card key={rec.id} className={`p-4 ${rec.suspended ? "opacity-60 bg-red-50/50" : ""}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-[#E8C547]" />
                            <span className="font-semibold text-sm premium-heading">{rec.name}</span>
                            {rec.suspended && <Badge className="text-[10px] bg-red-100 text-red-700">Suspended</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{rec.email}</p>
                        </div>
                        <Badge className="bg-[#0A1A2F] text-white text-xs">{n(rec.active_assignments)} active</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* ════════════════════════════════════════════════════ */}
          {/* ── TAB: RECRUITER PERFORMANCE ─────────────────── */}
          {/* ════════════════════════════════════════════════════ */}
          <TabsContent value="performance">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground premium-heading">Recruiter Performance</h2>
                <Button size="sm" variant="outline" onClick={loadRecruiterPerf} disabled={perfLoading}>
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${perfLoading ? "animate-spin" : ""}`} /> Refresh
                </Button>
              </div>
              <Separator className="mb-4" />

              {perfLoading && recruiterPerf.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : recruiterPerf.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No recruiter data available yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="px-3 py-2 text-left font-semibold text-foreground premium-heading">Recruiter</th>
                        <th className="px-3 py-2 text-center font-semibold text-foreground premium-heading">Clients</th>
                        <th className="px-3 py-2 text-center font-semibold text-foreground premium-heading">Total Submissions</th>
                        <th className="px-3 py-2 text-center font-semibold text-foreground premium-heading">Last 7 Days</th>
                        <th className="px-3 py-2 text-center font-semibold text-foreground premium-heading">Last 24h</th>
                        <th className="px-3 py-2 text-center font-semibold text-foreground premium-heading">Interviews</th>
                        <th className="px-3 py-2 text-center font-semibold text-foreground premium-heading">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recruiterPerf.map((rp) => (
                        <tr key={rp.recruiter_id} className="border-b hover:bg-muted/30 transition">
                          <td className="px-3 py-3">
                            <p className="font-medium text-foreground premium-heading">{rp.recruiter_name}</p>
                            <p className="text-xs text-muted-foreground">{rp.recruiter_email}</p>
                          </td>
                          <td className="px-3 py-3 text-center">{n(rp.active_clients)}</td>
                          <td className="px-3 py-3 text-center font-semibold">{n(rp.total_submissions)}</td>
                          <td className="px-3 py-3 text-center">{n(rp.submissions_7d)}</td>
                          <td className="px-3 py-3 text-center">{n(rp.submissions_24h)}</td>
                          <td className="px-3 py-3 text-center">
                            <span className="font-semibold text-green-600">{n(rp.interview_conversions)}</span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            {rp.suspended ? (
                              <Badge className="text-[10px] bg-red-100 text-red-700">Suspended</Badge>
                            ) : (
                              <Badge className="text-[10px] bg-green-100 text-green-800">Active</Badge>
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

      {/* ════════════════════════════════════════════════════════ */}
      {/* ── MODAL: Assign Recruiter ────────────────────────── */}
      {/* ════════════════════════════════════════════════════════ */}
      <Dialog open={assignModal.open} onOpenChange={(open) => !open && setAssignModal(p => ({ ...p, open: false }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="premium-heading">
              {assignModal.subscriber?.assignment_id ? "Reassign Recruiter" : "Assign Recruiter"}
            </DialogTitle>
          </DialogHeader>
          {assignModal.subscriber && (
            <div className="space-y-4 py-2">
              <div className="bg-muted/40 rounded-lg p-3">
                <p className="font-semibold text-foreground premium-heading">{assignModal.subscriber.job_seeker_name}</p>
                <p className="text-sm text-muted-foreground">{assignModal.subscriber.job_seeker_email}</p>
                <Badge className={`text-xs mt-1 ${planColor(assignModal.subscriber.plan_name)}`}>{planLabel(assignModal.subscriber.plan_name)}</Badge>
              </div>
              {assignModal.subscriber.assignment_id && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  Currently: {assignModal.subscriber.recruiter_name}
                </p>
              )}
              <div>
                <label className="text-sm font-medium premium-heading">Select Recruiter *</label>
                <Select value={assignModal.selectedRecruiterId} onValueChange={(v) => setAssignModal(p => ({ ...p, selectedRecruiterId: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Choose..." /></SelectTrigger>
                  <SelectContent>
                    {recruiters.filter(r => !r.suspended).map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.name} ({n(r.active_assignments)} active)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium premium-heading">Notes (optional)</label>
                <textarea className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" rows={2} placeholder="Notes..." value={assignModal.notes} onChange={(e) => setAssignModal(p => ({ ...p, notes: e.target.value }))} />
              </div>
              {assignModal.error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{assignModal.error}</p>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignModal(p => ({ ...p, open: false }))} disabled={assignModal.loading}>Cancel</Button>
            <Button onClick={handleAssign} disabled={assignModal.loading || !assignModal.selectedRecruiterId} className="bg-[#0A1A2F] text-white">
              {assignModal.loading ? "Saving..." : assignModal.subscriber?.assignment_id ? "Reassign" : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════════════════════════ */}
      {/* ── MODAL: User Action (role change / suspend) ──────── */}
      {/* ════════════════════════════════════════════════════════ */}
      <Dialog open={userActionModal.open} onOpenChange={(open) => !open && setUserActionModal(p => ({ ...p, open: false }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="premium-heading">
              {userActionModal.action === "change_role" && "Change User Role"}
              {userActionModal.action === "suspend" && "Suspend User"}
              {userActionModal.action === "unsuspend" && "Unsuspend User"}
            </DialogTitle>
          </DialogHeader>
          {userActionModal.user && (
            <div className="space-y-4 py-2">
              <div className="bg-muted/40 rounded-lg p-3">
                <p className="font-semibold premium-heading">{userActionModal.user.name || "No name"}</p>
                <p className="text-sm text-muted-foreground">{userActionModal.user.email}</p>
                <Badge className={`text-xs mt-1 ${roleColor(userActionModal.user.role)}`}>{userActionModal.user.role}</Badge>
              </div>

              {userActionModal.action === "change_role" && (
                <div>
                  <label className="text-sm font-medium premium-heading">New Role</label>
                  <Select value={userActionModal.role} onValueChange={(v) => setUserActionModal(p => ({ ...p, role: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jobseeker">Job Seeker</SelectItem>
                      <SelectItem value="recruiter">Recruiter</SelectItem>
                      <SelectItem value="employer">Employer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {userActionModal.user.role === "recruiter" && userActionModal.role !== "recruiter" && (
                    <p className="text-xs text-orange-600 mt-2">Changing from recruiter will deactivate all their active assignments.</p>
                  )}
                </div>
              )}

              {userActionModal.action === "suspend" && (
                <div>
                  <label className="text-sm font-medium premium-heading">Reason (optional)</label>
                  <textarea className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" rows={2} placeholder="Reason for suspension..." value={userActionModal.reason} onChange={(e) => setUserActionModal(p => ({ ...p, reason: e.target.value }))} />
                  <p className="text-xs text-red-600 mt-2">This will suspend the user and deactivate all their active assignments.</p>
                </div>
              )}

              {userActionModal.action === "unsuspend" && (
                <p className="text-sm text-muted-foreground">This will unsuspend <strong>{userActionModal.user.name}</strong> and allow them to access the platform again.</p>
              )}

              {userActionModal.error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{userActionModal.error}</p>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserActionModal(p => ({ ...p, open: false }))} disabled={userActionModal.loading}>Cancel</Button>
            <Button onClick={handleUserAction} disabled={userActionModal.loading} className={userActionModal.action === "suspend" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-[#0A1A2F] text-white"}>
              {userActionModal.loading ? "Processing..." : userActionModal.action === "suspend" ? "Suspend User" : userActionModal.action === "unsuspend" ? "Unsuspend" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════════════════════════ */}
      {/* ── MODAL: Add New User ────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════ */}
      <Dialog open={addUserModal.open} onOpenChange={(open) => !open && setAddUserModal(p => ({ ...p, open: false, success: false }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="premium-heading">Add New User</DialogTitle>
          </DialogHeader>
          {addUserModal.success ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-foreground premium-heading">User Created Successfully</p>
              <p className="text-sm text-muted-foreground mt-1">{addUserModal.email} has been added as a {addUserModal.role}.</p>
              <Button className="mt-4" onClick={() => setAddUserModal(p => ({ ...p, open: false, success: false }))}>Done</Button>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium premium-heading">Full Name *</label>
                <Input className="mt-1" placeholder="John Doe" value={addUserModal.name} onChange={(e) => setAddUserModal(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium premium-heading">Email *</label>
                <Input className="mt-1" type="email" placeholder="john@example.com" value={addUserModal.email} onChange={(e) => setAddUserModal(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium premium-heading">Role *</label>
                <Select value={addUserModal.role} onValueChange={(v) => setAddUserModal(p => ({ ...p, role: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                    <SelectItem value="jobseeker">Job Seeker</SelectItem>
                    <SelectItem value="employer">Employer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {addUserModal.error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{addUserModal.error}</p>}
            </div>
          )}
          {!addUserModal.success && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddUserModal(p => ({ ...p, open: false }))} disabled={addUserModal.loading}>Cancel</Button>
              <Button onClick={handleAddUser} disabled={addUserModal.loading} className="bg-[#0A1A2F] text-white">
                {addUserModal.loading ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
