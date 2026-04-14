import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"

// GET all commissions (admin only, with filters)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const status = req.nextUrl.searchParams.get("status")

    const result = status
      ? await sql`
          SELECT pc.*, p.name AS partner_name, p.tier AS partner_tier, u.email AS user_email
          FROM partner_commissions pc
          JOIN partners p ON p.id = pc.partner_id
          LEFT JOIN users u ON u.id = pc.user_id
          WHERE pc.status = ${status}
          ORDER BY pc.created_at DESC
          LIMIT 100
        `
      : await sql`
          SELECT pc.*, p.name AS partner_name, p.tier AS partner_tier, u.email AS user_email
          FROM partner_commissions pc
          JOIN partners p ON p.id = pc.partner_id
          LEFT JOIN users u ON u.id = pc.user_id
          ORDER BY pc.created_at DESC
          LIMIT 100
        `

    return NextResponse.json({ commissions: result.rows })
  } catch (error) {
    console.error("[Admin Commissions] GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH — approve, reject, or mark as paid (batch)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { ids, action, notes } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids array required" }, { status: 400 })
    }

    if (!["approve", "reject", "pay"].includes(action)) {
      return NextResponse.json({ error: "action must be approve, reject, or pay" }, { status: 400 })
    }

    const newStatus = action === "approve" ? "approved" : action === "reject" ? "rejected" : "paid"

    for (const id of ids) {
      if (action === "approve") {
        await sql`
          UPDATE partner_commissions
          SET status = ${newStatus},
              approved_at = NOW(),
              admin_notes = COALESCE(${notes || null}, admin_notes)
          WHERE id = ${id}
        `
      } else if (action === "pay") {
        await sql`
          UPDATE partner_commissions
          SET status = ${newStatus},
              paid_at = NOW(),
              admin_notes = COALESCE(${notes || null}, admin_notes)
          WHERE id = ${id}
        `
      } else {
        await sql`
          UPDATE partner_commissions
          SET status = ${newStatus},
              admin_notes = COALESCE(${notes || null}, admin_notes)
          WHERE id = ${id}
        `
      }
    }

    return NextResponse.json({ updated: ids.length, status: newStatus })
  } catch (error) {
    console.error("[Admin Commissions] PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
