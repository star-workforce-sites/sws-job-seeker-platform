import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
})

// ATS Optimizer specific price ID
const ATS_PRICE_ID = "price_1SVd4E04KnTBJoOrBcQTH6T5"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes("@")) {
      console.log("[ATS-RESTORE] Invalid email format:", email)
      return NextResponse.json({ error: "Invalid email address", hasPremium: false }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    console.log("[ATS-RESTORE] ===== ATS RESTORE STARTED =====")
    console.log("[ATS-RESTORE] Input email:", email)
    console.log("[ATS-RESTORE] Normalized email:", normalizedEmail)
    console.log("[ATS-RESTORE] Looking for ATS Optimizer priceId:", ATS_PRICE_ID)

    console.log("[ATS-RESTORE] Checking premium_access table for ATS product...")
    const accessResult = await sql`
      SELECT id, email, "paidAt", "resumeId", "stripeCustomerId", "stripeSessionId", "priceId"
      FROM premium_access
      WHERE LOWER(TRIM(email)) = ${normalizedEmail}
      AND "priceId" = ${ATS_PRICE_ID}
      LIMIT 1
    `
    console.log("[ATS-RESTORE] Premium_access ATS query result:", accessResult.rows.length, "rows")
    if (accessResult.rows.length > 0) {
      console.log("[ATS-RESTORE] Found ATS premium_access record:", accessResult.rows[0])
    }

    if (accessResult.rows.length > 0) {
      const access = accessResult.rows[0]
      console.log("[ATS-RESTORE] ✅ Found ATS premium access in premium_access table")

      const response = NextResponse.json({
        success: true,
        hasPremium: true,
        message: "ATS Premium access restored successfully!",
        resumeId: access.resumeId,
        paidAt: access.paidAt,
      })

      response.cookies.set("atsPremium", "true", {
        maxAge: 31536000,
        path: "/",
        secure: true,
        sameSite: "lax",
        httpOnly: false,
      })

      response.cookies.set("atsEmail", normalizedEmail, {
        maxAge: 31536000,
        path: "/",
        secure: true,
        sameSite: "lax",
        httpOnly: false,
      })

      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
      response.headers.set("Pragma", "no-cache")
      response.headers.set("Expires", "0")

      return response
    }

    console.log("[ATS-RESTORE] No ATS DB record found. Querying Stripe API...")
    console.log("[ATS-RESTORE] Stripe API Key present:", !!process.env.STRIPE_SECRET_KEY)

    const customers = await stripe.customers.list({
      email: normalizedEmail,
      limit: 10,
    })
    console.log("[ATS-RESTORE] Stripe customers found:", customers.data.length)

    if (customers.data.length === 0) {
      console.log("[ATS-RESTORE] ❌ No Stripe customer found for email:", normalizedEmail)
      return NextResponse.json(
        {
          success: false,
          promptPay: true,
          message: "No ATS Optimizer payment found — unlock for $5?",
        },
        { status: 200 },
      )
    }

    const customer = customers.data[0]
    console.log("[ATS-RESTORE] Using customer:", customer.id)

    console.log("[ATS-RESTORE] Fetching checkout sessions with line_items...")
    const checkoutSessions = await stripe.checkout.sessions.list({
      customer: customer.id,
      limit: 100,
      expand: ["data.line_items"],
    })
    console.log("[ATS-RESTORE] Total checkout sessions:", checkoutSessions.data.length)

    const atsSession = checkoutSessions.data.find((session) => {
      if (session.status !== "complete" || session.payment_status !== "paid") return false

      // Check line items for ATS price ID
      const hasAtsPrice = session.line_items?.data.some((item) => item.price?.id === ATS_PRICE_ID)

      return hasAtsPrice
    })

    if (atsSession) {
      console.log("[ATS-RESTORE] ✅ Found ATS checkout session:", atsSession.id)
      console.log("[ATS-RESTORE] Syncing to database...")

      try {
        const insertResult = await sql`
          INSERT INTO premium_access (email, "paidAt", "stripeCustomerId", "stripeSessionId", "priceId", product)
          VALUES (
            ${normalizedEmail}, 
            NOW(), 
            ${customer.id},
            ${atsSession.id},
            ${ATS_PRICE_ID},
            'ATS_OPTIMIZER'
          )
          ON CONFLICT (email, "priceId") 
          DO UPDATE SET 
            "stripeCustomerId" = ${customer.id},
            "stripeSessionId" = ${atsSession.id},
            "paidAt" = COALESCE(premium_access."paidAt", NOW())
          RETURNING id, "paidAt", "resumeId"
        `

        const newAccess = insertResult.rows[0]
        console.log("[ATS-RESTORE] ✅ Database synced successfully:", newAccess)

        const response = NextResponse.json({
          success: true,
          hasPremium: true,
          message: "ATS Premium access restored from Stripe!",
          resumeId: newAccess.resumeId,
          paidAt: newAccess.paidAt,
        })

        response.cookies.set("atsPremium", "true", {
          maxAge: 31536000,
          path: "/",
          secure: true,
          sameSite: "lax",
          httpOnly: false,
        })

        response.cookies.set("atsEmail", normalizedEmail, {
          maxAge: 31536000,
          path: "/",
          secure: true,
          sameSite: "lax",
          httpOnly: false,
        })

        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")

        return response
      } catch (dbError: any) {
        console.error("[ATS-RESTORE] ❌ Database insert error:", dbError.message)

        const response = NextResponse.json({
          success: true,
          hasPremium: true,
          message: "ATS Premium access restored from Stripe (database sync pending)",
          warning: "Database sync failed but payment verified",
        })

        response.cookies.set("atsPremium", "true", {
          maxAge: 31536000,
          path: "/",
          secure: true,
          sameSite: "lax",
          httpOnly: false,
        })

        response.cookies.set("atsEmail", normalizedEmail, {
          maxAge: 31536000,
          path: "/",
          secure: true,
          sameSite: "lax",
          httpOnly: false,
        })

        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")

        return response
      }
    }

    console.log("[ATS-RESTORE] ❌ No ATS Optimizer payment found in Stripe")
    console.log("[ATS-RESTORE] Email may have other products but not ATS")
    return NextResponse.json(
      {
        success: false,
        promptPay: true,
        message: "No ATS Optimizer payment found — unlock for $5?",
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("[ATS-RESTORE] ===== RESTORE FAILED =====")
    console.error("[ATS-RESTORE] Error:", error?.message)
    console.error("[ATS-RESTORE] Stack:", error?.stack)

    return NextResponse.json(
      {
        error: "Restore failed",
        hasPremium: false,
        details: error?.message || String(error),
      },
      { status: 500 },
    )
  }
}
