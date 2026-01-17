import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    const purchases = await sql`
      SELECT 
        id,
        email,
        purchase_type,
        amount_paid,
        metadata,
        created_at
      FROM guest_purchases
      WHERE access_token = ${token}
      ORDER BY created_at DESC
    `;

    if (purchases.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      email: purchases[0].email,
      purchases: purchases.map(p => ({
        id: p.id,
        type: p.purchase_type,
        date: p.created_at,
        metadata: p.metadata,
      })),
    });

  } catch (error: any) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
