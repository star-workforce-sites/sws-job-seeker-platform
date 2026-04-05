// ── CHRM NEXUS API Types ─────────────────────────────────────
// External job board API integration types

export interface CHRMJob {
  job_id: string
  title: string
  description: string
  city: string
  state: string
  work_model: string
  rate_min: number | null
  rate_max: number | null
  rate_type: "hourly" | "annual" | null
  contract_type: "W2" | "C2C" | "1099" | "W2_OR_C2C" | null
  skills: string[]
  visa_restrictions: string[]
  quality_score: number
  ingested_at: string
  expires_at: string
}

export interface CHRMJobsResponse {
  success: boolean
  total: number
  count: number
  offset: number
  limit: number
  jobs: CHRMJob[]
}

export interface CHRMSkillVelocity {
  skill: string
  demand: number
  count: number
  color: string
}

export interface CHRMCityHeatmap {
  city: string
  roles: number
  score: number
}

export interface CHRMIntelligenceStats {
  total_active: number
  metro_count: number
  state_count: number
  last_updated: string
  avg_quality: number
}

export interface CHRMIntelligenceData {
  stats: CHRMIntelligenceStats
  skill_velocity: CHRMSkillVelocity[]
  city_heatmap: CHRMCityHeatmap[]
  demo_job: CHRMJob
}

// ── Activity Event Types ─────────────────────────────────────

export type CHRMActivityEventType =
  | "job_viewed"
  | "candidate_submitted"
  | "job_saved"

export interface CHRMActivityEvent {
  id: string
  user_id: string
  job_id: string
  event_type: CHRMActivityEventType
  metadata: Record<string, unknown> | null
  created_at: string
}

// ── Query Parameter Types ────────────────────────────────────

export interface CHRMJobsQueryParams {
  limit?: number
  offset?: number
  state?: string
  work_model?: string
  skills?: string
  min_score?: number
  contract_type?: string
}
