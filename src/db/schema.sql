-- Watts for Dinner schema. Idempotent: safe to re-run with `pnpm db:migrate`.
-- Every table has user_id. Statements are split on semicolons, so don't use
-- semicolons inside a statement (no function bodies / DO blocks).

CREATE TABLE IF NOT EXISTS users (
  user_id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- One profile per user; matches the Profile type in CLAUDE.md.
CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY REFERENCES users (user_id) ON DELETE CASCADE,
  dietary_preferences text[] NOT NULL DEFAULT '{}',
  goal text NOT NULL CHECK (goal IN ('performance', 'lose_weight', 'build_muscle', 'maintain', 'other')),
  goal_note text,
  favourite_meals text[] NOT NULL DEFAULT '{}',
  last_night_dinner text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Meals Watts suggested.
CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  title text NOT NULL,
  recipe_source text NOT NULL, -- e.g. 'spoonacular', 'exa', 'watts'
  recipe_id text,              -- id/URL at the source, if any
  suggested_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS meals_user_suggested_at_idx ON meals (user_id, suggested_at DESC);

-- "Keeper" ratings, one per user per meal.
CREATE TABLE IF NOT EXISTS meal_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  meal_id uuid NOT NULL REFERENCES meals (id) ON DELETE CASCADE,
  keeper boolean NOT NULL,
  rated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, meal_id)
);

-- WHOOP OAuth tokens, one connection per user. Server-side only.
CREATE TABLE IF NOT EXISTS whoop_connections (
  user_id uuid PRIMARY KEY REFERENCES users (user_id) ON DELETE CASCADE,
  access_token text NOT NULL,
  refresh_token text,
  expires_at timestamptz NOT NULL,
  scope text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Recipe image URL (Spoonacular's terms allow storing id, title and image URL only).
ALTER TABLE meals ADD COLUMN IF NOT EXISTS image_url text
