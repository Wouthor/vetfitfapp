-- ============================================================
-- BOOTCAMP APP - SUPABASE SCHEMA
-- Voer dit uit in Supabase: Dashboard → SQL Editor → New query
-- ============================================================

-- Profiles tabel (koppelt aan Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  role TEXT NOT NULL CHECK (role IN ('instructor', 'athlete')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Source workouts (geparsed vanuit Google Drive)
CREATE TABLE IF NOT EXISTS source_workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  drive_file_id TEXT UNIQUE NOT NULL,
  file_name TEXT NOT NULL,
  raw_text TEXT,
  parsed_content JSONB,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gegenereerde trainingen (door AI)
CREATE TABLE IF NOT EXISTS generated_workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES auth.users ON DELETE SET NULL,
  duration INTEGER NOT NULL CHECK (duration IN (45, 60, 75)),
  intensity TEXT NOT NULL CHECK (intensity IN ('laag', 'middel', 'hoog')),
  knee_friendly BOOLEAN DEFAULT FALSE,
  content JSONB NOT NULL,
  title TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training aanmeldingen (atleten die meedoen)
CREATE TABLE IF NOT EXISTS training_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID REFERENCES generated_workouts ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  signed_up_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workout_id, user_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_signups ENABLE ROW LEVEL SECURITY;

-- Profiles: alle ingelogde gebruikers mogen profielen lezen (namen voor deelnemerslijst)
CREATE POLICY "Authenticated users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Source workouts: iedereen die ingelogd is mag lezen
CREATE POLICY "Authenticated users can read source workouts"
  ON source_workouts FOR SELECT
  TO authenticated
  USING (true);

-- Generated workouts: instructeurs zien alles, atleten zien gepubliceerde
CREATE POLICY "Instructors can do everything with generated workouts"
  ON generated_workouts FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'instructor')
  );

CREATE POLICY "Athletes can read published workouts"
  ON generated_workouts FOR SELECT
  USING (
    published = true
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'athlete')
  );

CREATE POLICY "Athletes can insert their own workouts"
  ON generated_workouts FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'athlete')
  );

-- Training signups RLS
CREATE POLICY "Authenticated users can read signups"
  ON training_signups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Athletes can manage own signups"
  ON training_signups FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- AUTO-CREATED PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'athlete');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_generated_workouts_updated_at
  BEFORE UPDATE ON generated_workouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
