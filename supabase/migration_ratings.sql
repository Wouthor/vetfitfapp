-- ============================================================
-- MIGRATIE: training ratings
-- Voer dit uit in Supabase: Dashboard → SQL Editor → New query
-- ============================================================

CREATE TABLE IF NOT EXISTS training_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID REFERENCES generated_workouts ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workout_id, user_id)
);

ALTER TABLE training_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read ratings"
  ON training_ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Athletes can manage own ratings"
  ON training_ratings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
