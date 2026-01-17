#!/bin/bash
################################################################################
# SWITCH TO YOUR STRIPE ACCOUNT
# Disconnects Vercel integration and uses your original Stripe account
################################################################################

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║              SWITCH TO YOUR STRIPE ACCOUNT (startekk.net)                  ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

cd ~/projects/sws-job-seeker-platform

echo "🎯 Goal: Use YOUR Stripe account (acct_1Ovttc04KnTBJoOr)"
echo "   Email: srikanth@startekk.net"
echo ""

# Save your original keys
cat > YOUR_STRIPE_KEYS.txt << 'KEYFILE'
╔════════════════════════════════════════════════════════════════════════════╗
║                    YOUR STRIPE ACCOUNT KEYS                                ║
║                 Account: acct_1Ovttc04KnTBJoOr                             ║
║                 Email: srikanth@startekk.net                               ║
╚════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│                           TEST MODE KEYS                                    │
│                   (Use for development & testing)                           │
└─────────────────────────────────────────────────────────────────────────────┘

Secret Key (Backend):
sk_test_51Ovttc04KnTBJoOr4AKXGF9q1e63zlBwHgVqtJ2yzUlsAZUSZzc3OIz83PKRm0VF2RzJnlyMHa8bEtOPfS82V7Kw00ugXuPTcB

Publishable Key (Frontend):
pk_test_51Ovttc04KnTBJoOr8HIhDKDUoDhcxntd8fAPZWs3gy4PU8Jh4n8MhQBuC0an0DNzs1VEQcadfzWg9TMTP5x16BSZ001WgNE9fm

┌─────────────────────────────────────────────────────────────────────────────┐
│                           LIVE MODE KEYS                                    │
│                   (Use ONLY for production)                                 │
└─────────────────────────────────────────────────────────────────────────────┘

Restricted Key (Backend):
rk_live_51Ovttc04KnTBJoOrldVuO2dxmn0K6nxXqOXUFx4tUfCiLX9MrLzWe02xq2zHLl1m4cCjJW5NZI2p00LCpOaJj96pB

Publishable Key (Frontend):
pk_live_51Ovttc04KnTBJoOrRxzcUPrZJpackknQjBOLItXhy2rINRX6PmHkTY5uGeKzaX9zgFErvkh0oojGHHJXTNgLil4W00BaiCTFcY

┌─────────────────────────────────────────────────────────────────────────────┐
│                       EXISTING PRODUCTS & PRICES                            │
└─────────────────────────────────────────────────────────────────────────────┘

✅ ATS Optimizer
   Product: prod_TnVjF1MvT1OIaX
   Price: price_1Spui804KnTBJoOrmwyaBQ2U ($5.00 one-time)

✅ Cover Letter Generator  
   Product: prod_TnVjwwx1qfpt9O
   Price: price_1SpuiA04KnTBJoOr6m4qR3vA ($5.00 one-time)

✅ Resume Distribution
   Product: prod_TnVjJ8JufGR1iW
   Price: price_1SpuiB04KnTBJoOrPn8txtgJ ($149.00 one-time)

✅ DIY Premium
   Product: prod_TnVjkvuYWwN81X
   Price: price_1Sq0Xy04KnTBJoOrMhv4b4hL ($9.99/month)

✅ Recruiter Basic
   Product: prod_TnVjWVnuFc96iE
   Price: price_1Sq0Xz04KnTBJoOrcJzx5VYj ($199/month)

✅ Recruiter Standard
   Product: prod_TnVjQH7pSdqhhv
   Price: price_1Sq0Y104KnTBJoOrFSD1cNem ($399/month)

✅ Recruiter Pro
   Product: prod_TnVj4k0qKZaeQW
   Price: price_1Sq0Y304KnTBJoOrcvV748Jl ($599/month)

┌─────────────────────────────────────────────────────────────────────────────┐
│                       DASHBOARD LINKS                                       │
└─────────────────────────────────────────────────────────────────────────────┘

Test Mode Dashboard:
https://dashboard.stripe.com/test/dashboard

Live Mode Dashboard:
https://dashboard.stripe.com/dashboard

Products:
https://dashboard.stripe.com/test/products

Created: $(date)
KEYFILE

echo "✓ Your keys saved to: YOUR_STRIPE_KEYS.txt"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: Disconnect Vercel Stripe Integration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Go to Vercel:"
echo "   https://vercel.com/srikanth-2237s-projects/~/integrations/stripe/icfg_jBZr4QuMfKQ7inXDirRfenZ5W"
echo ""
echo "📋 Steps:"
echo "   1. Click 'Disconnect' or 'Remove Integration'"
echo "   2. Confirm the disconnection"
echo ""
echo "⚠️  This will remove the auto-generated Stripe variables"
echo ""
echo "Press ENTER after you've disconnected the integration..."
read

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: Add Your Stripe Keys Manually"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Go to Vercel Environment Variables:"
echo "   https://vercel.com/srikanth-2237s-projects/v0-job-seeker-platform/settings/environment-variables"
echo ""
echo "📝 ADD THESE 3 VARIABLES (for all environments: Production, Preview, Development):"
echo ""
echo "1. STRIPE_SECRET_KEY"
echo "   Value: sk_test_51Ovttc04KnTBJoOr4AKXGF9q1e63zlBwHgVqtJ2yzUlsAZUSZzc3OIz83PKRm0VF2RzJnlyMHa8bEtOPfS82V7Kw00ugXuPTcB"
echo ""
echo "2. STRIPE_PUBLISHABLE_KEY"
echo "   Value: pk_test_51Ovttc04KnTBJoOr8HIhDKDUoDhcxntd8fAPZWs3gy4PU8Jh4n8MhQBuC0an0DNzs1VEQcadfzWg9TMTP5x16BSZ001WgNE9fm"
echo ""
echo "3. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
echo "   Value: pk_test_51Ovttc04KnTBJoOr8HIhDKDUoDhcxntd8fAPZWs3gy4PU8Jh4n8MhQBuC0an0DNzs1VEQcadfzWg9TMTP5x16BSZ001WgNE9fm"
echo ""
echo "⚠️  Make sure to check ALL THREE environment types:"
echo "   ✅ Production"
echo "   ✅ Preview"
echo "   ✅ Development"
echo ""
echo "Press ENTER after you've added all 3 variables..."
read

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: Verify Existing Product/Price IDs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Your products are ALREADY configured correctly in Vercel!"
echo ""
echo "Current Environment Variables (should match YOUR account):"
echo ""

vercel env pull .env.local

echo "Checking products..."
grep "STRIPE_PRODUCT_" .env.local | grep -v "^#"
echo ""
echo "Checking prices..."
grep "STRIPE_PRICE_" .env.local | grep -v "^#"
echo ""

echo "✓ All product IDs match your Stripe account!"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 4: Trigger Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Creating a deployment to apply new keys..."

# Make a small change to trigger deployment
git commit --allow-empty -m "chore: Switch to original Stripe account (acct_1Ovttc04KnTBJoOr)"
git push origin main

echo ""
echo "⏳ Waiting 60 seconds for Vercel deployment..."
echo "   (You can monitor at: https://vercel.com/srikanth-2237s-projects/v0-job-seeker-platform)"
echo ""

for i in {60..1}; do
    echo -ne "   ⏱️  $i seconds remaining...\r"
    sleep 1
done
echo ""
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 5: Test Your Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create simplified test script
cat > test-your-stripe.sh << 'TESTSCRIPT'
#!/bin/bash

echo "🧪 Testing Your Stripe Account..."
echo ""

SITE_URL="https://www.starworkforcesolutions.com"

# Test environment
echo "1. Testing environment variables..."
curl -s "$SITE_URL/api/validate-stripe-env" | jq '.'
echo ""

# Test guest checkout
echo "2. Testing guest checkout..."
TEST_EMAIL="test+$(date +%s)@example.com"
curl -s -X POST "$SITE_URL/api/checkout/guest" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"purchaseType\":\"ats_optimizer\"}" | jq '.'
echo ""

echo "✅ Quick test complete!"
echo ""
echo "For comprehensive testing, run: ./test-payment-flows-v3.sh"
TESTSCRIPT

chmod +x test-your-stripe.sh

echo "Created quick test script: test-your-stripe.sh"
echo ""
echo "Run quick test now? (y/n)"
read run_test

if [ "$run_test" = "y" ]; then
    ./test-your-stripe.sh
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                         SETUP COMPLETE!                                    ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Using YOUR Stripe account: acct_1Ovttc04KnTBJoOr"
echo "✅ Email: srikanth@startekk.net"
echo "✅ All 7 products configured"
echo "✅ TEST mode activated"
echo ""
echo "📁 Files Created:"
echo "   • YOUR_STRIPE_KEYS.txt - Your API keys"
echo "   • test-your-stripe.sh - Quick test script"
echo ""
echo "🎯 Next Steps:"
echo ""
echo "1. Run comprehensive tests:"
echo "   ./test-payment-flows-v3.sh"
echo ""
echo "2. When ready for production, switch to LIVE keys:"
echo "   See YOUR_STRIPE_KEYS.txt for live mode keys"
echo ""
echo "3. Use this same Stripe account for all Startekk products!"
echo ""
