"use client"

import { useState, type ReactNode } from "react"
import { LayoutGrid, BarChart3, Briefcase } from "lucide-react"
import CHRMJobSeekerPanel from "./CHRMJobSeekerPanel"
import CHRMMarketIntelSnapshot from "./CHRMMarketIntelSnapshot"

type Tab = "snapshot" | "intelligence" | "jobs"

export default function DashboardTabs({
  planManagerSlot,
  statsAndSubmissionsSlot,
  quickActionsSlot,
}: {
  planManagerSlot: ReactNode
  statsAndSubmissionsSlot: ReactNode
  quickActionsSlot: ReactNode
}) {
  const [activeTab, setActiveTab] = useState<Tab>("snapshot")

  return (
    <div>
      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        <TabButton
          active={activeTab === "snapshot"}
          onClick={() => setActiveTab("snapshot")}
          icon={<LayoutGrid className="w-4 h-4" />}
          label="Snapshot"
        />
        <TabButton
          active={activeTab === "intelligence"}
          onClick={() => setActiveTab("intelligence")}
          icon={<BarChart3 className="w-4 h-4" />}
          label="Market Intelligence"
        />
        <TabButton
          active={activeTab === "jobs"}
          onClick={() => setActiveTab("jobs")}
          icon={<Briefcase className="w-4 h-4" />}
          label="Live Jobs"
        />
      </div>

      {activeTab === "snapshot" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {planManagerSlot}
            <CHRMMarketIntelSnapshot onViewFull={() => setActiveTab("intelligence")} />
          </div>
          {statsAndSubmissionsSlot}
          {quickActionsSlot}
          <CHRMJobSeekerPanel
            section="hotjobs-preview"
            onViewAllJobs={() => setActiveTab("jobs")}
          />
        </div>
      )}

      {activeTab === "intelligence" && (
        <CHRMJobSeekerPanel section="intelligence" />
      )}

      {activeTab === "jobs" && (
        <div id="job-feed">
          <CHRMJobSeekerPanel section="jobs" />
        </div>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition ${
        active
          ? "border-[#E8C547] text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
