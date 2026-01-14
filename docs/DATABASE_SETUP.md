# Database Setup Guide

## Vercel Postgres Configuration

STAR Workforce Solutions uses Vercel Postgres for the production database.

### 1. Create Vercel Postgres Database

1. Go to your Vercel project dashboard
2. Navigate to the **Storage** tab
3. Click **Create Database** → Select **Postgres**
4. Name it: `star-workforce-db`
5. Select a region close to your users (recommend US East or US West)

### 2. Environment Variables

After creating the database, Vercel automatically adds these environment variables:

\`\`\`
POSTGRES_URL
POSTGRES_PRISMA_URL
POSTGRES_URL_NON_POOLING
POSTGRES_USER
POSTGRES_HOST
POSTGRES_PASSWORD
POSTGRES_DATABASE
\`\`\`

These are automatically available in your Next.js app.

### 3. Run Database Migrations

The SQL migration scripts are located in `/scripts/`:

- `001_init_schema.sql` - Creates all tables, indexes, and functions
- `002_seed_admin.sql` - Creates test accounts (optional)

#### Option A: Run via Vercel Postgres Dashboard

1. Go to Vercel Dashboard → Storage → Your Database
2. Click on **Query** tab
3. Copy and paste the contents of `001_init_schema.sql`
4. Click **Run Query**
5. Repeat for `002_seed_admin.sql` (if you want test accounts)

#### Option B: Run via CLI (requires psql)

\`\`\`bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Pull environment variables
vercel env pull .env.local

# Run migrations using psql
psql $POSTGRES_URL_NON_POOLING -f scripts/001_init_schema.sql
psql $POSTGRES_URL_NON_POOLING -f scripts/002_seed_admin.sql
\`\`\`

### 4. Database Schema

**Users Table:**
- `id` (UUID, PK)
- `name` (TEXT, nullable)
- `email` (TEXT, unique, required)
- `emailVerified` (TIMESTAMP, nullable)
- `role` (TEXT: jobseeker, employer, employer-pending, admin)
- `atsPremium` (BOOLEAN, default false)
- `createdAt` (TIMESTAMP, default now())

**Jobs Table:**
- `id` (UUID, PK)
- `employerId` (UUID, FK → users)
- `title`, `description`, `location`, `industry` (TEXT)
- `employmentType` (TEXT: consulting or contract only)
- `visa` (TEXT, optional)
- `salaryMin`, `salaryMax` (INTEGER, optional)
- `expiresAt` (TIMESTAMP, default now() + 30 days)
- `createdAt` (TIMESTAMP)
- `isActive` (BOOLEAN, default true)

**Constraints:**
- Max 5 active jobs per employer (enforced via trigger)
- Jobs auto-expire after 30 days

**Payments Table:**
- `id` (UUID, PK)
- `userId` (UUID, FK → users)
- `stripeSessionId` (TEXT, unique)
- `amount` (INTEGER, cents)
- `product` (TEXT)
- `createdAt` (TIMESTAMP)

**Resumes Table:**
- `id` (UUID, PK)
- `userId` (UUID, FK → users)
- `fileUrl` (TEXT, Vercel Blob URL)
- `createdAt` (TIMESTAMP)

### 5. Database Functions

**Auto-expire jobs:**
\`\`\`sql
SELECT expire_old_jobs();
\`\`\`

This function sets `isActive = FALSE` for jobs where `expiresAt < NOW()`.

You can set up a cron job to run this daily via Vercel Cron Jobs:

\`\`\`javascript
// app/api/cron/expire-jobs/route.ts
import { expireOldJobs } from '@/lib/db';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  await expireOldJobs();
  return Response.json({ success: true });
}
\`\`\`

Add to `vercel.json`:
\`\`\`json
{
  "crons": [{
    "path": "/api/cron/expire-jobs",
    "schedule": "0 0 * * *"
  }]
}
\`\`\`

### 6. Test Database Connection

Run this API route to test connection:

\`\`\`bash
curl https://your-site.vercel.app/api/health
\`\`\`

Should return database status.

### 7. Backup & Recovery

Vercel Postgres includes automatic backups. Access them via:

1. Vercel Dashboard → Storage → Your Database
2. **Backups** tab
3. Restore to a point in time if needed

---

## Local Development

For local development without Vercel Postgres:

1. Install PostgreSQL locally
2. Create a database: `createdb star_workforce_local`
3. Set `POSTGRES_URL` in `.env.local`:
   \`\`\`
   POSTGRES_URL=postgresql://username:password@localhost:5432/star_workforce_local
   \`\`\`
4. Run migrations as shown above

---

## Troubleshooting

**Error: "uuid-ossp extension not found"**
- The extension should be automatically available in Vercel Postgres
- If not, contact Vercel support

**Error: "Too many connections"**
- Use `POSTGRES_URL` (pooled connection) instead of `POSTGRES_URL_NON_POOLING`
- The `@vercel/postgres` package handles connection pooling automatically

**Trigger not firing for job limit**
- Check that the trigger was created: `\dt` in psql
- Verify with: `SELECT * FROM pg_trigger WHERE tgname = 'enforce_job_limit';`
