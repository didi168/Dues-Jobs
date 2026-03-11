import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
    user,
    loading,
    signIn: async (email, password) => {
      try {
        console.log('[Auth] Attempting sign in with email:', email);
        const result = await supabase.auth.signInWithPassword({ email, password });
        if (result.error) {
          console.error('[Auth] Sign in error:', result.error);
        } else {
          console.log('[Auth] Sign in successful');
        }
        return result;
      } catch (err) {
        console.error('[Auth] Sign in exception:', err);
        throw err;
      }
    },
    signUp: (email, password) => supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: undefined, // Disable Supabase email verification
      },
    }),
    signOut: () => supabase.auth.signOut(),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
