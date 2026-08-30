-- Run this in Supabase → SQL Editor

CREATE TABLE members (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name     TEXT        NOT NULL,
  last_name      TEXT        NOT NULL,
  email          TEXT        UNIQUE NOT NULL,
  college_year   TEXT        NOT NULL,
  stripe_session_id TEXT,
  paid           BOOLEAN     DEFAULT FALSE,
  paid_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security: allow anyone to insert their own record, nobody can read/update via the public key
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can register"
  ON members FOR INSERT
  WITH CHECK (true);
