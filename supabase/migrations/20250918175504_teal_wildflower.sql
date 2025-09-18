/*
  # DKP Event Tracking Schema

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `name` (text) - Event name
      - `description` (text) - Event description
      - `date` (timestamptz) - Event date and time
      - `dkp_reward` (integer) - DKP points awarded for attendance
      - `created_at` (timestamptz)
    
    - `players`
      - `id` (uuid, primary key)
      - `discord_id` (text, unique) - Discord user ID
      - `username` (text) - Discord username
      - `total_dkp` (integer) - Total DKP points accumulated
      - `created_at` (timestamptz)
    
    - `attendances`
      - `id` (uuid, primary key)
      - `event_id` (uuid) - Foreign key to events
      - `player_id` (uuid) - Foreign key to players
      - `dkp_awarded` (integer) - DKP points awarded for this attendance
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (since this is a guild management tool)
    - Add policies for public write access for Discord bot integration
*/

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  date timestamptz NOT NULL,
  dkp_reward integer DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id text UNIQUE NOT NULL,
  username text NOT NULL,
  total_dkp integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create attendances table
CREATE TABLE IF NOT EXISTS attendances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  dkp_awarded integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, player_id)
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (suitable for guild management)
-- Events policies
CREATE POLICY "Anyone can read events"
  ON events
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create events"
  ON events
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update events"
  ON events
  FOR UPDATE
  TO public
  USING (true);

-- Players policies
CREATE POLICY "Anyone can read players"
  ON players
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create players"
  ON players
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update players"
  ON players
  FOR UPDATE
  TO public
  USING (true);

-- Attendances policies
CREATE POLICY "Anyone can read attendances"
  ON attendances
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create attendances"
  ON attendances
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_players_discord_id ON players(discord_id);
CREATE INDEX IF NOT EXISTS idx_players_total_dkp ON players(total_dkp DESC);
CREATE INDEX IF NOT EXISTS idx_attendances_event_id ON attendances(event_id);
CREATE INDEX IF NOT EXISTS idx_attendances_player_id ON attendances(player_id);