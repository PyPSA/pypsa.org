CREATE TABLE responses (
  id TEXT PRIMARY KEY,          -- random UUID
  wave TEXT NOT NULL,           -- e.g. '2026-h2'
  version INTEGER NOT NULL,     -- definition version
  received_at TEXT NOT NULL,    -- ISO timestamp, server clock
  seconds INTEGER,              -- time taken, client-reported
  section_order TEXT,           -- JSON array, Part 3 order shown
  answers TEXT NOT NULL         -- JSON object keyed by question name
);
