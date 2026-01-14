# Stripe Payment Setup Guide

## Stripe Integration

STAR Workforce Solutions uses Stripe for payment processing:
- ATS Optimizer unlock ($5 one-time)
- Professional Plan ($49/month subscription)
- Enterprise Plan ($149/month subscription)

---

## Environment Variables

Add these to your Vercel project:

\`\`\`bash
# Stripe Secret Key (from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_live_...

# Stripe Publishable Key (from Stripe Dashboard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Stripe Webhook Secret (from Stripe Webhooks settings)
STRIPE_WEBHOOK_SECRET=whsec_...

# Your site URL
NEXT_PUBLIC_URL=https://www.starworkforcesolutions.com
\`\`\`

---

## Setup Steps

### 1. Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a Stripe account
3. Complete account verification

### 2. Get API Keys

1. Go to **Developers** → **API keys**
2. Copy **Secret key** (starts with `sk_`)
3. Copy **Publishable key** (starts with `pk_`)
4. Add to Vercel environment variables

### 3. Create Products (Optional)

Products are created dynamically via the API, but you can pre-create them:

1. Go to **Products** in Stripe Dashboard
2. Create products:
   - **ATS Optimizer Unlock**: $5.00 one-time payment
   - **Professional Plan**: $49.00/month recurring
   - **Enterprise Plan**: $149.00/month recurring

### 4. Configure Webhook

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://www.starworkforcesolutions.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add to Vercel as `STRIPE_WEBHOOK_SECRET`

### 5. Test Mode

For development, use test mode keys:
- Test Secret Key: `sk_test_...`
- Test Publishable Key: `pk_test_...`
- Test cards: `4242 4242 4242 4242` (any future date, any CVC)

---

## Testing Payments

### Local Testing

1. Install Stripe CLI:
\`\`\`bash
brew install stripe/stripe-cli/stripe
\`\`\`

2. Login to Stripe:
\`\`\`bash
stripe login
\`\`\`

3. Forward webhooks to localhost:
\`\`\`bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
\`\`\`

4. Test payment flow:
   - Navigate to `/tools/ats-optimizer`
   - Click "Unlock Full Analysis" 
   - Use test card: `4242 4242 4242 4242`
   - Verify webhook event received

### Production Testing

1. Switch to live mode in Stripe Dashboard
2. Update environment variables with live keys
3. Test with real card (small amount)
4. Verify webhook endpoint is receiving events

---

## Payment Flow

### ATS Optimizer Purchase

1. User clicks "Unlock Full Analysis" button
2. Frontend calls `/api/stripe/checkout` with `product: 'ATS_OPTIMIZER'`
3. API creates Stripe checkout session
4. User redirects to Stripe checkout page
5. User completes payment
6. Stripe redirects to `/payment/success?session_id=...`
7. Stripe webhook fires `checkout.session.completed`
8. Webhook handler:
   - Records payment in `payments` table
   - Sets `user.atsPremium = true` in database
   - Sets `atsPremium=true` cookie (1 year expiration)
9. User has full ATS access

### Subscription Payments

Similar flow but with `mode: 'subscription'` instead of `mode: 'payment'`.

---

## Cookie-Based Access

After successful payment, a cookie is set:

\`\`\`javascript
document.cookie = 'atsPremium=true; path=/; max-age=31536000; secure; samesite=strict';
\`\`\`

This allows instant client-side access without database queries.

**Server-side verification:**
Always verify via database (`user.atsPremium`) for API routes and server actions.

---

## Webhook Security

Webhooks are verified using Stripe signatures:

\`\`\`typescript
import { verifyWebhookSignature } from '@/lib/stripe';

const event = verifyWebhookSignature(body, signature);
\`\`\`

Never process webhook events without signature verification.

---

## Troubleshooting

**Webhook not receiving events**
- Verify endpoint URL is correct in Stripe Dashboard
- Check that webhook secret matches
- Ensure endpoint returns 200 status
- Check Vercel function logs

**Payment succeeds but user not upgraded**
- Check webhook logs in Stripe Dashboard
- Verify `checkout.session.completed` event is selected
- Check database `payments` table for record
- Verify `user.atsPremium` field updated

**Checkout session creation fails**
- Verify `STRIPE_SECRET_KEY` is set
- Check API error logs
- Ensure user is authenticated
- Verify product key is valid

**Test mode payments not working**
- Use test mode keys (`sk_test_...`, `pk_test_...`)
- Use test cards: `4242 4242 4242 4242`
- Check Stripe Dashboard test mode logs

---

## Production Checklist

- [ ] Switch to live Stripe keys
- [ ] Configure webhook with production URL
- [ ] Test real payment (small amount)
- [ ] Verify webhook events received
- [ ] Check database updates
- [ ] Test cookie persistence
- [ ] Verify ATS access after payment
- [ ] Set up Stripe email receipts
- [ ] Configure refund policy in Stripe
- [ ] Enable Stripe Radar (fraud protection)
\`\`\`
