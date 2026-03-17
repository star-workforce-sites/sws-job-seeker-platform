-- Add priceId column to premium_access table to track which Stripe price was used
ALTER TABLE premium_access
ADD COLUMN IF NOT EXISTS "priceId" VARCHAR(100);

-- Create index for priceId lookups
CREATE INDEX IF NOT EXISTS idx_premium_access_price_id ON premium_access("priceId");

-- Create composite index for email + product lookups
CREATE INDEX IF NOT EXISTS idx_premium_access_email_product ON premium_access(LOWER(TRIM(email)), product);

-- Ensure unique constraint on email + product (idempotent)
ALTER TABLE premium_access
DROP CONSTRAINT IF EXISTS premium_access_email_product_key;

ALTER TABLE premium_access
ADD CONSTRAINT premium_access_email_product_key UNIQUE (email, product);

-- Update existing records to have the appropriate priceId based on product
-- For existing ATS records, use the ATS Optimizer price ID
UPDATE premium_access
SET "priceId" = (
  CASE
    WHEN product = 'ATS_OPTIMIZER' THEN 'price_1QX4ZZAYZ2kMqXx5XwxwxwxX'  -- Placeholder, will be env var
    WHEN product = 'COVER_LETTER' THEN 'price_1QX4ZZAYZ2kMqXx5XwxwxwxY'  -- Placeholder, will be env var
    WHEN product = 'interview-prep' THEN 'price_1QX4ZZAYZ2kMqXx5XwxwxwxZ'  -- Placeholder, will be env var
  END
)
WHERE "priceId" IS NULL;

COMMENT ON COLUMN premium_access."priceId" IS 'Stripe price ID used for this purchase (tracks $5 vs $9 vs bundle pricing)';
