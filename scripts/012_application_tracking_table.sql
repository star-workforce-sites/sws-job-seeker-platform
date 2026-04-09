-- Migration 012: Application Tracking table for recruiter-logged job submissions
-- Tracks every application a recruiter logs on behalf of a job seeker client.
-- This is the primary data source for the job seeker submissions history view.
-- DOL-compliant status values enforced via CHECK constraint.
--
-- Run this in Neon console: SQL Editor → paste → Run
-- If the table already exists (created ad hoc), this is a no-op due to IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS application_tracking (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id    UUID        NOT NULL REFERENCES recruiter_assignments(id) ON DELETE CASCADE,
  client_id        UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recruiter_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_title        TEXT        NOT NULL,
  company_name     TEXT        NOT NULL,
  job_url          TEXT,
  job_description  TEXT,
  application_date DATE,
  submitted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status           TEXT        NOT NULL DEFAULT 'submitted'
                   CHECK (status IN (
                     'submitted',
                     'confirmed',
                     'under_review',
                     'screening_scheduled',
                     'screening_completed',
                     'interview_scheduled',
                     'interview_completed',
                     'second_interview_scheduled',
                     'assessment_scheduled',
                     'assessment_completed',
                     'references_requested',
                     'not_selected',
                     'no_response',
                     'position_closed',
                     'application_withdrawn'
                   )),
  notes            TEXT,
  feedback_received BOOLEAN    NOT NULL DEFAULT FALSE,
  feedback_date    TIMESTAMPTZ,
  feedback_notes   TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast lookup: all submissions for a job seeker (dashboard view)
CREATE INDEX IF NOT EXISTS idx_app_tracking_client_id
  ON application_tracking (client_id, submitted_at DESC);

-- Fast lookup: all submissions by a recruiter
CREATE INDEX IF NOT EXISTS idx_app_tracking_recruiter_id
  ON application_tracking (recruiter_id, submitted_at DESC);

-- Fast lookup: all submissions under a specific assignment
CREATE INDEX IF NOT EXISTS idx_app_tracking_assignment_id
  ON application_tracking (assignment_id, submitted_at DESC);

-- Status filter (for reporting / admin views)
CREATE INDEX IF NOT EXISTS idx_app_tracking_status
  ON application_tracking (status);

COMMENT ON TABLE application_tracking IS
  'Recruiter-logged job applications submitted on behalf of job seeker clients. '
  'Status values are DOL-compliant. Visible to job seekers on their dashboard.';
