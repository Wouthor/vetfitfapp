-- ============================================================
-- MIGRATIE: commentaar toevoegen aan ratings
-- Voer dit uit in Supabase: Dashboard → SQL Editor → New query
-- ============================================================

ALTER TABLE training_ratings ADD COLUMN IF NOT EXISTS comment TEXT;
