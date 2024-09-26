CREATE TABLE IF NOT EXISTS phone_records (
  phone TEXT PRIMARY KEY,
  status INTEGER,
  code TEXT,
  created_at REAL DEFAULT (unixepoch()),
  mod_at REAL
);