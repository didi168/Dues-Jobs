-- ============================================================================
-- DUES JOBS - COMPLETE SUPABASE DATABASE SETUP
-- ============================================================================
-- This SQL script sets up all tables, indexes, permissions, and policies
-- required for the Dues Jobs backend to function properly.
--
-- INSTRUCTIONS:
-- 1. Go to https://app.supabase.com
-- 2. Select your project (gpedyptdfogyurruwepf)
-- 3. Click "SQL Editor" in the left sidebar
-- 4. Click "New Query"
-- 5. Copy and paste ALL the code below
-- 6. Click "Run"
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- USER PREFERENCES TABLE
-- Stores user's job search criteria and notification preferences
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

-- JOBS TABLE
-- Master table containing all job listings from all sources
-- Fields are normalized by JobNormalizer service
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  is_remote BOOLEAN DEFAULT FALSE,
  job_type TEXT,
  source TEXT NOT NULL,
  apply_url TEXT NOT NULL,
  posted_at TIMESTAMPTZ,
  description TEXT,
  salary TEXT,
  canonical_hash TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER JOBS TABLE
-- Bridge table linking users to jobs they've been matched with
-- Tracks status (new/applied/ignored) and user notes
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

-- FETCH LOGS TABLE
-- Tracks all job scraping runs for monitoring and debugging
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

-- ============================================================================
-- 3. INDEXES
-- ============================================================================
-- Improve query performance for common operations

CREATE INDEX IF NOT EXISTS idx_jobs_source ON public.jobs(source);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON public.jobs(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_canonical_hash ON public.jobs(canonical_hash);
CREATE INDEX IF NOT EXISTS idx_user_jobs_user_id ON public.user_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_jobs_job_id ON public.user_jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_user_jobs_status ON public.user_jobs(status);
CREATE INDEX IF NOT EXISTS idx_user_jobs_created_at ON public.user_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fetch_logs_status ON public.fetch_logs(status);
CREATE INDEX IF NOT EXISTS idx_fetch_logs_created_at ON public.fetch_logs(created_at DESC);

-- ============================================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- RLS ensures users can only access their own data

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fetch_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- USER PREFERENCES POLICIES
-- Users can only view/update their own preferences

DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- JOBS POLICIES
-- All authenticated users can view all jobs (read-only)
-- Backend service role can insert/update (bypasses RLS)

DROP POLICY IF EXISTS "Authenticated users can view jobs" ON public.jobs;
CREATE POLICY "Authenticated users can view jobs" ON public.jobs
  FOR SELECT TO authenticated USING (true);

-- USER JOBS POLICIES
-- Users can only view/update their own job matches

DROP POLICY IF EXISTS "Users can view own job matches" ON public.user_jobs;
CREATE POLICY "Users can view own job matches" ON public.user_jobs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own job matches" ON public.user_jobs;
CREATE POLICY "Users can update own job matches" ON public.user_jobs
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own job matches" ON public.user_jobs;
CREATE POLICY "Users can insert own job matches" ON public.user_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- FETCH LOGS POLICIES
-- Only service role can access (for backend monitoring)

DROP POLICY IF EXISTS "Service role can manage fetch logs" ON public.fetch_logs;
CREATE POLICY "Service role can manage fetch logs" ON public.fetch_logs
  FOR ALL TO service_role USING (true);

-- ============================================================================
-- 6. PERMISSIONS & GRANTS
-- ============================================================================
-- Configure access for different roles

-- Service Role (Backend Admin) - Full access, bypasses RLS
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
ALTER ROLE service_role BYPASSRLS;

-- Authenticated Users (Frontend) - Limited access via RLS
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.jobs TO authenticated;
GRANT SELECT, UPDATE, INSERT ON public.user_preferences TO authenticated;
GRANT SELECT, UPDATE, INSERT ON public.user_jobs TO authenticated;

-- ============================================================================
-- 7. RELOAD POSTGREST SCHEMA CACHE
-- ============================================================================
-- This notifies PostgREST to reload the schema

NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- Your database is now ready for the Dues Jobs backend!
--
-- WHAT WAS CREATED:
-- ✓ user_preferences - Stores user search criteria and notification settings
-- ✓ jobs - Master job listings table (populated by backend scrapers)
-- ✓ user_jobs - User-job matches (populated by JobMatcher service)
-- ✓ fetch_logs - Scraper run history and logs
-- ✓ Indexes for performance optimization
-- ✓ Row Level Security policies for data isolation
-- ✓ Proper permissions for backend and frontend
--
-- BACKEND OPERATIONS:
-- - Backend uses SERVICE_ROLE_KEY to bypass RLS and manage all data
-- - Inserts jobs from Remotive, RemoteOK, Adzuna, LinkedIn
-- - Matches jobs to users based on preferences
-- - Logs all fetch runs
--
-- FRONTEND OPERATIONS:
-- - Users authenticate via Supabase Auth
-- - Users can view their matched jobs
-- - Users can update job status (new/applied/ignored)
-- - Users can manage their preferences
-- ============================================================================
