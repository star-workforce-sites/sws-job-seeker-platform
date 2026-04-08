"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  UserCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  Zap,
  Star,
  Crown,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react"

interface PlanManagerProps {
  currentPlan: string | null // null = free, "recruiter_basic", "recruiter_standard", "recruiter_pro"
  renewalDate: string | null
  /** True when subscription exists but cancel_at_period_end=true — user is on free plan immediately */
  cancelAtPeriodEnd?: boolean
  /** The plan name of the pending-cancel subscription (for reactivation display) */
  pendingCancelPlanName?: string | null
  assignedRecruiter: { name: string; email: string } | null
  isAssigned: boolean
}

const PLANS = [
  {
    id: "recruiter_basic",
    name: "Basic",
    price: "$199",
    period: "/month",
    appsPerDay: "4 apps/day",
    appsPerMonth: "~80-90/month",
    features: ["Dedicated recruiter", "Daily applications (Mon-Fri)", "Weekly summary report", "Bi-weekly recruiter calls"],
    icon: Zap,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: "recruiter_standard",
    name: "Standard",
    price: "$399",
    period: "/month",
    appsPerDay: "6 apps/day",
    appsPerMonth: "~120-130/month",
    features: ["Everything in Basic", "50% more applications", "Priority recruiter matching", "Weekly recruiter calls"],
    icon: Star,
    color: "text-[#E8C547]",
    bgColor: "bg-[#E8C547]/10",
    borderColor: "border-[#E8C547]",
    popular: true,
  },
  {
    id: "recruiter_pro",
    name: "Pro",
    price: "$599",
    period: "/month",
    appsPerDay: "10 apps/day",
    appsPerMonth: "~200-220/month",
    features: ["Everything in Standard", "Maximum applications", "Full analytics dashboard", "Slack + phone recruiter access", "Twice weekly progress calls"],
    icon: Crown,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
]

export default function PlanManagerClient({
  currentPlan,
  renewalDate,
  cancelAtPeriodEnd = false,
  pendingCancelPlanName = null,
  assignedRecruiter,
  isAssigned,
}: PlanManagerProps) {
  const [showPlans, setShowPlans] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelDone, setCancelDone] = useState(false)
  const [cancelActiveUntil, setCancelActiveUntil] = useState<string | null>(null)
  const [reactivating, setReactivating] = useState(false)
  const [reactivateDone, setReactivateDone] = useState(false)

  // cancelAtPeriodEnd = user cancelled; they are on free plan immediately
  // pendingCancelPlanName = which plan is expiring (for display)
  const isFreePlan = !currentPlan && !cancelAtPeriodEnd
  const pendingCancelPlanObj = PLANS.find((p) => p.id === pendingCancelPlanName)
  const currentPlanObj = PLANS.find((p) => p.id === currentPlan)

  const handleReactivate = async () => {
    setReactivating(true)
    try {
      const res = await fetch("/api/subscription/reactivate", { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        setReactivateDone(true)
      } else {
        alert(data.error || "Failed to reactivate. Please contact support.")
      }
    } catch {
      alert("Network error. Please try again or contact support.")
    } finally {
      setReactivating(false)
    }
  }

  const handleCheckout = async (planId: string) => {
    setLoadingPlan(planId)
    try {
      const res = await fetch("/api/checkout/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionType: planId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || "Failed to create checkout session. Please try again.")
      }
    } catch {
      alert("Network error. Please try again.")
    } finally {
      setLoadingPlan(null)
    }
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        setCancelDone(true)
        setCancelActiveUntil(data.activeUntil || null)
        setShowCancelModal(false)
      } else {
        alert(data.error || "Failed to cancel. Please contact support.")
      }
    } catch {
      alert("Network error. Please try again or contact support.")
    } finally {
      setCancelling(false)
    }
  }

  const getPlanAction = (plan: typeof PLANS[0]) => {
    if (!currentPlan) return "upgrade"
    const currentIdx = PLANS.findIndex((p) => p.id === currentPlan)
    const planIdx = PLANS.findIndex((p) => p.id === plan.id)
    if (planIdx > currentIdx) return "upgrade"
    if (planIdx < currentIdx) return "downgrade"
    return "current"
  }

  // Cancellation confirmation modal
  const CancelModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-foreground text-base">
              Cancel {currentPlanObj?.name} Plan?
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your recruiter will be <strong>unassigned immediately</strong>. You keep{" "}
              {currentPlanObj?.name} access until{" "}
              {renewalDate
                ? new Date(renewalDate).toLocaleDateString("en-US", { month: "long", day: "numeric" })
                : "the end of your billing period"}
              , then your account returns to the Free tier.
            </p>
          </div>
          <button onClick={() => setShowCancelModal(false)} className="shrink-0 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setShowCancelModal(false)}
            disabled={cancelling}
          >
            Keep Plan
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Yes, Cancel"}
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
    {showCancelModal && <CancelModal />}
    <Card className="p-5 border-2 border-[#E8C547] col-span-1 lg:col-span-2">

      {/* ── Cancellation-pending notice (shown when cancel_at_period_end=true) ── */}
      {cancelAtPeriodEnd && !cancelDone && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          {reactivateDone ? (
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              <span>
                <strong>{pendingCancelPlanObj?.name ?? "Your"} Plan reactivated!</strong> A recruiter will be reassigned within 48 hours.
                Refresh the page to see your updated plan.
              </span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-orange-800">
                  You&apos;re now on the <strong>Free Plan</strong>
                </p>
                <p className="text-[11px] text-orange-700 mt-0.5">
                  Your <strong>{pendingCancelPlanObj?.name ?? "subscription"}</strong> remains active until{" "}
                  {renewalDate
                    ? new Date(renewalDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                    : "the end of your billing period"}
                  , after which no further charges will occur.
                </p>
              </div>
              <Button
                size="sm"
                className="shrink-0 text-[10px] h-7 bg-[#0A1A2F] hover:bg-[#1a2f4f] text-white font-semibold"
                onClick={handleReactivate}
                disabled={reactivating}
              >
                {reactivating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>Reactivate {pendingCancelPlanObj?.name} Plan</>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Top Section: Current plan summary + Recruiter status */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Left: Plan info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isFreePlan || cancelAtPeriodEnd ? (
              <Users className="w-5 h-5 text-[#E8C547] shrink-0" />
            ) : (
              <UserCheck className="w-5 h-5 text-[#E8C547] shrink-0" />
            )}
            <h3 className="text-sm font-bold text-foreground premium-heading">
              {cancelAtPeriodEnd ? "Free Plan (Subscription Ending)" : isFreePlan ? "Free Plan" : currentPlanObj?.name + " Plan"}
            </h3>
            {!isFreePlan && !cancelAtPeriodEnd && (
              <Badge className="bg-[#E8C547]/20 text-[#0A1A2F] border-[#E8C547] text-[10px]">
                {currentPlanObj?.appsPerDay}
              </Badge>
            )}
          </div>

          {isFreePlan || cancelAtPeriodEnd ? (
            <p className="text-xs text-muted-foreground premium-body">
              5 applications/week · Basic job search · Market snapshot.
              Upgrade for a dedicated recruiter applying on your behalf daily.
            </p>
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground premium-body">
                {currentPlanObj?.price}{currentPlanObj?.period} · {currentPlanObj?.appsPerMonth}
                {renewalDate && ` · Renews ${new Date(renewalDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
              </p>
            </div>
          )}
        </div>

        {/* Right: Recruiter status (when actively subscribed, not pending cancel) */}
        {!isFreePlan && !cancelAtPeriodEnd && (
          <div className="shrink-0 text-right sm:text-left">
            {isAssigned && assignedRecruiter ? (
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 justify-end sm:justify-start">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-xs font-semibold text-green-600">Recruiter Assigned</span>
                </div>
                <p className="text-sm font-medium text-foreground premium-heading">{assignedRecruiter.name}</p>
                <p className="text-[10px] text-muted-foreground">{assignedRecruiter.email}</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 justify-end sm:justify-start">
                  <Clock className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-xs font-semibold text-orange-500">Pending Assignment</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Recruiter assigned within 48h</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toggle Plan Options */}
      <div className="mt-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs font-semibold border-[#E8C547]/50 hover:bg-[#E8C547]/10 text-[#0A1A2F]"
          onClick={() => setShowPlans(!showPlans)}
        >
          {showPlans ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 mr-1.5" />
              Hide Plans
            </>
          ) : (isFreePlan || cancelAtPeriodEnd) ? (
            <>
              <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
              View Recruiter Plans
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 mr-1.5" />
              Change Plan
            </>
          )}
        </Button>
      </div>

      {/* Plan Cards */}
      {showPlans && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Free plan info card — shows what users return to if they cancel */}
          {!isFreePlan && (
            <div className="relative rounded-xl border-2 border-gray-200 bg-white p-4 sm:col-span-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-bold text-foreground premium-heading">Free Plan</span>
                <Badge className="text-[9px] bg-gray-100 text-gray-600">$0/month</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">
                5 applications/week · Basic job search · Market snapshot · No recruiter assistance
              </p>
            </div>
          )}
          {PLANS.map((plan) => {
            const action = getPlanAction(plan)
            const PlanIcon = plan.icon
            const isCurrent = action === "current"

            return (
              <div
                key={plan.id}
                className={`relative rounded-xl border-2 p-4 transition ${
                  isCurrent
                    ? "border-[#E8C547] bg-[#E8C547]/5"
                    : plan.popular
                      ? `${plan.borderColor} ${plan.bgColor}`
                      : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                {plan.popular && !isCurrent && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#E8C547] text-[#0A1A2F] text-[9px] font-bold px-2 py-0.5">
                      Most Popular
                    </Badge>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#0A1A2F] text-white text-[9px] font-bold px-2 py-0.5">
                      Current Plan
                    </Badge>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2 mt-1">
                  <PlanIcon className={`w-4 h-4 ${plan.color}`} />
                  <span className="text-sm font-bold text-foreground premium-heading">{plan.name}</span>
                </div>

                <div className="mb-2">
                  <span className="text-xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">{plan.period}</span>
                </div>

                <p className="text-[10px] text-muted-foreground mb-2 font-medium">
                  {plan.appsPerDay} · {plan.appsPerMonth}
                </p>

                <ul className="space-y-1 mb-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button
                    size="sm"
                    disabled
                    className="w-full text-[10px] h-8 bg-[#0A1A2F] text-white opacity-60"
                  >
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className={`w-full text-[10px] h-8 font-bold ${
                      action === "upgrade"
                        ? "bg-[#E8C547] hover:bg-[#D4AF37] text-[#0A1A2F]"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                    }`}
                    disabled={loadingPlan === plan.id}
                    onClick={() => handleCheckout(plan.id)}
                  >
                    {loadingPlan === plan.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : action === "upgrade" ? (
                      <>Upgrade to {plan.name}</>
                    ) : (
                      <>Switch to {plan.name}</>
                    )}
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Cancel subscription — shown below plan cards, only when on an active paid plan */}
      {!isFreePlan && !cancelAtPeriodEnd && showPlans && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {cancelDone ? (
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              <p>
                <strong>Subscription cancelled.</strong> Your recruiter has been unassigned. You keep{" "}
                {currentPlanObj?.name} access until{" "}
                {cancelActiveUntil
                  ? new Date(cancelActiveUntil).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                  : renewalDate
                    ? new Date(renewalDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                    : "the end of your billing period"}
                , then you move to Free.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground">
                Want to stop your <strong>{currentPlanObj?.name} Plan</strong>? Your recruiter will be
                unassigned immediately and you&apos;ll keep access until your billing period ends.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 ml-4 text-[10px] h-7 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                onClick={() => setShowCancelModal(true)}
              >
                Cancel {currentPlanObj?.name} Plan
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Free plan nudge */}
      {isFreePlan && !showPlans && (
        <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
          <Zap className="w-3 h-3 text-[#E8C547]" />
          Plans from $199/mo — A dedicated recruiter applies to 4-10 jobs per day (Mon-Fri) on your behalf.
        </div>
      )}
    </Card>
    </>
  )
}
