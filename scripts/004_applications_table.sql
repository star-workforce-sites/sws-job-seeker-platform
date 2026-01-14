-- Create applications table to track job applications
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "jobId" UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'applied', -- applied, interviewing, rejected, accepted
  "appliedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  UNIQUE("userId", "jobId") -- Prevent duplicate applications
);

-- Index for user's applications
CREATE INDEX IF NOT EXISTS idx_applications_user ON applications("userId", "appliedAt" DESC);

-- Index for job's applicants
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications("jobId");

-- Create daily application limit tracking
CREATE TABLE IF NOT EXISTS application_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  UNIQUE("userId", date)
);

-- Index for daily limit checks
CREATE INDEX IF NOT EXISTS idx_application_limits_user_date ON application_limits("userId", date);

-- Function to auto-update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
