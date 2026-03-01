-- ============================================
-- SkillGig COMPLETE Database Setup
-- Run this once in Supabase SQL Editor
-- ============================================

-- ============================================
-- Drop ALL triggers on auth.users (any name)
-- This fixes "Database error saving new user"
-- ============================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT trigger_name
    FROM information_schema.triggers
    WHERE event_object_schema = 'auth'
      AND event_object_table = 'users'
  LOOP
    EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) || ' ON auth.users';
  END LOOP;
END $$;

-- Drop known trigger functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_updated() CASCADE;

-- Auto-confirm any unconfirmed users (fixes 400 Invalid credentials)
UPDATE auth.users
SET
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now()
WHERE email_confirmed_at IS NULL;

-- 1. USERS table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  department text,
  year text,
  skill_score int DEFAULT 0,
  created_at timestamp DEFAULT now()
);

-- Make sure no column has accidental NOT NULL constraints
ALTER TABLE public.users ALTER COLUMN full_name DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN department DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN year DROP NOT NULL;

-- Add skills and about columns (safe if already exists)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS about text;

-- 2. GIGS table
CREATE TABLE IF NOT EXISTS public.gigs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  created_by uuid REFERENCES public.users(id) ON DELETE CASCADE,
  status text DEFAULT 'open',
  created_at timestamp DEFAULT now()
);

-- 3. APPLICATIONS table
CREATE TABLE IF NOT EXISTS public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id uuid REFERENCES public.gigs(id) ON DELETE CASCADE,
  applicant_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  created_at timestamp DEFAULT now()
);

-- 4. COMPLETED_GIGS table
CREATE TABLE IF NOT EXISTS public.completed_gigs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id uuid REFERENCES public.gigs(id),
  completed_by uuid REFERENCES public.users(id),
  skill_points int,
  created_at timestamp DEFAULT now()
);

-- 5. NOTIFICATIONS table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Gigs policies
DROP POLICY IF EXISTS "Anyone can view gigs" ON public.gigs;
CREATE POLICY "Anyone can view gigs" ON public.gigs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth users can create gigs" ON public.gigs;
CREATE POLICY "Auth users can create gigs" ON public.gigs FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Owners can update gigs" ON public.gigs;
CREATE POLICY "Owners can update gigs" ON public.gigs FOR UPDATE USING (auth.uid() = created_by);

-- Applications policies
DROP POLICY IF EXISTS "Users can view own applications" ON public.applications;
CREATE POLICY "Users can view own applications" ON public.applications FOR SELECT USING (auth.uid() = applicant_id OR auth.uid() IN (SELECT created_by FROM public.gigs WHERE id = gig_id));

DROP POLICY IF EXISTS "Auth users can apply" ON public.applications;
CREATE POLICY "Auth users can apply" ON public.applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);

DROP POLICY IF EXISTS "Gig owners can update applications" ON public.applications;
CREATE POLICY "Gig owners can update applications" ON public.applications FOR UPDATE USING (auth.uid() IN (SELECT created_by FROM public.gigs WHERE id = gig_id));

-- Completed gigs policies
DROP POLICY IF EXISTS "Anyone can view completed gigs" ON public.completed_gigs;
CREATE POLICY "Anyone can view completed gigs" ON public.completed_gigs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service can insert completed gigs" ON public.completed_gigs;
CREATE POLICY "Service can insert completed gigs" ON public.completed_gigs FOR INSERT WITH CHECK (true);

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service can insert notifications" ON public.notifications;
CREATE POLICY "Service can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- Drop broken triggers (caused 500 on signup)
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_user_updated();

-- 6. GIG_SKILLS table (required skills per gig)
CREATE TABLE IF NOT EXISTS public.gig_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id uuid REFERENCES public.gigs(id) ON DELETE CASCADE,
  skill_name text NOT NULL
);

ALTER TABLE public.gig_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view gig skills" ON public.gig_skills;
CREATE POLICY "Anyone can view gig skills" ON public.gig_skills FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth users can insert gig skills" ON public.gig_skills;
CREATE POLICY "Auth users can insert gig skills" ON public.gig_skills FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Gig owner can delete gig skills" ON public.gig_skills;
CREATE POLICY "Gig owner can delete gig skills" ON public.gig_skills FOR DELETE USING (
  auth.uid() IN (SELECT created_by FROM public.gigs WHERE id = gig_id)
);

-- 7. SOLUTIONS table (accepted applicant submits answer)
CREATE TABLE IF NOT EXISTS public.solutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id uuid REFERENCES public.gigs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  answer text,
  submitted_at timestamp DEFAULT now()
);

ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users insert own solution" ON public.solutions;
CREATE POLICY "Users insert own solution" ON public.solutions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own solution" ON public.solutions;
CREATE POLICY "Users view own solution" ON public.solutions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Gig owner can view solutions" ON public.solutions;
CREATE POLICY "Gig owner can view solutions" ON public.solutions FOR SELECT USING (
  auth.uid() IN (SELECT created_by FROM public.gigs WHERE id = gig_id)
);

-- Add link column to notifications (for navigate-on-click)
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS link text;

-- Realtime for notifications (safe - ignores if already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN duplicate_object THEN
  NULL; -- already added, ignore
END $$;

-- Done!

