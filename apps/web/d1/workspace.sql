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

CREATE TABLE IF NOT EXISTS workspace_presence (
  classroom_id TEXT NOT NULL,
  workspace_owner_id TEXT NOT NULL,
  viewer_id TEXT NOT NULL,
  viewer_role TEXT NOT NULL,
  last_seen TEXT NOT NULL,
  PRIMARY KEY (classroom_id, workspace_owner_id, viewer_id)
);
