-- STAR Workforce Solutions Database Schema
-- Migration 001: Initial Schema Setup
-- Creates: users, jobs, payments, resumes tables with proper constraints

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  "emailVerified" TIMESTAMP,
  role TEXT NOT NULL DEFAULT 'jobseeker' CHECK (role IN ('jobseeker', 'employer', 'employer-pending', 'admin')),
  "atsPremium" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "employerId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  industry TEXT NOT NULL,
  "employmentType" TEXT NOT NULL DEFAULT 'contract' CHECK ("employmentType" IN ('consulting', 'contract')),
  visa TEXT,
  "salaryMin" INTEGER,
  "salaryMax" INTEGER,
  "expiresAt" TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days'),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "isActive" BOOLEAN DEFAULT TRUE
);

-- Indexes for job queries
CREATE INDEX IF NOT EXISTS idx_jobs_employer ON jobs("employerId");
CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs("isActive") WHERE "isActive" = TRUE;
CREATE INDEX IF NOT EXISTS idx_jobs_industry ON jobs(industry);
CREATE INDEX IF NOT EXISTS idx_jobs_expires ON jobs("expiresAt");

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "stripeSessionId" TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  product TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Index on userId and stripeSessionId
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments("userId");
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session ON payments("stripeSessionId");

-- Resumes table (for audit trail)
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "fileUrl" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Index on userId
CREATE INDEX IF NOT EXISTS idx_resumes_user ON resumes("userId");

-- Function to auto-expire jobs after 30 days
CREATE OR REPLACE FUNCTION expire_old_jobs()
RETURNS void AS $$
BEGIN
  UPDATE jobs
  SET "isActive" = FALSE
  WHERE "expiresAt" < NOW() AND "isActive" = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to check employer job limit (max 5 active jobs)
CREATE OR REPLACE FUNCTION check_employer_job_limit()
RETURNS TRIGGER AS $$
DECLARE
  active_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO active_count
  FROM jobs
  WHERE "employerId" = NEW."employerId" AND "isActive" = TRUE;
  
  IF active_count >= 5 THEN
    RAISE EXCEPTION 'Employer cannot have more than 5 active jobs';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce job limit before insert
CREATE TRIGGER enforce_job_limit
  BEFORE INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION check_employer_job_limit();

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts for job seekers, employers, and admins';
COMMENT ON TABLE jobs IS 'Job postings by employers (max 5 active, auto-expire after 30 days)';
COMMENT ON TABLE payments IS 'Payment transactions processed via Stripe';
COMMENT ON TABLE resumes IS 'Resume file audit trail with Vercel Blob URLs';
