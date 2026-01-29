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

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // specialized error handling or just throw
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }

  return response.json();
}
