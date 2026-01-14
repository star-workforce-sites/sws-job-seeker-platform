-- Manual Premium Access Sync for srikanth@startekk.net
-- Run this if automatic restore continues to fail

-- Check if record already exists
SELECT * FROM premium_access WHERE email = 'srikanth@startekk.net';

-- If no record exists, manually insert
-- Replace 'cus_XXXXX' with actual Stripe customer ID from Stripe Dashboard
INSERT INTO premium_access (
  email, 
  "paidAt", 
  "stripeCustomerId",
  "stripeSessionId"
)
VALUES (
  'srikanth@startekk.net',
  NOW(),
  'cus_REPLACE_WITH_ACTUAL_CUSTOMER_ID',  -- Get from Stripe Dashboard
  NULL  -- Optional: add session ID if known
)
ON CONFLICT (email) DO NOTHING;

-- Verify the insert
SELECT * FROM premium_access WHERE email = 'srikanth@startekk.net';

-- Alternative: Update users table directly
UPDATE users 
SET "atsPremium" = true 
WHERE LOWER(TRIM(email)) = 'srikanth@startekk.net';

-- Verify user update
SELECT id, email, "atsPremium" FROM users WHERE LOWER(TRIM(email)) = 'srikanth@startekk.net';
