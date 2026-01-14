import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
})

const COVER_LETTER_PRICE_ID = "price_1SWUhp04KnTBJoOrG8W8C8OK"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    console.log("[COVER-RESTORE] Checking premium access for:", email)

    const existingRecord = await sql`
      SELECT * FROM premium_access 
      WHERE LOWER(email) = LOWER(${email})
      AND "priceId" = ${COVER_LETTER_PRICE_ID}
      LIMIT 1
    `

    if (existingRecord.rows.length > 0) {
      console.log("[COVER-RESTORE] Found existing Cover Letter access in database for:", email)

      const response = NextResponse.json({
        success: true,
        hasPremium: true,
        message: "Cover Letter Access Restored!",
        coverLetterId: existingRecord.rows[0].coverLetterId || null,
      })

      response.cookies.set("coverLetterPremium", "true", {
        maxAge: 31536000, // 1 year
        path: "/",
        secure: true,
        sameSite: "lax",
      })
      response.cookies.set("coverLetterEmail", email, {
        maxAge: 31536000,
        path: "/",
        secure: true,
        sameSite: "lax",
      })

      return response
    }

    console.log("[COVER-RESTORE] No DB record, checking Stripe for", email)
    const sessions = await stripe.checkout.sessions.list({
      customer_email: email,
      limit: 100,
      expand: ["data.line_items"], // Expand line_items to get price data
    })

    console.log(`[COVER-RESTORE] Stripe sessions for ${email}:`, sessions.data.length, "sessions found")

    const paidSession = sessions.data.find((s) => {
      const lineItems = s.line_items?.data || []
      const hasMatchingPrice = lineItems.some((item) => item.price?.id === COVER_LETTER_PRICE_ID)
      const isPaid = s.payment_status === "paid" && s.amount_total === 500

      if (lineItems.length > 0) {
        console.log(
          `[COVER-RESTORE] Session ${s.id}: payment_status=${s.payment_status}, amount=${s.amount_total}, prices=[${lineItems.map((i) => i.price?.id).join(", ")}]`,
        )
      }

      return isPaid && hasMatchingPrice
    })

    if (paidSession) {
      console.log("[COVER-RESTORE] Found Cover Letter payment in Stripe, creating DB record for:", email)

      await sql`
        INSERT INTO premium_access 
        (email, "stripeCustomerId", "stripeSessionId", "paidAt", product, "priceId", "expiresAt")
        VALUES (
          ${email},
          ${paidSession.customer},
          ${paidSession.id},
          NOW(),
          'COVER_LETTER',
          ${COVER_LETTER_PRICE_ID},
          NULL
        )
      `

      const response = NextResponse.json({
        success: true,
        hasPremium: true,
        message: "Cover Letter Access Restored!",
      })

      response.cookies.set("coverLetterPremium", "true", {
        maxAge: 31536000,
        path: "/",
        secure: true,
        sameSite: "lax",
      })
      response.cookies.set("coverLetterEmail", email, {
        maxAge: 31536000,
        path: "/",
        secure: true,
        sameSite: "lax",
      })

      return response
    }

    console.log("[COVER-RESTORE] No matching Cover Letter session found for:", email)
    return NextResponse.json({
      success: false,
      hasPremium: false,
      promptPay: true,
      error: "No Cover Letter payment found — unlock for $5?",
    })
  } catch (error: any) {
    console.error("[COVER-RESTORE ERROR]", error.message)
    return NextResponse.json(
      {
        error: "Restore failed",
        details: error?.message || String(error),
      },
      { status: 500 },
    )
  }
}
