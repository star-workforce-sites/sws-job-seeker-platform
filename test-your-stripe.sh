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
