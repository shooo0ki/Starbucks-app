export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS drinks (
  id                INTEGER  PRIMARY KEY AUTOINCREMENT NOT NULL,
  name_ja           TEXT     NOT NULL,
  short_code        TEXT,
  category          TEXT     NOT NULL
                             CHECK(category IN ('hot','ice','frappuccino','seasonal','user_limited')),
  sub_category      TEXT,
  needs_sleeve      INTEGER  NOT NULL DEFAULT 0 CHECK(needs_sleeve IN (0,1)),
  special_equipment TEXT,
  recipe_type       TEXT     NOT NULL
                             CHECK(recipe_type IN ('builtin','user')),
  practice_enabled  INTEGER  NOT NULL DEFAULT 1 CHECK(practice_enabled IN (0,1)),
  memo              TEXT,
  created_at        TEXT     NOT NULL,
  updated_at        TEXT     NOT NULL
);

CREATE TABLE IF NOT EXISTS steps (
  id          INTEGER  PRIMARY KEY AUTOINCREMENT NOT NULL,
  drink_id    INTEGER  NOT NULL REFERENCES drinks(id) ON DELETE CASCADE,
  step_order  INTEGER  NOT NULL,
  is_required INTEGER  NOT NULL DEFAULT 1 CHECK(is_required IN (0,1)),
  description TEXT     NOT NULL,
  created_at  TEXT     NOT NULL,
  updated_at  TEXT     NOT NULL
);

CREATE TABLE IF NOT EXISTS ingredients (
  id         INTEGER  PRIMARY KEY AUTOINCREMENT NOT NULL,
  step_id    INTEGER  NOT NULL REFERENCES steps(id) ON DELETE CASCADE,
  name       TEXT     NOT NULL,
  qty_short  INTEGER,
  qty_tall   INTEGER,
  qty_grande INTEGER,
  qty_venti  INTEGER,
  unit       TEXT,
  created_at TEXT     NOT NULL
);

CREATE TABLE IF NOT EXISTS custom_options (
  id                   INTEGER  PRIMARY KEY AUTOINCREMENT NOT NULL,
  custom_type          TEXT     NOT NULL,
  option_name_ja       TEXT     NOT NULL,
  applicable_category  TEXT,
  display_order        INTEGER  NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS practice_sessions (
  id              INTEGER  PRIMARY KEY AUTOINCREMENT NOT NULL,
  started_at      TEXT     NOT NULL,
  finished_at     TEXT,
  difficulty      TEXT     NOT NULL
                           CHECK(difficulty IN ('beginner','intermediate','advanced')),
  category_filter TEXT     NOT NULL
                           CHECK(category_filter IN ('hot','ice','frappuccino','all')),
  correct_count   INTEGER  NOT NULL DEFAULT 0,
  total_count     INTEGER  NOT NULL DEFAULT 10,
  duration_sec    INTEGER
);

CREATE TABLE IF NOT EXISTS practice_results (
  id               INTEGER  PRIMARY KEY AUTOINCREMENT NOT NULL,
  session_id       INTEGER  NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  drink_id         INTEGER  NOT NULL REFERENCES drinks(id),
  size             TEXT     NOT NULL CHECK(size IN ('S','T','G','V')),
  custom_json      TEXT,
  is_correct       INTEGER  NOT NULL CHECK(is_correct IN (0,1)),
  user_answer_json TEXT,
  answered_at      TEXT     NOT NULL
);

CREATE TABLE IF NOT EXISTS wrong_answers (
  id              INTEGER  PRIMARY KEY AUTOINCREMENT NOT NULL,
  drink_id        INTEGER  NOT NULL UNIQUE REFERENCES drinks(id),
  wrong_count     INTEGER  NOT NULL DEFAULT 1,
  last_wrong_at   TEXT     NOT NULL,
  last_correct_at TEXT,
  resolved        INTEGER  NOT NULL DEFAULT 0 CHECK(resolved IN (0,1))
);

CREATE TABLE IF NOT EXISTS user_progress (
  id                INTEGER  PRIMARY KEY AUTOINCREMENT NOT NULL,
  drink_id          INTEGER  NOT NULL UNIQUE REFERENCES drinks(id),
  status            TEXT     NOT NULL DEFAULT 'not_started'
                             CHECK(status IN ('not_started','learning','mastered')),
  practice_count    INTEGER  NOT NULL DEFAULT 0,
  correct_rate      REAL     NOT NULL DEFAULT 0.0,
  first_viewed_at   TEXT,
  last_practiced_at TEXT
);

CREATE TABLE IF NOT EXISTS review_notes (
  id          INTEGER  PRIMARY KEY AUTOINCREMENT NOT NULL,
  shift_date  TEXT     NOT NULL UNIQUE,
  good_things TEXT,
  mistakes    TEXT,
  feedback    TEXT,
  next_review TEXT,
  mood        TEXT     CHECK(mood IN ('good','okay','bad')),
  created_at  TEXT     NOT NULL,
  updated_at  TEXT     NOT NULL
);

CREATE TABLE IF NOT EXISTS app_settings (
  id                 INTEGER  PRIMARY KEY DEFAULT 1,
  default_difficulty TEXT     NOT NULL DEFAULT 'beginner'
                              CHECK(default_difficulty IN ('beginner','intermediate','advanced')),
  timer_enabled      INTEGER  NOT NULL DEFAULT 0 CHECK(timer_enabled IN (0,1)),
  qty_quiz_enabled   INTEGER  NOT NULL DEFAULT 0 CHECK(qty_quiz_enabled IN (0,1)),
  haptics_enabled    INTEGER  NOT NULL DEFAULT 1 CHECK(haptics_enabled IN (0,1)),
  updated_at         TEXT     NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_drinks_category         ON drinks(category);
CREATE INDEX IF NOT EXISTS idx_drinks_recipe_type      ON drinks(recipe_type);
CREATE INDEX IF NOT EXISTS idx_drinks_practice_enabled ON drinks(practice_enabled);
CREATE INDEX IF NOT EXISTS idx_steps_drink_id          ON steps(drink_id);
CREATE INDEX IF NOT EXISTS idx_steps_drink_order       ON steps(drink_id, step_order);
CREATE INDEX IF NOT EXISTS idx_ingredients_step_id     ON ingredients(step_id);
CREATE INDEX IF NOT EXISTS idx_practice_results_session_id ON practice_results(session_id);
CREATE INDEX IF NOT EXISTS idx_practice_results_drink_id   ON practice_results(drink_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_started_at ON practice_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_wrong_answers_resolved  ON wrong_answers(resolved);
CREATE INDEX IF NOT EXISTS idx_user_progress_status    ON user_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_progress_drink_id  ON user_progress(drink_id);
CREATE INDEX IF NOT EXISTS idx_review_notes_shift_date ON review_notes(shift_date);
`;
