-- Add password reset token columns to users table
-- Safe to run multiple times (IF NOT EXISTS pattern)

ALTER TABLE users ADD COLUMN IF NOT EXISTS "resetToken" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP;

-- Index for fast token lookup during password reset
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users("resetToken") WHERE "resetToken" IS NOT NULL;
