-- Run this in Supabase → SQL Editor

-- ─── Events ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS events (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  event_date      DATE NOT NULL,
  event_time      TEXT NOT NULL,
  location        TEXT NOT NULL,
  description     TEXT,
  image_url       TEXT,
  ticket_capacity INT,
  is_past         BOOLEAN DEFAULT FALSE,
  published       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Public only sees published events; admin ALL policy (anon key) allows reading drafts too
CREATE POLICY "Public can read events"  ON events FOR SELECT USING (published = true);
CREATE POLICY "Admin can write events"  ON events FOR ALL   USING (true) WITH CHECK (true);

-- Allow admin writes on releases and inventory (password-protected via UI)
CREATE POLICY "Admin can write releases"  ON event_releases  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin can insert inventory" ON event_inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update inventory" ON event_inventory FOR UPDATE USING (true) WITH CHECK (true);

-- Seed events from events.json
INSERT INTO events (id, name, event_date, event_time, location, description, ticket_capacity, is_past, published) VALUES
  ('garba-night-2026',  'Garba & Dandiya Night',   '2026-10-17', '7:00 PM – 11:00 PM',  'Warwick Students'' Union, The Copper Rooms',    'Our flagship autumn celebration — live dhol, a Garba circle for all skill levels, and festival food stalls. Dandiya sticks provided.', 150, false, true),
  ('diwali-ball-2026',  'Diwali Ball',             '2026-11-14', '7:30 PM – 12:30 AM',  'Woods-Scawen Room, Warwick Arts Centre',        'A formal celebration of light — three-course dinner, cultural performances and a headline DJ set to close the night.',                200, false, true),
  ('culture-quiz-2026', 'Asian Culture Pub Quiz',  '2026-09-30', '6:30 PM – 8:30 PM',   'The Dirty Duck, Students'' Union',              'A laid-back social with a pub quiz spanning South & East Asian food, film, music and history. Teams of 4–6.',                        60,  false, true),
  ('holi-2026',         'Holi Festival of Colours','2026-03-14', '2:00 PM – 5:00 PM',   'Central Campus Piazza',                         'Colour powder, music and dancing to welcome spring — one of our biggest turnouts yet.',                                            NULL, true,  true),
  ('lunar-new-year-2026','Lunar New Year Social',  '2026-02-06', '6:00 PM – 9:00 PM',   'Arthur Vick Common Room',                       'A cosy welcome to the Year of the Horse with food, games and performances.',                                                      NULL, true,  true)
ON CONFLICT (id) DO NOTHING;

-- ─── Members ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS members (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name        TEXT        NOT NULL,
  last_name         TEXT        NOT NULL,
  email             TEXT        UNIQUE NOT NULL,
  college_year      TEXT        NOT NULL,
  stripe_session_id TEXT,
  paid              BOOLEAN     DEFAULT FALSE,
  paid_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can register"
  ON members FOR INSERT
  WITH CHECK (true);

-- RPC used by the ticket modal to preview member pricing.
-- SECURITY DEFINER lets it read the members table without a public SELECT policy.
CREATE OR REPLACE FUNCTION is_member(check_email TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM members WHERE email = check_email AND paid = TRUE
  );
$$;

GRANT EXECUTE ON FUNCTION is_member(TEXT) TO anon;

-- ─── Tickets ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tickets (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id          TEXT        NOT NULL,
  first_name        TEXT        NOT NULL,
  last_name         TEXT        NOT NULL,
  email             TEXT        NOT NULL,
  ticket_code       UUID        DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  stripe_session_id TEXT        UNIQUE,
  paid              BOOLEAN     DEFAULT TRUE,
  paid_at           TIMESTAMPTZ DEFAULT NOW(),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
-- Only the service role key (used by the webhook) can insert or read tickets.
-- No public policies — prevents anyone from listing other people's tickets.

-- ─── Event Releases ──────────────────────────────────────────────────────────
-- Mirrors the releases arrays in events.json.
-- The edge function queries this to determine the active release price.
-- When you change releases in events.json, update this table to match.

CREATE TABLE IF NOT EXISTS event_releases (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id           TEXT NOT NULL,
  name               TEXT NOT NULL,
  start_date         DATE NOT NULL,
  end_date           DATE NOT NULL,
  price_pence        INT  NOT NULL,
  member_price_pence INT  NOT NULL,
  UNIQUE (event_id, name)
);

-- No public read needed — only the edge function (service role) reads this
ALTER TABLE event_releases ENABLE ROW LEVEL SECURITY;

-- Seed releases (keep in sync with events.json)
INSERT INTO event_releases (event_id, name, start_date, end_date, price_pence, member_price_pence) VALUES
  ('garba-night-2026',  'Early Bird', '2026-09-20', '2026-09-30',  600,  400),
  ('garba-night-2026',  'General',    '2026-10-01', '2026-10-17',  800,  600),
  ('diwali-ball-2026',  'Early Bird', '2026-09-20', '2026-10-15', 2800, 2400),
  ('diwali-ball-2026',  'General',    '2026-10-16', '2026-11-14', 3200, 2800),
  ('culture-quiz-2026', 'General',    '2026-09-20', '2026-09-30',    0,    0)
ON CONFLICT (event_id, name) DO NOTHING;

-- ─── Event Inventory ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS event_inventory (
  event_id   TEXT PRIMARY KEY,
  capacity   INT  NOT NULL,
  sold       INT  NOT NULL DEFAULT 0,
  CONSTRAINT sold_within_capacity CHECK (sold <= capacity)
);

ALTER TABLE event_inventory ENABLE ROW LEVEL SECURITY;

-- Public read so the events page can show remaining tickets
CREATE POLICY "Public can read inventory"
  ON event_inventory FOR SELECT
  USING (true);

-- Atomic increment called by the stripe-webhook after a successful ticket insert
CREATE OR REPLACE FUNCTION increment_ticket_sold(p_event_id TEXT)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE event_inventory SET sold = sold + 1 WHERE event_id = p_event_id;
$$;

-- ─── Seed inventory for each event (update capacities to match your events.json) ──

INSERT INTO event_inventory (event_id, capacity) VALUES
  ('garba-night-2026',  150),
  ('diwali-ball-2026',  200),
  ('culture-quiz-2026',  60)
ON CONFLICT (event_id) DO NOTHING;
