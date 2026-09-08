-- Tracks every recruiter-blast attempt (success or failure) so a payment
-- that arrives before the candidate's email has been manually added as a
-- Mailercloud Reply ID can be retried later instead of silently failing.
CREATE TABLE IF NOT EXISTS recruiter_blast_log (
  id SERIAL PRIMARY KEY,
  stripe_session_id TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  target_roles TEXT,
  target_locations TEXT,
  industry TEXT,
  experience TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'sent' | 'failed_reply_id' | 'failed_other'
  error_message TEXT,
  campaign_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_recruiter_blast_log_status ON recruiter_blast_log (status);
