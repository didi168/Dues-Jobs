const { supabaseAdmin } = require('../services/supabase');

/**
 * Middleware to authenticate requests via Supabase JWT.
 * Expects Authorization: Bearer <token>
 */
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!authHeader) {
    if (req.accepts('html')) return res.redirect(frontendUrl);
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    if (req.accepts('html')) return res.redirect(frontendUrl);
    return res.status(401).json({ error: 'Invalid token format' });
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      if (req.accepts('html')) return res.redirect(frontendUrl);
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


/**
 * Middleware to protect Cron endpoints.
 * Expects CRON_SECRET header to match env var.
 */
const requireCronSecret = (req, res, next) => {
  const secret = req.headers['cron_secret'] || req.headers['x-cron-secret'];
  if (secret !== process.env.CRON_SECRET) {
    return res.status(403).json({ error: 'Forbidden: Invalid Cron Secret' });
  }
  next();
};

module.exports = {
  authenticateUser,
  requireCronSecret
};
