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
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log('[Subscription API] Session:', session ? 'Found' : 'Not found');

    if (!session?.user?.email) {
      console.log('[Subscription API] No authenticated user');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;
    console.log('[Subscription API] User email:', userEmail);

    // Get user ID from email
    const userResult = await sql`
      SELECT id FROM users WHERE email = ${userEmail} LIMIT 1
    `;

    if (userResult.rowCount === 0) {
      console.log('[Subscription API] User not found in database:', userEmail);
      return NextResponse.json(
        { subscription: null, plan: 'Free' },
        { status: 200 }
      );
    }

    const userId = userResult.rows[0].id;
    console.log('[Subscription API] User ID:', userId);

    // Query for active subscription
    const subResult = await sql`
      SELECT 
        id,
        subscription_type,
        status,
        current_period_end,
        created_at
      FROM subscriptions
      WHERE user_id = ${userId}::uuid
        AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    console.log('[Subscription API] Query result:', {
      rowCount: subResult.rowCount,
      hasSubscription: subResult.rowCount > 0
    });

    if (subResult.rowCount === 0) {
      console.log('[Subscription API] No active subscription found');
      return NextResponse.json(
        { subscription: null, plan: 'Free' },
        { status: 200 }
      );
    }

    const subscription = subResult.rows[0];
    
    // Map subscription_type to display name
    const planMapping: Record<string, string> = {
      'recruiter_basic': 'Recruiter Basic',
      'recruiter_standard': 'Recruiter Standard',
      'recruiter_pro': 'Recruiter Pro',
      'diy_premium': 'DIY Premium'
    };

    const planName = planMapping[subscription.subscription_type] || subscription.subscription_type;

    console.log('[Subscription API] Returning subscription:', {
      type: subscription.subscription_type,
      planName,
      status: subscription.status
    });

    return NextResponse.json(
      {
        subscription: {
          ...subscription,
          planName
        },
        plan: planName
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Subscription API] Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
