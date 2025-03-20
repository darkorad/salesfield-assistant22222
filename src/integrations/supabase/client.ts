
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://olkyepnvfwchgkmxyqku.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sa3llcG52ZndjaGdrbXh5cWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQyMTY1MjgsImV4cCI6MjA0OTc5MjUyOH0.LQYekqo4mR-50cjm4BORpP8GdskX_m0W5YKlqkRO7_8'

// Initialize the Supabase client with retry logic and better error handling
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
      'apikey': supabaseAnonKey, // Explicitly set the API key in headers
    },
    fetch: (url, options: RequestInit = {}) => {
      const timeout = 30000 // 30 seconds timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      // Create a new headers object correctly by merging with existing headers
      const existingHeaders = options.headers || {};
      const headers = new Headers(existingHeaders as HeadersInit);
      
      // Add required headers
      headers.set('apikey', supabaseAnonKey);
      headers.set('Authorization', `Bearer ${supabaseAnonKey}`);
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      headers.set('Pragma', 'no-cache');

      return fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      })
      .then(response => {
        clearTimeout(timeoutId)
        return response
      })
      .catch(error => {
        clearTimeout(timeoutId)
        console.error('Supabase fetch error:', error)
        // For network errors, provide more helpful information
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
          console.error('Network error connecting to Supabase. This might be due to DNS configuration issues.')
          // Create a custom response to avoid breaking the app
          return new Response(JSON.stringify({
            error: {
              message: 'Network error connecting to Supabase. Please check your internet connection and DNS configuration.'
            }
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          })
        }
        throw error
      })
    }
  }
})

// Export a function to check connectivity
export const checkSupabaseConnectivity = async () => {
  try {
    console.log('Checking Supabase connectivity...')
    // Make a simple query that shouldn't require authentication
    const { data, error } = await supabase.from('customers').select('count').limit(1)
    
    if (error) {
      console.error('Supabase connectivity check failed:', error)
      return { connected: false, error: error.message }
    }
    
    console.log('Supabase connectivity check succeeded')
    return { connected: true }
  } catch (err) {
    console.error('Supabase connectivity check exception:', err)
    return { 
      connected: false, 
      error: err instanceof Error ? err.message : 'Unknown connection error'
    }
  }
}
