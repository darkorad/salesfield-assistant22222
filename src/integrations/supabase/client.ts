
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://olkyepnvfwchgkmxyqku.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sa3llcG52ZndjaGdrbXh5cWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQyMTY1MjgsImV4cCI6MjA0OTc5MjUyOH0.LQYekqo4mR-50cjm4BORpP8GdskX_m0W5YKlqkRO7_8'

// Initialize the Supabase client with direct connection (no proxy)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    flowType: 'pkce',
    storageKey: 'zirmd-auth-token',
  },
  global: {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
    fetch: (url, options) => {
      // Log the request for debugging
      console.log(`Making request to: ${url}`);
      return fetch(url, {
        ...options,
        cache: 'no-store',
        mode: 'cors',
        credentials: 'omit',
      });
    }
  }
})

// Export a function to check connectivity
export const checkSupabaseConnectivity = async () => {
  try {
    console.log('Checking Supabase connectivity...')
    
    // Try a simpler method to check connectivity - just check session endpoint
    try {
      console.log('Trying direct API call to check connectivity...')
      const response = await fetch(`${supabaseUrl}/auth/v1/session`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey
        },
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        console.log('Direct API call succeeded');
        return { connected: true, isPermissionError: false };
      } else {
        console.error('Direct API call failed:', response.status, response.statusText);
        // Check if it's a permission error (403)
        if (response.status === 403) {
          return { 
            connected: true, 
            isPermissionError: true,
            error: 'Nemate odgovarajuće dozvole za pristup podacima.'
          };
        }
      }
    } catch (directApiError) {
      console.error('Direct API call error:', directApiError);
    }
    
    // Fallback - try supabase auth.getSession()
    try {
      console.log('Trying supabase.auth.getSession()...');
      const { data, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Supabase session check failed:', sessionError);
        return { 
          connected: false, 
          error: 'Greška pri povezivanju sa Supabase serverom: ' + sessionError.message,
          isAuthError: true,
          isPermissionError: false
        };
      }
      
      console.log('Session check succeeded');
      return { connected: true, session: data.session, isPermissionError: false };
    } catch (sessionError) {
      console.error('Session check error:', sessionError);
    }
    
    // If all checks failed, return connectivity error
    return { 
      connected: false, 
      error: 'Nije moguće povezati se sa serverom. Proverite internet konekciju i DNS podešavanja.',
      isPermissionError: false
    };
  } catch (err) {
    console.error('Supabase connectivity check exception:', err);
    return { 
      connected: false, 
      error: err instanceof Error ? err.message : 'Nepoznata greška pri povezivanju',
      isPermissionError: false
    };
  }
}
