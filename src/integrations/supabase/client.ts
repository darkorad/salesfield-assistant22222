
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://olkyepnvfwchgkmxyqku.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sa3llcG52ZndjaGdrbXh5cWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQyMTY1MjgsImV4cCI6MjA0OTc5MjUyOH0.LQYekqo4mR-50cjm4BORpP8GdskX_m0W5YKlqkRO7_8'

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
    fetch: (url, options) => {
      // Retry logic for SSL handshake failures
      const MAX_RETRIES = 3;
      const RETRY_DELAY = 1000; // 1 second

      const customFetch = async (retriesLeft: number): Promise<Response> => {
        try {
          return await fetch(url, {
            ...options,
            // Setting cache to 'no-store' can help with SSL issues
            cache: 'no-store',
            // Set longer timeout
            signal: options?.signal || new AbortController().signal
          });
        } catch (error) {
          if (retriesLeft > 0 && (error.message?.includes('SSL') || error.message?.includes('handshake'))) {
            console.warn(`SSL/Handshake error. Retrying... (${retriesLeft} attempts left)`);
            return new Promise(resolve => {
              setTimeout(() => resolve(customFetch(retriesLeft - 1)), RETRY_DELAY);
            });
          }
          throw error;
        }
      };

      return customFetch(MAX_RETRIES);
    }
  }
})
