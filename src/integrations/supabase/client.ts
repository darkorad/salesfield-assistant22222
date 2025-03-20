
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
      // Enhanced retry logic for network errors including Cloudflare issues
      const MAX_RETRIES = 5; // Increased max retries
      const INITIAL_RETRY_DELAY = 1500; // 1.5 seconds initial delay
      const BACKOFF_FACTOR = 2; // More aggressive exponential backoff
      const MAX_DELAY = 15000; // Maximum delay between retries (15 seconds)

      const customFetch = async (retriesLeft: number, delay: number): Promise<Response> => {
        try {
          // Add timestamp to URL to prevent caching by Cloudflare
          const urlWithCache = new URL(url.toString());
          urlWithCache.searchParams.append('_cf_bust', Date.now().toString());
          
          return await fetch(urlWithCache.toString(), {
            ...options,
            // Disable cache for fresh connection attempts
            cache: 'no-store',
            // Use default credentials mode
            credentials: 'same-origin',
            // Copy existing signal or create new one with longer timeout
            signal: options?.signal || AbortSignal.timeout(20000), // 20 second timeout
            // Add headers to bypass Cloudflare cache and provide additional info
            headers: {
              ...options?.headers,
              'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
              'Pragma': 'no-cache',
              'X-Requested-With': 'XMLHttpRequest',
              'CF-Challenge-Bypass': 'true' // Attempt to bypass some Cloudflare challenges
            }
          });
        } catch (error: any) {
          // Check for all possible network-related errors including Cloudflare specific ones
          const isNetworkError = 
            error.message?.includes('SSL') || 
            error.message?.includes('handshake') ||
            error.message?.includes('DNS') || 
            error.message?.includes('prohibited IP') ||
            error.message?.includes('failed to fetch') ||
            error.message?.includes('network') ||
            error.message?.includes('cloudflare') ||
            error.message?.includes('CloudFlare') ||
            error.message?.includes('timed out') ||
            error.message?.includes('connection') ||
            error.name === 'TypeError' ||
            error.name === 'AbortError' ||
            error.code === 1000 ||
            error.code === 1001 ||
            error.code === 1002 ||
            error.code === 'ECONNREFUSED' ||
            error.code === 'ECONNRESET';
          
          if (retriesLeft > 0 && isNetworkError) {
            console.warn(`Network/Cloudflare error: ${error.message || error.toString()}. Retrying... (${retriesLeft} attempts left)`);
            
            // Calculate next delay with exponential backoff, but cap it
            const nextDelay = Math.min(delay * BACKOFF_FACTOR, MAX_DELAY);
            
            return new Promise(resolve => {
              setTimeout(() => resolve(customFetch(retriesLeft - 1, nextDelay)), delay);
            });
          }
          
          // If we've run out of retries or it's not a network error, throw it
          console.error('Failed to connect to Supabase after multiple attempts:', error);
          throw error;
        }
      };

      return customFetch(MAX_RETRIES, INITIAL_RETRY_DELAY);
    }
  }
})
