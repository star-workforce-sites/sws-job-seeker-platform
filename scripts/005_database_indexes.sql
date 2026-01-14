-- Performance indexes for job search and filtering
-- Compatible with existing UUID-based schema

-- Quoted isActive because PostgreSQL is case-sensitive
-- Index for active jobs filter (most common query)
CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs("isActive") WHERE "isActive" = true;

-- Full-text search index for title and description
CREATE INDEX IF NOT EXISTS idx_jobs_title_desc ON jobs USING gin(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '')));

-- Index for location filtering
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);

-- Index for employment type filtering
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON jobs("employmentType");

-- Index for sorting by created date (DESC must be outside quotes)
CREATE INDEX IF NOT EXISTS idx_jobs_created_date ON jobs("createdAt" DESC);

-- Quoted isActive in composite index and WHERE clause
-- Composite index for active jobs sorted by date
CREATE INDEX IF NOT EXISTS idx_jobs_active_created ON jobs("isActive", "createdAt" DESC) WHERE "isActive" = true;

-- Index for application lookups by user
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications("userId");

-- Index for application lookups by job
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications("jobId");

-- Composite index for user applications by date
CREATE INDEX IF NOT EXISTS idx_applications_user_date ON applications("userId", "appliedAt" DESC);

-- Index for application status filtering
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- Index for jobs by employer
CREATE INDEX IF NOT EXISTS idx_jobs_employer ON jobs("employerId");

-- Quoted isActive in composite employer index
-- Composite index for employer's active jobs
CREATE INDEX IF NOT EXISTS idx_jobs_employer_active ON jobs("employerId", "isActive") WHERE "isActive" = true;

-- Index for resume uploads by user
CREATE INDEX IF NOT EXISTS idx_resume_uploads_user ON resume_uploads("userId");

-- Index for resume uploads by email (for restore feature)
CREATE INDEX IF NOT EXISTS idx_resume_uploads_email ON resume_uploads(LOWER(TRIM(email)));

-- Index for premium access by email
CREATE INDEX IF NOT EXISTS idx_premium_access_email ON premium_access(LOWER(TRIM(email)));

-- Analyze tables to update query planner statistics
ANALYZE jobs;
ANALYZE applications;
ANALYZE users;
ANALYZE resume_uploads;
ANALYZE premium_access;
ANALYZE payments;
