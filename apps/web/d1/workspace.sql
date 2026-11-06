CREATE TABLE IF NOT EXISTS workspace_files (
  classroom_id TEXT NOT NULL,
  clerk_user_id TEXT NOT NULL,
  path TEXT NOT NULL,
  text TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (classroom_id, clerk_user_id, path)
);

CREATE TABLE IF NOT EXISTS workspace_runs (
  classroom_id TEXT NOT NULL,
  clerk_user_id TEXT NOT NULL,
  stdout TEXT NOT NULL,
  stderr TEXT NOT NULL,
  exit_code INTEGER NOT NULL,
  ran_at TEXT NOT NULL,
  PRIMARY KEY (classroom_id, clerk_user_id)
);
