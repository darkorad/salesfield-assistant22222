
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
      const MAX_RETRIES = 7; // Increased max retries
      const INITIAL_RETRY_DELAY = 1000; // 1 second initial delay
      const BACKOFF_FACTOR = 1.5; // Exponential backoff
      const MAX_DELAY = 10000; // Maximum delay between retries (10 seconds)

      const customFetch = async (retriesLeft: number, delay: number): Promise<Response> => {
        try {
          // Add timestamp to URL to prevent caching by Cloudflare
          const urlWithCache = new URL(url.toString());
          urlWithCache.searchParams.append('_cf_bust', Date.now().toString());
          urlWithCache.searchParams.append('_cache_buster', Math.random().toString(36).substring(2));
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
          
          const response = await fetch(urlWithCache.toString(), {
            ...options,
            // Disable cache for fresh connection attempts
            cache: 'no-store',
            // Use default credentials mode
            credentials: 'same-origin',
            // Use controller signal for timeout
            signal: controller.signal,
            // Add headers to bypass Cloudflare cache and provide additional info
            headers: {
              ...options?.headers,
              'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
              'Pragma': 'no-cache',
              'X-Requested-With': 'XMLHttpRequest',
              'CF-Challenge-Bypass': 'true', // Attempt to bypass some Cloudflare challenges
              'User-Agent': navigator.userAgent || 'ZirMD-App',
              'X-Client-Info': 'ŽIR-MD Mobile App',
              'Accept': 'application/json, */*',
              'Connection': 'keep-alive'
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
            error.message?.includes('SSL') || 
            error.message?.includes('ssl') || 
            error.message?.includes('handshake') ||
            error.message?.includes('DNS') || 
            error.message?.includes('dns') || 
            error.message?.includes('prohibited IP') ||
            error.message?.includes('failed to fetch') ||
            error.message?.includes('Failed to fetch') ||
            error.message?.includes('network') ||
            error.message?.includes('Network') ||
            error.message?.includes('cloudflare') ||
            error.message?.includes('CloudFlare') ||
            error.message?.includes('Cloudflare') ||
            error.message?.includes('timed out') ||
            error.message?.includes('timeout') ||
            error.message?.includes('connection') ||
            error.message?.includes('Connection') ||
            error.message?.includes('abort') ||
            error.message?.includes('Abort');
          
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`${supabaseUrl}/ping`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.status === 200;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
}
