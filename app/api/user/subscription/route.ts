import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { sql } from '@vercel/postgres';
import { authOptions } from '@/lib/auth';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/user/subscription
 * Get current user's subscription status
 * 
 * CRITICAL FIXES:
 * 1. Case-insensitive email comparison (LOWER function)
 * 2. Explicit status check for 'active' (lowercase)
 * 3. Comprehensive logging at every step
 * 4. Fallback plan names
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated session
    const session = await getServerSession(authOptions);

    console.log('[Subscription API] Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasEmail: !!session?.user?.email
    });

    if (!session?.user?.email) {
      console.log('[Subscription API] No authenticated user');
      return NextResponse.json(
        { 
          subscription: null, 
          plan: 'Free',
          message: 'Not authenticated'
        },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;
    console.log('[Subscription API] User email from session:', userEmail);

    // CRITICAL FIX #1: Case-insensitive email lookup
    const userResult = await sql`
      SELECT id, email 
      FROM users 
      WHERE LOWER(email) = LOWER(${userEmail}) 
      LIMIT 1
    `;

    console.log('[Subscription API] User lookup result:', {
      rowCount: userResult.rowCount,
      found: userResult.rowCount > 0,
      searchedEmail: userEmail
    });

    if (userResult.rowCount === 0) {
      console.log('[Subscription API] User not found in database');
      return NextResponse.json(
        { 
          subscription: null, 
          plan: 'Free',
          message: 'User not found in database'
        },
        { status: 200 }
      );
    }

    const userId = userResult.rows[0].id;
    const dbEmail = userResult.rows[0].email;
    
    console.log('[Subscription API] User found:', {
      userId,
      sessionEmail: userEmail,
      dbEmail,
      emailsMatch: userEmail.toLowerCase() === dbEmail.toLowerCase()
    });

    // CRITICAL FIX #2: Explicit lowercase 'active' check
    const subResult = await sql`
      SELECT 
        id,
        subscription_type,
        status,
        stripe_customer_id,
        stripe_subscription_id,
        stripe_price_id,
        current_period_end,
        created_at
      FROM subscriptions
      WHERE user_id = ${userId}::uuid
        AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    console.log('[Subscription API] Subscription lookup result:', {
      rowCount: subResult.rowCount,
      hasSubscription: subResult.rowCount > 0,
      userId
    });

    if (subResult.rowCount === 0) {
      console.log('[Subscription API] No active subscription found');
      return NextResponse.json(
        { 
          subscription: null, 
          plan: 'Free',
          message: 'No active subscription'
        },
        { status: 200 }
      );
    }

    const subscription = subResult.rows[0];
    
    // CRITICAL FIX #3: Comprehensive plan name mapping with fallback
    const planMapping: Record<string, string> = {
      'recruiter_basic': 'Recruiter Basic',
      'recruiter_standard': 'Recruiter Standard',
      'recruiter_pro': 'Recruiter Pro',
      'diy_premium': 'DIY Premium'
    };

    const planName = planMapping[subscription.subscription_type] || 
                     subscription.subscription_type.replace(/_/g, ' ')
                       .split(' ')
                       .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                       .join(' ');

    console.log('[Subscription API] Returning subscription:', {
      subscriptionId: subscription.id,
      type: subscription.subscription_type,
      status: subscription.status,
      planName,
      currentPeriodEnd: subscription.current_period_end,
      stripeCustomerId: subscription.stripe_customer_id,
      stripeSubscriptionId: subscription.stripe_subscription_id
    });

    return NextResponse.json(
      {
        subscription: {
          id: subscription.id,
          subscription_type: subscription.subscription_type,
          status: subscription.status,
          stripe_customer_id: subscription.stripe_customer_id,
          stripe_subscription_id: subscription.stripe_subscription_id,
          stripe_price_id: subscription.stripe_price_id,
          current_period_end: subscription.current_period_end,
          created_at: subscription.created_at,
          planName
        },
        plan: planName,
        message: 'Subscription found'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Subscription API] Error:', error);
    console.error('[Subscription API] Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      { 
        subscription: null,
        plan: 'Free',
        error: 'Failed to fetch subscription',
        details: error instanceof Error ? error.message : 'Unknown error',
        message: 'Error occurred'
      },
      { status: 500 }
    );
  }
}
