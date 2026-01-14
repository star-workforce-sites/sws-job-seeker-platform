-- ATS Optimizer Enhancements
-- Migration 003: Add resume_uploads and premium_access tables

-- Resume uploads table for persistent storage
CREATE TABLE IF NOT EXISTS resume_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT, -- For guest users who haven't signed up yet
  "fileName" TEXT NOT NULL,
  "fileContent" TEXT NOT NULL, -- Base64 encoded file content
  "fileType" TEXT NOT NULL,
  "uploadedAt" TIMESTAMP DEFAULT NOW(),
  "expiresAt" TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days'),
  "analysisCache" JSONB -- Store parsed analysis to avoid reprocessing
);

-- Index for fast lookups by resumeId
CREATE INDEX IF NOT EXISTS idx_resume_uploads_id ON resume_uploads(id);
CREATE INDEX IF NOT EXISTS idx_resume_uploads_user ON resume_uploads("userId");
CREATE INDEX IF NOT EXISTS idx_resume_uploads_email ON resume_uploads(email);
CREATE INDEX IF NOT EXISTS idx_resume_uploads_expires ON resume_uploads("expiresAt");

-- Premium access table for persistent $5 unlock
CREATE TABLE IF NOT EXISTS premium_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  "stripeCustomerId" TEXT,
  "stripeSessionId" TEXT,
  "paidAt" TIMESTAMP DEFAULT NOW(),
  "expiresAt" TIMESTAMP, -- NULL means permanent access
  "resumeId" UUID REFERENCES resume_uploads(id) ON DELETE SET NULL
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_premium_access_email ON premium_access(email);

-- Update users table to add atsPremium if not exists (idempotent)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='atsPremium') THEN
    ALTER TABLE users ADD COLUMN "atsPremium" BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

COMMENT ON TABLE resume_uploads IS 'Temporary storage for uploaded resumes (30 day expiration)';
COMMENT ON TABLE premium_access IS 'Premium ATS access tracking ($5 one-time unlock, permanent)';
