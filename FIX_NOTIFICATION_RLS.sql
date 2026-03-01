-- ============================================================
-- FIX NOTIFICATION RLS POLICIES
-- Run this in Supabase SQL Editor
-- ============================================================
-- Problem: When applicant A submits a solution, they INSERT a
-- notification where user_id = gig_owner (not themselves).
-- A policy like `auth.uid() = user_id` on INSERT blocks this.
-- Fix: Allow anyone authenticated to INSERT notifications,
--       but only the owner can SELECT (read) their own.
-- ============================================================

-- 1. Drop old blanket policy if it exists
DROP POLICY IF EXISTS "Users manage own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users delete own notifications" ON public.notifications;

-- 2. Enable RLS (idempotent)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. INSERT — any authenticated user can create a notification for anyone
CREATE POLICY "Users insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- 4. SELECT — users can only read their own notifications
CREATE POLICY "Users read own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- 5. UPDATE — users can only update their own (e.g. mark as read)
CREATE POLICY "Users update own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- 6. DELETE — users can only delete their own
CREATE POLICY "Users delete own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================
-- Also ensure Realtime is enabled for the notifications table.
-- Go to Supabase Dashboard → Database → Replication
-- and make sure "notifications" table has Realtime toggled ON.
-- ============================================================
