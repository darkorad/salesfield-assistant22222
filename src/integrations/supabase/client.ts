
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
      const MAX_RETRIES = 20; // Increased max retries even more
      const INITIAL_RETRY_DELAY = 400; // Even shorter initial delay for faster retry
      const BACKOFF_FACTOR = 1.2; // Slightly less aggressive exponential backoff
      const MAX_DELAY = 6000; // Shorter maximum delay between retries (6 seconds)

      const customFetch = async (retriesLeft: number, delay: number): Promise<Response> => {
        try {
          // Add even more aggressive timestamp to URL to prevent caching by Cloudflare
          const urlWithCache = new URL(url.toString());
          // Add numerous cache busters with different names 
          urlWithCache.searchParams.append('_cf_bypass', Date.now().toString());
          urlWithCache.searchParams.append('_t', Date.now().toString());
          urlWithCache.searchParams.append('_nc', Math.random().toString(36).substring(2, 10));
          urlWithCache.searchParams.append('_nocache', Math.random().toString(36).substring(2, 10));
          urlWithCache.searchParams.append('_ts', new Date().toISOString().replace(/[^0-9]/g, ''));
          
          // Add a browser fingerprint to make each request appear unique
          const browserFingerprint = `${navigator.userAgent}_${window.innerWidth}_${window.innerHeight}_${new Date().getTimezoneOffset()}`;
          urlWithCache.searchParams.append('_browser', btoa(browserFingerprint).substring(0, 12));
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 20000); // Longer timeout (20 second)
          
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
              'Accept': 'application/json, */*',
              'X-Client-Info': 'supabase-js/2.47.7',
              'X-Cache-Control': 'no-cache',
              'X-Cloudflare-Skip': 'true',
              'X-Cache-Bypass': Date.now().toString(),
              'X-Unique-ID': Math.random().toString(36).substring(2)
            }
          });
          
          clearTimeout(timeoutId);
          return response;
        } catch (error: any) {
          // Expanded check for all possible network-related errors including Cloudflare specific ones
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
            error.code === 'ETIMEDOUT' ||
            error.code === 'ENOTFOUND' ||
            error.message?.includes('Failed to fetch') ||
            error.message?.includes('network') ||
            error.message?.includes('cloudflare') ||
            error.message?.includes('timed out') ||
            error.message?.includes('timeout') ||
            error.message?.includes('connection') ||
            error.message?.includes('abort') ||
            error.message?.includes('CORS') ||
            error.message?.includes('cross-origin');
          
          console.warn(`Network request failed (${retriesLeft} attempts left): ${error.message || error.toString()}`);
          
          if (retriesLeft > 0 && isNetworkError) {
            console.log(`Retrying in ${delay}ms...`);
            
            // Add jitter to avoid thundering herd problem
            const jitter = Math.random() * 200;
            const nextDelay = Math.min(delay * BACKOFF_FACTOR + jitter, MAX_DELAY);
            
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

// Enhanced helper function to check if Supabase is reachable
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Attempt multiple different endpoints with different methods to increase success chance
    const attempts = [
      // Direct ping with cache busting
      fetch(`${supabaseUrl}/ping?_nocache=${Date.now()}&_r=${Math.random()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'X-Cache-Bypass': Date.now().toString(),
        },
        signal: AbortSignal.timeout(4000) // 4s timeout
      }),
      
      // Health check with different cache busting
      fetch(`${supabaseUrl}/rest/v1/?_cfbypass=${Date.now()}&_nc=${Math.random()}`, {
        method: 'HEAD',
        cache: 'no-store',
        headers: {
          'apikey': supabaseAnonKey,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Cache-Control': 'no-cache',
          'X-Client-Info': 'supabase-js/2.47.7',
        },
        signal: AbortSignal.timeout(4000)
      }),
      
      // Auth endpoint check
      fetch(`${supabaseUrl}/auth/v1/jwt/decode?_t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'apikey': supabaseAnonKey,
          'Cache-Control': 'no-cache',
        },
        signal: AbortSignal.timeout(4000)
      }),
      
      // Storage endpoint check
      fetch(`${supabaseUrl}/storage/v1/object/list?_r=${Math.random()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'apikey': supabaseAnonKey,
          'Cache-Control': 'no-cache',
        },
        signal: AbortSignal.timeout(4000)
      }),
    ];
    
    // Try all connection attempts and succeed if any succeed
    const results = await Promise.allSettled(attempts);
    
    // Check if any attempt was successful
    const successfulAttempt = results.find(
      result => result.status === 'fulfilled' && 
      (result.value.status === 200 || result.value.status === 204 || result.value.status === 400)
    );
    
    // Even a 400 response means we reached the server, so it's a "success" from a connectivity standpoint
    return !!successfulAttempt;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
}

// Enhanced function to check if browser is online
export const isBrowserOnline = (): boolean => {
  // Check if navigator.onLine is available and if it reports online
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return navigator.onLine;
  }
  return true; // Default to true if we can't check
}

// New function to try different connection strategies
export const tryAllConnectionMethods = async (): Promise<boolean> => {
  try {
    // Try direct fetch to the Supabase URL with different cache-busting techniques
    const directFetchPromises = [];
    
    // Try multiple cache-busting approaches
    for (let i = 0; i < 3; i++) {
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      directFetchPromises.push(
        fetch(`${supabaseUrl}/ping?_r=${randomSuffix}&_t=${Date.now()}`, {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'X-Cache-Bypass': `${Date.now()}_${i}`,
          },
          signal: AbortSignal.timeout(3000)
        }).then(res => ({ success: true, status: res.status }))
          .catch(err => ({ success: false, error: err }))
      );
    }
    
    // Check results of direct fetches
    const results = await Promise.all(directFetchPromises);
    const anySuccessful = results.some(r => r.success || (r.status >= 200 && r.status < 500));
    
    if (anySuccessful) {
      return true;
    }
    
    // If direct fetches failed, try the regular connection check
    return await checkSupabaseConnection();
  } catch (error) {
    console.error('All connection methods failed:', error);
    return false;
  }
}
