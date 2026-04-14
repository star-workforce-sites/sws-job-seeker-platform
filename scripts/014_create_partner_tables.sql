-- ============================================================
-- Partner Program Tables
-- Career Accel Platform — STAR Workforce Solutions
-- ============================================================

-- Partners table: stores both Affiliate (10%) and Sales (50% net) partners
CREATE TABLE IF NOT EXISTS partners (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES users(id),              -- linked user account (nullable until they create one)
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT,
  referral_code TEXT NOT NULL UNIQUE,                    -- e.g. "john", "acme-recruiting"
  tier          TEXT NOT NULL DEFAULT 'affiliate'        -- 'affiliate' or 'sales'
    CHECK (tier IN ('affiliate', 'sales')),
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00,  -- percentage: 10 for affiliate, 50 for sales
  status        TEXT NOT NULL DEFAULT 'pending'          -- 'pending', 'active', 'suspended', 'terminated'
    CHECK (status IN ('pending', 'active', 'suspended', 'terminated')),
  overhead_pct  NUMERIC(5,2) DEFAULT 0,                 -- fixed overhead % deducted before sales partner split
  landing_headline TEXT,                                 -- custom headline for their landing page
  landing_bio   TEXT,                                    -- custom bio/description for landing page
  landing_image TEXT,                                    -- URL to partner profile image
  notes         TEXT,                                    -- admin notes
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_partners_referral_code ON partners(referral_code);
CREATE INDEX IF NOT EXISTS idx_partners_user_id ON partners(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);

-- Referrals table: tracks which job seekers came from which partner
CREATE TABLE IF NOT EXISTS partner_referrals (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id    UUID NOT NULL REFERENCES partners(id),
  user_id       UUID NOT NULL REFERENCES users(id),     -- the referred job seeker
  referral_code TEXT NOT NULL,                           -- snapshot of the code used
  source        TEXT DEFAULT 'landing_page',             -- 'landing_page', 'direct_link', 'manual'
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_partner_referrals_user ON partner_referrals(user_id);  -- one partner per user
CREATE INDEX IF NOT EXISTS idx_partner_referrals_partner ON partner_referrals(partner_id);

-- Commissions table: logs every commission event
CREATE TABLE IF NOT EXISTS partner_commissions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id      UUID NOT NULL REFERENCES partners(id),
  referral_id     UUID REFERENCES partner_referrals(id),
  user_id         UUID NOT NULL,                         -- the job seeker who paid
  transaction_type TEXT NOT NULL,                         -- 'one_time' or 'subscription'
  product         TEXT NOT NULL,                          -- e.g. 'ATS_OPTIMIZER', 'recruiter_basic'
  gross_amount    NUMERIC(10,2) NOT NULL,                 -- total payment amount
  stripe_fee      NUMERIC(10,2) DEFAULT 0,                -- Stripe processing fee
  overhead_amount NUMERIC(10,2) DEFAULT 0,                -- recruiter costs + platform overhead
  net_amount      NUMERIC(10,2) NOT NULL,                 -- gross - stripe_fee - overhead
  commission_rate NUMERIC(5,2) NOT NULL,                  -- rate at time of transaction
  commission_amount NUMERIC(10,2) NOT NULL,               -- actual commission earned
  status          TEXT NOT NULL DEFAULT 'pending'          -- 'pending', 'approved', 'paid', 'rejected'
    CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  stripe_session_id TEXT,
  approved_at     TIMESTAMPTZ,
  paid_at         TIMESTAMPTZ,
  admin_notes     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_commissions_partner ON partner_commissions(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_status ON partner_commissions(status);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_created ON partner_commissions(created_at);

-- Add referral_code column to users table for quick lookups
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by TEXT;
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by) WHERE referred_by IS NOT NULL;
