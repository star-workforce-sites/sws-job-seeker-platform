import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

// GET /api/health
// Health check endpoint for monitoring

export async function GET() {
  try {
    // Check database connection
    const dbCheck = await sql`SELECT 1 as health`
    const dbHealthy = dbCheck.rows.length > 0

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? "connected" : "disconnected",
        api: "running",
      },
    })
  } catch (error) {
    console.error("[v0] Health check failed:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Service degraded",
      },
      { status: 503 },
    )
  }
}
