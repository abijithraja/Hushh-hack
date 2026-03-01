-- ============================================================
-- Fix "Email not confirmed" / 400 Invalid credentials error
-- Run this in Supabase SQL Editor (kaicampus-gigs project)
-- ============================================================

-- Auto-confirm ALL existing unconfirmed users instantly
UPDATE auth.users
SET
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now()
WHERE email_confirmed_at IS NULL;

-- Done! All users are now confirmed.
-- Future signups: go to Supabase Dashboard → Authentication → Providers → Email
-- → turn OFF "Confirm email" for development/testing.
