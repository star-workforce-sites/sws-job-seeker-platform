-- Migration: Add suspended column to users table
-- Run this in the Neon console BEFORE deploying the admin dashboard update.
-- This enables admin suspend/unsuspend functionality for both job seekers and recruiters.

ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_reason TEXT;

-- Index for quick lookups of suspended users
CREATE INDEX IF NOT EXISTS idx_users_suspended ON users (suspended) WHERE suspended = true;

-- Verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name IN ('suspended', 'suspended_at', 'suspended_reason');
