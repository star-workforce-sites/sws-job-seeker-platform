-- Create saved_jobs table for job bookmarking feature
-- Using UUID types to match existing schema

CREATE TABLE IF NOT EXISTS saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "jobId" UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  "savedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("userId", "jobId")
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON saved_jobs("userId");

-- Index for fast job lookups
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job ON saved_jobs("jobId");

-- Composite index for user's saved jobs ordered by date
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_date ON saved_jobs("userId", "savedAt" DESC);

COMMENT ON TABLE saved_jobs IS 'Stores user-saved/bookmarked jobs';

-- Analyze the new table
ANALYZE saved_jobs;
