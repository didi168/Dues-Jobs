-- DUES JOBS - MASTER INITIALIZATION SQL
-- Purpose: Set up all tables, permissions, and policies for a fresh project.
-- Run this in your Supabase SQL Editor.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES

-- User Preferences (Keywords, Locations, Sources)
CREATE TABLE IF NOT EXISTS public.user_preferences (
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

-- Master Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  is_remote BOOLEAN DEFAULT FALSE,
  job_type TEXT,
  source TEXT NOT NULL,
  apply_url TEXT NOT NULL, -- Renamed from source_url per requirements
  posted_at TIMESTAMPTZ,
  description TEXT,
  salary TEXT,
  canonical_hash TEXT UNIQUE NOT NULL, -- Prevents duplicate ingestion
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-Job Matches (The bridge table for matching and marking)
CREATE TABLE IF NOT EXISTS public.user_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('new', 'applied', 'ignored')) DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- Tracking Scraper Runs
CREATE TABLE IF NOT EXISTS public.fetch_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status TEXT CHECK (status IN ('running', 'success', 'error')),
  jobs_fetched INTEGER DEFAULT 0,
  jobs_inserted INTEGER DEFAULT 0,
  sources TEXT[] DEFAULT '{}',
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 3. PERMISSIONS

-- Reset access
GRANT USAGE ON SCHEMA public TO postgres, service_role, authenticated, anon;

-- Service Role (The Backend Admin)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
ALTER ROLE service_role BYPASSRLS;

-- Authenticated Users (The Frontend)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON public.user_preferences TO authenticated;
GRANT ALL ON public.user_jobs TO authenticated;

-- 4. POLICIES (RLS)

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fetch_logs ENABLE ROW LEVEL SECURITY;

-- User Preferences: Users manage their own
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Jobs: Browse-only for users
DROP POLICY IF EXISTS "Authenticated users can view jobs" ON jobs;
CREATE POLICY "Authenticated users can view jobs" ON jobs FOR SELECT TO authenticated USING (true);

-- User Jobs: Users manage their own interactions
DROP POLICY IF EXISTS "Users can view own job matches" ON user_jobs;
CREATE POLICY "Users can view own job matches" ON user_jobs FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own job matches" ON user_jobs;
CREATE POLICY "Users can update own job matches" ON user_jobs FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own job matches" ON user_jobs;
CREATE POLICY "Users can insert own job matches" ON user_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. RELOAD API CACHE
NOTIFY pgrst, 'reload schema';
