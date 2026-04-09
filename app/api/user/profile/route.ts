import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { sql } from "@vercel/postgres"
import { sendProfileUpdateNotificationEmail } from "@/lib/send-recruiter-emails"

// ─────────────────────────────────────────────
// GET /api/user/profile
// Returns the user's base record + extended profile
// ─────────────────────────────────────────────
export async function GET() {
  try {
    const sessionUser = await getCurrentUser()
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Base user info
    const userResult = await sql`
      SELECT id, name, email, role, "atsPremium", "createdAt"
      FROM users
      WHERE id = ${sessionUser.id}
      LIMIT 1
    `
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    const user = userResult.rows[0]

    // Extended profile (may not exist yet — first visit)
    const profileResult = await sql`
      SELECT
        phone, linkedin_url, location, work_auth,
        target_titles, target_locations,
        open_to_remote, open_to_contract, open_to_fulltime,
        min_rate_hourly, skills, resume_text, certifications,
        updated_at
      FROM user_profiles
      WHERE user_id = ${user.id}
      LIMIT 1
    `
    const profile = profileResult.rows[0] ?? null

    return NextResponse.json({ user, profile })
  } catch (error) {
    console.error("[profile GET] error:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

// ─────────────────────────────────────────────
// PUT /api/user/profile
// Upserts name (users table) + all extended fields (user_profiles table)
// ─────────────────────────────────────────────
export async function PUT(request: NextRequest) {
  try {
    const sessionUser = await getCurrentUser()
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      phone,
      linkedin_url,
      location,
      work_auth,
      target_titles,
      target_locations,
      open_to_remote,
      open_to_contract,
      open_to_fulltime,
      min_rate_hourly,
      skills,
      resume_text,
      certifications,
    } = body

    // Update name in users table
    if (name !== undefined) {
      await sql`
        UPDATE users
        SET name = ${name ?? null}
        WHERE id = ${sessionUser.id}
      `
    }

    // Upsert extended profile
    await sql`
      INSERT INTO user_profiles (
        user_id, phone, linkedin_url, location, work_auth,
        target_titles, target_locations,
        open_to_remote, open_to_contract, open_to_fulltime,
        min_rate_hourly, skills, resume_text, certifications,
        updated_at
      )
      VALUES (
        ${sessionUser.id},
        ${phone ?? null},
        ${linkedin_url ?? null},
        ${location ?? null},
        ${work_auth ?? null},
        ${target_titles ?? null},
        ${target_locations ?? null},
        ${open_to_remote ?? true},
        ${open_to_contract ?? true},
        ${open_to_fulltime ?? false},
        ${min_rate_hourly ?? null},
        ${skills ?? null},
        ${resume_text ?? null},
        ${certifications ?? null},
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        phone             = EXCLUDED.phone,
        linkedin_url      = EXCLUDED.linkedin_url,
        location          = EXCLUDED.location,
        work_auth         = EXCLUDED.work_auth,
        target_titles     = EXCLUDED.target_titles,
        target_locations  = EXCLUDED.target_locations,
        open_to_remote    = EXCLUDED.open_to_remote,
        open_to_contract  = EXCLUDED.open_to_contract,
        open_to_fulltime  = EXCLUDED.open_to_fulltime,
        min_rate_hourly   = EXCLUDED.min_rate_hourly,
        skills            = EXCLUDED.skills,
        resume_text       = EXCLUDED.resume_text,
        certifications    = EXCLUDED.certifications,
        updated_at        = NOW()
    `

    // ── Send admin notification (fire-and-forget) ──────────
    const FIELD_LABELS: Record<string, string> = {
      name: "Name",
      phone: "Phone",
      linkedin_url: "LinkedIn URL",
      location: "Location",
      work_auth: "Work Authorization",
      target_titles: "Target Titles",
      target_locations: "Target Locations",
      open_to_remote: "Open to Remote",
      open_to_contract: "Open to Contract",
      open_to_fulltime: "Open to Full-time",
      min_rate_hourly: "Minimum Hourly Rate",
      skills: "Skills",
      resume_text: "Resume Text",
      certifications: "Certifications",
    }
    const updatedFields = Object.keys(body)
      .filter((k) => body[k] !== undefined && k in FIELD_LABELS)
      .map((k) => FIELD_LABELS[k])

    sendProfileUpdateNotificationEmail({
      jobSeekerName: name ?? sessionUser.name ?? "",
      jobSeekerEmail: sessionUser.email ?? "",
      updatedFields,
    }).catch((err) => console.error("[profile PUT] admin email failed:", err))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[profile PUT] error:", error)
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 })
  }
}

// Keep PATCH for backward compat (name-only update)
export async function PATCH(request: NextRequest) {
  return PUT(request)
}
