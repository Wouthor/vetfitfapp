-- ============================================================
-- MIGRATIE: namen + aanmeldingen
-- Voer dit uit in Supabase: Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Naam toevoegen aan profielen
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name TEXT;

-- 2. Bestaande RLS policy voor profiles vervangen
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Authenticated users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- 3. Training aanmeldingen tabel
CREATE TABLE IF NOT EXISTS training_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID REFERENCES generated_workouts ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  signed_up_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workout_id, user_id)
);

ALTER TABLE training_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read signups"
  ON training_signups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Athletes can manage own signups"
  ON training_signups FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Voeg handmatig namen toe aan bestaande profielen (pas de emails aan)
-- UPDATE profiles SET name = 'Naam Atleet' WHERE email = 'atleet@email.nl';
-- UPDATE profiles SET name = 'Naam Instructor' WHERE email = 'instructor@email.nl';
