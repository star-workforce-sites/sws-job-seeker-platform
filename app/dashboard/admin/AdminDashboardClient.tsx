"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Users, Clock, CheckCircle, AlertCircle, RefreshCw, UserCheck, Briefcase } from "lucide-react"

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
  active_assignments: number
}

interface AssignModalState {
  open: boolean
  subscriber: Subscriber | null
  selectedRecruiterId: string
  notes: string
  loading: boolean
  error: string | null
}

// ── Helpers ──────────────────────────────────────────────────

function planLabel(planName: string): string {
  const map: Record<string, string> = {
    recruiter_basic: "Basic",
    recruiter_standard: "Standard",
    recruiter_pro: "Pro",
  }
  return map[planName] ?? planName
}

function planColor(planName: string): string {
  const map: Record<string, string> = {
    recruiter_basic: "bg-blue-100 text-blue-800",
    recruiter_standard: "bg-purple-100 text-purple-800",
    recruiter_pro: "bg-[#E8C547]/20 text-[#0A1A2F]",
  }
  return map[planName] ?? "bg-gray-100 text-gray-800"
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

// ── Stat Card ────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  color: string
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <div className={`${color}`}>{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground premium-body">{label}</p>
          <p className="text-2xl font-bold text-foreground premium-heading">{value}</p>
        </div>
      </div>
    </Card>
  )
}

// ── Main Client Component ─────────────────────────────────────

export default function AdminDashboardClient({
  initialSubscribers,
  initialRecruiters,
}: {
  initialSubscribers: Subscriber[]
  initialRecruiters: Recruiter[]
}) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers)
  const [recruiters, setRecruiters] = useState<Recruiter[]>(initialRecruiters)
  const [refreshing, setRefreshing] = useState(false)
  const [modal, setModal] = useState<AssignModalState>({
    open: false,
    subscriber: null,
    selectedRecruiterId: "",
    notes: "",
    loading: false,
    error: null,
  })

  const unassigned = subscribers.filter((s) => !s.assignment_id)
  const assigned = subscribers.filter((s) => s.assignment_id)

  // ── Refresh data ────────────────────────────────────────────
  async function handleRefresh() {
    setRefreshing(true)
    try {
      const [subRes, recRes] = await Promise.all([
        fetch("/api/admin/subscribers"),
        fetch("/api/admin/recruiters"),
      ])
      if (subRes.ok) {
        const data = await subRes.json()
        setSubscribers(data.subscribers ?? [])
      }
      if (recRes.ok) {
        const data = await recRes.json()
        setRecruiters(data.recruiters ?? [])
      }
    } catch {
      // silently fail — user can retry
    } finally {
      setRefreshing(false)
    }
  }

  // ── Open assign modal ───────────────────────────────────────
  function openAssignModal(subscriber: Subscriber) {
    setModal({
      open: true,
      subscriber,
      selectedRecruiterId: subscriber.recruiter_name
        ? (recruiters.find((r) => r.name === subscriber.recruiter_name)?.id ?? "")
        : "",
      notes: subscriber.assignment_id ? (subscriber.recruiter_name ?? "") : "",
      loading: false,
      error: null,
    })
  }

  function closeModal() {
    setModal((prev) => ({ ...prev, open: false, error: null }))
  }

  // ── Submit assignment ───────────────────────────────────────
  async function handleAssign() {
    if (!modal.subscriber || !modal.selectedRecruiterId) {
      setModal((prev) => ({ ...prev, error: "Please select a recruiter." }))
      return
    }
    setModal((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const res = await fetch("/api/admin/recruiter-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription_id: modal.subscriber.subscription_id,
          recruiter_id: modal.selectedRecruiterId,
          notes: modal.notes || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setModal((prev) => ({
          ...prev,
          loading: false,
          error: data.error ?? "Assignment failed. Please try again.",
        }))
        return
      }

      // Optimistically update local state
      const recruiter = recruiters.find((r) => r.id === modal.selectedRecruiterId)
      setSubscribers((prev) =>
        prev.map((s) =>
          s.subscription_id === modal.subscriber!.subscription_id
            ? {
                ...s,
                assignment_id: data.assignment?.id ?? "assigned",
                assignment_status: "active",
                assigned_at: new Date().toISOString(),
                recruiter_name: recruiter?.name ?? null,
                recruiter_email: recruiter?.email ?? null,
              }
            : s
        )
      )

      closeModal()
    } catch {
      setModal((prev) => ({
        ...prev,
        loading: false,
        error: "Network error. Please try again.",
      }))
    }
  }

  // ── Subscriber Row ──────────────────────────────────────────
  function SubscriberRow({ sub }: { sub: Subscriber }) {
    const isAssigned = !!sub.assignment_id
    const days = daysSince(sub.subscribed_at)

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/30 transition">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground premium-heading truncate">
              {sub.job_seeker_name || "Unknown"}
            </span>
            <Badge className={`text-xs ${planColor(sub.plan_name)}`}>
              {planLabel(sub.plan_name)}
            </Badge>
            {!isAssigned && days >= 2 && (
              <Badge className="text-xs bg-red-100 text-red-700">
                {days}d waiting
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground premium-body mt-0.5">
            {sub.job_seeker_email}
          </p>
          <p className="text-xs text-muted-foreground premium-body mt-1">
            Subscribed: {formatDate(sub.subscribed_at)}
            {isAssigned && (
              <span className="ml-3 text-green-600 font-medium">
                → {sub.recruiter_name} (assigned {formatDate(sub.assigned_at)})
              </span>
            )}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => openAssignModal(sub)}
          className={
            isAssigned
              ? "bg-muted text-foreground hover:bg-muted/70 border border-border"
              : "bg-[#0A1A2F] hover:bg-[#132A47] text-white premium-heading"
          }
        >
          {isAssigned ? "Reassign" : "Assign Recruiter"}
        </Button>
      </div>
    )
  }

  // ── Recruiter Card ──────────────────────────────────────────
  function RecruiterCard({ rec }: { rec: Recruiter }) {
    return (
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#E8C547]" />
              <span className="font-semibold text-foreground premium-heading">{rec.name}</span>
            </div>
            <p className="text-sm text-muted-foreground premium-body mt-1">{rec.email}</p>
          </div>
          <Badge className="bg-[#0A1A2F] text-white text-xs">
            {rec.active_assignments} active
          </Badge>
        </div>
      </Card>
    )
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground premium-heading">
              Admin Panel
            </h1>
            <p className="text-muted-foreground mt-2 premium-body">
              Manage recruiter assignments for Hire-a-Recruiter subscribers
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-8 h-8" />}
            label="Total Subscribers"
            value={subscribers.length}
            color="text-primary"
          />
          <StatCard
            icon={<AlertCircle className="w-8 h-8" />}
            label="Unassigned"
            value={unassigned.length}
            color={unassigned.length > 0 ? "text-red-500" : "text-green-500"}
          />
          <StatCard
            icon={<CheckCircle className="w-8 h-8" />}
            label="Assigned"
            value={assigned.length}
            color="text-green-500"
          />
          <StatCard
            icon={<Briefcase className="w-8 h-8" />}
            label="Active Recruiters"
            value={recruiters.length}
            color="text-[#E8C547]"
          />
        </div>

        {/* Unassigned alert banner */}
        {unassigned.length > 0 && (
          <Card className="mb-6 p-4 border-2 border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 premium-body">
                <span className="font-bold">{unassigned.length} subscriber{unassigned.length > 1 ? "s" : ""}</span>{" "}
                {unassigned.length > 1 ? "need" : "needs"} a recruiter assigned.
                Subscribers should be assigned within 48 hours of signup.
              </p>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="unassigned">
          <TabsList className="mb-6">
            <TabsTrigger value="unassigned" className="premium-heading">
              Unassigned
              {unassigned.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {unassigned.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="assigned" className="premium-heading">
              Assigned ({assigned.length})
            </TabsTrigger>
            <TabsTrigger value="recruiters" className="premium-heading">
              Recruiters ({recruiters.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab: Unassigned */}
          <TabsContent value="unassigned">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground premium-heading mb-4">
                Subscribers Awaiting Assignment
              </h2>
              <Separator className="mb-4" />
              {unassigned.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-muted-foreground premium-body">
                    All subscribers have been assigned a recruiter.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {unassigned.map((sub) => (
                    <SubscriberRow key={sub.subscription_id} sub={sub} />
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Tab: Assigned */}
          <TabsContent value="assigned">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground premium-heading mb-4">
                All Active Assignments
              </h2>
              <Separator className="mb-4" />
              {assigned.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground premium-body">
                    No assignments yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assigned.map((sub) => (
                    <SubscriberRow key={sub.subscription_id} sub={sub} />
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Tab: Recruiters */}
          <TabsContent value="recruiters">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground premium-heading mb-4">
                Available Recruiters
              </h2>
              <Separator className="mb-4" />
              {recruiters.length === 0 ? (
                <div className="text-center py-12">
                  <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground premium-body mb-2">
                    No recruiters found in the system.
                  </p>
                  <p className="text-xs text-muted-foreground premium-body">
                    Add users with role = 'recruiter' in the database to populate this list.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recruiters.map((rec) => (
                    <RecruiterCard key={rec.id} rec={rec} />
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Assign / Reassign Modal */}
      <Dialog open={modal.open} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="premium-heading">
              {modal.subscriber?.assignment_id ? "Reassign Recruiter" : "Assign Recruiter"}
            </DialogTitle>
          </DialogHeader>

          {modal.subscriber && (
            <div className="space-y-4 py-2">
              {/* Subscriber info */}
              <div className="bg-muted/40 rounded-lg p-4 space-y-1">
                <p className="font-semibold text-foreground premium-heading">
                  {modal.subscriber.job_seeker_name}
                </p>
                <p className="text-sm text-muted-foreground premium-body">
                  {modal.subscriber.job_seeker_email}
                </p>
                <Badge className={`text-xs ${planColor(modal.subscriber.plan_name)}`}>
                  {planLabel(modal.subscriber.plan_name)}
                </Badge>
              </div>

              {/* Current assignment (if reassigning) */}
              {modal.subscriber.assignment_id && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground premium-body">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Currently assigned to:{" "}
                  <span className="font-medium text-foreground">
                    {modal.subscriber.recruiter_name}
                  </span>
                </div>
              )}

              {/* Recruiter select */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground premium-heading">
                  Select Recruiter *
                </label>
                {recruiters.length === 0 ? (
                  <p className="text-sm text-red-500 premium-body">
                    No recruiters available. Add users with role = 'recruiter' first.
                  </p>
                ) : (
                  <Select
                    value={modal.selectedRecruiterId}
                    onValueChange={(val) =>
                      setModal((prev) => ({ ...prev, selectedRecruiterId: val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a recruiter..." />
                    </SelectTrigger>
                    <SelectContent>
                      {recruiters.map((rec) => (
                        <SelectItem key={rec.id} value={rec.id}>
                          {rec.name} ({rec.active_assignments} active)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground premium-heading">
                  Notes (optional)
                </label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none premium-body"
                  rows={3}
                  placeholder="Any notes about this assignment..."
                  value={modal.notes}
                  onChange={(e) =>
                    setModal((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
              </div>

              {/* Error */}
              {modal.error && (
                <div className="flex items-center gap-2 text-sm text-red-600 premium-body">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {modal.error}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeModal} disabled={modal.loading}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={modal.loading || !modal.selectedRecruiterId}
              className="bg-[#0A1A2F] hover:bg-[#132A47] text-white premium-heading"
            >
              {modal.loading
                ? "Saving..."
                : modal.subscriber?.assignment_id
                ? "Reassign"
                : "Assign Recruiter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
