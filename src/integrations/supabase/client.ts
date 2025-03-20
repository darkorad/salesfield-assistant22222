
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
      const MAX_RETRIES = 12; // Increased max retries
      const INITIAL_RETRY_DELAY = 500; // Shorter initial delay for faster retry
      const BACKOFF_FACTOR = 1.3; // Exponential backoff
      const MAX_DELAY = 8000; // Maximum delay between retries (8 seconds)

      const customFetch = async (retriesLeft: number, delay: number): Promise<Response> => {
        try {
          // Add timestamp to URL to prevent caching by Cloudflare
          const urlWithCache = new URL(url.toString());
          // Add multiple cache busters with different names to have higher chance of bypassing cache
          urlWithCache.searchParams.append('_cf_bypass', Date.now().toString());
          urlWithCache.searchParams.append('_t', Date.now().toString());
          urlWithCache.searchParams.append('_nocache', Math.random().toString(36).substring(2));
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
          
          const response = await fetch(urlWithCache.toString(), {
            ...options,
            cache: 'no-store',
            credentials: 'same-origin',
            signal: controller.signal,
            headers: {
              ...options?.headers,
              'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
              'Pragma': 'no-cache',
              'X-Requested-With': 'XMLHttpRequest',
              'CF-Challenge-Bypass': 'true', 
              'Accept': 'application/json, */*'
            }
          });
          
          clearTimeout(timeoutId);
          return response;
        } catch (error: any) {
          // Check for all possible network-related errors including Cloudflare specific ones
          const isNetworkError = 
            error.name === 'TypeError' ||
            error.name === 'AbortError' ||
            error.name === 'NetworkError' ||
            error.name === 'DOMException' ||
            error.code === 1000 ||
            error.code === 1001 ||
            error.code === 1002 ||
            error.code === 'ECONNREFUSED' ||
            error.code === 'ECONNRESET' ||
            error.message?.includes('Failed to fetch') ||
            error.message?.includes('network') ||
            error.message?.includes('cloudflare') ||
            error.message?.includes('timed out') ||
            error.message?.includes('timeout') ||
            error.message?.includes('connection') ||
            error.message?.includes('abort');
          
          console.warn(`Network request failed (${retriesLeft} attempts left): ${error.message || error.toString()}`);
          
          if (retriesLeft > 0 && isNetworkError) {
            console.log(`Retrying in ${delay}ms...`);
            
            // Calculate next delay with exponential backoff, but cap it
            const nextDelay = Math.min(delay * BACKOFF_FACTOR, MAX_DELAY);
            
            return new Promise(resolve => {
              setTimeout(() => resolve(customFetch(retriesLeft - 1, nextDelay)), delay);
            });
          }
          
          // If we've run out of retries or it's not a network error, throw it
          console.error('Failed to connect after multiple attempts:', error);
          throw error;
        }
      };

      return customFetch(MAX_RETRIES, INITIAL_RETRY_DELAY);
    }
  }
})

// Helper function to check if Supabase is reachable
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Multiple connection attempt points to increase chances of success
    const attempts = [
      // Attempt 1: Direct ping with cache busting
      fetch(`${supabaseUrl}/ping?_nocache=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        signal: AbortSignal.timeout(5000) // 5s timeout
      }),
      
      // Attempt 2: Health check with different cache busting
      fetch(`${supabaseUrl}/rest/v1/?_cfbypass=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
        headers: {
          'apikey': supabaseAnonKey,
          'Cache-Control': 'no-cache',
        },
        signal: AbortSignal.timeout(5000)
      })
    ];
    
    // Try all connection attempts and succeed if any succeed
    const results = await Promise.allSettled(attempts);
    const successfulAttempt = results.find(
      result => result.status === 'fulfilled' && 
      (result.value.status === 200 || result.value.status === 204)
    );
    
    return !!successfulAttempt;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
}

// Simple function to test if browser is online
export const isBrowserOnline = (): boolean => {
  return navigator.onLine;
}
