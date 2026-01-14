import Stripe from "stripe"

// Stripe client for STAR Workforce Solutions
// Handles: ATS Optimizer unlocks, subscription payments, job posting fees

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
})

export default stripe

// Product configurations
export const STRIPE_PRODUCTS = {
  ATS_OPTIMIZER: {
    name: "ATS Optimizer Unlock",
    price: 500, // $5.00 in cents
    currency: "usd",
    description: "Unlock full ATS analysis with unlimited resume scans",
  },
  PROFESSIONAL_PLAN: {
    name: "Professional Plan",
    price: 4900, // $49.00 in cents
    currency: "usd",
    description: "Monthly subscription for job seekers",
  },
  ENTERPRISE_PLAN: {
    name: "Enterprise Plan",
    price: 14900, // $149.00 in cents
    currency: "usd",
    description: "Monthly subscription for enterprise job seekers",
  },
}

// Create Stripe checkout session
export async function createCheckoutSession(params: {
  userId: string
  productKey: keyof typeof STRIPE_PRODUCTS
  successUrl: string
  cancelUrl: string
}): Promise<Stripe.Checkout.Session> {
  const product = STRIPE_PRODUCTS[params.productKey]

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: product.currency,
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.price,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    client_reference_id: params.userId,
    metadata: {
      userId: params.userId,
      product: params.productKey,
    },
  })

  return session
}

// Verify Stripe webhook signature
export function verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}
