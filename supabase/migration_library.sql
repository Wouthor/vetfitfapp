-- Trainingsbibliotheek (BootCraft): geïmporteerde trainingen met kenmerken om op te filteren.
-- Alleen instructeurs kunnen de bibliotheek lezen; importeren gebeurt met de service-role key.

CREATE TABLE IF NOT EXISTS library_workouts (
  id TEXT PRIMARY KEY,                       -- slug van de bronpagina
  title TEXT NOT NULL,
  source_url TEXT,
  duration_label TEXT,
  duration_min INTEGER,                      -- kortste toegestane duur in minuten
  duration_max INTEGER,                      -- langste toegestane duur in minuten
  duration_ranges JSONB NOT NULL DEFAULT '[]',
  min_group_sizes INTEGER[] NOT NULL DEFAULT '{}',
  types TEXT[] NOT NULL DEFAULT '{}',        -- bijv. Warm Up, Conditioning, Finisher, Game
  features TEXT[] NOT NULL DEFAULT '{}',     -- bijv. Circuit, Partner, Intervals
  equipment TEXT[] NOT NULL DEFAULT '{}',    -- materiaal zoals BootCraft het noemt
  tags TEXT[] NOT NULL DEFAULT '{}',
  designer TEXT,
  markdown TEXT NOT NULL,                    -- volledige training (Engels)
  links JSONB NOT NULL DEFAULT '[]',
  has_burpees BOOLEAN NOT NULL DEFAULT false,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS library_workouts_duration_idx ON library_workouts (duration_min, duration_max);
CREATE INDEX IF NOT EXISTS library_workouts_types_idx ON library_workouts USING GIN (types);

ALTER TABLE library_workouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Instructors can read library" ON library_workouts;
CREATE POLICY "Instructors can read library"
  ON library_workouts FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'instructor'));

-- Welke bibliotheektrainingen zijn gebruikt voor een gegenereerde training (voor bronvermelding)
ALTER TABLE generated_workouts
  ADD COLUMN IF NOT EXISTS source_library_ids TEXT[] NOT NULL DEFAULT '{}';
