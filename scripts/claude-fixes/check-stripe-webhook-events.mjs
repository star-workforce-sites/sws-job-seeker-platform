import fs from "fs"
import Stripe from "stripe"

const envText = fs.readFileSync(".env", "utf8")
const secretMatch = envText.match(/^STRIPE_SECRET_KEY=(.+)$/m)
if (!secretMatch) { console.error("STRIPE_SECRET_KEY not found in .env"); process.exit(1) }
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
  console.log("No webhook endpoints found on this Stripe account.")
  process.exit(0)
}

for (const ep of endpoints.data) {
  console.log(`Endpoint: ${ep.id}  url=${ep.url}  status=${ep.status}`)
  console.log(`  currently enabled: ${ep.enabled_events.join(", ")}`)
  const missing = REQUIRED_EVENTS.filter(e => !ep.enabled_events.includes(e) && !ep.enabled_events.includes("*"))
  if (missing.length === 0) {
    console.log("  -> already has all required events.")
    continue
  }
  console.log(`  -> missing: ${missing.join(", ")}`)
}
