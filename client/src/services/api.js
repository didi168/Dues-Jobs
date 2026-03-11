import { supabase } from './supabase';

/**
 * Helper to make authenticated requests to our Backend API.
 * Automatically injects the Supabase JWT.
 */
export async function apiRequest(endpoint, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Not authenticated');
  }

  const token = session.access_token;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
  const url = `${baseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.details || `API Error: ${response.status}`;
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error(`API Request failed: ${endpoint}`, error);
    throw error;
  }
}

/**
 * Helper to trigger the backend fetch/scraper job.
 * Uses CRON_SECRET instead of JWT authentication.
 */
export async function triggerFetch() {
  const cronSecret = import.meta.env.VITE_CRON_SECRET;
  
  if (!cronSecret) {
    throw new Error('CRON_SECRET not configured in environment');
  }

  const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
  const url = `${baseUrl}/api/v1/fetch/run`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cron-secret': cronSecret,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.details || `API Error: ${response.status}`;
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error('Fetch trigger failed:', error);
    throw error;
  }
}
