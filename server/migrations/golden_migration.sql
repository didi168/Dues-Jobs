-- DUES JOBS - GOLDEN MIGRATION (Full Schema Re-initialization)
-- Run this in the Supabase SQL Editor to fix all 500/Permission errors.

-- 0. Cleanup (Optional but recommended if you want a fresh start)
-- DROP TABLE IF EXISTS public.fetch_logs CASCADE;
-- DROP TABLE IF EXISTS public.user_jobs CASCADE;
-- DROP TABLE IF EXISTS public.jobs CASCADE;
-- DROP TABLE IF EXISTS public.user_preferences CASCADE;

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USER PREFERENCES
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

-- 3. JOBS
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  is_remote BOOLEAN DEFAULT FALSE,
  job_type TEXT,
  source TEXT NOT NULL,
  apply_url TEXT NOT NULL, -- Requirement: apply_url
  posted_at TIMESTAMPTZ,
  description TEXT,
  salary TEXT,
  canonical_hash TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. USER JOBS
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

-- 5. FETCH LOGS
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

-- 6. PERMISSIONS
GRANT USAGE ON SCHEMA public TO postgres, service_role, authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- 7. RLS POLICIES
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fetch_logs ENABLE ROW LEVEL SECURITY;

-- Preferences Policies
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Jobs Policies
DROP POLICY IF EXISTS "Authenticated users can view jobs" ON jobs;
CREATE POLICY "Authenticated users can view jobs" ON jobs FOR SELECT TO authenticated USING (true);

-- User Jobs Policies
DROP POLICY IF EXISTS "Users can view own job matches" ON user_jobs;
CREATE POLICY "Users can view own job matches" ON user_jobs FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own job matches" ON user_jobs;
CREATE POLICY "Users can update own job matches" ON user_jobs FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own job matches" ON user_jobs;
CREATE POLICY "Users can insert own job matches" ON user_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. SERVICE ROLE BYPASS
ALTER ROLE service_role BYPASSRLS;

-- 9. RELOAD SCHEMA
NOTIFY pgrst, 'reload schema';
