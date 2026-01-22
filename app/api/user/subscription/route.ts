import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@vercel/postgres';

// Force Node.js runtime for database connections
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Query active subscription
    const result = await sql`
      SELECT 
        subscription_type,
        status,
        current_period_end
      FROM subscriptions
      WHERE user_id = ${userId}
        AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({
        hasSubscription: false,
        subscriptionType: null,
        status: null
      });
    }

    const subscription = result.rows[0];

    return NextResponse.json({
      hasSubscription: true,
      subscriptionType: subscription.subscription_type,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end
    });

  } catch (error) {
    console.error('[Subscription API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
