import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getDbUrl } from '@/lib/db';

const sql = neon(getDbUrl());

// ── Rate limiter: 10 attempts per IP per 15 minutes ──────────
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 10
const MAX_IP_ENTRIES = 5000
const tokenAttempts = new Map<string, number[]>()
let lastCleanup = Date.now()

function isTokenRateLimited(ip: string): boolean {
  const now = Date.now()
  if (now - lastCleanup > 300_000 || tokenAttempts.size > MAX_IP_ENTRIES) {
    for (const [key, timestamps] of tokenAttempts) {
      const valid = timestamps.filter(t => now - t < WINDOW_MS)
      if (valid.length === 0) tokenAttempts.delete(key)
      else tokenAttempts.set(key, valid)
    }
    lastCleanup = now
  }
  const timestamps = (tokenAttempts.get(ip) || []).filter(t => now - t < WINDOW_MS)
  if (timestamps.length >= MAX_ATTEMPTS) return true
  timestamps.push(now)
  tokenAttempts.set(ip, timestamps)
  return false
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (isTokenRateLimited(clientIp)) {
      return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
    }

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
