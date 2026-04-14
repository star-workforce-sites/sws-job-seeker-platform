import { sql } from "@vercel/postgres"

// ─── Types ──────────────────────────────────────────────────

export interface Partner {
  id: string
  user_id: string | null
  name: string
  email: string
  phone: string | null
  referral_code: string
  tier: "affiliate" | "sales"
  commission_rate: number
  status: "pending" | "active" | "suspended" | "terminated"
  overhead_pct: number
  landing_headline: string | null
  landing_bio: string | null
  landing_image: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PartnerReferral {
  id: string
  partner_id: string
  user_id: string
  referral_code: string
  source: string
  created_at: string
}

export interface PartnerCommission {
  id: string
  partner_id: string
  referral_id: string | null
  user_id: string
  transaction_type: string
  product: string
  gross_amount: number
  stripe_fee: number
  overhead_amount: number
  net_amount: number
  commission_rate: number
  commission_amount: number
  status: "pending" | "approved" | "paid" | "rejected"
  stripe_session_id: string | null
  approved_at: string | null
  paid_at: string | null
  admin_notes: string | null
  created_at: string
}

// ─── Partner Queries ────────────────────────────────────────

export async function getPartnerByCode(code: string): Promise<Partner | null> {
  const result = await sql`
    SELECT * FROM partners WHERE referral_code = ${code.toLowerCase()} AND status = 'active' LIMIT 1
  `
  return (result.rows[0] as Partner) || null
}

export async function getPartnerByUserId(userId: string): Promise<Partner | null> {
  const result = await sql`
    SELECT * FROM partners WHERE user_id = ${userId} LIMIT 1
  `
  return (result.rows[0] as Partner) || null
}

export async function getPartnerByEmail(email: string): Promise<Partner | null> {
  const result = await sql`
    SELECT * FROM partners WHERE email = ${email.toLowerCase()} LIMIT 1
  `
  return (result.rows[0] as Partner) || null
}

export async function getAllPartners(): Promise<Partner[]> {
  const result = await sql`
    SELECT * FROM partners ORDER BY created_at DESC
  `
  return result.rows as Partner[]
}

export async function createPartner(data: {
  name: string
  email: string
  phone?: string
  referral_code: string
  tier: "affiliate" | "sales"
  commission_rate: number
  overhead_pct?: number
  landing_headline?: string
  landing_bio?: string
  status?: string
}): Promise<Partner | null> {
  const result = await sql`
    INSERT INTO partners (name, email, phone, referral_code, tier, commission_rate, overhead_pct, landing_headline, landing_bio, status)
    VALUES (
      ${data.name},
      ${data.email.toLowerCase()},
      ${data.phone || null},
      ${data.referral_code.toLowerCase()},
      ${data.tier},
      ${data.commission_rate},
      ${data.overhead_pct || 0},
      ${data.landing_headline || null},
      ${data.landing_bio || null},
      ${data.status || "pending"}
    )
    RETURNING *
  `
  return (result.rows[0] as Partner) || null
}

export async function updatePartner(
  id: string,
  data: Partial<Pick<Partner, "name" | "phone" | "tier" | "commission_rate" | "status" | "overhead_pct" | "landing_headline" | "landing_bio" | "landing_image" | "notes" | "user_id">>
): Promise<Partner | null> {
  // Build SET clause dynamically
  const fields: string[] = []
  const values: unknown[] = []
  let idx = 1

  const allowed = [
    "name", "phone", "tier", "commission_rate", "status", "overhead_pct",
    "landing_headline", "landing_bio", "landing_image", "notes", "user_id",
  ] as const

  for (const key of allowed) {
    if (key in data && data[key] !== undefined) {
      fields.push(`"${key}" = $${idx}`)
      values.push(data[key])
      idx++
    }
  }

  if (fields.length === 0) return null

  fields.push(`updated_at = NOW()`)
  values.push(id)

  // Use sql.query for dynamic updates
  const query = `UPDATE partners SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`
  const result = await sql.query(query, values)
  return (result.rows[0] as Partner) || null
}

// ─── Referral Queries ───────────────────────────────────────

export async function createReferral(data: {
  partner_id: string
  user_id: string
  referral_code: string
  source?: string
}): Promise<PartnerReferral | null> {
  try {
    const result = await sql`
      INSERT INTO partner_referrals (partner_id, user_id, referral_code, source)
      VALUES (${data.partner_id}, ${data.user_id}, ${data.referral_code}, ${data.source || "landing_page"})
      ON CONFLICT (user_id) DO NOTHING
      RETURNING *
    `
    return (result.rows[0] as PartnerReferral) || null
  } catch (error) {
    console.error("[Partners] Error creating referral:", error)
    return null
  }
}

export async function getReferralByUserId(userId: string): Promise<(PartnerReferral & { partner_tier: string; partner_commission_rate: number; partner_overhead_pct: number }) | null> {
  const result = await sql`
    SELECT pr.*, p.tier AS partner_tier, p.commission_rate AS partner_commission_rate, p.overhead_pct AS partner_overhead_pct
    FROM partner_referrals pr
    JOIN partners p ON p.id = pr.partner_id
    WHERE pr.user_id = ${userId}
    LIMIT 1
  `
  return result.rows[0] || null
}

export async function getPartnerReferrals(partnerId: string): Promise<Array<{
  id: string
  user_name: string
  user_email: string
  created_at: string
  total_spent: number
  total_commission: number
}>> {
  const result = await sql`
    SELECT
      pr.id,
      u.name AS user_name,
      u.email AS user_email,
      pr.created_at,
      COALESCE(SUM(pc.gross_amount), 0) AS total_spent,
      COALESCE(SUM(pc.commission_amount), 0) AS total_commission
    FROM partner_referrals pr
    JOIN users u ON u.id = pr.user_id
    LEFT JOIN partner_commissions pc ON pc.referral_id = pr.id
    WHERE pr.partner_id = ${partnerId}
    GROUP BY pr.id, u.name, u.email, pr.created_at
    ORDER BY pr.created_at DESC
  `
  return result.rows as any[]
}

// ─── Commission Queries ─────────────────────────────────────

export async function createCommission(data: {
  partner_id: string
  referral_id: string | null
  user_id: string
  transaction_type: "one_time" | "subscription"
  product: string
  gross_amount: number
  stripe_fee?: number
  overhead_amount?: number
  net_amount: number
  commission_rate: number
  commission_amount: number
  stripe_session_id?: string
}): Promise<PartnerCommission | null> {
  try {
    const result = await sql`
      INSERT INTO partner_commissions (
        partner_id, referral_id, user_id, transaction_type, product,
        gross_amount, stripe_fee, overhead_amount, net_amount,
        commission_rate, commission_amount, stripe_session_id
      ) VALUES (
        ${data.partner_id}, ${data.referral_id || null}, ${data.user_id},
        ${data.transaction_type}, ${data.product},
        ${data.gross_amount}, ${data.stripe_fee || 0}, ${data.overhead_amount || 0},
        ${data.net_amount}, ${data.commission_rate}, ${data.commission_amount},
        ${data.stripe_session_id || null}
      )
      RETURNING *
    `
    return (result.rows[0] as PartnerCommission) || null
  } catch (error) {
    console.error("[Partners] Error creating commission:", error)
    return null
  }
}

export async function getPartnerCommissions(partnerId: string, status?: string): Promise<PartnerCommission[]> {
  if (status) {
    const result = await sql`
      SELECT * FROM partner_commissions WHERE partner_id = ${partnerId} AND status = ${status} ORDER BY created_at DESC
    `
    return result.rows as PartnerCommission[]
  }
  const result = await sql`
    SELECT * FROM partner_commissions WHERE partner_id = ${partnerId} ORDER BY created_at DESC
  `
  return result.rows as PartnerCommission[]
}

export async function getPartnerStats(partnerId: string): Promise<{
  total_referrals: number
  total_revenue: number
  total_earned: number
  pending_commission: number
  approved_commission: number
  paid_commission: number
}> {
  const result = await sql`
    SELECT
      (SELECT COUNT(*) FROM partner_referrals WHERE partner_id = ${partnerId})::int AS total_referrals,
      COALESCE((SELECT SUM(gross_amount) FROM partner_commissions WHERE partner_id = ${partnerId}), 0) AS total_revenue,
      COALESCE((SELECT SUM(commission_amount) FROM partner_commissions WHERE partner_id = ${partnerId}), 0) AS total_earned,
      COALESCE((SELECT SUM(commission_amount) FROM partner_commissions WHERE partner_id = ${partnerId} AND status = 'pending'), 0) AS pending_commission,
      COALESCE((SELECT SUM(commission_amount) FROM partner_commissions WHERE partner_id = ${partnerId} AND status = 'approved'), 0) AS approved_commission,
      COALESCE((SELECT SUM(commission_amount) FROM partner_commissions WHERE partner_id = ${partnerId} AND status = 'paid'), 0) AS paid_commission
  `
  return result.rows[0] as any
}

// ─── Commission Calculator ──────────────────────────────────

const STRIPE_RATE = 0.029
const STRIPE_FIXED = 0.30

export function calculateCommission(
  grossAmount: number,
  tier: "affiliate" | "sales",
  commissionRate: number,
  overheadPct: number = 0,
  recruiterCost: number = 0
): {
  stripe_fee: number
  overhead_amount: number
  net_amount: number
  commission_amount: number
} {
  const stripe_fee = Math.round((grossAmount * STRIPE_RATE + STRIPE_FIXED) * 100) / 100

  let overhead_amount = 0
  if (tier === "sales") {
    // Sales partner: deduct Stripe + overhead % + recruiter cost
    const overheadFromPct = Math.round((grossAmount * overheadPct / 100) * 100) / 100
    overhead_amount = overheadFromPct + recruiterCost
  }

  const net_amount = Math.round((grossAmount - stripe_fee - overhead_amount) * 100) / 100
  const commission_amount = Math.round((net_amount * commissionRate / 100) * 100) / 100

  return { stripe_fee, overhead_amount, net_amount, commission_amount }
}
