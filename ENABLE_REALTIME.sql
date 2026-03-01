-- ============================================================
-- ENABLE REALTIME REPLICATION FOR ALL KEY TABLES
-- Run this in Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ============================================================
-- Without replication enabled, Supabase Realtime will NOT push
-- postgres_changes events to the frontend — so subscriptions are silent.
--
-- This script adds every important table to the supabase_realtime
-- publication (skipping any that are already members).
-- ============================================================

DO $$
DECLARE
  _tables TEXT[] := ARRAY[
    'users',
    'gigs',
    'gig_skills',
    'applications',
    'solutions',
    'notifications'
  ];
  _t TEXT;
BEGIN
  FOREACH _t IN ARRAY _tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND tablename = _t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', _t);
      RAISE NOTICE 'Added % to supabase_realtime publication', _t;
    ELSE
      RAISE NOTICE '% already in supabase_realtime — skipped', _t;
    END IF;
  END LOOP;
END
$$;

-- Verify which tables are now in the publication
SELECT tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- ============================================================
-- Done! All tables are now publishing realtime change events.
-- ============================================================
