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
} from "lucide-react"

interface PlanManagerProps {
  currentPlan: string | null // null = free, "recruiter_basic", "recruiter_standard", "recruiter_pro"
  renewalDate: string | null
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
    appsPerMonth: "~90-120/month",
    features: ["Dedicated recruiter", "Daily job applications", "Weekly summary report"],
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
    appsPerDay: "12 apps/day",
    appsPerMonth: "~300-360/month",
    features: ["Everything in Basic", "3x more applications", "Priority recruiter matching", "Bi-weekly progress calls"],
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
    appsPerDay: "25 apps/day",
    appsPerMonth: "~600-750/month",
    features: ["Everything in Standard", "Maximum applications", "Advanced dashboard & analytics", "Direct recruiter Slack access"],
    icon: Crown,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
]

export default function PlanManagerClient({
  currentPlan,
  renewalDate,
  assignedRecruiter,
  isAssigned,
}: PlanManagerProps) {
  const [showPlans, setShowPlans] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const isFreePlan = !currentPlan
  const currentPlanObj = PLANS.find((p) => p.id === currentPlan)

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

  const getPlanAction = (plan: typeof PLANS[0]) => {
    if (!currentPlan) return "upgrade"
    const currentIdx = PLANS.findIndex((p) => p.id === currentPlan)
    const planIdx = PLANS.findIndex((p) => p.id === plan.id)
    if (planIdx > currentIdx) return "upgrade"
    if (planIdx < currentIdx) return "downgrade"
    return "current"
  }

  return (
    <Card className="p-5 border-2 border-[#E8C547] col-span-1 lg:col-span-2">
      {/* Top Section: Current plan summary + Recruiter status */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Left: Plan info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isFreePlan ? (
              <Users className="w-5 h-5 text-[#E8C547] shrink-0" />
            ) : (
              <UserCheck className="w-5 h-5 text-[#E8C547] shrink-0" />
            )}
            <h3 className="text-sm font-bold text-foreground premium-heading">
              {isFreePlan ? "Free Plan" : currentPlanObj?.name + " Plan"}
            </h3>
            {!isFreePlan && (
              <Badge className="bg-[#E8C547]/20 text-[#0A1A2F] border-[#E8C547] text-[10px]">
                {currentPlanObj?.appsPerDay}
              </Badge>
            )}
          </div>

          {isFreePlan ? (
            <p className="text-xs text-muted-foreground premium-body">
              Upgrade to get a dedicated recruiter applying to jobs on your behalf daily.
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

        {/* Right: Recruiter status (when subscribed) */}
        {!isFreePlan && (
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
          ) : isFreePlan ? (
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

      {/* Free plan nudge */}
      {isFreePlan && !showPlans && (
        <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
          <Zap className="w-3 h-3 text-[#E8C547]" />
          Plans from $199/mo — A dedicated recruiter applies to 4-25 jobs per day on your behalf.
        </div>
      )}
    </Card>
  )
}
