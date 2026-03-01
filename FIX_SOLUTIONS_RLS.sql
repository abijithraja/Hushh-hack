-- ============================================================
-- FIX SOLUTIONS TABLE RLS
-- Run this in Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ============================================================
-- Ensures:
--   1. Authenticated users can INSERT their own solutions
--   2. Solution author can SELECT their own solutions
--   3. Gig owner can SELECT solutions for their gigs
--   4. Solution author can UPDATE their own solutions
--   5. Realtime is enabled for the solutions table
-- ============================================================

ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users insert own solutions" ON public.solutions;
DROP POLICY IF EXISTS "Users read own solutions" ON public.solutions;
DROP POLICY IF EXISTS "Gig owners read solutions" ON public.solutions;
DROP POLICY IF EXISTS "Users update own solutions" ON public.solutions;
DROP POLICY IF EXISTS "Service role full access" ON public.solutions;
DROP POLICY IF EXISTS "Authenticated users can insert solutions" ON public.solutions;
DROP POLICY IF EXISTS "Authenticated users can read solutions" ON public.solutions;
DROP POLICY IF EXISTS "Authenticated users can update own solutions" ON public.solutions;

-- INSERT — authenticated users can insert solutions (user_id must match their own)
CREATE POLICY "Authenticated users can insert solutions"
ON public.solutions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- SELECT — authenticated users can read solutions they authored OR solutions on gigs they own
CREATE POLICY "Authenticated users can read solutions"
ON public.solutions FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM public.gigs
    WHERE gigs.id = solutions.gig_id
    AND gigs.created_by = auth.uid()
  )
);

-- UPDATE — users can only update their own solutions
CREATE POLICY "Authenticated users can update own solutions"
ON public.solutions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Enable realtime (skip if already a member)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'solutions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.solutions;
  END IF;
END
$$;

-- ============================================================
-- Done! Solutions RLS is now properly configured.
-- ============================================================
