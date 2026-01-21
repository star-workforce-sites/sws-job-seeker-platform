import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// Initialize Neon database
const sql = neon(process.env.DATABASE_URL!);

// Price IDs from environment variables
const SUBSCRIPTION_PRICES: Record<string, string | undefined> = {
  diy_premium: process.env.STRIPE_PRICE_DIY_PREMIUM,
  recruiter_basic: process.env.STRIPE_PRICE_RECRUITER_BASIC,
  recruiter_standard: process.env.STRIPE_PRICE_RECRUITER_STANDARD,
  recruiter_pro: process.env.STRIPE_PRICE_RECRUITER_PRO,
};

export async function POST(req: NextRequest) {
  console.log('[Checkout Subscription] POST request received');
  
  try {
    // Get session with authOptions for proper configuration
    const session = await getServerSession(authOptions);
    
    console.log('[Checkout Subscription] Session:', session ? 'Found' : 'Not found');
    console.log('[Checkout Subscription] User email:', session?.user?.email);

    if (!session?.user?.email) {
      console.log('[Checkout Subscription] No session or email - returning 401');
      return NextResponse.json(
        { error: 'Authentication required. Please sign in first.' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { subscriptionType } = body;
    
    console.log('[Checkout Subscription] Subscription type:', subscriptionType);

    // Validate subscription type
    if (!subscriptionType || !SUBSCRIPTION_PRICES[subscriptionType]) {
      console.log('[Checkout Subscription] Invalid subscription type');
      console.log('[Checkout Subscription] Available types:', Object.keys(SUBSCRIPTION_PRICES));
      return NextResponse.json(
        { error: 'Invalid subscription type', availableTypes: Object.keys(SUBSCRIPTION_PRICES) },
        { status: 400 }
      );
    }

    const priceId = SUBSCRIPTION_PRICES[subscriptionType];
    
    if (!priceId) {
      console.log('[Checkout Subscription] Price ID not configured for:', subscriptionType);
      return NextResponse.json(
        { error: `Price not configured for ${subscriptionType}. Please contact support.` },
        { status: 500 }
      );
    }

    console.log('[Checkout Subscription] Price ID:', priceId);

    // Get user from database
    const users = await sql`
      SELECT id, email, stripe_customer_id 
      FROM users 
      WHERE email = ${session.user.email}
      LIMIT 1
    `;

    console.log('[Checkout Subscription] Users found:', users.length);

    if (users.length === 0) {
      // User not in database - create them
      console.log('[Checkout Subscription] User not found in DB, creating...');
      
      const newUsers = await sql`
        INSERT INTO users (email, name, role, "createdAt")
        VALUES (${session.user.email}, ${session.user.name || ''}, 'jobseeker', NOW())
        RETURNING id, email, stripe_customer_id
      `;
      
      if (newUsers.length === 0) {
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        );
      }
      
      users.push(newUsers[0]);
      console.log('[Checkout Subscription] Created new user:', newUsers[0].id);
    }

    const user = users[0];
    let customerId = user.stripe_customer_id;

    // Create or get Stripe customer
    if (!customerId) {
      console.log('[Checkout Subscription] Creating Stripe customer...');
      
      const customer = await stripe.customers.create({
        email: user.email,
        name: session.user.name || undefined,
        metadata: {
          user_id: user.id,
        },
      });
      
      customerId = customer.id;
      console.log('[Checkout Subscription] Created Stripe customer:', customerId);

      // Update user with Stripe customer ID
      await sql`
        UPDATE users 
        SET stripe_customer_id = ${customerId}
        WHERE id = ${user.id}
      `;
    }

    // Create Stripe checkout session
    console.log('[Checkout Subscription] Creating checkout session...');
    
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://www.starworkforcesolutions.com';
    
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/hire-recruiter?canceled=true`,
      metadata: {
        user_id: user.id,
        subscription_type: subscriptionType,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          subscription_type: subscriptionType,
        },
      },
    });

    console.log('[Checkout Subscription] Checkout session created:', checkoutSession.id);
    console.log('[Checkout Subscription] Checkout URL:', checkoutSession.url);

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
    
  } catch (error: any) {
    console.error('[Checkout Subscription] Error:', error);
    console.error('[Checkout Subscription] Error message:', error.message);
    console.error('[Checkout Subscription] Error stack:', error.stack);
    
    // Return detailed error for debugging
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session', 
        details: error.message,
        type: error.type || 'unknown'
      },
      { status: 500 }
    );
  }
}

// Also handle GET requests with a helpful message
export async function GET() {
  return NextResponse.json(
    { 
      error: 'Method not allowed. Use POST to create a checkout session.',
      usage: 'POST /api/checkout/subscription with body: { subscriptionType: "recruiter_basic" | "recruiter_standard" | "recruiter_pro" | "diy_premium" }'
    },
    { status: 405 }
  );
}
