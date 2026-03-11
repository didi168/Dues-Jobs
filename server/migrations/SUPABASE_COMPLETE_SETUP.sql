-- ============================================================================
-- DUES JOBS - COMPLETE SUPABASE DATABASE SETUP
-- ============================================================================
-- Copy and paste this ENTIRE file into Supabase SQL Editor and click RUN
-- This will set up everything needed for the backend to work flawlessly
-- ============================================================================

-- ============================================================================
-- STEP 1: CREATE EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STEP 2: CREATE ALL TABLES
-- ============================================================================

-- TABLE: user_preferences
-- Purpose: Store user's job search criteria and notification preferences
-- Used by: Frontend (Settings page), Backend (JobMatcher service)
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

-- TABLE: jobs
-- Purpose: Master table containing all job listings from all sources
-- Used by: Backend (Fetchers insert), Frontend (Dashboard displays)
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

-- TABLE: user_jobs
-- Purpose: Bridge table linking users to jobs they've been matched with
-- Tracks status (new/applied/ignored) and user notes
-- Used by: Backend (JobMatcher inserts matches), Frontend (Dashboard/History)
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

-- TABLE: fetch_logs
-- Purpose: Track all job scraping runs for monitoring and debugging
-- Used by: Backend (run-daily-fetch.js logs each run)
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
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Jobs table indexes
CREATE INDEX IF NOT EXISTS idx_jobs_source ON public.jobs(source);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON public.jobs(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_canonical_hash ON public.jobs(canonical_hash);
CREATE INDEX IF NOT EXISTS idx_jobs_is_remote ON public.jobs(is_remote);

-- User jobs table indexes
CREATE INDEX IF NOT EXISTS idx_user_jobs_user_id ON public.user_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_jobs_job_id ON public.user_jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_user_jobs_status ON public.user_jobs(status);
CREATE INDEX IF NOT EXISTS idx_user_jobs_created_at ON public.user_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_jobs_user_status ON public.user_jobs(user_id, status);

-- Fetch logs indexes
CREATE INDEX IF NOT EXISTS idx_fetch_logs_status ON public.fetch_logs(status);
CREATE INDEX IF NOT EXISTS idx_fetch_logs_created_at ON public.fetch_logs(created_at DESC);

-- ============================================================================
-- STEP 4: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fetch_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: CREATE ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- ============================================================================
-- USER PREFERENCES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- JOBS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can view jobs" ON public.jobs;
CREATE POLICY "Authenticated users can view jobs" ON public.jobs
  FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- USER JOBS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own job matches" ON public.user_jobs;
CREATE POLICY "Users can view own job matches" ON public.user_jobs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own job matches" ON public.user_jobs;
CREATE POLICY "Users can update own job matches" ON public.user_jobs
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own job matches" ON public.user_jobs;
CREATE POLICY "Users can insert own job matches" ON public.user_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- FETCH LOGS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role can manage fetch logs" ON public.fetch_logs;
CREATE POLICY "Service role can manage fetch logs" ON public.fetch_logs
  FOR ALL TO service_role USING (true);

-- ============================================================================
-- STEP 6: CONFIGURE PERMISSIONS & GRANTS
-- ============================================================================

-- Note: service_role is a reserved role managed by Supabase
-- It already has full access and bypasses RLS by default
-- No need to grant permissions to service_role

-- Authenticated Users (Frontend) - Limited access via RLS
GRANT SELECT ON public.jobs TO authenticated;
GRANT SELECT, UPDATE, INSERT ON public.user_preferences TO authenticated;
GRANT SELECT, UPDATE, INSERT ON public.user_jobs TO authenticated;

-- ============================================================================
-- STEP 7: RELOAD POSTGREST SCHEMA CACHE
-- ============================================================================

NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Your Supabase database is now fully configured for Dues Jobs backend
--
-- TABLES CREATED:
-- ✓ user_preferences - User search criteria and notification settings
-- ✓ jobs - All job listings from scrapers
-- ✓ user_jobs - User-job matches with status tracking
-- ✓ fetch_logs - Scraper run history
--
-- INDEXES CREATED:
-- ✓ Performance indexes on all commonly queried fields
--
-- SECURITY CONFIGURED:
-- ✓ Row Level Security (RLS) enabled on all tables
-- ✓ Policies ensure users only access their own data
-- ✓ Service role has full access for backend operations
--
-- BACKEND CAPABILITIES:
-- ✓ Insert jobs from Remotive, RemoteOK, Adzuna, LinkedIn
-- ✓ Match jobs to users based on preferences
-- ✓ Track job application status (new/applied/ignored)
-- ✓ Log all fetch runs for monitoring
-- ✓ Send email and Telegram notifications
--
-- FRONTEND CAPABILITIES:
-- ✓ User authentication via Supabase Auth
-- ✓ View matched jobs on Dashboard
-- ✓ View job history (applied/ignored)
-- ✓ Manage search preferences and notifications
-- ✓ Update job status
--
-- ============================================================================
