const express = require('express');
const router = express.Router();
const { requireCronSecret } = require('../middleware/auth');
const runDailyFetch = require('../../scripts/run-daily-fetch');

// POST /api/v1/fetch/run
// Protected by CRON_SECRET
router.post('/run', requireCronSecret, async (req, res) => {
  console.log('[API] Triggering manual fetch run...');
  
  // Run asynchronously if desired, or await.
  // Ideally, cron jobs might take long, so we trigger and return accepted.
  // But for simple cases, awaiting is fine for feedback.
  try {
    // Note: runDailyFetch is async.
    // If we want to return immediately:
    runDailyFetch().catch(err => console.error('Manual run failed:', err));
    
    res.status(202).json({ message: 'Fetch run triggered successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to trigger run' });
  }
});

module.exports = router;
