-- CHRM NEXUS Activity Events Table
-- Tracks recruiter and job seeker interactions with CHRM NEXUS jobs
-- Run this in Neon PostgreSQL console

CREATE TABLE IF NOT EXISTS chrm_activity_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('job_viewed', 'candidate_submitted', 'job_saved')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by job_id (hot jobs aggregation)
CREATE INDEX IF NOT EXISTS idx_chrm_activity_job_id ON chrm_activity_events (job_id);

-- Index for querying by user_id (user's saved/viewed jobs)
CREATE INDEX IF NOT EXISTS idx_chrm_activity_user_id ON chrm_activity_events (user_id);

-- Index for event type filtering
CREATE INDEX IF NOT EXISTS idx_chrm_activity_event_type ON chrm_activity_events (event_type);

-- Composite index for hot jobs query (job_viewed counts in last 7 days)
CREATE INDEX IF NOT EXISTS idx_chrm_activity_hot_jobs
  ON chrm_activity_events (event_type, created_at)
  WHERE event_type = 'job_viewed';
