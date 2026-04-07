"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { BarChart3, TrendingUp, Loader2 } from "lucide-react"
import type { CHRMIntelligenceData } from "@/types/chrm-nexus"

export default function CHRMMarketIntelSnapshot() {
  const [intel, setIntel] = useState<CHRMIntelligenceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/chrm/intelligence")
        if (res.ok) setIntel(await res.json())
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <Card className="p-5 bg-gradient-to-br from-[#0A1A2F] to-[#132A47] text-white">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-5 h-5 text-[#E8C547]" />
        <h3 className="text-sm font-bold text-white premium-heading">Market Snapshot</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-white/40" />
        </div>
      ) : intel ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/10 rounded-lg px-3 py-2 text-center">
              <p className="text-lg font-bold text-[#E8C547] premium-heading">
                {intel.stats.total_active.toLocaleString()}
              </p>
              <p className="text-[10px] text-white/60 premium-body">Live Jobs</p>
            </div>
            <div className="bg-white/10 rounded-lg px-3 py-2 text-center">
              <p className="text-lg font-bold text-[#E8C547] premium-heading">
                {intel.stats.state_count}
              </p>
              <p className="text-[10px] text-white/60 premium-body">States</p>
            </div>
          </div>

          {/* Top 3 skills */}
          {intel.skill_velocity && intel.skill_velocity.length > 0 && (
            <div>
              <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Top Skills
              </p>
              <div className="flex flex-wrap gap-1">
                {intel.skill_velocity.slice(0, 5).map((sv) => (
                  <span
                    key={sv.skill}
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: `${sv.color}20`,
                      color: sv.color,
                      border: `1px solid ${sv.color}40`,
                    }}
                  >
                    {sv.skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <a
            href="#market-intelligence"
            className="block text-center text-[10px] text-[#E8C547] hover:text-[#D4AF37] font-semibold mt-1 transition"
          >
            View Full Market Intelligence &darr;
          </a>
        </div>
      ) : (
        <p className="text-xs text-white/40 premium-body">Market data unavailable</p>
      )}
    </Card>
  )
}
