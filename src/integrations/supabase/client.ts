
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
      // Enhanced retry logic for network errors including DNS and SSL issues
      const MAX_RETRIES = 4;
      const RETRY_DELAY = 2000; // 2 seconds
      const BACKOFF_FACTOR = 1.5; // Each retry waits 1.5x longer

      const customFetch = async (retriesLeft: number, delay: number): Promise<Response> => {
        try {
          return await fetch(url, {
            ...options,
            // Disable cache for fresh connection attempts
            cache: 'no-store',
            // Prevent CORS issues with credentials
            credentials: 'same-origin',
            // Copy existing signal or create new one
            signal: options?.signal || new AbortController().signal,
            // Add headers to prevent caching
            headers: {
              ...options?.headers,
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          });
        } catch (error: any) {
          // Check for network-related errors that might be retryable
          const isNetworkError = 
            error.message?.includes('SSL') || 
            error.message?.includes('handshake') ||
            error.message?.includes('DNS') || 
            error.message?.includes('prohibited IP') ||
            error.message?.includes('failed to fetch') ||
            error.message?.includes('network') ||
            error.name === 'TypeError' ||
            error.code === 1000 ||
            error.code === 'ECONNREFUSED';
          
          if (retriesLeft > 0 && isNetworkError) {
            console.warn(`Network error: ${error.message || error.toString()}. Retrying... (${retriesLeft} attempts left)`);
            
            return new Promise(resolve => {
              // Use exponential backoff for retry delay
              setTimeout(() => resolve(customFetch(retriesLeft - 1, delay * BACKOFF_FACTOR)), delay);
            });
          }
          
          // If we've run out of retries or it's not a network error, throw it
          console.error('Error fetching from Supabase:', error);
          throw error;
        }
      };

      return customFetch(MAX_RETRIES, RETRY_DELAY);
    }
  }
})
