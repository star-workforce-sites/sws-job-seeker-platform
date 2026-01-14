-- STAR Workforce Solutions Database Seed
-- Migration 002: Create default admin account for testing
-- Optional: Can be skipped in production

-- Insert admin user (email needs to be verified manually or via OAuth)
INSERT INTO users (name, email, "emailVerified", role, "atsPremium", "createdAt")
VALUES (
  'Admin User',
  'admin@starworkforcesolutions.com',
  NOW(),
  'admin',
  TRUE,
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Insert test job seeker
INSERT INTO users (name, email, "emailVerified", role, "atsPremium", "createdAt")
VALUES (
  'Test Job Seeker',
  'jobseeker@test.com',
  NOW(),
  'jobseeker',
  FALSE,
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Insert test employer
INSERT INTO users (name, email, "emailVerified", role, "atsPremium", "createdAt")
VALUES (
  'Test Employer',
  'employer@test.com',
  NOW(),
  'employer',
  FALSE,
  NOW()
)
ON CONFLICT (email) DO NOTHING;

COMMENT ON EXTENSION "uuid-ossp" IS 'UUID generation functions for primary keys';
