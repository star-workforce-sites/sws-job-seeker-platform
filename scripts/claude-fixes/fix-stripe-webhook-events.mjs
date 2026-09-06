// Ensures the production Stripe webhook endpoint listens for the events
// app/api/stripe/webhook/route.ts now handles (renewals + failed payments).
// Run this from Git Bash: node scripts/claude-fixes/fix-stripe-webhook-events.mjs
//
// Reads STRIPE_SECRET_KEY from .env in the repo root. Never prints the key.
import fs from "fs"
import Stripe from "stripe"

const envText = fs.readFileSync(".env", "utf8")
const secretMatch = envText.match(/^STRIPE_SECRET_KEY=(.+)$/m)
if (!secretMatch) {
  console.error("STRIPE_SECRET_KEY not found in .env — aborting.")
  process.exit(1)
}
const stripe = new Stripe(secretMatch[1].trim())

const REQUIRED_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
]

const endpoints = await stripe.webhookEndpoints.list({ limit: 100 })
if (endpoints.data.length === 0) {
  console.log("No webhook endpoints found on this Stripe account. Nothing to update.")
  process.exit(0)
}

// Only touch endpoints pointed at our own production webhook route, to avoid
// accidentally reconfiguring an endpoint used for something else.
const target = endpoints.data.filter(ep => ep.url.includes("/api/stripe/webhook"))
if (target.length === 0) {
  console.log("No endpoint found pointing at /api/stripe/webhook. Endpoints on file:")
  endpoints.data.forEach(ep => console.log(`  ${ep.id}  ${ep.url}`))
  console.log("Nothing changed — re-run with the right endpoint targeted if one of the above is correct.")
  process.exit(0)
}

for (const ep of target) {
  console.log(`\nEndpoint: ${ep.id}  url=${ep.url}  status=${ep.status}`)
  console.log(`  currently enabled: ${ep.enabled_events.join(", ")}`)

  if (ep.enabled_events.includes("*")) {
    console.log("  -> already listens to all events. No change needed.")
    continue
  }

  const merged = Array.from(new Set([...ep.enabled_events, ...REQUIRED_EVENTS]))
  const missing = REQUIRED_EVENTS.filter(e => !ep.enabled_events.includes(e))

  if (missing.length === 0) {
    console.log("  -> already has all required events. No change needed.")
    continue
  }

  console.log(`  -> adding: ${missing.join(", ")}`)
  const updated = await stripe.webhookEndpoints.update(ep.id, { enabled_events: merged })
  console.log(`  -> done. Endpoint now listens for: ${updated.enabled_events.join(", ")}`)
}
