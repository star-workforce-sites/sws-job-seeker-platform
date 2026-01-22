import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// CRITICAL: Force Node.js runtime (required for @vercel/postgres)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/jobs/[id]
 * Retrieve a single job by ID
 * 
 * NEXT.JS 16 FIX: context.params is now a Promise and must be awaited
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // CRITICAL: Await params as required by Next.js 16
    const { id } = await context.params;
    
    console.log('[Job Detail API] Fetching job:', id);

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      console.error('[Job Detail API] Invalid UUID format:', id);
      return NextResponse.json(
        { error: 'Invalid job ID format' },
        { status: 400 }
      );
    }

    // Query database for single job
    const result = await sql`
      SELECT 
        id,
        "employerId",
        title,
        description,
        location,
        industry,
        "employmentType",
        visa,
        "salaryMin",
        "salaryMax",
        "expiresAt",
        "createdAt",
        "isActive"
      FROM jobs
      WHERE id = ${id}::uuid
        AND "isActive" = TRUE
        AND "expiresAt" > NOW()
      LIMIT 1
    `;

    console.log('[Job Detail API] Query executed, rows:', result.rowCount);

    if (result.rowCount === 0) {
      console.log('[Job Detail API] Job not found or expired:', id);
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    const job = result.rows[0];
    console.log('[Job Detail API] Job found:', job.title);

    return NextResponse.json({ job }, { status: 200 });

  } catch (error) {
    console.error('[Job Detail API] Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
