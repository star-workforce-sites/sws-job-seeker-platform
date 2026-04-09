-- Migration 011: User Profiles Table
-- Stores extended profile data for job seekers
-- Run in Neon console: https://console.neon.tech

CREATE TABLE IF NOT EXISTS user_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Contact
  phone         TEXT,
  linkedin_url  TEXT,
  location      TEXT,

  -- Work authorization
  work_auth     TEXT CHECK (work_auth IN (
    'us_citizen', 'green_card', 'h1b', 'h1b_transfer',
    'stem_opt', 'opt', 'ead', 'tn_visa', 'other'
  )),

  -- Job preferences
  target_titles     TEXT[],   -- e.g. ["Software Engineer", "Backend Developer"]
  target_locations  TEXT[],   -- e.g. ["Remote", "Dallas TX", "New York NY"]
  open_to_remote    BOOLEAN DEFAULT TRUE,
  open_to_contract  BOOLEAN DEFAULT TRUE,
  open_to_fulltime  BOOLEAN DEFAULT FALSE,
  min_rate_hourly   INTEGER,  -- minimum acceptable hourly rate

  -- Skills (flat tag list)
  skills        TEXT[],

  -- Resume text (pasted by user — stored for recruiter reference)
  resume_text   TEXT,

  -- Certifications / other notes
  certifications TEXT[],

  -- Timestamps
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One profile per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
