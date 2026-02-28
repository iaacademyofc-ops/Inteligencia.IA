
-- Supabase Migration: Initial Schema for TeamMaster Pro

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TEAMS TABLE
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_name TEXT NOT NULL,
  crest_url TEXT,
  gender TEXT CHECK (gender IN ('Masculino', 'Feminino')),
  modality TEXT CHECK (modality IN ('Futsal', 'Society', 'Campo')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PLAYERS TABLE
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  number INTEGER,
  position TEXT,
  photo_url TEXT,
  stats JSONB DEFAULT '{"goals": 0, "assists": 0, "matches": 0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STAFF TABLE
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MATCHES TABLE
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  opponent TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT,
  location TEXT,
  is_finished BOOLEAN DEFAULT FALSE,
  score JSONB DEFAULT '{"home": 0, "away": 0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL, -- Can be player_id or staff_id
  owner_type TEXT CHECK (owner_type IN ('Atleta', 'Comissão')),
  type TEXT NOT NULL,
  status TEXT CHECK (status IN ('Validado', 'Aguardando Validação', 'Recusado')),
  issue_date DATE,
  document_number TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (Allow all for demo purposes)
-- In a real app, these would be restricted by auth.uid()
CREATE POLICY "Public Read Access" ON teams FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON players FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON staff FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON matches FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON documents FOR SELECT USING (true);

CREATE POLICY "Public Insert Access" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Access" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Access" ON staff FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Access" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Access" ON documents FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Update Access" ON teams FOR UPDATE USING (true);
CREATE POLICY "Public Update Access" ON players FOR UPDATE USING (true);
CREATE POLICY "Public Update Access" ON staff FOR UPDATE USING (true);
CREATE POLICY "Public Update Access" ON matches FOR UPDATE USING (true);
CREATE POLICY "Public Update Access" ON documents FOR UPDATE USING (true);
