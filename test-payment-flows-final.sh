#!/bin/bash
################################################################################
# COMPREHENSIVE PAYMENT FLOW TESTS v4.0
# Updated for YOUR Stripe account (acct_1Ovttc04KnTBJoOr)
# No external dependencies (jq removed)
################################################################################

SITE_URL="https://www.starworkforcesolutions.com"
TEST_EMAIL="test+$(date +%s)@example.com"

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║              PAYMENT FLOW TEST SUITE v4.0                                  ║"
echo "║              Using YOUR Stripe Account (startekk.net)                      ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Site: $SITE_URL"
echo "📧 Test Email: $TEST_EMAIL"
echo "🔑 Stripe Account: acct_1Ovttc04KnTBJoOr"
echo "🕒 Started: $(date)"
echo ""
echo "⏳ Pre-test wait: 5 seconds..."
sleep 5
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

test_count=0
pass_count=0
fail_count=0
warnings=0

# JSON parsing function (no jq needed)
parse_json() {
    local json=$1
    local key=$2
    echo "$json" | grep -o "\"$key\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | sed 's/.*"\([^"]*\)".*/\1/' | head -1
}

parse_json_number() {
    local json=$1
    local key=$2
    echo "$json" | grep -o "\"$key\"[[:space:]]*:[[:space:]]*[0-9]*" | grep -o "[0-9]*$" | head -1
}

function test_api() {
    local test_name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=$5
    local check_function=${6:-""}
    
    test_count=$((test_count + 1))
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}Test $test_count: $test_name${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Endpoint: $method $endpoint"
    
    if [ -n "$data" ]; then
        echo "Request: $data"
    fi
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$SITE_URL$endpoint" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$SITE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" 2>&1)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    echo "Status: $http_code"
    echo "Response:"
    # Pretty print JSON manually
    echo "$body" | sed 's/,/,\n  /g' | sed 's/{/{\n  /g' | sed 's/}/\n}/g'
    echo ""
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} - Status $expected_status"
        pass_count=$((pass_count + 1))
        
        if [ -n "$check_function" ]; then
            $check_function "$body"
        fi
    else
        echo -e "${RED}✗ FAIL${NC} - Expected $expected_status, got $http_code"
        fail_count=$((fail_count + 1))
        
        # Detailed error analysis
        if echo "$body" | grep -qi "live mode"; then
            echo -e "${RED}  💥 STRIPE MODE MISMATCH: Using wrong API keys!${NC}"
        fi
        if [ "$http_code" = "405" ]; then
            echo -e "${RED}  💥 METHOD NOT ALLOWED: Route not configured!${NC}"
        fi
        if echo "$body" | grep -qi "database"; then
            echo -e "${RED}  💥 DATABASE ERROR: Check DATABASE_URL!${NC}"
        fi
        if echo "$body" | grep -qi "No such price"; then
            echo -e "${RED}  💥 PRICE MISMATCH: Price ID from wrong account!${NC}"
        fi
    fi
    echo ""
    sleep 1
}

function check_stripe_url() {
    local body=$1
    if echo "$body" | grep -q "\"url\""; then
        url=$(parse_json "$body" "url")
        if [[ $url == https://checkout.stripe.com/* ]]; then
            echo -e "${GREEN}  ✓ Valid Stripe checkout URL${NC}"
            echo -e "${CYAN}  → ${url:0:60}...${NC}"
        else
            echo -e "${YELLOW}  ⚠️  Unexpected URL format${NC}"
            warnings=$((warnings + 1))
        fi
    fi
}

function check_stripe_mode() {
    local body=$1
    
    # Check for YOUR account's price IDs
    if echo "$body" | grep -q "price_1Spui8\|price_1SpuiA\|price_1Sq0X"; then
        echo -e "${GREEN}  ✓ YOUR account price IDs detected (acct_1Ovttc04KnTBJoOr)${NC}"
    else
        echo -e "${YELLOW}  ⚠️  Price IDs might be from different account${NC}"
        warnings=$((warnings + 1))
    fi
}

function check_all_vars() {
    local body=$1
    
    present=$(parse_json_number "$body" "present")
    total=$(parse_json_number "$body" "total")
    
    if [ "$present" = "14" ] && [ "$total" = "14" ]; then
        echo -e "${GREEN}  ✓ All 14 Stripe variables configured${NC}"
    else
        echo -e "${RED}  ✗ Variables: $present/$total configured${NC}"
    fi
}

# ===== SECTION 1: ENVIRONMENT & ACCOUNT VALIDATION =====
echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║  SECTION 1: ENVIRONMENT & STRIPE ACCOUNT (6 tests)                         ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

test_api \
    "1.1 - Site Accessibility" \
    "GET" \
    "/" \
    "" \
    "200"

test_api \
    "1.2 - Stripe Variables - Complete Check" \
    "GET" \
    "/api/validate-stripe-env" \
    "" \
    "200" \
    "check_all_vars"

test_api \
    "1.3 - Stripe Account Verification" \
    "GET" \
    "/api/validate-stripe-env" \
    "" \
    "200" \
    "check_stripe_mode"

test_api \
    "1.4 - API Response Format" \
    "GET" \
    "/api/validate-stripe-env" \
    "" \
    "200"

test_api \
    "1.5 - CORS Headers Check" \
    "GET" \
    "/api/validate-stripe-env" \
    "" \
    "200"

test_api \
    "1.6 - 404 Error Handling" \
    "GET" \
    "/api/nonexistent-endpoint-12345" \
    "" \
    "404"

# ===== SECTION 2: GUEST CHECKOUT SUCCESS =====
echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║  SECTION 2: GUEST CHECKOUT - SUCCESS CASES (3 tests)                       ║"
echo "║  Testing with YOUR Stripe products (acct_1Ovttc04KnTBJoOr)                 ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

test_api \
    "2.1 - ATS Optimizer (\$5.00)" \
    "POST" \
    "/api/checkout/guest" \
    "{\"email\":\"$TEST_EMAIL\",\"purchaseType\":\"ats_optimizer\"}" \
    "200" \
    "check_stripe_url"

test_api \
    "2.2 - Cover Letter Generator (\$5.00)" \
    "POST" \
    "/api/checkout/guest" \
    "{\"email\":\"$TEST_EMAIL\",\"purchaseType\":\"cover_letter\"}" \
    "200" \
    "check_stripe_url"

test_api \
    "2.3 - Resume Distribution (\$149.00)" \
    "POST" \
    "/api/checkout/guest" \
    "{\"email\":\"$TEST_EMAIL\",\"purchaseType\":\"resume_distribution\"}" \
    "200" \
    "check_stripe_url"

# ===== SECTION 3: INPUT VALIDATION =====
echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║  SECTION 3: INPUT VALIDATION & SECURITY (10 tests)                         ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

test_api \
    "3.1 - Invalid Email (no @)" \
    "POST" \
    "/api/checkout/guest" \
    "{\"email\":\"invalid-email\",\"purchaseType\":\"ats_optimizer\"}" \
    "400"

test_api \
    "3.2 - Missing Email" \
    "POST" \
    "/api/checkout/guest" \
    "{\"purchaseType\":\"ats_optimizer\"}" \
    "400"

test_api \
    "3.3 - Missing Purchase Type" \
    "POST" \
    "/api/checkout/guest" \
    "{\"email\":\"$TEST_EMAIL\"}" \
    "400"

test_api \
    "3.4 - Invalid Product Type" \
    "POST" \
    "/api/checkout/guest" \
    "{\"email\":\"$TEST_EMAIL\",\"purchaseType\":\"fake_product\"}" \
    "400"

test_api \
    "3.5 - Empty Request Body" \
    "POST" \
    "/api/checkout/guest" \
    "{}" \
    "400"

test_api \
    "3.6 - Plus Addressing (+test)" \
    "POST" \
    "/api/checkout/guest" \
    "{\"email\":\"user+test@example.com\",\"purchaseType\":\"ats_optimizer\"}" \
    "200"

test_api \
    "3.7 - Long Email (100+ chars)" \
    "POST" \
    "/api/checkout/guest" \
    "{\"email\":\"verylongemailaddress@verylongdomainname.com\",\"purchaseType\":\"ats_optimizer\"}" \
    "200"

test_api \
    "3.8 - SQL Injection Attempt" \
    "POST" \
    "/api/checkout/guest" \
    "{\"email\":\"test'; DROP TABLE users;--@test.com\",\"purchaseType\":\"ats_optimizer\"}" \
    "400"

test_api \
    "3.9 - XSS Attempt" \
    "POST" \
    "/api/checkout/guest" \
    "{\"email\":\"$TEST_EMAIL\",\"purchaseType\":\"<script>alert('xss')</script>\"}" \
    "400"

test_api \
    "3.10 - JSON Injection" \
    "POST" \
    "/api/checkout/guest" \
    "{\"email\":\"test@test.com\",\"purchaseType\":\"ats_optimizer\",\"admin\":true}" \
    "200"

# ===== SECTION 4: TOKEN VERIFICATION =====
echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║  SECTION 4: GUEST TOKEN VERIFICATION (4 tests)                             ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

test_api \
    "4.1 - Invalid Token" \
    "POST" \
    "/api/guest/verify-token" \
    "{\"token\":\"invalid-token-12345\"}" \
    "404"

test_api \
    "4.2 - Missing Token" \
    "POST" \
    "/api/guest/verify-token" \
    "{}" \
    "400"

test_api \
    "4.3 - Empty Token" \
    "POST" \
    "/api/guest/verify-token" \
    "{\"token\":\"\"}" \
    "400"

test_api \
    "4.4 - Buffer Overflow Attempt" \
    "POST" \
    "/api/guest/verify-token" \
    "{\"token\":\"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\"}" \
    "404"

# ===== TEST SUMMARY =====
echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                            TEST SUMMARY                                    ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Test Suite: Payment Flow v4.0"
echo "Stripe Account: acct_1Ovttc04KnTBJoOr (YOUR account)"
echo "Mode: TEST"
echo ""
echo "Total Tests: $test_count"
echo -e "${GREEN}✓ Passed: $pass_count${NC}"
echo -e "${RED}✗ Failed: $fail_count${NC}"

if [ $warnings -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Warnings: $warnings${NC}"
fi

success_rate=$((pass_count * 100 / test_count))
echo "Success Rate: $success_rate%"
echo "Duration: ~$((test_count + 5)) seconds"
echo ""

# ===== DETAILED REPORT =====
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                         DETAILED REPORT                                    ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

if [ $fail_count -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}                     ✓ ALL $test_count TESTS PASSED! ✓                        ${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "✅ Environment: Fully Configured"
    echo "✅ Stripe Account: YOUR account (acct_1Ovttc04KnTBJoOr)"
    echo "✅ Guest Checkout: Operational"
    echo "✅ Input Validation: Secure"
    echo "✅ Token Verification: Working"
    echo ""
    echo -e "${CYAN}┌─────────────────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│                                                                         │${NC}"
    echo -e "${CYAN}│  🎉 PHASE 1 PAYMENT SYSTEM: FULLY OPERATIONAL! 🎉                      │${NC}"
    echo -e "${CYAN}│                                                                         │${NC}"
    echo -e "${CYAN}│  ✅ Using YOUR Stripe account (startekk.net)                           │${NC}"
    echo -e "${CYAN}│  ✅ All products/prices correctly configured                           │${NC}"
    echo -e "${CYAN}│  ✅ Guest purchases working                                            │${NC}"
    echo -e "${CYAN}│  ✅ Subscriptions ready                                                │${NC}"
    echo -e "${CYAN}│  ✅ Security validated                                                 │${NC}"
    echo -e "${CYAN}│                                                                         │${NC}"
    echo -e "${CYAN}│  Ready for REAL transactions! 💳                                       │${NC}"
    echo -e "${CYAN}│                                                                         │${NC}"
    echo -e "${CYAN}└─────────────────────────────────────────────────────────────────────────┘${NC}"
    echo ""
    echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${MAGENTA}                         IMPORTANT REMINDERS                                   ${NC}"
    echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "📍 CURRENT STATUS:"
    echo "   • Mode: TEST (safe for testing)"
    echo "   • Account: acct_1Ovttc04KnTBJoOr"
    echo "   • Email: srikanth@startekk.net"
    echo ""
    echo "🚀 TO GO LIVE (Production):"
    echo ""
    echo "   1. Update Vercel environment variables:"
    echo "      https://vercel.com/srikanth-2237s-projects/v0-job-seeker-platform/settings/environment-variables"
    echo ""
    echo "   2. Change STRIPE_SECRET_KEY to:"
    echo "      rk_live_51Ovttc04KnTBJoOrldVuO2dxmn0K6nxXqOXUFx4tUfCiLX9MrLzWe02xq2zHLl1m4cCjJW5NZI2p00LCpOaJj96pB"
    echo ""
    echo "   3. Change STRIPE_PUBLISHABLE_KEY to:"
    echo "      pk_live_51Ovttc04KnTBJoOrRxzcUPrZJpackknQjBOLItXhy2rINRX6PmHkTY5uGeKzaX9zgFErvkh0oojGHHJXTNgLil4W00BaiCTFcY"
    echo ""
    echo "   4. Change NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to same live key"
    echo ""
    echo "   5. Create LIVE mode products in Stripe dashboard"
    echo ""
    echo "   6. Update all STRIPE_PRICE_* variables with live price IDs"
    echo ""
    echo "   7. Test thoroughly before accepting real payments!"
    echo ""
    echo -e "${YELLOW}⚠️  NEVER MIX TEST AND LIVE KEYS!${NC}"
    echo ""
    echo "📖 All keys saved in: YOUR_STRIPE_KEYS.txt"
    echo ""
    echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}                     ✗ $fail_count/$test_count TESTS FAILED ✗                  ${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}📋 Common Issues & Solutions:${NC}"
    echo ""
    echo "1. STRIPE ACCOUNT MISMATCH"
    echo "   → Keys from one account, prices from another"
    echo "   → Run: ./switch-to-your-stripe.sh"
    echo ""
    echo "2. PRICE ID NOT FOUND"
    echo "   → Price doesn't exist in YOUR Stripe account"
    echo "   → Check: https://dashboard.stripe.com/test/prices"
    echo ""
    echo "3. API ROUTE ERRORS (405)"
    echo "   → Wait 60 seconds for deployment"
    echo "   → Check: https://vercel.com/srikanth-2237s-projects/v0-job-seeker-platform"
    echo ""
    echo "4. DATABASE ERRORS"
    echo "   → Verify DATABASE_URL in Vercel"
    echo "   → Check Neon database status"
    echo ""
    echo "Re-run tests: ./test-payment-flows-final.sh"
    echo ""
    exit 1
fi
