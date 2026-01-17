import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { neon } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const sql = neon(process.env.DATABASE_URL!);

const SUBSCRIPTION_PRICES: Record<string, string> = {
  diy_premium: process.env.STRIPE_PRICE_DIY_PREMIUM!,
  recruiter_basic: process.env.STRIPE_PRICE_RECRUITER_BASIC!,
  recruiter_standard: process.env.STRIPE_PRICE_RECRUITER_STANDARD!,
  recruiter_pro: process.env.STRIPE_PRICE_RECRUITER_PRO!,
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { subscriptionType } = await req.json();
    
    if (!SUBSCRIPTION_PRICES[subscriptionType]) {
      return NextResponse.json(
        { error: 'Invalid subscription type' },
        { status: 400 }
      );
    }

    const users = await sql`
      SELECT id, email, stripe_customer_id 
      FROM users 
      WHERE email = ${session.user.email}
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];
    let customerId = user.stripe_customer_id;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
      
      await sql`
        UPDATE users 
        SET stripe_customer_id = ${customerId}
        WHERE id = ${user.id}
      `;
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: SUBSCRIPTION_PRICES[subscriptionType],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/hire-recruiter`,
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

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });

  } catch (error: any) {
    console.error('Subscription checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error.message },
      { status: 500 }
    );
  }
}
