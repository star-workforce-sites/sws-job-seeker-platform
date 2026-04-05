import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import type { CHRMIntelligenceData } from "@/types/chrm-nexus"

export const dynamic = "force-dynamic"

const CHRM_INTELLIGENCE_URL =
  "https://us-central1-chrm-nexus.cloudfunctions.net/getIntelligenceData"

export async function GET() {
  try {
    // Auth required — only logged-in users see market intelligence
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // No auth header needed for getIntelligenceData
    const response = await fetch(CHRM_INTELLIGENCE_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error(
        "[CHRM Intelligence] API error:",
        response.status,
        await response.text()
      )
      return NextResponse.json(
        { error: "Failed to fetch intelligence data" },
        { status: 502 }
      )
    }

    const data: CHRMIntelligenceData = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("[CHRM Intelligence] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch intelligence data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
