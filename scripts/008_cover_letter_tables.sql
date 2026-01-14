-- Create cover_letter_uploads table
CREATE TABLE IF NOT EXISTS cover_letter_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255),
  resume_url TEXT NOT NULL,
  resume_filename VARCHAR(500) NOT NULL,
  job_description TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  generated_cover_letter TEXT,
  tone_score INTEGER
);

-- Update premium_access table to support multiple products
ALTER TABLE premium_access 
ADD COLUMN IF NOT EXISTS product VARCHAR(50) DEFAULT 'ATS_OPTIMIZER';

-- Add unique constraint for email + product combination
ALTER TABLE premium_access 
DROP CONSTRAINT IF EXISTS premium_access_email_key;

ALTER TABLE premium_access 
ADD CONSTRAINT premium_access_email_product_key UNIQUE (email, product);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cover_letter_email ON cover_letter_uploads(email);
CREATE INDEX IF NOT EXISTS idx_premium_access_product ON premium_access(product);
