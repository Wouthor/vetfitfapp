-- ============================================================
-- MIGRATIE: duur opties aanpassen (45/60/75 → 30/45/60)
-- Voer dit uit in Supabase: Dashboard → SQL Editor → New query
-- ============================================================

ALTER TABLE generated_workouts DROP CONSTRAINT IF EXISTS generated_workouts_duration_check;
ALTER TABLE generated_workouts ADD CONSTRAINT generated_workouts_duration_check CHECK (duration IN (30, 45, 60));
