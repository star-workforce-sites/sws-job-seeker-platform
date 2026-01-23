import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/applications
 * Get user's job applications
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user ID from database using email
    const userResult = await sql`
      SELECT id FROM users 
      WHERE LOWER(email) = LOWER(${session.user.email}) 
      LIMIT 1
    `;

    if (userResult.rowCount === 0) {
      return NextResponse.json(
        { applications: [], count: 0 },
        { status: 200 }
      );
    }

    const userId = userResult.rows[0].id;

    // Get applications with job details
    const result = await sql`
      SELECT 
        a.id,
        a."jobId" as job_id,
        a.status,
        a."appliedAt" as applied_at,
        j.title as job_title,
        j.company,
        j.location
      FROM applications a
      JOIN jobs j ON a."jobId" = j.id
      WHERE a."userId" = ${userId}
      ORDER BY a."appliedAt" DESC
    `;

    return NextResponse.json(
      {
        applications: result.rows,
        count: result.rowCount || 0
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Applications API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch applications',
        applications: [],
        count: 0
      },
      { status: 500 }
    );
  }
}
