import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const sql = neon(process.env.DATABASE_URL!);

const GUEST_PURCHASE_TYPES = {
  ats_optimizer: {
    priceId: process.env.STRIPE_PRICE_ATS_OPTIMIZER!,
    name: 'ATS Optimizer',
    amount: 500,
  },
  cover_letter: {
    priceId: process.env.STRIPE_PRICE_COVER_LETTER!,
    name: 'Cover Letter Generator',
    amount: 500,
  },
  resume_distribution: {
    priceId: process.env.STRIPE_PRICE_RESUME_DISTRIBUTION!,
    name: 'Resume Distribution',
    amount: 14900,
  },
} as const;

type GuestPurchaseType = keyof typeof GUEST_PURCHASE_TYPES;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, purchaseType, metadata } = body;

    if (!email || !purchaseType) {
      return NextResponse.json(
        { error: 'Email and purchase type are required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!GUEST_PURCHASE_TYPES[purchaseType as GuestPurchaseType]) {
      return NextResponse.json(
        { error: 'Invalid purchase type' },
        { status: 400 }
      );
    }

    const purchaseInfo = GUEST_PURCHASE_TYPES[purchaseType as GuestPurchaseType];

    const existingPurchase = await sql`
      SELECT id FROM guest_purchases 
      WHERE email = ${email} 
      AND purchase_type = ${purchaseType}
      AND created_at > NOW() - INTERVAL '1 year'
      LIMIT 1
    `;

    if (existingPurchase.length > 0) {
      return NextResponse.json(
        { 
          error: 'You already have access to this service',
          existingPurchase: true,
        },
        { status: 400 }
      );
    }

    // FIX: Only use customer_email, not both customer and customer_email
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: purchaseInfo.priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&guest=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/payment/canceled`,
      customer_email: email,
      metadata: {
        email: email,
        purchase_type: purchaseType,
        user_type: 'guest',
        ...metadata,
      },
      payment_intent_data: {
        metadata: {
          email: email,
          purchase_type: purchaseType,
          user_type: 'guest',
        },
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error: any) {
    console.error('Error creating guest checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error.message },
      { status: 500 }
    );
  }
}
