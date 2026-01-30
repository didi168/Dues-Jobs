-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS are managed by auth.users (Supabase default)

-- 1. USER PREFERENCES
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  keywords TEXT[] DEFAULT '{}',
  locations TEXT[] DEFAULT '{}',
  remote_only BOOLEAN DEFAULT FALSE,
  sources TEXT[] DEFAULT '{"Adzuna", "Remotive", "RemoteOK"}',
  email_enabled BOOLEAN DEFAULT TRUE,
  telegram_enabled BOOLEAN DEFAULT FALSE,
  telegram_chat_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. JOBS
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  is_remote BOOLEAN DEFAULT FALSE,
  job_type TEXT, -- Added job_type
  source TEXT NOT NULL,
  apply_url TEXT NOT NULL, -- Renamed from source_url
  posted_at TIMESTAMPTZ,
  description TEXT,
  salary TEXT,
  canonical_hash TEXT UNIQUE NOT NULL, -- To prevent duplicates
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USER JOBS (Matches)
CREATE TABLE IF NOT EXISTS user_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('new', 'applied', 'ignored')) DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- 4. FETCH LOGS
CREATE TABLE IF NOT EXISTS fetch_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status TEXT CHECK (status IN ('running', 'success', 'error')),
  jobs_fetched INTEGER DEFAULT 0,
  jobs_inserted INTEGER DEFAULT 0,
  sources TEXT[] DEFAULT '{}',
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fetch_logs ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- User Preferences: Users can read/update their own
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Jobs: Read-only for authenticated users
CREATE POLICY "Authenticated users can view jobs" ON jobs
  FOR SELECT TO authenticated USING (true);

-- User Jobs: Users can read/update their own matches
CREATE POLICY "Users can view own job matches" ON user_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own job matches" ON user_jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- (Backend Service Role will bypass RLS for inserts/maintenance)
