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

/**
 * POST /api/v1/users/me/telegram
 * Link Telegram Chat ID
 */
router.post('/me/telegram', async (req, res) => {
  const { telegram_chat_id } = req.body;

  if (!telegram_chat_id) {
    return res.status(400).json({ error: 'Chat ID is required' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('user_preferences')
      .update({ 
        telegram_chat_id, 
        telegram_enabled: true,
        updated_at: new Date()
      })
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Link Telegram Error:', err);
    res.status(500).json({ error: 'Failed to link Telegram' });
  }
});

/**
 * DELETE /api/v1/users/me/telegram
 * Disconnect Telegram
 */
router.delete('/me/telegram', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_preferences')
      .update({ 
        telegram_chat_id: null, 
        telegram_enabled: false,
        updated_at: new Date()
      })
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Telegram disconnected', data });
  } catch (err) {
    console.error('Disconnect Telegram Error:', err);
    res.status(500).json({ error: 'Failed to disconnect Telegram' });
  }
});

module.exports = router;
