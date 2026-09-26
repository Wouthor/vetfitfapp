-- Soort oefening per bibliotheektraining (berekend door scripts/import-library.ts)
ALTER TABLE library_workouts
  ADD COLUMN IF NOT EXISTS categories TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS library_workouts_categories_idx ON library_workouts USING GIN (categories);
