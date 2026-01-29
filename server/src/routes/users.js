const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { supabaseAdmin } = require('../services/supabase');

router.use(authenticateUser);

/**
 * GET /api/v1/users/me/preferences
 */
router.get('/me/preferences', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_preferences')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is 'Row not found'
      throw error;
    }

    res.json(data || {}); // Return empty obj if no prefs found (or default)

  } catch (err) {
    console.error('Get Prefs Error:', err);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

/**
 * PUT /api/v1/users/me/preferences
 */
router.put('/me/preferences', async (req, res) => {
  const {
    keywords,
    locations,
    remote_only,
    sources,
    email_enabled,
    telegram_enabled,
    telegram_chat_id
  } = req.body;

  // Validation could go here...

  try {
    const { data, error } = await supabaseAdmin
      .from('user_preferences')
      .upsert({
        user_id: req.user.id,
        keywords,
        locations,
        remote_only,
        sources,
        email_enabled,
        telegram_enabled,
        telegram_chat_id,
        updated_at: new Date()
      })
      .select()
      .single();

    if (error) throw error;

    res.json(data);

  } catch (err) {
    console.error('Update Prefs Error:', err);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

module.exports = router;
