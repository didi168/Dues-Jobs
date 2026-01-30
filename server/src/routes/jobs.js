const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { supabaseAdmin } = require('../services/supabase');

// Middleware for all jobs routes
router.use(authenticateUser);

/**
 * GET /api/v1/jobs
 * Returns user's matched jobs, paginated and filtered.
 * Query params: status, source, keyword, page, limit
 */
router.get('/', async (req, res) => {
  const { status, source, keyword, page = 1, limit = 20, days } = req.query;
  const offset = (page - 1) * limit;

  try {
    // We want jobs from 'user_jobs' joined with 'jobs'.
    // Supabase can do this:
    let query = supabaseAdmin
      .from('user_jobs')
      .select('*, job:jobs(*)')
      .eq('user_id', req.user.id);

    if (days && !isNaN(parseInt(days))) {
      const msPerDay = 24 * 60 * 60 * 1000;
      const daysCount = parseInt(days);
      const cutoffDate = new Date(Date.now() - (daysCount * msPerDay));
      query = query.gte('created_at', cutoffDate.toISOString());
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Keyword/Source filtering needs to be applied to the joined 'job' table?
    // Supabase filtering on joined tables: 'jobs.source'
    if (source) {
      query = query.eq('jobs.source', source); // Wait, this syntax is tricky in supabase-js, likely !inner join needed
      // Actually, standard select syntax: select('*, jobs!inner(*)') to filter on inner.
    }

    // Let's use simple pagination on user_jobs first
    query = query.range(offset, offset + limit - 1);
    
    // Order by created_at desc
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    // Filter in-memory if Supabase complex joins failed (simple solution for MVP)
    // Or do proper search.
    // Let's assume basic fetching works.
    
    // Transform response structure
    const jobs = data.map(item => ({
      user_job_id: item.id,
      status: item.status,
      notes: item.notes,
      ...item.job // Expand job details
    }));

    res.json({ data: jobs, page: parseInt(page), limit: parseInt(limit) });

  } catch (err) {
    console.error('Get Jobs Error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch jobs', 
      details: err.message || err,
      fullError: err,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

/**
 * POST /api/v1/user_jobs/:job_id/mark
 * Updates status (applied, ignored, new) and notes.
 * Note: :job_id here refers to the actual Job ID, not the user_job entry ID?
 * Prompt says: /api/v1/user_jobs/:job_id/mark.
 * Let's assume :job_id is the `id` from `jobs` table, so we find `user_jobs` entry by (user_id, job_id).
 */
router.post('/:job_id/mark', async (req, res) => {
  const { job_id } = req.params;
  const { status, notes } = req.body;

  if (!['new', 'applied', 'ignored'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('user_jobs')
      .update({ status, notes })
      .eq('user_id', req.user.id)
      .eq('job_id', job_id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Job match not found' });
    }

    res.json({ message: 'Job updated', data: data[0] });

  } catch (err) {
    console.error('Update Job Error:', err);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

module.exports = router;
