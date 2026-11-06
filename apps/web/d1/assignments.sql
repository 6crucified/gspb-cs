CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  classroom_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  due_on TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS assignments_classroom_idx ON assignments (classroom_id, due_on);

CREATE TABLE IF NOT EXISTS assignment_files (
  id TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL,
  classroom_id TEXT NOT NULL,
  name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  bytes BLOB NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS assignment_files_assignment_idx ON assignment_files (assignment_id);

CREATE TABLE IF NOT EXISTS assignment_statuses (
  assignment_id TEXT NOT NULL,
  clerk_user_id TEXT NOT NULL,
  status TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (assignment_id, clerk_user_id)
);
