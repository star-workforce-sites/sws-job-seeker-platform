#!/bin/bash
################################################################################
# STRIPE ACCOUNT VERIFICATION & PRODUCT SYNC
# Verifies which Stripe account is active and syncs products
################################################################################

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║              STRIPE ACCOUNT VERIFICATION & SYNC                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

cd ~/projects/sws-job-seeker-platform

echo "🔍 Analyzing your Stripe configuration..."
echo ""

# Pull current environment variables
vercel env pull .env.local

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Current Stripe Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Extract and display Stripe info
SECRET_KEY=$(cat .env.local | grep "^STRIPE_SECRET_KEY=" | cut -d'"' -f2)
PUBLISHABLE_KEY=$(cat .env.local | grep "^STRIPE_PUBLISHABLE_KEY=" | cut -d'"' -f2)

# Detect account from key prefix
ACCOUNT_ID=$(echo $SECRET_KEY | cut -d'_' -f3)

echo "🔑 Stripe Account: acct_$ACCOUNT_ID"
echo "📊 Mode: TEST (sk_test_...)"
echo ""

# Check if this matches product IDs
echo "Checking product/price IDs..."
ATS_PRICE=$(cat .env.local | grep "^STRIPE_PRICE_ATS_OPTIMIZER=" | cut -d'"' -f2)
COVER_PRICE=$(cat .env.local | grep "^STRIPE_PRICE_COVER_LETTER=" | cut -d'"' -f2)

echo "  ATS Price: $ATS_PRICE"
echo "  Cover Price: $COVER_PRICE"
echo ""

# Verify with Stripe CLI
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Verifying Products in Stripe"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# List all products
echo "📦 Your Stripe Products:"
stripe products list --limit 10

echo ""
echo "💰 Your Stripe Prices:"
stripe prices list --limit 20

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Analysis Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if price IDs match account
if echo $ATS_PRICE | grep -q "^price_"; then
    # Extract account from price ID pattern
    PRICE_ACCOUNT=$(echo $ATS_PRICE | cut -d'_' -f3 | head -c 8)
    
    if [[ $ACCOUNT_ID == $PRICE_ACCOUNT* ]]; then
        echo "✅ Product IDs match your Stripe account!"
        echo ""
        echo "🎯 You're ready to test!"
        echo ""
        echo "Run: ./test-payment-flows-v3.sh"
    else
        echo "⚠️  MISMATCH DETECTED!"
        echo ""
        echo "Your Stripe keys are from account: acct_$ACCOUNT_ID"
        echo "But your product IDs appear to be from a different account"
        echo ""
        echo "🔧 SOLUTION:"
        echo ""
        echo "Option 1: Use products from the CURRENT Stripe account (acct_$ACCOUNT_ID)"
        echo "  → Check which products exist in your Stripe dashboard"
        echo "  → Update product/price IDs in Vercel to match"
        echo ""
        echo "Option 2: Create new products in THIS account"
        echo "  → We'll create them using Stripe CLI"
        echo "  → Update environment variables"
        echo ""
        echo "Which option? (1 or 2):"
        read choice
        
        if [ "$choice" = "2" ]; then
            echo ""
            echo "Creating products in account acct_$ACCOUNT_ID..."
            echo ""
            
            # Create products
            ./create-stripe-products.sh
        else
            echo ""
            echo "Please check your Stripe dashboard at:"
            echo "https://dashboard.stripe.com/test/products"
            echo ""
            echo "Find your product IDs and update these in Vercel:"
            echo "  - STRIPE_PRODUCT_ATS_OPTIMIZER"
            echo "  - STRIPE_PRICE_ATS_OPTIMIZER"
            echo "  - (etc. for all 7 products)"
        fi
    fi
else
    echo "⚠️  No product IDs found in environment variables!"
    echo ""
    echo "Would you like to create products now? (y/n)"
    read create
    
    if [ "$create" = "y" ]; then
        ./create-stripe-products.sh
    fi
fi

echo ""
echo "📁 Key information saved to: STRIPE_ACCOUNT_INFO.txt"

# Save account info
cat > STRIPE_ACCOUNT_INFO.txt << EOF
Stripe Account Information
==========================

Account ID: acct_$ACCOUNT_ID
Mode: TEST
Keys Managed By: Vercel Integration

Secret Key: ${SECRET_KEY:0:20}...
Publishable Key: ${PUBLISHABLE_KEY:0:20}...

Products Status: Check Stripe dashboard
Dashboard: https://dashboard.stripe.com/test/products

Last Verified: $(date)
EOF

echo ""
echo "✅ Verification complete!"
echo ""
