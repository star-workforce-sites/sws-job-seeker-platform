-- Migration 010: Job Applications table for CHRM NEXUS direct apply flow
-- Replaces the "express interest → manual follow-up" pattern with a proper
-- captured application record including resume reference and employer routing.

CREATE TABLE IF NOT EXISTS job_applications (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id        TEXT        NOT NULL,           -- CHRM NEXUS job_id (TEXT, not UUID)
  job_title     TEXT        NOT NULL,
  company       TEXT,
  location      TEXT,
  work_model    TEXT,
  rate_info     TEXT,
  resume_id     UUID        REFERENCES resume_uploads(id) ON DELETE SET NULL,
  resume_name   TEXT,                           -- fileName snapshot (resume may expire)
  cover_note    TEXT,
  employer_email TEXT,                          -- present when CHRM API provides it
  status        TEXT        NOT NULL DEFAULT 'submitted'
                            CHECK (status IN ('submitted','forwarded','viewed','rejected','hired')),
  applied_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent duplicate applications for same user+job
CREATE UNIQUE INDEX IF NOT EXISTS idx_job_applications_user_job
  ON job_applications (user_id, job_id);

-- Fast lookup: all applications by a user
CREATE INDEX IF NOT EXISTS idx_job_applications_user
  ON job_applications (user_id, applied_at DESC);

-- Fast lookup: all applicants for a job (admin view)
CREATE INDEX IF NOT EXISTS idx_job_applications_job
  ON job_applications (job_id, applied_at DESC);

COMMENT ON TABLE job_applications IS
  'Tracks direct applications to CHRM NEXUS jobs — captures resume, cover note, '
  'employer routing, and status for each applicant.';
