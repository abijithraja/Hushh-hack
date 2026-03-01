-- ============================================================
-- FIX NOTIFICATIONS TABLE
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================
-- Problems fixed:
--   1. FK references auth.users(id) but public.users has different IDs
--      → Change FK to reference public.users(id)
--   2. Missing "title" column (backend tries to insert it)
--   3. Missing "link" column (backend tries to insert it)
-- ============================================================

-- 1. Add missing columns (safe — does nothing if they already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'title'
  ) THEN
    ALTER TABLE public.notifications ADD COLUMN title text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'link'
  ) THEN
    ALTER TABLE public.notifications ADD COLUMN link text;
  END IF;
END
$$;

-- 2. Fix the foreign key: drop the auth.users FK and add a public.users FK
--    This is necessary because user IDs in public.users may differ from auth.users
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 3. Ensure RLS policies are correct (idempotent)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Backend service can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users manage own notifications" ON public.notifications;

-- INSERT — any authenticated user (or service role) can create notifications
CREATE POLICY "Users insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- SELECT — users can only read their own
CREATE POLICY "Users read own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

-- UPDATE — users can only update their own (mark as read)
CREATE POLICY "Users update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- DELETE — users can only delete their own
CREATE POLICY "Users delete own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- 4. Ensure realtime is enabled (skip if already a member)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END
$$;

-- ============================================================
-- Done! Notifications should now work correctly.
-- ============================================================
